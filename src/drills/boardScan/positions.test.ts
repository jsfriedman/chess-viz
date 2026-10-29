import { describe, expect, it } from 'vitest'
import { loadPosition } from '@/chess/position'
import { difficulties } from '../difficulty'
import { seededRandom } from '../random'
import pack from './positions.json'
import { choosePositions, parsePositionPack, type ScanPosition } from './positions'

const positions = parsePositionPack(pack)

describe('position pack', () => {
  it('is fully valid', () => {
    expect(positions).toHaveLength(pack.positions.length)
  })

  it('has legal positions with side to move not in check', () => {
    for (const position of positions) expect(loadPosition(position.fen).inCheck()).toBe(false)
  })

  it.each(difficulties)('has enough positions for tier %i', (difficulty) => {
    expect(positions.filter((position) => position.difficulty === difficulty).length).toBeGreaterThanOrEqual(100)
  })
})

describe('choosePositions', () => {
  const position = (fen: string, checks: number): ScanPosition => ({
    fen,
    origin: fen,
    difficulty: 1,
    checks,
    captures: 0,
    hanging: 0,
    tags: [],
  })
  const pool = [
    ...Array.from({ length: 20 }, (_, index) => position(`with-${index}`, 1)),
    ...Array.from({ length: 20 }, (_, index) => position(`empty-${index}`, 0)),
  ]

  it('keeps empty positions to about one in ten', () => {
    const chosen = choosePositions(pool, 1, ['checks'], 10, seededRandom(3))
    expect(chosen).toHaveLength(10)
    expect(chosen.filter((entry) => entry.checks === 0)).toHaveLength(1)
    expect(new Set(chosen.map((entry) => entry.fen)).size).toBe(10)
  })

  it('judges emptiness by the chosen steps and fills with empty positions when short', () => {
    const chosen = choosePositions(pool, 1, ['captures'], 10, seededRandom(3))
    expect(chosen).toHaveLength(10)
  })

  it('stays inside the requested tier', () => {
    expect(choosePositions(pool, 2, ['checks'], 10, seededRandom(3))).toEqual([])
  })
})

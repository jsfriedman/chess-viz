import { describe, expect, it } from 'vitest'
import { parsePlacement } from '@/chess/board'
import { pathDistances, reachableSquares } from '@/chess/reach'
import { seededRandom } from '../random'
import { difficulties } from '../difficulty'
import { generatePathItem, generateReachItem, generateSession, pieceTypes } from './items'
import { blockedSquares, gradePath, pathPiece } from './path'

const seeds = Array.from({ length: 25 }, (_, index) => index + 1)
const pathPieces = ['K', 'Q', 'R', 'B', 'N'] as const

describe('generateReachItem', () => {
  it.each(difficulties)('always leaves something to find at level %i', (difficulty) => {
    for (const type of pieceTypes) {
      for (const seed of seeds) {
        const item = generateReachItem(type, difficulty, seededRandom(seed))
        const placement = parsePlacement(item.fen)
        expect(placement[item.square]?.[1]).toBe(type)
        expect(reachableSquares(placement, item.square).length).toBeGreaterThan(0)
      }
    }
  })

  it('keeps pawns off the back ranks', () => {
    for (const seed of seeds) {
      const placement = parsePlacement(generateReachItem('P', 5, seededRandom(seed)).fen)
      const backRankPawns = Object.entries(placement).filter(([square, piece]) => piece[1] === 'P' && /[18]/.test(square[1]!))
      expect(backRankPawns).toEqual([])
    }
  })

  it('never puts enemies next to a king', () => {
    for (const seed of seeds) {
      const item = generateReachItem('K', 5, seededRandom(seed))
      const placement = parsePlacement(item.fen)
      const king = placement[item.square]!
      expect(Object.values(placement).every((piece) => piece[0] === king[0])).toBe(true)
    }
  })
})

describe('generatePathItem', () => {
  it.each(difficulties)('needs at least two moves at level %i', (difficulty) => {
    for (const type of pathPieces) {
      for (const seed of seeds) {
        const item = generatePathItem(type, difficulty, seededRandom(seed))
        const distance = pathDistances(pathPiece(item), item.start, blockedSquares(item)).get(item.target)
        expect(distance).toBeGreaterThanOrEqual(2)
      }
    }
  })
})

describe('generateSession', () => {
  it('alternates the selected modes', () => {
    const modes = generateSession(['reach', 'path'], ['N'], 1, 4, seededRandom(7)).map((item) => item.mode)
    expect(modes).toEqual(['reach', 'path', 'reach', 'path'])
  })

  it('falls back to reach when only pawns are selected', () => {
    const modes = generateSession(['path'], ['P'], 1, 3, seededRandom(7)).map((item) => item.mode)
    expect(modes).toEqual(['reach', 'reach', 'reach'])
  })
})

describe('gradePath', () => {
  const knight = { mode: 'path', fen: '8/8/8/8/8/8/1P6/N7 w - - 0 1', start: 'a1', target: 'e3' } as const

  it('accepts a shortest path', () => {
    expect(gradePath(knight, ['c2', 'e3']).verdict).toBe('shortest')
  })

  it('flags a longer path', () => {
    expect(gradePath(knight, ['b3', 'd4', 'f5', 'e3']).verdict).toBe('longer')
  })

  it('flags a hop the piece cannot make', () => {
    expect(gradePath(knight, ['c2', 'c4'])).toMatchObject({ verdict: 'illegal-hop', problemIndex: 1 })
  })

  it('flags landing on an own piece', () => {
    const blockedKnight = { ...knight, fen: '8/8/8/8/8/8/2P5/N7 w - - 0 1' }
    expect(gradePath(blockedKnight, ['c2', 'e3'])).toMatchObject({ verdict: 'blocked', problemIndex: 0 })
  })

  it('flags a slider passing through a blocker', () => {
    const rook = { mode: 'path', fen: '8/8/8/8/P7/8/8/R7 w - - 0 1', start: 'a1', target: 'a8' } as const
    expect(gradePath(rook, ['a8'])).toMatchObject({ verdict: 'illegal-hop', problemIndex: 0 })
    expect(gradePath(rook, ['b1', 'b8', 'a8']).verdict).toBe('shortest')
  })

  it('flags a path that stops short', () => {
    expect(gradePath(knight, ['c2']).verdict).toBe('unfinished')
  })
})

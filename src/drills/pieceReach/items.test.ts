import { describe, expect, it } from 'vitest'
import { parsePlacement } from '@/chess/board'
import { knightDistances, reachableSquares } from '@/chess/reach'
import { difficulties, generateKnightPathItem, generateReachItem, generateSession } from './items'
import { blockedSquares, gradeKnightPath } from './knightPath'

function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32
    return state / 2 ** 32
  }
}

const seeds = Array.from({ length: 40 }, (_, index) => index + 1)

describe('generateReachItem', () => {
  it.each(difficulties)('always leaves something to find at level %i', (difficulty) => {
    for (const seed of seeds) {
      const item = generateReachItem(difficulty, seededRandom(seed))
      const placement = parsePlacement(item.fen)
      expect(placement[item.square]).toBeDefined()
      expect(reachableSquares(placement, item.square).length).toBeGreaterThan(0)
    }
  })

  it('keeps pawns off the back ranks', () => {
    for (const seed of seeds) {
      const placement = parsePlacement(generateReachItem(5, seededRandom(seed)).fen)
      const backRankPawns = Object.entries(placement).filter(([square, piece]) => piece[1] === 'P' && /[18]/.test(square[1]!))
      expect(backRankPawns).toEqual([])
    }
  })
})

describe('generateKnightPathItem', () => {
  it('picks targets at the level distance', () => {
    for (const seed of seeds) {
      const item = generateKnightPathItem(5, seededRandom(seed))
      const distance = knightDistances(item.start, blockedSquares(item)).get(item.target)
      expect([4, 5, 6]).toContain(distance)
    }
  })
})

describe('generateSession', () => {
  it('alternates the selected modes', () => {
    const modes = generateSession(['reach', 'knight-path'], 1, 4, seededRandom(7)).map((item) => item.mode)
    expect(modes).toEqual(['reach', 'knight-path', 'reach', 'knight-path'])
  })
})

describe('gradeKnightPath', () => {
  const item = { mode: 'knight-path', fen: '8/8/8/8/8/8/1P6/N7 w - - 0 1', start: 'a1', target: 'e3' } as const

  it('accepts a shortest path', () => {
    expect(gradeKnightPath(item, ['c2', 'e3']).verdict).toBe('shortest')
  })

  it('flags a longer path', () => {
    expect(gradeKnightPath(item, ['b3', 'd4', 'f5', 'e3']).verdict).toBe('longer')
  })

  it('flags a hop that is not a knight move', () => {
    expect(gradeKnightPath(item, ['c2', 'c4'])).toMatchObject({ verdict: 'illegal-hop', problemIndex: 1 })
  })

  it('flags landing on an own piece', () => {
    const blockedItem = { ...item, fen: '8/8/8/8/8/8/2P5/N7 w - - 0 1' }
    expect(gradeKnightPath(blockedItem, ['c2', 'e3'])).toMatchObject({ verdict: 'blocked', problemIndex: 0 })
  })

  it('flags a path that stops short', () => {
    expect(gradeKnightPath(item, ['c2']).verdict).toBe('unfinished')
  })
})

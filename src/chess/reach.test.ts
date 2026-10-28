import { describe, expect, it } from 'vitest'
import { parsePlacement, placementToFen } from './board'
import { knightDistances, reachableSquares, shortestKnightPath } from './reach'

const sorted = (squares: readonly string[]) => [...squares].sort()

describe('reachableSquares', () => {
  it('covers every knight hop on an empty board', () => {
    expect(sorted(reachableSquares({ d4: 'wN' }, 'd4'))).toEqual(sorted(['b3', 'b5', 'c2', 'c6', 'e2', 'e6', 'f3', 'f5']))
  })

  it('stops sliders at own pieces and includes enemy pieces', () => {
    const placement = { a1: 'wR', a4: 'wP', d1: 'bN' } as const
    expect(sorted(reachableSquares(placement, 'a1'))).toEqual(sorted(['a2', 'a3', 'b1', 'c1', 'd1']))
  })

  it('gives a queen 27 squares from the centre of an empty board', () => {
    expect(reachableSquares({ d4: 'bQ' }, 'd4')).toHaveLength(27)
  })
})

describe('knight paths', () => {
  it('takes six moves corner to corner', () => {
    expect(knightDistances('a1', new Set()).get('h8')).toBe(6)
  })

  it('routes around blocked squares', () => {
    const open = knightDistances('a1', new Set()).get('b3')
    const blocked = knightDistances('a1', new Set(['b3'])).get('b3')
    expect(open).toBe(1)
    expect(blocked).toBeUndefined()
  })

  it('follows the preferred path while it stays shortest', () => {
    expect(shortestKnightPath('a1', 'e3', new Set(), ['c2'])).toEqual(['c2', 'e3'])
    expect(shortestKnightPath('a1', 'e3', new Set(), ['b3'])).toHaveLength(2)
  })
})

describe('placementToFen', () => {
  it('round-trips a placement', () => {
    const fen = 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w - - 0 1'
    expect(placementToFen(parsePlacement(fen))).toBe(fen)
  })
})

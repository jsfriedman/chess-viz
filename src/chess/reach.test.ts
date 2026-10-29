import { describe, expect, it } from 'vitest'
import { parsePlacement, placementToFen } from './board'
import { canMove, pathDistances, reachableSquares, reachEndpoints, shortestPath } from './reach'

const sorted = (squares: readonly string[]) => [...squares].sort()
const none = new Set<string>()

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

  it('pushes pawns one or two from the start rank and captures diagonally', () => {
    expect(sorted(reachableSquares({ e2: 'wP', d3: 'bN', f3: 'wB' }, 'e2'))).toEqual(sorted(['e3', 'e4', 'd3']))
    expect(sorted(reachableSquares({ e7: 'bP', e6: 'wP' }, 'e7'))).toEqual([])
    expect(sorted(reachableSquares({ c5: 'bP' }, 'c5'))).toEqual(['c4'])
  })
})

describe('reachEndpoints', () => {
  it('returns the end of each open line', () => {
    expect(sorted(reachEndpoints({ a1: 'wR', a4: 'wP' }, 'a1'))).toEqual(['a3', 'h1'])
  })
})

describe('paths', () => {
  it('takes a knight six moves corner to corner', () => {
    expect(pathDistances('wN', 'a1', none).get('h8')).toBe(6)
  })

  it('never lets a bishop change square colour', () => {
    expect(pathDistances('wB', 'c1', none).get('c2')).toBeUndefined()
    expect(pathDistances('wB', 'c1', none).get('c3')).toBe(2)
  })

  it('routes sliders around blockers', () => {
    expect(pathDistances('wR', 'a1', none).get('a8')).toBe(1)
    expect(pathDistances('wR', 'a1', new Set(['a4'])).get('a8')).toBe(3)
  })

  it('treats passing through a blocker as an illegal move', () => {
    expect(canMove('wR', 'a1', 'a8', new Set(['a4']))).toBe(false)
    expect(canMove('wR', 'a1', 'a3', new Set(['a4']))).toBe(true)
  })

  it('follows the preferred path while it stays shortest', () => {
    expect(shortestPath('wN', 'a1', 'e3', none, ['c2'])).toEqual(['c2', 'e3'])
    expect(shortestPath('wN', 'a1', 'e3', none, ['b3'])).toHaveLength(2)
  })
})

describe('placementToFen', () => {
  it('round-trips a placement', () => {
    const fen = 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w - - 0 1'
    expect(placementToFen(parsePlacement(fen))).toBe(fen)
  })
})

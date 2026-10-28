import { describe, expect, it } from 'vitest'
import { capturesOf, checkingMovesFrom, findCapturableSquares, findCheckingSquares } from './scan'

const scholarsThreat = 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4'

describe('board scan answers', () => {
  it('finds pieces that can give check', () => {
    expect(findCheckingSquares(scholarsThreat).sort()).toEqual(['c4', 'h5'])
  })

  it('finds capturable enemy pieces', () => {
    expect(findCapturableSquares(scholarsThreat).sort()).toEqual(['e5', 'f7', 'h7'])
  })

  it('reports en passant as capturing the passed pawn', () => {
    expect(findCapturableSquares('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1')).toEqual(['d5'])
  })
})

describe('move explanations', () => {
  it('lists every checking move of a piece', () => {
    expect(checkingMovesFrom(scholarsThreat, 'h5').map((move) => move.san).sort()).toEqual(['Qxe5+', 'Qxf7#'])
  })

  it('lists every capture of a piece', () => {
    expect(capturesOf(scholarsThreat, 'f7').map((move) => move.san).sort()).toEqual(['Bxf7+', 'Qxf7#'])
  })

  it('ignores captures by pinned pieces', () => {
    expect(capturesOf('4r1k1/8/8/8/3p4/4N3/8/4K3 w - - 0 1', 'd4')).toEqual([])
  })
})

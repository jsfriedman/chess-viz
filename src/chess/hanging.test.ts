import { describe, expect, it } from 'vitest'
import { analyzeHanging, findHangingSquares } from './hanging'

const scholarsThreat = 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4'

const lineOf = (fen: string, square: string) => analyzeHanging(fen, square)!.line.map((capture) => capture.notation)

describe('findHangingSquares', () => {
  it('finds hanging pieces of both colors', () => {
    expect(findHangingSquares(scholarsThreat).sort()).toEqual(['e4', 'f7', 'h5'])
  })
})

describe('analyzeHanging', () => {
  it('flags an undefended attacked piece', () => {
    expect(analyzeHanging(scholarsThreat, 'e4')).toMatchObject({ hanging: true, reason: 'undefended', net: 1 })
  })

  it('does not count a king that cannot safely recapture', () => {
    const analysis = analyzeHanging(scholarsThreat, 'f7')!
    expect(analysis).toMatchObject({ hanging: true, reason: 'wins-material', net: 1, kingCannotRecapture: true })
    expect(lineOf(scholarsThreat, 'f7')).toEqual(['Bxf7'])
  })

  it('shows why taking a defended pawn with the queen loses material', () => {
    expect(analyzeHanging(scholarsThreat, 'e5')).toMatchObject({ hanging: false, reason: 'loses-material', net: -8 })
    expect(lineOf(scholarsThreat, 'e5')).toEqual(['Qxe5', 'Nxe5'])
  })

  it('flags a defended piece attacked by something cheaper', () => {
    const fen = '4k3/8/2n5/8/3Q4/4P3/8/4K3 w - - 0 1'
    expect(analyzeHanging(fen, 'd4')).toMatchObject({ hanging: true, reason: 'wins-material', net: 6 })
    expect(lineOf(fen, 'd4')).toEqual(['Nxd4', 'exd4'])
  })

  it('counts x-ray attackers behind the first capturer', () => {
    const fen = '3r3k/8/8/3n4/8/8/3R4/3Q3K w - - 0 1'
    expect(analyzeHanging(fen, 'd5')).toMatchObject({ hanging: true, net: 3 })
    expect(lineOf(fen, 'd5')).toEqual(['Rxd5'])
  })

  it('does not flag a pawn whose capture costs a heavier piece', () => {
    const fen = '4k3/8/8/4p3/3p4/8/3R4/3QK3 w - - 0 1'
    expect(analyzeHanging(fen, 'd4')).toMatchObject({ hanging: false, reason: 'loses-material' })
  })

  it('treats an equal trade as not hanging', () => {
    const fen = '4k3/4n3/8/3n4/8/4N3/8/4K3 w - - 0 1'
    expect(analyzeHanging(fen, 'd5')).toMatchObject({ hanging: false, reason: 'even-trade', net: 0 })
  })

  it('never calls a king hanging', () => {
    expect(analyzeHanging('4k3/8/8/8/8/8/4R3/4K3 b - - 0 1', 'e8')).toMatchObject({ reason: 'not-attacked' })
  })
})

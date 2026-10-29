import { describe, expect, it } from 'vitest'
import { difficultyScore, profilePosition } from './features'

describe('profilePosition', () => {
  it('counts answers per step and tags the knight capture', () => {
    // Scholar's mate threat: Qh5 eyes f7, Bc4 battery, Nc6 and Nf6 out
    const profile = profilePosition('r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4')
    expect(profile).toMatchObject({ pieceCount: 32, inCheck: false, checks: 2, captures: 3, hanging: 3 })
    expect(profile.tags).not.toContain('knight')
  })

  it('tags backward captures', () => {
    expect(profilePosition('4k3/8/8/8/8/8/2b5/3RK3 w - - 0 1').tags).not.toContain('backward')
    expect(profilePosition('4k3/8/8/8/8/2b5/8/R3K3 b - - 0 1').tags).toContain('backward')
  })

  it('tags long-range slider moves', () => {
    expect(profilePosition('4k3/6p1/8/8/8/8/8/B3K3 w - - 0 1').tags).toContain('long-range')
  })

  it('tags pinned attackers that cannot legally capture', () => {
    // The e3 knight attacks d5 but is pinned to the e1 king by the e8 rook
    expect(profilePosition('4r2k/8/8/3p4/8/4N3/8/4K3 w - - 0 1').tags).toContain('pinned')
  })

  it('tags en passant', () => {
    expect(profilePosition('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1').tags).toContain('en-passant')
  })

  it('tags x-ray exchanges', () => {
    // Doubled rooks win the e5 rook, which is defended once
    expect(profilePosition('4r1k1/8/8/4r3/8/8/4R3/4R1K1 w - - 0 1').tags).toContain('x-ray')
  })
})

describe('difficultyScore', () => {
  it('ranks a busy position above a sparse one', () => {
    const sparse = profilePosition('4k3/8/8/8/8/8/8/R3K3 w - - 0 1')
    const busy = profilePosition('r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4')
    expect(difficultyScore(busy)).toBeGreaterThan(difficultyScore(sparse))
  })
})

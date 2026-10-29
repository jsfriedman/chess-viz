import type { Square } from '@/chess/board'

export type DrillId = 'coordinates' | 'piece-reach' | 'board-scan' | 'flash-memory'

export interface DrillSummary {
  id: DrillId
  title: string
  modes: readonly string[]
  previewFen: string
  previewSquares: readonly Square[]
  route?: string
}

export const drills: readonly DrillSummary[] = [
  {
    id: 'board-scan',
    title: 'Board scan',
    modes: ['Checks', 'Captures', 'Hanging'],
    previewFen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    previewSquares: ['h5', 'e4'],
    route: '/train/board-scan',
  },
  {
    id: 'piece-reach',
    title: 'Piece reach',
    modes: ['Reach', 'Path'],
    previewFen: '8/8/8/8/3Q4/8/8/8 w - - 0 1',
    previewSquares: ['d5', 'd6', 'd7', 'd8', 'c5', 'b6', 'a7', 'e5', 'f6', 'g7', 'h8', 'a4', 'b4', 'c4', 'e4', 'f4', 'g4', 'h4', 'd3', 'd2', 'd1', 'c3', 'b2', 'a1', 'e3', 'f2', 'g1'],
    route: '/train/piece-reach',
  },
  {
    id: 'coordinates',
    title: 'Coordinates',
    modes: ['Find', 'Name', 'Color'],
    previewFen: '8/8/8/8/8/8/8/8 w - - 0 1',
    previewSquares: ['e4'],
  },
  {
    id: 'flash-memory',
    title: 'Flash memory',
    modes: ['Questions'],
    previewFen: '6k1/5ppp/8/8/3n4/8/5PPP/3R2K1 w - - 0 1',
    previewSquares: [],
  },
]

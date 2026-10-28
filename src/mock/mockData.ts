import type { Square } from '@/chess/board'
import type { ScanStepId } from '@/chess/explain'

export type DrillId = 'coordinates' | 'piece-reach' | 'board-scan' | 'flash-memory'

export interface DrillSummary {
  id: DrillId
  title: string
  modes: readonly string[]
  previewFen: string
  previewSquares: readonly Square[]
  personalBest?: string
}

export const drills: readonly DrillSummary[] = [
  {
    id: 'coordinates',
    title: 'Coordinates',
    modes: ['Find', 'Name', 'Color'],
    previewFen: '8/8/8/8/8/8/8/8 w - - 0 1',
    previewSquares: ['e4'],
    personalBest: '10/10 · Level 3',
  },
  {
    id: 'piece-reach',
    title: 'Piece reach',
    modes: ['Reach', 'Knight path'],
    previewFen: '8/8/8/8/3N4/8/8/8 w - - 0 1',
    previewSquares: ['c6', 'e6', 'f5', 'f3', 'e2', 'c2', 'b3', 'b5'],
    personalBest: '9/10 · Level 2',
  },
  {
    id: 'board-scan',
    title: 'Board scan',
    modes: ['Checks', 'Captures', 'Hanging'],
    previewFen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    previewSquares: ['h5', 'e4'],
    personalBest: '8/10 · Level 1',
  },
  {
    id: 'flash-memory',
    title: 'Flash memory',
    modes: ['Questions'],
    previewFen: '6k1/5ppp/8/8/3n4/8/5PPP/3R2K1 w - - 0 1',
    previewSquares: [],
  },
]

export interface ScanStep {
  id: ScanStepId
  title: string
  prompt: string
}

export const boardScanItem = {
  fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
  itemNumber: 3,
  itemCount: 10,
  steps: [
    { id: 'checks', title: 'Checks', prompt: 'Which pieces can give check?' },
    { id: 'captures', title: 'Captures', prompt: 'Which pieces can be captured?' },
    { id: 'hanging', title: 'Hanging', prompt: 'Which pieces are hanging? Both colors.' },
  ] satisfies ScanStep[],
}

export interface SessionRecord {
  drill: string
  modes: string
  level: number
  score: string
  accuracy: number
  averageSeconds: number
  when: string
}

export const recentSessions: readonly SessionRecord[] = [
  { drill: 'Board scan', modes: 'Checks · Captures · Hanging', level: 1, score: '8/10', accuracy: 84, averageSeconds: 11.4, when: 'Today' },
  { drill: 'Coordinates', modes: 'Find', level: 3, score: '10/10', accuracy: 100, averageSeconds: 1.9, when: 'Today' },
  { drill: 'Piece reach', modes: 'Knight path', level: 2, score: '9/10', accuracy: 90, averageSeconds: 4.2, when: 'Yesterday' },
]

export const sessionResult = {
  drill: 'Board scan',
  level: 1,
  correctItems: 8,
  itemCount: 10,
  accuracy: 84,
  averageSeconds: 11.4,
  previousBest: 7,
  steps: [
    { title: 'Checks', accuracy: 95, found: 19, total: 20, wrong: 1 },
    { title: 'Captures', accuracy: 87, found: 26, total: 30, wrong: 1 },
    { title: 'Hanging', accuracy: 70, found: 14, total: 20, wrong: 2 },
  ],
  items: [true, true, false, true, true, true, true, false, true, true],
}

import type { Square } from '@/chess/board'
import type { ScanStepId } from '@/chess/explain'
import { findHangingSquares } from '@/chess/hanging'
import { findCapturableSquares, findCheckingSquares } from '@/chess/scan'

export interface ScanStep {
  id: ScanStepId
  title: string
  prompt: string
  findAnswer: (fen: string) => Square[]
}

export const scanSteps: readonly ScanStep[] = [
  { id: 'checks', title: 'Checks', prompt: 'Which pieces can give check?', findAnswer: findCheckingSquares },
  { id: 'captures', title: 'Captures', prompt: 'Which pieces can be captured?', findAnswer: findCapturableSquares },
  { id: 'hanging', title: 'Hanging', prompt: 'Which pieces are hanging? Both colors.', findAnswer: findHangingSquares },
]

// Stand-in until puzzle packs land: real opening positions, each with something to find
export const starterPositions: readonly string[] = [
  'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
  'rnb1kbnr/ppp1pppp/8/3q4/8/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 3',
  'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 1 5',
  'r1bqkb1r/pppp1ppp/2n2n2/4p1N1/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 5 4',
  'rnbqkb1r/ppp2ppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR b KQkq - 3 4',
]

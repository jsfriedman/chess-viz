import { colorName, type Color, type Square } from '@/chess/board'
import type { ScanStepId } from '@/chess/explain'
import { findHangingSquares } from '@/chess/hanging'
import { opponentOf } from '@/chess/position'
import { findCapturableSquares, findCheckingSquares } from '@/chess/scan'

export interface ScanStep {
  id: ScanStepId
  title: string
  prompt: (toMove: Color) => string
  findAnswer: (fen: string) => Square[]
}

export const scanSteps: readonly ScanStep[] = [
  {
    id: 'checks',
    title: 'Checks',
    prompt: (toMove) => `Which ${colorName(toMove)} pieces can give check?`,
    findAnswer: findCheckingSquares,
  },
  {
    id: 'captures',
    title: 'Captures',
    prompt: (toMove) => `Which ${colorName(opponentOf(toMove))} pieces can ${colorName(toMove)} capture?`,
    findAnswer: findCapturableSquares,
  },
  {
    id: 'hanging',
    title: 'Hanging',
    prompt: () => 'Which pieces are hanging? Both colors.',
    findAnswer: findHangingSquares,
  },
]


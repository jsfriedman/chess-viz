import { useBoardScanSession } from './boardScan/sessionStore'
import { usePieceReachSession } from './pieceReach/sessionStore'
import type { ItemResult } from './summary'

interface DrillSessionView {
  completedItems: readonly ItemResult[]
  start: () => void
}

export interface SessionDrill {
  title: string
  route: string
  itemLabel: string
  stepTitles: Readonly<Record<string, string>>
  useSession: () => DrillSessionView
}

export const sessionDrills: Readonly<Record<string, SessionDrill>> = {
  'board-scan': {
    title: 'Board scan',
    route: '/train/board-scan',
    itemLabel: 'Positions',
    stepTitles: { checks: 'Checks', captures: 'Captures', hanging: 'Hanging' },
    useSession: useBoardScanSession,
  },
  'piece-reach': {
    title: 'Piece reach',
    route: '/train/piece-reach/session',
    itemLabel: 'Items',
    stepTitles: { reach: 'Reach', 'knight-path': 'Knight path' },
    useSession: usePieceReachSession,
  },
}

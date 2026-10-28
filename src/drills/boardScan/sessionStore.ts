import { defineDrillSession } from '../sessionStore'
import { starterPositions } from './steps'

export const useBoardScanSession = defineDrillSession('boardScanSession', () =>
  starterPositions.map((fen) => ({ fen })),
)

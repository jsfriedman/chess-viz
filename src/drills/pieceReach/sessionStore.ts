import { defineDrillSession, itemsPerSession } from '../sessionStore'
import { generateSession } from './items'
import { usePieceReachSettings } from './settingsStore'

export const usePieceReachSession = defineDrillSession('pieceReachSession', () => {
  const { modes, difficulty } = usePieceReachSettings().settings
  return generateSession(modes, difficulty, itemsPerSession)
})

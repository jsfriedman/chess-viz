import type { ScanStepId } from '@/chess/explain'
import { defineDrillSession, itemsPerSession } from '../sessionStore'
import pack from './positions.json'
import { choosePositions, parsePositionPack } from './positions'
import { useBoardScanSettings } from './settingsStore'

export interface BoardScanItem {
  fen: string
  origin: string
  steps: readonly ScanStepId[]
}

const positions = parsePositionPack(pack)

export const useBoardScanSession = defineDrillSession('boardScanSession', (): BoardScanItem[] => {
  const { steps, difficulty } = useBoardScanSettings().settings
  return choosePositions(positions, difficulty, steps, itemsPerSession, Math.random).map(({ fen, origin }) => ({
    fen,
    origin,
    steps,
  }))
})

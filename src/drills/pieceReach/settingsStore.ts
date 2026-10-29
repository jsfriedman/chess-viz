import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { PieceType } from '@/chess/board'
import { readStored, writeStored } from '@/storage'
import { isDifficulty, type Difficulty } from '../difficulty'
import { toggled } from '../toggle'
import { pieceReachModes, pieceTypes, type PieceReachMode } from './items'

export interface PieceReachSettings {
  modes: readonly PieceReachMode[]
  pieces: readonly PieceType[]
  difficulty: Difficulty
}

const storageKey = 'piece-reach-settings'
const defaultSettings: PieceReachSettings = { modes: pieceReachModes, pieces: pieceTypes, difficulty: 1 }

const isNonEmptySubset = <T>(value: unknown, known: readonly T[]): value is T[] =>
  Array.isArray(value) && value.length > 0 && value.every((entry) => known.includes(entry))

function isSettings(value: unknown): value is PieceReachSettings {
  if (typeof value !== 'object' || value === null) return false
  const { modes, pieces, difficulty } = value as Record<string, unknown>
  return (
    isNonEmptySubset(modes, pieceReachModes) &&
    isNonEmptySubset(pieces, pieceTypes) &&
    isDifficulty(difficulty)
  )
}

export const usePieceReachSettings = defineStore('pieceReachSettings', () => {
  const settings = ref<PieceReachSettings>(readStored(storageKey, isSettings) ?? defaultSettings)

  watch(settings, (value) => writeStored(storageKey, value))

  function toggleMode(mode: PieceReachMode) {
    settings.value = { ...settings.value, modes: toggled(settings.value.modes, mode, pieceReachModes) }
  }

  function togglePiece(piece: PieceType) {
    settings.value = { ...settings.value, pieces: toggled(settings.value.pieces, piece, pieceTypes) }
  }

  function setDifficulty(difficulty: Difficulty) {
    settings.value = { ...settings.value, difficulty }
  }

  return { settings, toggleMode, togglePiece, setDifficulty }
})

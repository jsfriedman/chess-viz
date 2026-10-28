import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { readStored, writeStored } from '@/storage'
import { difficulties, pieceReachModes, type Difficulty, type PieceReachMode } from './items'

export interface PieceReachSettings {
  modes: readonly PieceReachMode[]
  difficulty: Difficulty
}

const storageKey = 'piece-reach-settings'
const defaultSettings: PieceReachSettings = { modes: pieceReachModes, difficulty: 1 }

function isSettings(value: unknown): value is PieceReachSettings {
  if (typeof value !== 'object' || value === null) return false
  const { modes, difficulty } = value as Record<string, unknown>
  return (
    Array.isArray(modes) &&
    modes.length > 0 &&
    modes.every((mode) => pieceReachModes.includes(mode)) &&
    difficulties.includes(difficulty as Difficulty)
  )
}

export const usePieceReachSettings = defineStore('pieceReachSettings', () => {
  const settings = ref<PieceReachSettings>(readStored(storageKey, isSettings) ?? defaultSettings)

  watch(settings, (value) => writeStored(storageKey, value))

  function toggleMode(mode: PieceReachMode) {
    const { modes } = settings.value
    const next = modes.includes(mode) ? modes.filter((existing) => existing !== mode) : [...modes, mode]
    if (next.length === 0) return
    settings.value = { ...settings.value, modes: pieceReachModes.filter((known) => next.includes(known)) }
  }

  function setDifficulty(difficulty: Difficulty) {
    settings.value = { ...settings.value, difficulty }
  }

  return { settings, toggleMode, setDifficulty }
})

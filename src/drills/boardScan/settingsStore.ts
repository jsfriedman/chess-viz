import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { ScanStepId } from '@/chess/explain'
import { readStored, writeStored } from '@/storage'
import { isDifficulty, type Difficulty } from '../difficulty'
import { toggled } from '../toggle'

export const scanStepIds = ['checks', 'captures', 'hanging'] as const satisfies readonly ScanStepId[]

export interface BoardScanSettings {
  steps: readonly ScanStepId[]
  difficulty: Difficulty
}

const storageKey = 'board-scan-settings'
const defaultSettings: BoardScanSettings = { steps: scanStepIds, difficulty: 1 }

function isSettings(value: unknown): value is BoardScanSettings {
  if (typeof value !== 'object' || value === null) return false
  const { steps, difficulty } = value as Record<string, unknown>
  return (
    Array.isArray(steps) &&
    steps.length > 0 &&
    steps.every((step) => scanStepIds.includes(step)) &&
    isDifficulty(difficulty)
  )
}

export const useBoardScanSettings = defineStore('boardScanSettings', () => {
  const settings = ref<BoardScanSettings>(readStored(storageKey, isSettings) ?? defaultSettings)

  watch(settings, (value) => writeStored(storageKey, value))

  function toggleStep(step: ScanStepId) {
    settings.value = { ...settings.value, steps: toggled(settings.value.steps, step, scanStepIds) }
  }

  function setDifficulty(difficulty: Difficulty) {
    settings.value = { ...settings.value, difficulty }
  }

  return { settings, toggleStep, setDifficulty }
})

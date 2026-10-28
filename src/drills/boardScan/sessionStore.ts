import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { starterPositions } from './steps'
import type { ItemResult, StepResult } from './summary'

export const useBoardScanSession = defineStore('boardScanSession', () => {
  const positions = ref<readonly string[]>([])
  const itemIndex = ref(0)
  const completedItems = ref<readonly ItemResult[]>([])
  const currentStepResults = ref<readonly StepResult[]>([])
  const itemStartedAt = ref(0)

  const currentFen = computed(() => positions.value[itemIndex.value])
  const isLastItem = computed(() => itemIndex.value === positions.value.length - 1)
  const inProgress = computed(() => positions.value.length > 0 && completedItems.value.length < positions.value.length)

  function start(fens: readonly string[] = starterPositions) {
    positions.value = fens
    itemIndex.value = 0
    completedItems.value = []
    currentStepResults.value = []
    itemStartedAt.value = performance.now()
  }

  function recordStep(result: StepResult) {
    currentStepResults.value = [...currentStepResults.value, result]
  }

  function finishItem() {
    const fen = currentFen.value
    if (!fen) return
    const seconds = (performance.now() - itemStartedAt.value) / 1000
    completedItems.value = [...completedItems.value, { fen, steps: currentStepResults.value, seconds }]
    currentStepResults.value = []
    if (!isLastItem.value) {
      itemIndex.value += 1
      itemStartedAt.value = performance.now()
    }
  }

  return { positions, itemIndex, completedItems, currentFen, isLastItem, inProgress, start, recordStep, finishItem }
})

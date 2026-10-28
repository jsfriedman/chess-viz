import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import type { ItemResult, StepResult } from './summary'

export const itemsPerSession = 10

export interface DrillItem {
  fen: string
}

export function defineDrillSession<Item extends DrillItem>(id: string, createItems: () => readonly Item[]) {
  return defineStore(id, () => {
    const items = shallowRef<readonly Item[]>([])
    const itemIndex = ref(0)
    const completedItems = shallowRef<readonly ItemResult[]>([])
    const currentStepResults = shallowRef<readonly StepResult[]>([])
    const itemStartedAt = ref(0)

    const currentItem = computed(() => items.value[itemIndex.value])
    const isLastItem = computed(() => itemIndex.value === items.value.length - 1)
    const inProgress = computed(() => items.value.length > 0 && completedItems.value.length < items.value.length)

    function start(nextItems: readonly Item[] = createItems()) {
      items.value = nextItems
      itemIndex.value = 0
      completedItems.value = []
      currentStepResults.value = []
      itemStartedAt.value = performance.now()
    }

    function recordStep(result: StepResult) {
      currentStepResults.value = [...currentStepResults.value, result]
    }

    function finishItem() {
      const item = currentItem.value
      if (!item) return
      const seconds = (performance.now() - itemStartedAt.value) / 1000
      completedItems.value = [...completedItems.value, { fen: item.fen, steps: currentStepResults.value, seconds }]
      currentStepResults.value = []
      if (!isLastItem.value) {
        itemIndex.value += 1
        itemStartedAt.value = performance.now()
      }
    }

    return { items, itemIndex, completedItems, currentItem, isLastItem, inProgress, start, recordStep, finishItem }
  })
}

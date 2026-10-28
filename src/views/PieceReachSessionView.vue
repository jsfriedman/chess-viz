<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import KnightPathExercise from '@/components/pieceReach/KnightPathExercise.vue'
import ReachExercise from '@/components/pieceReach/ReachExercise.vue'
import SessionHeader from '@/components/SessionHeader.vue'
import { usePieceReachSession } from '@/drills/pieceReach/sessionStore'
import type { StepResult } from '@/drills/summary'

const router = useRouter()
const session = usePieceReachSession()
if (!session.inProgress) session.start()

const item = computed(() => session.currentItem!)
const advanceLabel = computed(() => (session.isLastItem ? 'See results' : 'Next'))

function recordResult(result: StepResult) {
  session.recordStep(result)
}

function advance() {
  const wasLastItem = session.isLastItem
  session.finishItem()
  if (wasLastItem) router.push('/results/piece-reach')
}
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <SessionHeader
      title="Piece reach"
      :item-index="session.itemIndex"
      :item-count="session.items.length"
      :completed-count="session.completedItems.length"
    />
    <ReachExercise
      v-if="item.mode === 'reach'"
      :key="session.itemIndex"
      :item="item"
      :advance-label="advanceLabel"
      @graded="recordResult"
      @advance="advance"
    />
    <KnightPathExercise
      v-else
      :key="session.itemIndex"
      :item="item"
      :advance-label="advanceLabel"
      @graded="recordResult"
      @advance="advance"
    />
  </div>
</template>

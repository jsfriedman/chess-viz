<script setup lang="ts">
import type { Explanation } from '@/chess/explain'
import ExplanationHeader from './ExplanationHeader.vue'
import PieceChip from './PieceChip.vue'

defineProps<{ explanation: Extract<Explanation, { kind: 'moves' }> }>()
</script>

<template>
  <div class="space-y-3">
    <ExplanationHeader :target="explanation.target" :verdict="explanation.verdict" :highlighted="explanation.matches" />
    <div v-if="explanation.moves.length" class="flex flex-wrap gap-1">
      <PieceChip v-for="move in explanation.moves" :key="move.san" :piece="move.piece">{{ move.san }}</PieceChip>
    </div>
    <p v-if="explanation.note" class="text-sm font-medium">{{ explanation.note }}</p>
  </div>
</template>

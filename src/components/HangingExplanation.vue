<script setup lang="ts">
import { computed } from 'vue'
import { colorOf, opponentOf } from '@/chess/position'
import type { HangingAnalysis } from '@/chess/hanging'
import ExplanationHeader from './ExplanationHeader.vue'
import PieceChip from './PieceChip.vue'

const props = defineProps<{ analysis: HangingAnalysis }>()

const attackingSide = computed(() => (opponentOf(colorOf(props.analysis.target.piece)) === 'w' ? 'White' : 'Black'))

const outcome = computed(() => {
  const { analysis } = props
  switch (analysis.reason) {
    case 'not-attacked':
      return 'Not attacked.'
    case 'undefended':
      return `Undefended. ${attackingSide.value} wins ${analysis.net}.`
    case 'wins-material':
      return `${analysis.kingCannotRecapture ? 'King can’t recapture. ' : ''}${attackingSide.value} wins ${analysis.net}.`
    case 'even-trade':
      return 'Even trade.'
    case 'loses-material':
      return `Taking loses ${-analysis.net}.`
  }
})

const rows = computed(() => [
  { label: 'Attackers', kind: 'attack', pieces: props.analysis.attackers },
  { label: 'Defenders', kind: 'defend', pieces: props.analysis.defenders },
])
</script>

<template>
  <div class="space-y-3">
    <ExplanationHeader
      :target="analysis.target"
      :verdict="analysis.hanging ? 'Hanging' : 'Not hanging'"
      :highlighted="analysis.hanging"
    />

    <dl class="space-y-1.5 text-sm">
      <div v-for="row in rows" :key="row.kind" class="flex items-center gap-2">
        <svg viewBox="0 0 24 6" class="h-1.5 w-6 shrink-0" aria-hidden="true">
          <line
            x1="0"
            y1="3"
            x2="24"
            y2="3"
            stroke-width="4"
            :stroke="row.kind === 'attack' ? 'var(--arrow-attack)' : 'var(--arrow-defend)'"
            :stroke-dasharray="row.kind === 'defend' ? '5 3' : undefined"
          />
        </svg>
        <dt class="w-20 text-stone-500 dark:text-stone-400">{{ row.label }}</dt>
        <dd class="flex flex-wrap gap-1">
          <span v-if="row.pieces.length === 0" class="text-stone-400">None</span>
          <PieceChip v-for="boardPiece in row.pieces" :key="boardPiece.square" :piece="boardPiece.piece">
            {{ boardPiece.square }}
          </PieceChip>
        </dd>
      </div>
    </dl>

    <div v-if="analysis.line.length" class="flex flex-wrap items-center gap-1 text-sm">
      <template v-for="(capture, index) in analysis.line" :key="index">
        <span v-if="index > 0" class="text-stone-400" aria-hidden="true">›</span>
        <PieceChip :piece="capture.capturer.piece">{{ capture.notation }}</PieceChip>
      </template>
    </div>

    <p class="text-sm font-medium">{{ outcome }}</p>
  </div>
</template>

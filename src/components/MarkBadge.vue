<script setup lang="ts">
import type { SquareMark } from './ChessBoard.vue'

defineProps<{ mark: Exclude<SquareMark, 'selected' | 'hint'> }>()

const colorVariable = {
  correct: 'var(--mark-correct)',
  wrong: 'var(--mark-wrong)',
  missed: 'var(--mark-missed)',
} as const
</script>

<template>
  <svg viewBox="0 0 1 1" aria-hidden="true">
    <circle cx="0.5" cy="0.5" r="0.46" :fill="colorVariable[mark]" stroke="white" stroke-width="0.08" />
    <path
      v-if="mark === 'correct'"
      d="M0.27 0.52 L0.44 0.68 L0.74 0.34"
      fill="none"
      stroke="white"
      stroke-width="0.12"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      v-else-if="mark === 'wrong'"
      d="M0.32 0.32 L0.68 0.68 M0.68 0.32 L0.32 0.68"
      fill="none"
      stroke="white"
      stroke-width="0.12"
      stroke-linecap="round"
    />
    <path v-else d="M0.5 0.25 L0.5 0.56 M0.5 0.74 L0.5 0.75" fill="none" stroke="white" stroke-width="0.13" stroke-linecap="round" />
  </svg>
</template>

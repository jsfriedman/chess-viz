<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { parsePlacement } from '@/chess/board'
import type { DrillSummary } from '@/drills/catalog'
import ChessBoard, { type SquareMark } from './ChessBoard.vue'

const props = defineProps<{ drill: DrillSummary }>()

const placement = computed(() => parsePlacement(props.drill.previewFen))
const marks = computed<Record<string, SquareMark>>(() =>
  Object.fromEntries(props.drill.previewSquares.map((square) => [square, 'hint' as const])),
)
</script>

<template>
  <component
    :is="drill.route ? RouterLink : 'div'"
    :to="drill.route"
    class="group flex gap-4 rounded-2xl border border-stone-200 bg-white p-4 transition-all dark:border-stone-800 dark:bg-stone-900"
    :class="
      drill.route
        ? 'hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg hover:shadow-stone-900/5 focus-visible:outline-2 focus-visible:outline-accent'
        : 'opacity-70'
    "
  >
    <div class="w-24 shrink-0 sm:w-28">
      <ChessBoard :placement="placement" :marks="marks" :show-coordinates="false" />
    </div>
    <div class="flex min-w-0 flex-1 flex-col">
      <div class="flex items-start justify-between gap-2">
        <h3 class="font-semibold tracking-tight">{{ drill.title }}</h3>
        <svg
          v-if="drill.route"
          viewBox="0 0 24 24"
          class="size-5 shrink-0 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </div>
      <div class="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
        <span
          v-for="mode in drill.modes"
          :key="mode"
          class="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300"
        >
          {{ mode }}
        </span>
        <span v-if="!drill.route" class="ml-auto text-xs font-medium text-stone-400">Soon</span>
      </div>
    </div>
  </component>
</template>

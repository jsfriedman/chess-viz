<script setup lang="ts">
import { RouterLink } from 'vue-router'
import MarkBadge from '@/components/MarkBadge.vue'
import { sessionResult } from '@/mock/mockData'

const isPersonalBest = sessionResult.correctItems > sessionResult.previousBest

const stats = [
  { label: 'Accuracy', value: `${sessionResult.accuracy}%` },
  { label: 'Avg per item', value: `${sessionResult.averageSeconds}s` },
  { label: 'Previous best', value: `${sessionResult.previousBest}/${sessionResult.itemCount}` },
]
</script>

<template>
  <div class="mx-auto max-w-xl space-y-8">
    <section class="text-center">
      <p class="text-sm font-medium text-stone-500 dark:text-stone-400">
        {{ sessionResult.drill }} · Level {{ sessionResult.level }}
      </p>
      <p class="mt-3 text-6xl font-semibold tracking-tight tabular-nums">
        {{ sessionResult.correctItems }}<span class="text-stone-400 dark:text-stone-600">/{{ sessionResult.itemCount }}</span>
      </p>
      <p
        v-if="isPersonalBest"
        class="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-sm font-medium text-stone-800 dark:text-stone-100"
      >
        <svg viewBox="0 0 24 24" class="size-4 text-accent" fill="currentColor" aria-hidden="true">
          <path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5-4.9-4.5 6.6-.8z" />
        </svg>
        New personal best
      </p>
    </section>

    <section class="grid grid-cols-3 gap-3">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-2xl border border-stone-200 bg-white p-4 text-center dark:border-stone-800 dark:bg-stone-900"
      >
        <p class="text-xl font-semibold tabular-nums">{{ stat.value }}</p>
        <p class="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{{ stat.label }}</p>
      </div>
    </section>

    <section aria-labelledby="items-heading">
      <h2 id="items-heading" class="mb-3 text-sm font-medium text-stone-500 dark:text-stone-400">Items</h2>
      <ol class="grid grid-cols-10 gap-1.5">
        <li v-for="(passed, index) in sessionResult.items" :key="index" class="flex flex-col items-center gap-1">
          <MarkBadge :mark="passed ? 'correct' : 'wrong'" class="size-6 sm:size-7" />
          <span class="text-[10px] text-stone-500 tabular-nums">{{ index + 1 }}</span>
        </li>
      </ol>
    </section>

    <section aria-labelledby="steps-heading">
      <h2 id="steps-heading" class="mb-3 text-sm font-medium text-stone-500 dark:text-stone-400">By step</h2>
      <ul class="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
        <li v-for="step in sessionResult.steps" :key="step.title">
          <div class="mb-1.5 flex justify-between text-sm">
            <span class="font-medium">{{ step.title }}</span>
            <span class="text-stone-500 tabular-nums dark:text-stone-400">
              {{ step.found }}/{{ step.total }} found · {{ step.wrong }} wrong
            </span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
            <div class="h-full rounded-full bg-accent" :style="{ width: `${step.accuracy}%` }" />
          </div>
        </li>
      </ul>
    </section>

    <div class="flex gap-3">
      <RouterLink
        to="/train/board-scan"
        class="flex-1 rounded-xl bg-accent px-4 py-3 text-center font-semibold text-accent-foreground shadow-sm transition hover:brightness-110"
      >
        Train again
      </RouterLink>
      <RouterLink
        to="/"
        class="flex-1 rounded-xl border border-stone-300 px-4 py-3 text-center font-semibold transition hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-900"
      >
        Done
      </RouterLink>
    </div>
  </div>
</template>

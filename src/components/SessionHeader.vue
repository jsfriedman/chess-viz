<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{ title: string; itemIndex: number; itemCount: number; completedCount: number }>()
</script>

<template>
  <div class="mb-5 flex items-center gap-4">
    <RouterLink
      to="/"
      class="grid size-8 place-items-center rounded-lg text-stone-500 hover:bg-stone-200/60 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100"
      aria-label="End session"
    >
      <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </RouterLink>
    <div class="flex-1">
      <div class="mb-1.5 flex justify-between text-xs font-medium text-stone-500 dark:text-stone-400">
        <span>{{ title }}</span>
        <span class="tabular-nums">{{ itemIndex + 1 }} / {{ itemCount }}</span>
      </div>
      <div class="h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
        <div
          class="h-full rounded-full bg-accent transition-all"
          :style="{ width: `${(completedCount / itemCount) * 100}%` }"
        />
      </div>
    </div>
  </div>
</template>

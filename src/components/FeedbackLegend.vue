<script setup lang="ts">
import MarkBadge from './MarkBadge.vue'

const entries = [
  { mark: 'correct', label: 'Found' },
  { mark: 'missed', label: 'Missed' },
  { mark: 'wrong', label: 'Wrong' },
] as const
</script>

<template>
  <ul class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600 dark:text-stone-400">
    <li v-for="entry in entries" :key="entry.mark" class="flex items-center gap-1.5">
      <MarkBadge :mark="entry.mark" class="size-4" />
      {{ entry.label }}
    </li>
  </ul>
</template>

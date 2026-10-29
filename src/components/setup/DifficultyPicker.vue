<script setup lang="ts">
import { difficulties, type Difficulty } from '@/drills/difficulty'

defineProps<{ selected: Difficulty }>()
const emit = defineEmits<{ select: [difficulty: Difficulty] }>()
</script>

<template>
  <fieldset>
    <legend class="mb-3 text-sm font-medium text-stone-500 dark:text-stone-400">Difficulty</legend>
    <div class="grid grid-cols-5 gap-1 rounded-xl bg-stone-100 p-1 dark:bg-stone-900">
      <button
        v-for="difficulty in difficulties"
        :key="difficulty"
        type="button"
        :aria-pressed="selected === difficulty"
        class="rounded-lg py-2 font-semibold tabular-nums transition-colors"
        :class="
          selected === difficulty
            ? 'bg-white shadow-sm dark:bg-stone-700'
            : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
        "
        @click="emit('select', difficulty)"
      >
        {{ difficulty }}
      </button>
    </div>
  </fieldset>
</template>

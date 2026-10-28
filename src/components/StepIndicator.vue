<script setup lang="ts">
defineProps<{ steps: readonly string[]; currentIndex: number }>()
</script>

<template>
  <ol class="flex items-center gap-2 text-sm" aria-label="Steps">
    <li v-for="(step, index) in steps" :key="step" class="flex items-center gap-2">
      <span
        class="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium transition-colors"
        :class="
          index === currentIndex
            ? 'bg-accent text-accent-foreground'
            : index < currentIndex
              ? 'bg-accent/15 text-stone-700 dark:text-stone-200'
              : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
        "
        :aria-current="index === currentIndex ? 'step' : undefined"
      >
        <svg
          v-if="index < currentIndex"
          viewBox="0 0 24 24"
          class="size-3.5"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
        {{ step }}
      </span>
      <span v-if="index < steps.length - 1" class="h-px w-3 bg-stone-300 dark:bg-stone-700" aria-hidden="true" />
    </li>
  </ol>
</template>

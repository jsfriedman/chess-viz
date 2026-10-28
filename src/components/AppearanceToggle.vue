<script setup lang="ts">
import { useThemeStore, type AppearanceMode } from '@/theme/themeStore'

const themeStore = useThemeStore()

const options: readonly { mode: AppearanceMode; label: string; icon: string }[] = [
  { mode: 'light', label: 'Light', icon: 'M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14-1.41-1.41M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z' },
  { mode: 'system', label: 'System', icon: 'M4 5h16v11H4zM8 20h8m-4-4v4' },
  { mode: 'dark', label: 'Dark', icon: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z' },
]
</script>

<template>
  <div
    class="flex items-center rounded-lg bg-stone-200/60 p-0.5 dark:bg-stone-800/80"
    role="radiogroup"
    aria-label="Appearance"
  >
    <button
      v-for="option in options"
      :key="option.mode"
      type="button"
      role="radio"
      :aria-checked="themeStore.appearance === option.mode"
      :aria-label="option.label"
      :title="option.label"
      class="grid size-7 place-items-center rounded-md text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
      :class="{
        'bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-50': themeStore.appearance === option.mode,
      }"
      @click="themeStore.setAppearance(option.mode)"
    >
      <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path :d="option.icon" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import AppearanceToggle from './components/AppearanceToggle.vue'
import { pieceImageUrl } from './chess/pieceSets'

const navigationLinks = [
  { to: '/', label: 'Train' },
  { to: '/theme', label: 'Colors' },
]
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <header
      class="sticky top-0 z-10 border-b border-stone-200/70 bg-stone-50/85 backdrop-blur dark:border-stone-800/70 dark:bg-stone-950/85"
    >
      <div class="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:gap-6">
        <RouterLink to="/" class="flex items-center gap-2 font-semibold tracking-tight whitespace-nowrap">
          <span class="grid size-8 place-items-center rounded-lg bg-accent/15">
            <img :src="pieceImageUrl('wN')" alt="" class="size-6" />
          </span>
          chess-viz
        </RouterLink>
        <nav class="flex items-center gap-1 text-sm">
          <RouterLink
            v-for="link in navigationLinks"
            :key="link.to"
            :to="link.to"
            class="rounded-md px-3 py-1.5 text-stone-600 transition-colors hover:bg-stone-200/60 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
            exact-active-class="!bg-stone-200/80 !text-stone-900 dark:!bg-stone-800 dark:!text-stone-100"
          >
            {{ link.label }}
          </RouterLink>
        </nav>
        <AppearanceToggle class="ml-auto" />
      </div>
    </header>

    <main class="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-16 sm:pt-10">
      <RouterView />
    </main>
  </div>
</template>

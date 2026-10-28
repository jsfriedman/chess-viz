<script setup lang="ts">
import { useRouter } from 'vue-router'
import { difficulties, pieceReachModes, type PieceReachMode } from '@/drills/pieceReach/items'
import { usePieceReachSession } from '@/drills/pieceReach/sessionStore'
import { usePieceReachSettings } from '@/drills/pieceReach/settingsStore'

const router = useRouter()
const settingsStore = usePieceReachSettings()
const session = usePieceReachSession()

const modeTitles: Readonly<Record<PieceReachMode, string>> = { reach: 'Reach', 'knight-path': 'Knight path' }

function start() {
  session.start()
  router.push('/train/piece-reach/session')
}
</script>

<template>
  <div class="mx-auto max-w-md space-y-8">
    <h1 class="text-2xl font-semibold tracking-tight">Piece reach</h1>

    <fieldset>
      <legend class="mb-3 text-sm font-medium text-stone-500 dark:text-stone-400">Modes</legend>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="mode in pieceReachModes"
          :key="mode"
          type="button"
          role="switch"
          :aria-checked="settingsStore.settings.modes.includes(mode)"
          class="rounded-xl border px-4 py-3 font-medium transition-colors"
          :class="
            settingsStore.settings.modes.includes(mode)
              ? 'border-accent bg-accent/10 text-stone-900 dark:text-stone-100'
              : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400'
          "
          @click="settingsStore.toggleMode(mode)"
        >
          {{ modeTitles[mode] }}
        </button>
      </div>
    </fieldset>

    <fieldset>
      <legend class="mb-3 text-sm font-medium text-stone-500 dark:text-stone-400">Difficulty</legend>
      <div class="grid grid-cols-5 gap-1 rounded-xl bg-stone-100 p-1 dark:bg-stone-900">
        <button
          v-for="difficulty in difficulties"
          :key="difficulty"
          type="button"
          :aria-pressed="settingsStore.settings.difficulty === difficulty"
          class="rounded-lg py-2 font-semibold tabular-nums transition-colors"
          :class="
            settingsStore.settings.difficulty === difficulty
              ? 'bg-white shadow-sm dark:bg-stone-700'
              : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
          "
          @click="settingsStore.setDifficulty(difficulty)"
        >
          {{ difficulty }}
        </button>
      </div>
    </fieldset>

    <button
      type="button"
      class="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-accent-foreground shadow-sm transition hover:brightness-110 active:scale-[0.99]"
      @click="start"
    >
      Start
    </button>
  </div>
</template>

<script setup lang="ts">
import DrillCard from '@/components/DrillCard.vue'
import { drills, recentSessions } from '@/mock/mockData'
</script>

<template>
  <div class="space-y-10">
    <section aria-labelledby="drills-heading">
      <h2 id="drills-heading" class="mb-3 text-sm font-medium text-stone-500 dark:text-stone-400">Drills</h2>
      <div class="grid gap-3 md:grid-cols-2">
        <DrillCard
          v-for="drill in drills"
          :key="drill.id"
          :drill="drill"
          :to="drill.id === 'board-scan' ? '/train/board-scan' : undefined"
        />
      </div>
    </section>

    <section aria-labelledby="recent-heading">
      <h2 id="recent-heading" class="mb-3 text-sm font-medium text-stone-500 dark:text-stone-400">Recent sessions</h2>
      <ul
        class="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900"
      >
        <li v-for="session in recentSessions" :key="session.drill + session.when" class="flex items-center gap-4 px-4 py-3">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium">
              {{ session.drill }} <span class="font-normal text-stone-500">· Level {{ session.level }}</span>
            </p>
            <p class="truncate text-xs text-stone-500 dark:text-stone-400">{{ session.modes }} · {{ session.when }}</p>
          </div>
          <div class="text-right text-sm tabular-nums">
            <p class="font-semibold">{{ session.score }}</p>
            <p class="text-xs text-stone-500 dark:text-stone-400">{{ session.averageSeconds }}s / item</p>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

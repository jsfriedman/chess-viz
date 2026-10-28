<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import MarkBadge from '@/components/MarkBadge.vue'
import { sessionDrills } from '@/drills/sessions'
import { summarizeSession } from '@/drills/summary'

const route = useRoute()
const router = useRouter()
const drill = sessionDrills[String(route.params.drill)]
const session = drill?.useSession()
if (!session || session.completedItems.length === 0) router.replace('/')

const summary = computed(() => summarizeSession(session?.completedItems ?? []))

const stats = computed(() => [
  { label: 'Accuracy', value: `${summary.value.accuracy}%` },
  { label: 'Avg time', value: `${summary.value.averageSeconds}s` },
])

const stepTitle = (stepId: string) => drill?.stepTitles[stepId] ?? stepId

function trainAgain() {
  if (!drill || !session) return
  session.start()
  router.push(drill.route)
}
</script>

<template>
  <div v-if="summary.itemCount" class="mx-auto max-w-xl space-y-8">
    <section class="text-center">
      <p class="text-sm font-medium text-stone-500 dark:text-stone-400">{{ drill?.title }}</p>
      <p class="mt-3 text-6xl font-semibold tracking-tight tabular-nums">
        {{ summary.perfectItems }}<span class="text-stone-400 dark:text-stone-600">/{{ summary.itemCount }}</span>
      </p>
      <p class="mt-1 text-sm text-stone-500 dark:text-stone-400">perfect</p>
    </section>

    <section class="grid grid-cols-2 gap-3">
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
      <h2 id="items-heading" class="mb-3 text-sm font-medium text-stone-500 dark:text-stone-400">{{ drill?.itemLabel }}</h2>
      <ol class="flex flex-wrap gap-3">
        <li v-for="(perfect, index) in summary.itemsPerfect" :key="index" class="flex flex-col items-center gap-1">
          <MarkBadge :mark="perfect ? 'correct' : 'wrong'" class="size-7" />
          <span class="text-[10px] text-stone-500 tabular-nums">{{ index + 1 }}</span>
        </li>
      </ol>
    </section>

    <section aria-labelledby="steps-heading">
      <h2 id="steps-heading" class="mb-3 text-sm font-medium text-stone-500 dark:text-stone-400">Breakdown</h2>
      <ul class="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
        <li v-for="step in summary.steps" :key="step.step">
          <div class="mb-1.5 flex justify-between text-sm">
            <span class="font-medium">{{ stepTitle(step.step) }}</span>
            <span class="text-stone-500 tabular-nums dark:text-stone-400">
              {{ step.found }}/{{ step.total }}<template v-if="step.wrong"> · {{ step.wrong }} wrong</template>
            </span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
            <div class="h-full rounded-full bg-accent" :style="{ width: `${step.accuracy}%` }" />
          </div>
        </li>
      </ul>
    </section>

    <div class="flex gap-3">
      <button
        type="button"
        class="flex-1 rounded-xl bg-accent px-4 py-3 text-center font-semibold text-accent-foreground shadow-sm transition hover:brightness-110"
        @click="trainAgain"
      >
        Train again
      </button>
      <RouterLink
        to="/"
        class="flex-1 rounded-xl border border-stone-300 px-4 py-3 text-center font-semibold transition hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-900"
      >
        Done
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ChessBoard, { type SquareMark } from '@/components/ChessBoard.vue'
import ExerciseButton from '@/components/ExerciseButton.vue'
import ExerciseLayout from '@/components/ExerciseLayout.vue'
import FeedbackLegend from '@/components/FeedbackLegend.vue'
import MarkBadge from '@/components/MarkBadge.vue'
import { parsePlacement, type BoardArrow, type Square } from '@/chess/board'
import { useExerciseKeys } from '@/composables/useExerciseKeys'
import type { KnightPathItem } from '@/drills/pieceReach/items'
import { gradeKnightPath, type KnightPathGrade } from '@/drills/pieceReach/knightPath'
import type { StepResult } from '@/drills/summary'

const props = defineProps<{ item: KnightPathItem; advanceLabel: string }>()
const emit = defineEmits<{ graded: [result: StepResult]; advance: [] }>()

const maxPathLength = 10

const path = ref<readonly Square[]>([])
const grade = ref<KnightPathGrade>()

const placement = computed(() => parsePlacement(props.item.fen))
const solved = computed(() => grade.value?.verdict === 'shortest')

function hops(squares: readonly Square[], kind: BoardArrow['kind']): BoardArrow[] {
  return squares.map((square, index) => ({ from: squares[index - 1] ?? props.item.start, to: square, kind }))
}

const arrows = computed<BoardArrow[]>(() => {
  const attempt = hops(path.value, 'path')
  if (!grade.value || solved.value) return attempt
  const attemptKeys = new Set(attempt.map((arrow) => `${arrow.from}-${arrow.to}`))
  const solution = hops(grade.value.solution, 'solution').filter((arrow) => !attemptKeys.has(`${arrow.from}-${arrow.to}`))
  return [...attempt, ...solution]
})

const marks = computed<Record<Square, SquareMark>>(() => {
  if (!grade.value) {
    return { [props.item.target]: 'hint', ...Object.fromEntries(path.value.map((square) => [square, 'selected'])) }
  }
  if (solved.value) return Object.fromEntries(path.value.map((square) => [square, 'correct']))
  const solution = new Set(grade.value.solution)
  const attempt = new Set(path.value)
  const problemSquare = grade.value.problemIndex === undefined ? undefined : path.value[grade.value.problemIndex]
  return Object.fromEntries(
    [...new Set([...solution, ...attempt])].map((square) => {
      if (!solution.has(square) || square === problemSquare) return [square, 'wrong']
      return [square, attempt.has(square) ? 'correct' : 'missed']
    }),
  )
})

const verdictText = computed(() => {
  const result = grade.value
  if (!result) return ''
  const shortest = result.solution.length
  const problem = result.problemIndex === undefined ? undefined : path.value[result.problemIndex]
  const from = result.problemIndex ? path.value[result.problemIndex - 1] : props.item.start
  switch (result.verdict) {
    case 'shortest':
      return `Shortest path · ${shortest} moves`
    case 'longer':
      return `${path.value.length} moves · shortest is ${shortest}`
    case 'illegal-hop':
      return `${from} → ${problem} isn’t a knight move`
    case 'blocked':
      return `${problem} is blocked by your own pawn`
    case 'unfinished':
      return `Didn’t reach ${props.item.target}`
  }
})

function clickSquare(square: Square) {
  if (grade.value) return
  if (square === path.value.at(-1)) return undo()
  if (square === props.item.start && path.value.length === 0) return
  if (path.value.length >= maxPathLength) return
  path.value = [...path.value, square]
  if (square === props.item.target) submit()
}

function undo() {
  path.value = path.value.slice(0, -1)
}

function submit() {
  grade.value = gradeKnightPath(props.item, path.value)
  emit('graded', { step: 'knight-path', found: solved.value ? 1 : 0, total: 1, wrong: 0 })
}

useExerciseKeys({ isSubmitted: () => grade.value !== undefined, submit, advance: () => emit('advance'), undo })
</script>

<template>
  <ExerciseLayout>
    <template #board>
      <ChessBoard :placement="placement" :marks="marks" :arrows="arrows" interactive @square-click="clickSquare" />
    </template>

    <div>
      <p class="text-lg font-medium text-balance">Knight to {{ item.target }} in the fewest moves.</p>
      <div v-if="!grade" class="mt-2 flex h-8 items-center gap-3 text-sm text-stone-500 tabular-nums dark:text-stone-400">
        <span>{{ path.length }} {{ path.length === 1 ? 'move' : 'moves' }}</span>
        <button
          v-if="path.length"
          type="button"
          class="flex items-center gap-1.5 rounded-lg px-2 py-1 font-medium hover:bg-stone-200/60 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100"
          @click="undo"
        >
          Undo
          <kbd class="hidden rounded bg-stone-200 px-1 font-sans text-xs dark:bg-stone-800 sm:inline">⌫</kbd>
        </button>
      </div>
    </div>

    <div
      v-if="grade"
      class="rounded-xl border border-stone-200 bg-white p-4 text-sm dark:border-stone-800 dark:bg-stone-900"
      aria-live="polite"
    >
      <p class="flex items-center gap-2 font-medium">
        <MarkBadge :mark="solved ? 'correct' : 'wrong'" class="size-5 shrink-0" />
        {{ verdictText }}
      </p>
      <FeedbackLegend v-if="!solved" class="mt-3" />
    </div>

    <ExerciseButton :submitted="grade !== undefined" :advance-label="advanceLabel" @check="submit" @advance="emit('advance')" />
  </ExerciseLayout>
</template>

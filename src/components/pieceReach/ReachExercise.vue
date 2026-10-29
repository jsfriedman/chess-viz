<script setup lang="ts">
import { computed, ref } from 'vue'
import ChessBoard, { type SquareMark } from '@/components/ChessBoard.vue'
import ExerciseButton from '@/components/ExerciseButton.vue'
import ExerciseLayout from '@/components/ExerciseLayout.vue'
import FeedbackLegend from '@/components/FeedbackLegend.vue'
import TallyLine from '@/components/TallyLine.vue'
import { describePiece, parsePlacement, type BoardArrow, type Square } from '@/chess/board'
import { reachableSquares, reachEndpoints } from '@/chess/reach'
import { useExerciseKeys } from '@/composables/useExerciseKeys'
import { gradeSelection, selectionMarks, tallyMarks } from '@/drills/grading'
import type { ReachItem } from '@/drills/pieceReach/items'
import type { StepResult } from '@/drills/summary'

const props = defineProps<{ item: ReachItem; advanceLabel: string }>()
const emit = defineEmits<{ graded: [result: StepResult]; advance: [] }>()

const selectedSquares = ref<ReadonlySet<Square>>(new Set())
const submitted = ref(false)

const placement = computed(() => parsePlacement(props.item.fen))
const pieceDescription = computed(() => describePiece(placement.value[props.item.square]!))
const answer = computed(() => new Set(reachableSquares(placement.value, props.item.square)))
const gradedMarks = computed(() => gradeSelection(answer.value, selectedSquares.value))
const tally = computed(() => tallyMarks(gradedMarks.value, answer.value.size))

const arrows = computed<BoardArrow[]>(() =>
  submitted.value
    ? reachEndpoints(placement.value, props.item.square).map((to) => ({ from: props.item.square, to, kind: 'path' }))
    : [],
)

const marks = computed<Record<Square, SquareMark>>(() => ({
  ...(submitted.value ? gradedMarks.value : selectionMarks(selectedSquares.value)),
  [props.item.square]: 'hint',
}))

function toggleSquare(square: Square) {
  if (submitted.value || square === props.item.square) return
  const next = new Set(selectedSquares.value)
  if (next.has(square)) next.delete(square)
  else next.add(square)
  selectedSquares.value = next
}

function submit() {
  submitted.value = true
  emit('graded', { step: 'reach', ...tally.value })
}

useExerciseKeys({ isSubmitted: () => submitted.value, submit, advance: () => emit('advance') })
</script>

<template>
  <ExerciseLayout>
    <template #board>
      <ChessBoard :placement="placement" :marks="marks" :arrows="arrows" interactive @square-click="toggleSquare" />
    </template>

    <p class="text-lg font-medium text-balance">Where can the {{ pieceDescription }} on {{ item.square }} move?</p>

    <div
      v-if="submitted"
      class="rounded-xl border border-stone-200 bg-white p-4 text-sm dark:border-stone-800 dark:bg-stone-900"
      aria-live="polite"
    >
      <TallyLine :tally="tally" />
      <FeedbackLegend class="mt-3" />
    </div>

    <ExerciseButton :submitted="submitted" :advance-label="advanceLabel" @check="submit" @advance="emit('advance')" />
  </ExerciseLayout>
</template>

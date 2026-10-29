<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import ChessBoard, { type SquareMark } from '@/components/ChessBoard.vue'
import ExerciseButton from '@/components/ExerciseButton.vue'
import ExerciseLayout from '@/components/ExerciseLayout.vue'
import FeedbackLegend from '@/components/FeedbackLegend.vue'
import HangingExplanation from '@/components/HangingExplanation.vue'
import MovesExplanation from '@/components/MovesExplanation.vue'
import SessionHeader from '@/components/SessionHeader.vue'
import StepIndicator from '@/components/StepIndicator.vue'
import TallyLine from '@/components/TallyLine.vue'
import TurnBadge from '@/components/TurnBadge.vue'
import { parsePlacement, sideToMove, type Square } from '@/chess/board'
import { explainSquare, explanationArrows } from '@/chess/explain'
import { useExerciseKeys } from '@/composables/useExerciseKeys'
import { useBoardScanSession } from '@/drills/boardScan/sessionStore'
import { scanSteps } from '@/drills/boardScan/steps'
import { gradeSelection, selectionMarks, tallyMarks } from '@/drills/grading'

const router = useRouter()
const session = useBoardScanSession()
if (!session.inProgress) session.start()

const stepIndex = ref(0)
const selectedSquares = ref<ReadonlySet<Square>>(new Set())
const submitted = ref(false)
const inspectedSquare = ref<Square>()

const fen = computed(() => session.currentItem!.fen)
const placement = computed(() => parsePlacement(fen.value))
const toMove = computed(() => sideToMove(fen.value))
const steps = computed(() => scanSteps.filter((step) => session.currentItem!.steps.includes(step.id)))
const currentStep = computed(() => steps.value[stepIndex.value]!)
const isLastStep = computed(() => stepIndex.value === steps.value.length - 1)
const currentAnswer = computed(() => new Set(currentStep.value.findAnswer(fen.value)))

const explanation = computed(() =>
  submitted.value && inspectedSquare.value ? explainSquare(currentStep.value.id, fen.value, inspectedSquare.value) : undefined,
)
const arrows = computed(() => explanationArrows(explanation.value))

const advanceLabel = computed(() => {
  if (!isLastStep.value) return `Next: ${steps.value[stepIndex.value + 1]!.title}`
  return session.isLastItem ? 'See results' : 'Next position'
})

const gradedMarks = computed(() => gradeSelection(currentAnswer.value, selectedSquares.value))
const marks = computed<Record<Square, SquareMark>>(() =>
  submitted.value ? gradedMarks.value : selectionMarks(selectedSquares.value),
)
const tally = computed(() => tallyMarks(gradedMarks.value, currentAnswer.value.size))

function toggleSquare(square: Square) {
  if (submitted.value && placement.value[square]) inspectedSquare.value = square
  if (submitted.value) return
  const next = new Set(selectedSquares.value)
  if (next.has(square)) next.delete(square)
  else next.add(square)
  selectedSquares.value = next
}

function submit() {
  submitted.value = true
  session.recordStep({ step: currentStep.value.id, ...tally.value })
  const graded = Object.entries(gradedMarks.value)
  inspectedSquare.value = (graded.find(([, mark]) => mark === 'wrong') ?? graded.find(([, mark]) => mark === 'missed'))?.[0]
}

function resetStep() {
  selectedSquares.value = new Set()
  submitted.value = false
  inspectedSquare.value = undefined
}

function advance() {
  if (!isLastStep.value) {
    stepIndex.value += 1
    resetStep()
    return
  }
  const wasLastItem = session.isLastItem
  session.finishItem()
  if (wasLastItem) {
    router.push('/results/board-scan')
    return
  }
  stepIndex.value = 0
  resetStep()
}

useExerciseKeys({ isSubmitted: () => submitted.value, submit, advance })
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <SessionHeader
      title="Board scan"
      :item-index="session.itemIndex"
      :item-count="session.items.length"
      :completed-count="session.completedItems.length"
    />

    <ExerciseLayout>
      <template #board>
        <TurnBadge :color="toMove" />
        <ChessBoard
          :placement="placement"
          :orientation="toMove === 'w' ? 'white' : 'black'"
          :marks="marks"
          :arrows="arrows"
          interactive
          @square-click="toggleSquare"
        />
      </template>

      <StepIndicator v-if="steps.length > 1" :steps="steps.map((step) => step.title)" :current-index="stepIndex" />

      <p class="text-lg font-medium text-balance">{{ currentStep.prompt(toMove) }}</p>

      <div
        v-if="submitted"
        class="rounded-xl border border-stone-200 bg-white p-4 text-sm dark:border-stone-800 dark:bg-stone-900"
        aria-live="polite"
      >
        <TallyLine :tally="tally" />
        <FeedbackLegend class="mt-3" />
        <hr class="my-4 border-stone-200 dark:border-stone-800" />
        <HangingExplanation v-if="explanation?.kind === 'hanging'" :analysis="explanation.analysis" />
        <MovesExplanation v-else-if="explanation?.kind === 'moves'" :explanation="explanation" />
        <p class="mt-3 text-xs text-stone-500 dark:text-stone-400">Tap any piece to inspect.</p>
      </div>

      <ExerciseButton :submitted="submitted" :advance-label="advanceLabel" @check="submit" @advance="advance" />
    </ExerciseLayout>
  </div>
</template>

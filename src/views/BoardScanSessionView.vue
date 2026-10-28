<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import ChessBoard, { type SquareMark } from '@/components/ChessBoard.vue'
import FeedbackLegend from '@/components/FeedbackLegend.vue'
import HangingExplanation from '@/components/HangingExplanation.vue'
import MovesExplanation from '@/components/MovesExplanation.vue'
import StepIndicator from '@/components/StepIndicator.vue'
import { parsePlacement, sideToMove, type Square } from '@/chess/board'
import { explainSquare, explanationArrows, type ScanStepId } from '@/chess/explain'
import { findHangingSquares } from '@/chess/hanging'
import { findCapturableSquares, findCheckingSquares } from '@/chess/scan'
import { boardScanItem } from '@/mock/mockData'

const router = useRouter()
const placement = parsePlacement(boardScanItem.fen)
const toMove = sideToMove(boardScanItem.fen) === 'w' ? 'White' : 'Black'

const stepIndex = ref(0)
const selectedSquares = ref<ReadonlySet<Square>>(new Set())
const submitted = ref(false)
const inspectedSquare = ref<Square>()

const answerFinders: Readonly<Record<ScanStepId, (fen: string) => Square[]>> = {
  checks: findCheckingSquares,
  captures: findCapturableSquares,
  hanging: findHangingSquares,
}

const currentStep = computed(() => boardScanItem.steps[stepIndex.value]!)
const isLastStep = computed(() => stepIndex.value === boardScanItem.steps.length - 1)
const currentAnswer = computed(() => new Set(answerFinders[currentStep.value.id](boardScanItem.fen)))

const explanation = computed(() =>
  submitted.value && inspectedSquare.value
    ? explainSquare(currentStep.value.id, boardScanItem.fen, inspectedSquare.value)
    : undefined,
)
const arrows = computed(() => explanationArrows(explanation.value))

const marks = computed<Record<Square, SquareMark>>(() => {
  if (!submitted.value) {
    return Object.fromEntries([...selectedSquares.value].map((square) => [square, 'selected' as const]))
  }
  const answer = currentAnswer.value
  const graded = [...new Set([...answer, ...selectedSquares.value])].map((square): [Square, SquareMark] => {
    if (!answer.has(square)) return [square, 'wrong']
    return [square, selectedSquares.value.has(square) ? 'correct' : 'missed']
  })
  return Object.fromEntries(graded)
})

const tally = computed(() => {
  const values = Object.values(marks.value)
  return {
    found: values.filter((mark) => mark === 'correct').length,
    total: currentAnswer.value.size,
    wrong: values.filter((mark) => mark === 'wrong').length,
  }
})

function toggleSquare(square: Square) {
  if (submitted.value && placement[square]) inspectedSquare.value = square
  if (submitted.value) return
  const next = new Set(selectedSquares.value)
  if (next.has(square)) next.delete(square)
  else next.add(square)
  selectedSquares.value = next
}

function submit() {
  submitted.value = true
  const graded = Object.entries(marks.value)
  inspectedSquare.value = (graded.find(([, mark]) => mark === 'wrong') ?? graded.find(([, mark]) => mark === 'missed'))?.[0]
}

function advance() {
  if (isLastStep.value) {
    router.push('/results')
    return
  }
  stepIndex.value += 1
  selectedSquares.value = new Set()
  submitted.value = false
  inspectedSquare.value = undefined
}

function handleKeydown(event: KeyboardEvent) {
  if (event.target instanceof HTMLElement && event.target.closest('[role="gridcell"]')) return
  if (event.key === 'Enter' && !submitted.value) {
    event.preventDefault()
    submit()
  } else if (event.key === ' ' && submitted.value) {
    event.preventDefault()
    advance()
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <div class="mb-5 flex items-center gap-4">
      <RouterLink
        to="/"
        class="grid size-8 place-items-center rounded-lg text-stone-500 hover:bg-stone-200/60 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100"
        aria-label="End session"
      >
        <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </RouterLink>
      <div class="flex-1">
        <div class="mb-1.5 flex justify-between text-xs font-medium text-stone-500 dark:text-stone-400">
          <span>Board scan · Level 1 · Untimed</span>
          <span class="tabular-nums">{{ boardScanItem.itemNumber }} / {{ boardScanItem.itemCount }}</span>
        </div>
        <div class="h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
          <div
            class="h-full rounded-full bg-accent transition-all"
            :style="{ width: `${((boardScanItem.itemNumber - 1) / boardScanItem.itemCount) * 100}%` }"
          />
        </div>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <div class="mx-auto w-full max-w-[min(100%,34rem)]">
        <ChessBoard
          :placement="placement"
          :marks="marks"
          :arrows="arrows"
          interactive
          @square-click="toggleSquare"
        />
      </div>

      <aside class="space-y-5">
        <StepIndicator :steps="boardScanItem.steps.map((step) => step.title)" :current-index="stepIndex" />

        <div>
          <p class="text-xs font-semibold tracking-wide text-stone-500 uppercase dark:text-stone-400">
            {{ toMove }} to move
          </p>
          <p class="mt-1 text-lg font-medium text-balance">{{ currentStep.prompt }}</p>
        </div>

        <div
          v-if="submitted"
          class="rounded-xl border border-stone-200 bg-white p-4 text-sm dark:border-stone-800 dark:bg-stone-900"
          aria-live="polite"
        >
          <p class="font-medium tabular-nums">
            {{ tally.found }} of {{ tally.total }} found<template v-if="tally.wrong"> · {{ tally.wrong }} wrong</template>
          </p>
          <FeedbackLegend class="mt-3" />
          <hr class="my-4 border-stone-200 dark:border-stone-800" />
          <HangingExplanation v-if="explanation?.kind === 'hanging'" :analysis="explanation.analysis" />
          <MovesExplanation v-else-if="explanation?.kind === 'moves'" :explanation="explanation" />
          <p class="mt-3 text-xs text-stone-500 dark:text-stone-400">Tap any piece to inspect.</p>
        </div>

        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-semibold text-accent-foreground shadow-sm transition hover:brightness-110 active:scale-[0.99]"
          @click="submitted ? advance() : submit()"
        >
          {{ submitted ? (isLastStep ? 'Finish item' : `Next: ${boardScanItem.steps[stepIndex + 1]?.title}`) : 'Check' }}
          <kbd class="hidden rounded bg-black/15 px-1.5 py-0.5 font-sans text-xs font-medium sm:inline">
            {{ submitted ? 'Space' : 'Enter' }}
          </kbd>
        </button>
      </aside>
    </div>
  </div>
</template>

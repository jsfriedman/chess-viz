<script setup lang="ts">
import { computed } from 'vue'
import {
  describePiece,
  displayPosition,
  isLightSquare,
  squaresInDisplayOrder,
  type BoardArrow,
  type Orientation,
  type Placement,
  type Square,
} from '@/chess/board'
import { pieceImageUrl } from '@/chess/pieceSets'
import MarkBadge from './MarkBadge.vue'

export type SquareMark = 'selected' | 'hint' | 'correct' | 'wrong' | 'missed'

const props = withDefaults(
  defineProps<{
    placement: Placement
    orientation?: Orientation
    marks?: Readonly<Record<Square, SquareMark>>
    arrows?: readonly BoardArrow[]
    interactive?: boolean
    showCoordinates?: boolean
  }>(),
  { orientation: 'white', marks: () => ({}), arrows: () => [], interactive: false, showCoordinates: true },
)

const emit = defineEmits<{ squareClick: [square: Square] }>()

const markColorVariable: Readonly<Record<SquareMark, string>> = {
  selected: 'var(--mark-selected)',
  hint: 'var(--accent)',
  correct: 'var(--mark-correct)',
  wrong: 'var(--mark-wrong)',
  missed: 'var(--mark-missed)',
}

const markLabel: Readonly<Record<SquareMark, string>> = {
  selected: 'selected',
  hint: 'highlighted',
  correct: 'correct',
  wrong: 'wrong',
  missed: 'missed',
}

const cells = computed(() =>
  squaresInDisplayOrder(props.orientation).map((square, index) => {
    const piece = props.placement[square]
    const mark = props.marks[square]
    const column = index % 8
    const row = Math.floor(index / 8)
    const description = [square, piece ? describePiece(piece) : 'empty', mark ? markLabel[mark] : '']
      .filter(Boolean)
      .join(', ')
    return { square, piece, mark, column, row, light: isLightSquare(square), description }
  }),
)

const arrowHeadLength = 0.3
const arrowTargetInset = 0.28

const arrowShapes = computed(() =>
  props.arrows.map((arrow) => {
    const from = displayPosition(arrow.from, props.orientation)
    const to = displayPosition(arrow.to, props.orientation)
    const deltaColumn = to.column - from.column
    const deltaRow = to.row - from.row
    return {
      key: `${arrow.kind}-${arrow.from}-${arrow.to}`,
      x: from.column + 0.5,
      y: from.row + 0.5,
      angle: (Math.atan2(deltaRow, deltaColumn) * 180) / Math.PI,
      length: Math.hypot(deltaColumn, deltaRow) - arrowTargetInset,
      color: arrow.kind === 'attack' ? 'var(--arrow-attack)' : 'var(--arrow-defend)',
      dashed: arrow.kind === 'defend',
    }
  }),
)

function handleKey(event: KeyboardEvent, square: Square) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('squareClick', square)
  }
}
</script>

<template>
  <svg
    viewBox="0 0 8 8"
    class="block aspect-square w-full touch-manipulation select-none rounded-lg shadow-lg shadow-black/10 ring-1 ring-black/5 dark:shadow-black/40"
    role="grid"
    aria-label="Chess board"
  >
    <g v-for="cell in cells" :key="cell.square" :transform="`translate(${cell.column} ${cell.row})`">
      <rect width="1" height="1" :fill="cell.light ? 'var(--board-light)' : 'var(--board-dark)'" />

      <template v-if="cell.mark">
        <rect
          v-if="cell.mark === 'selected'"
          x="0.04"
          y="0.04"
          width="0.92"
          height="0.92"
          rx="0.08"
          fill="none"
          :stroke="markColorVariable.selected"
          stroke-width="0.08"
          class="mark-pop"
        />
        <g v-else class="mark-fade">
          <rect width="1" height="1" :fill="markColorVariable[cell.mark]" opacity="0.5" />
          <rect
            v-if="cell.mark !== 'hint'"
            x="0.03"
            y="0.03"
            width="0.94"
            height="0.94"
            fill="none"
            :stroke="markColorVariable[cell.mark]"
            stroke-width="0.06"
          />
        </g>
      </template>

      <text
        v-if="showCoordinates && cell.column === 0"
        x="0.06"
        y="0.2"
        font-size="0.17"
        font-weight="600"
        :fill="cell.light ? 'var(--board-dark)' : 'var(--board-light)'"
      >
        {{ cell.square[1] }}
      </text>
      <text
        v-if="showCoordinates && cell.row === 7"
        x="0.94"
        y="0.94"
        font-size="0.17"
        font-weight="600"
        text-anchor="end"
        :fill="cell.light ? 'var(--board-dark)' : 'var(--board-light)'"
      >
        {{ cell.square[0] }}
      </text>

      <image v-if="cell.piece" :href="pieceImageUrl(cell.piece)" width="1" height="1" />

      <MarkBadge
        v-if="cell.mark && cell.mark !== 'selected' && cell.mark !== 'hint'"
        :mark="cell.mark"
        x="0.7"
        y="0.04"
        width="0.26"
        height="0.26"
        class="mark-pop"
      />

      <rect
        v-if="interactive"
        width="1"
        height="1"
        fill="transparent"
        class="cursor-pointer outline-none hover:fill-white/15 focus-visible:fill-white/25"
        role="gridcell"
        tabindex="0"
        :aria-label="cell.description"
        @click="emit('squareClick', cell.square)"
        @keydown="handleKey($event, cell.square)"
      />
    </g>

    <g class="pointer-events-none" aria-hidden="true">
      <g
        v-for="arrow in arrowShapes"
        :key="arrow.key"
        :transform="`translate(${arrow.x} ${arrow.y}) rotate(${arrow.angle})`"
        opacity="0.9"
        class="mark-fade"
      >
        <line
          x1="0"
          y1="0"
          :x2="arrow.length - arrowHeadLength"
          y2="0"
          :stroke="arrow.color"
          stroke-width="0.13"
          :stroke-dasharray="arrow.dashed ? '0.16 0.1' : undefined"
        />
        <polygon
          :points="`${arrow.length - arrowHeadLength},-0.21 ${arrow.length},0 ${arrow.length - arrowHeadLength},0.21`"
          :fill="arrow.color"
        />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.mark-pop {
  transform-box: fill-box;
  transform-origin: center;
  animation: pop 160ms ease-out;
}
.mark-fade {
  animation: fade 200ms ease-out;
}
@keyframes pop {
  from {
    transform: scale(0.6);
    opacity: 0;
  }
}
@keyframes fade {
  from {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .mark-pop,
  .mark-fade {
    animation: none;
  }
}
</style>

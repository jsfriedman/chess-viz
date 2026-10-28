<script setup lang="ts">
import { pieceName } from '@/chess/board'
import { pieceImageUrl } from '@/chess/pieceSets'
import type { BoardPiece } from '@/chess/position'

defineProps<{ target: BoardPiece; verdict: string; highlighted: boolean }>()
</script>

<template>
  <div class="flex items-center gap-2">
    <img :src="pieceImageUrl(target.piece)" alt="" class="size-8" />
    <p class="flex-1 font-medium capitalize">
      {{ pieceName(target.piece) }} <span class="font-mono text-stone-500 normal-case">{{ target.square }}</span>
    </p>
    <span
      class="rounded-full px-2 py-0.5 text-xs font-semibold"
      :class="
        highlighted
          ? 'bg-arrow-attack/15 text-arrow-attack'
          : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'
      "
    >
      {{ verdict }}
    </span>
  </div>
</template>

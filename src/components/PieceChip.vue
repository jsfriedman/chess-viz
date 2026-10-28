<script setup lang="ts">
import type { PieceCode } from '@/chess/board'
import { pieceImageUrl } from '@/chess/pieceSets'

defineProps<{ piece: PieceCode }>()
</script>

<template>
  <span class="flex items-center gap-0.5 rounded-md bg-stone-100 py-0.5 pr-1.5 pl-0.5 font-mono text-xs dark:bg-stone-800">
    <img :src="pieceImageUrl(piece)" alt="" class="size-5" />
    <slot />
  </span>
</template>

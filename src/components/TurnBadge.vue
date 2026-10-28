<script setup lang="ts">
import { colorName, type Color } from '@/chess/board'
import { pieceImageUrl } from '@/chess/pieceSets'

defineProps<{ color: Color }>()
</script>

<template>
  <p
    class="inline-flex items-center gap-1.5 rounded-full py-1 pr-3.5 pl-1.5 text-sm font-semibold shadow-sm ring-1"
    :class="
      color === 'w'
        ? 'bg-white text-stone-900 ring-stone-300 dark:ring-stone-500'
        : 'bg-stone-900 text-white ring-stone-900 dark:bg-black dark:ring-stone-600'
    "
  >
    <img :src="pieceImageUrl(`${color}K`)" alt="" class="size-6 rounded-full" :class="{ 'bg-stone-200': color === 'b' }" />
    {{ colorName(color) }} to move
  </p>
</template>

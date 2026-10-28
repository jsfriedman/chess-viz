<script setup lang="ts">
import type { Tally } from '@/drills/grading'

defineProps<{ tally: Tally }>()
</script>

<template>
  <p class="font-medium tabular-nums">
    {{ tally.found }} of {{ tally.total }} found<template v-if="tally.wrong"> · {{ tally.wrong }} wrong</template>
  </p>
</template>

<script setup lang="ts">
import DrillCard from '@/components/DrillCard.vue'
import { drills } from '@/drills/catalog'
</script>

<template>
  <section aria-labelledby="drills-heading">
    <h2 id="drills-heading" class="mb-3 text-sm font-medium text-stone-500 dark:text-stone-400">Drills</h2>
    <div class="grid gap-3 md:grid-cols-2">
      <DrillCard v-for="drill in drills" :key="drill.id" :drill="drill" />
    </div>
  </section>
</template>

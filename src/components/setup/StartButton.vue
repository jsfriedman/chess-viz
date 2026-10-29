<script setup lang="ts">
const emit = defineEmits<{ start: [] }>()
</script>

<template>
  <button
    type="button"
    class="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-accent-foreground shadow-sm transition hover:brightness-110 active:scale-[0.99]"
    @click="emit('start')"
  >
    Start
  </button>
</template>

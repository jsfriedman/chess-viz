<script setup lang="ts">
defineProps<{ submitted: boolean; advanceLabel: string }>()
const emit = defineEmits<{ check: []; advance: [] }>()
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-semibold text-accent-foreground shadow-sm transition hover:brightness-110 active:scale-[0.99]"
    @click="submitted ? emit('advance') : emit('check')"
  >
    {{ submitted ? advanceLabel : 'Check' }}
    <kbd class="hidden rounded bg-black/15 px-1.5 py-0.5 font-sans text-xs font-medium sm:inline">
      {{ submitted ? 'Space' : 'Enter' }}
    </kbd>
  </button>
</template>

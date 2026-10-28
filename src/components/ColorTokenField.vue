<script setup lang="ts">
import { ref, watch } from 'vue'
import { isHexColor } from '@/theme/tokens'

const props = defineProps<{ label: string; value: string; flagged: boolean }>()
const emit = defineEmits<{ change: [value: string] }>()

const draft = ref(props.value)
watch(
  () => props.value,
  (value) => (draft.value = value),
)

function commitDraft() {
  const normalized = draft.value.trim().startsWith('#') ? draft.value.trim() : `#${draft.value.trim()}`
  if (isHexColor(normalized)) emit('change', normalized)
  else draft.value = props.value
}
</script>

<template>
  <label class="flex items-center gap-3 py-2">
    <span class="relative size-9 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/10 dark:ring-white/10">
      <input
        type="color"
        :value="value"
        class="absolute -inset-2 size-[calc(100%+1rem)] cursor-pointer"
        :aria-label="`${label} color picker`"
        @input="emit('change', ($event.target as HTMLInputElement).value)"
      />
    </span>
    <span class="flex-1 text-sm font-medium">
      {{ label }}
      <span v-if="flagged" class="ml-1 text-xs font-normal text-amber-600 dark:text-amber-400">low contrast</span>
    </span>
    <input
      v-model="draft"
      type="text"
      spellcheck="false"
      maxlength="7"
      class="w-24 rounded-lg border border-stone-300 bg-transparent px-2 py-1.5 font-mono text-sm uppercase focus:border-accent focus:outline-none dark:border-stone-700"
      :aria-label="`${label} hex code`"
      @change="commitDraft"
      @keydown.enter="commitDraft"
    />
  </label>
</template>

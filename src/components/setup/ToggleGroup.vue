<script setup lang="ts" generic="Value extends string">
export interface ToggleOption<Value> {
  value: Value
  label: string
  icon?: string
}

defineProps<{ legend: string; options: readonly ToggleOption<Value>[]; selected: readonly Value[]; columns?: number }>()
const emit = defineEmits<{ toggle: [value: Value] }>()
</script>

<template>
  <fieldset>
    <legend class="mb-3 text-sm font-medium text-stone-500 dark:text-stone-400">{{ legend }}</legend>
    <div class="grid gap-2" :style="{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))` }">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        role="switch"
        :aria-checked="selected.includes(option.value)"
        :aria-label="option.label"
        :title="option.icon ? option.label : undefined"
        class="flex items-center justify-center rounded-xl border font-medium transition-colors"
        :class="[
          option.icon ? 'aspect-square p-1.5' : 'px-4 py-3',
          selected.includes(option.value)
            ? 'border-accent bg-accent/10 text-stone-900 dark:text-stone-100'
            : 'border-stone-200 bg-white text-stone-500 opacity-60 hover:border-stone-300 hover:opacity-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400',
        ]"
        @click="emit('toggle', option.value)"
      >
        <img v-if="option.icon" :src="option.icon" alt="" class="size-full max-w-12" />
        <template v-else>{{ option.label }}</template>
      </button>
    </div>
  </fieldset>
</template>

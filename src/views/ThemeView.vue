<script setup lang="ts">
import { computed } from 'vue'
import ChessBoard, { type SquareMark } from '@/components/ChessBoard.vue'
import ColorTokenField from '@/components/ColorTokenField.vue'
import FeedbackLegend from '@/components/FeedbackLegend.vue'
import { parsePlacement } from '@/chess/board'
import { findContrastWarnings } from '@/theme/contrast'
import { colorPresets, defaultPreset } from '@/theme/presets'
import { useThemeStore } from '@/theme/themeStore'
import { colorTokenInfo, colorTokenKeys, type ColorTokenKey } from '@/theme/tokens'

const themeStore = useThemeStore()

const previewPlacement = parsePlacement('r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4')
const previewMarks: Record<string, SquareMark> = { h5: 'correct', c4: 'missed', f6: 'wrong', e4: 'selected' }

const warnings = computed(() => findContrastWarnings(themeStore.colors))
const flaggedTokens = computed(() => new Set(warnings.value.flatMap((warning) => warning.tokens)))

const tokenGroups = computed(() =>
  (['Board', 'Feedback', 'Arrows', 'Interface'] as const).map((group) => ({
    group,
    keys: colorTokenKeys.filter((key) => colorTokenInfo[key].group === group),
  })),
)

function setColor(key: ColorTokenKey, value: string) {
  themeStore.setColor(key, value)
}
</script>

<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-semibold tracking-tight">Colors</h1>

    <section aria-labelledby="presets-heading">
      <h2 id="presets-heading" class="mb-3 text-sm font-medium text-stone-500 dark:text-stone-400">Presets</h2>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <button
          v-for="preset in colorPresets"
          :key="preset.id"
          type="button"
          class="rounded-xl border bg-white p-2.5 text-left transition hover:border-accent/60 dark:bg-stone-900"
          :class="
            themeStore.activePresetId === preset.id
              ? 'border-accent ring-2 ring-accent/30'
              : 'border-stone-200 dark:border-stone-800'
          "
          :aria-pressed="themeStore.activePresetId === preset.id"
          @click="themeStore.applyPreset(preset.id)"
        >
          <span class="mb-2 grid grid-cols-4 overflow-hidden rounded-md">
            <span class="h-5" :style="{ background: preset.colors.boardLight }" />
            <span class="h-5" :style="{ background: preset.colors.boardDark }" />
            <span class="h-5" :style="{ background: preset.colors.correct }" />
            <span class="h-5" :style="{ background: preset.colors.wrong }" />
          </span>
          <span class="block text-sm font-medium">{{ preset.name }}</span>
          <span v-if="preset.note" class="block text-xs text-stone-500 dark:text-stone-400">{{ preset.note }}</span>
        </button>
      </div>
    </section>

    <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <section aria-labelledby="custom-heading" class="order-2 lg:order-1">
        <div class="mb-3 flex items-center justify-between">
          <h2 id="custom-heading" class="text-sm font-medium text-stone-500 dark:text-stone-400">
            Custom
            <span v-if="themeStore.activePresetId === 'custom'" class="ml-1 rounded-full bg-accent/15 px-2 py-0.5 text-xs text-stone-700 dark:text-stone-200">
              active
            </span>
          </h2>
          <button
            type="button"
            class="text-sm font-medium text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
            @click="themeStore.applyPreset(defaultPreset.id)"
          >
            Reset
          </button>
        </div>
        <div class="space-y-4">
          <div
            v-for="tokenGroup in tokenGroups"
            :key="tokenGroup.group"
            class="rounded-2xl border border-stone-200 bg-white px-4 py-2 dark:border-stone-800 dark:bg-stone-900"
          >
            <p class="pt-2 text-xs font-semibold tracking-wide text-stone-400 uppercase">{{ tokenGroup.group }}</p>
            <ColorTokenField
              v-for="key in tokenGroup.keys"
              :key="key"
              :label="colorTokenInfo[key].label"
              :value="themeStore.colors[key]"
              :flagged="flaggedTokens.has(key)"
              @change="setColor(key, $event)"
            />
          </div>
        </div>
      </section>

      <aside class="order-1 space-y-4 lg:sticky lg:top-20 lg:order-2">
        <div class="mx-auto max-w-[17rem] lg:max-w-sm">
          <ChessBoard :placement="previewPlacement" :marks="previewMarks" />
        </div>
        <FeedbackLegend class="justify-center" />
        <div
          v-if="warnings.length"
          class="rounded-xl border border-amber-300/70 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
          role="status"
        >
          <ul class="list-disc space-y-0.5 pl-5">
            <li v-for="warning in warnings" :key="warning.message">{{ warning.message }}</li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

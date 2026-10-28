import { defineStore } from 'pinia'
import { computed, ref, watchEffect } from 'vue'
import { readStored, writeStored } from '@/storage'
import { readableTextColor } from './contrast'
import { colorPresets, defaultPreset } from './presets'
import { colorTokenInfo, colorTokenKeys, isHexColor, type ColorTheme, type ColorTokenKey } from './tokens'

export type AppearanceMode = 'system' | 'light' | 'dark'

interface StoredTheme {
  appearance: AppearanceMode
  colors: Partial<Record<ColorTokenKey, unknown>>
}

const storageKey = 'theme'
const appearanceModes: readonly AppearanceMode[] = ['system', 'light', 'dark']

function isStoredTheme(value: unknown): value is StoredTheme {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<StoredTheme>
  return (
    appearanceModes.includes(candidate.appearance as AppearanceMode) &&
    typeof candidate.colors === 'object' &&
    candidate.colors !== null
  )
}

// Tokens added after a theme was saved fall back to the default preset
function withDefaults(storedColors: StoredTheme['colors'] | undefined): ColorTheme {
  return Object.fromEntries(
    colorTokenKeys.map((key) => {
      const value = storedColors?.[key]
      return [key, typeof value === 'string' && isHexColor(value) ? value : defaultPreset.colors[key]]
    }),
  ) as ColorTheme
}

export const useThemeStore = defineStore('theme', () => {
  const stored = readStored(storageKey, isStoredTheme)
  const appearance = ref<AppearanceMode>(stored?.appearance ?? 'system')
  const colors = ref<ColorTheme>(withDefaults(stored?.colors))

  const activePresetId = computed(
    () =>
      colorPresets.find((preset) => colorTokenKeys.every((key) => preset.colors[key] === colors.value[key]))?.id ??
      'custom',
  )

  function setColor(key: ColorTokenKey, value: string) {
    if (!isHexColor(value)) return
    colors.value = { ...colors.value, [key]: value.toLowerCase() }
  }

  function applyPreset(presetId: string) {
    const preset = colorPresets.find((candidate) => candidate.id === presetId)
    if (preset) colors.value = preset.colors
  }

  function setAppearance(mode: AppearanceMode) {
    appearance.value = mode
  }

  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)')
  const systemDark = ref(systemPrefersDark.matches)
  systemPrefersDark.addEventListener('change', (event) => (systemDark.value = event.matches))

  const isDark = computed(() => appearance.value === 'dark' || (appearance.value === 'system' && systemDark.value))

  watchEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', isDark.value)
    colorTokenKeys.forEach((key) => root.style.setProperty(colorTokenInfo[key].cssVariable, colors.value[key]))
    root.style.setProperty('--accent-foreground', readableTextColor(colors.value.accent))
    writeStored(storageKey, { appearance: appearance.value, colors: colors.value })
  })

  return { appearance, colors, activePresetId, isDark, setColor, applyPreset, setAppearance }
})

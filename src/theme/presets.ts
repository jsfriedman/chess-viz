import type { ColorTheme } from './tokens'

export interface ColorPreset {
  id: string
  name: string
  note?: string
  colors: ColorTheme
}

export const colorPresets: readonly ColorPreset[] = [
  {
    id: 'default',
    name: 'Default',
    colors: {
      boardLight: '#ebecd0',
      boardDark: '#739552',
      selected: '#3b82f6',
      correct: '#16a34a',
      wrong: '#dc2626',
      missed: '#f59e0b',
      attack: '#e8590c',
      defend: '#1c7ed6',
      accent: '#0f766e',
    },
  },
  {
    id: 'protanopia',
    name: 'Protanopia',
    note: 'Also protanomaly',
    colors: {
      boardLight: '#e9e7e1',
      boardDark: '#8c94a3',
      selected: '#f0e442',
      correct: '#0072b2',
      wrong: '#e69f00',
      missed: '#cc79a7',
      attack: '#e69f00',
      defend: '#0072b2',
      accent: '#0072b2',
    },
  },
  {
    id: 'deuteranopia',
    name: 'Deuteranopia',
    note: 'Also deuteranomaly',
    colors: {
      boardLight: '#ece8df',
      boardDark: '#9a8f86',
      selected: '#f0e442',
      correct: '#0072b2',
      wrong: '#d55e00',
      missed: '#cc79a7',
      attack: '#d55e00',
      defend: '#0072b2',
      accent: '#0072b2',
    },
  },
  {
    id: 'tritanopia',
    name: 'Tritanopia',
    note: 'Also tritanomaly',
    colors: {
      boardLight: '#f1e6e6',
      boardDark: '#a37b7b',
      selected: '#262626',
      correct: '#0e9488',
      wrong: '#e11d48',
      missed: '#f472b6',
      attack: '#e11d48',
      defend: '#0e9488',
      accent: '#0e7490',
    },
  },
  {
    id: 'grayscale',
    name: 'Grayscale',
    colors: {
      boardLight: '#e6e6e6',
      boardDark: '#9e9e9e',
      selected: '#3f3f3f',
      correct: '#141414',
      wrong: '#6b6b6b',
      missed: '#c8c8c8',
      attack: '#1f1f1f',
      defend: '#5c5c5c',
      accent: '#3f3f3f',
    },
  },
  {
    id: 'high-contrast',
    name: 'High contrast',
    colors: {
      boardLight: '#ffffff',
      boardDark: '#7a7a7a',
      selected: '#ffd400',
      correct: '#00a63e',
      wrong: '#e7000b',
      missed: '#155dfc',
      attack: '#e7000b',
      defend: '#155dfc',
      accent: '#155dfc',
    },
  },
]

export const defaultPreset: ColorPreset = colorPresets[0]!

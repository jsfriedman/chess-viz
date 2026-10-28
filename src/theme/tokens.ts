export const colorTokenKeys = [
  'boardLight',
  'boardDark',
  'selected',
  'correct',
  'wrong',
  'missed',
  'attack',
  'defend',
  'accent',
] as const

export type ColorTokenKey = (typeof colorTokenKeys)[number]
export type ColorTheme = Readonly<Record<ColorTokenKey, string>>

export interface ColorTokenInfo {
  label: string
  cssVariable: string
  group: 'Board' | 'Feedback' | 'Arrows' | 'Interface'
}

export const colorTokenInfo: Readonly<Record<ColorTokenKey, ColorTokenInfo>> = {
  boardLight: { label: 'Light squares', cssVariable: '--board-light', group: 'Board' },
  boardDark: { label: 'Dark squares', cssVariable: '--board-dark', group: 'Board' },
  selected: { label: 'Selected', cssVariable: '--mark-selected', group: 'Feedback' },
  correct: { label: 'Correct', cssVariable: '--mark-correct', group: 'Feedback' },
  wrong: { label: 'Wrong', cssVariable: '--mark-wrong', group: 'Feedback' },
  missed: { label: 'Missed', cssVariable: '--mark-missed', group: 'Feedback' },
  attack: { label: 'Attackers', cssVariable: '--arrow-attack', group: 'Arrows' },
  defend: { label: 'Defenders', cssVariable: '--arrow-defend', group: 'Arrows' },
  accent: { label: 'Accent', cssVariable: '--accent', group: 'Interface' },
}

const hexColorPattern = /^#[0-9a-f]{6}$/i

export function isHexColor(value: string): boolean {
  return hexColorPattern.test(value)
}

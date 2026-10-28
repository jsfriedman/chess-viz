import { colorTokenInfo, type ColorTheme, type ColorTokenKey } from './tokens'

interface Rgb {
  red: number
  green: number
  blue: number
}

export interface ContrastWarning {
  tokens: readonly ColorTokenKey[]
  message: string
}

const whitePiece = '#ffffff'
const blackPiece = '#000000'
const minimumSquareContrast = 1.35
const minimumBlackPieceContrast = 2.5
const minimumWhitePieceContrast = 1.1
// CIE76 distance below which two colors read as "the same" at a glance
const minimumColorDistance = 22

function hexToRgb(hex: string): Rgb {
  const value = Number.parseInt(hex.slice(1), 16)
  return { red: (value >> 16) & 255, green: (value >> 8) & 255, blue: value & 255 }
}

function toLinear(channel: number): number {
  const normalized = channel / 255
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: string): number {
  const { red, green, blue } = hexToRgb(hex)
  return 0.2126 * toLinear(red) + 0.7152 * toLinear(green) + 0.0722 * toLinear(blue)
}

export function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a)
  return (lighter! + 0.05) / (darker! + 0.05)
}

function toLab(hex: string): [number, number, number] {
  const { red, green, blue } = hexToRgb(hex)
  const [r, g, b] = [toLinear(red), toLinear(green), toLinear(blue)]
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883
  const pivot = (value: number) => (value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116)
  const [fx, fy, fz] = [pivot(x), pivot(y), pivot(z)]
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

export function colorDistance(first: string, second: string): number {
  const [l1, a1, b1] = toLab(first)
  const [l2, a2, b2] = toLab(second)
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2)
}

export function readableTextColor(background: string): string {
  return contrastRatio(background, whitePiece) >= contrastRatio(background, blackPiece) ? whitePiece : blackPiece
}

const feedbackTokens: readonly ColorTokenKey[] = ['selected', 'correct', 'wrong', 'missed']

export function findContrastWarnings(theme: ColorTheme): ContrastWarning[] {
  const warnings: ContrastWarning[] = []

  if (contrastRatio(theme.boardLight, theme.boardDark) < minimumSquareContrast) {
    warnings.push({
      tokens: ['boardLight', 'boardDark'],
      message: 'Light and dark squares are hard to tell apart.',
    })
  }
  if (contrastRatio(theme.boardDark, blackPiece) < minimumBlackPieceContrast) {
    warnings.push({ tokens: ['boardDark'], message: 'Black pieces may blend into dark squares.' })
  }
  if (contrastRatio(theme.boardLight, whitePiece) < minimumWhitePieceContrast) {
    warnings.push({ tokens: ['boardLight'], message: 'White pieces may blend into light squares.' })
  }

  feedbackTokens.forEach((token, index) => {
    feedbackTokens.slice(index + 1).forEach((other) => {
      if (colorDistance(theme[token], theme[other]) < minimumColorDistance) {
        warnings.push({
          tokens: [token, other],
          message: `${colorTokenInfo[token].label} and ${colorTokenInfo[other].label} look too similar.`,
        })
      }
    })
    const closestSquare = (['boardLight', 'boardDark'] as const).find(
      (square) => colorDistance(theme[token], theme[square]) < minimumColorDistance,
    )
    if (closestSquare) {
      warnings.push({
        tokens: [token, closestSquare],
        message: `${colorTokenInfo[token].label} is close to the ${colorTokenInfo[closestSquare].label.toLowerCase()}.`,
      })
    }
  })

  if (colorDistance(theme.attack, theme.defend) < minimumColorDistance) {
    warnings.push({ tokens: ['attack', 'defend'], message: 'Attacker and defender arrows look too similar.' })
  }

  return warnings
}

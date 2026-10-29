import { positionTags, type PositionTag } from '../../chess/features'
import type { ScanStepId } from '../../chess/explain'
import { isDifficulty, type Difficulty } from '../difficulty'
import { sample, shuffle, type Random } from '../random'

export interface ScanPosition {
  fen: string
  // "p:<puzzle id>" or "g:<game id>" on lichess.org
  origin: string
  difficulty: Difficulty
  checks: number
  captures: number
  hanging: number
  tags: PositionTag[]
}

export interface ScanPositionPack {
  source: string
  positions: ScanPosition[]
}

const isCount = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 0

function isScanPosition(value: unknown): value is ScanPosition {
  if (typeof value !== 'object' || value === null) return false
  const entry = value as Record<string, unknown>
  return (
    typeof entry.fen === 'string' &&
    typeof entry.origin === 'string' &&
    isDifficulty(entry.difficulty) &&
    isCount(entry.checks) &&
    isCount(entry.captures) &&
    isCount(entry.hanging) &&
    Array.isArray(entry.tags) &&
    entry.tags.every((tag) => positionTags.includes(tag))
  )
}

export function parsePositionPack(value: unknown): ScanPosition[] {
  const positions = (value as Partial<ScanPositionPack> | null)?.positions
  if (!Array.isArray(positions)) throw new Error('Position pack has no positions list')
  const valid = positions.filter(isScanPosition)
  if (valid.length < positions.length) console.warn(`Ignored ${positions.length - valid.length} malformed positions`)
  return valid
}

const emptyShare = 0.1

// Mostly positions with something to find for the chosen steps, plus the occasional empty one
export function choosePositions(
  positions: readonly ScanPosition[],
  difficulty: Difficulty,
  steps: readonly ScanStepId[],
  count: number,
  random: Random,
): ScanPosition[] {
  const tier = positions.filter((position) => position.difficulty === difficulty)
  const hasAnswer = (position: ScanPosition) => steps.some((step) => position[step] > 0)
  const withAnswers = sample(tier.filter(hasAnswer), count - Math.round(count * emptyShare), random)
  const empty = sample(
    tier.filter((position) => !hasAnswer(position)),
    count - withAnswers.length,
    random,
  )
  return shuffle([...withAnswers, ...empty], random)
}

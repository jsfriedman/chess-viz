export interface StepResult {
  step: string
  found: number
  total: number
  wrong: number
}

export interface ItemResult {
  fen: string
  steps: readonly StepResult[]
  seconds: number
}

export interface StepSummary {
  step: string
  found: number
  total: number
  wrong: number
  accuracy: number
}

export interface SessionSummary {
  itemCount: number
  perfectItems: number
  accuracy: number
  averageSeconds: number
  steps: readonly StepSummary[]
  itemsPerfect: readonly boolean[]
}

// Correct marks out of everything that should have been marked plus everything wrongly marked
function accuracyOf(results: readonly StepResult[]): number {
  const found = results.reduce((sum, result) => sum + result.found, 0)
  const attempts = results.reduce((sum, result) => sum + result.total + result.wrong, 0)
  return attempts === 0 ? 100 : Math.round((found / attempts) * 100)
}

const isPerfect = (result: StepResult) => result.found === result.total && result.wrong === 0

export function summarizeSession(items: readonly ItemResult[]): SessionSummary {
  const allSteps = items.flatMap((item) => item.steps)
  const stepIds = [...new Set(allSteps.map((result) => result.step))]
  const itemsPerfect = items.map((item) => item.steps.every(isPerfect))
  const totalSeconds = items.reduce((sum, item) => sum + item.seconds, 0)

  return {
    itemCount: items.length,
    perfectItems: itemsPerfect.filter(Boolean).length,
    accuracy: accuracyOf(allSteps),
    averageSeconds: items.length === 0 ? 0 : Math.round((totalSeconds / items.length) * 10) / 10,
    itemsPerfect,
    steps: stepIds.map((step) => {
      const results = allSteps.filter((result) => result.step === step)
      return {
        step,
        found: results.reduce((sum, result) => sum + result.found, 0),
        total: results.reduce((sum, result) => sum + result.total, 0),
        wrong: results.reduce((sum, result) => sum + result.wrong, 0),
        accuracy: accuracyOf(results),
      }
    }),
  }
}

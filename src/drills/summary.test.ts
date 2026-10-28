import { describe, expect, it } from 'vitest'
import { summarizeSession, type ItemResult } from './summary'

const items: ItemResult[] = [
  {
    fen: 'a',
    seconds: 10,
    steps: [
      { step: 'checks', found: 2, total: 2, wrong: 0 },
      { step: 'hanging', found: 1, total: 2, wrong: 1 },
    ],
  },
  {
    fen: 'b',
    seconds: 5,
    steps: [
      { step: 'checks', found: 0, total: 0, wrong: 0 },
      { step: 'hanging', found: 1, total: 1, wrong: 0 },
    ],
  },
]

describe('summarizeSession', () => {
  it('counts perfect positions and averages time', () => {
    expect(summarizeSession(items)).toMatchObject({
      itemCount: 2,
      perfectItems: 1,
      itemsPerfect: [false, true],
      averageSeconds: 7.5,
    })
  })

  it('scores accuracy as correct marks over answers plus wrong marks', () => {
    const summary = summarizeSession(items)
    expect(summary.accuracy).toBe(Math.round((4 / 6) * 100))
    expect(summary.steps).toEqual([
      { step: 'checks', found: 2, total: 2, wrong: 0, accuracy: 100 },
      { step: 'hanging', found: 2, total: 3, wrong: 1, accuracy: 50 },
    ])
  })

  it('treats a step with nothing to find and nothing marked as perfect', () => {
    expect(summarizeSession([items[1]!]).accuracy).toBe(100)
  })
})

export const difficulties = [1, 2, 3, 4, 5] as const
export type Difficulty = (typeof difficulties)[number]

export const isDifficulty = (value: unknown): value is Difficulty => difficulties.includes(value as Difficulty)

export type Random = () => number

export function pick<T>(items: readonly T[], random: Random): T {
  if (items.length === 0) throw new Error('Cannot pick from an empty list')
  return items[Math.floor(random() * items.length)]!
}

export function shuffle<T>(items: readonly T[], random: Random): T[] {
  return items
    .map((item) => ({ item, key: random() }))
    .sort((first, second) => first.key - second.key)
    .map(({ item }) => item)
}

export function sample<T>(items: readonly T[], count: number, random: Random): T[] {
  return shuffle(items, random).slice(0, count)
}

// Deterministic generator for tests and reproducible builds
export function seededRandom(seed: number): Random {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 2 ** 32
  }
}

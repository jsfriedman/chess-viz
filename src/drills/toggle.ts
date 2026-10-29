// Adds or removes an option, keeping canonical order and at least one selection
export function toggled<T>(selected: readonly T[], option: T, order: readonly T[]): readonly T[] {
  const next = selected.includes(option) ? selected.filter((existing) => existing !== option) : [...selected, option]
  if (next.length === 0) return selected
  return order.filter((known) => next.includes(known))
}

const keyPrefix = 'chess-viz:'

export function readStored<T>(key: string, isValid: (value: unknown) => value is T): T | undefined {
  try {
    const raw = localStorage.getItem(keyPrefix + key)
    if (raw === null) return undefined
    const parsed: unknown = JSON.parse(raw)
    return isValid(parsed) ? parsed : undefined
  } catch (error) {
    console.warn(`Could not read stored "${key}"`, error)
    return undefined
  }
}

export function writeStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(keyPrefix + key, JSON.stringify(value))
  } catch (error) {
    console.warn(`Could not save "${key}"`, error)
  }
}

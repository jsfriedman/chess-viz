import { onBeforeUnmount, onMounted } from 'vue'

interface ExerciseKeyHandlers {
  isSubmitted: () => boolean
  submit: () => void
  advance: () => void
  undo?: () => void
}

// Enter checks, Space advances, Backspace undoes; focused squares keep Enter/Space for selection
export function useExerciseKeys({ isSubmitted, submit, advance, undo }: ExerciseKeyHandlers) {
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Backspace' && undo && !isSubmitted()) {
      event.preventDefault()
      undo()
      return
    }
    if (event.target instanceof HTMLElement && event.target.closest('[role="gridcell"]')) return
    if (event.key === 'Enter' && !isSubmitted()) {
      event.preventDefault()
      submit()
    } else if (event.key === ' ' && isSubmitted()) {
      event.preventDefault()
      advance()
    }
  }

  onMounted(() => window.addEventListener('keydown', handleKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
}

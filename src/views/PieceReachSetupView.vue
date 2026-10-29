<script setup lang="ts">
import { useRouter } from 'vue-router'
import DifficultyPicker from '@/components/setup/DifficultyPicker.vue'
import StartButton from '@/components/setup/StartButton.vue'
import ToggleGroup, { type ToggleOption } from '@/components/setup/ToggleGroup.vue'
import { pieceName, type PieceType } from '@/chess/board'
import { pieceImageUrl } from '@/chess/pieceSets'
import { pieceTypes, type PieceReachMode } from '@/drills/pieceReach/items'
import { usePieceReachSession } from '@/drills/pieceReach/sessionStore'
import { usePieceReachSettings } from '@/drills/pieceReach/settingsStore'

const router = useRouter()
const settingsStore = usePieceReachSettings()
const session = usePieceReachSession()

const modeOptions: readonly ToggleOption<PieceReachMode>[] = [
  { value: 'reach', label: 'Reach' },
  { value: 'path', label: 'Path' },
]

const pieceOptions: readonly ToggleOption<PieceType>[] = pieceTypes.map((type) => ({
  value: type,
  label: pieceName(`w${type}`),
  icon: pieceImageUrl(`w${type}`),
}))

function start() {
  session.start()
  router.push('/train/piece-reach/session')
}
</script>

<template>
  <div class="mx-auto max-w-md space-y-8">
    <h1 class="text-2xl font-semibold tracking-tight">Piece reach</h1>
    <ToggleGroup
      legend="Modes"
      :options="modeOptions"
      :selected="settingsStore.settings.modes"
      @toggle="settingsStore.toggleMode"
    />
    <ToggleGroup
      legend="Pieces"
      :options="pieceOptions"
      :selected="settingsStore.settings.pieces"
      @toggle="settingsStore.togglePiece"
    />
    <DifficultyPicker :selected="settingsStore.settings.difficulty" @select="settingsStore.setDifficulty" />
    <StartButton @start="start" />
  </div>
</template>

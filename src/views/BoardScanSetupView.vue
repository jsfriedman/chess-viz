<script setup lang="ts">
import { useRouter } from 'vue-router'
import DifficultyPicker from '@/components/setup/DifficultyPicker.vue'
import StartButton from '@/components/setup/StartButton.vue'
import ToggleGroup, { type ToggleOption } from '@/components/setup/ToggleGroup.vue'
import type { ScanStepId } from '@/chess/explain'
import { useBoardScanSession } from '@/drills/boardScan/sessionStore'
import { useBoardScanSettings } from '@/drills/boardScan/settingsStore'
import { scanSteps } from '@/drills/boardScan/steps'

const router = useRouter()
const settingsStore = useBoardScanSettings()
const session = useBoardScanSession()

const stepOptions: readonly ToggleOption<ScanStepId>[] = scanSteps.map((step) => ({ value: step.id, label: step.title }))

function start() {
  session.start()
  router.push('/train/board-scan/session')
}
</script>

<template>
  <div class="mx-auto max-w-md space-y-8">
    <h1 class="text-2xl font-semibold tracking-tight">Board scan</h1>
    <ToggleGroup
      legend="Steps"
      :options="stepOptions"
      :selected="settingsStore.settings.steps"
      @toggle="settingsStore.toggleStep"
    />
    <DifficultyPicker :selected="settingsStore.settings.difficulty" @select="settingsStore.setDifficulty" />
    <StartButton @start="start" />
  </div>
</template>

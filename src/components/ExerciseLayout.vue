<template>
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
    <div class="mx-auto w-full max-w-[min(100%,34rem)] space-y-3">
      <slot name="board" />
    </div>
    <aside class="space-y-5">
      <slot />
    </aside>
  </div>
</template>

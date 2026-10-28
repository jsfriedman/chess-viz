import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

// Hash history: GitHub Pages has no SPA fallback for deep links
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/train/board-scan', name: 'board-scan', component: () => import('./views/BoardScanSessionView.vue') },
    { path: '/train/piece-reach', name: 'piece-reach', component: () => import('./views/PieceReachSetupView.vue') },
    {
      path: '/train/piece-reach/session',
      name: 'piece-reach-session',
      component: () => import('./views/PieceReachSessionView.vue'),
    },
    { path: '/results/:drill', name: 'results', component: () => import('./views/ResultsView.vue') },
    { path: '/theme', name: 'theme', component: () => import('./views/ThemeView.vue') },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

<template>
  <div id="app-root">
    <RouterView />
    <DemoPanel />
    <SessionGuide v-if="sessionStore.showGuide && sessionStore.safetyStatus !== 'SAFETY_OVERRIDE'" />
    <SafetyOverlay v-if="sessionStore.safetyStatus === 'SAFETY_OVERRIDE'" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/sessionStore'
import { useDemoStore } from '@/stores/demoStore'
import DemoPanel from '@/components/DemoPanel.vue'
import SessionGuide from '@/components/SessionGuide.vue'
import SafetyOverlay from '@/components/SafetyOverlay.vue'

const sessionStore = useSessionStore()
const demoStore = useDemoStore()
const router = useRouter()

// Global route listener for journey tracking
router.afterEach((to) => {
  sessionStore.trackEvent('PAGE_VIEW', { path: to.path, name: to.name || to.path })
})

function onPopState() {
  sessionStore.trackEvent('BACK_NAVIGATION', { source: 'browser_back' })
}

onMounted(() => {
  window.addEventListener('popstate', onPopState)
  const demo = new URLSearchParams(window.location.search).get('demo')
  if (demo) demoStore.applyPreset(demo)
})

onUnmounted(() => {
  window.removeEventListener('popstate', onPopState)
})
</script>

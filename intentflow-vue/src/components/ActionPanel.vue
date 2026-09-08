<template>
  <div class="action-panel" :class="{ 'panel-safety': sessionStore.safetyStatus === 'SAFETY_OVERRIDE' }">
    <!-- Header -->
    <div class="ap-header">
      <span class="ap-title">YOUR SELECTION</span>
      <RouterLink to="/session-quality" class="ap-quality-link">Session Quality →</RouterLink>
    </div>

    <!-- Empty state -->
    <div v-if="!sessionStore.selectedEvent" class="ap-empty">
      <div class="ap-empty-icon">🎯</div>
      <p class="ap-empty-title">Your selection is empty</p>
      <p class="ap-empty-sub">Explore an event and select an option to start building your journey.</p>
      <RouterLink to="/" class="btn btn-outline btn-sm btn-full mt-2">Explore Events</RouterLink>
    </div>

    <!-- Selected event -->
    <div v-else class="ap-selection anim-fade-up">
      <div class="ap-event-badge">{{ sessionStore.selectedEvent.sport }}</div>
      <div class="ap-teams">
        <span class="ap-team-home">{{ sessionStore.selectedEvent.homeTeam }}</span>
        <span class="ap-vs">vs</span>
        <span class="ap-team-away">{{ sessionStore.selectedEvent.awayTeam }}</span>
      </div>
      <div class="ap-league">{{ sessionStore.selectedEvent.league }}</div>
      <div class="ap-actions">
        <RouterLink to="/review" class="btn btn-primary btn-full" @click="onReview">Review Selection</RouterLink>
        <RouterLink to="/compare" class="btn btn-outline btn-sm btn-full" @click="onCompare">⚖️ Compare Options</RouterLink>
        <button class="btn btn-ghost btn-sm btn-full" @click="clearSelection">Clear</button>
      </div>
    </div>

    <div class="ap-divider"></div>

    <!-- Session Decision Twin -->
    <SessionDecisionTwin />
  </div>
</template>

<script setup>
import { useSessionStore } from '@/stores/sessionStore'
import SessionDecisionTwin from './SessionDecisionTwin.vue'

const sessionStore = useSessionStore()

function onReview() {
  sessionStore.trackEvent('CONFIRMATION_OPENED')
}
function onCompare() {
  sessionStore.trackEvent('COMPARE_OPENED')
}
function clearSelection() {
  sessionStore.selectEvent(null)
}
</script>

<style scoped>
.action-panel {
  background: var(--bg-sidebar); border-left: 1px solid var(--border-subtle);
  height: 100%; overflow-y: auto; padding: var(--sp-4);
  display: flex; flex-direction: column; gap: var(--sp-4);
  transition: all var(--t-base);
}
.panel-safety { border-left-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.03); }
.ap-header { display: flex; align-items: center; justify-content: space-between; }
.ap-title { font-size: var(--text-xs); font-weight: 800; letter-spacing: 0.1em; color: var(--text-muted); text-transform: uppercase; }
.ap-quality-link { font-size: var(--text-xs); color: var(--text-accent); text-decoration: none; }
.ap-quality-link:hover { text-decoration: underline; }

.ap-empty { display: flex; flex-direction: column; align-items: center; text-align: center; gap: var(--sp-3); padding: var(--sp-6) var(--sp-2); }
.ap-empty-icon { font-size: 2.5rem; }
.ap-empty-title { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); }
.ap-empty-sub { font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5; }

.ap-selection { display: flex; flex-direction: column; gap: var(--sp-3); }
.ap-event-badge { font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-primary-light); background: rgba(26,115,232,0.12); border-radius: var(--r-full); padding: 2px 8px; display: inline-block; width: fit-content; }
.ap-teams { display: flex; flex-direction: column; gap: 2px; }
.ap-team-home, .ap-team-away { font-size: var(--text-base); font-weight: 700; color: var(--text-primary); }
.ap-vs { font-size: var(--text-xs); color: var(--text-muted); font-weight: 600; }
.ap-league { font-size: var(--text-xs); color: var(--text-secondary); }
.ap-actions { display: flex; flex-direction: column; gap: var(--sp-2); }
.ap-divider { height: 1px; background: var(--border-subtle); }
</style>

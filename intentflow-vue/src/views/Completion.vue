<template>
  <div class="page-layout">
    <Navbar />
    <div class="completion-page main-scroll" style="height:calc(100vh - var(--navbar-h)); overflow-y:auto; padding: var(--sp-5);">
      <div class="completion-content anim-fade-up">
        <!-- Check animation -->
        <div class="check-wrap">
          <svg class="check-svg" viewBox="0 0 52 52">
            <circle class="check-circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="check-mark" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>

        <div class="completion-badge">SESSION GOAL REACHED</div>
        <h1 class="completion-title">Action Completed.</h1>
        <p class="completion-sub">You completed what you came to do, confidently and without pressure.</p>

        <!-- Session summary mini -->
        <div class="summary-grid">
          <div class="summary-cell">
            <span class="sc-val">{{ sessionStore.interventionCount }}</span>
            <span class="sc-label">Interventions Used</span>
          </div>
          <div class="summary-cell">
            <span class="sc-val">{{ sessionStore.meaningfulActions }}</span>
            <span class="sc-label">Meaningful Actions</span>
          </div>
          <div class="summary-cell">
            <span class="sc-val">{{ sessionStore.journeyHealth.total }}/100</span>
            <span class="sc-label">Journey Health</span>
          </div>
          <div class="summary-cell">
            <span class="sc-val">{{ sessionStore.safetyStatus === 'NORMAL' ? '✓' : '⚠️' }}</span>
            <span class="sc-label">Safety Status</span>
          </div>
        </div>

        <!-- Selected event recap -->
        <div v-if="sessionStore.selectedEvent" class="event-recap card">
          <div class="recap-tag">CONFIRMED</div>
          <div class="recap-title">{{ sessionStore.selectedEvent.homeTeam }} vs {{ sessionStore.selectedEvent.awayTeam }}</div>
          <div class="recap-league">{{ sessionStore.selectedEvent.league }}</div>
        </div>

        <div class="completion-actions">
          <RouterLink to="/session-quality" class="btn btn-primary btn-lg">View Session Quality →</RouterLink>
          <RouterLink to="/" class="btn btn-outline" @click="sessionStore.reset()">Start New Session</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useSessionStore } from '@/stores/sessionStore'
import Navbar from '@/components/Navbar.vue'

const sessionStore = useSessionStore()
onMounted(() => {
  if (sessionStore.confirmCount === 0) sessionStore.trackEvent('ACTION_COMPLETED')
})
</script>

<style scoped>
.page-layout { display: grid; grid-template-rows: var(--navbar-h) 1fr; min-height: 100vh; }
.completion-page { display: flex; align-items: center; justify-content: center; }
.completion-content { max-width: 520px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: var(--sp-5); text-align: center; }
.check-wrap { position: relative; width: 80px; height: 80px; }
.check-svg { width: 80px; height: 80px; }
.check-circle { stroke: #34d399; stroke-width: 4; stroke-dasharray: 166; stroke-dashoffset: 166; animation: checkStroke 0.8s ease forwards 0.2s; }
.check-mark { stroke: #34d399; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 48; stroke-dashoffset: 48; animation: checkStroke 0.5s ease forwards 0.8s; }
@keyframes checkStroke { to { stroke-dashoffset: 0; } }
.completion-badge { font-size: var(--text-xs); font-weight: 800; letter-spacing: 0.12em; color: #34d399; background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.3); border-radius: var(--r-full); padding: 4px 14px; }
.completion-title { font-size: var(--text-3xl); font-weight: 900; }
.completion-sub { font-size: var(--text-sm); color: var(--text-secondary); max-width: 380px; line-height: 1.6; }
.summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-3); width: 100%; }
.summary-cell { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--r-md); padding: var(--sp-4); display: flex; flex-direction: column; gap: var(--sp-1); align-items: center; }
.sc-val { font-size: var(--text-xl); font-weight: 900; color: var(--text-primary); }
.sc-label { font-size: var(--text-xs); color: var(--text-muted); text-align: center; }
.event-recap { padding: var(--sp-5); width: 100%; text-align: left; }
.recap-tag { font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; color: #34d399; margin-bottom: var(--sp-2); }
.recap-title { font-size: var(--text-lg); font-weight: 800; }
.recap-league { font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px; }
.completion-actions { display: flex; flex-direction: column; gap: var(--sp-3); width: 100%; }
.completion-actions a { text-decoration: none; justify-content: center; }
@media (max-width: 600px) { .summary-grid { grid-template-columns: repeat(2, 1fr); } }
</style>

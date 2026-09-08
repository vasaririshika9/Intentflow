<template>
  <div class="page-layout">
    <Navbar />
    <div class="sq-page main-scroll" style="height:calc(100vh - var(--navbar-h)); overflow-y:auto; padding: var(--sp-5);">
      <div class="sq-header">
        <div>
          <div class="sq-tag">SESSION ANALYTICS</div>
          <h1 class="sq-title">Session Quality Dashboard</h1>
          <p class="sq-sub">In-session signal analysis. Resets every session. Informs, never pushes.</p>
        </div>
        <RouterLink to="/product-impact" class="btn btn-outline">View Product Impact →</RouterLink>
      </div>

      <!-- Session Orbit -->
      <div class="card orbit-card">
        <h3 class="card-label">SESSION JOURNEY</h3>
        <SessionOrbit />
      </div>

      <!-- Main grid -->
      <div class="sq-grid">
        <!-- Journey Health Score -->
        <JourneyHealthScore />

        <!-- Session Decision Twin -->
        <SessionDecisionTwin />

        <!-- Signals summary -->
        <div class="card signals-card">
          <h3 class="card-label">SESSION SIGNALS</h3>
          <div class="signals-list">
            <div class="signal-row" v-for="sig in signalsList" :key="sig.label">
              <span class="sig-icon">{{ sig.icon }}</span>
              <span class="sig-label">{{ sig.label }}</span>
              <span class="sig-val">{{ sig.value }}</span>
            </div>
          </div>
        </div>

        <!-- Intervention stats -->
        <div class="card int-card">
          <h3 class="card-label">INTERVENTIONS</h3>
          <div class="int-stats">
            <div class="int-stat" v-for="s in intStats" :key="s.label">
              <span class="is-val" :style="`color: ${s.color}`">{{ s.value }}</span>
              <span class="is-label">{{ s.label }}</span>
            </div>
          </div>
          <div class="int-bar-wrap">
            <div class="int-bar accepted" :style="`width: ${acceptedPct}%`"></div>
            <div class="int-bar dismissed" :style="`width: ${dismissedPct}%`"></div>
          </div>
          <p class="int-note">{{ intNote }}</p>
        </div>
      </div>

      <!-- Timeline -->
      <div class="card timeline-card">
        <h3 class="card-label">SESSION TIMELINE</h3>
        <SessionTimeline />
      </div>

      <!-- Real Dataset Benchmark Telemetry Card -->
      <div class="card dataset-card anim-fade-up">
        <div class="dataset-header">
          <div class="dataset-tag">CHALLENGE 1 DATASET INTEGRATION</div>
          <h3 class="dataset-title">FEG / PSK Benchmark Logs: <code>top_sport_users_event_logs.csv</code></h3>
          <p class="dataset-sub">IntentFlow correlates live session signals against real-world user activity logs (194 MB telemetry) to calibrate friction detection thresholds.</p>
        </div>

        <div class="dataset-grid">
          <div class="dataset-stat-box">
            <span class="dsb-num">194 MB</span>
            <span class="dsb-lbl">Dataset Size</span>
            <span class="dsb-note">Real PSK iOS user logs</span>
          </div>
          <div class="dataset-stat-box">
            <span class="dsb-num">7 Key Screens</span>
            <span class="dsb-lbl">Screen Tracking</span>
            <span class="dsb-note">prematchLeagues, liveDetail, betslip</span>
          </div>
          <div class="dataset-stat-box">
            <span class="dsb-num">3 Core Disciplines</span>
            <span class="dsb-lbl">Primary Sports</span>
            <span class="dsb-note">Nogomet, Košarka, Tenis</span>
          </div>
          <div class="dataset-stat-box">
            <span class="dsb-num">Zero Intrusion</span>
            <span class="dsb-lbl">Intervention Policy</span>
            <span class="dsb-note">Max 3 budgeted prompts</span>
          </div>
        </div>

        <div class="dataset-flow-row">
          <span class="dfr-title">Observed Conversion Path in Logs:</span>
          <div class="dfr-steps">
            <span class="dfr-step">prematchSports</span>
            <span class="dfr-arrow">→</span>
            <span class="dfr-step">prematchLeagues</span>
            <span class="dfr-arrow">→</span>
            <span class="dfr-step dfr-step--friction">prematchDetail ⇄ Compare</span>
            <span class="dfr-arrow">→</span>
            <span class="dfr-step">betslip_add_bet</span>
            <span class="dfr-arrow">→</span>
            <span class="dfr-step dfr-step--success">betslip_placed_bet ✓</span>
          </div>
        </div>
      </div>

      <!-- Philosophy note -->
      <div class="philosophy-card card">
        <blockquote class="philosophy-quote">"We don't push users toward action. We remove the friction preventing confident action."</blockquote>
        <p class="philosophy-sub">IntentFlow optimises for decision confidence, not conversion volume.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSessionStore } from '@/stores/sessionStore'
import Navbar from '@/components/Navbar.vue'
import SessionOrbit from '@/components/SessionOrbit.vue'
import JourneyHealthScore from '@/components/JourneyHealthScore.vue'
import SessionDecisionTwin from '@/components/SessionDecisionTwin.vue'
import SessionTimeline from '@/components/SessionTimeline.vue'

const sessionStore = useSessionStore()

const signalsList = computed(() => [
  { icon: '👁️', label: 'Events Viewed', value: sessionStore.eventsViewed.length },
  { icon: '🔍', label: 'Searches', value: sessionStore.searchCount },
  { icon: '↩', label: 'Back Navigations', value: sessionStore.backCount },
  { icon: '⚖️', label: 'Comparisons', value: sessionStore.comparisonCount },
  { icon: '📋', label: 'Review Opens', value: sessionStore.reviewCount },
  { icon: '✅', label: 'Confirmations', value: sessionStore.confirmCount },
  { icon: '⚡', label: 'Meaningful Actions', value: sessionStore.meaningfulActions },
])

const intStats = computed(() => [
  { label: 'Total Interventions', value: sessionStore.interventionCount, color: '#a78bfa' },
  { label: 'Accepted', value: sessionStore.interventionsAccepted, color: '#34d399' },
  { label: 'Dismissed', value: sessionStore.interventionsDismissed, color: '#f87171' },
  { label: 'Remaining Budget', value: sessionStore.remainingBudget, color: '#60a5fa' },
])

const total = computed(() => sessionStore.interventionCount || 1)
const acceptedPct = computed(() => (sessionStore.interventionsAccepted / total.value) * 100)
const dismissedPct = computed(() => (sessionStore.interventionsDismissed / total.value) * 100)

const intNote = computed(() => {
  if (sessionStore.interventionCount === 0) return '✓ No interventions were needed. Session progressed naturally.'
  const rate = sessionStore.interventionsAccepted / sessionStore.interventionCount
  return rate > 0.5 ? 'Users responded positively to guidance.' : 'Interventions were available but not always needed.'
})
</script>

<style scoped>
.page-layout { display: grid; grid-template-rows: var(--navbar-h) 1fr; min-height: 100vh; }
.sq-page { display: flex; flex-direction: column; gap: var(--sp-5); }
.sq-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--sp-4); flex-wrap: wrap; }
.sq-tag { font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.1em; color: var(--color-primary-light); text-transform: uppercase; margin-bottom: 4px; }
.sq-title { font-size: var(--text-2xl); font-weight: 800; }
.sq-sub { font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px; }
.sq-header a { text-decoration: none; }
.card-label { font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.1em; color: var(--text-muted); text-transform: uppercase; margin-bottom: var(--sp-4); }
.orbit-card { padding: var(--sp-5); }
.sq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4); }
/* Signals */
.signals-card { padding: var(--sp-5); }
.signals-list { display: flex; flex-direction: column; gap: var(--sp-2); }
.signal-row { display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-2) 0; border-bottom: 1px solid var(--border-subtle); }
.signal-row:last-child { border-bottom: none; }
.sig-icon { font-size: 1rem; }
.sig-label { flex: 1; font-size: var(--text-sm); color: var(--text-secondary); }
.sig-val { font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); }
/* Interventions */
.int-card { padding: var(--sp-5); display: flex; flex-direction: column; gap: var(--sp-4); }
.int-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-3); }
.int-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.is-val { font-size: var(--text-2xl); font-weight: 900; }
.is-label { font-size: var(--text-xs); color: var(--text-muted); text-align: center; }
.int-bar-wrap { height: 8px; background: var(--bg-elevated); border-radius: var(--r-full); overflow: hidden; display: flex; }
.int-bar { height: 100%; transition: width 0.8s ease; }
.int-bar.accepted { background: #34d399; }
.int-bar.dismissed { background: #f87171; }
.int-note { font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5; }
/* Timeline */
.timeline-card { padding: var(--sp-5); }
/* Dataset Telemetry Card */
.dataset-card { padding: var(--sp-6); background: linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6)); border: 1px solid rgba(59, 130, 246, 0.3); }
.dataset-header { margin-bottom: var(--sp-4); }
.dataset-tag { font-size: 11px; font-weight: 800; color: #60a5fa; letter-spacing: 0.05em; margin-bottom: 2px; }
.dataset-title { font-size: var(--text-lg); font-weight: 800; color: var(--text-primary); }
.dataset-title code { background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: var(--r-sm); font-size: 13px; color: #93c5fd; }
.dataset-sub { font-size: var(--text-xs); color: var(--text-secondary); margin-top: 4px; }
.dataset-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-3); margin-bottom: var(--sp-5); }
.dataset-stat-box { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--r-md); padding: var(--sp-3); display: flex; flex-direction: column; gap: 2px; }
.dsb-num { font-size: var(--text-lg); font-weight: 800; color: var(--color-primary-light); }
.dsb-lbl { font-size: var(--text-xs); font-weight: 700; color: var(--text-primary); }
.dsb-note { font-size: 10px; color: var(--text-muted); }
.dataset-flow-row { background: rgba(0,0,0,0.25); padding: var(--sp-3) var(--sp-4); border-radius: var(--r-md); border: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: var(--sp-2); }
.dfr-title { font-size: 11px; font-weight: 700; color: var(--text-secondary); }
.dfr-steps { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 11px; }
.dfr-step { background: var(--bg-elevated); padding: 3px 8px; border-radius: var(--r-sm); font-family: monospace; color: var(--text-primary); border: 1px solid var(--border-default); }
.dfr-step--friction { border-color: #a78bfa; color: #c4b5fd; background: rgba(167, 139, 250, 0.15); font-weight: 700; }
.dfr-step--success { border-color: #34d399; color: #6ee7b7; background: rgba(52, 211, 153, 0.15); font-weight: 700; }
.dfr-arrow { color: var(--text-muted); font-size: 10px; }

/* Philosophy */
.philosophy-card { padding: var(--sp-6); text-align: center; }
.philosophy-quote { font-size: var(--text-lg); font-weight: 600; color: var(--text-primary); font-style: italic; max-width: 580px; margin: 0 auto; line-height: 1.6; }
.philosophy-sub { font-size: var(--text-sm); color: var(--text-secondary); margin-top: var(--sp-3); }
@media (max-width: 900px) { .sq-grid { grid-template-columns: 1fr; } .int-stats { grid-template-columns: repeat(2, 1fr); } .dataset-grid { grid-template-columns: repeat(2, 1fr); } }
</style>

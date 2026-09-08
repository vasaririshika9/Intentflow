<template>
  <div class="page-layout">
    <Navbar />
    <div class="compare-page main-scroll">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <RouterLink to="/">Home</RouterLink> /
        <RouterLink to="/sports">Sports</RouterLink> /
        <span>Compare Events</span>
      </nav>

      <!-- Toast for removals or actions -->
      <Transition name="fade">
        <div v-if="localNotice" class="compare-notice-banner">
          {{ localNotice }}
        </div>
      </Transition>

      <!-- EMPTY STATE: 0 Events Selected -->
      <div v-if="comparisonStore.count === 0" class="empty-compare card anim-fade-up">
        <div class="empty-icon">⚖️</div>
        <h2 class="empty-title">No events selected for comparison</h2>
        <p class="empty-desc">
          Explore events and select up to two options to compare side-by-side.
        </p>
        <RouterLink to="/sports" class="btn btn-primary">
          Explore Events →
        </RouterLink>
      </div>

      <!-- PARTIAL STATE: 1 Event Selected -->
      <div v-else-if="comparisonStore.count === 1" class="partial-compare anim-fade-up">
        <div class="partial-header card">
          <div class="partial-tag">1 OF 2 SELECTED</div>
          <h2 class="partial-title">Select one more event to start comparison</h2>
          <p class="partial-sub">You have selected 1 event. Add a second fixture from the catalog to see side-by-side odds, venue, and matchup metrics.</p>
        </div>

        <div class="partial-grid">
          <!-- Event A Selected Card -->
          <div class="selected-slot-card card" v-if="eventA">
            <div class="slot-badge">EVENT A (SELECTED)</div>
            <div class="slot-sport">{{ eventA.sport }} · {{ eventA.league }}</div>
            <h3 class="slot-teams">{{ eventA.homeTeam }} vs {{ eventA.awayTeam }}</h3>
            <div class="slot-odds-row">
              <span class="odds-pill">Home: <strong>{{ eventA.homeOdds?.toFixed(2) }}</strong></span>
              <span class="odds-pill" v-if="eventA.drawOdds > 0">Draw: <strong>{{ eventA.drawOdds?.toFixed(2) }}</strong></span>
              <span class="odds-pill">Away: <strong>{{ eventA.awayOdds?.toFixed(2) }}</strong></span>
            </div>
            <button class="btn btn-outline btn-sm btn-remove-slot" @click="removeEvent(eventA.id)">
              ✕ Remove from Compare
            </button>
          </div>

          <!-- Empty Slot B Placeholder -->
          <div class="empty-slot-card card">
            <div class="empty-slot-icon">➕</div>
            <h4 class="empty-slot-title">Waiting for Event B</h4>
            <p class="empty-slot-desc">Browse the sports catalog and click "⚖️ Compare" on any fixture.</p>
            <RouterLink to="/sports" class="btn btn-outline btn-sm">
              Browse Events to Compare →
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- FULL COMPARISON: Exactly 2 Events Selected -->
      <div v-else class="full-compare anim-fade-up">
        <!-- 6. INTENTFLOW INTELLIGENCE INSIGHT SECTION -->
        <section class="intelligence-insight card">
          <div class="insight-header">
            <div class="insight-badge">
              <span class="insight-spark">✨</span>
              <span>INTENTFLOW INSIGHT</span>
            </div>
            <div class="insight-state-tags">
              <span class="state-pill state-pill--intent">Detected State: <strong>COMPARING</strong></span>
              <span class="state-pill state-pill--friction">Detected Friction: <strong>Comparison Friction</strong></span>
            </div>
          </div>

          <div class="insight-content">
            <h3 class="insight-heading">We noticed that you viewed these options multiple times.</h3>
            <div class="insight-grid">
              <div class="insight-block">
                <div class="insight-block-title">💡 Why this suggestion?</div>
                <p class="insight-block-desc">
                  It looks like you repeatedly explored these events, so comparing them side-by-side may help reduce decision confusion and clarify key differences.
                </p>
              </div>
              <div class="insight-block">
                <div class="insight-block-title">🎯 Recommended next step</div>
                <p class="insight-block-desc">
                  Review the key differences below and choose when you feel ready. Take your time — no urgency, no pressure.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Main Comparison Header & Controls -->
        <div class="compare-toolbar card">
          <div class="toolbar-left">
            <h1 class="compare-page-title">Side-by-Side Comparison</h1>
            <p class="compare-page-sub">Direct comparison of selected fixtures from live sports data.</p>
          </div>

          <div class="toolbar-right">
            <label class="diff-toggle">
              <input type="checkbox" v-model="highlightDiffs" />
              <span class="toggle-switch"></span>
              <span class="toggle-text">Highlight Differences</span>
            </label>
            <button class="btn btn-ghost btn-sm btn-clear-all" @click="clearAll" title="Clear both events">
              Clear Both
            </button>
          </div>
        </div>

        <!-- Event Headers Row -->
        <div class="compare-events-duo">
          <!-- Event A Header Card -->
          <div class="event-header-card card" :class="{ 'card-diff': highlightDiffs }">
            <div class="eh-top">
              <span class="eh-tag">OPTION A</span>
              <button class="btn-remove-mini" @click="removeEvent(eventA.id)" title="Remove Option A">✕</button>
            </div>
            <div class="eh-sport">{{ eventA.sport }} · {{ eventA.league }}</div>
            <h2 class="eh-title">{{ eventA.homeTeam }} <span class="eh-vs">vs</span> {{ eventA.awayTeam }}</h2>
            <div class="eh-status" :class="{ 'live': eventA.isLive }">
              {{ eventA.isLive ? '🔴 LIVE NOW' : `🕐 ${formatTime(eventA.startTime)}` }}
            </div>
            <button class="btn btn-primary btn-sm btn-choose-top" @click="chooseEvent(eventA)">
              Choose {{ eventA.homeTeam }} →
            </button>
          </div>

          <div class="duo-divider">
            <span class="duo-divider-badge">VS</span>
          </div>

          <!-- Event B Header Card -->
          <div class="event-header-card card" :class="{ 'card-diff': highlightDiffs }">
            <div class="eh-top">
              <span class="eh-tag">OPTION B</span>
              <button class="btn-remove-mini" @click="removeEvent(eventB.id)" title="Remove Option B">✕</button>
            </div>
            <div class="eh-sport">{{ eventB.sport }} · {{ eventB.league }}</div>
            <h2 class="eh-title">{{ eventB.homeTeam }} <span class="eh-vs">vs</span> {{ eventB.awayTeam }}</h2>
            <div class="eh-status" :class="{ 'live': eventB.isLive }">
              {{ eventB.isLive ? '🔴 LIVE NOW' : `🕐 ${formatTime(eventB.startTime)}` }}
            </div>
            <button class="btn btn-primary btn-sm btn-choose-top" @click="chooseEvent(eventB)">
              Choose {{ eventB.homeTeam }} →
            </button>
          </div>
        </div>

        <!-- Comparison Table Matrix -->
        <div class="matrix-card card">
          <table class="matrix-table">
            <thead>
              <tr>
                <th class="col-spec">Specification</th>
                <th class="col-opt">Option A: {{ eventA.homeTeam }}</th>
                <th class="col-opt">Option B: {{ eventB.homeTeam }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in matrixRows" :key="row.key"
                :class="{ 'row-highlighted-diff': highlightDiffs && row.isDiff }">
                <td class="cell-label">
                  {{ row.label }}
                  <span v-if="highlightDiffs && row.isDiff" class="diff-chip">Difference</span>
                </td>
                <td class="cell-val" :class="{ 'cell-diff-val': highlightDiffs && row.isDiff }">
                  {{ row.valA }}
                </td>
                <td class="cell-val" :class="{ 'cell-diff-val': highlightDiffs && row.isDiff }">
                  {{ row.valB }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 10. USER FLOW AFTER COMPARISON -->
        <div class="compare-conclusion card">
          <div class="conclusion-header">
            <h3 class="conclusion-title">Ready to move forward?</h3>
            <p class="conclusion-sub">
              Select your preferred option or continue browsing without any pressure.
            </p>
          </div>

          <div class="conclusion-actions">
            <button class="btn btn-primary btn-lg btn-choose" @click="chooseEvent(eventA)">
              Choose {{ eventA.homeTeam }} vs {{ eventA.awayTeam }} →
            </button>

            <button class="btn btn-primary btn-lg btn-choose" @click="chooseEvent(eventB)">
              Choose {{ eventB.homeTeam }} vs {{ eventB.awayTeam }} →
            </button>

            <RouterLink to="/sports" class="btn btn-ghost btn-lg btn-explore" @click="continueExploring">
              Continue Exploring Sports
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/sessionStore'
import { useComparisonStore } from '@/stores/comparisonStore'
import Navbar from '@/components/Navbar.vue'

const router = useRouter()
const sessionStore = useSessionStore()
const comparisonStore = useComparisonStore()

const highlightDiffs = ref(true)
const localNotice = ref('')

onMounted(() => {
  sessionStore.trackEvent('COMPARE_OPENED', {
    count: comparisonStore.count,
    events: comparisonStore.selectedEvents.map(e => e.title),
  })
})

const eventA = computed(() => comparisonStore.selectedEvents[0] || null)
const eventB = computed(() => comparisonStore.selectedEvents[1] || null)

function formatTime(iso) {
  if (!iso) return 'Upcoming'
  try {
    const d = new Date(iso)
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return 'Upcoming'
  }
}

function removeEvent(id) {
  comparisonStore.removeEvent(id)
  localNotice.value = 'Event removed from comparison'
  setTimeout(() => { localNotice.value = '' }, 3000)
}

function clearAll() {
  comparisonStore.clearSelection()
  localNotice.value = 'Comparison selection cleared'
  setTimeout(() => { localNotice.value = '' }, 3000)
}

function chooseEvent(event) {
  if (!event) return
  // 1. Update selection in sessionStore
  sessionStore.selectEvent(event)
  // 2. Track meaningful action
  sessionStore.trackEvent('COMPARE_COMPLETED', {
    chosenId: event.id,
    chosenTitle: event.title,
  })
  // 3. Navigate to review
  router.push('/review')
}

function continueExploring() {
  sessionStore.trackEvent('BACK_NAVIGATION', { from: 'compare' })
}

// Dynamic Comparison Rows from Actual Event Object Schema
const matrixRows = computed(() => {
  if (!eventA.value || !eventB.value) return []

  const a = eventA.value
  const b = eventB.value

  const rows = [
    {
      key: 'sport',
      label: 'Sport Discipline',
      valA: a.sport || '—',
      valB: b.sport || '—',
      isDiff: a.sport !== b.sport,
    },
    {
      key: 'league',
      label: 'Competition / League',
      valA: a.league || '—',
      valB: b.league || '—',
      isDiff: a.league !== b.league,
    },
    {
      key: 'status',
      label: 'Match Status',
      valA: a.isLive ? '🔴 LIVE NOW' : 'Upcoming Fixture',
      valB: b.isLive ? '🔴 LIVE NOW' : 'Upcoming Fixture',
      isDiff: a.isLive !== b.isLive,
    },
    {
      key: 'startTime',
      label: 'Scheduled Start',
      valA: formatTime(a.startTime),
      valB: formatTime(b.startTime),
      isDiff: a.startTime !== b.startTime,
    },
    {
      key: 'venue',
      label: 'Venue & Location',
      valA: a.venue ? `${a.venue}, ${a.country || ''}` : (a.country || 'Neutral Venue'),
      valB: b.venue ? `${b.venue}, ${b.country || ''}` : (b.country || 'Neutral Venue'),
      isDiff: (a.venue !== b.venue) || (a.country !== b.country),
    },
    {
      key: 'homeOdds',
      label: `${a.homeTeam} (Home Odds)`,
      valA: a.homeOdds ? a.homeOdds.toFixed(2) : '—',
      valB: b.homeOdds ? b.homeOdds.toFixed(2) : '—',
      isDiff: a.homeOdds !== b.homeOdds,
    },
    {
      key: 'drawOdds',
      label: 'Draw Odds',
      valA: a.drawOdds > 0 ? a.drawOdds.toFixed(2) : 'N/A (Two-way sport)',
      valB: b.drawOdds > 0 ? b.drawOdds.toFixed(2) : 'N/A (Two-way sport)',
      isDiff: a.drawOdds !== b.drawOdds,
    },
    {
      key: 'awayOdds',
      label: `${a.awayTeam} (Away Odds)`,
      valA: a.awayOdds ? a.awayOdds.toFixed(2) : '—',
      valB: b.awayOdds ? b.awayOdds.toFixed(2) : '—',
      isDiff: a.awayOdds !== b.awayOdds,
    },
    {
      key: 'sessionFit',
      label: 'Session Fit Match',
      valA: `${a.sessionFit || 85}% match`,
      valB: `${b.sessionFit || 85}% match`,
      isDiff: Math.abs((a.sessionFit || 85) - (b.sessionFit || 85)) > 5,
    },
  ]

  return rows
})
</script>

<style scoped>
.page-layout { min-height: 100vh; display: flex; flex-direction: column; background: var(--bg-surface); }
.compare-page {
  flex: 1; padding: var(--sp-6) var(--sp-5); max-width: 1200px;
  margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: var(--sp-6);
  padding-top: calc(var(--navbar-h) + var(--sp-5));
}
.breadcrumb { font-size: var(--text-xs); color: var(--text-muted); display: flex; gap: var(--sp-2); align-items: center; }
.breadcrumb a { color: var(--text-secondary); text-decoration: none; }
.breadcrumb a:hover { color: var(--color-primary-light); }
.compare-notice-banner {
  background: rgba(139, 92, 246, 0.2); border: 1px solid #8b5cf6;
  color: #c4b5fd; padding: var(--sp-2) var(--sp-4); border-radius: var(--r-md);
  font-size: var(--text-xs); font-weight: 600; text-align: center;
}

/* Empty State */
.empty-compare {
  text-align: center; padding: var(--sp-12) var(--sp-6);
  display: flex; flex-direction: column; align-items: center; gap: var(--sp-4);
  max-width: 580px; margin: var(--sp-8) auto;
}
.empty-icon { font-size: 3.5rem; line-height: 1; }
.empty-title { font-size: var(--text-2xl); font-weight: 800; color: var(--text-primary); }
.empty-desc { font-size: var(--text-sm); color: var(--text-secondary); max-width: 420px; line-height: 1.5; }

/* Partial State */
.partial-header { padding: var(--sp-5); border-left: 4px solid #a78bfa; }
.partial-tag { font-size: 11px; font-weight: 800; color: #a78bfa; letter-spacing: 0.05em; margin-bottom: var(--sp-1); }
.partial-title { font-size: var(--text-xl); font-weight: 700; color: var(--text-primary); }
.partial-sub { font-size: var(--text-sm); color: var(--text-secondary); margin-top: var(--sp-1); }
.partial-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-5); }
.selected-slot-card {
  padding: var(--sp-5); border-color: #a78bfa; background: rgba(167, 139, 250, 0.05);
  display: flex; flex-direction: column; gap: var(--sp-3);
}
.slot-badge { font-size: 10px; font-weight: 800; color: #34d399; }
.slot-sport { font-size: var(--text-xs); color: var(--text-muted); font-weight: 600; }
.slot-teams { font-size: var(--text-lg); font-weight: 800; color: var(--text-primary); }
.slot-odds-row { display: flex; gap: var(--sp-2); flex-wrap: wrap; }
.odds-pill {
  background: var(--bg-elevated); padding: 4px 10px; border-radius: var(--r-sm);
  font-size: var(--text-xs); color: var(--text-secondary);
}
.odds-pill strong { color: var(--color-primary-light); }
.btn-remove-slot { align-self: flex-start; color: #f87171; border-color: rgba(239, 68, 68, 0.3); }
.btn-remove-slot:hover { background: rgba(239, 68, 68, 0.15); }
.empty-slot-card {
  padding: var(--sp-5); border: 2px dashed var(--border-default);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; gap: var(--sp-3); min-height: 200px;
}
.empty-slot-icon { font-size: 2rem; color: var(--text-muted); }
.empty-slot-title { font-size: var(--text-base); font-weight: 700; color: var(--text-primary); }
.empty-slot-desc { font-size: var(--text-xs); color: var(--text-secondary); max-width: 260px; }

/* 6. IntentFlow Intelligence Insight Section */
.intelligence-insight {
  background: linear-gradient(135deg, rgba(88, 28, 135, 0.25) 0%, rgba(30, 27, 75, 0.4) 100%);
  border: 1px solid rgba(167, 139, 250, 0.35); padding: var(--sp-5);
  box-shadow: 0 0 25px rgba(139, 92, 246, 0.15);
}
.insight-header {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;
  gap: var(--sp-3); margin-bottom: var(--sp-4); padding-bottom: var(--sp-3);
  border-bottom: 1px solid rgba(167, 139, 250, 0.2);
}
.insight-badge {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--text-xs); font-weight: 800; color: #c4b5fd;
  letter-spacing: 0.08em;
}
.insight-spark { font-size: 1.1rem; }
.insight-state-tags { display: flex; gap: var(--sp-2); flex-wrap: wrap; }
.state-pill {
  font-size: 11px; padding: 3px 10px; border-radius: var(--r-full);
  background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
}
.state-pill--intent strong { color: #a78bfa; }
.state-pill--friction strong { color: #f59e0b; }
.insight-heading {
  font-size: var(--text-base); font-weight: 700; color: var(--text-primary);
  margin-bottom: var(--sp-3);
}
.insight-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4); }
.insight-block {
  background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.06);
  padding: var(--sp-3) var(--sp-4); border-radius: var(--r-md);
}
.insight-block-title { font-size: var(--text-xs); font-weight: 700; color: #c4b5fd; margin-bottom: 4px; }
.insight-block-desc { font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5; margin: 0; }

/* Toolbar */
.compare-toolbar {
  padding: var(--sp-4) var(--sp-5); display: flex; align-items: center;
  justify-content: space-between; flex-wrap: wrap; gap: var(--sp-4);
}
.compare-page-title { font-size: var(--text-xl); font-weight: 800; color: var(--text-primary); }
.compare-page-sub { font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px; }
.toolbar-right { display: flex; align-items: center; gap: var(--sp-4); }
.diff-toggle { display: flex; align-items: center; gap: var(--sp-2); cursor: pointer; user-select: none; }
.diff-toggle input { display: none; }
.toggle-switch {
  width: 36px; height: 20px; background: var(--bg-elevated); border-radius: var(--r-full);
  position: relative; transition: all var(--t-fast); border: 1px solid var(--border-default);
}
.toggle-switch::after {
  content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px;
  background: #fff; border-radius: 50%; transition: all var(--t-fast);
}
.diff-toggle input:checked + .toggle-switch { background: #8b5cf6; border-color: #8b5cf6; }
.diff-toggle input:checked + .toggle-switch::after { transform: translateX(16px); }
.toggle-text { font-size: var(--text-xs); font-weight: 600; color: var(--text-primary); }
.btn-clear-all { color: var(--text-muted); }
.btn-clear-all:hover { color: #f87171; }

/* Duo Header Cards */
.compare-events-duo {
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: stretch; gap: var(--sp-4);
}
.event-header-card {
  padding: var(--sp-5); display: flex; flex-direction: column; gap: var(--sp-2);
  background: var(--bg-card); border: 1px solid var(--border-subtle);
  border-radius: var(--r-lg); position: relative;
}
.eh-top { display: flex; align-items: center; justify-content: space-between; }
.eh-tag { font-size: 10px; font-weight: 800; color: #a78bfa; letter-spacing: 0.05em; }
.btn-remove-mini {
  background: none; border: none; color: var(--text-muted); cursor: pointer;
  padding: 2px 6px; border-radius: var(--r-sm); font-size: 12px;
}
.btn-remove-mini:hover { color: #f87171; background: rgba(239, 68, 68, 0.1); }
.eh-sport { font-size: var(--text-xs); color: var(--text-muted); font-weight: 600; }
.eh-title { font-size: var(--text-lg); font-weight: 800; color: var(--text-primary); }
.eh-vs { font-size: var(--text-xs); color: var(--text-muted); font-weight: 600; margin: 0 4px; }
.eh-status { font-size: var(--text-xs); color: var(--text-secondary); font-weight: 600; }
.eh-status.live { color: #f87171; }
.btn-choose-top { margin-top: var(--sp-2); }
.duo-divider { display: flex; align-items: center; justify-content: center; }
.duo-divider-badge {
  background: var(--bg-elevated); border: 1px solid var(--border-default);
  color: var(--text-muted); font-size: 11px; font-weight: 800;
  padding: 8px 12px; border-radius: var(--r-full);
}

/* Matrix Table */
.matrix-card { overflow-x: auto; padding: 0; }
.matrix-table { width: 100%; border-collapse: collapse; text-align: left; }
.matrix-table th, .matrix-table td {
  padding: var(--sp-3) var(--sp-5); border-bottom: 1px solid var(--border-subtle);
}
.matrix-table th {
  background: var(--bg-card); font-size: var(--text-xs); font-weight: 700;
  color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;
}
.col-spec { width: 30%; }
.col-opt { width: 35%; }
.cell-label { font-size: var(--text-xs); font-weight: 600; color: var(--text-secondary); }
.cell-val { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); }
.diff-chip {
  display: inline-block; font-size: 9px; font-weight: 800; padding: 1px 6px;
  border-radius: var(--r-full); background: rgba(245, 158, 11, 0.2);
  color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); margin-left: var(--sp-2);
}
.row-highlighted-diff {
  background: rgba(139, 92, 246, 0.06);
}
.cell-diff-val {
  color: #c4b5fd; font-weight: 700;
}

/* Conclusion / Next Steps */
.compare-conclusion {
  padding: var(--sp-6); text-align: center; display: flex; flex-direction: column;
  align-items: center; gap: var(--sp-5); background: var(--bg-card);
  border: 1px solid var(--border-default);
}
.conclusion-title { font-size: var(--text-xl); font-weight: 800; color: var(--text-primary); }
.conclusion-sub { font-size: var(--text-sm); color: var(--text-secondary); max-width: 480px; }
.conclusion-actions {
  display: flex; gap: var(--sp-3); flex-wrap: wrap; justify-content: center; width: 100%;
}
.btn-choose { min-width: 220px; font-weight: 700; }
.btn-explore { min-width: 200px; }

/* Responsive */
@media (max-width: 900px) {
  .partial-grid { grid-template-columns: 1fr; }
  .compare-events-duo { grid-template-columns: 1fr; }
  .duo-divider { display: none; }
  .insight-grid { grid-template-columns: 1fr; }
  .conclusion-actions { flex-direction: column; }
  .conclusion-actions .btn { width: 100%; }
}
</style>

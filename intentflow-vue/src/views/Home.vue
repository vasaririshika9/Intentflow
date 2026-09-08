<template>
  <div class="app-shell">
    <Navbar />
    <div class="app-body">
      <!-- Left sidebar -->
      <Sidebar :active-sport="activeSport" @sport-selected="onSportSelected" />

      <!-- Main content -->
      <main class="main-scroll" id="main-content">
        <!-- Sports Tabs -->
        <div class="tabs-bar">
          <button v-for="tab in tabs" :key="tab.id" class="sport-tab"
            :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
            {{ tab.label }}
            <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
          </button>
        </div>

        <!-- New User voluntary preference selector -->
        <NewUserPrompt />

        <!-- Direct Guidance / High-intent direct navigation card -->
        <DirectGuidanceCard />

        <!-- Promo cards row with dynamic Compare Options card -->
        <div class="promo-row">
          <!-- 1. IntentFlow Intelligence -->
          <div class="promo-card" style="background: linear-gradient(135deg, #1a2a4a, #0d1a3a)">
            <div class="promo-icon">⚡</div>
            <div class="promo-content">
              <div class="promo-title">IntentFlow Intelligence</div>
              <div class="promo-sub">Session-aware experience · Zero pressure</div>
            </div>
          </div>

          <!-- 2. Safety First -->
          <div class="promo-card" style="background: linear-gradient(135deg, #1a3a2a, #0d2a1a)">
            <div class="promo-icon">🛡️</div>
            <div class="promo-content">
              <div class="promo-title">Safety First</div>
              <div class="promo-sub">Responsible play protections always active</div>
            </div>
          </div>

          <!-- 3. Dynamic Compare Options Card -->
          <div class="promo-card promo-card--compare"
            :class="{
              'promo-card--has-one': comparisonStore.count === 1,
              'promo-card--has-two': comparisonStore.count === 2
            }"
            :style="comparisonStore.count === 2 ? 'background: linear-gradient(135deg, #3b1b6e, #1a0d3a)' : 'background: linear-gradient(135deg, #2a1a4a, #1a0d3a)'"
            @click="handleCompareCardClick">
            <div class="promo-icon">⚖️</div>
            
            <!-- 0 selected state -->
            <div v-if="comparisonStore.count === 0" class="promo-content">
              <div class="promo-title">Compare Options</div>
              <div class="promo-sub">Select up to 2 events to compare.</div>
            </div>

            <!-- 1 selected state -->
            <div v-else-if="comparisonStore.count === 1" class="promo-content">
              <div class="promo-top-line">
                <span class="promo-title">Compare Options</span>
                <span class="counter-badge">1 of 2 selected</span>
              </div>
              <div class="selected-chip">
                <span class="chip-text">{{ comparisonStore.selectedEvents[0].homeTeam }} vs {{ comparisonStore.selectedEvents[0].awayTeam }}</span>
                <button class="chip-remove" @click.stop="comparisonStore.removeEvent(comparisonStore.selectedEvents[0].id)" title="Remove">✕</button>
              </div>
              <div class="promo-hint">Select one more event to compare.</div>
            </div>

            <!-- 2 selected state -->
            <div v-else class="promo-content">
              <div class="promo-top-line">
                <span class="promo-title">Compare Options</span>
                <span class="counter-badge counter-badge--ready">2 events selected ✓</span>
              </div>
              <div class="selected-duo">
                <span class="duo-item">{{ comparisonStore.selectedEvents[0].homeTeam }} vs {{ comparisonStore.selectedEvents[0].awayTeam }}</span>
                <span class="duo-vs">vs</span>
                <span class="duo-item">{{ comparisonStore.selectedEvents[1].homeTeam }} vs {{ comparisonStore.selectedEvents[1].awayTeam }}</span>
              </div>
              <div class="compare-card-actions">
                <button class="btn btn-primary btn-sm btn-compare-go" @click.stop="goToCompare">
                  Compare Now →
                </button>
                <button class="btn-clear" @click.stop="comparisonStore.clearSelection" title="Clear both events">
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Subtle Compare Notice Toast -->
        <Transition name="fade">
          <div v-if="comparisonStore.selectionNotice || compareToast" class="compare-toast-bar">
            <span>💡 {{ comparisonStore.selectionNotice || compareToast }}</span>
          </div>
        </Transition>

        <!-- Loading -->
        <div v-if="loading" class="events-grid stagger">
          <div v-for="i in 6" :key="i" class="skeleton" style="height:180px"></div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="state-card state-error">
          <p>{{ error }}</p>
          <button class="btn btn-outline btn-sm" @click="loadEvents">Try Again</button>
        </div>

        <!-- Events grid -->
        <template v-else>
          <div class="section-header">
            <h2 class="section-title">
              <span v-if="activeTab === 'live'" class="live-dot-big">●</span>
              {{ sectionTitle }}
            </h2>
            <span class="section-count">{{ events.length }} events</span>
          </div>

          <div v-if="events.length === 0" class="state-card">
            <p>No events found. Try another tab or sport.</p>
          </div>
          <div v-else class="events-grid stagger">
            <EventCard v-for="event in events" :key="event.id"
              :event="event"
              :in-compare="comparisonStore.isSelected(event.id)"
              :is-selected="sessionStore.selectedEvent?.id === event.id"
              @click="onEventClick(event)"
              @view="onEventView(event)"
              @compare="onCompare(event)"
            />
          </div>
        </template>
      </main>

      <!-- Right action panel -->
      <ActionPanel class="right-panel" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/sessionStore'
import { useComparisonStore } from '@/stores/comparisonStore'
import { getEvents } from '@/services/sportsData'
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import ActionPanel from '@/components/ActionPanel.vue'
import EventCard from '@/components/EventCard.vue'
import NewUserPrompt from '@/components/NewUserPrompt.vue'
import DirectGuidanceCard from '@/components/DirectGuidanceCard.vue'

const router = useRouter()
const sessionStore = useSessionStore()
const comparisonStore = useComparisonStore()

const activeTab = ref('all')
const activeSport = ref(null)
const events = ref([])
const loading = ref(true)
const error = ref(null)
const compareToast = ref('')
let toastTimer = null

const tabs = [
  { id: 'live', label: 'LIVE', count: 3 },
  { id: 'today', label: 'TODAY', count: 12 },
  { id: 'one-h', label: '1H' },
  { id: 'three-h', label: '3H' },
  { id: 'tomorrow', label: 'TOMORROW' },
  { id: 'all', label: 'ALL' },
]

const sectionTitle = computed(() => {
  const map = { live: 'Live Events', today: "Today's Events", 'one-h': 'Starting in 1 Hour', 'three-h': 'Starting in 3 Hours', tomorrow: "Tomorrow's Events", all: 'All Events' }
  return map[activeTab.value] || 'Events'
})

function showCompareToast(msg) {
  compareToast.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    compareToast.value = ''
  }, 3500)
}

function handleCompareCardClick() {
  if (comparisonStore.count === 0) {
    showCompareToast('Select two events from the list to compare them.')
  } else if (comparisonStore.count === 1) {
    showCompareToast('Select one more event to start comparison.')
  } else if (comparisonStore.count === 2) {
    goToCompare()
  }
}

function goToCompare() {
  sessionStore.trackEvent('COMPARE_OPENED')
  router.push('/compare')
}

async function loadEvents() {
  loading.value = true
  error.value = null
  try {
    const filters = {}
    if (activeTab.value === 'live') filters.status = 'live'
    if (activeSport.value) filters.sport = activeSport.value
    const result = await getEvents({ ...filters, limit: 30 })
    events.value = result.data
    sessionStore.trackEvent('PAGE_VIEW', { page: 'home', tab: activeTab.value })
  } catch (e) {
    error.value = 'Failed to load events. Please try again.'
  } finally {
    loading.value = false
  }
}

watch([activeTab, activeSport], loadEvents)
onMounted(loadEvents)

function onSportSelected(sport) {
  activeSport.value = sport.id
  sessionStore.trackEvent('SPORT_SELECTED', { sport: sport.name })
}

function onEventClick(event) {
  sessionStore.trackEvent('EVENT_OPENED', { id: event.id, title: event.title })
  router.push(`/event/${event.id}`)
}

function onEventView(event) {
  sessionStore.trackEvent('EVENT_OPENED', { id: event.id, title: event.title })
  router.push(`/event/${event.id}`)
}

function onCompare(event) {
  comparisonStore.toggleEvent(event)
}
</script>

<style scoped>
.app-shell { display: grid; grid-template-rows: var(--navbar-h) 1fr; min-height: 100vh; }
.app-body { display: grid; grid-template-columns: var(--sidebar-w) 1fr var(--panel-w); height: calc(100vh - var(--navbar-h)); overflow: hidden; }
.main-scroll { overflow-y: auto; height: 100%; padding: var(--sp-4); display: flex; flex-direction: column; gap: var(--sp-5); }
.tabs-bar { display: flex; gap: 2px; background: var(--bg-card); border-radius: var(--r-lg); padding: var(--sp-1); border: 1px solid var(--border-subtle); flex-wrap: wrap; }
.sport-tab {
  padding: 6px 14px; border-radius: var(--r-md); font-size: var(--text-sm); font-weight: 600;
  color: var(--text-secondary); background: none; border: none; cursor: pointer;
  transition: all var(--t-fast); display: flex; align-items: center; gap: 5px;
}
.sport-tab:hover { color: var(--text-primary); background: var(--bg-elevated); }
.sport-tab.active { background: var(--color-primary); color: #fff; }
.tab-count { font-size: var(--text-xs); background: rgba(239,68,68,0.2); color: #f87171; border-radius: var(--r-full); padding: 1px 5px; }
.promo-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-3); }
.promo-card { padding: var(--sp-4); border-radius: var(--r-lg); border: 1px solid var(--border-subtle); display: flex; align-items: flex-start; gap: var(--sp-3); cursor: pointer; transition: all var(--t-base); min-height: 105px; }
.promo-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: rgba(255,255,255,0.15); }
.promo-card--has-one { border-color: rgba(167, 139, 250, 0.4); }
.promo-card--has-two { border-color: #a78bfa; box-shadow: 0 0 20px rgba(167, 139, 250, 0.25); }
.promo-icon { font-size: 1.8rem; flex-shrink: 0; line-height: 1; }
.promo-content { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
.promo-title { font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); }
.promo-sub { font-size: var(--text-xs); color: var(--text-secondary); }
.promo-top-line { display: flex; align-items: center; justify-content: space-between; gap: var(--sp-2); }
.counter-badge {
  font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: var(--r-full);
  background: rgba(167, 139, 250, 0.2); color: #c4b5fd; border: 1px solid rgba(167, 139, 250, 0.35);
  white-space: nowrap;
}
.counter-badge--ready {
  background: rgba(52, 211, 153, 0.2); color: #6ee7b7; border-color: rgba(52, 211, 153, 0.4);
}
.selected-chip {
  display: flex; align-items: center; justify-content: space-between; gap: 6px;
  background: rgba(0, 0, 0, 0.35); padding: 4px 8px; border-radius: var(--r-sm);
  border: 1px solid rgba(167, 139, 250, 0.3); font-size: 11px; color: var(--text-primary);
}
.chip-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
.chip-remove {
  background: none; border: none; color: var(--text-muted); cursor: pointer;
  padding: 0 2px; font-size: 11px;
}
.chip-remove:hover { color: #f87171; }
.promo-hint { font-size: 10px; color: #a78bfa; font-weight: 500; }
.selected-duo {
  display: flex; align-items: center; gap: 4px; font-size: 11px;
  background: rgba(0, 0, 0, 0.3); padding: 3px 6px; border-radius: var(--r-sm);
  overflow: hidden;
}
.duo-item { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; font-weight: 600; color: #fff; }
.duo-vs { font-size: 9px; color: var(--text-muted); font-weight: 700; flex-shrink: 0; }
.compare-card-actions { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
.btn-compare-go {
  padding: 4px 10px; font-size: 11px; font-weight: 700; background: #8b5cf6; border: none;
}
.btn-compare-go:hover { background: #7c3aed; }
.btn-clear {
  background: none; border: 1px solid rgba(255,255,255,0.2); color: var(--text-secondary);
  font-size: 10px; padding: 3px 8px; border-radius: var(--r-sm); cursor: pointer;
}
.btn-clear:hover { background: rgba(255,255,255,0.1); color: #fff; }
.compare-toast-bar {
  background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.4);
  color: #c4b5fd; padding: var(--sp-2) var(--sp-4); border-radius: var(--r-md);
  font-size: var(--text-xs); font-weight: 600; text-align: center;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.2);
}
.section-header { display: flex; align-items: center; justify-content: space-between; }
.section-title { font-size: var(--text-xl); font-weight: 700; display: flex; align-items: center; gap: var(--sp-2); }
.live-dot-big { font-size: 10px; color: #f87171; animation: pulse 1.2s infinite; }
.section-count { font-size: var(--text-sm); color: var(--text-muted); }
.events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--sp-4); }
.state-card { padding: var(--sp-8); text-align: center; color: var(--text-secondary); background: var(--bg-card); border-radius: var(--r-lg); border: 1px solid var(--border-subtle); }
@media (max-width: 1200px) { .app-body { grid-template-columns: var(--sidebar-w) 1fr 0; } .right-panel { display: none; } }
@media (max-width: 900px) { .app-body { grid-template-columns: 1fr; } .promo-row { grid-template-columns: 1fr; } }
</style>

<template>
  <div class="page-layout">
    <Navbar />
    <div class="detail-page main-scroll" style="height: calc(100vh - var(--navbar-h)); overflow-y: auto;">
      <div v-if="loading" class="detail-loading">
        <div class="spinner"></div>
        <p>Loading event...</p>
      </div>
      <div v-else-if="!event" class="detail-notfound card">
        <p>Event not found.</p>
        <RouterLink to="/sports" class="btn btn-outline btn-sm">Browse Sports</RouterLink>
      </div>
      <div v-else class="detail-content anim-fade-up">
        <!-- Breadcrumb -->
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <RouterLink to="/">Home</RouterLink> /
          <RouterLink to="/sports">Sports</RouterLink> /
          <span>{{ event.homeTeam }} vs {{ event.awayTeam }}</span>
        </nav>

        <!-- Event header card -->
        <div class="detail-hero card">
          <div class="hero-top">
            <div class="hero-tags">
              <span class="badge" :class="event.isLive ? 'badge-live' : 'badge-upcoming'">
                {{ event.isLive ? '🔴 LIVE' : '🕐 Upcoming' }}
              </span>
              <span class="hero-league">{{ event.league }}</span>
            </div>
            <span class="hero-fit">{{ event.sessionFit }}% session fit</span>
          </div>

          <div class="hero-teams">
            <div class="hero-team">
              <div class="hero-team-name">{{ event.homeTeam }}</div>
              <div class="hero-odds">{{ event.homeOdds?.toFixed(2) }}</div>
            </div>
            <div class="hero-vs">VS</div>
            <div class="hero-team hero-team--away">
              <div class="hero-team-name">{{ event.awayTeam }}</div>
              <div class="hero-odds">{{ event.awayOdds?.toFixed(2) }}</div>
            </div>
          </div>

          <div v-if="event.drawOdds > 0" class="hero-draw">
            <span>Draw</span>
            <span class="hero-draw-odds">{{ event.drawOdds.toFixed(2) }}</span>
          </div>

          <div class="hero-info">
            <span>📍 {{ event.venue }}</span>
            <span>🌍 {{ event.country }}</span>
          </div>
        </div>

        <!-- Select option -->
        <div class="select-section card">
          <h3 class="select-title">Select an outcome</h3>
          <div class="select-buttons">
            <button class="select-btn" :class="{ selected: sessionStore.selectedEvent?.id === event.id && selectedOutcome === 'home' }"
              @click="selectOutcome('home')">
              <span>{{ event.homeTeam }}</span>
              <span class="select-odds">{{ event.homeOdds?.toFixed(2) }}</span>
            </button>
            <button v-if="event.drawOdds > 0" class="select-btn"
              :class="{ selected: selectedOutcome === 'draw' }" @click="selectOutcome('draw')">
              <span>Draw</span>
              <span class="select-odds">{{ event.drawOdds?.toFixed(2) }}</span>
            </button>
            <button class="select-btn" :class="{ selected: selectedOutcome === 'away' }" @click="selectOutcome('away')">
              <span>{{ event.awayTeam }}</span>
              <span class="select-odds">{{ event.awayOdds?.toFixed(2) }}</span>
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="detail-actions">
          <button class="btn" :class="isInCompare ? 'btn-compare-active' : 'btn-outline'" @click="toggleCompare">
            {{ isInCompare ? '✓ In Compare (Remove)' : '⚖️ Add to Compare' }}
          </button>
          <RouterLink v-if="comparisonStore.canCompare" to="/compare" class="btn btn-outline" style="border-color:#a78bfa; color:#c4b5fd;">
            Compare 2 Selected Events →
          </RouterLink>
          <RouterLink v-if="selectedOutcome" to="/review" class="btn btn-primary" @click="goReview">Review Selection →</RouterLink>
          <RouterLink to="/sports" class="btn btn-ghost">← Back to Sports</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/sessionStore'
import { useComparisonStore } from '@/stores/comparisonStore'
import { getEventById } from '@/services/sportsData'
import Navbar from '@/components/Navbar.vue'

const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()
const comparisonStore = useComparisonStore()
const event = ref(null)
const loading = ref(true)
const selectedOutcome = ref(null)

const isInCompare = computed(() => event.value && comparisonStore.isSelected(event.value.id))

function toggleCompare() {
  if (event.value) {
    comparisonStore.toggleEvent(event.value)
  }
}

onMounted(async () => {
  try {
    event.value = await getEventById(route.params.id)
    sessionStore.trackEvent('EVENT_OPENED', { id: route.params.id, title: event.value?.title || '' })
  } finally { loading.value = false }
})

function selectOutcome(outcome) {
  selectedOutcome.value = outcome
  sessionStore.selectEvent(event.value)
  sessionStore.trackEvent('OPTION_SELECTED', { id: event.value.id, title: `${event.value.homeTeam} vs ${event.value.awayTeam} — ${outcome}` })
}

function goReview() {
  sessionStore.trackEvent('CONFIRMATION_OPENED')
}
</script>

<style scoped>
.btn-compare-active {
  background: rgba(167, 139, 250, 0.2); border: 1px solid #a78bfa;
  color: #c4b5fd; font-weight: 600;
}
.btn-compare-active:hover { background: rgba(167, 139, 250, 0.35); }
.page-layout { display: grid; grid-template-rows: var(--navbar-h) 1fr; min-height: 100vh; }
.detail-page { padding: var(--sp-5); }
.detail-loading { display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); padding: var(--sp-12) 0; color: var(--text-secondary); }
.detail-notfound { padding: var(--sp-10); text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); color: var(--text-secondary); }
.detail-content { max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--sp-4); }
.breadcrumb { font-size: var(--text-sm); color: var(--text-muted); display: flex; gap: var(--sp-2); flex-wrap: wrap; }
.breadcrumb a { color: var(--text-accent); text-decoration: none; }
.breadcrumb a:hover { text-decoration: underline; }

.detail-hero { padding: var(--sp-6); display: flex; flex-direction: column; gap: var(--sp-4); }
.hero-top { display: flex; align-items: center; justify-content: space-between; }
.hero-tags { display: flex; align-items: center; gap: var(--sp-2); }
.hero-league { font-size: var(--text-xs); color: var(--text-muted); font-weight: 500; }
.hero-fit { font-size: var(--text-xs); color: var(--color-success); font-weight: 700; }
.hero-teams { display: flex; align-items: center; gap: var(--sp-6); }
.hero-team { flex: 1; display: flex; flex-direction: column; gap: var(--sp-1); }
.hero-team--away { align-items: flex-end; }
.hero-team-name { font-size: var(--text-xl); font-weight: 800; color: var(--text-primary); }
.hero-odds { font-size: var(--text-2xl); font-weight: 900; color: var(--color-primary-light); }
.hero-vs { font-size: var(--text-sm); font-weight: 800; color: var(--text-muted); }
.hero-draw { display: flex; justify-content: center; align-items: center; gap: var(--sp-4); padding: var(--sp-2) var(--sp-5); background: var(--bg-elevated); border-radius: var(--r-md); font-size: var(--text-sm); color: var(--text-secondary); }
.hero-draw-odds { font-weight: 700; color: var(--text-primary); }
.hero-info { display: flex; gap: var(--sp-4); font-size: var(--text-sm); color: var(--text-muted); }

.select-section { padding: var(--sp-5); }
.select-title { font-size: var(--text-base); font-weight: 700; margin-bottom: var(--sp-3); }
.select-buttons { display: flex; gap: var(--sp-3); }
.select-btn { flex: 1; padding: var(--sp-4); border-radius: var(--r-md); border: 1px solid var(--border-default); background: var(--bg-elevated); cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: var(--sp-2); transition: all var(--t-base); color: var(--text-primary); }
.select-btn:hover { border-color: var(--color-primary); background: rgba(26,115,232,0.08); }
.select-btn.selected { border-color: var(--color-primary); background: rgba(26,115,232,0.15); box-shadow: var(--shadow-glow); }
.select-odds { font-size: var(--text-xl); font-weight: 900; color: var(--color-primary-light); }
.detail-actions { display: flex; gap: var(--sp-3); flex-wrap: wrap; }
.detail-actions .btn { text-decoration: none; }
</style>

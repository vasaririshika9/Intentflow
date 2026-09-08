<template>
  <div class="page-layout">
    <Navbar />
    <div class="review-page main-scroll" style="height:calc(100vh - var(--navbar-h)); overflow-y:auto; padding: var(--sp-5);">
      <nav class="breadcrumb">
        <RouterLink to="/">Home</RouterLink> /
        <RouterLink to="/sports">Sports</RouterLink> /
        <span>Review Selection</span>
      </nav>

      <div class="review-header">
        <div class="review-tag">TRANSPARENT REVIEW</div>
        <h1 class="review-title">Review Before You Continue</h1>
        <p class="review-sub">Zero pressure. Verify your choice before moving forward.</p>
      </div>

      <!-- Decision Clarity Card if hesitating -->
      <div v-if="sessionStore.sessionState === 'HESITATING' && event" class="clarity-card card anim-fade-up">
        <div class="clarity-badge">DECISION CLARITY</div>
        <div class="clarity-body">
          <h3 class="clarity-title">You've reviewed this a few times.</h3>
          <p class="clarity-desc">That's perfectly fine. Here's a clear summary before you decide:</p>
          <ul class="clarity-checks" v-if="event">
            <li>✓ <strong>Your selection:</strong> {{ event.homeTeam }} vs {{ event.awayTeam }}</li>
            <li>✓ <strong>Competition:</strong> {{ event.league }}</li>
            <li>✓ <strong>Status:</strong> {{ event.isLive ? 'Currently LIVE' : 'Upcoming' }}</li>
            <li>✓ <strong>What happens next:</strong> Your selection is confirmed — no automatic charges.</li>
          </ul>
        </div>
        <div class="clarity-actions">
          <RouterLink to="/completion" class="btn btn-primary" @click="onConfirm">Confirm</RouterLink>
          <button class="btn btn-outline" @click="onReviewAgain">Review Again</button>
          <RouterLink to="/" class="btn btn-ghost">Continue Later</RouterLink>
        </div>
      </div>

      <!-- Normal review card -->
      <div v-else-if="event" class="review-card card anim-fade-up">
        <div class="rv-sport-tag">{{ event.sport }}</div>
        <div class="rv-teams">
          <span class="rv-team">{{ event.homeTeam }}</span>
          <span class="rv-vs">vs</span>
          <span class="rv-team">{{ event.awayTeam }}</span>
        </div>
        <div class="rv-league">{{ event.league }}</div>
        <div class="rv-details">
          <div class="rv-row">
            <span class="rv-k">Status</span>
            <span class="rv-v" :class="event.isLive ? 'live' : ''">{{ event.isLive ? '🔴 LIVE' : '🕐 Upcoming' }}</span>
          </div>
          <div class="rv-row" v-if="event.venue">
            <span class="rv-k">Venue</span>
            <span class="rv-v">{{ event.venue }}</span>
          </div>
          <div class="rv-row">
            <span class="rv-k">Home Odds</span>
            <span class="rv-v">{{ event.homeOdds?.toFixed(2) }}</span>
          </div>
          <div class="rv-row" v-if="event.drawOdds > 0">
            <span class="rv-k">Draw Odds</span>
            <span class="rv-v">{{ event.drawOdds?.toFixed(2) }}</span>
          </div>
          <div class="rv-row">
            <span class="rv-k">Away Odds</span>
            <span class="rv-v">{{ event.awayOdds?.toFixed(2) }}</span>
          </div>
        </div>
        <div class="rv-actions">
          <RouterLink to="/sports" class="btn btn-outline">Edit Selection</RouterLink>
          <RouterLink to="/confirm" class="btn btn-primary" @click="goConfirm">Continue →</RouterLink>
        </div>
      </div>

      <!-- No selection fallback -->
      <div v-else class="empty-review card">
        <p>No event selected.</p>
        <RouterLink to="/sports" class="btn btn-outline btn-sm">Browse Sports</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/sessionStore'
import Navbar from '@/components/Navbar.vue'

const router = useRouter()
const sessionStore = useSessionStore()
const event = computed(() => sessionStore.selectedEvent)

onMounted(() => {
  sessionStore.trackEvent('CONFIRMATION_OPENED')
})

function onConfirm() {
  sessionStore.trackEvent('ACTION_COMPLETED')
}
function onReviewAgain() {
  sessionStore.trackEvent('CONFIRMATION_REVIEWED')
}
function goConfirm() {
  sessionStore.trackEvent('CONFIRMATION_REVIEWED')
}
</script>

<style scoped>
.page-layout { display: grid; grid-template-rows: var(--navbar-h) 1fr; min-height: 100vh; }
.review-page { display: flex; flex-direction: column; gap: var(--sp-5); max-width: 640px; margin: 0 auto; width: 100%; }
.breadcrumb { font-size: var(--text-sm); color: var(--text-muted); display: flex; gap: var(--sp-2); }
.breadcrumb a { color: var(--text-accent); text-decoration: none; }
.review-tag { font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.1em; color: var(--color-primary-light); text-transform: uppercase; }
.review-title { font-size: var(--text-2xl); font-weight: 800; margin-top: 4px; }
.review-sub { font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px; }
/* Clarity card */
.clarity-card { padding: var(--sp-6); border-color: rgba(251,191,36,0.3); background: rgba(251,191,36,0.04); display: flex; flex-direction: column; gap: var(--sp-4); }
.clarity-badge { font-size: var(--text-xs); font-weight: 800; letter-spacing: 0.1em; color: #fbbf24; text-transform: uppercase; }
.clarity-title { font-size: var(--text-lg); font-weight: 700; }
.clarity-desc { font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px; }
.clarity-checks { display: flex; flex-direction: column; gap: var(--sp-2); margin-top: var(--sp-2); }
.clarity-checks li { font-size: var(--text-sm); color: var(--text-primary); }
.clarity-actions { display: flex; gap: var(--sp-3); flex-wrap: wrap; }
.clarity-actions a, .clarity-actions .btn { text-decoration: none; flex: 1; justify-content: center; }
/* Review card */
.review-card { padding: var(--sp-6); display: flex; flex-direction: column; gap: var(--sp-4); }
.rv-sport-tag { font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-primary-light); background: rgba(26,115,232,0.12); border-radius: var(--r-full); padding: 2px 10px; display: inline-block; width: fit-content; }
.rv-teams { display: flex; align-items: center; gap: var(--sp-4); }
.rv-team { font-size: var(--text-2xl); font-weight: 800; }
.rv-vs { font-size: var(--text-sm); color: var(--text-muted); font-weight: 700; }
.rv-league { font-size: var(--text-sm); color: var(--text-secondary); }
.rv-details { display: flex; flex-direction: column; gap: var(--sp-2); background: var(--bg-elevated); border-radius: var(--r-md); padding: var(--sp-4); }
.rv-row { display: flex; justify-content: space-between; }
.rv-k { font-size: var(--text-sm); color: var(--text-secondary); }
.rv-v { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); }
.rv-v.live { color: #f87171; }
.rv-actions { display: flex; gap: var(--sp-3); }
.rv-actions a, .rv-actions .btn { text-decoration: none; flex: 1; justify-content: center; }
.empty-review { padding: var(--sp-10); text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); color: var(--text-secondary); }
</style>

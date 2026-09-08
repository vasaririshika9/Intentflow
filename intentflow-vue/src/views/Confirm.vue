<template>
  <div class="page-layout">
    <Navbar />
    <div class="confirm-page main-scroll" style="height:calc(100vh - var(--navbar-h)); overflow-y:auto; padding: var(--sp-5);">
      <div class="confirm-content">
        <div class="confirm-tag">FINAL CONFIRMATION</div>
        <h1 class="confirm-title">Review Your Selection</h1>
        <p class="confirm-sub">This is your final step. Take your time — no pressure.</p>

        <div v-if="event" class="confirm-card card anim-fade-up">
          <div class="cc-header">
            <span class="cc-sport">{{ event.sport }}</span>
            <span class="cc-status badge" :class="event.isLive ? 'badge-live' : 'badge-upcoming'">{{ event.isLive ? '🔴 LIVE' : 'Upcoming' }}</span>
          </div>
          <div class="cc-teams">
            <div class="cc-team">{{ event.homeTeam }}<span class="cc-odds">{{ event.homeOdds?.toFixed(2) }}</span></div>
            <div class="cc-vs">vs</div>
            <div class="cc-team">{{ event.awayTeam }}<span class="cc-odds">{{ event.awayOdds?.toFixed(2) }}</span></div>
          </div>
          <div class="cc-league">{{ event.league }}</div>
          <div class="cc-info-row">
            <span>📍 {{ event.venue }}</span>
            <span>🌍 {{ event.country }}</span>
          </div>
          <div class="cc-responsible">
            <span class="cc-resp-icon">🛡️</span>
            <span>This action is protected by IntentFlow's responsible-play guarantees. Your session limits remain active.</span>
          </div>
        </div>

        <!-- All buttons equal visual weight -->
        <div class="confirm-actions">
          <button class="btn btn-primary btn-lg btn-full" :disabled="confirming" @click="confirm">
            <span v-if="confirming" class="spinner" style="width:18px;height:18px;margin-right:var(--sp-2)"></span>
            {{ confirming ? 'Confirming...' : 'Confirm' }}
          </button>
          <RouterLink to="/review" class="btn btn-outline btn-full">Review Again</RouterLink>
          <RouterLink to="/" class="btn btn-ghost btn-full">Continue Later</RouterLink>
        </div>

        <p class="confirm-note">No artificial urgency. No countdown timers. You decide when you're ready.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/sessionStore'
import Navbar from '@/components/Navbar.vue'

const router = useRouter()
const sessionStore = useSessionStore()
const event = computed(() => sessionStore.selectedEvent)
const confirming = ref(false)

async function confirm() {
  confirming.value = true
  await new Promise(r => setTimeout(r, 700))
  sessionStore.trackEvent('ACTION_COMPLETED')
  router.push('/completion')
}
</script>

<style scoped>
.page-layout { display: grid; grid-template-rows: var(--navbar-h) 1fr; min-height: 100vh; }
.confirm-page { display: flex; align-items: center; justify-content: center; }
.confirm-content { max-width: 540px; width: 100%; display: flex; flex-direction: column; gap: var(--sp-5); }
.confirm-tag { font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.1em; color: var(--color-success); text-transform: uppercase; }
.confirm-title { font-size: var(--text-3xl); font-weight: 900; }
.confirm-sub { font-size: var(--text-sm); color: var(--text-secondary); }
.confirm-card { padding: var(--sp-6); display: flex; flex-direction: column; gap: var(--sp-4); }
.cc-header { display: flex; align-items: center; justify-content: space-between; }
.cc-sport { font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; color: var(--color-primary-light); }
.cc-teams { display: flex; align-items: center; gap: var(--sp-5); }
.cc-team { display: flex; flex-direction: column; gap: 2px; font-size: var(--text-lg); font-weight: 800; }
.cc-odds { font-size: var(--text-2xl); font-weight: 900; color: var(--color-primary-light); }
.cc-vs { font-size: var(--text-sm); color: var(--text-muted); font-weight: 700; }
.cc-league { font-size: var(--text-sm); color: var(--text-secondary); }
.cc-info-row { display: flex; gap: var(--sp-4); font-size: var(--text-sm); color: var(--text-muted); }
.cc-responsible { display: flex; gap: var(--sp-2); padding: var(--sp-3); background: rgba(52,211,153,0.06); border-radius: var(--r-md); border: 1px solid rgba(52,211,153,0.2); font-size: var(--text-xs); color: var(--text-secondary); }
.cc-resp-icon { flex-shrink: 0; }
/* Equal weight buttons */
.confirm-actions { display: flex; flex-direction: column; gap: var(--sp-3); }
.confirm-actions .btn { text-decoration: none; justify-content: center; }
.confirm-note { font-size: var(--text-xs); color: var(--text-muted); text-align: center; line-height: 1.5; }
</style>

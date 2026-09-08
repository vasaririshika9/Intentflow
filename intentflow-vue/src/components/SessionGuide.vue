<template>
  <Transition name="guide-slide">
    <aside v-if="show" class="session-guide" role="complementary" aria-live="polite" aria-label="Session Guide">
      <div class="guide-header">
        <div class="guide-title-row">
          <span class="guide-icon">🧠</span>
          <span class="guide-title">SESSION GUIDE</span>
        </div>
        <button class="guide-close" @click="dismiss" aria-label="Dismiss guide">✕</button>
      </div>

      <p class="guide-message">{{ guideMessage }}</p>

      <!-- Confidence display -->
      <div class="guide-conf">
        <span class="guide-conf-label">Confidence</span>
        <span class="guide-conf-val" :style="`color:${confColor}`">{{ sessionStore.confidence }}%</span>
      </div>

      <!-- Why am I seeing this? -->
      <button class="guide-why-toggle" @click="showWhy = !showWhy" :aria-expanded="showWhy">
        Why am I seeing this? <span>{{ showWhy ? '▲' : '▼' }}</span>
      </button>
      <Transition name="fade">
        <div v-if="showWhy" class="guide-why">
          <p>{{ whyMessage }}</p>
          <ul>
            <li>🔍 <strong>In-session only</strong> — signals reset when your session ends</li>
            <li>🛡️ <strong>Zero pressure</strong> — this is a voluntary suggestion</li>
            <li>⚙️ <strong>Safety first</strong> — your limits always override any suggestion</li>
          </ul>
        </div>
      </Transition>

      <!-- Actions -->
      <div class="guide-actions">
        <button class="btn btn-ghost btn-sm" @click="dismiss">Not Now</button>
        <RouterLink :to="actionRoute" class="btn btn-primary btn-sm" @click="accept">
          {{ actionLabel }}
        </RouterLink>
      </div>
    </aside>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSessionStore } from '@/stores/sessionStore'
import { useComparisonStore } from '@/stores/comparisonStore'
import { getEventById } from '@/services/sportsData'
import { FRICTION_TYPES } from '@/utils/frictionDetection'

const sessionStore = useSessionStore()
const comparisonStore = useComparisonStore()
const showWhy = ref(false)
const show = ref(false)

// Only show if canIntervene and guide is requested
watch(() => sessionStore.showGuide, (v) => {
  if (v && sessionStore.canIntervene) {
    show.value = true
    sessionStore.recordIntervention()
  } else {
    show.value = false
  }
}, { immediate: true })

const guideMessage = computed(() => {
  const messages = {
    [FRICTION_TYPES.DISCOVERY]: "You're exploring many options. Would personalised suggestions help?",
    [FRICTION_TYPES.NAVIGATION]: "Looks like you're having trouble finding what you need. Let me help.",
    [FRICTION_TYPES.COMPARISON]: "You're exploring these options repeatedly. Would a side-by-side comparison help?",
    [FRICTION_TYPES.DECISION]: "You've reviewed your selection a few times. A clarity summary might help.",
    [FRICTION_TYPES.SAFETY]: "We've adjusted your experience to prioritise your safety.",
    [FRICTION_TYPES.NONE]: "You're doing great — progressing naturally.",
  }
  return messages[sessionStore.frictionType] || "How can I help with your session?"
})

const whyMessage = computed(() => {
  const m = {
    [FRICTION_TYPES.COMPARISON]: "You repeatedly explored these events, so comparing them side-by-side may help reduce decision confusion.",
    [FRICTION_TYPES.DECISION]: "You've opened the review step more than once without confirming.",
    [FRICTION_TYPES.DISCOVERY]: "You've visited many different categories without finding what you're looking for.",
    [FRICTION_TYPES.NAVIGATION]: "Multiple back navigations and searches detected in this session.",
    [FRICTION_TYPES.NONE]: "No friction detected — this is an informational nudge only.",
  }
  return m[sessionStore.frictionType] || "Session signals indicated this might be helpful."
})

const actionLabel = computed(() => {
  const labels = {
    [FRICTION_TYPES.COMPARISON]: 'Compare Now',
    [FRICTION_TYPES.DECISION]: 'View Clarity Card →',
    [FRICTION_TYPES.DISCOVERY]: 'See Recommendations →',
    [FRICTION_TYPES.NAVIGATION]: 'Browse Sports →',
  }
  return labels[sessionStore.frictionType] || 'View Events →'
})

const actionRoute = computed(() => {
  const routes = {
    [FRICTION_TYPES.COMPARISON]: '/compare',
    [FRICTION_TYPES.DECISION]: '/review',
    [FRICTION_TYPES.DISCOVERY]: '/sports',
    [FRICTION_TYPES.NAVIGATION]: '/sports',
  }
  return routes[sessionStore.frictionType] || '/'
})

const confColor = computed(() => {
  const c = sessionStore.confidence
  return c >= 70 ? '#34d399' : c >= 50 ? '#fbbf24' : '#f87171'
})

function dismiss() {
  show.value = false
  sessionStore.dismissGuide()
}

async function accept() {
  show.value = false
  if (sessionStore.frictionType === FRICTION_TYPES.COMPARISON && comparisonStore.count < 2) {
    const rawHist = Array.isArray(sessionStore.eventViewHistory) ? sessionStore.eventViewHistory : []
    const distinct = [...new Set(rawHist.filter(Boolean))].slice(-2)
    for (const id of distinct) {
      if (!comparisonStore.isSelected(id)) {
        try {
          const ev = await getEventById(id)
          if (ev) comparisonStore.addEvent(ev)
        } catch (e) {
          console.warn('Could not load comparison event', id, e)
        }
      }
    }
  }
  sessionStore.acceptIntervention()
}
</script>

<style scoped>
.session-guide {
  position: fixed; bottom: var(--sp-6); right: var(--sp-6); z-index: 200;
  width: 320px; background: var(--bg-card);
  border: 1px solid var(--border-default); border-radius: var(--r-xl);
  padding: var(--sp-5); box-shadow: var(--shadow-lg);
  display: flex; flex-direction: column; gap: var(--sp-3);
}
.guide-header { display: flex; align-items: center; justify-content: space-between; }
.guide-title-row { display: flex; align-items: center; gap: var(--sp-2); }
.guide-icon { font-size: 1.2rem; }
.guide-title { font-size: var(--text-xs); font-weight: 800; letter-spacing: 0.1em; color: var(--text-muted); text-transform: uppercase; }
.guide-close { width: 24px; height: 24px; border-radius: 50%; background: var(--bg-elevated); color: var(--text-secondary); font-size: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; transition: all var(--t-fast); }
.guide-close:hover { background: var(--border-default); color: var(--text-primary); }
.guide-message { font-size: var(--text-sm); color: var(--text-primary); line-height: 1.5; }
.guide-conf { display: flex; align-items: center; justify-content: space-between; }
.guide-conf-label { font-size: var(--text-xs); color: var(--text-muted); }
.guide-conf-val { font-size: var(--text-sm); font-weight: 700; }
.guide-why-toggle { font-size: var(--text-xs); color: var(--text-secondary); background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: var(--sp-1); padding: 0; }
.guide-why-toggle:hover { color: var(--text-primary); }
.guide-why { background: var(--bg-elevated); border-radius: var(--r-md); padding: var(--sp-3); display: flex; flex-direction: column; gap: var(--sp-2); }
.guide-why p { font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5; }
.guide-why ul { display: flex; flex-direction: column; gap: 4px; }
.guide-why li { font-size: var(--text-xs); color: var(--text-secondary); }
.guide-actions { display: flex; gap: var(--sp-2); }
.guide-actions .btn { flex: 1; justify-content: center; text-decoration: none; }

/* Transitions */
.guide-slide-enter-from { opacity: 0; transform: translateY(20px); }
.guide-slide-enter-active { transition: all 0.3s ease; }
.guide-slide-leave-to { opacity: 0; transform: translateY(20px); }
.guide-slide-leave-active { transition: all 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }

@media (max-width: 600px) {
  .session-guide { right: var(--sp-3); bottom: var(--sp-3); left: var(--sp-3); width: auto; }
}
</style>

<template>
  <div class="session-twin card" role="complementary" aria-label="Session Decision Twin">
    <div class="twin-header">
      <div class="twin-header-left">
        <span class="twin-title">SESSION DECISION TWIN</span>
        <span
          class="twin-user-type"
          :class="sessionStore.userProfile?.user_type === 'regular' ? 'user-regular' : 'user-new'"
        >
          {{ sessionStore.userProfile?.user_type === 'regular' ? '⭐ Returning User' : '🌱 New User' }}
        </span>
      </div>
      <span class="twin-status-dot" :class="`dot-${(sessionStore.sessionState || 'exploring').toLowerCase()}`"></span>
    </div>

    <!-- Current Intent & Stage -->
    <div class="twin-intent-box">
      <div class="intent-row">
        <span class="twin-label">Current Intent</span>
        <span class="intent-stage-badge" :class="`stage-${(sessionStore.intentStage || 'exploring').toLowerCase()}`">
          {{ sessionStore.intentStage || 'EXPLORING' }}
        </span>
      </div>
      <div class="intent-main-text">{{ sessionStore.intentLabel || 'Exploring Options' }}</div>
    </div>

    <!-- Confidence -->
    <div class="twin-row">
      <span class="twin-label">Confidence</span>
      <div class="twin-conf">
        <div class="conf-bar">
          <div class="conf-fill" :style="`width:${sessionStore.confidence}%; background:${confColor}`"></div>
        </div>
        <span class="twin-value" :style="`color:${confColor}`">{{ sessionStore.confidence }}%</span>
      </div>
    </div>

    <!-- Friction -->
    <div class="twin-row">
      <span class="twin-label">Friction</span>
      <span class="twin-friction" :style="`color:${frictionColor}`">
        {{ sessionStore.frictionLabel }}
      </span>
    </div>

    <!-- Safety -->
    <div class="twin-row">
      <span class="twin-label">Safety Status</span>
      <span class="twin-safety" :class="sessionStore.safetyStatus === 'SAFETY_OVERRIDE' ? 'safety-override' : 'safety-normal'">
        {{ sessionStore.safetyStatus === 'SAFETY_OVERRIDE' ? '🛡️ OVERRIDE' : '✓ NORMAL' }}
      </span>
    </div>

    <!-- Guidance Decision & Guardrail -->
    <div class="twin-guidance-box">
      <div class="guidance-header">
        <span class="twin-label">AI Guidance Action</span>
        <span class="guidance-action-pill" :class="`act-${(sessionStore.guidanceAction || 'explore').toLowerCase()}`">
          {{ sessionStore.guidanceAction || 'EXPLORE' }}
        </span>
      </div>
      <div class="guidance-desc">{{ sessionStore.guidanceDescription || 'Observing session flow.' }}</div>
      
      <!-- Direct Navigation Shortcut if NAVIGATE -->
      <RouterLink
        v-if="sessionStore.guidanceAction === 'NAVIGATE' && sessionStore.directNavigation"
        :to="sessionStore.directNavigation.path"
        class="direct-nav-shortcut"
      >
        <span>⚡ {{ sessionStore.directNavigation.label }}</span>
      </RouterLink>

      <!-- Responsible Guardrail Status -->
      <div class="guardrail-status-row">
        <span class="guardrail-icon">🛡️</span>
        <span class="guardrail-text">{{ sessionStore.guardrailReason || 'Responsible mode active' }}</span>
      </div>
    </div>

    <!-- Intervention Budget -->
    <div class="twin-budget">
      <div class="budget-header">
        <span class="twin-label">Intervention Budget</span>
        <span class="budget-count">{{ sessionStore.interventionCount }} / {{ sessionStore.interventionBudget }}</span>
      </div>
      <div class="budget-dots">
        <span v-for="i in sessionStore.interventionBudget" :key="i"
          class="budget-dot" :class="i <= sessionStore.interventionCount ? 'used' : 'free'">
        </span>
      </div>
      <span class="budget-label">Remaining: {{ sessionStore.remainingBudget }} (stops after budget)</span>
    </div>

    <!-- "Why am I seeing this?" signal audit -->
    <div class="twin-why-section">
      <button class="why-audit-btn" @click="showWhy = !showWhy">
        Why am I seeing this? <span>{{ showWhy ? '▲' : '▼' }}</span>
      </button>
      <div v-if="showWhy" class="why-audit-box anim-fade-up">
        <div class="why-title">Recorded Signals:</div>
        <ul class="why-audit-list">
          <li v-for="(sig, idx) in sessionStore.supportingSignals" :key="idx">
            {{ sig }}
          </li>
          <li v-if="sessionStore.supportingSignals.length === 0">
            Initial broad discovery interactions
          </li>
        </ul>

        <!-- User Controls inside Why -->
        <div class="twin-user-controls">
          <button class="btn-ctrl" @click="pauseRecs" v-if="!sessionStore.userProfile?.paused_recommendations">
            Pause AI Nudges
          </button>
          <button class="btn-ctrl btn-ctrl-active" @click="resumeRecs" v-else>
            Resume AI Nudges
          </button>
          <button class="btn-ctrl" @click="dislikeCurrent">
            Show Less Like This
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSessionStore } from '@/stores/sessionStore'
import { FRICTION_COLORS } from '@/utils/frictionDetection'

const sessionStore = useSessionStore()
const showWhy = ref(false)

const confColor = computed(() => {
  const c = sessionStore.confidence
  if (c >= 80) return '#34d399'
  if (c >= 55) return '#fbbf24'
  return '#f87171'
})

const frictionColor = computed(() => FRICTION_COLORS[sessionStore.frictionType] || '#8b949e')

function pauseRecs() {
  sessionStore.pauseRecommendations()
}

function resumeRecs() {
  sessionStore.resumeRecommendations()
}

function dislikeCurrent() {
  sessionStore.dislikeEntity(sessionStore.intentLabel || 'current')
}
</script>

<style scoped>
.session-twin {
  padding: var(--sp-4); display: flex; flex-direction: column; gap: var(--sp-3);
}
.twin-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--sp-1);
}
.twin-header-left {
  display: flex; align-items: center; gap: var(--sp-2);
}
.twin-title { font-size: var(--text-xs); font-weight: 800; letter-spacing: 0.1em; color: var(--text-muted); text-transform: uppercase; }
.twin-user-type {
  font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: var(--r-full);
}
.user-regular {
  color: #60a5fa; background: rgba(96, 165, 250, 0.15); border: 1px solid rgba(96, 165, 250, 0.3);
}
.user-new {
  color: #34d399; background: rgba(52, 211, 153, 0.15); border: 1px solid rgba(52, 211, 153, 0.3);
}

.twin-status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary); flex-shrink: 0; }
.dot-exploring { background: #60a5fa; } .dot-focusing { background: #818cf8; }
.dot-comparing { background: #a78bfa; } .dot-hesitating { background: #fbbf24; }
.dot-ready { background: #34d399; } .dot-completed { background: #34d399; }
.dot-safety_override { background: #f87171; animation: safetyPulse 2s infinite; }

.twin-intent-box {
  background: var(--bg-elevated); border-radius: var(--r-md); padding: var(--sp-3);
  display: flex; flex-direction: column; gap: 4px; border: 1px solid var(--border-subtle);
}
.intent-row { display: flex; justify-content: space-between; align-items: center; }
.intent-main-text { font-size: var(--text-sm); font-weight: 700; color: #fff; line-height: 1.3; }
.intent-stage-badge {
  font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: var(--r-full);
}
.stage-unknown { background: rgba(139, 148, 158, 0.2); color: #8b949e; }
.stage-exploring { background: rgba(96, 165, 250, 0.2); color: #60a5fa; }
.stage-interested { background: rgba(129, 140, 248, 0.2); color: #818cf8; }
.stage-focused { background: rgba(167, 139, 250, 0.2); color: #a78bfa; }
.stage-high_intent { background: rgba(52, 211, 153, 0.2); color: #34d399; }
.stage-satisfied { background: rgba(52, 211, 153, 0.25); color: #34d399; }

.twin-row { display: flex; align-items: center; justify-content: space-between; gap: var(--sp-2); }
.twin-label { font-size: var(--text-xs); color: var(--text-muted); font-weight: 500; flex-shrink: 0; }
.twin-value { font-size: var(--text-sm); font-weight: 700; }
.twin-friction { font-size: var(--text-sm); font-weight: 600; }
.twin-safety { font-size: var(--text-xs); font-weight: 700; padding: 2px 8px; border-radius: var(--r-full); }
.safety-normal { color: #34d399; background: rgba(52,211,153,0.1); }
.safety-override { color: #f87171; background: rgba(239,68,68,0.1); }

.twin-conf { display: flex; align-items: center; gap: var(--sp-2); flex: 1; justify-content: flex-end; }
.conf-bar { width: 60px; height: 4px; background: var(--bg-card); border-radius: var(--r-full); overflow: hidden; }
.conf-fill { height: 100%; border-radius: var(--r-full); transition: width 0.5s ease; }

.twin-guidance-box {
  background: rgba(26, 115, 232, 0.08); border: 1px solid rgba(26, 115, 232, 0.25);
  border-radius: var(--r-md); padding: var(--sp-3); display: flex; flex-direction: column; gap: var(--sp-2);
}
.guidance-header { display: flex; justify-content: space-between; align-items: center; }
.guidance-action-pill {
  font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: var(--r-full);
}
.act-explore { color: #60a5fa; background: rgba(96, 165, 250, 0.15); }
.act-clarify { color: #fbbf24; background: rgba(251, 191, 36, 0.15); }
.act-recommend { color: #818cf8; background: rgba(129, 140, 248, 0.15); }
.act-navigate { color: #34d399; background: rgba(52, 211, 153, 0.2); }
.act-simplify { color: #fb923c; background: rgba(251, 146, 60, 0.15); }
.act-stop { color: #34d399; background: rgba(52, 211, 153, 0.2); }

.guidance-desc { font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.4; }

.direct-nav-shortcut {
  display: block; font-size: var(--text-xs); font-weight: 700; color: #fff;
  background: var(--color-primary); padding: 5px 10px; border-radius: var(--r-md);
  text-decoration: none; text-align: center; transition: opacity var(--t-fast);
}
.direct-nav-shortcut:hover { opacity: 0.9; }

.guardrail-status-row {
  display: flex; align-items: center; gap: 5px; font-size: 11px; color: #34d399;
}
.guardrail-icon { font-size: 12px; }
.guardrail-text { line-height: 1.3; }

.twin-budget { background: var(--bg-elevated); border-radius: var(--r-md); padding: var(--sp-3); display: flex; flex-direction: column; gap: var(--sp-2); }
.budget-header { display: flex; justify-content: space-between; align-items: center; }
.budget-count { font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); }
.budget-dots { display: flex; gap: var(--sp-2); }
.budget-dot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--border-default); transition: all var(--t-base); }
.budget-dot.used { background: var(--color-primary); border-color: var(--color-primary); }
.budget-dot.free { background: transparent; }
.budget-label { font-size: 11px; color: var(--text-muted); }

.twin-why-section { display: flex; flex-direction: column; gap: var(--sp-1); }
.why-audit-btn {
  font-size: var(--text-xs); color: var(--text-secondary); background: none; border: none;
  cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 2px 0;
}
.why-audit-btn:hover { color: var(--text-primary); }
.why-audit-box {
  background: var(--bg-elevated); border-radius: var(--r-md); padding: var(--sp-3);
  display: flex; flex-direction: column; gap: var(--sp-2);
}
.why-title { font-size: 11px; font-weight: 700; color: var(--text-primary); }
.why-audit-list { padding-left: var(--sp-3); display: flex; flex-direction: column; gap: 3px; }
.why-audit-list li { font-size: 11px; color: var(--text-secondary); }

.twin-user-controls {
  display: flex; gap: var(--sp-1); flex-wrap: wrap; margin-top: var(--sp-1);
}
.btn-ctrl {
  font-size: 10px; color: var(--text-secondary); background: var(--bg-card);
  padding: 3px 6px; border-radius: var(--r-sm); border: 1px solid var(--border-subtle);
  cursor: pointer; transition: all var(--t-fast);
}
.btn-ctrl:hover { color: var(--text-primary); border-color: var(--border-default); }
.btn-ctrl-active { background: var(--color-primary); color: #fff; }
</style>

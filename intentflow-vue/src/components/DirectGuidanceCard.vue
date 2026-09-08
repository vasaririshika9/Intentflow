<template>
  <Transition name="fade">
    <div v-if="visible" class="direct-guidance-card card anim-fade-up">
      <div class="dg-header">
        <div class="dg-tag-row">
          <span class="dg-tag">⚡ DIRECT AI GUIDANCE</span>
          <span class="dg-confidence">{{ sessionStore.confidence }}% Intent Confidence</span>
        </div>
        <div class="dg-controls">
          <button
            class="btn-control"
            @click="dislikeEntity"
            title="Show less content like this"
          >
            Show Less
          </button>
          <button
            class="btn-control"
            @click="dismiss"
            title="Dismiss shortcut"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="dg-body">
        <div class="dg-info">
          <div class="dg-intent-text">
            Current Intent: <strong>{{ sessionStore.intentLabel }}</strong>
          </div>
          <h2 class="dg-title">
            {{ matchTitle || sessionStore.directNavigation?.entity || 'Your Target Match' }}
          </h2>
          <p class="dg-reason">
            ✓ {{ sessionStore.guidanceDescription }}
          </p>
        </div>

        <div class="dg-action-box">
          <RouterLink
            :to="sessionStore.directNavigation?.path || '/sports'"
            class="btn btn-primary btn-lg"
            @click="onDirectClick"
          >
            {{ sessionStore.directNavigation?.label || 'Open Match Directly →' }}
          </RouterLink>
          <span class="dg-skip-steps">Skips 5+ catalog browsing steps</span>
        </div>
      </div>

      <!-- Why am I seeing this expandable -->
      <div class="dg-footer">
        <button class="why-toggle" @click="showWhy = !showWhy">
          Why am I seeing this shortcut? <span>{{ showWhy ? '▲' : '▼' }}</span>
        </button>
        <div v-if="showWhy" class="why-box anim-fade-up">
          <div class="why-title">Recorded In-Session Signals:</div>
          <ul class="why-list">
            <li v-for="(sig, idx) in sessionStore.supportingSignals" :key="idx">
              {{ sig }}
            </li>
          </ul>
          <div class="why-guardrail">
            🛡️ <strong>Responsible Guardrail:</strong> Zero artificial urgency or countdown pressure.
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/sessionStore'

const router = useRouter()
const sessionStore = useSessionStore()
const dismissed = ref(false)
const showWhy = ref(false)

const visible = computed(() => {
  return (
    !dismissed.value &&
    sessionStore.guidanceAction === 'NAVIGATE' &&
    sessionStore.directNavigation &&
    sessionStore.safetyStatus !== 'SAFETY_OVERRIDE' &&
    sessionStore.confirmCount === 0
  )
})

const matchTitle = computed(() => {
  return sessionStore.directNavigation?.entity || 'Arsenal vs Chelsea'
})

function onDirectClick() {
  sessionStore.trackEvent('DIRECT_GUIDANCE_CLICKED', {
    target: sessionStore.directNavigation?.path,
    entity: matchTitle.value,
  })
}

function dislikeEntity() {
  const entity = sessionStore.directNavigation?.entity || sessionStore.intentLabel
  sessionStore.dislikeEntity(entity)
  dismissed.value = true
}

function dismiss() {
  dismissed.value = true
}
</script>

<style scoped>
.direct-guidance-card {
  background: linear-gradient(135deg, rgba(16, 32, 64, 0.95), rgba(26, 115, 232, 0.2));
  border: 1px solid rgba(26, 115, 232, 0.45);
  border-radius: var(--r-xl);
  padding: var(--sp-5);
  margin-bottom: var(--sp-4);
  box-shadow: 0 8px 32px rgba(26, 115, 232, 0.2);
}

.dg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--sp-3);
}

.dg-tag-row {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.dg-tag {
  font-size: var(--text-xs);
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #fff;
  background: var(--color-primary);
  padding: 3px 8px;
  border-radius: var(--r-full);
}

.dg-confidence {
  font-size: var(--text-xs);
  font-weight: 700;
  color: #34d399;
  background: rgba(52, 211, 153, 0.12);
  padding: 2px 8px;
  border-radius: var(--r-full);
}

.dg-controls {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.btn-control {
  font-size: var(--text-xs);
  color: var(--text-muted);
  background: var(--bg-elevated);
  padding: 3px 8px;
  border-radius: var(--r-sm);
  cursor: pointer;
  transition: all var(--t-fast);
}

.btn-control:hover {
  color: var(--text-primary);
  background: var(--border-default);
}

.dg-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--sp-4);
  margin-bottom: var(--sp-3);
}

@media (max-width: 768px) {
  .dg-body {
    flex-direction: column;
    align-items: flex-start;
  }
}

.dg-intent-text {
  font-size: var(--text-xs);
  color: var(--color-primary-light);
  margin-bottom: 2px;
}

.dg-title {
  font-size: var(--text-xl);
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
}

.dg-reason {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.4;
}

.dg-action-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.dg-skip-steps {
  font-size: 11px;
  color: var(--text-muted);
}

.dg-footer {
  border-top: 1px solid var(--border-subtle);
  padding-top: var(--sp-3);
  margin-top: var(--sp-2);
}

.why-toggle {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--sp-1);
}

.why-toggle:hover {
  color: var(--text-primary);
}

.why-box {
  background: var(--bg-elevated);
  border-radius: var(--r-md);
  padding: var(--sp-3);
  margin-top: var(--sp-2);
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.why-title {
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--text-primary);
}

.why-list {
  padding-left: var(--sp-4);
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.why-list li {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.why-guardrail {
  font-size: var(--text-xs);
  color: #34d399;
}
</style>

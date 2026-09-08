<template>
  <div class="demo-panel card anim-slide-right" v-if="demoStore.panelOpen">
    <div class="dp-header">
      <div class="dp-title-row">
        <span class="dp-icon">🎛️</span>
        <div>
          <div class="dp-title">Demo Controls</div>
          <div class="dp-sub">FEG Hackathon 2026 · Ctrl+Shift+D</div>
        </div>
      </div>
      <button class="dp-close" @click="demoStore.closePanel()">✕</button>
    </div>

    <!-- 5 Scenario presets -->
    <div class="dp-section">
      <div class="dp-section-label">Scenarios</div>
      <div class="dp-presets">
        <button v-for="(preset, key) in demoStore.presets" :key="key"
          class="dp-preset" :class="{ active: demoStore.activePreset === key }"
          @click="applyScenario(key)">
          <span class="preset-label">{{ preset.label }}</span>
          <span class="preset-desc">{{ preset.description }}</span>
        </button>
      </div>
    </div>

    <!-- Current state display -->
    <div class="dp-section">
      <div class="dp-section-label">Live State</div>
      <div class="dp-state-grid">
        <div class="ds-row">
          <span class="ds-k">Intent</span>
          <span class="ds-v" :class="`state-${sessionStore.sessionState.toLowerCase()}`">{{ sessionStore.sessionState }}</span>
        </div>
        <div class="ds-row">
          <span class="ds-k">Confidence</span>
          <span class="ds-v">{{ sessionStore.confidence }}%</span>
        </div>
        <div class="ds-row">
          <span class="ds-k">Friction</span>
          <span class="ds-v">{{ sessionStore.frictionType }}</span>
        </div>
        <div class="ds-row">
          <span class="ds-k">Safety</span>
          <span class="ds-v">{{ sessionStore.safetyStatus }}</span>
        </div>
        <div class="ds-row">
          <span class="ds-k">Budget</span>
          <span class="ds-v">{{ sessionStore.remainingBudget }} / {{ sessionStore.interventionBudget }} left</span>
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="dp-section">
      <div class="dp-section-label">Quick Actions</div>
      <div class="dp-quick">
        <button class="btn btn-sm btn-outline btn-full" @click="sessionStore.activateSafetyOverride()">🛡️ Activate Safety Override</button>
        <button class="btn btn-sm btn-outline btn-full" @click="sessionStore.deactivateSafetyOverride()">↩ Deactivate Safety</button>
        <button class="btn btn-sm btn-outline btn-full" @click="sessionStore.showGuide = true">🧠 Show Session Guide</button>
        <button class="btn btn-sm btn-danger btn-full" @click="resetAll()">🔄 Reset Session</button>
      </div>
    </div>

    <!-- URL hint -->
    <div class="dp-url-hint">
      URL: <code>?demo=exploring|comparing|hesitating|safety|natural</code>
    </div>
  </div>
</template>

<script setup>
import { useSessionStore } from '@/stores/sessionStore'
import { useDemoStore } from '@/stores/demoStore'
const sessionStore = useSessionStore()
const demoStore = useDemoStore()

function applyScenario(key) {
  demoStore.applyPreset(key)
}
function resetAll() {
  demoStore.clearDemo()
}
</script>

<style scoped>
.demo-panel {
  position: fixed; bottom: var(--sp-5); left: var(--sp-5); z-index: 250;
  width: 340px; background: var(--bg-card);
  border: 1px solid var(--color-primary); border-radius: var(--r-xl);
  padding: var(--sp-5); box-shadow: var(--shadow-glow);
  display: flex; flex-direction: column; gap: var(--sp-4); max-height: 85vh; overflow-y: auto;
}
.dp-header { display: flex; align-items: center; justify-content: space-between; }
.dp-title-row { display: flex; align-items: center; gap: var(--sp-3); }
.dp-icon { font-size: 1.4rem; }
.dp-title { font-size: var(--text-sm); font-weight: 800; color: var(--text-primary); }
.dp-sub { font-size: var(--text-xs); color: var(--text-muted); }
.dp-close { width: 26px; height: 26px; border-radius: 50%; background: var(--bg-elevated); border: none; color: var(--text-secondary); cursor: pointer; font-size: 12px; transition: all var(--t-fast); }
.dp-close:hover { background: var(--border-default); }
.dp-section-label { font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; margin-bottom: var(--sp-2); }
.dp-presets { display: flex; flex-direction: column; gap: var(--sp-2); }
.dp-preset { padding: var(--sp-3); border-radius: var(--r-md); border: 1px solid var(--border-default); background: var(--bg-elevated); cursor: pointer; text-align: left; display: flex; flex-direction: column; gap: 2px; transition: all var(--t-fast); }
.dp-preset:hover { border-color: var(--color-primary); }
.dp-preset.active { border-color: var(--color-primary); background: rgba(26,115,232,0.1); }
.preset-label { font-size: var(--text-xs); font-weight: 700; color: var(--text-primary); }
.preset-desc { font-size: var(--text-xs); color: var(--text-muted); line-height: 1.4; }
.dp-state-grid { display: flex; flex-direction: column; gap: var(--sp-1); background: var(--bg-elevated); border-radius: var(--r-md); padding: var(--sp-3); }
.ds-row { display: flex; justify-content: space-between; align-items: center; }
.ds-k { font-size: var(--text-xs); color: var(--text-muted); }
.ds-v { font-size: var(--text-xs); font-weight: 700; color: var(--text-primary); }
.dp-quick { display: flex; flex-direction: column; gap: var(--sp-2); }
.dp-url-hint { font-size: 10px; color: var(--text-muted); background: var(--bg-elevated); border-radius: var(--r-sm); padding: var(--sp-2); }
.dp-url-hint code { color: var(--text-accent); }
</style>

<template>
  <div v-if="sessionStore.safetyStatus === 'SAFETY_OVERRIDE'" class="safety-overlay">
    <div class="safety-card anim-fade-up">
      <!-- Header -->
      <div class="safety-icon-wrap">
        <div class="safety-shield">🛡️</div>
        <div class="safety-pulse-ring"></div>
      </div>
      <div class="safety-badge">SAFETY OVERRIDE ACTIVE</div>
      <h2 class="safety-title">Conversion optimization paused.</h2>
      <p class="safety-desc">
        The experience has been adjusted to prioritise your safety and control.
        All recommendations and nudges are currently disabled.
      </p>

      <!-- Tools -->
      <div class="safety-tools">
        <div class="safety-tool" v-for="tool in tools" :key="tool.label">
          <span class="tool-icon">{{ tool.icon }}</span>
          <div>
            <div class="tool-label">{{ tool.label }}</div>
            <div class="tool-desc">{{ tool.desc }}</div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="safety-actions">
        <button class="btn btn-outline btn-full" @click="sessionStore.deactivateSafetyOverride()">
          Continue browsing
        </button>
        <RouterLink to="/" class="btn btn-ghost btn-sm btn-full">Return to home</RouterLink>
      </div>

      <p class="safety-note">
        <strong>When safety risk increases, conversion optimization decreases.</strong>
        This is a core IntentFlow principle.
      </p>
    </div>
  </div>
</template>

<script setup>
import { useSessionStore } from '@/stores/sessionStore'
const sessionStore = useSessionStore()
const tools = [
  { icon: '⏱️', label: 'Responsible-play tools', desc: 'Set session time limits' },
  { icon: '💳', label: 'View limits', desc: 'Review your deposit limits' },
  { icon: '☕', label: 'Take a break', desc: 'Step away for a moment' },
  { icon: '⏸️', label: 'Continue later', desc: 'Your session is saved' },
]
</script>

<style scoped>
.safety-overlay {
  position: fixed; inset: 0; z-index: 300;
  background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; padding: var(--sp-4);
}
.safety-card {
  background: var(--bg-card); border: 1px solid rgba(239,68,68,0.4);
  border-radius: var(--r-xl); padding: var(--sp-8); max-width: 480px; width: 100%;
  display: flex; flex-direction: column; align-items: center; gap: var(--sp-5);
  text-align: center; box-shadow: var(--shadow-glow-red);
}
.safety-icon-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
.safety-shield { font-size: 3rem; z-index: 1; }
.safety-pulse-ring {
  position: absolute; width: 64px; height: 64px; border-radius: 50%;
  border: 2px solid rgba(239,68,68,0.4); animation: ripple 2s infinite;
}
.safety-badge {
  font-size: var(--text-xs); font-weight: 800; letter-spacing: 0.12em;
  color: #f87171; background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3); border-radius: var(--r-full); padding: 4px 14px;
}
.safety-title { font-size: var(--text-2xl); font-weight: 800; color: var(--text-primary); }
.safety-desc { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; max-width: 380px; }
.safety-tools { width: 100%; display: flex; flex-direction: column; gap: var(--sp-2); }
.safety-tool {
  display: flex; align-items: center; gap: var(--sp-4); padding: var(--sp-3) var(--sp-4);
  background: var(--bg-elevated); border-radius: var(--r-md); text-align: left;
  border: 1px solid var(--border-subtle); cursor: pointer;
  transition: border-color var(--t-fast);
}
.safety-tool:hover { border-color: rgba(239,68,68,0.3); }
.tool-icon { font-size: 1.3rem; flex-shrink: 0; }
.tool-label { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); }
.tool-desc { font-size: var(--text-xs); color: var(--text-secondary); }
.safety-actions { width: 100%; display: flex; flex-direction: column; gap: var(--sp-2); }
.safety-note { font-size: var(--text-xs); color: var(--text-muted); line-height: 1.5; max-width: 360px; }
</style>

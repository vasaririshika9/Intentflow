<template>
  <div class="session-orbit">
    <div class="orbit-track">
      <div v-for="(stage, i) in stages" :key="stage.id"
        class="orbit-stage" :class="{ active: isActive(stage.id), completed: isCompleted(stage.id), upcoming: !isActive(stage.id) && !isCompleted(stage.id) }">
        <div class="orbit-node">
          <span class="orbit-icon">{{ stage.icon }}</span>
          <div v-if="isActive(stage.id)" class="orbit-pulse"></div>
        </div>
        <div class="orbit-connector" v-if="i < stages.length - 1" :class="{ completed: isCompleted(stages[i+1].id) || isActive(stages[i+1].id) }"></div>
        <div class="orbit-label">{{ stage.label }}</div>
        <div v-if="isActive(stage.id)" class="orbit-active-badge">ACTIVE</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSessionStore } from '@/stores/sessionStore'
import { SESSION_STATES } from '@/utils/intentDetection'

const sessionStore = useSessionStore()

const stages = [
  { id: 'intent', label: 'Intent', icon: '🎯', states: [SESSION_STATES.EXPLORING, SESSION_STATES.FOCUSING] },
  { id: 'discover', label: 'Discover', icon: '🔍', states: [SESSION_STATES.FOCUSING, SESSION_STATES.COMPARING] },
  { id: 'guide', label: 'Guide', icon: '🧠', states: [SESSION_STATES.COMPARING, SESSION_STATES.HESITATING] },
  { id: 'action', label: 'Action', icon: '✅', states: [SESSION_STATES.READY, SESSION_STATES.COMPLETED] },
]

const stageOrder = stages.map(s => s.id)

function currentStageId() {
  const state = sessionStore.sessionState
  for (const stage of stages) {
    if (stage.states.includes(state)) return stage.id
  }
  return 'intent'
}

function isActive(id) { return id === currentStageId() }

function isCompleted(id) {
  const cur = stageOrder.indexOf(currentStageId())
  const idx = stageOrder.indexOf(id)
  return idx < cur
}
</script>

<style scoped>
.session-orbit { padding: var(--sp-4) 0; }
.orbit-track {
  display: flex; align-items: flex-start; justify-content: space-between;
  position: relative; gap: 0;
}
.orbit-stage { display: flex; flex-direction: column; align-items: center; gap: var(--sp-2); position: relative; flex: 1; }
.orbit-node {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-elevated); border: 2px solid var(--border-default);
  position: relative; z-index: 1; transition: all var(--t-base);
}
.orbit-stage.active .orbit-node {
  border-color: var(--color-primary); background: rgba(26,115,232,0.15);
  box-shadow: var(--shadow-glow);
}
.orbit-stage.completed .orbit-node {
  border-color: #34d399; background: rgba(52,211,153,0.1);
}
.orbit-icon { font-size: 1.1rem; }
.orbit-pulse {
  position: absolute; inset: -4px; border-radius: 50%;
  border: 2px solid var(--color-primary); animation: ripple 2s infinite; opacity: 0.6;
}
.orbit-connector {
  position: absolute; top: 21px; left: calc(50% + 22px); right: calc(-50% + 22px);
  height: 2px; background: var(--border-default); z-index: 0; transition: background var(--t-base);
}
.orbit-connector.completed { background: #34d399; }
.orbit-label { font-size: var(--text-xs); font-weight: 600; color: var(--text-secondary); text-align: center; }
.orbit-stage.active .orbit-label { color: var(--color-primary-light); }
.orbit-stage.completed .orbit-label { color: #34d399; }
.orbit-active-badge {
  font-size: 9px; font-weight: 800; letter-spacing: 0.08em;
  color: var(--color-primary-light); background: rgba(26,115,232,0.12);
  padding: 1px 5px; border-radius: var(--r-full); animation: fadeIn 0.3s ease;
}
</style>

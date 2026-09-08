<template>
  <div class="journey-health card">
    <div class="jh-header">
      <div>
        <div class="jh-label">JOURNEY HEALTH SCORE</div>
        <div class="jh-score anim-fade-up" :class="scoreClass">
          <span class="jh-num" ref="numEl">{{ animatedScore }}</span>
          <span class="jh-denom">/100</span>
        </div>
      </div>
      <div class="jh-ring" :class="scoreClass">
        <svg viewBox="0 0 64 64" width="64" height="64">
          <circle cx="32" cy="32" r="27" fill="none" stroke="var(--bg-elevated)" stroke-width="6"/>
          <circle cx="32" cy="32" r="27" fill="none" :stroke="ringColor" stroke-width="6"
            stroke-linecap="round" stroke-dasharray="169.6"
            :stroke-dashoffset="dashOffset" transform="rotate(-90 32 32)"
            style="transition: stroke-dashoffset 1s ease"/>
        </svg>
        <span class="ring-inner">{{ health.total }}</span>
      </div>
    </div>

    <!-- Component breakdown -->
    <div class="jh-components">
      <div v-for="(val, key) in health.components" :key="key" class="jh-row">
        <span class="jh-comp-label">{{ compLabel(key) }}</span>
        <div class="jh-bar-wrap">
          <div class="jh-bar" :class="val < 0 ? 'jh-bar--neg' : 'jh-bar--pos'"
            :style="`width: ${Math.abs(val)}%; background: ${barColor(val)}`"></div>
        </div>
        <span class="jh-comp-val" :class="val < 0 ? 'neg' : 'pos'">{{ val > 0 ? '+' : '' }}{{ val }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useSessionStore } from '@/stores/sessionStore'

const sessionStore = useSessionStore()
const animatedScore = ref(0)

const health = computed(() => sessionStore.journeyHealth)

watch(() => health.value.total, (target) => {
  const start = animatedScore.value
  const step = (target - start) / 30
  let current = start
  const timer = setInterval(() => {
    current += step
    if ((step > 0 && current >= target) || (step < 0 && current <= target)) {
      animatedScore.value = target
      clearInterval(timer)
    } else {
      animatedScore.value = Math.round(current)
    }
  }, 20)
}, { immediate: true })

const scoreClass = computed(() => {
  const s = health.value.total
  if (s >= 75) return 'score-good'
  if (s >= 50) return 'score-mid'
  return 'score-low'
})

const ringColor = computed(() => {
  const s = health.value.total
  if (s >= 75) return '#34d399'
  if (s >= 50) return '#fbbf24'
  return '#f87171'
})

const dashOffset = computed(() => {
  const circ = 169.6
  return circ - (circ * health.value.total) / 100
})

const LABELS = {
  relevance: 'Relevance', progress: 'Progress',
  decisionClarity: 'Decision Clarity', userControl: 'User Control',
  meaningfulActions: 'Meaningful Actions',
  frictionPenalty: 'Friction', intrusivePenalty: 'Interventions',
}
function compLabel(k) { return LABELS[k] || k }
function barColor(v) {
  if (v < 0) return '#f87171'
  if (v >= 80) return '#34d399'
  if (v >= 60) return '#60a5fa'
  return '#fbbf24'
}
</script>

<style scoped>
.journey-health { padding: var(--sp-5); }
.jh-label { font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.1em; color: var(--text-muted); text-transform: uppercase; margin-bottom: var(--sp-1); }
.jh-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--sp-5); }
.jh-score { display: flex; align-items: baseline; gap: 2px; }
.jh-num { font-size: var(--text-4xl); font-weight: 900; line-height: 1; }
.jh-denom { font-size: var(--text-lg); color: var(--text-muted); }
.score-good .jh-num { color: #34d399; }
.score-mid .jh-num { color: #fbbf24; }
.score-low .jh-num { color: #f87171; }
.jh-ring { position: relative; display: flex; align-items: center; justify-content: center; }
.ring-inner { position: absolute; font-size: var(--text-xs); font-weight: 700; color: var(--text-secondary); }
.jh-components { display: flex; flex-direction: column; gap: var(--sp-2); }
.jh-row { display: grid; grid-template-columns: 130px 1fr 36px; align-items: center; gap: var(--sp-3); }
.jh-comp-label { font-size: var(--text-xs); color: var(--text-secondary); font-weight: 500; }
.jh-bar-wrap { height: 5px; background: var(--bg-elevated); border-radius: var(--r-full); overflow: hidden; }
.jh-bar { height: 100%; border-radius: var(--r-full); transition: width 0.8s ease; }
.jh-comp-val { font-size: var(--text-xs); font-weight: 700; text-align: right; }
.jh-comp-val.pos { color: #34d399; }
.jh-comp-val.neg { color: #f87171; }
</style>

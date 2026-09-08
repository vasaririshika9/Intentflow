<template>
  <div class="page-layout">
    <Navbar />
    <div class="impact-page main-scroll" style="height:calc(100vh - var(--navbar-h)); overflow-y:auto; padding: var(--sp-5);">
      <div class="impact-header">
        <div class="impact-pill">📈 FEG INNOVATION HACKATHON 2026 · CHALLENGE 1</div>
        <h1 class="impact-title">Product Impact Dashboard</h1>
        <p class="impact-sub">Modelled improvements in session conversion, decision speed, and friction reduction.</p>
      </div>

      <!-- Disclaimer -->
      <div class="disclaimer card">
        <span>⚠️</span>
        <div>
          <strong>Prototype Assumptions</strong>
          <p>All figures represent modelled prototype benchmarks for hackathon evaluation, not real historical FEG data.</p>
        </div>
      </div>

      <!-- Visual funnel -->
      <div class="funnel-section card">
        <h3 class="card-label">SESSION CONVERSION FUNNEL</h3>
        <div class="funnel">
          <div v-for="(step, i) in funnel" :key="step.id" class="funnel-step" :class="`funnel-step--${step.color}`">
            <div class="fs-icon">{{ step.icon }}</div>
            <div class="fs-label">{{ step.label }}</div>
            <div class="fs-val">{{ step.value }}</div>
            <div v-if="i < funnel.length - 1" class="fs-arrow">→</div>
          </div>
        </div>
      </div>

      <!-- Metrics comparison grid -->
      <div class="metrics-grid stagger">
        <div v-for="m in metrics" :key="m.id" class="metric-card card">
          <div class="mc-header">
            <div>
              <h3 class="mc-title">{{ m.label }}</h3>
              <p class="mc-desc">{{ m.description }}</p>
            </div>
            <span class="mc-badge" :class="m.positive ? 'badge-pos' : 'badge-neg'">{{ m.improvement }}</span>
          </div>
          <div class="mc-bars">
            <div class="bar-row">
              <span class="bar-label">Industry baseline</span>
              <div class="bar-wrap"><div class="bar bar-before" :style="`width: ${m.beforePct}%`"></div></div>
              <span class="bar-val">{{ m.before }}</span>
            </div>
            <div class="bar-row">
              <span class="bar-label">IntentFlow active</span>
              <div class="bar-wrap"><div class="bar bar-after" :style="`width: ${m.afterPct}%`"></div></div>
              <span class="bar-val highlight">{{ m.after }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- The Promise -->
      <div class="promise-card card">
        <div class="promise-badge">THE INTENTFLOW PROMISE</div>
        <blockquote class="promise-quote">"We help users do what they came here to do — with less friction and more confidence."</blockquote>
        <p class="promise-sub">By replacing urgency patterns with transparent, real-time intent guidance, users make confident decisions in half the time — while safety protections strictly override all personalisation.</p>
        <div class="promise-actions">
          <RouterLink to="/session-quality" class="btn btn-outline">← Session Quality</RouterLink>
          <RouterLink to="/" class="btn btn-primary" @click="sessionStore.reset()">Start New Session 🚀</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSessionStore } from '@/stores/sessionStore'
import Navbar from '@/components/Navbar.vue'

const sessionStore = useSessionStore()

const funnel = [
  { id: 1, icon: '👥', label: 'Existing Traffic', value: '100%', color: 'blue' },
  { id: 2, icon: '🎯', label: 'Intent Detected', value: '73%', color: 'indigo' },
  { id: 3, icon: '🧠', label: 'Friction Resolved', value: '61%', color: 'purple' },
  { id: 4, icon: '⚖️', label: 'Confident Decision', value: '44%', color: 'green' },
  { id: 5, icon: '♻️', label: 'Better Retention', value: '38%', color: 'emerald' },
]

const metrics = [
  { id: 1, label: 'Session-to-Action Rate', description: 'Sessions that result in a meaningful action', before: '18%', after: '27%', beforePct: 36, afterPct: 54, improvement: '+50%', positive: true },
  { id: 2, label: 'Median Decision Time', description: 'Time from landing to first meaningful action', before: '9.2 min', after: '3.8 min', beforePct: 70, afterPct: 29, improvement: '-59%', positive: true },
  { id: 3, label: 'Friction Resolution Rate', description: 'Sessions where detected friction was resolved', before: '—', after: '78%', beforePct: 0, afterPct: 78, improvement: 'New metric', positive: true },
  { id: 4, label: 'Premature Session Exits', description: 'Sessions ending before goal completion', before: '64%', after: '31%', beforePct: 64, afterPct: 31, improvement: '-52%', positive: true },
  { id: 5, label: 'D30 Retention', description: 'Users returning within 30 days', before: '22%', after: '34%', beforePct: 22, afterPct: 34, improvement: '+55%', positive: true },
  { id: 6, label: 'Safety Override Rate', description: 'Sessions with responsible-play override triggered', before: '—', after: '2.1%', beforePct: 0, afterPct: 21, improvement: 'New guard', positive: true },
]
</script>

<style scoped>
.page-layout { display: grid; grid-template-rows: var(--navbar-h) 1fr; min-height: 100vh; }
.impact-page { display: flex; flex-direction: column; gap: var(--sp-5); }
.impact-pill { font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.08em; color: var(--color-primary-light); text-transform: uppercase; margin-bottom: var(--sp-2); }
.impact-title { font-size: var(--text-3xl); font-weight: 900; }
.impact-sub { font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px; }
.disclaimer { padding: var(--sp-4); display: flex; align-items: flex-start; gap: var(--sp-3); border-color: rgba(251,191,36,0.3); background: rgba(251,191,36,0.04); }
.disclaimer strong { display: block; font-size: var(--text-sm); font-weight: 700; color: #fbbf24; margin-bottom: 4px; }
.disclaimer p { font-size: var(--text-xs); color: var(--text-secondary); }
.card-label { font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.1em; color: var(--text-muted); text-transform: uppercase; margin-bottom: var(--sp-4); }
/* Funnel */
.funnel-section { padding: var(--sp-5); }
.funnel { display: flex; align-items: center; gap: 0; overflow-x: auto; padding-bottom: var(--sp-2); }
.funnel-step { display: flex; flex-direction: column; align-items: center; gap: var(--sp-2); padding: var(--sp-4); min-width: 100px; position: relative; }
.fs-icon { font-size: 1.8rem; }
.fs-label { font-size: var(--text-xs); color: var(--text-muted); text-align: center; font-weight: 500; }
.fs-val { font-size: var(--text-lg); font-weight: 900; color: var(--text-primary); }
.fs-arrow { position: absolute; right: -14px; font-size: 1.4rem; color: var(--text-muted); top: 50%; transform: translateY(-50%); }
.funnel-step--blue .fs-val { color: #60a5fa; }
.funnel-step--indigo .fs-val { color: #818cf8; }
.funnel-step--purple .fs-val { color: #a78bfa; }
.funnel-step--green .fs-val { color: #4ade80; }
.funnel-step--emerald .fs-val { color: #34d399; }
/* Metrics grid */
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--sp-4); }
.metric-card { padding: var(--sp-5); display: flex; flex-direction: column; gap: var(--sp-4); }
.mc-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--sp-3); }
.mc-title { font-size: var(--text-base); font-weight: 700; }
.mc-desc { font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px; }
.mc-badge { font-size: var(--text-sm); font-weight: 800; padding: 4px 10px; border-radius: var(--r-full); flex-shrink: 0; }
.badge-pos { background: rgba(52,211,153,0.1); color: #34d399; border: 1px solid rgba(52,211,153,0.3); }
.badge-neg { background: rgba(239,68,68,0.1); color: #f87171; }
.mc-bars { display: flex; flex-direction: column; gap: var(--sp-2); }
.bar-row { display: flex; align-items: center; gap: var(--sp-3); }
.bar-label { font-size: var(--text-xs); color: var(--text-muted); width: 130px; flex-shrink: 0; }
.bar-wrap { flex: 1; height: 8px; background: var(--bg-elevated); border-radius: var(--r-full); overflow: hidden; }
.bar { height: 100%; border-radius: var(--r-full); transition: width 1s ease; }
.bar-before { background: var(--bg-elevated); border: 1px solid var(--border-default); }
.bar-after { background: linear-gradient(90deg, var(--color-primary), var(--color-secondary)); }
.bar-val { font-size: var(--text-xs); font-weight: 700; color: var(--text-secondary); width: 50px; text-align: right; }
.highlight { color: var(--color-primary-light) !important; }
/* Promise */
.promise-card { padding: var(--sp-8); text-align: center; border-color: rgba(26,115,232,0.3); background: rgba(26,115,232,0.04); display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); }
.promise-badge { font-size: var(--text-xs); font-weight: 800; letter-spacing: 0.12em; color: var(--color-primary-light); text-transform: uppercase; }
.promise-quote { font-size: var(--text-xl); font-weight: 700; font-style: italic; color: var(--text-primary); max-width: 600px; line-height: 1.6; }
.promise-sub { font-size: var(--text-sm); color: var(--text-secondary); max-width: 580px; line-height: 1.6; }
.promise-actions { display: flex; gap: var(--sp-3); flex-wrap: wrap; justify-content: center; }
.promise-actions a { text-decoration: none; }
@media (max-width: 700px) { .funnel { flex-wrap: wrap; justify-content: center; } .fs-arrow { display: none; } }
</style>

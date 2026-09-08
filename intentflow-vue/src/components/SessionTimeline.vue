<template>
  <div class="session-timeline">
    <div v-for="(entry, i) in sessionStore.timeline" :key="i"
      class="timeline-entry" :class="`entry-${entry.type}`">
      <div class="entry-dot"></div>
      <div class="entry-line" v-if="i < sessionStore.timeline.length - 1"></div>
      <div class="entry-content">
        <span class="entry-time">{{ entry.time }}</span>
        <span class="entry-label">{{ entry.label }}</span>
      </div>
    </div>
    <div v-if="sessionStore.timeline.length === 0" class="empty-timeline">
      No events recorded yet. Start browsing to build your timeline.
    </div>
  </div>
</template>

<script setup>
import { useSessionStore } from '@/stores/sessionStore'
const sessionStore = useSessionStore()
</script>

<style scoped>
.session-timeline { display: flex; flex-direction: column; gap: 0; }
.timeline-entry { display: flex; align-items: flex-start; gap: var(--sp-3); position: relative; padding-bottom: var(--sp-3); }
.entry-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; }
.entry-line { position: absolute; left: 4px; top: 14px; bottom: 0; width: 2px; background: var(--border-subtle); }
.entry-system .entry-dot { background: var(--text-muted); }
.entry-action .entry-dot { background: var(--color-primary); }
.entry-signal .entry-dot { background: var(--color-warning); }
.entry-friction .entry-dot { background: #fb923c; }
.entry-intervention .entry-dot { background: #a78bfa; }
.entry-safety .entry-dot { background: #f87171; }
.entry-content { display: flex; flex-direction: column; gap: 1px; }
.entry-time { font-size: var(--text-xs); color: var(--text-muted); font-weight: 500; }
.entry-label { font-size: var(--text-sm); color: var(--text-primary); }
.entry-friction .entry-label { color: #fb923c; }
.entry-safety .entry-label { color: #f87171; font-weight: 600; }
.entry-intervention .entry-label { color: #a78bfa; }
.empty-timeline { font-size: var(--text-sm); color: var(--text-muted); padding: var(--sp-4) 0; }
</style>

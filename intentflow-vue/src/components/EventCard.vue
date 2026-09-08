<template>
  <div class="event-card"
    :class="{
      'event-card--live': event.isLive,
      'event-card--selected': isSelected,
      'event-card--in-compare': inCompare,
      'event-card--nonsport': event.isNonSport
    }"
    @click="$emit('click', event)" role="button" tabindex="0" @keydown.enter="$emit('click', event)"
    :aria-label="`${event.homeTeam} vs ${event.awayTeam}, ${event.league}`">

    <!-- Top row -->
    <div class="ec-top">
      <div class="ec-top-left">
        <span class="ec-league">{{ event.league }}</span>
        <span v-if="event.isLive" class="badge badge-live">
          <span class="live-dot"></span> LIVE
        </span>
        <span v-else class="badge badge-upcoming">{{ formatTime(event.startTime) }}</span>
      </div>

      <!-- Compare toggle pill in top right -->
      <button class="ec-compare-pill"
        :class="{ active: inCompare }"
        @click.stop="$emit('compare', event)"
        :title="inCompare ? 'Remove from comparison' : 'Select for comparison (up to 2)'">
        <span class="pill-check">{{ inCompare ? '✓' : '+' }}</span>
        <span>Compare</span>
      </button>
    </div>

    <!-- Non-sport category badge -->
    <div v-if="event.isNonSport" class="ec-category-badge">
      <span>{{ sportEmoji }}</span> {{ event.sport }}
    </div>

    <!-- Teams -->
    <div class="ec-teams">
      <div class="ec-team">
        <span class="ec-team-name">{{ event.homeTeam }}</span>
        <span class="ec-odds" v-if="event.homeOdds > 0">{{ event.homeOdds.toFixed(2) }}</span>
      </div>
      <div class="ec-vs">{{ event.isNonSport ? '—' : 'VS' }}</div>
      <div class="ec-team ec-team--away">
        <span class="ec-team-name">{{ event.awayTeam }}</span>
        <span class="ec-odds" v-if="event.awayOdds > 0">{{ event.awayOdds.toFixed(2) }}</span>
      </div>
    </div>

    <!-- Draw odds if available -->
    <div v-if="event.drawOdds > 0" class="ec-draw">
      <span class="ec-draw-label">Draw</span>
      <span class="ec-draw-odds">{{ event.drawOdds.toFixed(2) }}</span>
    </div>

    <!-- Actions -->
    <div class="ec-actions" @click.stop>
      <button class="btn btn-sm btn-outline" @click="$emit('view', event)">{{ event.isNonSport ? 'View Details' : 'View Event' }}</button>
      <button class="btn btn-sm" :class="inCompare ? 'btn-compare-active' : 'btn-ghost'"
        @click="$emit('compare', event)" :aria-pressed="inCompare">
        {{ inCompare ? '✓ In Compare' : '⚖️ Compare' }}
      </button>
    </div>

    <!-- Session fit badge -->
    <div class="ec-fit" :title="`${event.sessionFit}% match for your current session`">
      <span class="ec-fit-bar" :style="`width: ${event.sessionFit}%`"></span>
      <span class="ec-fit-label">{{ event.sessionFit }}% fit</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  event: { type: Object, required: true },
  inCompare: { type: Boolean, default: false },
  isSelected: { type: Boolean, default: false },
})
defineEmits(['click', 'view', 'compare'])

const sportEmojiMap = {
  Casino: '🎰', 'Live Casino': '🃏', Virtual: '🎮', Lotto: '🎱',
}
const sportEmoji = sportEmojiMap[props.event.sport] || '🏆'

function formatTime(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}
</script>

<style scoped>
.event-card {
  background: var(--bg-card); border: 1px solid var(--border-subtle);
  border-radius: var(--r-lg); padding: var(--sp-4);
  transition: all var(--t-base); cursor: pointer;
  display: flex; flex-direction: column; gap: var(--sp-3);
}
.event-card:hover { border-color: var(--border-default); background: var(--bg-card-hover); transform: translateY(-1px); box-shadow: var(--shadow-md); }
.event-card--live { border-color: rgba(239,68,68,0.25); }
.event-card--live:hover { border-color: rgba(239,68,68,0.5); }
.event-card--selected { border-color: var(--color-primary); box-shadow: var(--shadow-glow); }
.event-card--in-compare {
  border-color: #a78bfa;
  box-shadow: 0 0 16px rgba(167, 139, 250, 0.25);
  background: linear-gradient(180deg, rgba(167, 139, 250, 0.06) 0%, var(--bg-card) 100%);
}
.ec-top { display: flex; align-items: center; justify-content: space-between; gap: var(--sp-2); }
.ec-top-left { display: flex; align-items: center; gap: var(--sp-2); }
.ec-compare-pill {
  display: flex; align-items: center; gap: 4px;
  background: var(--bg-elevated); border: 1px solid var(--border-subtle);
  border-radius: var(--r-full); padding: 2px 8px; font-size: 11px;
  color: var(--text-muted); cursor: pointer; transition: all var(--t-fast);
}
.ec-compare-pill:hover { border-color: #a78bfa; color: #a78bfa; }
.ec-compare-pill.active {
  background: rgba(167, 139, 250, 0.2); border-color: #a78bfa; color: #c4b5fd; font-weight: 700;
}
.pill-check { font-weight: 800; font-size: 11px; }
.btn-compare-active {
  background: rgba(167, 139, 250, 0.2); border: 1px solid #a78bfa;
  color: #c4b5fd; font-weight: 600;
}
.btn-compare-active:hover { background: rgba(167, 139, 250, 0.35); }
.ec-league { font-size: var(--text-xs); color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
.live-dot { width: 5px; height: 5px; background: #f87171; border-radius: 50%; display: inline-block; animation: pulse 1.2s infinite; margin-right: 3px; }
.ec-teams { display: flex; align-items: center; gap: var(--sp-3); }
.ec-team { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.ec-team--away { align-items: flex-end; }
.ec-team-name { font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); }
.ec-odds { font-size: var(--text-lg); font-weight: 800; color: var(--color-primary-light); }
.ec-vs { font-size: var(--text-xs); font-weight: 700; color: var(--text-muted); letter-spacing: 0.05em; }
.ec-draw { display: flex; justify-content: center; align-items: center; gap: var(--sp-3); padding: var(--sp-2) var(--sp-3); background: var(--bg-elevated); border-radius: var(--r-sm); }
.ec-draw-label { font-size: var(--text-xs); color: var(--text-muted); font-weight: 500; }
.ec-draw-odds { font-size: var(--text-sm); font-weight: 700; color: var(--text-secondary); }
.ec-actions { display: flex; gap: var(--sp-2); }
.ec-actions .btn { flex: 1; justify-content: center; }
.ec-fit { display: flex; align-items: center; gap: var(--sp-2); }
.ec-fit-bar { height: 3px; background: var(--color-primary); border-radius: var(--r-full); display: block; opacity: 0.6; flex-shrink: 0; }
.ec-fit-label { font-size: var(--text-xs); color: var(--text-muted); white-space: nowrap; }
.event-card--nonsport {
  background: linear-gradient(180deg, rgba(139, 92, 246, 0.04) 0%, var(--bg-card) 100%);
  border-color: rgba(139, 92, 246, 0.15);
}
.event-card--nonsport:hover { border-color: rgba(139, 92, 246, 0.35); }
.ec-category-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
  color: #c4b5fd; background: rgba(139, 92, 246, 0.12);
  border: 1px solid rgba(139, 92, 246, 0.2); border-radius: var(--r-full);
  padding: 2px 8px; width: fit-content;
}
</style>

<template>
  <aside class="sidebar" role="complementary" aria-label="Sports navigation">
    <div class="sidebar__section">
      <h4 class="sidebar__heading">Recommended</h4>
      <ul class="sidebar__list">
        <li v-for="item in recommended" :key="item.id">
          <RouterLink :to="`/event/${item.id}`" class="sidebar__link" @click="onSelect(item)">
            <span class="sidebar__sport-icon">{{ item.icon }}</span>
            <span class="sidebar__link-text">{{ item.name }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>

    <div class="sidebar__divider"></div>

    <div class="sidebar__section">
      <h4 class="sidebar__heading">Sports</h4>
      <ul class="sidebar__list">
        <li v-for="sport in sports" :key="sport.id">
          <button class="sidebar__link" :class="{ 'sidebar__link--active': activeSport === sport.id }"
            @click="onSportSelect(sport)">
            <span class="sidebar__sport-icon">{{ sport.icon }}</span>
            <span class="sidebar__link-text">{{ sport.name }}</span>
            <span v-if="sport.liveCount" class="live-count">{{ sport.liveCount }}</span>
          </button>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/sessionStore'

const props = defineProps({ activeSport: String })
const emit = defineEmits(['sport-selected'])

const router = useRouter()
const sessionStore = useSessionStore()

const recommended = [
  { id: 'evt-001', name: 'Arsenal vs Chelsea', icon: '⚽' },
  { id: 'evt-002', name: 'Real Madrid vs Man City', icon: '🏆' },
  { id: 'evt-009', name: 'Lakers vs Celtics', icon: '🏀' },
  { id: 'evt-013', name: 'Djokovic vs Alcaraz', icon: '🎾' },
  { id: 'evt-021', name: 'MI vs CSK', icon: '🏏' },
]

const sports = [
  { id: 'football', name: 'Football', icon: '⚽', liveCount: 3 },
  { id: 'basketball', name: 'Basketball', icon: '🏀', liveCount: 1 },
  { id: 'tennis', name: 'Tennis', icon: '🎾', liveCount: 2 },
  { id: 'ice-hockey', name: 'Ice Hockey', icon: '🏒', liveCount: 1 },
  { id: 'volleyball', name: 'Volleyball', icon: '🏐', liveCount: 1 },
  { id: 'combat-sports', name: 'Combat Sports', icon: '🥊', liveCount: 0 },
  { id: 'baseball', name: 'Baseball', icon: '⚾', liveCount: 1 },
  { id: 'cricket', name: 'Cricket', icon: '🏏', liveCount: 1 },
  { id: 'casino', name: 'Casino', icon: '🎰', liveCount: 3 },
  { id: 'live-casino', name: 'Live Casino', icon: '🃏', liveCount: 3 },
  { id: 'virtual', name: 'Virtual', icon: '🎮', liveCount: 3 },
  { id: 'lotto', name: 'Lotto', icon: '🎱', liveCount: 2 },
]

const categoryPages = ['casino', 'live-casino', 'virtual', 'lotto']

function onSportSelect(sport) {
  sessionStore.trackEvent('SPORT_SELECTED', { sport: sport.name })
  emit('sport-selected', sport)
  if (categoryPages.includes(sport.id)) {
    router.push(`/${sport.id}`)
  } else {
    router.push({ path: '/sports', query: { sport: sport.id } })
  }
}

function onSelect(item) {
  router.push(`/event/${item.id}`)
}
</script>

<style scoped>
.sidebar {
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-subtle);
  height: 100%; overflow-y: auto; padding: var(--sp-4) 0;
}
.sidebar__section { padding: 0 var(--sp-3); }
.sidebar__heading {
  font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.08em;
  color: var(--text-muted); text-transform: uppercase;
  padding: var(--sp-2) var(--sp-2) var(--sp-2); margin-bottom: var(--sp-1);
}
.sidebar__list { display: flex; flex-direction: column; gap: 1px; }
.sidebar__link {
  display: flex; align-items: center; gap: var(--sp-3);
  padding: 8px var(--sp-2); border-radius: var(--r-sm);
  color: var(--text-secondary); font-size: var(--text-sm);
  transition: all var(--t-fast); cursor: pointer; text-decoration: none;
  background: none; border: none; width: 100%; text-align: left;
}
.sidebar__link:hover { color: var(--text-primary); background: var(--bg-elevated); }
.sidebar__link--active { color: var(--color-primary-light) !important; background: rgba(26,115,232,0.12); }
.sidebar__sport-icon { font-size: 1rem; flex-shrink: 0; }
.sidebar__link-text { flex: 1; }
.live-count {
  font-size: var(--text-xs); font-weight: 700;
  background: rgba(239,68,68,0.15); color: #f87171;
  border-radius: var(--r-full); padding: 1px 6px;
}
.sidebar__divider { height: 1px; background: var(--border-subtle); margin: var(--sp-4) var(--sp-3); }
</style>

<template>
  <div class="page-layout">
    <Navbar />
    <div class="category-page main-scroll">
      <!-- Category Header -->
      <div class="cat-header">
        <div class="cat-hero" :style="heroStyle">
          <div class="cat-hero-overlay">
            <span class="cat-icon">{{ categoryIcon }}</span>
            <div class="cat-hero-text">
              <h1 class="cat-title">{{ categoryTitle }}</h1>
              <p class="cat-desc">{{ categoryDesc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sub-category pills -->
      <div class="filter-pills">
        <button v-for="sub in subCategories" :key="sub.id" class="pill"
          :class="{ 'pill--active': activeFilter === sub.id }" @click="activeFilter = sub.id">
          {{ sub.icon }} {{ sub.name }}
        </button>
      </div>

      <!-- Events Grid -->
      <div class="section-header">
        <h2 class="section-title">{{ activeFilterLabel }}</h2>
        <span class="section-count">{{ filteredEvents.length }} items</span>
      </div>

      <Transition name="fade">
        <div v-if="comparisonStore.selectionNotice" class="compare-toast-bar">
          <span>💡 {{ comparisonStore.selectionNotice }}</span>
        </div>
      </Transition>

      <div v-if="loading" class="events-grid stagger">
        <div v-for="i in 6" :key="i" class="skeleton" style="height:180px"></div>
      </div>
      <div v-else-if="filteredEvents.length === 0" class="empty-state card">
        <p>No {{ categoryTitle.toLowerCase() }} events available right now.</p>
        <RouterLink to="/" class="btn btn-outline btn-sm">Browse All Events</RouterLink>
      </div>
      <div v-else class="events-grid stagger">
        <EventCard v-for="event in filteredEvents" :key="event.id"
          :event="event"
          :in-compare="comparisonStore.isSelected(event.id)"
          :is-selected="sessionStore.selectedEvent?.id === event.id"
          @click="onView(event)" @view="onView(event)" @compare="onCompare(event)"
        />
      </div>

      <!-- Experience Credits Banner -->
      <div class="credits-banner card">
        <span class="credits-icon">🎁</span>
        <div class="credits-text">
          <strong>First-Time Experience Credits</strong>
          <p>New explorers receive <span class="credits-highlight">100 Points</span> to try any category risk-free.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSessionStore } from '@/stores/sessionStore'
import { useComparisonStore } from '@/stores/comparisonStore'
import { getEvents } from '@/services/sportsData'
import Navbar from '@/components/Navbar.vue'
import EventCard from '@/components/EventCard.vue'

const props = defineProps({
  category: { type: String, required: true },
})

const router = useRouter()
const sessionStore = useSessionStore()
const comparisonStore = useComparisonStore()

const events = ref([])
const loading = ref(true)
const activeFilter = ref('all')

const categoryConfigs = {
  casino: {
    title: 'Casino',
    icon: '🎰',
    desc: 'Slots, table games & instant-win experiences',
    gradient: 'linear-gradient(135deg, #1a0d3a 0%, #2d1b69 50%, #0d1a3a 100%)',
    subCategories: [
      { id: 'all', name: 'All Games', icon: '🎰' },
      { id: 'Slots', name: 'Slots', icon: '🍒' },
      { id: 'Table Games', name: 'Table Games', icon: '♠️' },
    ],
  },
  'live-casino': {
    title: 'Live Casino',
    icon: '🃏',
    desc: 'Real dealers, real-time play, streamed live',
    gradient: 'linear-gradient(135deg, #0d2a1a 0%, #1a3a2a 50%, #0d1a2a 100%)',
    subCategories: [
      { id: 'all', name: 'All Tables', icon: '🃏' },
      { id: 'Live Roulette', name: 'Roulette', icon: '🎡' },
      { id: 'Live Blackjack', name: 'Blackjack', icon: '♠️' },
      { id: 'Live Baccarat', name: 'Baccarat', icon: '💎' },
    ],
  },
  virtual: {
    title: 'Virtual',
    icon: '🎮',
    desc: 'Simulated sports & instant action events',
    gradient: 'linear-gradient(135deg, #1a2a4a 0%, #0d3a2a 50%, #1a1a3a 100%)',
    subCategories: [
      { id: 'all', name: 'All Virtual', icon: '🎮' },
      { id: 'Virtual Football', name: 'Football', icon: '⚽' },
      { id: 'Virtual Horse Racing', name: 'Horse Racing', icon: '🏇' },
      { id: 'Virtual Tennis', name: 'Tennis', icon: '🎾' },
    ],
  },
  lotto: {
    title: 'Lotto',
    icon: '🎱',
    desc: 'Lottery draws from around the world',
    gradient: 'linear-gradient(135deg, #2a1a0d 0%, #3a2a1a 50%, #1a0d2a 100%)',
    subCategories: [
      { id: 'all', name: 'All Draws', icon: '🎱' },
      { id: 'EuroJackpot', name: 'EuroJackpot', icon: '🇪🇺' },
      { id: 'Powerball', name: 'Powerball', icon: '🇺🇸' },
    ],
  },
}

const config = computed(() => categoryConfigs[props.category] || categoryConfigs.casino)
const categoryTitle = computed(() => config.value.title)
const categoryIcon = computed(() => config.value.icon)
const categoryDesc = computed(() => config.value.desc)
const heroStyle = computed(() => `background: ${config.value.gradient}`)
const subCategories = computed(() => config.value.subCategories)
const activeFilterLabel = computed(() => {
  const sub = subCategories.value.find(s => s.id === activeFilter.value)
  return sub ? sub.name : 'All'
})

const filteredEvents = computed(() => {
  if (activeFilter.value === 'all') return events.value
  return events.value.filter(e => e.league === activeFilter.value)
})

async function loadEvents() {
  loading.value = true
  try {
    const result = await getEvents({ sport: config.value.title, limit: 50 })
    events.value = result.data
    sessionStore.trackEvent('PAGE_VIEW', { page: props.category })
  } finally {
    loading.value = false
  }
}

watch(() => props.category, () => {
  activeFilter.value = 'all'
  loadEvents()
})
onMounted(loadEvents)

function onView(event) {
  sessionStore.trackEvent('EVENT_OPENED', { id: event.id, title: event.title })
  router.push(`/event/${event.id}`)
}
function onCompare(event) {
  comparisonStore.toggleEvent(event)
}
</script>

<style scoped>
.page-layout { display: grid; grid-template-rows: var(--navbar-h) 1fr; min-height: 100vh; }
.category-page { padding: var(--sp-5); display: flex; flex-direction: column; gap: var(--sp-4); height: calc(100vh - var(--navbar-h)); overflow-y: auto; }

.cat-hero {
  border-radius: var(--r-xl); padding: var(--sp-8) var(--sp-6); position: relative; overflow: hidden;
  border: 1px solid var(--border-subtle);
}
.cat-hero-overlay { display: flex; align-items: center; gap: var(--sp-5); position: relative; z-index: 1; }
.cat-icon { font-size: 3rem; filter: drop-shadow(0 0 20px rgba(255,255,255,0.2)); }
.cat-title { font-size: var(--text-2xl); font-weight: 900; }
.cat-desc { font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px; }

.filter-pills { display: flex; gap: var(--sp-2); flex-wrap: wrap; }
.pill {
  padding: 6px 14px; border-radius: var(--r-full); border: 1px solid var(--border-default);
  background: var(--bg-card); color: var(--text-secondary); font-size: var(--text-sm);
  font-weight: 500; cursor: pointer; transition: all var(--t-fast);
}
.pill:hover { border-color: var(--color-primary); color: var(--text-primary); }
.pill--active { background: var(--color-primary); border-color: var(--color-primary); color: #fff; }

.section-header { display: flex; align-items: center; justify-content: space-between; }
.section-title { font-size: var(--text-xl); font-weight: 700; }
.section-count { font-size: var(--text-sm); color: var(--text-muted); }
.events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--sp-4); }
.empty-state { padding: var(--sp-10); text-align: center; color: var(--text-secondary); display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); }
.compare-toast-bar {
  background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.4);
  color: #c4b5fd; padding: var(--sp-2) var(--sp-4); border-radius: var(--r-md);
  font-size: var(--text-xs); font-weight: 600; text-align: center;
}

.credits-banner {
  display: flex; align-items: center; gap: var(--sp-4);
  padding: var(--sp-4) var(--sp-5);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(52, 211, 153, 0.08));
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: var(--r-lg);
}
.credits-icon { font-size: 2rem; flex-shrink: 0; }
.credits-text { font-size: var(--text-sm); color: var(--text-secondary); }
.credits-text strong { color: var(--text-primary); display: block; margin-bottom: 2px; }
.credits-text p { margin: 0; }
.credits-highlight { color: #34d399; font-weight: 700; }
</style>

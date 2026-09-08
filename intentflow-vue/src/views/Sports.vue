<template>
  <div class="sports-shell">
    <Navbar />
    <div class="sports-body">
      <!-- Left sidebar -->
      <Sidebar :active-sport="activeSport" @sport-selected="handleSidebarSport" />

      <!-- Main content -->
      <main class="main-scroll sports-main">
        <!-- Search + filter header -->
        <div class="search-bar card">
          <span class="search-icon">🔍</span>
          <input v-model="searchQuery" type="search" placeholder="Search teams, leagues, tournaments..."
            class="search-input" @input="onSearch" aria-label="Search events" />
          <button v-if="searchQuery" class="search-clear" @click="searchQuery=''" aria-label="Clear">✕</button>
        </div>

        <!-- Sport filter pills -->
        <div class="filter-pills">
          <button v-for="s in sportFilters" :key="s.id" class="pill"
            :class="{ 'pill--active': activeSport === s.id }" @click="setSport(s.id)">
            {{ s.icon }} {{ s.name }}
          </button>
        </div>

        <!-- Events Header -->
        <div class="section-header">
          <h1 class="section-title">{{ activeSport === 'all' ? 'All Sports' : activeSportTitle }} Events</h1>
          <span class="section-count">{{ total }} events</span>
        </div>

        <!-- Subtle notice if user attempts 3rd compare -->
        <Transition name="fade">
          <div v-if="comparisonStore.selectionNotice" class="compare-toast-bar">
            <span>💡 {{ comparisonStore.selectionNotice }}</span>
          </div>
        </Transition>

        <div v-if="loading" class="events-grid stagger">
          <div v-for="i in 9" :key="i" class="skeleton" style="height:190px"></div>
        </div>
        <div v-else-if="events.length === 0" class="empty-state card">
          <p>No events found for "{{ searchQuery || activeSport }}".</p>
          <button class="btn btn-outline btn-sm" @click="resetFilters">Clear filters</button>
        </div>
        <div v-else class="events-grid stagger">
          <EventCard v-for="event in events" :key="event.id"
            :event="event"
            :in-compare="comparisonStore.isSelected(event.id)"
            :is-selected="sessionStore.selectedEvent?.id === event.id"
            @click="onView(event)" @view="onView(event)" @compare="onCompare(event)"
          />
        </div>

        <!-- Pagination -->
        <div v-if="total > pageSize" class="pagination">
          <button class="btn btn-outline btn-sm" :disabled="page === 0" @click="page--">← Prev</button>
          <span class="page-info">Page {{ page + 1 }} of {{ Math.ceil(total / pageSize) }}</span>
          <button class="btn btn-outline btn-sm" :disabled="(page+1)*pageSize >= total" @click="page++">Next →</button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSessionStore } from '@/stores/sessionStore'
import { useComparisonStore } from '@/stores/comparisonStore'
import { getEvents, getSports } from '@/services/sportsData'
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import EventCard from '@/components/EventCard.vue'

const router = useRouter()
const route = useRoute()
const sessionStore = useSessionStore()
const comparisonStore = useComparisonStore()

const searchQuery = ref('')
const activeSport = ref(route.query.sport || 'all')
const events = ref([])
const total = ref(0)
const loading = ref(true)
const page = ref(0)
const pageSize = 18
let searchTimer = null

const sportFilters = ref([{ id: 'all', name: 'All Sports', icon: '🏆' }])

const activeSportTitle = computed(() => {
  const f = sportFilters.value.find(s => s.id === activeSport.value)
  if (f) return f.name
  if (!activeSport.value || activeSport.value === 'all') return 'All Sports'
  return activeSport.value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
})

async function loadSports() {
  const s = await getSports()
  sportFilters.value = [{ id: 'all', name: 'All Sports', icon: '🏆' }, ...s]
}

async function loadEvents() {
  loading.value = true
  try {
    const filters = { limit: pageSize, offset: page.value * pageSize }
    if (activeSport.value !== 'all') filters.sport = activeSport.value
    if (searchQuery.value) filters.search = searchQuery.value
    const result = await getEvents(filters)
    events.value = result.data
    total.value = result.total
  } finally {
    loading.value = false
  }
}

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 0
    sessionStore.trackEvent('SEARCH', { query: searchQuery.value })
    loadEvents()
  }, 300)
}

function setSport(id) {
  activeSport.value = id
  page.value = 0
  router.push({ path: '/sports', query: id === 'all' ? {} : { sport: id } })
  if (id !== 'all') sessionStore.trackEvent('SPORT_SELECTED', { sport: id })
}

function handleSidebarSport(sport) {
  setSport(sport.id)
}

function resetFilters() {
  searchQuery.value = ''
  setSport('all')
}

function onView(event) {
  sessionStore.trackEvent('EVENT_OPENED', { id: event.id, title: event.title })
  router.push(`/event/${event.id}`)
}

function onCompare(event) {
  comparisonStore.toggleEvent(event)
}

watch(() => route.query.sport, (newSport) => {
  activeSport.value = newSport || 'all'
  page.value = 0
  loadEvents()
})

watch([page, activeSport], () => {
  loadEvents()
})

onMounted(async () => {
  await loadSports()
  if (route.query.sport) {
    activeSport.value = route.query.sport
  }
  loadEvents()
})
</script>

<style scoped>
.sports-shell {
  display: grid;
  grid-template-rows: var(--navbar-h) 1fr;
  min-height: 100vh;
}
.sports-body {
  display: grid;
  grid-template-columns: var(--sidebar-w) 1fr;
  height: calc(100vh - var(--navbar-h));
  overflow: hidden;
}
.sports-main {
  overflow-y: auto;
  height: 100%;
  padding: var(--sp-4);
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.search-bar { display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-3) var(--sp-4); }
.search-icon { font-size: 1.1rem; color: var(--text-muted); flex-shrink: 0; }
.search-input { flex: 1; background: none; border: none; font-size: var(--text-base); color: var(--text-primary); outline: none; }
.search-input::placeholder { color: var(--text-muted); }
.search-clear { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1rem; }

.filter-pills { display: flex; gap: var(--sp-2); flex-wrap: wrap; }
.pill { padding: 6px 14px; border-radius: var(--r-full); border: 1px solid var(--border-default); background: var(--bg-card); color: var(--text-secondary); font-size: var(--text-sm); font-weight: 500; cursor: pointer; transition: all var(--t-fast); }
.pill:hover { border-color: var(--color-primary); color: var(--text-primary); }
.pill--active { background: var(--color-primary); border-color: var(--color-primary); color: #fff; }

.section-header { display: flex; align-items: center; justify-content: space-between; }
.section-title { font-size: var(--text-xl); font-weight: 700; }
.section-count { font-size: var(--text-sm); color: var(--text-muted); }

.events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--sp-4); }
.empty-state { padding: var(--sp-10); text-align: center; color: var(--text-secondary); display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); }
.pagination { display: flex; align-items: center; justify-content: center; gap: var(--sp-4); padding: var(--sp-4) 0; }
.page-info { font-size: var(--text-sm); color: var(--text-secondary); }

.compare-toast-bar {
  background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.4);
  color: #c4b5fd; padding: var(--sp-2) var(--sp-4); border-radius: var(--r-md);
  font-size: var(--text-xs); font-weight: 600; text-align: center;
}

@media (max-width: 900px) {
  .sports-body { grid-template-columns: 1fr; }
}
</style>

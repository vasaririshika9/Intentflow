<template>
  <div class="page-layout">
    <Navbar />
    <div class="live-page main-scroll" style="height: calc(100vh - var(--navbar-h)); overflow-y: auto;">
      <div class="live-header">
        <div class="live-title-row">
          <span class="live-dot-lg"></span>
          <h1 class="live-title">Live Events</h1>
        </div>
        <span class="live-count badge badge-live">{{ events.length }} LIVE</span>
      </div>

      <div v-if="loading" class="events-grid stagger">
        <div v-for="i in 6" :key="i" class="skeleton" style="height:180px"></div>
      </div>
      <div v-else-if="events.length === 0" class="empty-card card">
        <p>No live events at the moment. Check back soon!</p>
        <RouterLink to="/sports" class="btn btn-outline btn-sm">Browse upcoming events</RouterLink>
      </div>
      <div v-else class="events-grid stagger">
        <EventCard v-for="event in events" :key="event.id" :event="event"
          :in-compare="comparisonStore.isSelected(event.id)"
          @click="onView(event)" @view="onView(event)" @compare="onCompare(event)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/sessionStore'
import { useComparisonStore } from '@/stores/comparisonStore'
import { getLiveEvents } from '@/services/sportsData'
import Navbar from '@/components/Navbar.vue'
import EventCard from '@/components/EventCard.vue'

const router = useRouter()
const sessionStore = useSessionStore()
const comparisonStore = useComparisonStore()
const events = ref([])
const loading = ref(true)

onMounted(async () => {
  try { events.value = await getLiveEvents() }
  finally { loading.value = false }
  sessionStore.trackEvent('PAGE_VIEW', { page: 'live' })
})

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
.live-page { padding: var(--sp-5); display: flex; flex-direction: column; gap: var(--sp-5); }
.live-header { display: flex; align-items: center; justify-content: space-between; }
.live-title-row { display: flex; align-items: center; gap: var(--sp-3); }
.live-dot-lg { width: 12px; height: 12px; border-radius: 50%; background: #f87171; animation: pulse 1s infinite; display: inline-block; }
.live-title { font-size: var(--text-2xl); font-weight: 800; }
.live-count { font-size: var(--text-sm); }
.events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--sp-4); }
.empty-card { padding: var(--sp-10); text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); color: var(--text-secondary); }
</style>

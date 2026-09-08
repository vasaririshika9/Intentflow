// =============================================
// IntentFlow — Comparison Store (Pinia)
// Dedicated global state for event comparison (max 2)
// Integrates with sessionStore for intelligence tracking
// =============================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSessionStore } from './sessionStore'

export const useComparisonStore = defineStore('comparison', () => {
  const selectedEvents = ref([])
  const selectionNotice = ref('')
  let noticeTimer = null

  function showNotice(msg) {
    selectionNotice.value = msg
    if (noticeTimer) clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => {
      selectionNotice.value = ''
    }, 3500)
  }

  function addEvent(event) {
    if (!event || !event.id) return false
    
    // Check if already selected
    if (selectedEvents.value.some(e => e.id === event.id)) {
      return true
    }

    // Limit selection to TWO events
    if (selectedEvents.value.length >= 2) {
      showNotice('You can compare up to 2 events at a time.')
      return false
    }

    selectedEvents.value.push(event)

    // Integrate with sessionStore
    const sessionStore = useSessionStore()
    sessionStore.trackEvent('EVENT_SELECTED_FOR_COMPARE', {
      id: event.id,
      title: event.title,
      totalSelected: selectedEvents.value.length,
    })

    // If 2 events selected, track suggestion / comparison state
    if (selectedEvents.value.length === 2) {
      sessionStore.trackEvent('COMPARE_SUGGESTED', {
        eventA: selectedEvents.value[0].title,
        eventB: selectedEvents.value[1].title,
      })
    }

    // Also sync with sessionStore.comparisonEvents
    sessionStore.comparisonEvents = [...selectedEvents.value]

    return true
  }

  function removeEvent(eventId) {
    const idx = selectedEvents.value.findIndex(e => e.id === eventId)
    if (idx !== -1) {
      const removed = selectedEvents.value[idx]
      selectedEvents.value.splice(idx, 1)

      const sessionStore = useSessionStore()
      sessionStore.trackEvent('EVENT_REMOVED_FROM_COMPARE', {
        id: eventId,
        title: removed.title,
        remaining: selectedEvents.value.length,
      })
      sessionStore.comparisonEvents = [...selectedEvents.value]
    }
  }

  function toggleEvent(event) {
    if (!event) return
    if (isSelected(event.id)) {
      removeEvent(event.id)
    } else {
      addEvent(event)
    }
  }

  function clearSelection() {
    selectedEvents.value = []
    const sessionStore = useSessionStore()
    sessionStore.comparisonEvents = []
    sessionStore.trackEvent('EVENT_REMOVED_FROM_COMPARE', { clearedAll: true })
  }

  function isSelected(eventId) {
    return selectedEvents.value.some(e => e.id === eventId)
  }

  const canCompare = computed(() => selectedEvents.value.length === 2)
  const count = computed(() => selectedEvents.value.length)
  const isFull = computed(() => selectedEvents.value.length >= 2)

  return {
    selectedEvents,
    selectionNotice,
    count,
    canCompare,
    isFull,
    addEvent,
    removeEvent,
    toggleEvent,
    clearSelection,
    isSelected,
    showNotice,
  }
})

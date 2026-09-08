// =============================================
// IntentFlow — Session Store (Pinia)
// Full session state with intent, guidance + friction tracking
// Normalized event structure + New vs Regular User handling
// =============================================
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { detectIntent, SESSION_STATES, INTENT_STAGES } from '@/utils/intentDetection'
import { detectFriction, shouldIntervene, FRICTION_TYPES } from '@/utils/frictionDetection'
import { evaluateGuidance, GUIDANCE_ACTIONS, GUARDRAIL_STATUS } from '@/utils/guidanceEngine'
import { calculateJourneyHealth } from '@/utils/journeyHealth'
import { DEMO_NEW_PROFILE, recordInteraction, applyFeedback } from '@/utils/userProfile'

export const useSessionStore = defineStore('session', () => {
  // --- User Profile Context ---
  const userProfile = ref({ ...DEMO_NEW_PROFILE })

  // --- Raw Signals ---
  const eventsViewed = ref([])      // array of event ids
  const eventViewHistory = ref([])  // chronological history of event ids
  const sportsSelected = ref(0)
  const categoryChangeCount = ref(0)
  const currentCategory = ref('')
  const pageViews = ref(0)
  const searchCount = ref(0)
  const searchQuery = ref('')
  const recentSearches = ref([])
  const backCount = ref(0)
  const comparisonCount = ref(0)
  const reviewCount = ref(0)
  const confirmCount = ref(0)
  const meaningfulActions = ref(0)
  const interventionCount = ref(0)
  const interventionsAccepted = ref(0)
  const interventionsDismissed = ref(0)
  const safetyTriggered = ref(false)
  const sessionStart = ref(Date.now())
  const lastPageChange = ref(Date.now())
  const nowTimestamp = ref(Date.now())

  // Real-time ticking timer for duration calculations
  if (typeof window !== 'undefined') {
    setInterval(() => {
      nowTimestamp.value = Date.now()
    }, 1000)
  }

  // --- Selection ---
  const selectedEvent = ref(null)
  const comparisonEvents = ref([])

  // --- Guide ---
  const showGuide = ref(false)
  const guideDismissed = ref(false)

  // --- Normalized Session Event Log ---
  const normalizedEvents = ref([])

  // --- Timeline ---
  const timeline = ref([
    { time: now(), label: 'Session started', type: 'system' }
  ])

  // --- Computed signals bundle ---
  const signals = computed(() => ({
    eventsViewed: eventsViewed.value.length,
    sportsSelected: sportsSelected.value,
    categoryChangeCount: categoryChangeCount.value,
    currentCategory: currentCategory.value,
    pageViews: pageViews.value,
    searchCount: searchCount.value,
    searchQuery: searchQuery.value,
    recentSearches: recentSearches.value,
    backCount: backCount.value,
    comparisonCount: comparisonCount.value,
    reviewCount: reviewCount.value,
    confirmCount: confirmCount.value,
    meaningfulActions: meaningfulActions.value,
    interventionCount: interventionCount.value,
    interventionsAccepted: interventionsAccepted.value,
    interventionsDismissed: interventionsDismissed.value,
    safetyTriggered: safetyTriggered.value,
    selectedItems: selectedEvent.value ? [selectedEvent.value] : [],
    sessionDurationSecs: Math.max(0, Math.floor((nowTimestamp.value - sessionStart.value) / 1000)),
    timeOnPageSecs: Math.max(0, Math.floor((nowTimestamp.value - lastPageChange.value) / 1000)),
  }))

  // --- Derived: intent ---
  const intentResult = computed(() => detectIntent(signals.value, userProfile.value))
  const sessionState = computed(() => intentResult.value.state)
  const intentStage = computed(() => intentResult.value.stage)
  const intentLabel = computed(() => intentResult.value.intent_label)
  const primaryIntent = computed(() => intentResult.value.primary_intent)
  const confidence = computed(() => intentResult.value.confidence)
  const targetEventId = computed(() => intentResult.value.target_event)
  const supportingSignals = computed(() => intentResult.value.supporting_signals || [])
  const intentReasons = computed(() => intentResult.value.reasons || [])

  // --- Derived: friction ---
  const frictionResult = computed(() => detectFriction({
    ...signals.value,
    sessionState: sessionState.value,
  }))
  const frictionType = computed(() => frictionResult.value.type)
  const frictionLabel = computed(() => frictionResult.value.label)
  const frictionAction = computed(() => frictionResult.value.action)

  const safetyStatus = computed(() =>
    safetyTriggered.value ? 'SAFETY_OVERRIDE' : 'NORMAL'
  )

  const interventionBudget = ref(3) // max interventions
  const remainingBudget = computed(() => Math.max(0, interventionBudget.value - interventionCount.value))

  const canIntervene = computed(() =>
    shouldIntervene(frictionResult.value, interventionCount.value, interventionBudget.value) &&
    !guideDismissed.value &&
    !userProfile.value?.paused_recommendations
  )

  // --- Derived: Guidance Engine & Guardrail ---
  const guidanceDecision = computed(() =>
    evaluateGuidance(
      intentResult.value,
      {
        ...signals.value,
        frictionType: frictionType.value,
      },
      userProfile.value
    )
  )

  const guidanceAction = computed(() => guidanceDecision.value.action)
  const guidanceLabel = computed(() => guidanceDecision.value.label)
  const guidanceDescription = computed(() => guidanceDecision.value.description)
  const directNavigation = computed(() => guidanceDecision.value.directNavigation)
  const guardrailStatus = computed(() => guidanceDecision.value.guardrailStatus)
  const guardrailReason = computed(() => guidanceDecision.value.guardrailReason)

  // --- Journey Health Score (0-100) ---
  const journeyHealth = computed(() =>
    calculateJourneyHealth({
      ...signals.value,
      confidence: confidence.value,
      frictionType: frictionType.value,
      sessionState: sessionState.value,
    })
  )

  // Next best intervention message
  const nextIntervention = computed(() => {
    if (safetyTriggered.value) return 'Show safety support options'
    if (guidanceAction.value === GUIDANCE_ACTIONS.STOP) return null
    if (frictionType.value === FRICTION_TYPES.NONE && guidanceAction.value !== GUIDANCE_ACTIONS.NAVIGATE) return null
    return guidanceLabel.value || frictionResult.value.action
  })

  // --- Guide auto-trigger ---
  watch([frictionType, canIntervene], ([ft, can]) => {
    if (ft !== FRICTION_TYPES.NONE && can && !guideDismissed.value && guidanceAction.value !== GUIDANCE_ACTIONS.STOP) {
      showGuide.value = true
    }
  })

  // --- Actions ---

  /**
   * Track normalized session event
   */
  function trackSessionEvent({ event_type, entity_type = 'general', entity_id = null, category = null, source = 'user' }) {
    const normEvent = {
      event_type,
      entity_type,
      entity_id,
      category: category || currentCategory.value,
      timestamp: new Date().toISOString(),
      source,
    }
    normalizedEvents.value.push(normEvent)

    // Update profile
    userProfile.value = recordInteraction(userProfile.value, {
      category: normEvent.category,
      entity: entity_id,
      event_type,
    })

    // Bridge to standard timeline
    trackEvent(event_type.toUpperCase(), {
      id: entity_id,
      title: entity_id,
      sport: category,
      source,
    })
  }

  function trackEvent(type, payload = {}) {
    timeline.value.push({ time: now(), label: eventLabel(type, payload), type })

    switch (type) {
      case 'EVENT_OPENED': {
        const id = payload.id
        if (id) {
          eventViewHistory.value.push(id)
          if (!eventsViewed.value.includes(id)) {
            eventsViewed.value.push(id)
          } else {
            backCount.value++
          }

          // Smart Comparison Detection (A-B-A back-and-forth)
          const hist = eventViewHistory.value
          if (hist.length >= 3) {
            const l = hist.length
            const a = hist[l - 1]
            const b = hist[l - 2]
            const c = hist[l - 3]
            if (a !== b && a === c) {
              comparisonCount.value += 2
              if (canIntervene.value && !guideDismissed.value) {
                showGuide.value = true
              }
            }
          }
        }
        meaningfulActions.value++
        break
      }
      case 'EVENT_SELECTED_FOR_COMPARE':
        comparisonCount.value++
        meaningfulActions.value++
        break
      case 'EVENT_REMOVED_FROM_COMPARE':
        meaningfulActions.value++
        break
      case 'COMPARE_SUGGESTED':
        comparisonCount.value++
        break
      case 'COMPARE_OPENED':
        comparisonCount.value++
        meaningfulActions.value++
        break
      case 'COMPARE_COMPLETED':
        meaningfulActions.value += 2
        break
      case 'SPORT_SELECTED':
        sportsSelected.value++
        categoryChangeCount.value++
        currentCategory.value = payload.sport?.toLowerCase() || ''
        meaningfulActions.value++
        break
      case 'CATEGORY_CHANGED':
        categoryChangeCount.value++
        currentCategory.value = payload.category?.toLowerCase() || ''
        break
      case 'PAGE_VIEW':
        pageViews.value++
        lastPageChange.value = Date.now()
        break
      case 'SEARCH':
        searchCount.value++
        searchQuery.value = payload.query || ''
        if (payload.query && !recentSearches.value.includes(payload.query)) {
          recentSearches.value.push(payload.query)
        }
        break
      case 'BACK_NAVIGATION':
        backCount.value++
        break
      case 'OPTION_SELECTED':
        meaningfulActions.value++
        break
      case 'OPTION_CHANGED':
        backCount.value++
        break
      case 'CONFIRMATION_OPENED':
        reviewCount.value++
        break
      case 'CONFIRMATION_REVIEWED':
        reviewCount.value++
        break
      case 'ACTION_COMPLETED':
        confirmCount.value++
        meaningfulActions.value += 3
        break
      case 'USER_LOGGED_IN':
      case 'USER_REGISTERED':
      case 'USER_LOGGED_OUT':
        meaningfulActions.value++
        break
    }
  }

  function selectEvent(event) {
    selectedEvent.value = event
    trackEvent('OPTION_SELECTED', { id: event?.id, title: event?.title })
  }

  function addToComparison(event) {
    if (!event) return
    if (comparisonEvents.value.find(e => e.id === event.id)) return
    if (comparisonEvents.value.length >= 2) comparisonEvents.value.shift()
    comparisonEvents.value.push(event)
  }

  function removeFromComparison(id) {
    comparisonEvents.value = comparisonEvents.value.filter(e => e.id !== id)
  }

  function toggleComparison(event) {
    const exists = comparisonEvents.value.find(e => e.id === event.id)
    if (exists) removeFromComparison(event.id)
    else addToComparison(event)
  }

  function isInComparison(id) {
    return comparisonEvents.value.some(e => e.id === id)
  }

  function recordIntervention() {
    interventionCount.value++
    showGuide.value = true
    timeline.value.push({ time: now(), label: 'Session guide shown', type: 'intervention' })
  }

  function acceptIntervention() {
    interventionsAccepted.value++
    dismissGuide()
  }

  function dismissGuide() {
    showGuide.value = false
    guideDismissed.value = true
    if (interventionCount.value > 0) interventionsDismissed.value++
    timeline.value.push({ time: now(), label: 'Guide dismissed by user', type: 'user' })
  }

  function activateSafetyOverride() {
    safetyTriggered.value = true
    showGuide.value = false
    timeline.value.push({ time: now(), label: 'Safety Override activated', type: 'safety' })
  }

  function deactivateSafetyOverride() {
    safetyTriggered.value = false
  }

  // --- User Profile & Feedback Controls ---

  function setUserProfile(profile) {
    userProfile.value = { ...profile }
  }

  function dislikeEntity(entity) {
    userProfile.value = applyFeedback(userProfile.value, 'SHOW_LESS', entity)
    timeline.value.push({ time: now(), label: `Preference updated: Show less "${entity}"`, type: 'user' })
  }

  function pauseRecommendations() {
    userProfile.value = applyFeedback(userProfile.value, 'PAUSE_RECOMMENDATIONS')
    showGuide.value = false
    timeline.value.push({ time: now(), label: 'User paused proactive recommendations', type: 'user' })
  }

  function resumeRecommendations() {
    userProfile.value = applyFeedback(userProfile.value, 'RESUME_RECOMMENDATIONS')
    timeline.value.push({ time: now(), label: 'User resumed recommendations', type: 'user' })
  }

  function setNewUserPreferences(categories = []) {
    userProfile.value = applyFeedback(userProfile.value, 'SET_INITIAL_PREFERENCES', categories)
    if (categories.length > 0) {
      currentCategory.value = categories[0].toLowerCase()
      sportsSelected.value++
    }
    timeline.value.push({ time: now(), label: `Initial preferences chosen: ${categories.join(', ')}`, type: 'user' })
  }

  function applyDemoState(preset) {
    reset()
    if (preset.userProfile) userProfile.value = { ...preset.userProfile }
    if (preset.eventsViewed) { for (let i = 0; i < preset.eventsViewed; i++) eventsViewed.value.push(`demo-${i}`) }
    if (preset.searchCount) searchCount.value = preset.searchCount
    if (preset.searchQuery) searchQuery.value = preset.searchQuery
    if (preset.recentSearches) recentSearches.value = [...preset.recentSearches]
    if (preset.backCount) backCount.value = preset.backCount
    if (preset.sportsSelected) sportsSelected.value = preset.sportsSelected
    if (preset.currentCategory) currentCategory.value = preset.currentCategory
    if (preset.categoryChangeCount) categoryChangeCount.value = preset.categoryChangeCount
    if (preset.pageViews) pageViews.value = preset.pageViews
    if (preset.comparisonCount) comparisonCount.value = preset.comparisonCount
    if (preset.reviewCount) reviewCount.value = preset.reviewCount
    if (preset.confirmCount) confirmCount.value = preset.confirmCount
    if (preset.safetyTriggered) safetyTriggered.value = preset.safetyTriggered
    if (preset.selectedEvent) selectedEvent.value = preset.selectedEvent
    if (preset.timeline) timeline.value = preset.timeline
    if (preset.guideDismissed !== undefined) guideDismissed.value = preset.guideDismissed
    if (preset.showGuide !== undefined) showGuide.value = preset.showGuide
  }

  function reset() {
    eventsViewed.value = []
    eventViewHistory.value = []
    sportsSelected.value = 0
    categoryChangeCount.value = 0
    currentCategory.value = ''
    pageViews.value = 0
    searchCount.value = 0
    searchQuery.value = ''
    recentSearches.value = []
    backCount.value = 0
    comparisonCount.value = 0
    reviewCount.value = 0
    confirmCount.value = 0
    meaningfulActions.value = 0
    interventionCount.value = 0
    interventionsAccepted.value = 0
    interventionsDismissed.value = 0
    safetyTriggered.value = false
    selectedEvent.value = null
    comparisonEvents.value = []
    showGuide.value = false
    guideDismissed.value = false
    sessionStart.value = Date.now()
    lastPageChange.value = Date.now()
    timeline.value = [{ time: now(), label: 'Session started', type: 'system' }]
  }

  return {
    // User Profile
    userProfile, setUserProfile, dislikeEntity, pauseRecommendations,
    resumeRecommendations, setNewUserPreferences,
    // Signals
    eventsViewed, eventViewHistory, sportsSelected, categoryChangeCount,
    currentCategory, pageViews, searchCount, searchQuery, recentSearches,
    backCount, comparisonCount, reviewCount, confirmCount, meaningfulActions,
    interventionCount, interventionsAccepted, interventionsDismissed,
    safetyTriggered, normalizedEvents,
    // Selection
    selectedEvent, comparisonEvents,
    // Guide
    showGuide, guideDismissed,
    // Timeline
    timeline,
    // Computed Intent
    sessionState, intentStage, intentLabel, primaryIntent, confidence,
    targetEventId, supportingSignals, intentReasons,
    // Computed Friction & Safety
    frictionType, frictionLabel, frictionAction, safetyStatus,
    // Computed Intervention Budget
    interventionBudget, remainingBudget, canIntervene,
    // Computed Guidance Engine & Guardrail
    guidanceDecision, guidanceAction, guidanceLabel, guidanceDescription,
    directNavigation, guardrailStatus, guardrailReason, nextIntervention,
    // Computed Score
    journeyHealth, signals,
    // Actions
    trackSessionEvent, trackEvent, selectEvent, addToComparison,
    removeFromComparison, toggleComparison, isInComparison,
    recordIntervention, acceptIntervention, dismissGuide,
    activateSafetyOverride, deactivateSafetyOverride, applyDemoState, reset,
  }
})

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function eventLabel(type, payload) {
  const map = {
    EVENT_OPENED: `Opened event: ${payload.title || payload.id}`,
    EVENT_SELECTED_FOR_COMPARE: `Selected for compare: ${payload.title || ''}`,
    EVENT_REMOVED_FROM_COMPARE: payload.clearedAll ? 'Cleared comparison' : `Removed from compare: ${payload.title || ''}`,
    COMPARE_SUGGESTED: 'Suggested side-by-side comparison',
    COMPARE_OPENED: 'Opened comparison view',
    COMPARE_COMPLETED: 'Completed comparison',
    SPORT_SELECTED: `Selected category: ${payload.sport || ''}`,
    CATEGORY_CHANGED: `Switched category: ${payload.category || ''}`,
    PAGE_VIEW: `Viewed page: ${payload.name || payload.path || ''}`,
    SEARCH: `Searched: "${payload.query || ''}"`,
    BACK_NAVIGATION: payload.source === 'browser_back' ? 'Browser Back button pressed' : 'Navigated back',
    OPTION_SELECTED: `Selected: ${payload.title || ''}`,
    OPTION_CHANGED: 'Changed selection',
    CONFIRMATION_OPENED: 'Opened confirmation',
    CONFIRMATION_REVIEWED: 'Reviewed confirmation',
    ACTION_COMPLETED: 'Action completed ✓',
    USER_LOGGED_IN: 'User authenticated (Regular Explorer)',
    USER_REGISTERED: 'New explorer registered',
    USER_LOGGED_OUT: 'User logged out',
  }
  return map[type] || type
}

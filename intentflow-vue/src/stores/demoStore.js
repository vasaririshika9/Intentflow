// =============================================
// IntentFlow — Demo Store (Pinia)
// Controls demo mode & deterministic test scenarios
// URL: ?demo=new_user|regular_user|changing_intent|comparing|hesitating|satisfied|safety
// Keyboard: Ctrl+Shift+D
// =============================================
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSessionStore } from './sessionStore'
import { DEMO_REGULAR_PROFILE, DEMO_NEW_PROFILE } from '@/utils/userProfile'

const SAMPLE_EVENT = {
  id: 'evt-001',
  sport: 'Football',
  league: 'Premier League',
  homeTeam: 'Arsenal',
  awayTeam: 'Chelsea',
  title: 'Arsenal vs Chelsea',
  startTime: '2026-09-08T20:00:00Z',
  status: 'UPCOMING',
  homeOdds: 1.85,
  drawOdds: 3.40,
  awayOdds: 4.20,
  venue: 'Emirates Stadium',
  country: 'England',
  isFeatured: true,
  isLive: false,
  sessionFit: 94,
  isNonSport: false,
}

const PRESETS = {
  new_user: {
    label: '🌱 1. New User — Open Discovery',
    description: 'NEW USER · UNKNOWN intent · Zero assumptions · Lightweight preferences offered',
    userProfile: DEMO_NEW_PROFILE,
    eventsViewed: 0, sportsSelected: 0, categoryChangeCount: 0, searchCount: 0, backCount: 0,
    comparisonCount: 0, reviewCount: 0, confirmCount: 0, safetyTriggered: false,
    guideDismissed: true, showGuide: false,
    timeline: [
      { time: '10:00', label: 'First-time session started', type: 'system' },
      { time: '10:00', label: 'User Type: New Explorer (0 historical assumptions)', type: 'system' },
      { time: '10:01', label: 'Guidance decision: CLARIFY (voluntary preference prompt)', type: 'system' },
    ],
  },
  regular_user: {
    label: '⭐ 2. Regular User — "Arsenal Next Match"',
    description: 'REGULAR USER · Football affinity (82%) · HIGH_INTENT · Direct Navigation',
    userProfile: DEMO_REGULAR_PROFILE,
    eventsViewed: 1, sportsSelected: 1, currentCategory: 'football', searchCount: 1,
    searchQuery: 'Arsenal next match',
    recentSearches: ['Arsenal next match'],
    backCount: 0, comparisonCount: 0, reviewCount: 0, confirmCount: 0, safetyTriggered: false,
    guideDismissed: false, showGuide: false,
    selectedEvent: SAMPLE_EVENT,
    timeline: [
      { time: '10:02', label: 'Returning user authenticated (Profile affinity: Football 82%)', type: 'system' },
      { time: '10:03', label: 'Search query: "Arsenal next match"', type: 'action' },
      { time: '10:03', label: 'Entity recognized: Arsenal (Premier League)', type: 'signal' },
      { time: '10:04', label: 'Intent: HIGH_INTENT (Confidence 91%)', type: 'system' },
      { time: '10:04', label: 'Guidance decision: NAVIGATE directly to Arsenal vs Chelsea', type: 'system' },
    ],
  },
  changing_intent: {
    label: '🔄 3. Dynamic Intent Shift',
    description: 'Started on Football → shifted to Basketball & Lakers search',
    userProfile: DEMO_REGULAR_PROFILE,
    eventsViewed: 3, sportsSelected: 2, currentCategory: 'basketball', categoryChangeCount: 2,
    searchCount: 1, searchQuery: 'Lakers live',
    recentSearches: ['Arsenal', 'Lakers live'],
    backCount: 1, comparisonCount: 0, reviewCount: 0, confirmCount: 0, safetyTriggered: false,
    guideDismissed: true, showGuide: false,
    timeline: [
      { time: '10:01', label: 'User opened football catalog', type: 'action' },
      { time: '10:03', label: 'User switched category: Basketball', type: 'action' },
      { time: '10:04', label: 'Search query: "Lakers live"', type: 'action' },
      { time: '10:04', label: 'Intent dynamically updated: Find Lakers Live (Confidence 88%)', type: 'system' },
      { time: '10:05', label: 'Original intent discarded; system adapted to current session', type: 'system' },
    ],
  },
  comparing: {
    label: '⚖️ 4. Comparison Friction',
    description: 'COMPARING state · A-B-A back-and-forth · Side-by-side guide',
    userProfile: DEMO_REGULAR_PROFILE,
    eventsViewed: 4, sportsSelected: 1, currentCategory: 'football', searchCount: 0, backCount: 2,
    comparisonCount: 2, reviewCount: 0, confirmCount: 0, safetyTriggered: false,
    guideDismissed: false, showGuide: true,
    selectedEvent: SAMPLE_EVENT,
    timeline: [
      { time: '10:02', label: 'Opened event: Arsenal vs Chelsea', type: 'action' },
      { time: '10:03', label: 'Opened event: Real Madrid vs Man City', type: 'action' },
      { time: '10:04', label: 'Navigated back to Arsenal vs Chelsea', type: 'signal' },
      { time: '10:05', label: 'Comparison Friction detected (A-B-A pattern)', type: 'friction' },
      { time: '10:05', label: 'Guidance decision: Offer side-by-side comparison', type: 'system' },
    ],
  },
  hesitating: {
    label: '⏸️ 5. Decision Friction (Clarity Card)',
    description: 'HESITATING state · Repeated review visits · Decision Clarity Card',
    userProfile: DEMO_REGULAR_PROFILE,
    eventsViewed: 3, sportsSelected: 1, currentCategory: 'football', searchCount: 0, backCount: 3,
    comparisonCount: 1, reviewCount: 2, confirmCount: 0, safetyTriggered: false,
    guideDismissed: false, showGuide: false,
    selectedEvent: SAMPLE_EVENT,
    timeline: [
      { time: '10:02', label: 'Selected event: Arsenal vs Chelsea', type: 'action' },
      { time: '10:05', label: 'Opened confirmation step', type: 'action' },
      { time: '10:06', label: 'Navigated back without confirming', type: 'signal' },
      { time: '10:07', label: 'Opened confirmation again (revisit loop)', type: 'action' },
      { time: '10:08', label: 'Decision Friction detected · Decision Clarity Card activated', type: 'friction' },
    ],
  },
  satisfied: {
    label: '🛑 6. Goal Satisfied (Guidance: STOP)',
    description: 'Action confirmed · IntentFlow STOPS recommendations · Zero pressure',
    userProfile: DEMO_REGULAR_PROFILE,
    eventsViewed: 2, sportsSelected: 1, currentCategory: 'football', searchCount: 0, backCount: 0,
    comparisonCount: 0, reviewCount: 1, confirmCount: 1, safetyTriggered: false,
    guideDismissed: true, showGuide: false,
    selectedEvent: SAMPLE_EVENT,
    timeline: [
      { time: '10:02', label: 'Selected event: Arsenal vs Chelsea', type: 'action' },
      { time: '10:04', label: 'Confirmed selection with 100 Experience Credits', type: 'action' },
      { time: '10:04', label: 'Goal Completed ✓', type: 'system' },
      { time: '10:04', label: 'Responsible Guardrail: STOP (No artificial push or re-engagement)', type: 'safety' },
    ],
  },
  safety: {
    label: '🛡️ 7. Safety Override',
    description: 'SAFETY_OVERRIDE · Conversion paused · Responsible play support',
    userProfile: DEMO_REGULAR_PROFILE,
    eventsViewed: 5, sportsSelected: 3, searchCount: 4, backCount: 5,
    comparisonCount: 0, reviewCount: 0, confirmCount: 0, safetyTriggered: true,
    guideDismissed: true, showGuide: false,
    selectedEvent: SAMPLE_EVENT,
    timeline: [
      { time: '10:00', label: 'Rapid search and navigation loops detected', type: 'signal' },
      { time: '10:02', label: 'Safety threshold triggered', type: 'signal' },
      { time: '10:02', label: 'Safety Override activated · Commercial nudges paused', type: 'safety' },
    ],
  },
}

export const useDemoStore = defineStore('demo', () => {
  const active = ref(false)
  const panelOpen = ref(false)
  const activePreset = ref(null)

  function togglePanel() { panelOpen.value = !panelOpen.value }
  function openPanel() { panelOpen.value = true; active.value = true }
  function closePanel() { panelOpen.value = false }

  function applyPreset(key) {
    const preset = PRESETS[key]
    if (!preset) return
    activePreset.value = key
    active.value = true
    const session = useSessionStore()
    session.applyDemoState(preset)
  }

  function clearDemo() {
    activePreset.value = null
    active.value = false
    const session = useSessionStore()
    session.reset()
  }

  // Keyboard shortcut (Ctrl+Shift+D)
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        panelOpen.value = !panelOpen.value
        active.value = true
      }
    })
  }

  return {
    active, panelOpen, activePreset,
    presets: PRESETS,
    togglePanel, openPanel, closePanel,
    applyPreset, clearDemo,
  }
})

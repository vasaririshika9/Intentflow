// =============================================
// IntentFlow — Advanced Intent Detection Engine
// Multi-signal weighted evidence analyzer
// Determines: User Intent, Intent Stage, Confidence & Signals
// =============================================

export const INTENT_STAGES = {
  UNKNOWN: 'UNKNOWN',
  EXPLORING: 'EXPLORING',
  INTERESTED: 'INTERESTED',
  FOCUSED: 'FOCUSED',
  HIGH_INTENT: 'HIGH_INTENT',
  SATISFIED: 'SATISFIED',
}

export const SESSION_STATES = {
  EXPLORING: 'EXPLORING',
  FOCUSING: 'FOCUSING',
  COMPARING: 'COMPARING',
  HESITATING: 'HESITATING',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  SAFETY_OVERRIDE: 'SAFETY_OVERRIDE',
}

// Known entity database for intent mapping
const ENTITY_KNOWLEDGE = {
  arsenal: { name: 'Arsenal', category: 'football', targetId: 'evt-001', match: 'Arsenal vs Chelsea' },
  chelsea: { name: 'Chelsea', category: 'football', targetId: 'evt-001', match: 'Arsenal vs Chelsea' },
  'real madrid': { name: 'Real Madrid', category: 'football', targetId: 'evt-002', match: 'Real Madrid vs Man City' },
  'man city': { name: 'Man City', category: 'football', targetId: 'evt-002', match: 'Real Madrid vs Man City' },
  lakers: { name: 'LA Lakers', category: 'basketball', targetId: 'evt-009', match: 'Lakers vs Celtics' },
  celtics: { name: 'Boston Celtics', category: 'basketball', targetId: 'evt-009', match: 'Lakers vs Celtics' },
  djokovic: { name: 'Djokovic', category: 'tennis', targetId: 'evt-013', match: 'Djokovic vs Alcaraz' },
  alcaraz: { name: 'Alcaraz', category: 'tennis', targetId: 'evt-013', match: 'Djokovic vs Alcaraz' },
  rangers: { name: 'NY Rangers', category: 'ice-hockey', targetId: 'evt-065', match: 'NY Rangers vs Boston Bruins' },
  poland: { name: 'Poland', category: 'volleyball', targetId: 'evt-068', match: 'Poland vs Italy' },
  'jon jones': { name: 'Jon Jones', category: 'combat-sports', targetId: 'evt-070', match: 'Jon Jones vs Stipe Miocic' },
  yankees: { name: 'NY Yankees', category: 'baseball', targetId: 'evt-072', match: 'NY Yankees vs LA Dodgers' },
}

function formatIntentResult(res) {
  if (!res) return res
  res.targetEntity = res.entity || (res.category && res.category !== 'general' ? res.category.charAt(0).toUpperCase() + res.category.slice(1) : null)
  res.directMatch = (res.target_event || res.entity) ? {
    entity: res.entity || 'Target Event',
    path: res.target_event ? `/event/${res.target_event}` : (res.category ? `/sports?sport=${res.category}` : '/sports')
  } : null
  return res
}

/**
 * Detects current user intent from raw session signals + user profile
 * Accepts either an aggregated signals object OR an array of normalized events
 * @param {Object|Array} signals - raw session metrics or normalized event list
 * @param {Object} [profile] - user profile (new vs regular user)
 * @returns {Object} Full intent analysis result
 */
export function detectIntent(signals = {}, profile = null) {
  const userType = profile?.user_type || profile?.type || 'new'
  const isRegular = userType === 'regular'
  const historicalPrefs = profile?.long_term_preferences || profile?.historicalPreferences || {}

  if (Array.isArray(signals)) {
    const rawEvents = signals
    if (rawEvents.length === 0) {
      if (isRegular) {
        return formatIntentResult({
          primary_intent: 'explore_football',
          secondary_intent: 'browse',
          intent_label: 'Exploring Football',
          stage: INTENT_STAGES.EXPLORING,
          state: SESSION_STATES.EXPLORING,
          confidence: 35,
          category: 'football',
          entity: 'Arsenal',
          target_event: 'evt-001',
          supporting_signals: ['Loaded regular profile (football affinity 82%)'],
          reasons: ['Regular user with historical affinity'],
        })
      }
      return formatIntentResult({
        primary_intent: 'initial_discovery',
        secondary_intent: 'onboarding',
        intent_label: 'New Explorer',
        stage: INTENT_STAGES.UNKNOWN,
        state: SESSION_STATES.EXPLORING,
        confidence: 0,
        category: null,
        entity: null,
        target_event: null,
        supporting_signals: ['First session started', 'Zero assumptions made'],
        reasons: ['New user session: open discovery and lightweight preferences recommended.'],
      })
    }

    const eventsViewed = rawEvents.filter(e => e.event_type === 'event_view' || e.event_type === 'EVENT_OPENED').length
    const sportsSelected = rawEvents.filter(e => e.event_type === 'sport_select' || e.event_type === 'SPORT_SELECTED').length
    const searchEvents = rawEvents.filter(e => e.event_type === 'search_query' || e.event_type === 'SEARCH')
    const searchCount = searchEvents.length
    const searchQuery = searchEvents.length > 0 ? (searchEvents[searchEvents.length - 1].entity_id || searchEvents[searchEvents.length - 1].query || '') : ''
    const confirmCount = rawEvents.filter(e => e.event_type === 'ACTION_CONFIRMED' || e.event_type === 'BET_PLACED' || e.event_type === 'action_confirmed').length
    const comparisonCount = rawEvents.filter(e => e.event_type === 'COMPARE_OPENED' || e.event_type === 'compare_opened' || e.event_type === 'COMPARE_ADD').length
    const categoryChangeCount = rawEvents.filter(e => e.event_type === 'category_change' || e.event_type === 'PAGE_VIEW').length

    // Dominant category
    const catCounts = {}
    rawEvents.forEach(e => {
      if (e.category) catCounts[e.category] = (catCounts[e.category] || 0) + 1
    })
    let dominantCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
    if (isRegular && (!dominantCat || dominantCat === 'sports' || dominantCat === 'general')) {
      const topPref = Object.entries(historicalPrefs).sort((a, b) => b[1] - a[1])[0]
      if (topPref) dominantCat = topPref[0]
    }

    signals = {
      eventsViewed,
      sportsSelected,
      searchCount,
      searchQuery,
      confirmCount,
      comparisonCount,
      categoryChangeCount,
      currentCategory: dominantCat,
      selectedItems: rawEvents.filter(e => e.event_type === 'item_selected').map(e => ({ id: e.entity_id, title: e.entity_id })),
      recentSearches: searchEvents.map(e => e.entity_id || e.query).filter(Boolean),
    }
  } else if (!signals) {
    if (isRegular) {
      return formatIntentResult({
        primary_intent: 'explore_football',
        secondary_intent: 'browse',
        intent_label: 'Exploring Football',
        stage: INTENT_STAGES.EXPLORING,
        state: SESSION_STATES.EXPLORING,
        confidence: 35,
        category: 'football',
        entity: 'Arsenal',
        target_event: 'evt-001',
        supporting_signals: ['Loaded regular profile (football affinity 82%)'],
        reasons: ['Regular user with historical affinity'],
      })
    }
    return formatIntentResult({
      primary_intent: 'initial_discovery',
      secondary_intent: 'onboarding',
      intent_label: 'New Explorer',
      stage: INTENT_STAGES.UNKNOWN,
      state: SESSION_STATES.EXPLORING,
      confidence: 0,
      category: null,
      entity: null,
      target_event: null,
      supporting_signals: ['First session started'],
      reasons: ['Safe default for missing data'],
    })
  }

  const {
    eventsViewed = 0,
    searchCount = 0,
    backCount = 0,
    sportsSelected = 0,
    categoryChangeCount = 0,
    comparisonCount = 0,
    reviewCount = 0,
    confirmCount = 0,
    selectedItems = [],
    meaningfulActions = 0,
    safetyTriggered = false,
    searchQuery = '',
    currentCategory = '',
    recentSearches = [],
  } = signals

  const supportingSignals = []
  const reasons = []

  // 1. Safety Override (Highest Priority)
  if (safetyTriggered) {
    return formatIntentResult({
      primary_intent: 'safety_protection',
      secondary_intent: 'paused',
      intent_label: 'Safety Override Activated',
      stage: INTENT_STAGES.SATISFIED,
      state: SESSION_STATES.SAFETY_OVERRIDE,
      confidence: 100,
      category: 'safety',
      entity: null,
      target_event: null,
      supporting_signals: ['Safety threshold triggered', 'Conversion optimization halted'],
      reasons: ['User well-being protection active'],
    })
  }

  // 2. Goal Satisfied / Completed (Action Confirmed)
  if (confirmCount >= 1) {
    supportingSignals.push('Confirmed action executed')
    reasons.push('User goal successfully completed')
    return formatIntentResult({
      primary_intent: 'action_completed',
      secondary_intent: 'session_satisfied',
      intent_label: 'Goal Completed ✓',
      stage: INTENT_STAGES.SATISFIED,
      state: SESSION_STATES.COMPLETED,
      confidence: 98,
      category: selectedItems[0]?.sport || currentCategory || 'general',
      entity: selectedItems[0]?.title || null,
      target_event: selectedItems[0]?.id || null,
      supporting_signals: supportingSignals,
      reasons: ['User has satisfied their current session goal — no further recommendations needed.'],
    })
  }

  // 3. Search & Entity Recognition (Strongest Direct Signal)
  const query = (searchQuery || recentSearches[recentSearches.length - 1] || '').trim().toLowerCase()
  let matchedEntity = null
  let matchedCategory = currentCategory || null
  let targetEventId = null
  let targetMatchTitle = null

  if (query) {
    supportingSignals.push(`Searched: "${query}"`)
    reasons.push(`Direct search for "${query}"`)

    for (const [key, val] of Object.entries(ENTITY_KNOWLEDGE)) {
      if (query.includes(key)) {
        matchedEntity = val.name
        matchedCategory = val.category
        targetEventId = val.targetId
        targetMatchTitle = val.match
        supportingSignals.push(`Recognized entity: ${val.name} (${val.match})`)
        break
      }
    }
  }

  // Check selected items if search didn't match
  if (!matchedEntity && selectedItems.length > 0) {
    const ev = selectedItems[0]
    matchedEntity = ev.homeTeam || ev.title
    matchedCategory = ev.sport?.toLowerCase()
    targetEventId = ev.id
    targetMatchTitle = ev.title
    supportingSignals.push(`Selected: ${ev.title}`)
  }

  // 4. Hesitating State (Decision Friction)
  if (reviewCount >= 2 || (confirmCount === 0 && selectedItems.length > 0 && backCount >= 2)) {
    const conf = Math.min(92, 65 + reviewCount * 8 + backCount * 4)
    supportingSignals.push(`Review stage visited ${reviewCount} times`)
    if (backCount >= 2) supportingSignals.push(`${backCount} back-navigations recorded`)
    reasons.push('Repeated review visits without confirmation')

    return formatIntentResult({
      primary_intent: 'review_selection',
      secondary_intent: 'evaluating_choice',
      intent_label: `Reviewing: ${targetMatchTitle || 'Selection'}`,
      stage: INTENT_STAGES.FOCUSED,
      state: SESSION_STATES.HESITATING,
      confidence: conf,
      category: matchedCategory || 'general',
      entity: matchedEntity,
      target_event: targetEventId,
      supporting_signals: supportingSignals,
      reasons: ['User is evaluating their selection carefully — requires clarity rather than pressure.'],
    })
  }

  // 5. Ready State (Clear selection, low friction)
  if (selectedItems.length >= 1 && reviewCount >= 1 && backCount <= 1) {
    supportingSignals.push('Selection confirmed and reviewed once')
    return formatIntentResult({
      primary_intent: 'confirm_selection',
      secondary_intent: 'finalize',
      intent_label: `Ready to finalize: ${targetMatchTitle || 'Selection'}`,
      stage: INTENT_STAGES.HIGH_INTENT,
      state: SESSION_STATES.READY,
      confidence: 88,
      category: matchedCategory || 'general',
      entity: matchedEntity,
      target_event: targetEventId,
      supporting_signals: supportingSignals,
      reasons: ['Clear selection made with smooth navigation flow.'],
    })
  }

  // 6. High Intent from Search / Target Entity (e.g. "Arsenal next match" or search)
  if (matchedEntity && (query.includes('next') || query.includes('match') || query.includes('vs') || eventsViewed >= 1 || searchCount >= 1 || query.length >= 3)) {
    let conf = 85
    if (isRegular && historicalPrefs[matchedCategory] > 0.6) {
      conf += 6
      supportingSignals.push(`Historical affinity with ${matchedCategory} (${Math.round(historicalPrefs[matchedCategory] * 100)}%)`)
    }
    reasons.push(`User is looking for upcoming ${matchedEntity} fixture`)

    return formatIntentResult({
      primary_intent: 'find_next_match',
      secondary_intent: 'view_fixture',
      intent_label: `Find ${matchedEntity}'s next match`,
      stage: INTENT_STAGES.HIGH_INTENT,
      state: SESSION_STATES.FOCUSING,
      confidence: Math.min(95, conf),
      category: matchedCategory,
      entity: matchedEntity,
      target_event: targetEventId,
      supporting_signals: supportingSignals,
      reasons: [
        `Searched explicitly for "${query || matchedEntity}"`,
        `Direct interest in ${targetMatchTitle || matchedEntity}`,
        ...(isRegular ? [`Profile shows frequent interest in ${matchedCategory}`] : []),
      ],
    })
  }

  // 7. Comparing State
  if (comparisonCount >= 1 || (eventsViewed >= 2 && backCount >= 1)) {
    const conf = Math.min(85, 55 + comparisonCount * 10 + backCount * 3)
    supportingSignals.push('Multiple event views with back-and-forth comparison')
    return formatIntentResult({
      primary_intent: 'compare_options',
      secondary_intent: 'evaluate_alternatives',
      intent_label: 'Comparing Options',
      stage: INTENT_STAGES.INTERESTED,
      state: SESSION_STATES.COMPARING,
      confidence: conf,
      category: matchedCategory || 'sports',
      entity: matchedEntity,
      target_event: targetEventId,
      supporting_signals: supportingSignals,
      reasons: ['User switched between multiple events, seeking clarity on differences.'],
    })
  }

  // 8. Focused / Interested State (Category narrowing)
  if (sportsSelected >= 1 || currentCategory || eventsViewed >= 1) {
    let activeCat = currentCategory || (sportsSelected >= 1 ? 'football' : 'general')
    if (isRegular && (activeCat === 'sports' || activeCat === 'general')) {
      const topPref = Object.entries(historicalPrefs).sort((a, b) => b[1] - a[1])[0]
      if (topPref) activeCat = topPref[0]
    }
    let conf = Math.min(85, Math.max(30, 40 + eventsViewed * 8 + sportsSelected * 6))
    if (isRegular && historicalPrefs[activeCat]) {
      conf = Math.min(88, conf + 5)
      supportingSignals.push(`Aligned with returning user preference (${Math.round(historicalPrefs[activeCat] * 100)}%)`)
    }
    supportingSignals.push(`Category selected: ${activeCat}`)

    return formatIntentResult({
      primary_intent: `explore_${activeCat}`,
      secondary_intent: 'browse_fixtures',
      intent_label: `Exploring ${activeCat.charAt(0).toUpperCase() + activeCat.slice(1)}`,
      stage: eventsViewed >= 3 ? INTENT_STAGES.FOCUSED : (eventsViewed >= 1 ? INTENT_STAGES.INTERESTED : INTENT_STAGES.EXPLORING),
      state: SESSION_STATES.FOCUSING,
      confidence: conf,
      category: activeCat,
      entity: matchedEntity,
      target_event: targetEventId,
      supporting_signals: supportingSignals,
      reasons: [`Browsing ${activeCat} events in current session`],
    })
  }

  // 9. Exploring / New User Initial State
  if (userType === 'new' && eventsViewed === 0 && searchCount === 0) {
    return formatIntentResult({
      primary_intent: 'initial_discovery',
      secondary_intent: 'onboarding',
      intent_label: 'New Explorer — Discovering',
      stage: INTENT_STAGES.UNKNOWN,
      state: SESSION_STATES.EXPLORING,
      confidence: 0,
      category: null,
      entity: null,
      target_event: null,
      supporting_signals: ['First session started', 'Zero assumptions made'],
      reasons: ['New user session: open discovery and lightweight preferences recommended.'],
    })
  }

  // Returning user default with history
  if (isRegular && Object.keys(historicalPrefs).length > 0) {
    const topPref = Object.entries(historicalPrefs).sort((a, b) => b[1] - a[1])[0]
    return formatIntentResult({
      primary_intent: `explore_${topPref[0]}`,
      secondary_intent: 'browse',
      intent_label: `Exploring ${topPref[0].charAt(0).toUpperCase() + topPref[0].slice(1)}`,
      stage: INTENT_STAGES.EXPLORING,
      state: SESSION_STATES.EXPLORING,
      confidence: 58,
      category: topPref[0],
      entity: profile?.frequent_entities?.[0] || 'Arsenal',
      target_event: 'evt-001',
      supporting_signals: [`Loaded returning profile (${topPref[0]} affinity: ${Math.round(topPref[1] * 100)}%)`],
      reasons: [`Returning user with historical interest in ${topPref[0]}`],
    })
  }

  // General exploring fallback
  const fallbackConf = Math.max(20, Math.min(65, 30 + eventsViewed * 3 + searchCount * 2))
  return formatIntentResult({
    primary_intent: 'broad_exploration',
    secondary_intent: 'general_browse',
    intent_label: 'Exploring All Options',
    stage: INTENT_STAGES.EXPLORING,
    state: SESSION_STATES.EXPLORING,
    confidence: fallbackConf,
    category: 'general',
    entity: null,
    target_event: null,
    supporting_signals: [`${eventsViewed} events viewed`, `${searchCount} searches made`],
    reasons: ['Broad browsing behavior across the catalog.'],
  })
}

export function getStateLabel(state) {
  const labels = {
    EXPLORING: 'Exploring',
    FOCUSING: 'Focusing',
    COMPARING: 'Comparing',
    HESITATING: 'Hesitating',
    READY: 'Ready',
    COMPLETED: 'Completed',
    SAFETY_OVERRIDE: 'Safety Override',
  }
  return labels[state] || state
}

export function getStateCssClass(state) {
  return `state-${(state || 'exploring').toLowerCase().replace('_', '-')}`
}

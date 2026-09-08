// =============================================
// IntentFlow — Friction Detection Engine
// Maps session signals → friction type
// =============================================

export const FRICTION_TYPES = {
  NONE: 'NONE',
  DISCOVERY: 'DISCOVERY',
  NAVIGATION: 'NAVIGATION',
  COMPARISON: 'COMPARISON',
  DECISION: 'DECISION',
  SAFETY: 'SAFETY',
}

export const FRICTION_LABELS = {
  NONE: 'No friction',
  DISCOVERY: 'Discovery friction',
  NAVIGATION: 'Navigation friction',
  COMPARISON: 'Comparison friction',
  DECISION: 'Decision friction',
  SAFETY: 'Safety friction',
}

export const FRICTION_COLORS = {
  NONE: '#34d399',
  DISCOVERY: '#60a5fa',
  NAVIGATION: '#fbbf24',
  COMPARISON: '#a78bfa',
  DECISION: '#fb923c',
  SAFETY: '#f87171',
}

export const FRICTION_ACTIONS = {
  NONE: null,
  DISCOVERY: 'Show relevant discovery suggestions',
  NAVIGATION: 'Offer a clearer navigation path',
  COMPARISON: 'Offer side-by-side comparison',
  DECISION: 'Show Decision Clarity Card (Review options or Continue Later)',
  SAFETY: 'Activate Safety Override (Prioritise user control)',
}

/**
 * Detect friction from session signals
 * @param {Object} signals
 * @returns {{ type: string, label: string, action: string|null }}
 */
export function detectFriction(signals) {
  const {
    eventsViewed = 0,
    searchCount = 0,
    backCount = 0,
    sportsSelected = 0,
    categoryChangeCount = 0,
    comparisonCount = 0,
    reviewCount = 0,
    meaningfulActions = 0,
    safetyTriggered = false,
    sessionState = 'EXPLORING',
  } = signals

  if (safetyTriggered) {
    return { type: FRICTION_TYPES.SAFETY, label: FRICTION_LABELS.SAFETY, action: FRICTION_ACTIONS.SAFETY }
  }

  // Decision friction: at review, keeps going back or hesitating
  if (reviewCount >= 2 && backCount >= 1) {
    return { type: FRICTION_TYPES.DECISION, label: FRICTION_LABELS.DECISION, action: FRICTION_ACTIONS.DECISION }
  }

  // Comparison friction: switching between events repeatedly
  if ((backCount >= 1 && eventsViewed >= 2) || comparisonCount >= 1) {
    return { type: FRICTION_TYPES.COMPARISON, label: FRICTION_LABELS.COMPARISON, action: FRICTION_ACTIONS.COMPARISON }
  }

  // Navigation friction: lots of searching / back nav
  if (searchCount >= 2 || backCount >= 2) {
    return { type: FRICTION_TYPES.NAVIGATION, label: FRICTION_LABELS.NAVIGATION, action: FRICTION_ACTIONS.NAVIGATION }
  }

  // Discovery friction: browsing many sports with no selection, or hopping categories
  if ((sportsSelected >= 3 || categoryChangeCount >= 3) && meaningfulActions <= 1) {
    return { type: FRICTION_TYPES.DISCOVERY, label: FRICTION_LABELS.DISCOVERY, action: FRICTION_ACTIONS.DISCOVERY }
  }

  return { type: FRICTION_TYPES.NONE, label: FRICTION_LABELS.NONE, action: null }
}

/**
 * Should the system intervene given current friction + budget?
 */
export function shouldIntervene(friction, interventionCount, maxBudget = 3) {
  if (friction.type === FRICTION_TYPES.NONE) return false
  if (friction.type === FRICTION_TYPES.SAFETY) return true
  if (interventionCount >= maxBudget) return false
  return true
}

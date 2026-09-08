// =============================================
// IntentFlow — Session Quality Score Engine
// Configurable formula:
// session_quality = relevance * 0.30 + intent_clarity * 0.20
//                 + successful_action * 0.25 + goal_completion * 0.15
//                 - friction * 0.05 - fatigue * 0.05
// =============================================

/**
 * Calculate the Session Quality Score and its breakdown
 * @param {Object} signals - session state metrics
 * @returns {{ total: number, score: number, components: Object }}
 */
export function calculateJourneyHealth(signals = {}) {
  const {
    eventsViewed = 0,
    meaningfulActions = 0,
    interventionCount = 0,
    interventionsAccepted = 0,
    interventionsDismissed = 0,
    backCount = 0,
    searchCount = 0,
    confidence = 50,
    frictionType = 'NONE',
    sessionState = 'EXPLORING',
    confirmCount = 0,
    reviewCount = 0,
  } = signals

  // 1. Relevance Score (0–100)
  const relevance = Math.min(100, 35 + confidence * 0.5 + (eventsViewed > 0 ? 15 : 0))

  // 2. Intent Clarity (0–100)
  const intentClarity = calcIntentClarity(frictionType, confidence, reviewCount, backCount)

  // 3. Successful Action (0–100)
  const successfulAction = Math.min(100, 20 + meaningfulActions * 15 + (confirmCount > 0 ? 30 : 0))

  // 4. Goal Completion (0–100)
  const goalCompletion = confirmCount >= 1 ? 100 : (reviewCount >= 1 ? 65 : (eventsViewed >= 1 ? 35 : 10))

  // 5. Friction Penalty (0–100)
  const friction = calcFriction(frictionType, backCount, searchCount)

  // 6. Recommendation Fatigue (0–100)
  const fatigue = Math.min(100, interventionsDismissed * 35 + (interventionCount > 3 ? 20 : 0))

  // Weighted formula
  const raw = (
    relevance * 0.30 +
    intentClarity * 0.20 +
    successfulAction * 0.25 +
    goalCompletion * 0.15 -
    friction * 0.05 -
    fatigue * 0.05
  )

  const total = Math.round(Math.max(0, Math.min(100, raw)))

  return {
    total,
    score: total,
    label: getQualityLabel(total),
    components: {
      relevance: Math.round(relevance),
      intent_clarity: Math.round(intentClarity),
      successful_action: Math.round(successfulAction),
      goal_completion: Math.round(goalCompletion),
      friction: Math.round(friction),
      fatigue: Math.round(fatigue),
      // Backwards-compatible properties for existing dashboards
      progress: Math.round(goalCompletion),
      decisionClarity: Math.round(intentClarity),
      userControl: Math.round(Math.max(0, 100 - fatigue)),
      meaningfulActions: Math.round(successfulAction),
      frictionPenalty: -Math.round(friction),
      intrusivePenalty: -Math.round(fatigue),
    },
  }
}

function calcIntentClarity(frictionType, confidence, reviewCount, backCount) {
  let base = confidence * 0.75
  if (frictionType === 'DECISION') base -= 20
  if (frictionType === 'COMPARISON') base -= 10
  if (reviewCount === 1) base += 10
  if (backCount >= 3) base -= 15
  return Math.max(0, Math.min(100, base))
}

function calcFriction(frictionType, backCount, searchCount) {
  const base = { NONE: 0, DISCOVERY: 25, NAVIGATION: 45, COMPARISON: 35, DECISION: 55, SAFETY: 80 }
  return Math.min(100, (base[frictionType] || 0) + backCount * 6 + searchCount * 4)
}

function getQualityLabel(score) {
  if (score >= 80) return 'Optimal Session'
  if (score >= 60) return 'Healthy Progress'
  if (score >= 40) return 'Mild Friction'
  return 'High Friction'
}

/**
 * Pure transparent calculation of Session Quality Score from breakdown object
 */
export function calculateSessionQualityScore(breakdown = {}) {
  const relevance = breakdown.relevance ?? 50
  const intentClarity = breakdown.intent_clarity ?? breakdown.intentClarity ?? 50
  const successfulAction = breakdown.successful_action ?? breakdown.successfulAction ?? 50
  const goalCompletion = breakdown.goal_completion ?? breakdown.goalCompletion ?? 50
  const friction = breakdown.friction ?? 0
  const fatigue = breakdown.fatigue ?? 0

  const raw = (
    relevance * 0.30 +
    intentClarity * 0.20 +
    successfulAction * 0.25 +
    goalCompletion * 0.15 -
    friction * 0.05 -
    fatigue * 0.05
  )
  return Math.round(Math.max(0, Math.min(100, raw)))
}

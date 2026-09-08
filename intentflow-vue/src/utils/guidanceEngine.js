// =============================================
// IntentFlow — Guidance Engine & Responsible Guardrail
// Determines: What should the system do next?
// Decisions: EXPLORE | CLARIFY | RECOMMEND | NAVIGATE | SIMPLIFY | STOP
// Principle: IF USER GOAL IS SATISFIED → STOP PUSHING
// =============================================

import { INTENT_STAGES } from './intentDetection.js'

export const GUIDANCE_ACTIONS = {
  EXPLORE: 'EXPLORE',
  CLARIFY: 'CLARIFY',
  RECOMMEND: 'RECOMMEND',
  NAVIGATE: 'NAVIGATE',
  SIMPLIFY: 'SIMPLIFY',
  STOP: 'STOP',
}

export const DECISION_TYPES = GUIDANCE_ACTIONS

export const GUARDRAIL_STATUS = {
  SAFE: 'SAFE',
  STOP_RECOMMENDING: 'STOP_RECOMMENDING',
  REDUCE_PUSH: 'REDUCE_PUSH',
}

function wrapResponse(res) {
  if (!res) return res
  res.decision = res.action
  res.directAction = res.directNavigation
  res.suppressed = res.guardrailStatus === GUARDRAIL_STATUS.STOP_RECOMMENDING || res.action === GUIDANCE_ACTIONS.STOP
  return res
}

/**
 * Evaluates the next best guidance action and enforces responsible guardrails
 * Supports (intentResult, sessionContext, profile) or (intentResult, profile, sessionContext)
 * @param {Object} intentResult - from detectIntent()
 * @param {Object} [arg2] - session signals or profile
 * @param {Object} [arg3] - session signals or profile
 * @returns {Object} Guidance decision
 */
export function evaluateGuidance(intentResult = {}, arg2 = {}, arg3 = {}) {
  const safeIntent = intentResult || {}
  let sessionContext = {}
  let profile = null

  if (arg2 && (arg2.type === 'new' || arg2.type === 'regular' || arg2.historicalPreferences || arg2.user_type)) {
    profile = arg2
    sessionContext = arg3 || {}
  } else if (arg3 && (arg3.type === 'new' || arg3.type === 'regular' || arg3.historicalPreferences || arg3.user_type)) {
    profile = arg3
    sessionContext = arg2 || {}
  } else {
    sessionContext = arg2 || {}
    profile = arg3 || null
  }

  const stage = safeIntent.stage || INTENT_STAGES.UNKNOWN
  const confidence = safeIntent.confidence || 0
  const entity = safeIntent.entity || safeIntent.targetEntity || null
  const category = safeIntent.category || null
  const target_event = safeIntent.target_event || (safeIntent.directMatch?.path?.replace('/event/', '')) || null
  const reasons = safeIntent.reasons || []

  const {
    confirmCount = 0,
    backCount = 0,
    reviewCount = 0,
    safetyTriggered = false,
    frictionType = 'NONE',
    categorySwitches = 0,
    rapidClicks = 0,
  } = sessionContext

  const dismissCount = sessionContext.dismissCount || sessionContext.interventionsDismissed || 0
  const isFatigued = sessionContext.fatigueDetected || dismissCount >= 2 || (sessionContext.dwellSeconds > 900 && !sessionContext.actionCount)

  // 1. Safety Override — Highest Guardrail
  if (safetyTriggered) {
    return wrapResponse({
      action: GUIDANCE_ACTIONS.STOP,
      label: 'Safety Override Active',
      description: 'Commercial nudges paused. Providing responsible play and cooling-off support.',
      directNavigation: null,
      guardrailStatus: GUARDRAIL_STATUS.STOP_RECOMMENDING,
      guardrailReason: 'Safety conditions active — conversion optimization suspended.',
      explanation: 'User protection and control prioritize over all other activities.',
    })
  }

  // 2. Goal Completed / Intent Satisfied → STOP PUSHING
  if (confirmCount >= 1 || stage === INTENT_STAGES.SATISFIED) {
    return wrapResponse({
      action: GUIDANCE_ACTIONS.STOP,
      label: 'Goal Satisfied — Zero Pressure',
      description: 'Your selection is confirmed. IntentFlow stops all further recommendations.',
      directNavigation: null,
      guardrailStatus: GUARDRAIL_STATUS.STOP_RECOMMENDING,
      guardrailReason: 'User goal successfully reached. IntentFlow principle: no unnecessary push.',
      explanation: 'Action completed. We do not prompt additional bets or artificial re-engagement.',
    })
  }

  // 3. User Paused Recommendations Feedback
  if (profile?.paused_recommendations) {
    return wrapResponse({
      action: GUIDANCE_ACTIONS.STOP,
      label: 'Recommendations Paused by User',
      description: 'You have paused proactive guidance. Enjoy uninterrupted browsing.',
      directNavigation: null,
      guardrailStatus: GUARDRAIL_STATUS.STOP_RECOMMENDING,
      guardrailReason: 'User exercised autonomous preference control to pause recommendations.',
      explanation: 'Explicit user preference respected.',
    })
  }

  // 4. Recommendation Fatigue Guardrail
  if (isFatigued) {
    return wrapResponse({
      action: GUIDANCE_ACTIONS.STOP,
      label: 'Fatigue Detected — Stepping Back',
      description: 'You prefer exploring without suggestions. Recommendations are quieted.',
      directNavigation: null,
      guardrailStatus: GUARDRAIL_STATUS.STOP_RECOMMENDING,
      guardrailReason: 'Recommendation fatigue detected after ignored suggestions. Respecting user space.',
      explanation: 'System noticed suggestions were not needed and deliberately stopped.',
    })
  }

  // 5. Ambiguous intent / rapid category switching
  if (categorySwitches >= 4 || rapidClicks >= 3) {
    return wrapResponse({
      action: GUIDANCE_ACTIONS.CLARIFY,
      label: 'Clarify Interest',
      description: 'You are exploring across multiple activities. Take your time to discover.',
      directNavigation: null,
      guardrailStatus: GUARDRAIL_STATUS.SAFE,
      guardrailReason: 'Rapid switching detected; reducing cognitive overload.',
      explanation: 'Clarifying interest before making any suggestions.',
    })
  }

  // 6. Decision Friction → SIMPLIFY (Decision Clarity Card)
  if (frictionType === 'DECISION' || reviewCount >= 2) {
    return wrapResponse({
      action: GUIDANCE_ACTIONS.SIMPLIFY,
      label: 'Simplify Selection (Clarity Card)',
      description: 'Show transparent summary with no hidden terms and equal weight on "Continue Later".',
      directNavigation: {
        path: '/review',
        label: 'Open Decision Clarity Summary →',
      },
      guardrailStatus: GUARDRAIL_STATUS.SAFE,
      guardrailReason: 'Decision friction detected; reducing cognitive load rather than pushing urgency.',
      explanation: 'Helping resolve hesitation with clarity rather than countdown timers.',
    })
  }

  // 7. High Intent from Search / Target Entity → NAVIGATE
  if (stage === INTENT_STAGES.HIGH_INTENT || (confidence >= 70 && (target_event || entity))) {
    const targetMatch = target_event ? `/event/${target_event}` : (category ? `/sports?sport=${category}` : '/sports')
    const entityName = entity || 'your match'

    return wrapResponse({
      action: GUIDANCE_ACTIONS.NAVIGATE,
      label: `Direct Navigation: View ${entityName}`,
      description: `High intent detected for ${entityName}. Offering a direct route without endless navigation clicks.`,
      directNavigation: {
        path: targetMatch,
        label: `Jump to ${entityName} →`,
        entity: entityName,
        targetEventId: target_event,
      },
      guardrailStatus: GUARDRAIL_STATUS.SAFE,
      guardrailReason: 'Intent is clearly articulated; direct route reduces navigation friction.',
      explanation: reasons.length > 0 ? reasons[0] : `Direct match identified for "${entityName}".`,
    })
  }

  // 8. Medium Confidence (45–75%) or FOCUSED Stage → RECOMMEND
  if (stage === INTENT_STAGES.FOCUSED || (confidence >= 45 && stage !== INTENT_STAGES.UNKNOWN)) {
    return wrapResponse({
      action: GUIDANCE_ACTIONS.RECOMMEND,
      label: `Recommend Relevant ${category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Content'}`,
      description: 'Suggesting relevant upcoming matches based on your active exploration.',
      directNavigation: category ? {
        path: `/sports?sport=${category}`,
        label: `Browse ${category} →`,
      } : null,
      guardrailStatus: GUARDRAIL_STATUS.SAFE,
      guardrailReason: 'Confidence is moderate; displaying voluntary recommendations without pressure.',
      explanation: reasons.length > 0 ? reasons[0] : 'Matches your current browsing area.',
    })
  }

  // 9. Low Confidence / New User Initial State → EXPLORE
  if ((profile?.user_type === 'new' || profile?.type === 'new') && (confidence === 0 || stage === INTENT_STAGES.UNKNOWN)) {
    return wrapResponse({
      action: GUIDANCE_ACTIONS.EXPLORE,
      label: 'Explore Catalog Freely',
      description: 'Open discovery in progress. System is passively observing without intervention.',
      directNavigation: null,
      guardrailStatus: GUARDRAIL_STATUS.SAFE,
      guardrailReason: 'New user with unknown intent. Zero assumptions made.',
      explanation: 'First session started. Unbiased exploration mode active.',
    })
  }

  // 10. Low Confidence / Voluntary Clarification
  if (confidence > 0 && confidence < 40) {
    return wrapResponse({
      action: GUIDANCE_ACTIONS.CLARIFY,
      label: 'Clarify Preferences',
      description: 'Offer quick voluntary category choices to tailor your discovery experience.',
      directNavigation: null,
      guardrailStatus: GUARDRAIL_STATUS.SAFE,
      guardrailReason: 'Intent is nascent; lightweight preference options offered.',
      explanation: 'First-time explorer: lightweight preference selection available.',
    })
  }

  // Default: Open Exploration
  return wrapResponse({
    action: GUIDANCE_ACTIONS.EXPLORE,
    label: 'Explore Catalog Freely',
    description: 'Natural discovery in progress. System is passively observing without intervention.',
    directNavigation: null,
    guardrailStatus: GUARDRAIL_STATUS.SAFE,
    guardrailReason: 'User is naturally browsing; no intervention required.',
    explanation: 'Zero pressure. System steps in only when helpful.',
  })
}

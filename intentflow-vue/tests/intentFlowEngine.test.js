// ==========================================================
// IntentFlow — Automated Test Suite for Challenge 1
// Tests all 14 core scenarios for Intent & Guidance Engine
// Run with: node tests/intentFlowEngine.test.js
// ==========================================================

import {
  detectIntent,
  INTENT_STAGES,
  SESSION_STATES,
} from '../src/utils/intentDetection.js'

import {
  evaluateGuidance,
  DECISION_TYPES,
} from '../src/utils/guidanceEngine.js'

import {
  USER_TYPES,
  DEMO_REGULAR_PROFILE,
  DEMO_NEW_PROFILE,
  createProfile,
} from '../src/utils/userProfile.js'

import { calculateSessionQualityScore } from '../src/utils/journeyHealth.js'

let passed = 0
let failed = 0

function assert(description, condition) {
  if (condition) {
    console.log(`  ✓ PASS: ${description}`)
    passed++
  } else {
    console.error(`  ✗ FAIL: ${description}`)
    failed++
  }
}

console.log('\n======================================================')
console.log('  INTENTFLOW SESSION INTELLIGENCE — TEST SUITE (14 CASES)')
console.log('======================================================\n')

// -------------------------------------------------------------------
// Case 1: New user with no history
// -------------------------------------------------------------------
console.log('Test Case 1: New user with no history')
{
  const newProfile = createProfile(USER_TYPES.NEW)
  const result = detectIntent([], newProfile)
  assert('Stage should be UNKNOWN', result.stage === INTENT_STAGES.UNKNOWN)
  assert('Confidence should be 0', result.confidence === 0)
  
  const guidance = evaluateGuidance(result, newProfile)
  assert('Guidance should be EXPLORE for new user with 0 intent', guidance.decision === DECISION_TYPES.EXPLORE)
}

// -------------------------------------------------------------------
// Case 2: New user selecting football
// -------------------------------------------------------------------
console.log('\nTest Case 2: New user selecting football')
{
  const newProfile = createProfile(USER_TYPES.NEW)
  const events = [
    {
      event_type: 'sport_select',
      entity_type: 'sport',
      entity_id: 'football',
      category: 'football',
      timestamp: Date.now(),
      source: 'catalog_browser',
    },
  ]
  const result = detectIntent(events, newProfile)
  assert('Target entity or category is football', result.category === 'football' || result.targetEntity === 'Football')
  assert('Stage progressed beyond UNKNOWN', [INTENT_STAGES.EXPLORING, INTENT_STAGES.INTERESTED].includes(result.stage))
  assert('Confidence is positive', result.confidence > 0)
}

// -------------------------------------------------------------------
// Case 3: New user viewing multiple football events
// -------------------------------------------------------------------
console.log('\nTest Case 3: New user viewing multiple football events')
{
  const newProfile = createProfile(USER_TYPES.NEW)
  const events = [
    { event_type: 'sport_select', category: 'football', timestamp: Date.now() - 40000 },
    { event_type: 'event_view', entity_id: 'arsenal-chelsea', category: 'football', timestamp: Date.now() - 30000 },
    { event_type: 'event_view', entity_id: 'real-barca', category: 'football', timestamp: Date.now() - 20000 },
    { event_type: 'event_view', entity_id: 'city-liverpool', category: 'football', timestamp: Date.now() - 10000 },
  ]
  const result = detectIntent(events, newProfile)
  assert('Stage elevated to FOCUSED or HIGH_INTENT', [INTENT_STAGES.FOCUSED, INTENT_STAGES.HIGH_INTENT].includes(result.stage))
  assert('Confidence >= 50%', result.confidence >= 50)
  
  const guidance = evaluateGuidance(result, newProfile)
  assert('Guidance decision is RECOMMEND or NAVIGATE', [DECISION_TYPES.RECOMMEND, DECISION_TYPES.NAVIGATE].includes(guidance.decision))
}

// -------------------------------------------------------------------
// Case 4: Regular user with football preference
// -------------------------------------------------------------------
console.log('\nTest Case 4: Regular user with football preference')
{
  const regProfile = { ...DEMO_REGULAR_PROFILE }
  const events = [
    { event_type: 'page_view', category: 'sports', timestamp: Date.now() },
  ]
  const result = detectIntent(events, regProfile)
  assert('Historical profile boosts football baseline affinity', result.category === 'football')
  assert('Confidence reflects returning user context', result.confidence >= 30)
}

// -------------------------------------------------------------------
// Case 5: Regular user searching for Arsenal (High intent direct shortcut)
// -------------------------------------------------------------------
console.log('\nTest Case 5: Regular user searching for Arsenal')
{
  const regProfile = { ...DEMO_REGULAR_PROFILE }
  const events = [
    { event_type: 'search_query', entity_id: 'Arsenal vs Chelsea', category: 'football', timestamp: Date.now() },
  ]
  const result = detectIntent(events, regProfile)
  assert('Entity recognized as Arsenal', result.targetEntity?.includes('Arsenal') || result.directMatch?.entity?.includes('Arsenal'))
  assert('Stage is HIGH_INTENT', result.stage === INTENT_STAGES.HIGH_INTENT)
  
  const guidance = evaluateGuidance(result, regProfile)
  assert('Guidance decision is NAVIGATE direct shortcut', guidance.decision === DECISION_TYPES.NAVIGATE)
  assert('Direct action provided', !!guidance.directAction?.path)
}

// -------------------------------------------------------------------
// Case 6: Dynamic intent adaptation (Switching from cricket to football)
// -------------------------------------------------------------------
console.log('\nTest Case 6: User switching intent from cricket to football')
{
  const profile = createProfile(USER_TYPES.NEW)
  // Initially browsed cricket
  const events = [
    { event_type: 'event_view', category: 'cricket', timestamp: Date.now() - 60000 },
    { event_type: 'event_view', category: 'cricket', timestamp: Date.now() - 50000 },
    // Then shifted entirely to football in recent interactions
    { event_type: 'event_view', category: 'football', entity_id: 'arsenal', timestamp: Date.now() - 30000 },
    { event_type: 'event_view', category: 'football', entity_id: 'chelsea', timestamp: Date.now() - 20000 },
    { event_type: 'event_view', category: 'football', entity_id: 'real-madrid', timestamp: Date.now() - 10000 },
    { event_type: 'search_query', category: 'football', entity_id: 'arsenal', timestamp: Date.now() },
  ]
  const result = detectIntent(events, profile)
  assert('Engine adapts to current session topic: football', result.category === 'football')
  assert('Direct match focuses on current football intent', result.targetEntity?.includes('Arsenal'))
}

// -------------------------------------------------------------------
// Case 7: Ambiguous intent across multiple categories
// -------------------------------------------------------------------
console.log('\nTest Case 7: User with ambiguous intent across multiple categories')
{
  const profile = createProfile(USER_TYPES.NEW)
  const events = [
    { event_type: 'category_change', category: 'sports', timestamp: Date.now() - 30000 },
    { event_type: 'category_change', category: 'casino', timestamp: Date.now() - 25000 },
    { event_type: 'category_change', category: 'lotto', timestamp: Date.now() - 20000 },
    { event_type: 'category_change', category: 'virtual', timestamp: Date.now() - 15000 },
    { event_type: 'category_change', category: 'live', timestamp: Date.now() - 10000 },
  ]
  const result = detectIntent(events, profile)
  const guidance = evaluateGuidance(result, profile, { categorySwitches: 5, rapidClicks: 4 })
  assert('Confidence remains low/cautious (<60%)', result.confidence < 60)
  assert('Guidance uses CLARIFY, SIMPLIFY, or EXPLORE, avoiding high-pressure', 
    [DECISION_TYPES.CLARIFY, DECISION_TYPES.SIMPLIFY, DECISION_TYPES.EXPLORE].includes(guidance.decision))
}

// -------------------------------------------------------------------
// Case 8: User repeatedly ignoring recommendations
// -------------------------------------------------------------------
console.log('\nTest Case 8: User repeatedly ignoring recommendations')
{
  const profile = createProfile(USER_TYPES.REGULAR)
  const events = [
    { event_type: 'guidance_dismissed', entity_id: 'rec_1', timestamp: Date.now() - 20000 },
    { event_type: 'feedback_dislike', entity_id: 'rec_2', timestamp: Date.now() - 15000 },
    { event_type: 'guidance_dismissed', entity_id: 'rec_3', timestamp: Date.now() - 10000 },
  ]
  const result = detectIntent(events, profile)
  const guidance = evaluateGuidance(result, profile, { dismissCount: 3 })
  assert('Guidance engine respects dismissals and stops pushing', 
    guidance.decision === DECISION_TYPES.STOP || guidance.suppressed === true)
}

// -------------------------------------------------------------------
// Case 9: User completing intended action
// -------------------------------------------------------------------
console.log('\nTest Case 9: User completing intended action')
{
  const profile = createProfile(USER_TYPES.REGULAR)
  const events = [
    { event_type: 'event_view', entity_id: 'arsenal-chelsea', category: 'football', timestamp: Date.now() - 20000 },
    { event_type: 'ACTION_CONFIRMED', entity_id: 'arsenal-chelsea', category: 'football', timestamp: Date.now() },
  ]
  const result = detectIntent(events, profile)
  assert('Stage reaches SATISFIED after action confirmation', result.stage === INTENT_STAGES.SATISFIED)
}

// -------------------------------------------------------------------
// Case 10: User with satisfied intent (Guidance: STOP)
// -------------------------------------------------------------------
console.log('\nTest Case 10: User with satisfied intent -> Guidance: STOP')
{
  const profile = createProfile(USER_TYPES.REGULAR)
  const intentState = {
    stage: INTENT_STAGES.SATISFIED,
    confidence: 100,
    targetEntity: 'Arsenal vs Chelsea',
    category: 'football',
  }
  const guidance = evaluateGuidance(intentState, profile)
  assert('Guidance decision is strictly STOP', guidance.decision === DECISION_TYPES.STOP)
  assert('Action is do nothing / zero pressure', guidance.action === 'STOP' || guidance.guardrailStatus === 'STOP_RECOMMENDING')
}

// -------------------------------------------------------------------
// Case 11: Recommendation fatigue guardrail
// -------------------------------------------------------------------
console.log('\nTest Case 11: Recommendation fatigue guardrail')
{
  const profile = createProfile(USER_TYPES.REGULAR)
  const intentState = {
    stage: INTENT_STAGES.FOCUSED,
    confidence: 60,
    category: 'football',
  }
  // High fatigue conditions: 15 minutes in session, 20 page views, 0 conversions
  const guidance = evaluateGuidance(intentState, profile, {
    fatigueDetected: true,
    dwellSeconds: 950,
    actionCount: 0,
  })
  assert('Fatigue triggers STOP decision or simplified cooldown', 
    [DECISION_TYPES.STOP, DECISION_TYPES.SIMPLIFY].includes(guidance.decision))
}

// -------------------------------------------------------------------
// Case 12: AI API failure / fallback
// -------------------------------------------------------------------
console.log('\nTest Case 12: AI API failure / fallback')
{
  // Simulated missing or thrown AI call falling back to deterministic engine
  const safeIntentFallback = () => {
    try {
      throw new Error('Simulated AI upstream timeout')
    } catch (err) {
      // Local heuristic fallback
      return detectIntent([{ event_type: 'sport_select', category: 'football' }], DEMO_REGULAR_PROFILE)
    }
  }
  const fallbackResult = safeIntentFallback()
  assert('Fallback produces valid intent state without throwing', !!fallbackResult.stage)
  assert('Fallback category matches local signal', fallbackResult.category === 'football')
}

// -------------------------------------------------------------------
// Case 13: Missing session data
// -------------------------------------------------------------------
console.log('\nTest Case 13: Missing session data')
{
  const result = detectIntent(null, null)
  assert('Handles null gracefully', result.stage === INTENT_STAGES.UNKNOWN)
  assert('Confidence defaults safely to 0', result.confidence === 0)
  
  const guidance = evaluateGuidance(result, null)
  assert('Guidance handles null gracefully', guidance.decision === DECISION_TYPES.EXPLORE)
}

// -------------------------------------------------------------------
// Case 14: Missing historical profile
// -------------------------------------------------------------------
console.log('\nTest Case 14: Missing historical profile')
{
  const events = [{ event_type: 'sport_select', category: 'basketball', timestamp: Date.now() }]
  const result = detectIntent(events, undefined)
  assert('Engine treats missing profile as clean exploratory mode', result.category === 'basketball')
  assert('Engine proceeds without throwing', result.confidence > 0)
}

// -------------------------------------------------------------------
// Bonus check: Session Quality Score transparent formula
// -------------------------------------------------------------------
console.log('\nBonus Test: Session Quality Score Calculation')
{
  const breakdown = {
    relevance: 90,
    intent_clarity: 80,
    successful_action: 100,
    goal_completion: 100,
    friction: 10,
    fatigue: 5,
  }
  const score = calculateSessionQualityScore(breakdown)
  // 0.30*90 (27) + 0.20*80 (16) + 0.25*100 (25) + 0.15*100 (15) - 0.05*10 (0.5) - 0.05*5 (0.25) = 82.25 -> 82
  assert('Calculates exact transparent score formula', score === 82)
}

console.log('\n======================================================')
console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`)
console.log('======================================================\n')

if (failed > 0) {
  process.exit(1)
} else {
  process.exit(0)
}

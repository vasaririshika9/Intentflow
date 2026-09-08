// =============================================
// IntentFlow — User Profile System
// Distinguishes New Users vs Regular / Returning Users
// Tracks long-term preferences separate from current session intent
// =============================================

export const USER_TYPES = {
  NEW: 'new',
  REGULAR: 'regular',
}

/**
 * Creates a normalized User Profile
 * @param {string} userType - 'new' | 'regular'
 * @param {Object} overrides
 * @returns {Object} UserProfile
 */
export function createProfile(userType = USER_TYPES.NEW, overrides = {}) {
  const isRegular = userType === USER_TYPES.REGULAR

  return {
    user_id: overrides.user_id || (isRegular ? 'usr-feg-demo' : `usr-new-${Date.now().toString(36)}`),
    user_type: userType,
    name: overrides.name || (isRegular ? 'Returning Explorer' : 'New Explorer'),
    long_term_preferences: overrides.long_term_preferences || (isRegular ? {
      football: 0.82,
      basketball: 0.45,
      tennis: 0.35,
      cricket: 0.31,
    } : {}),
    frequent_entities: overrides.frequent_entities || (isRegular ? [
      'arsenal',
      'premier_league',
      'lakers',
      'real_madrid'
    ] : []),
    recent_intents: overrides.recent_intents || (isRegular ? [
      'find_next_match',
      'explore_football'
    ] : []),
    disliked_entities: overrides.disliked_entities || [],
    disliked_categories: overrides.disliked_categories || [],
    paused_recommendations: overrides.paused_recommendations || false,
    last_active: overrides.last_active || new Date().toISOString(),
    profile_confidence: overrides.profile_confidence ?? (isRegular ? 0.84 : 0.15),
    created_at: overrides.created_at || new Date().toISOString(),
  }
}

/**
 * Predefined profiles for instant testing & demo
 */
export const DEMO_REGULAR_PROFILE = createProfile(USER_TYPES.REGULAR, {
  user_id: 'usr-feg-regular',
  name: 'Regular Explorer (Demo User)',
  long_term_preferences: {
    football: 0.82,
    basketball: 0.45,
    cricket: 0.31,
    tennis: 0.25,
  },
  frequent_entities: ['arsenal', 'premier_league', 'chelsea'],
  recent_intents: ['find_next_match', 'view_premier_league'],
  profile_confidence: 0.88,
})

export const DEMO_NEW_PROFILE = createProfile(USER_TYPES.NEW, {
  user_id: 'usr-feg-new',
  name: 'New Explorer',
  long_term_preferences: {},
  frequent_entities: [],
  recent_intents: [],
  profile_confidence: 0.10,
})

/**
 * Updates a profile based on a recorded session event
 * Reinforces categories/entities without overriding current-session precedence
 */
export function recordInteraction(profile, { category, entity, event_type }) {
  if (!profile) return profile

  const updated = { ...profile, long_term_preferences: { ...profile.long_term_preferences } }

  if (category) {
    const currentWeight = updated.long_term_preferences[category.toLowerCase()] || 0
    updated.long_term_preferences[category.toLowerCase()] = Math.min(0.95, parseFloat((currentWeight + 0.05).toFixed(2)))
  }

  if (entity) {
    const cleanEntity = entity.toLowerCase()
    if (!updated.frequent_entities.includes(cleanEntity)) {
      updated.frequent_entities = [cleanEntity, ...updated.frequent_entities].slice(0, 10)
    }
  }

  if (updated.user_type === USER_TYPES.NEW) {
    updated.profile_confidence = Math.min(0.75, parseFloat((updated.profile_confidence + 0.08).toFixed(2)))
  }

  updated.last_active = new Date().toISOString()
  return updated
}

/**
 * Applies explicit user feedback
 */
export function applyFeedback(profile, action, target) {
  if (!profile) return profile
  const updated = { ...profile }

  switch (action) {
    case 'SHOW_LESS':
    case 'NOT_INTERESTED': {
      if (target) {
        const clean = target.toLowerCase()
        if (!updated.disliked_entities.includes(clean)) {
          updated.disliked_entities = [...updated.disliked_entities, clean]
        }
        if (updated.long_term_preferences[clean]) {
          updated.long_term_preferences[clean] = Math.max(0, updated.long_term_preferences[clean] - 0.3)
        }
      }
      break
    }
    case 'PAUSE_RECOMMENDATIONS':
      updated.paused_recommendations = true
      break
    case 'RESUME_RECOMMENDATIONS':
      updated.paused_recommendations = false
      break
    case 'SET_INITIAL_PREFERENCES': {
      if (Array.isArray(target)) {
        target.forEach(cat => {
          updated.long_term_preferences[cat.toLowerCase()] = 0.65
        })
        updated.profile_confidence = 0.45
      }
      break
    }
  }

  return updated
}

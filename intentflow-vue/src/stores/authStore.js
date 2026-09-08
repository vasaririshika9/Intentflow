// =============================================
// IntentFlow — Auth & User Profile Store (Pinia)
// Handles login / register with credentials user / DEMO
// Manages New User vs Regular / Returning User profiles
// =============================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSessionStore } from './sessionStore'
import { USER_TYPES, DEMO_REGULAR_PROFILE, DEMO_NEW_PROFILE, createProfile } from '@/utils/userProfile'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)
  const userProfile = ref({ ...DEMO_NEW_PROFILE })
  const showAuthModal = ref(false)
  const authMode = ref('login') // 'login' | 'register'
  const errorMessage = ref('')

  function openLogin() {
    authMode.value = 'login'
    errorMessage.value = ''
    showAuthModal.value = true
  }

  function openRegister() {
    authMode.value = 'register'
    errorMessage.value = ''
    showAuthModal.value = true
  }

  function closeAuth() {
    showAuthModal.value = false
    errorMessage.value = ''
  }

  function login(username, password) {
    errorMessage.value = ''
    // Credentials check: user / DEMO (case-insensitive for username)
    if (username.trim().toLowerCase() === 'user' && password === 'DEMO') {
      isAuthenticated.value = true
      user.value = {
        username: 'user',
        name: 'Demo Explorer',
        balance: '100 Points',
        role: 'Verified Regular Explorer',
        safetyProfile: 'Standard Protections Active',
      }
      userProfile.value = { ...DEMO_REGULAR_PROFILE }
      showAuthModal.value = false

      const sessionStore = useSessionStore()
      sessionStore.setUserProfile(userProfile.value)
      sessionStore.trackEvent('USER_LOGGED_IN', { username: 'user', user_type: USER_TYPES.REGULAR })
      return { success: true }
    } else {
      errorMessage.value = 'Invalid credentials. Demo credentials: user / DEMO'
      return { success: false, error: errorMessage.value }
    }
  }

  function register(username, password, email) {
    errorMessage.value = ''
    if ((username.trim().toLowerCase() === 'user' && password === 'DEMO') || (username.trim() && password)) {
      isAuthenticated.value = true
      user.value = {
        username: username.trim(),
        name: username.trim(),
        balance: '100 Points',
        role: 'New Explorer',
        safetyProfile: 'Standard Protections Active',
      }
      userProfile.value = createProfile(USER_TYPES.NEW, { name: username.trim() })
      showAuthModal.value = false

      const sessionStore = useSessionStore()
      sessionStore.setUserProfile(userProfile.value)
      sessionStore.trackEvent('USER_REGISTERED', { username: username.trim(), user_type: USER_TYPES.NEW })
      return { success: true }
    } else {
      errorMessage.value = 'Please provide valid details (Recommended: user / DEMO)'
      return { success: false, error: errorMessage.value }
    }
  }

  function logout() {
    isAuthenticated.value = false
    user.value = null
    userProfile.value = { ...DEMO_NEW_PROFILE }

    const sessionStore = useSessionStore()
    sessionStore.setUserProfile(userProfile.value)
    sessionStore.trackEvent('USER_LOGGED_OUT')
  }

  /**
   * Directly switches between New User and Regular User for demo/testing
   */
  function setUserType(type) {
    if (type === USER_TYPES.REGULAR) {
      isAuthenticated.value = true
      user.value = {
        username: 'user',
        name: 'Demo Explorer',
        balance: '100 Points',
        role: 'Regular Explorer',
        safetyProfile: 'Standard Protections Active',
      }
      userProfile.value = { ...DEMO_REGULAR_PROFILE }
    } else {
      isAuthenticated.value = false
      user.value = null
      userProfile.value = { ...DEMO_NEW_PROFILE }
    }

    const sessionStore = useSessionStore()
    sessionStore.setUserProfile(userProfile.value)
  }

  const userType = computed(() => userProfile.value?.type || USER_TYPES.NEW)

  function toggleUserType() {
    if (userProfile.value?.type === USER_TYPES.REGULAR) {
      setUserType(USER_TYPES.NEW)
    } else {
      setUserType(USER_TYPES.REGULAR)
    }
  }

  return {
    isAuthenticated,
    user,
    userProfile,
    userType,
    showAuthModal,
    authMode,
    errorMessage,
    openLogin,
    openRegister,
    closeAuth,
    login,
    register,
    logout,
    setUserType,
    toggleUserType,
  }
})

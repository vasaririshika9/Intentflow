<template>
  <nav class="navbar" role="navigation" aria-label="Main navigation">
    <div class="navbar__inner">
      <!-- Logo -->
      <RouterLink to="/" class="navbar__logo" aria-label="IntentFlow Home">
        <span class="logo-icon">⚡</span>
        <span class="logo-text">IntentFlow</span>
        <span class="logo-tag">FEG 2026</span>
      </RouterLink>

      <!-- Primary nav -->
      <div class="navbar__nav" role="menubar">
        <RouterLink to="/" class="nav-item" active-class="nav-item--active" exact>Sport</RouterLink>
        <RouterLink to="/live" class="nav-item nav-item--live">
          <span class="live-dot"></span>Live
        </RouterLink>
        <RouterLink to="/casino" class="nav-item">Casino</RouterLink>
        <RouterLink to="/live-casino" class="nav-item">Live Casino</RouterLink>
        <RouterLink to="/lotto" class="nav-item">Lotto</RouterLink>
        <RouterLink to="/virtual" class="nav-item">Virtual</RouterLink>
        <RouterLink to="/product-impact" class="nav-item">Impact</RouterLink>
        <RouterLink to="/ontology" class="nav-item nav-item--ontology">
          <span class="ontology-icon">🧠</span>Ontology
        </RouterLink>
      </div>

      <!-- Right actions -->
      <div class="navbar__right">
        <!-- Safety status pill -->
        <div class="safety-pill" :class="safetyClass" :title="safetyTitle">
          <span class="safety-dot"></span>
          {{ sessionStore.safetyStatus === 'SAFETY_OVERRIDE' ? 'Safety Override' : 'Safety Active' }}
        </div>

        <!-- Compare badge -->
        <RouterLink v-if="comparisonStore.count > 0" to="/compare" class="compare-badge" :title="`Comparing ${comparisonStore.count} of 2 events`">
          ⚖️ Compare ({{ comparisonStore.count }}/2)
        </RouterLink>

        <!-- Demo toggle -->
        <button class="demo-toggle" @click="demoStore.togglePanel()" :class="{ active: demoStore.panelOpen }"
          title="Demo Mode (Ctrl+Shift+D)">
          🎛️ Demo
        </button>

        <!-- User Type Switcher (New vs Regular) -->
        <button
          class="user-type-badge"
          :class="authStore.userType === 'regular' ? 'user-type-badge--regular' : 'user-type-badge--new'"
          @click="authStore.toggleUserType()"
          :title="authStore.userType === 'regular'
            ? 'Regular Explorer Profile active (82% Football bias). Click to switch to New User.'
            : 'New User Profile active (Unbiased exploratory mode). Click to switch to Regular User.'"
        >
          <span class="user-type-icon">{{ authStore.userType === 'regular' ? '⭐' : '🌱' }}</span>
          <span class="user-type-text">{{ authStore.userType === 'regular' ? 'Regular User' : 'New User' }}</span>
        </button>

        <!-- User profile or Login/Register buttons -->
        <template v-if="authStore.isAuthenticated">
          <div class="user-pill" title="Logged in demo user">
            <span class="user-avatar">👤</span>
            <div class="user-meta">
              <span class="user-name">{{ authStore.user?.username }}</span>
              <span class="user-balance">✨ {{ authStore.user?.balance }}</span>
            </div>
            <button class="btn-logout" @click="authStore.logout" title="Log out">✕</button>
          </div>
        </template>
        <template v-else>
          <button class="nav-btn nav-btn--outline" @click="authStore.openLogin">Login</button>
          <button class="nav-btn nav-btn--primary" @click="authStore.openRegister">Register</button>
        </template>

        <!-- Mobile toggle -->
        <button class="mobile-toggle" @click="mobileOpen = !mobileOpen" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>

    <!-- Mobile drawer -->
    <div v-if="mobileOpen" class="mobile-drawer anim-fade-down" @click="mobileOpen = false">
      <RouterLink to="/" class="mobile-link">Home</RouterLink>
      <RouterLink to="/sports" class="mobile-link">Sports</RouterLink>
      <RouterLink to="/live" class="mobile-link">Live</RouterLink>
      <RouterLink to="/casino" class="mobile-link">🎰 Casino</RouterLink>
      <RouterLink to="/live-casino" class="mobile-link">🃏 Live Casino</RouterLink>
      <RouterLink to="/virtual" class="mobile-link">🎮 Virtual</RouterLink>
      <RouterLink to="/lotto" class="mobile-link">🎱 Lotto</RouterLink>
      <RouterLink to="/compare" class="mobile-link">Compare ({{ comparisonStore.count }}/2)</RouterLink>
      <RouterLink to="/session-quality" class="mobile-link">Session Quality</RouterLink>
      <RouterLink to="/product-impact" class="mobile-link">Product Impact</RouterLink>
      <div class="mobile-auth" v-if="!authStore.isAuthenticated">
        <button class="btn btn-outline btn-sm" @click="authStore.openLogin">Login</button>
        <button class="btn btn-primary btn-sm" @click="authStore.openRegister">Register</button>
      </div>
    </div>

    <!-- Auth Modal -->
    <AuthModal />
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSessionStore } from '@/stores/sessionStore'
import { useDemoStore } from '@/stores/demoStore'
import { useAuthStore } from '@/stores/authStore'
import { useComparisonStore } from '@/stores/comparisonStore'
import AuthModal from '@/components/AuthModal.vue'

const sessionStore = useSessionStore()
const demoStore = useDemoStore()
const authStore = useAuthStore()
const comparisonStore = useComparisonStore()
const mobileOpen = ref(false)

const safetyClass = computed(() =>
  sessionStore.safetyStatus === 'SAFETY_OVERRIDE' ? 'safety-pill--override' : 'safety-pill--normal'
)
const safetyTitle = computed(() =>
  sessionStore.safetyStatus === 'SAFETY_OVERRIDE'
    ? 'Safety Override Active — Conversion optimization paused'
    : 'Responsible play protections active'
)
</script>

<style scoped>
.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: var(--bg-nav);
  border-bottom: 1px solid var(--border-subtle);
  height: var(--navbar-h);
}
.navbar__inner {
  display: flex; align-items: center; gap: 0;
  height: 100%; padding: 0 var(--sp-5);
  max-width: 1600px; margin: 0 auto;
}
.navbar__logo {
  display: flex; align-items: center; gap: var(--sp-2);
  text-decoration: none; margin-right: var(--sp-6); flex-shrink: 0;
}
.logo-icon { font-size: 1.4rem; }
.logo-text { font-size: var(--text-lg); font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }
.logo-tag { font-size: var(--text-xs); background: var(--color-primary); color: #fff; padding: 1px 6px; border-radius: var(--r-full); font-weight: 600; }
.navbar__nav {
  display: flex; align-items: center; gap: 2px; flex: 1; overflow-x: auto;
}
.nav-item {
  padding: 6px 12px; font-size: var(--text-sm); font-weight: 500;
  color: var(--text-secondary); border-radius: var(--r-sm);
  transition: all var(--t-fast); white-space: nowrap; cursor: pointer;
  text-decoration: none;
}
.nav-item:hover { color: var(--text-primary); background: var(--bg-elevated); }
.nav-item--active { color: var(--color-primary-light) !important; background: rgba(26,115,232,0.12); }
.nav-item--live { color: #f87171; }
.nav-item--live:hover { color: #fca5a5; }
.nav-item--ontology {
  color: #c084fc;
  background: rgba(168, 85, 247, 0.08);
  border: 1px solid rgba(168, 85, 247, 0.25);
}
.nav-item--ontology:hover {
  color: #f3e8ff;
  background: rgba(168, 85, 247, 0.18);
  border-color: rgba(168, 85, 247, 0.45);
}
.ontology-icon {
  margin-right: 4px;
  font-size: 0.85rem;
}
.nav-item--dim { opacity: 0.45; cursor: default; }
.live-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #f87171; display: inline-block; margin-right: 4px;
  animation: pulse 1.5s infinite;
}
.navbar__right {
  display: flex; align-items: center; gap: var(--sp-3);
  margin-left: auto; flex-shrink: 0;
}
.safety-pill {
  display: flex; align-items: center; gap: 5px;
  font-size: var(--text-xs); font-weight: 600; padding: 4px 10px;
  border-radius: var(--r-full); border: 1px solid; transition: all var(--t-base);
}
.safety-pill--normal { color: #34d399; border-color: rgba(52,211,153,0.3); background: rgba(52,211,153,0.08); }
.safety-pill--override { color: #f87171; border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.1); animation: safetyPulse 2s infinite; }
.safety-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.compare-badge {
  display: flex; align-items: center; gap: 4px;
  font-size: var(--text-xs); font-weight: 600; padding: 4px 10px;
  border-radius: var(--r-full); background: rgba(167,139,250,0.15);
  border: 1px solid rgba(167,139,250,0.3); color: #a78bfa; text-decoration: none;
  transition: all var(--t-fast);
}
.compare-badge:hover { background: rgba(167,139,250,0.25); }
.demo-toggle {
  font-size: var(--text-xs); font-weight: 600; padding: 5px 10px;
  border-radius: var(--r-md); border: 1px solid var(--border-default);
  background: var(--bg-elevated); color: var(--text-secondary);
  transition: all var(--t-fast); cursor: pointer;
}
.demo-toggle:hover, .demo-toggle.active { border-color: var(--color-primary); color: var(--color-primary-light); }
.user-type-badge {
  display: flex; align-items: center; gap: 5px;
  font-size: var(--text-xs); font-weight: 700; padding: 4px 10px;
  border-radius: var(--r-full); border: 1px solid; transition: all var(--t-fast);
  cursor: pointer; background: var(--bg-elevated);
}
.user-type-badge--new {
  color: #34d399; border-color: rgba(52,211,153,0.4); background: rgba(52,211,153,0.1);
}
.user-type-badge--new:hover {
  background: rgba(52,211,153,0.2); border-color: #34d399;
}
.user-type-badge--regular {
  color: #fbbf24; border-color: rgba(251,191,36,0.4); background: rgba(251,191,36,0.1);
}
.user-type-badge--regular:hover {
  background: rgba(251,191,36,0.2); border-color: #fbbf24;
}
.user-type-icon { font-size: 11px; }
.user-type-text { white-space: nowrap; }
.nav-btn { font-size: var(--text-sm); font-weight: 600; padding: 6px 14px; border-radius: var(--r-md); cursor: pointer; }
.nav-btn--outline { border: 1px solid var(--border-default); background: transparent; color: var(--text-primary); }
.nav-btn--outline:hover { border-color: var(--color-primary); }
.nav-btn--primary { background: var(--color-primary); color: #fff; border: none; }
.nav-btn--primary:hover { background: var(--color-primary-dark); }
.mobile-toggle {
  display: none; flex-direction: column; gap: 4px; padding: 8px;
  cursor: pointer; background: none; border: none;
}
.mobile-toggle span { display: block; width: 20px; height: 2px; background: var(--text-primary); border-radius: 2px; }
.mobile-drawer {
  position: fixed; top: var(--navbar-h); left: 0; right: 0; z-index: 99;
  background: var(--bg-surface); border-bottom: 1px solid var(--border-default);
  padding: var(--sp-4); display: flex; flex-direction: column; gap: var(--sp-1);
}
.mobile-link {
  display: block; padding: 10px var(--sp-3); border-radius: var(--r-md);
  color: var(--text-primary); font-weight: 500; text-decoration: none;
}
.mobile-link:hover { background: var(--bg-elevated); }
.user-pill {
  display: flex; align-items: center; gap: var(--sp-2);
  background: var(--bg-card); border: 1px solid var(--border-subtle);
  padding: 4px 8px; border-radius: var(--r-full);
}
.user-avatar { font-size: 1rem; }
.user-meta { display: flex; flex-direction: column; line-height: 1.1; }
.user-name { font-size: var(--text-xs); font-weight: 700; color: var(--text-primary); }
.user-balance { font-size: 10px; color: #34d399; font-weight: 600; }
.btn-logout {
  background: none; border: none; color: var(--text-muted); cursor: pointer;
  padding: 2px 4px; border-radius: var(--r-sm); font-size: 11px;
}
.btn-logout:hover { color: #f87171; }
.mobile-auth { display: flex; gap: var(--sp-2); margin-top: var(--sp-3); padding-top: var(--sp-2); border-top: 1px solid var(--border-subtle); }
.mobile-auth .btn { flex: 1; }
@media (max-width: 900px) {
  .navbar__nav { display: none; }
  .safety-pill { display: none; }
  .nav-btn { display: none; }
  .mobile-toggle { display: flex; }
}
</style>

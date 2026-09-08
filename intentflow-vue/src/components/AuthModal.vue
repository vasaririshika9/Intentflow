<template>
  <div v-if="authStore.showAuthModal" class="modal-overlay anim-fade-in" @click.self="authStore.closeAuth">
    <div class="auth-modal card anim-scale-up" role="dialog" aria-modal="true">
      <div class="auth-header">
        <div class="auth-brand">
          <span class="auth-logo">⚡</span>
          <span class="auth-title">IntentFlow</span>
        </div>
        <button class="btn-close" @click="authStore.closeAuth" aria-label="Close modal">✕</button>
      </div>

      <div class="auth-tabs">
        <button class="auth-tab" :class="{ active: authStore.authMode === 'login' }" @click="authStore.authMode = 'login'">
          Login
        </button>
        <button class="auth-tab" :class="{ active: authStore.authMode === 'register' }" @click="authStore.authMode = 'register'">
          Register
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <!-- Demo hint banner -->
        <div class="demo-cred-hint">
          <div class="hint-title">🔑 Hackathon Demo Credentials</div>
          <div class="hint-body">Username: <code>user</code> · Password: <code>DEMO</code></div>
          <button type="button" class="btn-autofill" @click="autoFillDemo">Auto-fill Credentials</button>
        </div>

        <div class="form-group" v-if="authStore.authMode === 'register'">
          <label>Email Address</label>
          <input type="email" v-model="email" placeholder="user@example.com" class="input" />
        </div>

        <div class="form-group">
          <label>Username</label>
          <input type="text" v-model="username" placeholder="Enter username (user)" required class="input" />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input type="password" v-model="password" placeholder="Enter password (DEMO)" required class="input" />
        </div>

        <div v-if="authStore.errorMessage" class="auth-error">
          ⚠️ {{ authStore.errorMessage }}
        </div>

        <div class="auth-actions">
          <button type="submit" class="btn btn-primary btn-block">
            {{ authStore.authMode === 'login' ? 'Log In →' : 'Create Account →' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const username = ref('user')
const password = ref('DEMO')
const email = ref('user@psk.feg')

function autoFillDemo() {
  username.value = 'user'
  password.value = 'DEMO'
}

function handleSubmit() {
  if (authStore.authMode === 'login') {
    authStore.login(username.value, password.value)
  } else {
    authStore.register(username.value, password.value, email.value)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  padding: var(--sp-4);
}
.auth-modal {
  width: 100%; max-width: 420px;
  background: var(--bg-surface); border: 1px solid var(--border-default);
  border-radius: var(--r-xl); padding: var(--sp-6);
  box-shadow: var(--shadow-xl), 0 0 30px rgba(59, 130, 246, 0.15);
}
.auth-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: var(--sp-5);
}
.auth-brand {
  display: flex; align-items: center; gap: var(--sp-2);
}
.auth-logo { font-size: 1.5rem; }
.auth-title { font-size: var(--text-lg); font-weight: 800; letter-spacing: -0.02em; color: var(--text-primary); }
.btn-close {
  background: none; border: none; font-size: 1.2rem; color: var(--text-muted);
  cursor: pointer; padding: var(--sp-1); border-radius: var(--r-sm);
  transition: color var(--t-fast);
}
.btn-close:hover { color: var(--text-primary); }
.auth-tabs {
  display: flex; background: var(--bg-card); border-radius: var(--r-lg);
  padding: 3px; margin-bottom: var(--sp-4);
}
.auth-tab {
  flex: 1; padding: var(--sp-2); font-size: var(--text-sm); font-weight: 600;
  text-align: center; border: none; background: none; color: var(--text-secondary);
  cursor: pointer; border-radius: var(--r-md); transition: all var(--t-fast);
}
.auth-tab.active {
  background: var(--color-primary); color: #fff; box-shadow: var(--shadow-sm);
}
.demo-cred-hint {
  background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: var(--r-md); padding: var(--sp-3); margin-bottom: var(--sp-4);
  font-size: var(--text-xs);
}
.hint-title { font-weight: 700; color: var(--color-primary-light); margin-bottom: 2px; }
.hint-body { color: var(--text-secondary); margin-bottom: 6px; }
.hint-body code { background: rgba(0,0,0,0.3); padding: 1px 5px; border-radius: 4px; color: #fff; font-family: monospace; }
.btn-autofill {
  background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.4);
  color: var(--color-primary-light); font-size: 11px; font-weight: 600;
  padding: 3px 8px; border-radius: var(--r-sm); cursor: pointer;
}
.btn-autofill:hover { background: rgba(59, 130, 246, 0.35); }
.auth-form { display: flex; flex-direction: column; gap: var(--sp-3); }
.form-group { display: flex; flex-direction: column; gap: var(--sp-1); }
.form-group label { font-size: var(--text-xs); font-weight: 600; color: var(--text-secondary); }
.input {
  background: var(--bg-card); border: 1px solid var(--border-subtle);
  border-radius: var(--r-md); padding: 10px 12px; color: var(--text-primary);
  font-size: var(--text-sm); outline: none; transition: border-color var(--t-fast);
}
.input:focus { border-color: var(--color-primary); }
.auth-error {
  background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171; padding: var(--sp-2) var(--sp-3); border-radius: var(--r-md);
  font-size: var(--text-xs);
}
.auth-actions { margin-top: var(--sp-2); }
.btn-block { width: 100%; justify-content: center; padding: 12px; font-weight: 700; }
</style>

<template>
  <Transition name="fade">
    <div v-if="visible" class="new-user-prompt card anim-fade-up" role="region" aria-label="Personalize discovery">
      <div class="prompt-header">
        <div class="prompt-badge">NEW EXPLORER</div>
        <button class="prompt-close" @click="dismiss" aria-label="Dismiss preference prompt">✕</button>
      </div>

      <div class="prompt-content">
        <h3 class="prompt-title">Personalize Your Discovery Experience</h3>
        <p class="prompt-sub">
          We don't make assumptions about your interests. Select your favorite categories or explore freely with zero pressure.
        </p>

        <div class="choice-pills">
          <button
            v-for="cat in categories"
            :key="cat.id"
            class="choice-pill"
            :class="{ selected: selectedCats.includes(cat.id) }"
            @click="toggleCategory(cat.id)"
          >
            <span>{{ cat.icon }}</span> {{ cat.name }}
          </button>
        </div>

        <div class="prompt-actions">
          <button
            class="btn btn-primary btn-sm"
            :disabled="selectedCats.length === 0"
            @click="applyPreferences"
          >
            Save & Tailor Session →
          </button>
          <button class="btn btn-ghost btn-sm" @click="dismiss">
            Browse freely without preferences
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSessionStore } from '@/stores/sessionStore'
import { useAuthStore } from '@/stores/authStore'

const sessionStore = useSessionStore()
const authStore = useAuthStore()

const dismissed = ref(false)
const selectedCats = ref([])

const categories = [
  { id: 'football', name: 'Football', icon: '⚽' },
  { id: 'basketball', name: 'Basketball', icon: '🏀' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'casino', name: 'Casino Slots', icon: '🎰' },
  { id: 'live', name: 'Live In-Play', icon: '🔴' },
]

const visible = computed(() => {
  return (
    !dismissed.value &&
    authStore.userProfile?.user_type === 'new' &&
    sessionStore.eventsViewed.length === 0 &&
    sessionStore.sportsSelected === 0 &&
    !sessionStore.userProfile?.paused_recommendations
  )
})

function toggleCategory(id) {
  if (selectedCats.value.includes(id)) {
    selectedCats.value = selectedCats.value.filter(c => c !== id)
  } else {
    selectedCats.value.push(id)
  }
}

function applyPreferences() {
  if (selectedCats.value.length > 0) {
    sessionStore.setNewUserPreferences(selectedCats.value)
  }
  dismissed.value = true
}

function dismiss() {
  dismissed.value = true
}
</script>

<style scoped>
.new-user-prompt {
  background: linear-gradient(135deg, rgba(26, 115, 232, 0.12), rgba(13, 26, 58, 0.9));
  border: 1px solid rgba(26, 115, 232, 0.35);
  border-radius: var(--r-xl);
  padding: var(--sp-5);
  margin-bottom: var(--sp-4);
  position: relative;
  box-shadow: var(--shadow-md);
}

.prompt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--sp-2);
}

.prompt-badge {
  font-size: var(--text-xs);
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--color-primary-light);
  background: rgba(26, 115, 232, 0.2);
  padding: 3px 8px;
  border-radius: var(--r-full);
}

.prompt-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1rem;
  cursor: pointer;
  transition: color var(--t-fast);
}
.prompt-close:hover {
  color: var(--text-primary);
}

.prompt-title {
  font-size: var(--text-lg);
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: var(--sp-1);
}

.prompt-sub {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: var(--sp-4);
}

.choice-pills {
  display: flex;
  gap: var(--sp-2);
  flex-wrap: wrap;
  margin-bottom: var(--sp-4);
}

.choice-pill {
  padding: 8px 14px;
  border-radius: var(--r-full);
  border: 1px solid var(--border-default);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all var(--t-fast);
}

.choice-pill:hover {
  border-color: var(--color-primary-light);
  color: var(--text-primary);
}

.choice-pill.selected {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
  box-shadow: 0 0 12px rgba(26, 115, 232, 0.4);
}

.prompt-actions {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  flex-wrap: wrap;
}
</style>

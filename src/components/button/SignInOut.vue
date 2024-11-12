<!-- src/components/button/SignInOut.vue -->
<template>
  <Button
      @click="signOut"
      class="sign-out-button"
      severity="secondary"
  >
    <!-- Icon and Text Container -->
    <div class="flex items-center gap-2">
      <i class="fa-solid fa-right-from-bracket"></i>
      <span>Sign Out</span>
    </div>
  </Button>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import Button from 'primevue/button'

// Define props interface for sign out function
const { signOut } = defineProps<{
  signOut: () => void
}>()
</script>

<style scoped>
/* Custom button styling to match website theme */
:deep(.sign-out-button) {
  /* Base button styles */
  background-color: #bca067;
  border: none;
  padding: 0.6rem 1.2rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
  color: white;

  /* Shadow and transition effects */
  box-shadow: 0 2px 4px rgba(188, 160, 103, 0.2);
  transition: all 0.3s ease;
}

/* Hover state */
:deep(.sign-out-button:hover) {
  background-color: #ab8f56;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(188, 160, 103, 0.3);
}

/* Active/pressed state */
:deep(.sign-out-button:active) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(188, 160, 103, 0.2);
}

/* Focus state */
:deep(.sign-out-button:focus) {
  outline: 2px solid rgba(188, 160, 103, 0.5);
  outline-offset: 2px;
}

/* Disabled state */
:deep(.sign-out-button:disabled) {
  background-color: #d4c4a7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Icon styling */
:deep(.sign-out-button .fa-right-from-bracket) {
  font-size: 0.9rem;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  :deep(.sign-out-button) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}

/* Reduce motion if user prefers */
@media (prefers-reduced-motion: reduce) {
  :deep(.sign-out-button) {
    transform: none;
    transition: background-color 0.3s ease;
  }

  :deep(.sign-out-button:hover) {
    transform: none;
  }
}
</style>
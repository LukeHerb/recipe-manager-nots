<!-- src/components/Navbar.vue -->
<template>
  <header class="navbar-wrapper">
    <nav class="navbar-container">
      <!-- Logo and Home Link -->
      <router-link to="/" class="logo-container">
        <img
          src="../assets/recipetutorial.svg"
          alt="Recipe Tutorial Logo"
          class="h-8 hover:scale-105 transition-transform duration-300"
        />
      </router-link>

      <!-- Mobile Menu Button -->
      <button
        class="mobile-menu-btn md:hidden"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
        aria-label="Toggle menu"
      >
        <i
          :class="['fa-solid', isMobileMenuOpen ? 'fa-times' : 'fa-bars']"
          class="text-2xl text-gray-700 hover:text-gold transition-colors"
        ></i>
      </button>

      <!-- Desktop Navigation -->
      <div
        class="hidden md:flex md:items-center md:justify-between md:flex-grow md:ml-8"
      >
        <!-- Navigation Links -->
        <ul class="nav-links">
          <li v-for="link in navLinks" :key="link.path" class="nav-item">
            <router-link :to="link.path" class="nav-link">
              {{ link.label }}
              <span class="link-underline"></span>
            </router-link>
          </li>
        </ul>

        <!-- Sign In/Out Button for Desktop -->
        <SignInOut :sign-out="signOut" class="sign-out-btn" />
      </div>

      <!-- Mobile Navigation Menu -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform -translate-y-4 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-4 opacity-0"
      >
        <div v-if="isMobileMenuOpen" class="mobile-menu md:hidden">
          <ul class="flex flex-col space-y-4">
            <li v-for="link in navLinks" :key="link.path">
              <router-link
                :to="link.path"
                class="mobile-nav-link"
                @click="isMobileMenuOpen = false"
              >
                {{ link.label }}
              </router-link>
            </li>
          </ul>
          <!-- Sign In/Out Button for Mobile -->
          <div class="mt-6">
            <SignInOut :sign-out="signOut" class="sign-out-btn-mobile" />
          </div>
        </div>
      </Transition>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue'
import SignInOut from './button/SignInOut.vue'

const { signOut } = defineProps<{
  signOut: () => void
}>()

// State for mobile menu
const isMobileMenuOpen = ref(false)

const navLinks = [
  { path: '/', label: 'Recipes' },
  { path: '/myRecipes', label: 'My Recipes' },
  { path: '/addRecipe', label: 'Add Recipe' },
]
</script>

<style scoped>
/* Base navbar styles */
.navbar-wrapper {
  background: #ebe7e4;
  border-bottom: 2px solid rgba(188, 160, 103, 0.3);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

/* Logo styles */
.logo-container {
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.logo-container:hover {
  background: rgba(188, 160, 103, 0.1);
}

/* Desktop navigation styles */
.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-item {
  position: relative;
}

.nav-link {
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  color: #2c3e50;
  text-decoration: none;
  padding: 0.5rem;
  position: relative;
  transition: all 0.3s ease;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.link-underline {
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #bca067;
  transition: width 0.3s ease;
}

.nav-link:hover {
  color: #bca067;
}

.nav-link:hover .link-underline {
  width: 100%;
}

/* Mobile menu styles */
.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #ebe7e4;
  padding: 1.5rem;
  border-top: 1px solid rgba(188, 160, 103, 0.2);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.mobile-nav-link {
  display: block;
  padding: 0.75rem;
  color: #2c3e50;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 0.5rem;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  background: rgba(188, 160, 103, 0.1);
  color: #bca067;
}

/* Active link styles */
.router-link-active {
  color: #bca067;
  font-weight: 600;
}

.router-link-active .link-underline {
  width: 100%;
}

/* Button styles */
.mobile-menu-btn {
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
  background: rgba(188, 160, 103, 0.1);
}

/* Sign out button styles */
:deep(.sign-out-btn .p-button),
:deep(.sign-out-btn-mobile .p-button) {
  background: #bca067;
  border: none;
  padding: 0.8rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(188, 160, 103, 0.2);
  color: white;
  border-radius: 8px;
  width: 100%;
}

:deep(.sign-out-btn .p-button:hover),
:deep(.sign-out-btn-mobile .p-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(188, 160, 103, 0.3);
  background: #ab8f56;
}

:deep(.sign-out-btn .p-button:active),
:deep(.sign-out-btn-mobile .p-button:active) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(188, 160, 103, 0.2);
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .navbar-container {
    padding: 1rem 2rem;
  }

  .nav-links {
    gap: 3rem;
    margin: 0 2rem;
  }
}

@media (min-width: 1024px) {
  .navbar-container {
    padding: 1rem 4rem;
  }
}

/* Animation preferences */
@media (prefers-reduced-motion: no-preference) {
  .navbar-wrapper {
    transform-style: preserve-3d;
    perspective: 1000px;
  }

  .navbar-container {
    transform: translateZ(0);
    transition: transform 0.3s ease;
  }
}
</style>

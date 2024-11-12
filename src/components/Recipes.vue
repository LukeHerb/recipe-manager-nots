<template>
  <!-- Toast Notification Component -->
  <Toast />

  <!-- Hero Banner Section -->
  <HeroBanner @scroll-to-search="scrollToSearch" />

  <!-- Main Content -->
  <main class="flex flex-col m-auto justify-center content-center items-center p-8 md:py-12">
    <!-- Search Interface -->
    <div ref="searchBarRef" class="search-bar w-11/12 md:w-full mb-6">
      <SearchBar
          @search="handleSearch"
          class="w-full"
      />
    </div>

    <!-- Recipe Grid -->
    <ul class="grid gap-6 grid-cols-2 w-11/12 md:w-full">
      <RecipeCard
          v-for="recipe in filteredRecipes"
          :key="recipe.id ?? ''"
          :recipe="recipe"
      />
    </ul>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import type { Schema } from '../../amplify/data/resource'
import { generateClient } from 'aws-amplify/data'
import { useToast } from 'primevue/usetoast'
import { getCurrentUser } from 'aws-amplify/auth'
import { getUrl } from 'aws-amplify/storage'
import SearchBar from './search/SearchBar.vue'
import RecipeCard from './recipe/RecipeCard.vue'
import HeroBanner from './composables/HeroBanner.vue'
import Toast from 'primevue/toast'

// Initialize AWS client
const client = generateClient<Schema>()

// State Management
const currentUser = ref()
const searchBarRef = ref<HTMLElement | null>(null)
const searchCriteria = ref({
  title: '',
  courses: [],
  difficulties: [],
  minTime: null,
  maxTime: null,
  includedIngredients: [],
  excludedIngredients: []
})
const toast = useToast()

// Function to handle scrolling to search bar
const scrollToSearch = () => {
  if (searchBarRef.value) {
    searchBarRef.value.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}

// Type definition for extended recipe data
interface ExtendedRecipe {
  id: string
  createdBy: string
  name: string
  description: string
  course: string
  time: string
  numServings: string
  difficulty: string
  ingredients: string[] | null
  instructions: string[] | null
  owner: string
  imageFileNames: string[] | null
  imageLinks: string[]
  hasLoadedImages: boolean
  createdAt: string
  updatedAt: string
}

// Recipe state
const recipes = ref<ExtendedRecipe[]>([])

// Computed property for filtered recipes
const filteredRecipes = computed(() => {
  return recipes.value.filter(recipe => {
    // Apply all filters
    if (searchCriteria.value.title && !recipe.name.toLowerCase().includes(searchCriteria.value.title.toLowerCase())) {
      return false
    }
    if (searchCriteria.value.courses.length > 0 && !searchCriteria.value.courses.includes(recipe.course.toLowerCase())) {
      return false
    }
    if (searchCriteria.value.difficulties.length > 0 && !searchCriteria.value.difficulties.includes(recipe.difficulty.toLowerCase())) {
      return false
    }
    if (searchCriteria.value.minTime || searchCriteria.value.maxTime) {
      const recipeTime = getTimeInMinutes(recipe.time)
      const minTime = searchCriteria.value.minTime ? getTimeInMinutes(searchCriteria.value.minTime) : 0
      const maxTime = searchCriteria.value.maxTime ? getTimeInMinutes(searchCriteria.value.maxTime) : Infinity
      if (recipeTime < minTime || recipeTime > maxTime) {
        return false
      }
    }

    // Ingredient filters
    if (searchCriteria.value.includedIngredients.length > 0 && recipe.ingredients) {
      const hasAllIngredients = searchCriteria.value.includedIngredients.every(ingredient =>
          recipe.ingredients?.some(recipeIngredient =>
              recipeIngredient.toLowerCase().includes(ingredient.toLowerCase())
          )
      )
      if (!hasAllIngredients) return false
    }

    if (searchCriteria.value.excludedIngredients.length > 0 && recipe.ingredients) {
      const hasExcludedIngredients = searchCriteria.value.excludedIngredients.some(ingredient =>
          recipe.ingredients?.some(recipeIngredient =>
              recipeIngredient.toLowerCase().includes(ingredient.toLowerCase())
          )
      )
      if (hasExcludedIngredients) return false
    }

    return true
  })
})

// Search handler function
function handleSearch(criteria: any) {
  searchCriteria.value = {
    title: criteria.title || '',
    courses: criteria.courses.map((course: string) => course.toLowerCase()),
    difficulties: criteria.difficulties.map((difficulty: string) => difficulty.toLowerCase()),
    minTime: criteria.timeRange?.min || null,
    maxTime: criteria.timeRange?.max || null,
    includedIngredients: criteria.includedIngredients || [],
    excludedIngredients: criteria.excludedIngredients || []
  }
}

// Improved image loading function
async function getImages(recipe: ExtendedRecipe) {
  if (recipe.imageFileNames && recipe.imageFileNames.length > 0) {
    try {
      const imagePromises = recipe.imageFileNames.map(async (fileName) => {
        try {
          const getLink = await getUrl({
            path: `recipe-manager/images/${recipe.id}/${fileName}`,
            options: {
              bucket: 'recipe-manager-bucket',
              expiresIn: 3600, // Cache for 1 hour
            },
          })
          return getLink.url.toString()
        } catch (error) {
          console.error('Error getting image URL:', error)
          return null
        }
      })
      const resolvedLinks = await Promise.all(imagePromises)
      recipe.imageLinks = resolvedLinks.filter((link): link is string => link !== null)
      recipe.hasLoadedImages = recipe.imageLinks.length > 0
    } catch (error) {
      console.error('Error processing images:', error)
      recipe.hasLoadedImages = false
      recipe.imageLinks = []
    }
  }
}

// Recipe listing function with improved image loading
async function listRecipes() {
  client.models.Recipe.observeQuery().subscribe({
    next: async ({ items }) => {
      // First update recipes without images
      recipes.value = items.map((recipe) => ({
        id: recipe.id ?? '',
        createdBy: recipe.createdBy ?? '',
        name: recipe.name ?? '',
        description: recipe.description ?? '',
        course: recipe.course ?? '',
        time: recipe.time ?? '',
        numServings: recipe.numServings ?? '',
        difficulty: recipe.difficulty ?? '',
        ingredients: recipe.ingredients ?? null,
        instructions: recipe.instructions ?? null,
        owner: recipe.owner ?? '',
        imageFileNames: recipe.imageFileNames ?? null,
        imageLinks: [],
        hasLoadedImages: false,
        createdAt: recipe.createdAt ?? '',
        updatedAt: recipe.updatedAt ?? ''
      }))
      // Then load images in parallel
      await Promise.all(recipes.value.map(recipe => getImages(recipe)))
    },
  })
}

// Utility function for time conversion
function getTimeInMinutes(timeString: string): number {
  if (!timeString) return 0
  const hours = timeString.includes('hour') ? parseInt(timeString.split(' ')[0]) : 0
  const minutes = timeString.includes('minutes') ? parseInt(timeString.split(' ')[0]) : 0
  return (hours * 60) + minutes
}

// Component lifecycle hook
onMounted(async () => {
  currentUser.value = await getCurrentUser()
  listRecipes()
})
</script>

<style scoped>
/* Main container styling */
main {
  background-color: #ebe7e4;
  min-height: calc(100vh - 600px); /* Adjust for hero banner height */
  position: relative; /* Add this to ensure proper stacking context */
}

/* Stagger animation for search bar and recipe cards */
.search-bar {
  position: relative; /* Ensure proper positioning */
  visibility: hidden; /* Hide initially */
  animation: slideDown 0.8s ease-out forwards;
  animation-delay: 1s; /* Delay until after hero banner finishes */
  scroll-margin-top: 6rem; /* Add padding when scrolling to this element */
}

@keyframes slideDown {
  0% {
    visibility: visible;
    transform: translateY(-30px);
    opacity: 0;
  }
  100% {
    visibility: visible;
    transform: translateY(0);
    opacity: 1;
  }
}

/* Recipe grid animations */
.grid {
  display: grid;
  gap: 1.5rem;
}

/* Individual recipe card animations */
.grid > * {
  visibility: hidden;
  animation: fadeInUp 0.6s ease-out forwards;
}

/* Stagger the recipe card animations */
.grid > *:nth-child(1) { animation-delay: 1.2s; }
.grid > *:nth-child(2) { animation-delay: 1.3s; }
.grid > *:nth-child(3) { animation-delay: 1.4s; }
.grid > *:nth-child(4) { animation-delay: 1.5s; }
.grid > *:nth-child(5) { animation-delay: 1.6s; }
.grid > *:nth-child(6) { animation-delay: 1.7s; }

@keyframes fadeInUp {
  0% {
    visibility: visible;
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    visibility: visible;
    transform: translateY(0);
    opacity: 1;
  }
}

/* Hover animations for recipe cards */
.grid > * {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.grid > *:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 20px rgba(188, 160, 103, 0.2);
}

/* Loading animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Ensure proper spacing after hero banner */
.hero-banner + main {
  margin-top: -2rem;
}

/* Media Queries for responsive design */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr; /* Single column for mobile */
  }

  main {
    padding: 1rem;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr); /* Two columns for tablets */
  }
}

@media (min-width: 1025px) {
  .grid {
    grid-template-columns: repeat(2, 1fr); /* Two columns for desktop */
  }
}

/* Print styles */
@media print {
  .hero-banner {
    display: none;
  }

  main {
    padding: 0;
  }

  .grid {
    display: block;
  }
}

/* Accessibility - Reduce motion */
@media (prefers-reduced-motion: reduce) {
  .search-bar,
  .grid > *,
  .grid > *:hover {
    animation: none;
    transform: none;
    transition: none;
    visibility: visible;
    opacity: 1;
  }

  .search-bar {
    scroll-behavior: auto;
  }
}

/* Theme-specific variables */
:root {
  --gold-color: #bca067;
  --gold-hover: #ab8f56;
  --background-color: #ebe7e4;
}
</style>
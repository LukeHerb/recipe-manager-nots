<template>
  <main class="flex flex-col content-center items-center p-8 md:py-12">
    <!-- Toast Notification Component -->
    <Toast />

    <!-- Page Header Section -->
    <div class="w-11/12 md:w-full mb-8">
      <h1 class="font-playfair text-4xl md:text-5xl mb-2">My Recipe Collection</h1>
      <p class="font-montserrat text-gray-600 text-lg">Manage and organize your culinary creations</p>
    </div>

    <!-- Enhanced Loading State -->
    <div v-if="loading" class="w-full max-w-4xl">
      <div class="grid gap-6 grid-cols-1 md:grid-cols-2">
        <div
            v-for="n in 4"
            :key="n"
            class="recipe-skeleton"
            :style="{ animationDelay: `${(n - 1) * 0.15}s` }"
        >
          <!-- Image Skeleton -->
          <div class="relative h-[300px] rounded-xl overflow-hidden loading-shimmer">
            <div class="absolute inset-0 bg-gradient-skeleton"></div>
          </div>

          <!-- Content Skeleton -->
          <div class="space-y-4 mt-4 p-4">
            <!-- Course Category Skeleton -->
            <div class="h-6 bg-gray-200 rounded w-24 loading-shimmer"></div>

            <!-- Title Skeleton -->
            <div class="space-y-2">
              <div class="h-8 bg-gray-200 rounded-lg w-3/4 loading-shimmer"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2 loading-shimmer"></div>
            </div>

            <!-- Description Skeleton -->
            <div class="space-y-2">
              <div class="h-4 bg-gray-200 rounded w-full loading-shimmer"></div>
              <div class="h-4 bg-gray-200 rounded w-3/4 loading-shimmer"></div>
            </div>

            <!-- Metadata Skeleton -->
            <div class="flex justify-between items-center mt-6">
              <!-- Difficulty Dots -->
              <div class="flex gap-1">
                <div class="w-2 h-2 rounded-full bg-gray-200 loading-shimmer"></div>
                <div class="w-2 h-2 rounded-full bg-gray-200 loading-shimmer"></div>
                <div class="w-2 h-2 rounded-full bg-gray-200 loading-shimmer"></div>
              </div>
              <!-- Time -->
              <div class="h-4 bg-gray-200 rounded w-24 loading-shimmer"></div>
              <!-- Servings -->
              <div class="h-4 bg-gray-200 rounded w-20 loading-shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Sections -->
    <div v-else class="w-11/12 md:w-full space-y-8">
      <!-- Created Recipes Section -->
      <section>
        <div class="flex justify-between items-center mb-6">
          <h2 class="font-playfair text-2xl md:text-3xl">Recipes You've Created</h2>
          <router-link
              to="/addRecipe"
              class="bg-[#bca067] hover:bg-[#ab8f56] text-white font-montserrat px-6 py-2 rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
          >
            <i class="fa-solid fa-plus"></i>
            <span>Create New Recipe</span>
          </router-link>
        </div>

        <!-- No Created Recipes State -->
        <div
            v-if="createdRecipes.length === 0"
            class="bg-[#ebe7e4] rounded-xl p-8 text-center"
        >
          <i class="fa-solid fa-book-open text-4xl text-[#bca067] mb-4"></i>
          <h3 class="font-playfair text-xl mb-2">No Recipes Created Yet</h3>
          <p class="font-montserrat text-gray-600 mb-4">
            Start sharing your culinary creations with the community
          </p>
          <router-link
              to="/addRecipe"
              class="inline-block bg-[#bca067] hover:bg-[#ab8f56] text-white font-montserrat px-6 py-2 rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
          >
            Create Your First Recipe
          </router-link>
        </div>

        <!-- Created Recipes Grid -->
        <ul v-else class="grid gap-6 grid-cols-1 md:grid-cols-2">
          <RecipeCard
              v-for="recipe in createdRecipes"
              :key="recipe.id"
              :recipe="recipe"
          />
        </ul>

        <!-- Load More Created Recipes -->
        <div
            v-if="hasMoreCreatedRecipes"
            class="flex justify-center mt-8"
        >
          <button
              @click="loadMoreCreatedRecipes"
              class="border-2 border-[#bca067] text-[#bca067] hover:bg-[#bca067]/10 font-montserrat px-8 py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
              :disabled="loadingMore"
          >
            <i
                class="fa-solid fa-spinner fa-spin"
                :class="{ 'opacity-0': !loadingMore }"
            ></i>
            <span>{{ loadingMore ? 'Loading...' : 'Load More' }}</span>
          </button>
        </div>
      </section>

      <!-- Divider -->
      <div class="border-t-2 border-[#bca067]/20 my-8"></div>

      <!-- Saved Recipes Section -->
      <section>
        <h2 class="font-playfair text-2xl md:text-3xl mb-6">Saved Recipes</h2>

        <!-- No Saved Recipes State -->
        <div
            v-if="savedRecipes.length === 0"
            class="bg-[#ebe7e4] rounded-xl p-8 text-center"
        >
          <i class="fa-solid fa-bookmark text-4xl text-[#bca067] mb-4"></i>
          <h3 class="font-playfair text-xl mb-2">No Saved Recipes</h3>
          <p class="font-montserrat text-gray-600 mb-4">
            Browse recipes and save your favorites for quick access
          </p>
          <router-link
              to="/"
              class="inline-block bg-[#bca067] hover:bg-[#ab8f56] text-white font-montserrat px-6 py-2 rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
          >
            Browse Recipes
          </router-link>
        </div>

        <!-- Saved Recipes Grid -->
        <ul v-else class="grid gap-6 grid-cols-1 md:grid-cols-2">
          <RecipeCard
              v-for="recipe in savedRecipes"
              :key="recipe.id"
              :recipe="recipe"
          />
        </ul>

        <!-- Load More Saved Recipes -->
        <div
            v-if="hasMoreSavedRecipes"
            class="flex justify-center mt-8"
        >
          <button
              @click="loadMoreSavedRecipes"
              class="border-2 border-[#bca067] text-[#bca067] hover:bg-[#bca067]/10 font-montserrat px-8 py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
              :disabled="loadingMore"
          >
            <i
                class="fa-solid fa-spinner fa-spin"
                :class="{ 'opacity-0': !loadingMore }"
            ></i>
            <span>{{ loadingMore ? 'Loading...' : 'Load More' }}</span>
          </button>
        </div>
      </section>
    </div>
  </main>
</template>

//@ts-nocheck
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { generateClient } from 'aws-amplify/data'
import { getCurrentUser } from 'aws-amplify/auth'
import { getUrl } from 'aws-amplify/storage'
import type { Schema } from '../../amplify/data/resource'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import RecipeCard from '../components/recipe/RecipeCard.vue'

// Initialize utilities
const router = useRouter()
const client = generateClient<Schema>()
const toast = useToast()

// Type definitions
interface ExtendedRecipe {
  id: string
  createdBy: string
  name: string
  description: string
  course: string
  time: string
  numServings: string
  difficulty: string
  ingredients: string[]
  instructions: string[]
  owner: string
  imageFileNames: string[]
  imageLinks: string[]
  hasLoadedImages: boolean
  createdAt: string
  updatedAt: string
  averageRating: number
  numReviews: number
}

// Component state
const loading = ref(true)
const loadingMore = ref(false)
const currentUser = ref<{ username: string; signInDetails: { loginId: string } } | null>(null)
const createdRecipes = ref<ExtendedRecipe[]>([])
const savedRecipes = ref<ExtendedRecipe[]>([])
const hasMoreCreatedRecipes = ref(false)
const hasMoreSavedRecipes = ref(false)
const nextTokenCreated = ref<string | null>(null)
const nextTokenSaved = ref<string | null>(null)
const ITEMS_PER_PAGE = 10

// Load recipe images
async function getImages(recipe: ExtendedRecipe) {
  if (recipe.imageFileNames && recipe.imageFileNames.length > 0) {
    try {
      const imagePromises = recipe.imageFileNames.map(async (fileName) => {
        try {
          const getLink = await getUrl({
            path: `recipe-manager/images/${recipe.id}/${fileName}`,
            options: {
              bucket: 'recipe-manager-bucket',
              expiresIn: 3600,
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
  } else {
    recipe.imageLinks = []
    recipe.hasLoadedImages = false
  }
}

// Fetch user's created recipes
async function fetchCreatedRecipes(nextToken: string | null = null) {
  try {
    const response = await client.models.Recipe.list({
      filter: { owner: { eq: currentUser.value?.username } },
      limit: ITEMS_PER_PAGE,
      nextToken: nextToken,
    })

    if (response.data) {
      // Process recipe data
      const recipes = await Promise.all(
          response.data.map(async (recipe) => {
            const processedRecipe: ExtendedRecipe = {
              ...recipe,
              imageLinks: [],           // Initialize with empty array
              hasLoadedImages: false,   // Initialize as false
              averageRating: recipe.averageRating || 0,
              numReviews: recipe.numReviews || 0
            }
            await getImages(processedRecipe)
            return processedRecipe
          })
      )

      // Update state
      if (nextToken) {
        createdRecipes.value = [...createdRecipes.value, ...recipes]
      } else {
        createdRecipes.value = recipes
      }

      // Update pagination state
      nextTokenCreated.value = response.nextToken
      hasMoreCreatedRecipes.value = !!response.nextToken
    }
  } catch (error) {
    console.error('Error fetching created recipes:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load your recipes',
      life: 3000,
    })
  }
}

// Load more created recipes
async function loadMoreCreatedRecipes() {
  if (loadingMore.value || !nextTokenCreated.value) return

  loadingMore.value = true
  try {
    await fetchCreatedRecipes(nextTokenCreated.value)
  } finally {
    loadingMore.value = false
  }
}

// Fetch user's saved recipes
// Note: This is a placeholder for future implementation
// The backend schema would need to be updated to support saved recipes
async function fetchSavedRecipes(nextToken: string | null = null) {
  // This would be implemented when the backend supports saved recipes
  // For now, we'll keep an empty array
  savedRecipes.value = []
  hasMoreSavedRecipes.value = false
  nextTokenSaved.value = null
}

// Load more saved recipes
async function loadMoreSavedRecipes() {
  if (loadingMore.value || !nextTokenSaved.value) return

  loadingMore.value = true
  try {
    await fetchSavedRecipes(nextTokenSaved.value)
  } finally {
    loadingMore.value = false
  }
}

// Initial data load
async function initializeData() {
  try {
    const authUser = await getCurrentUser()
    currentUser.value = {
      username: authUser.username,
      signInDetails: {
        loginId: authUser.signInDetails.loginId,
      },
    }
    await Promise.all([
      fetchCreatedRecipes(),
      fetchSavedRecipes(),
    ])
  } catch (error) {
    console.error('Error initializing data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load your recipes',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  initializeData()
})
</script>

<style scoped>
/* Container Layout Styles */
main {
  min-height: calc(100vh - 64px);
  background-color: #fff;
  padding-top: 1rem;
}

/* Typography Styles */
.font-playfair {
  font-family: 'Playfair Display', serif;
}

.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}

/* Enhanced Loading Animation Styles */
.recipe-skeleton {
  @apply bg-white rounded-xl p-4 shadow-sm border-2 border-gray-100;
  animation: fadeIn 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(10px);
  will-change: transform, opacity;
}

/* Shimmer Effect Base */
.loading-shimmer {
  position: relative;
  overflow: hidden;
  background: #f3f4f6;
  border-radius: 0.375rem;
}

.loading-shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0,
      rgba(255, 255, 255, 0.2) 20%,
      rgba(255, 255, 255, 0.5) 60%,
      rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
  will-change: transform;
}

/* Gradient Background for Image Skeleton */
.bg-gradient-skeleton {
  background: linear-gradient(
      110deg,
      #ebe7e4 30%,
      #f3f4f6 50%,
      #ebe7e4 70%
  );
  background-size: 200% 100%;
  animation: gradientMove 1.5s ease-in-out infinite;
  will-change: background-position;
}

/* Grid Layout */
.grid {
  display: grid;
  gap: 1.5rem;
}

/* Grid items animation */
.grid > * {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.grid > *:hover {
  transform: translateY(-4px);
}

/* Button Styles */
button,
.router-link-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

/* Empty State Styles */
.empty-state {
  position: relative;
  overflow: hidden;
  background-color: #ebe7e4;
  transition: transform 0.3s ease;
}

.empty-state:hover {
  transform: translateY(-4px);
}

.empty-state::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(188, 160, 103, 0.1) 0%, transparent 100%);
  pointer-events: none;
}

/* Divider Animation */
.border-t-2 {
  position: relative;
  overflow: hidden;
}

.border-t-2::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(
      90deg,
      rgba(188, 160, 103, 0) 0%,
      rgba(188, 160, 103, 0.2) 50%,
      rgba(188, 160, 103, 0) 100%
  );
  animation: dividerShine 2s infinite;
  will-change: transform;
}

/* Loading Spinner Animation */
.fa-spinner {
  transition: opacity 0.3s ease;
}

/* Keyframe Animations */
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

@keyframes gradientMove {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes dividerShine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Toast Customization */
:deep(.p-toast) {
  font-family: 'Montserrat', sans-serif;
}

:deep(.p-toast-message) {
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

:deep(.p-toast-icon-close) {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

:deep(.p-toast-icon-close:hover) {
  opacity: 1;
}

/* Button Colors */
.btn-primary {
  @apply bg-[#bca067] text-white;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  @apply bg-[#ab8f56];
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(188, 160, 103, 0.3);
}

.btn-secondary {
  @apply border-2 border-[#bca067] text-[#bca067];
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  @apply bg-[#bca067]/10;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(188, 160, 103, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }

  main {
    padding: 1rem;
  }

  .recipe-skeleton {
    padding: 0.75rem;
  }

  h1 {
    font-size: 2rem;
  }

  h2 {
    font-size: 1.5rem;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Print Styles */
@media print {
  .no-print {
    display: none;
  }

  main {
    padding: 0;
  }

  .grid {
    display: block;
  }

  .recipe-skeleton,
  .loading-shimmer::after,
  .bg-gradient-skeleton,
  .border-t-2::after {
    animation: none;
  }

  button {
    display: none;
  }
}

/* Accessibility - Reduce Motion */
@media (prefers-reduced-motion: reduce) {
  .recipe-skeleton,
  .loading-shimmer::after,
  .bg-gradient-skeleton,
  .border-t-2::after,
  .grid > *,
  button,
  .router-link-active {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }

  .recipe-skeleton {
    opacity: 1;
  }

  button:hover,
  .router-link-active:hover,
  .empty-state:hover {
    transform: none !important;
  }
}

/* Focus States */
button:focus-visible,
a:focus-visible {
  outline: 2px solid #bca067;
  outline-offset: 2px;
  border-radius: 0.375rem;
}

/* Theme-specific variables */
:root {
  --gold-primary: #bca067;
  --gold-secondary: #ab8f56;
  --gold-light: rgba(188, 160, 103, 0.1);
  --background-primary: #ebe7e4;
  --text-primary: #2c3e50;
  --skeleton-background: #f3f4f6;
}
</style>
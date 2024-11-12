<template>
  <main
    class="flex flex-col m-auto justify-center content-center items-center p-8 md:py-12"
  >
    <Toast />
    <!-- Loading State -->
    <div v-if="loading" class="w-full max-w-4xl">
      <div class="animate-pulse space-y-8">
        <div class="h-96 bg-gray-200 rounded-xl"></div>
        <div class="space-y-4">
          <div class="h-8 bg-gray-200 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Recipe Not Found State -->
    <div v-else-if="!recipe" class="text-center">
      <h2 class="text-2xl font-semibold mb-4">Recipe not found</h2>
      <Button label="Back to Recipes" @click="router.push('/')" />
    </div>

    <!-- Recipe Content -->
    <div v-else class="w-full max-w-4xl">
      <!-- Recipe Card -->
      <div
        class="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-[#bca067]/20"
      >
        <!-- Image Section with Options Menu -->
        <div class="relative h-[500px] w-full">
          <!-- Loading State for Image -->
          <div
            v-if="!recipe.hasLoadedImages"
            class="w-full h-full bg-gray-200 animate-pulse"
          ></div>

          <!-- Recipe Image -->
          <img
            v-else-if="recipe.imageLinks && recipe.imageLinks[0]"
            :src="recipe.imageLinks[0]"
            :alt="recipe.name"
            class="w-full h-full object-cover"
          />

          <!-- Edit Button Component -->
          <EditButton
            v-if="isCreator"
            :recipe-id="recipe.id"
            :recipe-name="recipe.name"
            @deleted="handleRecipeDeleted"
            :images="recipe.imageFileNames"
          />
        </div>

        <!-- Recipe Content -->
        <div class="p-8">
          <!-- Header Section -->
          <div class="mb-8">
            <h1 class="text-4xl font-playfair mb-4">{{ recipe.name }}</h1>
            <p class="text-gray-600 mb-4">{{ recipe.description }}</p>
            <div class="flex items-center text-sm text-gray-500">
              <span>Created by {{ recipe.createdBy }}</span>
              <span class="mx-2">•</span>
              <span>{{ formatDate(recipe.createdAt) }}</span>
            </div>
          </div>

          <!-- Recipe Metadata -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="flex flex-col items-center p-4 bg-[#ebe7e4] rounded-lg">
              <i class="fa-solid fa-clock text-[#bca067] mb-2"></i>
              <span class="text-sm font-medium">{{ recipe.time }}</span>
            </div>
            <div class="flex flex-col items-center p-4 bg-[#ebe7e4] rounded-lg">
              <i class="fa-solid fa-utensils text-[#bca067] mb-2"></i>
              <span class="text-sm font-medium">{{ recipe.numServings }}</span>
            </div>
            <div class="flex flex-col items-center p-4 bg-[#ebe7e4] rounded-lg">
              <i class="fa-solid fa-chart-line text-[#bca067] mb-2"></i>
              <span class="text-sm font-medium">{{ recipe.difficulty }}</span>
            </div>
            <div class="flex flex-col items-center p-4 bg-[#ebe7e4] rounded-lg">
              <i class="fa-solid fa-tag text-[#bca067] mb-2"></i>
              <span class="text-sm font-medium">{{ recipe.course }}</span>
            </div>
          </div>

          <!-- Ingredients Section -->
          <div class="mb-8">
            <h2 class="text-2xl font-playfair mb-4">Ingredients</h2>
            <ul class="list-disc list-inside space-y-2">
              <li
                v-for="ingredient in recipe.ingredients"
                :key="ingredient"
                class="text-gray-700"
              >
                {{ ingredient }}
              </li>
            </ul>
          </div>

          <!-- Instructions Section -->
          <div class="mb-8">
            <h2 class="text-2xl font-playfair mb-4">Instructions</h2>
            <ol class="list-decimal list-inside space-y-4">
              <li
                v-for="(instruction, index) in recipe.instructions"
                :key="index"
                class="text-gray-700 pl-2"
              >
                {{ instruction }}
              </li>
            </ol>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div v-if="!isCreator" class="mt-8">
        <RecipeReview
          :recipe="{ data: recipe, reviews: recipe.reviews || [] }"
          :current-user="currentUser"
        />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { generateClient } from 'aws-amplify/data'
import { getCurrentUser } from 'aws-amplify/auth'
import { getUrl } from 'aws-amplify/storage'
import type { Schema } from '../../amplify/data/resource'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import RecipeReview from '../components/recipe/RecipeReview.vue'
import EditButton from '../components/button/EditButton.vue'

// Type definitions
interface Review {
  id: string
  createdBy: string
  reviewStars: number
  reviewText: string
  recipeId: string
  owner: string
  createdAt: string
  updatedAt: string
}

interface Recipe {
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
  imageLinks?: string[]
  hasLoadedImages?: boolean
  createdAt: string
  updatedAt: string
  reviews?: Review[]
}

interface CurrentUser {
  username: string
  signInDetails: {
    loginId: string
  }
}

// State Management
const loading = ref(true)
const currentUser = ref<CurrentUser>()
const recipe = ref<Recipe>()

// Router and client setup
const router = useRouter()
const route = useRoute()
const client = generateClient<Schema>()
const toast = useToast()

// Computed Properties
const isCreator = computed(() => {
  return currentUser.value?.username === recipe.value?.owner
})

// Load recipe images
async function getImages(recipeData: Recipe) {
  if (recipeData.imageFileNames && recipeData.imageFileNames.length > 0) {
    try {
      const imagePromises = recipeData.imageFileNames.map(async (fileName) => {
        try {
          const getLink = await getUrl({
            path: `recipe-manager/images/${recipeData.id}/${fileName}`,
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
      recipeData.imageLinks = resolvedLinks.filter(
        (link): link is string => link !== null
      )
      recipeData.hasLoadedImages = recipeData.imageLinks.length > 0
    } catch (error) {
      console.error('Error processing images:', error)
      recipeData.hasLoadedImages = false
      recipeData.imageLinks = []
    }
  }
}

// Fetch recipe data
async function fetchRecipe() {
  try {
    const response = await client.models.Recipe.get({
      id: route.params.id as string,
    })
    if (response.data) {
      // Create a new Recipe object with the response data
      const recipeData: Recipe = {
        id: response.data.id,
        createdBy: response.data.createdBy,
        name: response.data.name,
        description: response.data.description,
        course: response.data.course,
        time: response.data.time,
        numServings: response.data.numServings,
        difficulty: response.data.difficulty,
        ingredients: response.data.ingredients,
        instructions: response.data.instructions,
        owner: response.data.owner,
        imageFileNames: response.data.imageFileNames,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
        reviews: [],
      }

      // Fetch reviews if they exist
      try {
        const reviewsResponse = await client.models.Review.list({
          filter: { recipeId: { eq: response.data.id } },
        })
        if (reviewsResponse.data) {
          recipeData.reviews = reviewsResponse.data as Review[]
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      }

      recipe.value = recipeData
      await getImages(recipe.value)
    }
  } catch (error) {
    console.error('Error fetching recipe:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load recipe',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

// Handle recipe deletion from EditButton
function handleRecipeDeleted() {
  router.push('/')
}

// Format date helper
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Component lifecycle
onMounted(async () => {
  const authUser = await getCurrentUser()
  // Parse the AuthUser into our CurrentUser format
  currentUser.value = {
    username: authUser.username,
    signInDetails: {
      loginId: authUser.signInDetails.loginId,
    },
  }
  await fetchRecipe()
})
</script>

<style scoped>
/* Loading animation */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Font styling */
.font-playfair {
  font-family: 'Playfair Display', serif;
}
</style>

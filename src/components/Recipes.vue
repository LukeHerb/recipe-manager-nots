<template>
  <Toast />
  <main class="flex flex-col m-auto justify-center content-center items-center p-8 md:py-12">
    <!-- Search Interface -->
    <SearchBar
        @search="handleSearch"
        class="w-11/12 md:w-full mb-6"
    />

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

// Initialize AWS client
const client = generateClient<Schema>()

// State Management
const currentUser = ref()
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
  ingredients: string[]
  instructions: string[]
  owner: string
  imageFileNames: string[]
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
    if (searchCriteria.value.includedIngredients.length > 0) {
      const hasAllIngredients = searchCriteria.value.includedIngredients.every(ingredient =>
          recipe.ingredients.some(recipeIngredient =>
              recipeIngredient.toLowerCase().includes(ingredient.toLowerCase())
          )
      )
      if (!hasAllIngredients) return false
    }

    if (searchCriteria.value.excludedIngredients.length > 0) {
      const hasExcludedIngredients = searchCriteria.value.excludedIngredients.some(ingredient =>
          recipe.ingredients.some(recipeIngredient =>
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
        ingredients: recipe.ingredients ?? [],
        instructions: recipe.instructions ?? [],
        owner: recipe.owner ?? '',
        imageFileNames: recipe.imageFileNames ?? [],
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
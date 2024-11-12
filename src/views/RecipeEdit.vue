<template>
  <div class="wrapper">
    <Toast />
    <main
      class="flex flex-col m-auto justify-center content-center items-center p-8"
    >
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

      <!-- Recipe Edit Form -->
      <div v-else class="grid gap-6 grid-cols-1 w-6/12">
        <RecipeForm
          v-if="!loading"
          :initialRecipe="recipe"
          :isEditMode="true"
          :courses="courses"
          :difficulties="difficulties"
          :times="times"
          :servings="servings"
          @save="saveRecipe"
          @cancel="cancelEdit"
          :recipeID="recipe.id"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import FloatLabel from 'primevue/floatlabel'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { generateClient } from 'aws-amplify/data'
import { getCurrentUser } from 'aws-amplify/auth'
import { uploadData, getUrl } from 'aws-amplify/storage'
import type { Schema } from '../../amplify/data/resource'
import RecipeForm from '../components/recipe/RecipeForm.vue'

// Initialize route, router, and utilities
const route = useRoute()
const router = useRouter()
const toast = useToast()
const client = generateClient<Schema>()

// Component state
const loading = ref(true)
const saving = ref(false)
const currentUser = ref()
const inputIngredient = ref('')
const inputInstruction = ref('')
const currIndex = ref(1)
const isEditMode = ref(route.params.id !== undefined)

// Recipe interface
interface Recipe {
  id: string
  name: string
  course: string
  time: string
  numServings: string
  difficulty: string
  description: string
  ingredients: string[]
  instructions: string[]
  imageFileNames: string[]
  imageLinks?: string[]
  hasLoadedImages?: boolean
  createdBy: string
  owner: string
  createdAt: string
  updatedAt: string
}

// Initialize recipe state
const recipe = ref<Recipe>({
  id: '',
  name: '',
  course: '',
  time: '',
  numServings: '',
  difficulty: '',
  description: '',
  ingredients: [],
  instructions: [],
  imageFileNames: [],
  imageLinks: [],
  hasLoadedImages: false,
  createdBy: '',
  owner: '',
  createdAt: '',
  updatedAt: '',
})

// Form options
const times = [
  '15 minutes',
  '30 minutes',
  '45 minutes',
  '1 hour',
  '1 hour 30 minutes',
  '2 hours',
  '2 hours 30 minutes',
  '3 hours',
  '4 hours',
  '5 hours',
  '6 hours',
  '7 hours',
  '8 hours',
]

const servings = [
  '1 serving',
  '2 servings',
  '3 servings',
  '4 servings',
  '5 servings',
  '6 servings',
  '7 servings',
  '8 servings',
  '9 servings',
  '10 servings',
  '10+ servings',
]

const courses = [
  'Appetizer',
  'Entree',
  'Dessert',
  'Side Dish',
  'Drink',
  'Other',
]

const difficulties = ['Easy', 'Medium', 'Hard']

// Image handling functions
async function loadImages(recipeData: Recipe) {
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

async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]

    try {
      const result = await uploadData({
        path: `recipe-manager/images/${recipe.value.id}/${file.name}`,
        data: file,
        options: {
          bucket: 'recipe-manager-bucket',
        },
      }).result

      // Add new image to recipe
      recipe.value.imageFileNames = [file.name]
      await loadImages(recipe.value)

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Image uploaded successfully',
        life: 3000,
      })
    } catch (error) {
      console.error('Upload failed:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to upload image',
        life: 3000,
      })
    }
  }
}

// Recipe management functions
async function fetchRecipe() {
  try {
    const response = await client.models.Recipe.get({
      id: route.params.id as string,
    })
    if (response.data) {
      recipe.value = response.data as Recipe
      await loadImages(recipe.value)
      currIndex.value = recipe.value.instructions.length + 1
    }
  } catch (error) {
    console.error('Error fetching recipe:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load recipe',
      life: 3000,
    })
    router.push('/')
  } finally {
    loading.value = false
  }
}

// async function saveRecipe() {
//   if (!validateRecipe()) {
//     return
//   }

//   saving.value = true
//   try {
//     await client.models.Recipe.update({
//       id: recipe.value.id,
//       name: recipe.value.name,
//       description: recipe.value.description,
//       time: recipe.value.time,
//       course: recipe.value.course,
//       numServings: recipe.value.numServings,
//       difficulty: recipe.value.difficulty,
//       ingredients: recipe.value.ingredients,
//       instructions: recipe.value.instructions,
//       imageFileNames: recipe.value.imageFileNames,
//       owner: recipe.value.owner,
//       createdBy: recipe.value.createdBy,
//     })

//     toast.add({
//       severity: 'success',
//       summary: 'Success',
//       detail: 'Recipe updated successfully',
//       life: 3000,
//     })
//     router.push(`/recipe/${recipe.value.id}`)
//   } catch (error) {
//     console.error('Error updating recipe:', error)
//     toast.add({
//       severity: 'error',
//       summary: 'Error',
//       detail: 'Failed to update recipe',
//       life: 3000,
//     })
//   } finally {
//     saving.value = false
//   }
// }

async function saveRecipe(newRecipe: Recipe) {
  if (!validateRecipe()) {
    return
  }

  saving.value = true
  try {
    await client.models.Recipe.update({
      id: newRecipe.id,
      name: newRecipe.name,
      description: newRecipe.description,
      time: newRecipe.time,
      course: newRecipe.course,
      numServings: newRecipe.numServings,
      difficulty: newRecipe.difficulty,
      ingredients: newRecipe.ingredients,
      instructions: newRecipe.instructions,
      imageFileNames: newRecipe.imageFileNames,
      owner: newRecipe.owner,
      createdBy: newRecipe.createdBy,
    })

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Recipe updated successfully',
      life: 3000,
    })
    router.push(`/recipe/${recipe.value.id}`)
  } catch (error) {
    console.error('Error updating recipe:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update recipe',
      life: 3000,
    })
  } finally {
    saving.value = false
  }
}

function validateRecipe(): boolean {
  if (!recipe.value.name.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Missing Information',
      detail: 'Please enter a recipe name',
      life: 3000,
    })
    return false
  }

  if (!recipe.value.ingredients.length) {
    toast.add({
      severity: 'warn',
      summary: 'Missing Information',
      detail: 'Please add at least one ingredient',
      life: 3000,
    })
    return false
  }

  if (!recipe.value.instructions.length) {
    toast.add({
      severity: 'warn',
      summary: 'Missing Information',
      detail: 'Please add at least one instruction',
      life: 3000,
    })
    return false
  }

  return true
}

function cancelEdit() {
  router.push(`/recipe/${recipe.value.id}`)
}

// Lifecycle hooks
onMounted(async () => {
  currentUser.value = await getCurrentUser()
  await fetchRecipe()
})
</script>

<style scoped>
/* Container styling */
.wrapper {
  background-image: url('../assets/create-recipe.jpg');
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  padding: 20px;
}

/* List styling */
.list-small-disc {
  list-style-type: disc;
  font-size: 0.5rem;
}

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

/* PrimeVue component customization */
:deep(.p-inputtext) {
  font-family: 'Montserrat', sans-serif;
  border-color: rgba(188, 160, 103, 0.3);
  transition: all 0.2s ease;
}

:deep(.p-inputtext:hover) {
  border-color: #bca067;
}

:deep(.p-inputtext:focus) {
  border-color: #bca067 !important;
  box-shadow: 0 0 0 2px rgba(188, 160, 103, 0.2) !important;
}

:deep(.p-float-label input:focus ~ label),
:deep(.p-float-label textarea:focus ~ label) {
  color: #bca067 !important;
}

/* Select component styling */
:deep(.p-dropdown) {
  width: 100%;
  border-color: rgba(188, 160, 103, 0.3);
}

:deep(.p-dropdown:not(.p-disabled).p-focus) {
  border-color: #bca067;
  box-shadow: 0 0 0 1px #bca067;
}

:deep(.p-dropdown-panel) {
  border-color: #bca067;
}

:deep(.p-dropdown-item.p-highlight) {
  background-color: rgba(188, 160, 103, 0.1) !important;
  color: #bca067 !important;
}

/* Textarea styling */
:deep(.p-textarea) {
  width: 100%;
  font-family: 'Montserrat', sans-serif;
}

/* Button styling */
:deep(.p-button) {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.2s ease;
}

:deep(.p-button-primary) {
  background-color: #bca067;
  border-color: #bca067;
  color: white;
}

:deep(.p-button-primary:hover) {
  background-color: #ab8f56 !important;
  border-color: #ab8f56 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(188, 160, 103, 0.3);
}

:deep(.p-button-outlined) {
  color: #bca067;
  border-color: #bca067;
  background-color: transparent;
}

:deep(.p-button-outlined:hover) {
  background-color: rgba(188, 160, 103, 0.1) !important;
  border-color: #ab8f56 !important;
  color: #ab8f56 !important;
  transform: translateY(-2px);
}

:deep(.p-button:active) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(188, 160, 103, 0.2);
}

/* Image upload styling */
input[type='file'] {
  opacity: 0;
  position: absolute;
  z-index: -1;
}

.image-upload-label {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: white;
  color: #bca067;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-upload-label:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Ingredient and instruction items styling */
.list-inside span {
  transition: all 0.2s ease;
}

.list-inside span:hover {
  color: #dc3545;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .grid {
    width: 80%;
  }
}

@media (max-width: 768px) {
  .grid {
    width: 90%;
  }

  .flex.w-full {
    flex-direction: column;
  }

  .flex.w-full > div {
    width: 100%;
    border-right: none;
    padding-right: 0;
  }

  .flex.w-full > div:first-child {
    border-bottom: 2px dashed rgba(188, 160, 103, 0.3);
    padding-bottom: 2rem;
    margin-bottom: 2rem;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Theme color variables */
:root {
  --gold-color: #bca067;
  --gold-hover: #ab8f56;
  --gold-light: rgba(188, 160, 103, 0.1);
  --background-color: #ebe7e4;
}

/* Toast customization */
:deep(.p-toast) {
  font-family: 'Montserrat', sans-serif;
}

:deep(.p-toast-message) {
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

:deep(.p-toast-icon-close) {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

:deep(.p-toast-icon-close:hover) {
  opacity: 1;
}
</style>

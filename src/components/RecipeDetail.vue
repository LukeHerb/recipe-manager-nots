<template>
  <div v-if="recipe && currentUser" class="recipe-details">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Container for recipe details, centered and padded -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="relative">
          <!-- Recipe image container with fallback for loading and error states -->
          <div class="h-96 w-full bg-gray-200 overflow-hidden">
            <div v-if="isImageLoading" class="w-full h-full bg-gray-200 animate-pulse"></div>
            <!-- Displays the image or a placeholder icon if no image is available -->
            <div v-else class="w-full h-full">
              <img
                  v-if="recipe.data.imageLinks && recipe.data.imageLinks.length > 0"
                  :src="recipe.data.imageLinks[0]"
                  :alt="recipe.data.name"
                  class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  @load="handleImageLoad"
                  @error="handleImageError"
                  loading="lazy"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
                <i class="fa-solid fa-image text-gray-400 text-4xl"></i>
              </div>
            </div>
          </div>
          <!-- Recipe title, author, time, and servings displayed at the bottom of the image -->
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
            <div class="flex justify-between items-start">
              <h1 class="text-4xl font-bold text-white mb-4">{{ recipe.data.name }}</h1>
              <button
                  v-if="showEditDelete"
                  class="p-2 text-white hover:bg-black/20 rounded-full transition-colors"
                  @click="menu?.toggle"
              >
                <i class="fa-solid fa-ellipsis-vertical"></i>
              </button>
            </div>
            <div class="flex items-center gap-6 text-white">
              <p class="flex items-center gap-2">
                <i class="fa-solid fa-user text-gold"></i>
                {{ recipe.data.createdBy }}
              </p>
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-clock text-gold"></i>
                {{ recipe.data.time }}
              </div>
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-utensils text-gold"></i>
                {{ recipe.data.numServings }} servings
              </div>
            </div>
          </div>
        </div>
        <!-- Recipe details: difficulty, description, ingredients, and instructions -->
        <div class="p-8">
          <!-- Difficulty level represented by colored dots -->
          <div class="flex items-center gap-4 mb-6">
            <span class="text-lg font-semibold">Difficulty:</span>
            <div class="flex gap-2">
              <span
                  v-for="(dot, index) in getDifficultyDots(recipe.data.difficulty)"
                  :key="index"
                  :class="dotClass(dot)"
                  class="dot"
              ></span>
            </div>
          </div>
          <!-- Description section -->
          <div class="mb-8">
            <h2 class="text-2xl font-semibold mb-4 text-gold">Description</h2>
            <p class="text-gray-700 leading-relaxed">{{ recipe.data.description }}</p>
          </div>
          <!-- Ingredients list -->
          <div class="mb-8">
            <h2 class="text-2xl font-semibold mb-4 text-gold">Ingredients</h2>
            <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <li
                  v-for="(ingredient, index) in recipe.data.ingredients"
                  :key="index"
                  class="flex items-center gap-2 text-gray-700"
              >
                <i class="fa-solid fa-circle-check text-gold text-sm"></i>
                {{ ingredient }}
              </li>
            </ul>
          </div>
          <!-- Step-by-step instructions list -->
          <div class="mb-8">
            <h2 class="text-2xl font-semibold mb-4 text-gold">Instructions</h2>
            <ol class="space-y-4">
              <li
                  v-for="(instruction, index) in recipe.data.instructions"
                  :key="index"
                  class="flex gap-4 text-gray-700"
              >
                <span class="flex-shrink-0 w-8 h-8 rounded-full bg-gold text-white flex items-center justify-center font-semibold">
                  {{ index + 1 }}
                </span>
                <p class="pt-1">{{ instruction }}</p>
              </li>
            </ol>
          </div>
          <!-- Component for displaying and handling recipe reviews -->
          <RecipeReview
              v-if="recipe"
              :recipe="recipe"
              :currentUser="currentUser"
          />
        </div>
      </div>
    </main>
    <!-- Overlay menu for edit/delete options -->
    <Menu ref="menu" :model="items" id="overlaymenu" v-if="showEditDelete" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from '@aws-amplify/storage';
import type { Schema } from '../../amplify/data/resource';
import Menu from 'primevue/menu';
import RecipeReview from './recipe/RecipeReview.vue';

interface Review {
  id: string;
  reviewStars: number;
  reviewText: string;
  recipeId: string;
  createdBy: string;
  owner: string;
}

interface RecipeData {
  id: string;
  createdBy: string;
  name: string;
  description: string;
  course: string;
  time: string;
  numServings: string;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
  owner: string;
  imageFileNames: string[];
  imageLinks: string[];
  hasLoadedImages: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RecipeWithReviews {
  data: RecipeData;
  reviews?: Review[];
}

// State variables and references
const currentUser = ref<any>(null);
const client = generateClient<Schema>();
const route = useRoute();
const router = useRouter();
const recipe = ref<RecipeWithReviews | null>(null);
const menu = ref();
const isImageLoading = ref(true);

// Computed property to determine if the edit/delete menu should be shown
const showEditDelete = computed(() => {
  return currentUser.value?.signInDetails?.loginId === recipe.value?.data?.createdBy;
});

// Menu items for edit and delete actions
const items = ref([
  {
    label: 'Edit',
    icon: 'fa-solid fa-edit',
    command: () => handleEdit(),
  },
  {
    label: 'Delete',
    icon: 'fa-solid fa-trash',
    command: () => handleDelete(),
  },
]);

// Function to handle image loading errors
const handleImageError = (event: Event) => {
  console.error('Image failed to load:', event);
  isImageLoading.value = false;
  if (event.target instanceof HTMLImageElement) {
    event.target.src = '/images/recipe-placeholder.jpg';
  }
};

// Function to mark image as loaded
const handleImageLoad = () => {
  isImageLoading.value = false;
};

// Fetches recipe data and current user info upon component mount
onMounted(async () => {
  try {
    const recipeId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
    const recipeResult = await client.models.Recipe.get({ id: recipeId });
    currentUser.value = await getCurrentUser();

    // Initialize recipe data and load images
    const recipeData: RecipeData = {
      ...recipeResult.data,
      imageLinks: [],
      hasLoadedImages: false,
    };
    recipe.value = { data: recipeData };

    if (recipe.value.data.imageFileNames?.length > 0) {
      const imagePromises = recipe.value.data.imageFileNames.map(async (fileName: string) => {
        try {
          const fullPath = `recipe-manager/${fileName}`;
          const urlResult = await getUrl({
            key: fullPath,
            options: { accessLevel: 'protected', validateObjectExistence: true }
          });
          return urlResult.url.toString();
        } catch (error) {
          console.error('Error fetching image URL:', error);
          return null;
        }
      });

      const urls = await Promise.all(imagePromises);
      recipe.value.data.imageLinks = urls.filter((url): url is string => url !== null);
      recipe.value.data.hasLoadedImages = true;
      isImageLoading.value = false;
    } else {
      isImageLoading.value = false;
    }

    try {
      const reviewList = await client.models.Review.list({
        filter: { recipeId: { eq: recipeId } },
      });
      recipe.value.reviews = reviewList.data;
    } catch (error) {
      console.error('Error loading reviews:', error);
      recipe.value.reviews = [];
    }
  } catch (error) {
    console.error('Error loading recipe:', error);
    isImageLoading.value = false;
  }
});

// Navigates to the edit recipe page
const handleEdit = () => {
  router.push(`/recipe/edit/${recipe.value?.data?.id}`);
};

// Deletes the recipe and navigates back to the recipe list page
const handleDelete = async () => {
  if (confirm('Are you sure you want to delete this recipe?')) {
    try {
      await client.models.Recipe.delete({
        id: recipe.value?.data?.id,
      });
      router.push('/recipes');
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  }
};

// Maps difficulty levels to dot representations
function getDifficultyDots(difficulty: string): number[] {
  switch (difficulty) {
    case 'Easy': return [1, 0, 0];
    case 'Medium': return [2, 2, 0];
    case 'Hard': return [3, 3, 3];
    default: return [0, 0, 0];
  }
}

// Maps dot numbers to specific colors
function dotClass(dot: number): string {
  switch (dot) {
    case 1: return 'bg-green-500';
    case 2: return 'bg-orange-400';
    case 3: return 'bg-red-600';
    default: return 'bg-gray-300';
  }
}
</script>

<style scoped>
.text-gold {
  color: #bca067;
}

.bg-gold {
  background-color: #bca067;
}

.dot {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  display: inline-block;
}

.recipe-details {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.recipe-details img {
  transition: transform 0.3s ease-in-out;
}

.recipe-details img:hover {
  transform: scale(1.05);
}

.shadow-xl {
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>

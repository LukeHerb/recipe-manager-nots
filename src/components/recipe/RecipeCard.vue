<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

/**
 * Interface representing a recipe with all its properties
 */
interface ExtendedRecipe {
  id: string;
  createdBy: string;
  name: string;
  description: string;
  course: string;
  time: string;
  numServings: string;
  difficulty: string;
  ingredients: string[] | null;
  instructions: string[] | null;
  owner: string;
  imageFileNames: string[] | null;
  imageLinks: string[];
  hasLoadedImages: boolean;
  createdAt: string;
  updatedAt: string;
}

// Component props definition
defineProps<{
  recipe: ExtendedRecipe;
}>();

/**
 * Generates an array representing difficulty dots
 * @param difficulty - The difficulty level of the recipe
 * @returns Array of numbers representing dots to display
 */
function getDifficultyDots(difficulty: string): number[] {
  const difficultyMap = {
    'Easy': [1, 0, 0],
    'Medium': [2, 2, 0],
    'Hard': [3, 3, 3]
  };
  return difficultyMap[difficulty as keyof typeof difficultyMap] || [0, 0, 0];
}

/**
 * Returns the appropriate CSS class for difficulty dots
 * @param dot - The dot value to determine color
 * @returns CSS class string for the dot
 */
function dotClass(dot: number): string {
  const dotColors = {
    1: 'bg-green-500',  // Easy
    2: 'bg-orange-400', // Medium
    3: 'bg-red-600'     // Hard
  };
  return dotColors[dot as keyof typeof dotColors] || 'bg-gray-300';
}

/**
 * Navigates to the detailed recipe page
 * @param id - Recipe ID to navigate to
 */
function goToRecipe(id: string): void {
  router.push(`/recipe/${id}`);
}
</script>

<template>
  <!-- Recipe Card Container -->
  <li @click="goToRecipe(recipe.id)"
      class="group relative flex flex-col h-[600px] w-full p-6
             border-2 border-gold rounded-2xl cursor-pointer
             hover:shadow-lg transition-all duration-300 ease-in-out
             hover:-translate-y-1 overflow-hidden">

    <!--
    ==========================================
    Recipe Image Section
    ==========================================
    -->
    <div class="w-full h-[300px] rounded-xl overflow-hidden mb-6">
      <!-- Loading State -->
      <div v-if="!recipe.hasLoadedImages"
           class="w-full h-full bg-gray-200 animate-pulse">
      </div>

      <!-- Image Display -->
      <div v-else class="w-full h-full">
        <img :src="recipe.imageLinks[0]"
             :alt="recipe.name"
             class="w-full h-full object-cover transition-transform duration-300
                    group-hover:scale-105"
             loading="lazy">
      </div>
    </div>

    <!--
    ==========================================
    Recipe Content Section
    ==========================================
    -->
    <div class="flex flex-col flex-grow gap-4 min-w-0">
      <!-- Course Category -->
      <span class="text-lg md:text-xl text-gold font-light">
        {{ recipe.course }}
      </span>

      <!-- Recipe Title -->
      <h3 class="font-bold text-xl md:text-2xl tracking-wide
                 truncate group-hover:text-clip group-hover:whitespace-normal">
        {{ recipe.name }}
      </h3>

      <!-- Recipe Description -->
      <p class="text-sm md:text-base tracking-wide line-clamp-2
                group-hover:line-clamp-none">
        {{ recipe.description }}
      </p>

      <!--
      ==========================================
      Recipe Metadata Section
      ==========================================
      -->
      <div class="flex flex-wrap items-center gap-x-6 gap-y-3 mt-auto">
        <!-- Difficulty Indicator -->
        <div class="flex items-center gap-1">
          <span v-for="dot in getDifficultyDots(recipe.difficulty)"
                :key="dot"
                :class="dotClass(dot)"
                class="w-2 h-2 rounded-full">
          </span>
        </div>

        <!-- Cooking Time -->
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-clock text-gold"></i>
          <span class="text-sm">{{ recipe.time }}</span>
        </div>

        <!-- Serving Size -->
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-utensils text-gold"></i>
          <span class="text-sm">{{ recipe.numServings }}</span>
        </div>
      </div>

      <!-- Author Attribution -->
      <p class="text-sm text-gray-600">
        Created by {{ recipe.createdBy }}
      </p>
    </div>
  </li>
</template>

<style scoped>
/* Custom color variables */
.text-gold {
  color: #bca067;
}

.border-gold {
  border-color: #bca067;
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
</style>
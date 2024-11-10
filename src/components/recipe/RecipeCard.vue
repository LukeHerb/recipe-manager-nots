<template>
  <li
      @click="handleClick"
      class="gap-6 border-b-8 border-2 bg-inherit border-gold recipe-card cursor-pointer h-96 p-6 rounded-2xl w-full flex justify-between content-center mb-4 hover:shadow-lg transition-shadow duration-300"
  >
    <div
        class="recipe-details w-6/12 flex justify-between items-end h-full mt-auto"
    >
      <div class="flex flex-col h-full gap-6">
        <span class="text-2xl font-light text-gold">{{ recipe.course }}</span>
        <div class="flex gap-4">
          <p class="flex items-center content-center gap-1">
            <span
                v-for="dot in getDifficultyDots(recipe.difficulty || 'Easy')"
                :key="dot"
                :class="dotClass(dot)"
                class="dot"
            ></span>
          </p>
          <p class="flex items-center content-center gap-2">
            <span class="self-start">
              <i class="fa-solid fa-clock text-sm text-gold"></i>
            </span>
            <span class="self-start md:text-sm">{{ recipe.time }}</span>
          </p>
          <p class="flex items-center content-center gap-2">
            <span class="self-start">
              <i class="fa-solid fa-utensils text-sm text-gold"></i>
            </span>
            <span class="self-start md:text-sm">{{ recipe.numServings }}</span>
          </p>
        </div>
        <h3 class="font-bold text-3xl tracking-wider titles">
          {{ recipe.name }}
        </h3>
        <p class="text-base tracking-wide text-ellipsis overflow-hidden line-clamp-3">
          {{ recipe.description }}
        </p>
        <div class="mt-auto flex justify-between items-center">
          <p>Created by {{ recipe.createdBy }}</p>
          <div class="flex gap-2">
            <Button
                v-if="showSaveButton"
                icon="fa-regular fa-bookmark"
                :class="{ 'p-button-warning': isSaved }"
                class="p-button-rounded p-button-outlined"
                @click.stop="handleSave"
            />
            <Button
                v-if="showShareButton"
                icon="fa-solid fa-share"
                class="p-button-rounded p-button-outlined"
                @click.stop="handleShare"
            />
          </div>
        </div>
      </div>
    </div>
    <div
        class="border-2 border-black flex justify-center items-center image-placeholder w-6/12 h-full bg-green-400 rounded-2xl overflow-hidden"
    >
      <img
          v-if="recipe.hasLoadedImages"
          v-for="image in recipe.imageLinks"
          :key="image"
          :src="image"
          :alt="recipe.name"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
      />
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import type { Schema } from '../../../amplify/data/resource'

type ExtendedRecipe = Schema['Recipe']['type'] & {
  imageLinks?: string[]
  hasLoadedImages?: boolean
}

interface Props {
  recipe: ExtendedRecipe
  showSaveButton?: boolean
  showShareButton?: boolean
  isSaved?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSaveButton: false,
  showShareButton: false,
  isSaved: false
})

const emit = defineEmits<{
  click: [id: string]
  save: [id: string]
  share: [id: string]
}>()

function getDifficultyDots(difficulty: string) {
  switch (difficulty) {
    case 'Easy':
      return [1, 0, 0]
    case 'Medium':
      return [2, 2, 0]
    case 'Hard':
      return [3, 3, 3]
    default:
      return [0, 0, 0]
  }
}

function dotClass(dot: number) {
  switch (dot) {
    case 1:
      return 'bg-green-500'
    case 2:
      return 'bg-orange-400'
    case 3:
      return 'bg-red-600'
    default:
      return 'bg-gray-300'
  }
}

const handleClick = () => {
  emit('click', props.recipe.id ?? '')
}

const handleSave = () => {
  emit('save', props.recipe.id ?? '')
}

const handleShare = () => {
  emit('share', props.recipe.id ?? '')
}
</script>

<style scoped>
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.text-gold {
  color: #bca067;
}

.border-gold {
  border-color: #bca067;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
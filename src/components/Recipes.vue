<template>
  <Toast />
  <main
    class="flex flex-col m-auto justify-center content-center items-center p-8 md:py-12"
  >
    <ul class="grid gap-6 grid-cols-2 w-11/12 md:w-full">
      <li
        v-for="recipe in recipes"
        :key="recipe.id ?? ''"
        @click="goToRecipe(recipe.id ?? '')"
        class="gap-6 border-b-8 border-2 bg-inherit border-gold recipe-card cursor-pointer h-96 p-6 rounded-2xl w-full flex justify-between content-center mb-4"
      >
        <div
          class="recipe-details w-6/12 flex justify-between items-end h-full mt-auto"
        >
          <div class="flex flex-col h-full gap-6">
            <span class="text-2xl font-light text-gold">{{
              recipe.course
            }}</span>
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
                <span class="self-start md:text-sm">{{
                  recipe.numServings
                }}</span>
              </p>
            </div>
            <h3 class="font-bold text-3xl tracking-wider titles">
              {{ recipe.name }}
            </h3>
            <p class="text-base tracking-wide text-ellipsis overflow-hidden">
              {{ recipe.description }}
            </p>
            <p class="mt-auto">Created by {{ recipe.createdBy }}</p>
          </div>
        </div>
        <div
          class="border-2 border-black flex justify-center items-center image-placeholder w-6/12 h-full bg-green-400 rounded-2xl overflow-hidden"
        ></div>
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Schema } from '../../amplify/data/resource'
import { generateClient } from 'aws-amplify/data'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'
import { getCurrentUser } from 'aws-amplify/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentUser = ref()

const toast = useToast()

const client = generateClient<Schema>()

// create a reactive reference to the array of todos
const recipes = ref<Array<Schema['Recipe']['type']>>([])

// create a reactive reference to the authenticated user

function listRecipes() {
  client.models.Recipe.observeQuery().subscribe({
    next: ({ items, isSynced }) => {
      recipes.value = items
    },
  })
}

// fetch todos when the component is mounted
onMounted(async () => {
  currentUser.value = await getCurrentUser()
  console.log(currentUser.value)
  listRecipes()
})

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

function goToRecipe(id: string) {
  router.push(`/recipe/${id}`)
}
</script>

<style>
.text-gold {
  color: #bca067;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.border-gold {
  border-color: #bca067;
}

.text-gold {
  color: #bca067;
}
</style>

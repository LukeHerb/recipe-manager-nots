<template>
  <header
    class="bg-inherit text-black p-6 w-full m-auto border-b-2 border-slate-300"
  >
    <nav class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Recipe App</h1>
      <ul class="flex justify-between w-3/12">
        <li class="cursor-pointer">
          <router-link to="/" class="hover:underline">Recipes</router-link>
        </li>
        <li class="cursor-pointer">
          <router-link to="/myRecipes" class="hover:underline"
            >My Recipes</router-link
          >
        </li>
        <li class="cursor-pointer">
          <router-link to="/addRecipe" class="hover:underline"
            >Add Recipe</router-link
          >
        </li>
      </ul>
      <Button @click="signOut" class="p-button-danger">Sign Out</Button>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import Button from 'primevue/button'

const { signOut } = defineProps(['signOut'])
</script>

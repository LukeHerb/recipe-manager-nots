<script setup lang="ts">
import { ref } from 'vue'
import Todos from './components/Recipes.vue'
import Navbar from './components/Navbar.vue'

import { Authenticator } from '@aws-amplify/ui-vue'
import '@aws-amplify/ui-vue/styles.css'
import Button from 'primevue/button'
import { RouterView } from 'vue-router'

const recipes = ref([
  {
    id: '1',
    name: "Nonna's Spaghetti",
    description:
      'A classic spaghetti recipe passed down through generations. This recipe is sure to impress your friends and family with its rich flavors and hearty portions.',
    createdBy: 'Luke Herb',
    time: '30 minutes',
    course: 'Entree',
    numServings: 4,
    difficulty: 'Hard',
  },
  {
    id: '4',
    name: 'Chocolate Chip Cookies',
    description:
      'Soft and chewy chocolate chip cookies that are perfect for any occasion.',
    createdBy: 'Jane Doe',
    time: '20 minutes',
    course: 'Dessert',
    numServings: 24,
    difficulty: 'Easy',
  },
])
</script>

<template>
  <authenticator>
    <template v-slot="{ user, signOut }">
      <Navbar :signOut="signOut" />
      <RouterView />
    </template>
  </authenticator>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Oswald:wght@200..700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

body {
  font-family: 'Montserrat', sans-serif;
  background-color: #ebe7e4;
}

.titles {
  font-family: 'Playfair Display', serif;
}
</style>

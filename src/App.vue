<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Authenticator } from '@aws-amplify/ui-vue'
import '@aws-amplify/ui-vue/styles.css'
import Navbar from './components/Navbar.vue'
</script>

<template>
  <Authenticator>
    <template v-slot="{ user, signOut }">
      <Navbar :signOut="signOut" />
      <RouterView />
    </template>
  </Authenticator>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Oswald:wght@200..700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

body {
  font-family: 'Montserrat', sans-serif;
  background-color: #ebe7e4;
}

.titles {
  font-family: 'Playfair Display', serif;
}
</style>
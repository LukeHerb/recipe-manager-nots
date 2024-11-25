<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { getCurrentUser, signOut as amplifySignOut } from 'aws-amplify/auth'
import Navbar from './components/Navbar.vue'
import '@aws-amplify/ui-vue/styles.css'

const router = useRouter()

// State to track if the user is authenticated
const isAuthenticated = ref(false)

// Function to check if the user is logged in
const checkAuth = async () => {
  try {
    const user = await getCurrentUser()
    isAuthenticated.value = !!user // Set true if user exists
  } catch (error) {
    isAuthenticated.value = false // User is not logged in
    console.log('Not authenticated:', error)
  }
}

// Function to handle sign-out
const signOut = async () => {
  try {
    await amplifySignOut() // Sign out the user using AWS Amplify
    isAuthenticated.value = false // Reset authentication state
    router.push('/') // Redirect to home after sign-out
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

// Function to navigate to the login page
const login = () => {
  router.push('/login') // Navigate to login page
}

// Check authentication when the component is mounted
onMounted(() => {
  checkAuth()
})
</script>

<template>
  <div>
    <!-- Navbar receives signOut, login, and isAuthenticated props -->
    <Navbar
      :signOut="signOut"
      :login="login"
      :isAuthenticated="isAuthenticated"
    />
    <RouterView />
  </div>
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

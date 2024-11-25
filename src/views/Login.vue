<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signIn } from 'aws-amplify/auth'
import { useAuthStore } from '../stores/auth' // Import the Pinia store

const router = useRouter()
const authStore = useAuthStore() // Initialize the store

// Reactive variables for user input and error messages
const username = ref('')
const password = ref('')
const errorMessage = ref('')

// Function to handle sign-in
const handleSignIn = async () => {
  try {
    // Attempt to sign in the user
    const user = await signIn({
      username: username.value,
      password: password.value,
    })
    console.log('User signed in:', user)

    // Clear any previous error messages
    errorMessage.value = ''

    // Update the Pinia store
    authStore.isAuthenticated = true
    authStore.user = user

    // Redirect to home or intended route
    router.push('/')
  } catch (error) {
    console.error('Error signing in:', error)
    errorMessage.value = 'Invalid username or password'
  }
}
</script>

<template>
  <div class="login-container">
    <h1>Sign In</h1>
    <form @submit.prevent="handleSignIn">
      <div class="form-group">
        <label for="username">Username</label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="Enter your username"
        />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Enter your password"
        />
      </div>
      <button type="submit">Sign In</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<style>
.login-container {
  max-width: 400px;
  margin: auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  display: block;
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}

.error-message {
  color: red;
  margin-top: 0.5rem;
}
</style>

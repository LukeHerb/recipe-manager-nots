<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signIn } from 'aws-amplify/auth'
import { useAuthStore } from '../stores/auth' // Import the Pinia store
import '@aws-amplify/ui-vue/styles.css'
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-vue'
import Recipes from './Recipes.vue'
const auth = useAuthenticator()
const router = useRouter()
</script>

<template>
  <authenticator>
    {{ router.push('/') }}
  </authenticator>
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

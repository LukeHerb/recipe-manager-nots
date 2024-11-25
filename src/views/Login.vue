<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { Authenticator } from '@aws-amplify/ui-vue'
import '@aws-amplify/ui-vue/styles.css'

const router = useRouter()
const route = useRoute()

function handleSignIn() {
  // Redirect to the original route or home after successful login
  const redirectPath = route.query.redirect || '/'
  router.push(redirectPath)
}
</script>

<template>
  <div class="login-container">
    <Authenticator>
      <template v-slot:authenticated="{ signOut }">
        <!-- Automatically redirect after successful authentication -->
        {{ handleSignIn() }}
      </template>
    </Authenticator>
  </div>
</template>

<style>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>

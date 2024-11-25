// src/stores/auth.ts
import { defineStore } from 'pinia'
import { getCurrentUser, signOut as amplifySignOut } from 'aws-amplify/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null,
  }),
  actions: {
    async checkAuth() {
      try {
        const user = await getCurrentUser()
        this.isAuthenticated = !!user
        this.user = user
      } catch (error) {
        this.isAuthenticated = false
        this.user = null
        console.log('Not authenticated:', error)
      }
    },
    async signOut() {
      try {
        await amplifySignOut()
        this.isAuthenticated = false
        this.user = null
      } catch (error) {
        console.error('Error signing out:', error)
      }
    },
  },
})

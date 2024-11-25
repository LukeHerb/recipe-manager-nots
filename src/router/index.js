import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from 'aws-amplify/auth' // Adjust import path as necessary
import Recipes from '../views/Recipes.vue'
import NewRecipe from '../views/NewRecipe.vue'
import RecipeDetail from '../views/RecipeDetail.vue'
import MyRecipes from '../views/MyRecipes.vue'
import RecipeEdit from '../views/RecipeEdit.vue'

const routes = [
  {
    path: '/',
    component: Recipes,
    name: 'Recipes',
    meta: { requiresAuth: true },
  },
  {
    path: '/addRecipe',
    component: NewRecipe,
    name: 'NewRecipe',
    meta: { requiresAuth: true },
  },
  { path: '/recipe/:id', component: RecipeDetail, name: 'RecipeDetail' },
  {
    path: '/recipe/:id/edit',
    component: RecipeEdit,
    name: 'RecipeEdit',
    meta: { requiresAuth: true },
  },
  {
    path: '/myRecipes',
    component: MyRecipes,
    name: 'MyRecipes',
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    component: () => import('../views/Login.vue'),
    name: 'Login',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    try {
      // Use getCurrentUser to check authentication
      const user = await getCurrentUser()
      if (user) {
        next() // Allow navigation
      } else {
        throw new Error('User not authenticated')
      }
    } catch (error) {
      console.log('User is not authenticated:', error)
      next({ path: '/login', query: { redirect: to.fullPath } }) // Redirect to login
    }
  } else {
    next() // Route does not require authentication
  }
})

export default router

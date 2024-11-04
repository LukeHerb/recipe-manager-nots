import { createRouter, createWebHistory } from 'vue-router'
import Recipes from '../components/Recipes.vue'
import NewRecipe from '../components/NewRecipe.vue'
import RecipeDetail from '../components/RecipeDetail.vue'
import MyRecipes from '../components/MyRecipes.vue'

const routes = [
  { path: '/', component: Recipes, name: 'Recipes' },
  { path: '/addRecipe', component: NewRecipe, name: 'NewRecipe' },
  { path: '/recipe/:id', component: RecipeDetail, name: 'RecipeDetail' },
  { path: '/myRecipes', component: MyRecipes, name: 'MyRecipes' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

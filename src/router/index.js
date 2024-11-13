import { createRouter, createWebHistory } from 'vue-router'
import Recipes from '../views/Recipes.vue'
import NewRecipe from '../views/NewRecipe.vue'
import RecipeDetail from '../views/RecipeDetail.vue'
import MyRecipes from '../views/MyRecipes.vue'
import RecipeEdit from '../views/RecipeEdit.vue'

const routes = [
  { path: '/', component: Recipes, name: 'Recipes' },
  { path: '/addRecipe', component: NewRecipe, name: 'NewRecipe' },
  { path: '/recipe/:id', component: RecipeDetail, name: 'RecipeDetail' },
  { path: '/recipe/:id/edit', component: RecipeEdit, name: 'RecipeEdit' },
  { path: '/myRecipes', component: MyRecipes, name: 'MyRecipes' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

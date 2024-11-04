<template>
  <div v-if="recipe && currentUser" class="recipe-details">
    <main
      class="flex flex-col m-auto justify-center content-center items-center p-8"
    >
      <ul class="grid gap-6 grid-cols-2 w-10/12">
        <li
          class="border-b-8 border-2 bg-inherit border-gold recipe-card h-auto p-6 rounded-xl w-full flex justify-between content-center mb-4 gap-12"
        >
          <div
            class="recipe-details w-full flex justify-between items-end h-full mt-auto"
          >
            <div class="flex flex-col h-full gap-12 w-full">
              <div class="flex flex-col gap-4">
                <div class="flex justify-between items-center">
                  <p class="text-sm">{{ recipe.data.createdBy }}</p>
                  <div v-if="recipe.data.owner === currentUser.username">
                    <i
                      @click="toggle"
                      class="fa-solid fa-ellipsis text-2xl cursor-pointer"
                    ></i>
                    <Menu
                      ref="menu"
                      id="overlay_menu"
                      :model="items"
                      :popup="true"
                    />
                    <Menu
                      ref="menu"
                      id="overlay_menu"
                      :model="items"
                      :popup="true"
                    />
                  </div>
                </div>
                <h3
                  class="font-semibold text-5xl tracking-wider titles text-gold"
                >
                  {{ recipe.data.name }}
                </h3>
              </div>
              <div class="flex flex-col gap-6">
                <div
                  class="border-2 border-black flex justify-center items-center image-placeholder w-img h-img bg-green-400 rounded-2xl overflow-hidden"
                ></div>
                <div class="flex gap-8 items-center justify-center">
                  <p class="flex items-center content-center gap-1">
                    <span
                      v-for="dot in getDifficultyDots(recipe.data.difficulty)"
                      :key="dot"
                      :class="dotClass(dot)"
                      class="dot"
                    ></span>
                  </p>
                  <div
                    class="flex items-center content-center gap-3 justify-center"
                  >
                    <span class="flex items-center justify-center">
                      <i class="fa-solid fa-clock text-base text-gold"></i>
                    </span>
                    <span class="self-start text-sm">{{
                      recipe.data.time
                    }}</span>
                  </div>
                  <div class="flex items-center content-center gap-3">
                    <span class="flex items-center justify-center">
                      <i class="fa-solid fa-utensils text-base text-gold"></i>
                    </span>
                    <span class="self-start text-sm">{{
                      recipe.data.numServings
                    }}</span>
                  </div>
                </div>
              </div>

              <p class="text-base tracking-wide">
                {{ recipe.data.description }}
              </p>
              <div class="flex flex-col gap-4">
                <span class="text-2xl font-semibold titles">Ingredients:</span>
                <ol class="list-small-disc list-inside">
                  <li
                    v-for="ingredient in recipe.data.ingredients"
                    :key="ingredient"
                  >
                    <span
                      class="text-base leading-7 pl-5 tracking-wider font-light"
                      >{{ ingredient }}</span
                    >
                  </li>
                </ol>
              </div>
              <div class="flex flex-col gap-4">
                <span class="text-2xl font-semibold titles">Instructions:</span>
                <ol class="list-decimal list-inside">
                  <li
                    v-for="instruction in recipe.data.instructions"
                    :key="instruction"
                  >
                    <span
                      class="text-base leading-7 pl-5 tracking-wider font-light"
                      >{{ instruction }}</span
                    >
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </li>
        <div class="flex flex-col gap-4 w-full">
          <div
            class="flex flex-col gap-2"
            v-if="recipe.data.owner !== currentUser.username"
          >
            <div class="flex gap-1">
              <span
                v-for="star in 5"
                :key="star"
                @click="setRating(star)"
                class="star cursor-pointer"
              >
                <i
                  :class="
                    star <= reviewRating
                      ? 'fa-solid fa-star fa-xl'
                      : 'fa-regular fa-star fa-xl'
                  "
                ></i>
              </span>
            </div>
            <Textarea v-model="reviewComment" placeholder="Enter Your Review" />
            <Button severity="success" @click="addReview"
              >Leave Your Review</Button
            >
          </div>
          <li
            v-for="review in recipe.reviews"
            :key="review.id"
            class="border-b-8 border-2 bg-inherit border-gold recipe-card cursor-pointer h-auto p-6 rounded-xl w-full flex justify-between content-center mb-4 gap-12"
          >
            <div
              class="recipe-details flex justify-between items-end h-full mt-auto w-full"
            >
              <div class="flex flex-col h-full gap-12 w-full">
                <div class="flex flex-col gap-4">
                  <div class="flex w-full items-center justify-between">
                    <p class="text-base">{{ review.createdBy }}</p>
                    <div class="flex gap-2">
                      <span
                        v-for="star in getStars(review.reviewStars)"
                        :key="star"
                        class="star"
                      >
                        <i class="fa-solid fa-star"></i>
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <p class="text-base tracking-wide">
                      {{ review.reviewText }}
                    </p>
                    <i
                      class="fa-regular fa-trash-can text-red-500 text-xl cursor-pointer"
                      @click="deleteReview(review.id)"
                      v-if="currentUser.username === review.owner"
                    ></i>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </div>
      </ul>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { getCurrentUser } from 'aws-amplify/auth'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import Rating from 'primevue/rating'
import Menu from 'primevue/menu'

const currentUser = ref()
const client = generateClient<Schema>()
const recipes = ref<Array<Schema['Recipe']['type']>>([])

const route = useRoute()
const recipe = ref<any>(null)
const showForm = ref(false)
const reviewName = ref('')
const reviewComment = ref('')
const reviewRating = ref(0)
const showMenu = ref(false)
const items = [
  {
    label: 'Edit',
    icon: 'fa-solid fa-edit',
    command: () => {
      console.log('Edit')
    },
  },
  {
    label: 'Delete',
    icon: 'fa-solid fa-trash',
    command: () => {
      console.log('Delete')
    },
  },
]
const menu = ref()
const toggle = (event: Event) => {
  menu.value.toggle(event)
}

onMounted(async () => {
  const recipeId = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id
  recipe.value = await client.models.Recipe.get({ id: recipeId })
  currentUser.value = await getCurrentUser()

  // Initialize reviews as an empty array if undefined
  recipe.value.reviews = recipe.value.reviews || []

  // Fetch and assign reviews to the recipe
  const reviewList = await client.models.Review.list({
    filter: { recipeId: { eq: recipeId } },
  })

  // Map the reviews from the database to the `recipe.reviews` array
  recipe.value.reviews = reviewList.data || []
})

function getDifficultyDots(difficulty: string) {
  switch (difficulty) {
    case 'Easy':
      return [1, 0, 0]
    case 'Medium':
      return [2, 2, 0]
    case 'Hard':
      return [3, 3, 3]
    default:
      return [0, 0, 0]
  }
}

function dotClass(dot: number) {
  switch (dot) {
    case 1:
      return 'bg-green-500'
    case 2:
      return 'bg-orange-400'
    case 3:
      return 'bg-red-600'
    default:
      return 'bg-gray-300'
  }
}

function getStars(rating: number) {
  return Array(rating).fill(1)
}

function getEmptyStars(rating: number) {
  return Array(5 - rating).fill(1)
}

function showInputForm() {
  showForm.value = true
}

function setRating(star: number) {
  reviewRating.value = star
}

async function addReview() {
  if (!reviewComment.value || reviewRating.value === 0) {
    alert('Please enter a comment and select a rating.')
    return
  }

  // Define the new review data with necessary fields
  const newReview = {
    createdBy: currentUser.value.signInDetails.loginId,
    reviewStars: reviewRating.value,
    reviewText: reviewComment.value,
    recipeId: recipe.value.data.id,
    owner: currentUser.value.username,
  }

  // Save the new review to the database
  const createdReview = await client.models.Review.create(newReview)
  console.log(createdReview)

  // Push the saved review to `recipe.reviews` so it updates immediately in the UI
  recipe.value.reviews.push(createdReview.data)
  console.log(recipe.value.reviews)

  // Reset the form fields
  reviewComment.value = ''
  reviewRating.value = 0
  showForm.value = false
}

async function deleteReview(reviewId: string) {
  // Delete the review from the database
  await client.models.Review.delete({ id: reviewId })

  // Remove the review from the `recipe.reviews` array
  recipe.value.reviews = recipe.value.reviews.filter(
    (review: any) => review.id !== reviewId
  )
}
</script>

<style scoped>
.star {
  color: #f1c40f;
  margin-right: 2px;
}
.w-img {
  width: 100%;
}

.h-img {
  height: 700px;
}

.dot {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  display: inline-block;
}

.list-small-disc {
  list-style-type: disc;
  font-size: 0.5rem;
}

.text-gold {
  color: #bca067;
}

.border-gold {
  border-color: #bca067;
}
</style>

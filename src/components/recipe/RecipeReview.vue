<template>
  <div class="flex flex-col gap-4 w-full">
    <div class="flex flex-col gap-2" v-if="recipe.data.owner !== currentUser.username">
      <div class="rating-container">
        <span
            v-for="star in 5"
            :key="star"
            @click="setRating(star)"
            @mouseover="hoverRating = star"
            @mouseleave="hoverRating = 0"
            class="star cursor-pointer"
        >
          <i
              :class="[
              star <= (hoverRating || reviewRating) ? 'fa-solid' : 'fa-regular',
              'fa-star fa-xl star-icon'
            ]"
          ></i>
        </span>
      </div>
      <Textarea
          v-model="reviewComment"
          placeholder="Enter Your Review"
          class="w-full font-montserrat"
      />
      <Button severity="success" @click="addReview" class="review-button">
        Leave Your Review
      </Button>
    </div>
    <li v-for="review in recipe.reviews" :key="review.id" class="review-card">
      <div class="recipe-details flex justify-between items-end h-full mt-auto w-full">
        <div class="flex flex-col h-full gap-12 w-full">
          <div class="flex flex-col gap-4">
            <div class="flex w-full items-center justify-between">
              <p class="text-base font-montserrat">{{ review.createdBy }}</p>
              <div class="flex gap-2">
                <span v-for="star in getStars(review.reviewStars)" :key="star" class="star">
                  <i class="fa-solid fa-star"></i>
                </span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-base tracking-wider font-montserrat">
                {{ review.reviewText }}
              </p>
              <i
                  v-if="currentUser.username === review.owner"
                  class="fa-regular fa-trash-can text-red-500 text-xl cursor-pointer"
                  @click="deleteReview(review.id)"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </li>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../../amplify/data/resource'

interface ReviewInput {
  id?: string
  createdBy?: string
  reviewStars?: number
  reviewText?: string
  recipeId?: string
  owner?: string
}

interface ReviewData extends ReviewInput {
  id: string
  createdBy: string
  reviewStars: number
  reviewText: string
  recipeId: string
  owner: string
}

interface RecipeData {
  id: string
  createdBy: string
  name: string
  description: string
  course: string
  time: string
  numServings: string
  difficulty: string
  ingredients: string[]
  instructions: string[]
  owner: string
  imageFileNames: string[]
  imageLinks: string[]
  hasLoadedImages: boolean
  createdAt: string
  updatedAt: string
}

interface RecipeWithReviews {
  data: RecipeData
  reviews?: ReviewData[]
}

interface UserData {
  username: string
  signInDetails: {
    loginId: string
  }
}

const props = defineProps<{
  recipe: RecipeWithReviews;
  currentUser: {
    username: string;
    signInDetails: {
      loginId: string;
    };
  };
}>()

const client = generateClient<Schema>()
const reviewComment = ref('')
const reviewRating = ref(0)
const hoverRating = ref(0)

function getStars(rating: number): number[] {
  return Array.from({ length: rating }, (_, index) => index + 1)
}

function setRating(star: number): void {
  reviewRating.value = star
}

async function addReview(): Promise<void> {
  if (!reviewComment.value || reviewRating.value === 0) {
    alert('Please enter a comment and select a rating.')
    return
  }

  try {
    const newReview: ReviewInput = {
      createdBy: props.currentUser.signInDetails.loginId,
      reviewStars: reviewRating.value,
      reviewText: reviewComment.value,
      recipeId: props.recipe.data.id,
      owner: props.currentUser.username,
    }

    const createdReview = await client.models.Review.create(newReview as any)

    if (createdReview.data) {
      if (!Array.isArray(props.recipe.reviews)) {
        props.recipe.reviews = []
      }
      props.recipe.reviews.push(createdReview.data as ReviewData)

      reviewComment.value = ''
      reviewRating.value = 0
    }
  } catch (error) {
    console.error('Error creating review:', error)
    alert('Failed to create review. Please try again.')
  }
}

async function deleteReview(reviewId: string): Promise<void> {
  try {
    await client.models.Review.delete({ id: reviewId })
    props.recipe.reviews = props.recipe.reviews.filter(
        (review: ReviewData) => review.id !== reviewId
    )
  } catch (error) {
    console.error('Error deleting review:', error)
    alert('Failed to delete review. Please try again.')
  }
}
</script>

<style scoped>
.rating-container {
  display: flex;
  gap: 4px;
  padding: 10px 0;
}

.star {
  position: relative;
  transition: transform 0.2s ease;
}

.star-icon {
  color: #bca067;
  transition: all 0.3s ease;
}

.star:hover {
  transform: scale(1.2);
}

.star:hover .star-icon,
.star:hover ~ .star .star-icon {
  color: #f1c40f;
  text-shadow: 0 0 20px #f1c40f;
}

.fa-solid.star-icon {
  color: #f1c40f;
  text-shadow: 0 0 10px rgba(241, 196, 15, 0.5);
}

.review-card {
  border: 2px solid #bca067;
  background-color: #ebe7e4;
  cursor: pointer;
  height: auto;
  padding: 1.5rem;
  border-radius: 0.75rem;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 3rem;
  transition: transform 0.2s ease;
}

.review-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(188, 160, 103, 0.2);
}

.review-button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: 'Montserrat', sans-serif;
  background-color: #1a1a1a;
  color: rgba(255, 255, 255, 0.87);
  transition: all 0.2s ease;
}

.review-button:hover {
  background-color: #646cff;
  transform: translateY(-2px);
}

:deep(.p-textarea) {
  width: 100%;
  font-family: 'Montserrat', sans-serif;
}

@media (prefers-color-scheme: light) {
  .review-button {
    background-color: #f9f9f9;
    color: #213547;
  }

  .review-button:hover {
    background-color: #535bf2;
    color: rgba(255, 255, 255, 0.87);
  }
}
</style>

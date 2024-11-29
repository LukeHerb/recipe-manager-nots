<template>
  <div class="flex flex-col gap-4 w-full">
    <!-- Review Input Section -->
    <div
      class="flex flex-col gap-2"
      v-if="recipe.data.owner !== currentUser.username"
    >
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
              'fa-star fa-xl star-icon',
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

    <!-- Reviews List -->
    <li v-for="review in recipe.reviews" :key="review.id" class="review-card">
      <div
        class="recipe-details flex justify-between items-end h-full mt-auto w-full"
      >
        <div class="flex flex-col h-full gap-12 w-full">
          <div class="flex flex-col gap-4">
            <div class="flex w-full items-center justify-between">
              <p class="text-base font-montserrat">{{ review.createdBy }}</p>
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
              <p class="text-base tracking-wider font-montserrat">
                {{ review.reviewText }}
              </p>
              <i
                v-if="currentUser.username === review.owner"
                class="fa-regular fa-trash-can text-red-500 text-xl cursor-pointer"
                @click="showDeleteConfirmation(review)"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </li>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="showDeleteDialog"
      modal
      header="Delete Review"
      :style="{ width: '500px' }"
      :closable="false"
    >
      <div class="confirmation-content p-4">
        <div class="flex items-start mb-4">
          <i
            class="fa-solid fa-triangle-exclamation text-2xl text-yellow-500 mr-3 mt-1"
          ></i>
          <div class="flex flex-col gap-2">
            <span class="font-semibold text-lg"
              >This action cannot be undone</span
            >
            <p class="text-gray-600">
              This will permanently delete your review. Are you sure you want to
              proceed?
            </p>
          </div>
        </div>
        <div class="mt-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Please type
            <span class="font-mono bg-gray-100 px-2 py-1 rounded">delete</span>
            to confirm
          </label>
          <InputText
            v-model="deleteConfirmation"
            class="w-full"
            :class="{ 'p-invalid': showDeleteError }"
          />
          <small v-if="showDeleteError" class="p-error block mt-1">
            Please type 'delete' to confirm
          </small>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="Cancel"
            icon="fa-solid fa-times"
            @click="cancelDelete"
            class="p-button-outlined"
            :disabled="deleting"
          />
          <Button
            label="Delete Review"
            icon="fa-solid fa-trash"
            @click="confirmDelete"
            class="p-button-danger"
            :loading="deleting"
            :disabled="deleteConfirmation !== 'delete'"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../../amplify/data/resource'

// Types
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
  averageRating: number
  reviewCount: number
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

// Props
const props = defineProps<{
  recipe: RecipeWithReviews
  currentUser: {
    username: string
    signInDetails: {
      loginId: string
    }
  }
}>()

// Initialize utilities
const client = generateClient<Schema>()
const toast = useToast()

// Component state
const reviewComment = ref('')
const reviewRating = ref(0)
const hoverRating = ref(0)
const showDeleteDialog = ref(false)
const showDeleteError = ref(false)
const deleteConfirmation = ref('')
const deleting = ref(false)
const selectedReview = ref<ReviewData | null>(null)

// Review functions
function getStars(rating: number): number[] {
  return Array.from({ length: rating }, (_, index) => index + 1)
}

function setRating(star: number): void {
  reviewRating.value = star
}

async function addReview(): Promise<void> {
  if (!reviewComment.value || reviewRating.value === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Validation Error',
      detail: 'Please enter a comment and select a rating.',
      life: 3000,
    })
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

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Review added successfully',
        life: 3000,
      })
    }

    const totalReviews = props.recipe.reviews?.length || 0
    const totalRating =
      props.recipe.reviews?.reduce(
        (acc: number, review: ReviewData) => acc + review.reviewStars,
        0
      ) || 0

    // Calculate and round average rating to the nearest integer
    const newAverageRating =
      totalReviews > 0 ? Math.round(totalRating / totalReviews) : 0

    // Update recipe with integer average rating
    const updatedRecipeData = await client.models.Recipe.update({
      id: props.recipe.data.id,
      averageRating: newAverageRating, // Use integer value
      numReviews: totalReviews,
    })
  } catch (error) {
    console.error('Error creating review:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create review. Please try again.',
      life: 3000,
    })
  }
}

// Delete confirmation functions
function showDeleteConfirmation(review: ReviewData) {
  selectedReview.value = review
  showDeleteDialog.value = true
  deleteConfirmation.value = ''
  showDeleteError.value = false
}

function cancelDelete() {
  showDeleteDialog.value = false
  deleteConfirmation.value = ''
  showDeleteError.value = false
  selectedReview.value = null
}

async function confirmDelete() {
  if (deleteConfirmation.value !== 'delete') {
    showDeleteError.value = true
    return
  }

  if (!selectedReview.value) return

  deleting.value = true
  try {
    await client.models.Review.delete({ id: selectedReview.value.id })
    props.recipe.reviews = props.recipe.reviews?.filter(
      (review: ReviewData) => review.id !== selectedReview.value?.id
    )

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Review deleted successfully',
      life: 3000,
    })
  } catch (error) {
    console.error('Error deleting review:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete review. Please try again.',
      life: 3000,
    })
  } finally {
    deleting.value = false
    showDeleteDialog.value = false
    deleteConfirmation.value = ''
    showDeleteError.value = false
    selectedReview.value = null
  }
}
</script>

<style scoped>
/* Rating and Review Card Styles */
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

/* Dialog Styling */
:deep(.p-dialog-mask) {
  background-color: rgba(0, 0, 0, 0.7);
}

:deep(.p-dialog) {
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  max-width: 90vw;
}

:deep(.p-dialog-header) {
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.25rem 1.5rem;
}

:deep(.p-dialog-title) {
  font-weight: 600;
  font-size: 1.25rem;
  color: #1f2937;
}

:deep(.p-dialog-content) {
  padding: 0;
  background-color: #fff;
}

:deep(.p-dialog-footer) {
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  background-color: #fff;
  border-top: 1px solid #e5e7eb;
  padding: 1.25rem 1.5rem;
}

/* Dialog Input Styling */
:deep(.p-inputtext) {
  padding: 0.75rem;
  border-radius: 0.375rem;
  border-color: #e5e7eb;
  transition: all 0.2s ease;
}

:deep(.p-inputtext:hover) {
  border-color: #bca067;
}

:deep(.p-inputtext:focus) {
  border-color: #bca067;
  box-shadow: 0 0 0 2px rgba(188, 160, 103, 0.2);
}

:deep(.p-inputtext.p-invalid) {
  border-color: #dc2626;
}

:deep(.p-inputtext.p-invalid:focus) {
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2);
}

:deep(.p-textarea) {
  width: 100%;
  font-family: 'Montserrat', sans-serif;
}

/* Light Theme Adjustments */
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

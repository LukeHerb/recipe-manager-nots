<template>
  <div class="w-full">
    <div class="flex flex-col gap-4 bg-[#ebe7e4] p-6 rounded-xl shadow-md border-2 border-[#bca067]/20">
      <!-- Main Search Bar with Filter Toggle -->
      <div class="flex gap-4">
        <FloatLabel variant="on" class="w-full">
          <InputText
              v-model="searchQuery.title"
              class="w-full"
              @input="handleSearch"
          />
          <label>Search recipes...</label>
        </FloatLabel>
        <Button
            icon="fa-solid fa-filter"
            class="p-button-rounded"
            :class="{ 'p-button-filter': true, 'p-button-filter-active': showFilters }"
            @click="showFilters = !showFilters"
        />
      </div>

      <!-- Advanced Filters Section -->
      <div v-if="showFilters" class="flex flex-col gap-4">
        <!-- Course and Difficulty Filters -->
        <div class="flex gap-4">
          <!-- Course Selection -->
          <div class="w-1/2">
            <FloatLabel variant="on">
              <MultiSelect
                  v-model="searchQuery.courses"
                  :options="courseOptions"
                  optionLabel="name"
                  class="w-full"
                  selectionMode="multiple"
                  showSelectAll
                  selectAllLabel="Select All"
                  @change="handleSearch"
              />
              <label>Select Courses</label>
            </FloatLabel>
          </div>
          <!-- Difficulty Selection -->
          <div class="w-1/2">
            <FloatLabel variant="on">
              <MultiSelect
                  v-model="searchQuery.difficulties"
                  :options="difficultyOptions"
                  optionLabel="name"
                  class="w-full"
                  selectionMode="multiple"
                  showSelectAll
                  selectAllLabel="Select All"
                  @change="handleSearch"
              />
              <label>Select Difficulties</label>
            </FloatLabel>
          </div>
        </div>

        <!-- Time Range Selection -->
        <div class="flex gap-4">
          <div class="w-1/2">
            <FloatLabel variant="on">
              <Select
                  v-model="searchQuery.timeRange.min"
                  :options="timeOptions"
                  class="w-full"
                  @change="handleSearch"
              />
              <label>Minimum Time</label>
            </FloatLabel>
          </div>
          <div class="w-1/2">
            <FloatLabel variant="on">
              <Select
                  v-model="searchQuery.timeRange.max"
                  :options="timeOptions"
                  class="w-full"
                  @change="handleSearch"
              />
              <label>Maximum Time</label>
            </FloatLabel>
          </div>
        </div>

        <!-- Ingredients Management -->
        <div class="flex flex-col gap-2">
          <!-- Include Ingredients Input -->
          <div class="flex gap-4">
            <FloatLabel variant="on" class="w-full">
              <InputText
                  v-model="ingredientInput"
                  class="w-full"
                  @keyup.enter="addIngredient"
              />
              <label>Add ingredient to include...</label>
            </FloatLabel>
            <Button
                icon="fa-solid fa-plus"
                class="p-button-rounded p-button-gold"
                @click="addIngredient"
            />
          </div>

          <!-- Included Ingredients Tags -->
          <div v-if="searchQuery.includedIngredients.length > 0" class="flex flex-wrap gap-2">
            <Tag
                v-for="ingredient in searchQuery.includedIngredients"
                :key="ingredient"
                :value="ingredient"
                class="custom-tag-success cursor-pointer hover:opacity-80"
                icon="pi pi-times"
                @click="removeIncludedIngredient(ingredient)"
            />
          </div>

          <!-- Exclude Ingredients Input -->
          <div class="flex gap-4 mt-2">
            <FloatLabel variant="on" class="w-full">
              <InputText
                  v-model="excludedIngredientInput"
                  class="w-full"
                  @keyup.enter="addExcludedIngredient"
              />
              <label>Add ingredient to exclude...</label>
            </FloatLabel>
            <Button
                icon="fa-solid fa-minus"
                class="p-button-rounded p-button-danger-custom"
                @click="addExcludedIngredient"
            />
          </div>

          <!-- Excluded Ingredients Tags -->
          <div v-if="searchQuery.excludedIngredients.length > 0" class="flex flex-wrap gap-2">
            <Tag
                v-for="ingredient in searchQuery.excludedIngredients"
                :key="ingredient"
                :value="ingredient"
                class="custom-tag-danger cursor-pointer hover:opacity-80"
                icon="pi pi-times"
                @click="removeExcludedIngredient(ingredient)"
            />
          </div>
        </div>

        <!-- Clear Filters Button -->
        <div class="flex justify-end">
          <Button
              label="Clear Filters"
              class="p-button-outlined p-button-gold-outlined"
              @click="clearFilters"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// [Previous script content remains exactly the same]
import { ref, reactive } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import MultiSelect from 'primevue/multiselect'
import Select from 'primevue/select'
import FloatLabel from 'primevue/floatlabel'
import Tag from 'primevue/tag'

// Type definitions
interface SearchQuery {
  title: string
  courses: Array<{ name: string; value: string }>
  difficulties: Array<{ name: string; value: string }>
  timeRange: {
    min: string | null
    max: string | null
  }
  includedIngredients: string[]
  excludedIngredients: string[]
}

// Initialize search state
const searchQuery = reactive<SearchQuery>({
  title: '',
  courses: [],
  difficulties: [],
  timeRange: {
    min: null,
    max: null
  },
  includedIngredients: [],
  excludedIngredients: []
})

// UI state management
const showFilters = ref(false)
const ingredientInput = ref('')
const excludedIngredientInput = ref('')

// Filter options
const courseOptions = [
  { name: 'Appetizer', value: 'appetizer' },
  { name: 'Entree', value: 'entree' },
  { name: 'Dessert', value: 'dessert' },
  { name: 'Side Dish', value: 'side' },
  { name: 'Drink', value: 'drink' },
  { name: 'Other', value: 'other' }
]

const difficultyOptions = [
  { name: 'Easy', value: 'easy' },
  { name: 'Medium', value: 'medium' },
  { name: 'Hard', value: 'hard' }
]

const timeOptions = [
  '15 minutes', '30 minutes', '45 minutes',
  '1 hour', '1 hour 30 minutes', '2 hours',
  '2 hours 30 minutes', '3 hours', '4 hours',
  '5 hours', '6 hours', '7 hours', '8 hours'
]

// Event emitter
const emit = defineEmits(['search'])

// Search handling methods
const handleSearch = () => {
  emit('search', {
    ...searchQuery,
    courses: searchQuery.courses.map(course => course.value),
    difficulties: searchQuery.difficulties.map(difficulty => difficulty.value)
  })
}

// Ingredient management methods
const addIngredient = () => {
  if (ingredientInput.value.trim()) {
    searchQuery.includedIngredients.push(ingredientInput.value.trim())
    ingredientInput.value = ''
    handleSearch()
  }
}

const addExcludedIngredient = () => {
  if (excludedIngredientInput.value.trim()) {
    searchQuery.excludedIngredients.push(excludedIngredientInput.value.trim())
    excludedIngredientInput.value = ''
    handleSearch()
  }
}

const removeIncludedIngredient = (ingredient: string) => {
  searchQuery.includedIngredients = searchQuery.includedIngredients.filter(
      i => i !== ingredient
  )
  handleSearch()
}

const removeExcludedIngredient = (ingredient: string) => {
  searchQuery.excludedIngredients = searchQuery.excludedIngredients.filter(
      i => i !== ingredient
  )
  handleSearch()
}

// Reset all filters
const clearFilters = () => {
  searchQuery.title = ''
  searchQuery.courses = []
  searchQuery.difficulties = []
  searchQuery.timeRange.min = null
  searchQuery.timeRange.max = null
  searchQuery.includedIngredients = []
  searchQuery.excludedIngredients = []
  ingredientInput.value = ''
  excludedIngredientInput.value = ''
  handleSearch()
}
</script>

<style scoped>
/* Custom color variables */
:root {
  --gold-color: #bca067;
  --gold-hover: #ab8f56;
  --gold-light: rgba(188, 160, 103, 0.1);
  --background-color: #ebe7e4;
}

/* Container styling */
.w-full > div {
  background-color: #ebe7e4;
  border: 2px solid rgba(188, 160, 103, 0.2);
  transition: all 0.3s ease;
}

/* Filter button styling */
:deep(.p-button-filter) {
  background-color: #bca067;
  border-color: #bca067;
  color: white;
}

:deep(.p-button-filter:hover) {
  background-color: #ab8f56 !important;
  border-color: #ab8f56 !important;
}

:deep(.p-button-filter-active) {
  background-color: #ab8f56;
  border-color: #ab8f56;
}

/* Gold button styling */
:deep(.p-button-gold) {
  background-color: #bca067;
  border-color: #bca067;
  color: white;
}

:deep(.p-button-gold:hover) {
  background-color: #ab8f56 !important;
  border-color: #ab8f56 !important;
}

:deep(.p-button-gold-outlined) {
  color: #bca067;
  border-color: #bca067;
}

:deep(.p-button-gold-outlined:hover) {
  background-color: rgba(188, 160, 103, 0.1) !important;
  border-color: #ab8f56 !important;
  color: #ab8f56 !important;
}

/* Custom danger button */
:deep(.p-button-danger-custom) {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

:deep(.p-button-danger-custom:hover) {
  background-color: #bb2d3b !important;
  border-color: #bb2d3b !important;
}

/* Input focus states */
:deep(.p-inputtext:focus) {
  border-color: #bca067 !important;
  box-shadow: 0 0 0 1px #bca067 !important;
}

/* MultiSelect and Select styling */
:deep(.p-multiselect:not(.p-disabled).p-focus),
:deep(.p-select:not(.p-disabled).p-focus) {
  border-color: #bca067 !important;
  box-shadow: 0 0 0 1px #bca067 !important;
}

:deep(.p-multiselect-item.p-highlight),
:deep(.p-select-item.p-highlight) {
  background-color: rgba(188, 160, 103, 0.1) !important;
  color: #bca067 !important;
}

/* Custom tag styling */
.custom-tag-success {
  background-color: #bca067 !important;
  color: white !important;
}

.custom-tag-danger {
  background-color: #dc3545 !important;
  color: white !important;
}

/* Tag styling */
:deep(.p-tag) {
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.p-tag-icon) {
  margin-left: 0.5rem;
  font-size: 0.75rem;
  opacity: 0.7;
}

:deep(.p-tag:hover .p-tag-icon) {
  opacity: 1;
}

:deep(.p-tag:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* MultiSelect container */
:deep(.p-multiselect) {
  width: 100%;
}

/* Dropdown panel styling */
:deep(.p-dropdown-panel) {
  border-color: #bca067;
}

/* Float label color when focused */
:deep(.p-float-label input:focus ~ label),
:deep(.p-float-label textarea:focus ~ label) {
  color: #bca067;
}
</style>
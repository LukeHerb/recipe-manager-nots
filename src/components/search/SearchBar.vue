<template>
  <div class="w-full">
    <div class="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-sm">
      <!-- Search Input -->
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
            @click="showFilters = !showFilters"
            :class="{ 'p-button-primary': showFilters }"
        />
      </div>

      <!-- Advanced Filters -->
      <div v-if="showFilters" class="flex flex-col gap-4">
        <!-- Course and Difficulty -->
        <div class="flex gap-4">
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

        <!-- Time Range -->
        <div class="flex gap-4">
          <div class="w-1/2">
            <FloatLabel variant="on">
              <Select
                  v-model="searchQuery.minTime"
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
                  v-model="searchQuery.maxTime"
                  :options="timeOptions"
                  class="w-full"
                  @change="handleSearch"
              />
              <label>Maximum Time</label>
            </FloatLabel>
          </div>
        </div>

        <!-- Ingredients -->
        <div class="flex flex-col gap-2">
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
                class="p-button-rounded"
                @click="addIngredient"
            />
          </div>

          <!-- Included Ingredients Tags -->
          <div v-if="searchQuery.includedIngredients.length > 0" class="flex flex-wrap gap-2">
            <Tag
                v-for="ingredient in searchQuery.includedIngredients"
                :key="ingredient"
                :value="ingredient"
                severity="success"
                class="cursor-pointer hover:opacity-80"
                icon="pi pi-times"
                @click="removeIncludedIngredient(ingredient)"
            />
          </div>

          <!-- Excluded Ingredients -->
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
                class="p-button-rounded p-button-danger"
                @click="addExcludedIngredient"
            />
          </div>

          <!-- Excluded Ingredients Tags -->
          <div v-if="searchQuery.excludedIngredients.length > 0" class="flex flex-wrap gap-2">
            <Tag
                v-for="ingredient in searchQuery.excludedIngredients"
                :key="ingredient"
                :value="ingredient"
                severity="danger"
                class="cursor-pointer hover:opacity-80"
                icon="pi pi-times"
                @click="removeExcludedIngredient(ingredient)"
            />
          </div>
        </div>

        <!-- Clear Filters -->
        <div class="flex justify-end">
          <Button
              label="Clear Filters"
              class="p-button-outlined p-button-secondary"
              @click="clearFilters"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import MultiSelect from 'primevue/multiselect'
import Select from 'primevue/select'
import FloatLabel from 'primevue/floatlabel'
import Tag from 'primevue/tag'

// Define emits
const emit = defineEmits(['search'])

// Search query state
const searchQuery = reactive({
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

// UI state
const showFilters = ref(false)
const ingredientInput = ref('')
const excludedIngredientInput = ref('')

// Options from existing app configuration
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
  '15 minutes',
  '30 minutes',
  '45 minutes',
  '1 hour',
  '1 hour 30 minutes',
  '2 hours',
  '2 hours 30 minutes',
  '3 hours',
  '3 hours 30 minutes',
  '4 hours',
  '4 hours 30 minutes',
  '5 hours',
  '5 hours 30 minutes',
  '6 hours',
  '6 hours 30 minutes',
  '7 hours',
  '7 hours 30 minutes',
  '8 hours'
]

// Methods
const handleSearch = () => {
  emit('search', { ...searchQuery })
}

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

const clearFilters = () => {
  searchQuery.title = ''
  searchQuery.courses = []
  searchQuery.difficulties = []
  searchQuery.minTime = null
  searchQuery.maxTime = null
  searchQuery.includedIngredients = []
  searchQuery.excludedIngredients = []
  ingredientInput.value = ''
  excludedIngredientInput.value = ''
  handleSearch()
}
</script>

<style scoped>
:deep(.p-tag) {
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  transition: opacity 0.2s;
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
  opacity: 0.8;
}

:deep(.p-multiselect) {
  width: 100%;
}
</style>
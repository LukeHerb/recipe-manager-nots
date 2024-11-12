<template>
  <div class="filter-panel w-full bg-[#ebe7e4] rounded-xl shadow-md p-6 border-2 border-[#bca067]/20">
    <div class="flex flex-col gap-4">
      <!-- Course Selection Filter -->
      <div class="filter-section">
        <FloatLabel variant="on">
          <MultiSelect
              v-model="selectedFilters.courses"
              :options="courseOptions"
              optionLabel="name"
              class="w-full"
              @change="emitFilterChange"
          />
          <label>Select Courses</label>
        </FloatLabel>
      </div>

      <!-- Time Range Selection Filter -->
      <div class="filter-section">
        <span class="text-sm text-[#2c3e50] mb-2 block font-medium">Cooking Time Range</span>
        <div class="flex gap-4">
          <FloatLabel variant="on" class="w-1/2">
            <Select
                v-model="selectedFilters.timeRange.min"
                :options="timeOptions"
                class="w-full"
                @change="handleTimeChange"
            />
            <label>Minimum Time</label>
          </FloatLabel>
          <FloatLabel variant="on" class="w-1/2">
            <Select
                v-model="selectedFilters.timeRange.max"
                :options="timeOptions"
                class="w-full"
                @change="handleTimeChange"
            />
            <label>Maximum Time</label>
          </FloatLabel>
        </div>
      </div>

      <!-- Difficulty Level Filter -->
      <div class="filter-section">
        <FloatLabel variant="on">
          <MultiSelect
              v-model="selectedFilters.difficulties"
              :options="difficultyOptions"
              optionLabel="name"
              class="w-full"
              @change="emitFilterChange"
          />
          <label>Select Difficulty Levels</label>
        </FloatLabel>
      </div>

      <!-- Active Filters Display -->
      <div v-if="hasActiveFilters" class="filter-tags flex flex-wrap gap-2 mt-2">
        <Tag
            v-for="course in selectedFilters.courses"
            :key="'course-' + course.value"
            :value="course.name"
            class="custom-tag-course"
            @remove="removeCourse(course)"
        />
        <Tag
            v-for="difficulty in selectedFilters.difficulties"
            :key="'diff-' + difficulty.value"
            :value="difficulty.name"
            class="custom-tag-difficulty"
            @remove="removeDifficulty(difficulty)"
        />
        <Tag
            v-if="hasTimeFilter"
            :value="timeRangeText"
            class="custom-tag-time"
            @remove="clearTimeRange"
        />
      </div>

      <!-- Clear All Filters Button -->
      <div v-if="hasActiveFilters" class="clear-filters flex justify-end mt-2">
        <Button
            label="Clear All Filters"
            icon="fa-solid fa-times"
            class="p-button-outlined p-button-gold-outlined"
            @click="clearAllFilters"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import MultiSelect from 'primevue/multiselect'
import Select from 'primevue/select'
import FloatLabel from 'primevue/floatlabel'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

// Type definitions for filter options and state
interface FilterOption {
  name: string
  value: string
}

interface TimeRange {
  min: string | null
  max: string | null
}

interface FilterState {
  courses: FilterOption[]
  difficulties: FilterOption[]
  timeRange: TimeRange
}

// Available course options for filtering
const courseOptions: FilterOption[] = [
  { name: 'Appetizer', value: 'appetizer' },
  { name: 'Entree', value: 'entree' },
  { name: 'Dessert', value: 'dessert' },
  { name: 'Side Dish', value: 'side' },
  { name: 'Drink', value: 'drink' },
  { name: 'Other', value: 'other' }
]

// Available difficulty levels for filtering
const difficultyOptions: FilterOption[] = [
  { name: 'Easy', value: 'easy' },
  { name: 'Medium', value: 'medium' },
  { name: 'Hard', value: 'hard' }
]

// Available time options for filtering
const timeOptions = [
  '15 minutes',
  '30 minutes',
  '45 minutes',
  '1 hour',
  '1 hour 30 minutes',
  '2 hours',
  '2 hours 30 minutes',
  '3 hours',
  '4 hours',
  '5 hours',
  '6 hours',
  '7 hours',
  '8 hours'
]

// Initialize reactive filter state
const selectedFilters = reactive<FilterState>({
  courses: [],
  difficulties: [],
  timeRange: {
    min: null,
    max: null
  }
})

// Define emitted events
const emit = defineEmits(['filter-change'])

// Computed properties for filter state
const hasActiveFilters = computed(() => {
  return (
      selectedFilters.courses.length > 0 ||
      selectedFilters.difficulties.length > 0 ||
      selectedFilters.timeRange.min !== null ||
      selectedFilters.timeRange.max !== null
  )
})

const hasTimeFilter = computed(() => {
  return selectedFilters.timeRange.min !== null || selectedFilters.timeRange.max !== null
})

const timeRangeText = computed(() => {
  const min = selectedFilters.timeRange.min || 'Any'
  const max = selectedFilters.timeRange.max || 'Any'
  return `${min} - ${max}`
})

// Filter change handlers
const emitFilterChange = () => {
  emit('filter-change', {
    courses: selectedFilters.courses.map(c => c.value),
    difficulties: selectedFilters.difficulties.map(d => d.value),
    timeRange: selectedFilters.timeRange
  })
}

// Time range handling
const handleTimeChange = () => {
  if (
      selectedFilters.timeRange.min &&
      selectedFilters.timeRange.max &&
      getTimeInMinutes(selectedFilters.timeRange.min) > getTimeInMinutes(selectedFilters.timeRange.max)
  ) {
    const temp = selectedFilters.timeRange.min
    selectedFilters.timeRange.min = selectedFilters.timeRange.max
    selectedFilters.timeRange.max = temp
  }
  emitFilterChange()
}

// Utility function to convert time string to minutes
const getTimeInMinutes = (timeString: string): number => {
  const hours = timeString.includes('hour') ? parseInt(timeString) : 0
  const minutes = timeString.includes('minutes') ? parseInt(timeString) : 0
  return hours * 60 + minutes
}

// Filter removal handlers
const removeCourse = (course: FilterOption) => {
  selectedFilters.courses = selectedFilters.courses.filter(c => c.value !== course.value)
  emitFilterChange()
}

const removeDifficulty = (difficulty: FilterOption) => {
  selectedFilters.difficulties = selectedFilters.difficulties.filter(d => d.value !== difficulty.value)
  emitFilterChange()
}

const clearTimeRange = () => {
  selectedFilters.timeRange.min = null
  selectedFilters.timeRange.max = null
  emitFilterChange()
}

// Reset all filters
const clearAllFilters = () => {
  selectedFilters.courses = []
  selectedFilters.difficulties = []
  selectedFilters.timeRange.min = null
  selectedFilters.timeRange.max = null
  emitFilterChange()
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

/* PrimeVue component customization */
:deep(.p-multiselect) {
  width: 100%;
  border-color: rgba(188, 160, 103, 0.3);
}

:deep(.p-multiselect:not(.p-disabled).p-focus) {
  border-color: #bca067;
  box-shadow: 0 0 0 1px #bca067;
}

:deep(.p-multiselect-item.p-highlight) {
  background-color: rgba(188, 160, 103, 0.1) !important;
  color: #bca067 !important;
}

:deep(.p-select:not(.p-disabled).p-focus) {
  border-color: #bca067;
  box-shadow: 0 0 0 1px #bca067;
}

/* Tag styling */
:deep(.p-tag) {
  padding: 0.25rem 0.75rem;
  transition: all 0.2s ease;
}

:deep(.p-tag-icon) {
  margin-left: 0.5rem;
  cursor: pointer;
  opacity: 0.7;
}

:deep(.p-tag:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.p-tag:hover .p-tag-icon) {
  opacity: 1;
}

/* Custom tag colors */
:deep(.custom-tag-course) {
  background-color: #bca067 !important;
  color: white !important;
}

:deep(.custom-tag-difficulty) {
  background-color: #ab8f56 !important;
  color: white !important;
}

:deep(.custom-tag-time) {
  background-color: #8b7544 !important;
  color: white !important;
}

/* Gold outlined button */
:deep(.p-button-gold-outlined) {
  color: #bca067;
  border-color: #bca067;
}

:deep(.p-button-gold-outlined:hover) {
  background-color: rgba(188, 160, 103, 0.1) !important;
  border-color: #ab8f56 !important;
  color: #ab8f56 !important;
}

/* Filter section styling */
.filter-section {
  border-bottom: 1px solid rgba(188, 160, 103, 0.2);
  padding-bottom: 1rem;
}

.filter-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

/* Input focus states */
:deep(.p-inputtext:focus) {
  border-color: #bca067 !important;
  box-shadow: 0 0 0 1px #bca067 !important;
}

/* Float label color when focused */
:deep(.p-float-label input:focus ~ label),
:deep(.p-float-label textarea:focus ~ label) {
  color: #bca067 !important;
}

/* Dropdown customization */
:deep(.p-dropdown-panel) {
  border-color: #bca067;
}

:deep(.p-dropdown-item.p-highlight) {
  background-color: rgba(188, 160, 103, 0.1) !important;
  color: #bca067 !important;
}

/* MultiSelect panel */
:deep(.p-multiselect-panel) {
  border-color: #bca067;
}

/* Hover states */
:deep(.p-dropdown-item:hover),
:deep(.p-multiselect-item:hover) {
  background-color: rgba(188, 160, 103, 0.1) !important;
  color: #bca067 !important;
}

/* Transition effects */
.filter-panel {
  transition: all 0.3s ease;
}

.filter-tags {
  transition: all 0.3s ease;
}
</style>
<template>
  <div class="filter-panel w-full bg-white rounded-xl shadow-sm p-6">
    <div class="flex flex-col gap-4">
      <!-- Course Selection -->
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

      <!-- Time Range Selection -->
      <div class="filter-section">
        <span class="text-sm text-gray-600 mb-2 block">Cooking Time Range</span>
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

      <!-- Difficulty Selection -->
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

      <!-- Applied Filters Display -->
      <div v-if="hasActiveFilters" class="filter-tags flex flex-wrap gap-2 mt-2">
        <Tag
            v-for="course in selectedFilters.courses"
            :key="'course-' + course.value"
            :value="course.name"
            severity="info"
            @remove="removeCourse(course)"
        />
        <Tag
            v-for="difficulty in selectedFilters.difficulties"
            :key="'diff-' + difficulty.value"
            :value="difficulty.name"
            severity="warning"
            @remove="removeDifficulty(difficulty)"
        />
        <Tag
            v-if="hasTimeFilter"
            :value="timeRangeText"
            severity="success"
            @remove="clearTimeRange"
        />
      </div>

      <!-- Clear Filters Button -->
      <div v-if="hasActiveFilters" class="clear-filters flex justify-end mt-2">
        <Button
            label="Clear All Filters"
            icon="fa-solid fa-times"
            class="p-button-outlined p-button-secondary"
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

// Course options based on existing app configuration
const courseOptions: FilterOption[] = [
  { name: 'Appetizer', value: 'appetizer' },
  { name: 'Entree', value: 'entree' },
  { name: 'Dessert', value: 'dessert' },
  { name: 'Side Dish', value: 'side' },
  { name: 'Drink', value: 'drink' },
  { name: 'Other', value: 'other' }
]

// Difficulty options based on existing app configuration
const difficultyOptions: FilterOption[] = [
  { name: 'Easy', value: 'easy' },
  { name: 'Medium', value: 'medium' },
  { name: 'Hard', value: 'hard' }
]

// Time options based on existing app configuration
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

// Initialize selected filters state
const selectedFilters = reactive<FilterState>({
  courses: [],
  difficulties: [],
  timeRange: {
    min: null,
    max: null
  }
})

// Emit events
const emit = defineEmits(['filter-change'])

// Computed properties
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

// Methods
const emitFilterChange = () => {
  emit('filter-change', {
    courses: selectedFilters.courses.map(c => c.value),
    difficulties: selectedFilters.difficulties.map(d => d.value),
    timeRange: selectedFilters.timeRange
  })
}

const handleTimeChange = () => {
  if (
      selectedFilters.timeRange.min &&
      selectedFilters.timeRange.max &&
      getTimeInMinutes(selectedFilters.timeRange.min) > getTimeInMinutes(selectedFilters.timeRange.max)
  ) {
    // Swap min and max if min is greater than max
    const temp = selectedFilters.timeRange.min
    selectedFilters.timeRange.min = selectedFilters.timeRange.max
    selectedFilters.timeRange.max = temp
  }
  emitFilterChange()
}

const getTimeInMinutes = (timeString: string): number => {
  const hours = timeString.includes('hour') ? parseInt(timeString) : 0
  const minutes = timeString.includes('minutes') ? parseInt(timeString) : 0
  return hours * 60 + minutes
}

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

const clearAllFilters = () => {
  selectedFilters.courses = []
  selectedFilters.difficulties = []
  selectedFilters.timeRange.min = null
  selectedFilters.timeRange.max = null
  emitFilterChange()
}
</script>

<style scoped>
:deep(.p-multiselect) {
  width: 100%;
}

:deep(.p-tag) {
  padding: 0.25rem 0.75rem;
}

:deep(.p-tag-icon) {
  margin-left: 0.5rem;
  cursor: pointer;
}

.filter-section {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
}

.filter-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
</style>
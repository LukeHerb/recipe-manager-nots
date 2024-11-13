<template>
  <div class="flex flex-col gap-6 bg-white p-8 pb-2 rounded-xl">
    <!-- Image Upload Section -->
    <div class="flex flex-col gap-4">
      <div class="relative h-[300px] w-full rounded-xl overflow-hidden">
        <img
          v-if="link"
          :src="link"
          :alt="recipe.name"
          class="w-full h-full object-cover"
        />
        <img
          v-if="recipe.imageLinks && recipe.imageLinks[0]"
          :src="recipe.imageLinks[0]"
          :alt="recipe.name"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="w-full h-full bg-gray-200 flex justify-center items-center"
        >
          <i class="fa-solid fa-image text-9xl text-gray-400"></i>
        </div>
        <div class="absolute bottom-4 right-4">
          <input
            type="file"
            @change="handleFileUpload"
            class="hidden"
            id="imageUpload"
            accept="image/*"
          />
          <label
            for="imageUpload"
            class="bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <i class="fa-solid fa-camera text-[#bca067] text-xl"></i>
          </label>
        </div>
      </div>
    </div>

    <!-- Recipe Name -->
    <FloatLabel variant="on" class="w-full">
      <InputText v-model="recipe.name" autocomplete="off" class="w-full" />
      <label>Recipe Name</label>
    </FloatLabel>

    <!-- Course and Difficulty Selection -->
    <div class="card flex justify-between gap-4">
      <FloatLabel variant="on" class="w-full">
        <Select v-model="recipe.course" :options="courses" class="w-full" />
        <label>Course</label>
      </FloatLabel>
      <FloatLabel variant="on" class="w-full">
        <Select
          v-model="recipe.difficulty"
          :options="difficulties"
          class="w-full"
        />
        <label>Difficulty</label>
      </FloatLabel>
    </div>

    <!-- Time and Servings Selection -->
    <div class="card flex justify-center gap-4">
      <FloatLabel variant="on" class="w-full">
        <Select v-model="recipe.time" :options="times" class="w-full" />
        <label>Cooking Time</label>
      </FloatLabel>
      <FloatLabel variant="on" class="w-full">
        <Select
          v-model="recipe.numServings"
          :options="servings"
          class="w-full"
        />
        <label>Number of Servings</label>
      </FloatLabel>
    </div>

    <!-- Recipe Description -->
    <FloatLabel variant="on">
      <Textarea v-model="recipe.description" rows="5" class="w-full" />
      <label>Description</label>
    </FloatLabel>

    <!-- Ingredients and Instructions Section -->
    <div class="flex w-full">
      <!-- Ingredients Column -->
      <div
        class="flex flex-col gap-6 w-6/12 bg-white border-dashed border-r-2 pr-4 border-slate-400"
      >
        <div class="flex flex-col gap-4">
          <FloatLabel variant="on" class="w-full">
            <InputText
              v-model="inputIngredient"
              autocomplete="off"
              class="w-full"
              @keydown.enter="addIngredient"
            />
            <label>Add Ingredient</label>
          </FloatLabel>
        </div>
        <ul class="list-small-disc list-inside">
          <li
            v-for="(ingredient, index) in recipe.ingredients"
            :key="ingredient"
          >
            <span
              class="text-base leading-7 pl-5 tracking-wider font-light hover:line-through cursor-pointer"
              @click="removeIngredient(index)"
            >
              {{ ingredient }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Instructions Column -->
      <div class="flex flex-col gap-6 pl-4 w-6/12 bg-white rounded-xl">
        <FloatLabel variant="on" class="w-full">
          <InputText
            v-model="inputInstruction"
            class="w-full"
            @keydown.enter="addInstruction"
          />
          <label>{{ `Step ${currIndex}` }}</label>
        </FloatLabel>
        <ol class="list-decimal list-inside">
          <li
            v-for="(instruction, index) in recipe.instructions"
            :key="instruction"
          >
            <span
              class="text-base leading-7 pl-5 tracking-wider font-light hover:line-through cursor-pointer"
              @click="removeInstruction(index)"
            >
              {{ instruction }}
            </span>
          </li>
        </ol>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-4 mt-4">
      <Button
        label="Cancel"
        class="p-button-outlined"
        @click="$emit('cancel')"
      />
      <Button
        :label="isEditMode ? 'Update' : 'Save'"
        class="p-button-primary"
        :loading="saving"
        @click="saveRecipe"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import FloatLabel from 'primevue/floatlabel'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { uploadData, getUrl } from 'aws-amplify/storage'

// Props and Emits
const props = defineProps({
  initialRecipe: Object,
  isEditMode: Boolean,
  courses: Array,
  difficulties: Array,
  times: Array,
  servings: Array,
  recipeID: String,
})
const emit = defineEmits(['save', 'cancel'])

// Form state and local variables
const recipe = ref({ ...props.initialRecipe })
const inputIngredient = ref('')
const inputInstruction = ref('')
const currIndex = ref(1)
const saving = ref(false)
const toast = useToast()
const link = ref('')

// Watch prop changes
watch(
  () => props.initialRecipe,
  (newRecipe) => {
    recipe.value = { ...newRecipe }
  }
)

function validateRecipe(): boolean {
  if (!recipe.value.name.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Missing Information',
      detail: 'Please enter a recipe name',
      life: 3000,
    })
    return false
  }

  if (!recipe.value.ingredients.length) {
    toast.add({
      severity: 'warn',
      summary: 'Missing Information',
      detail: 'Please add at least one ingredient',
      life: 3000,
    })
    return false
  }

  if (!recipe.value.instructions.length) {
    toast.add({
      severity: 'warn',
      summary: 'Missing Information',
      detail: 'Please add at least one instruction',
      life: 3000,
    })
    return false
  }

  return true
}

// Image handling
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]

    try {
      const result = await uploadData({
        path: `recipe-manager/images/${props.recipeID}/${file.name}`,
        data: file,
        options: {
          bucket: 'recipe-manager-bucket',
        },
      }).result

      const getLink = await getUrl({
        path: `recipe-manager/images/${props.recipeID}/${file.name}`,
        options: {
          bucket: 'recipe-manager-bucket',
          // url expiration time in seconds.
          expiresIn: 300,
        },
      })
      recipe.value.imageFileNames.push(file.name)
      link.value = getLink.url.toString()
    } catch (error) {
      console.error('Upload failed:', error)
    }
  } else {
    console.error('No file selected')
  }
}

const saveRecipe = () => {
  if (!validateRecipe()) return
  saving.value = true
  emit('save', { ...recipe.value })
  saving.value = false
}

const addIngredient = () => {
  recipe.value.ingredients.push(inputIngredient.value)
  inputIngredient.value = ''
}

const addInstruction = () => {
  recipe.value.instructions.push(inputInstruction.value)
  inputInstruction.value = ''
  currIndex.value++
}

const removeIngredient = (index: number) => {
  recipe.value.ingredients.splice(index, 1)
}

const removeInstruction = (index: number) => {
  recipe.value.instructions.splice(index, 1)
  currIndex.value--
}
</script>

<style scoped>
/* Container styling */
.wrapper {
  background-image: url('../assets/create-recipe.jpg');
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  padding: 20px;
}

/* List styling */
.list-small-disc {
  list-style-type: disc;
  font-size: 0.5rem;
}

/* Loading animation */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* PrimeVue component customization */
:deep(.p-inputtext) {
  font-family: 'Montserrat', sans-serif;
  border-color: rgba(188, 160, 103, 0.3);
  transition: all 0.2s ease;
}

:deep(.p-inputtext:hover) {
  border-color: #bca067;
}

:deep(.p-inputtext:focus) {
  border-color: #bca067 !important;
  box-shadow: 0 0 0 2px rgba(188, 160, 103, 0.2) !important;
}

:deep(.p-float-label input:focus ~ label),
:deep(.p-float-label textarea:focus ~ label) {
  color: #bca067 !important;
}

/* Select component styling */
:deep(.p-dropdown) {
  width: 100%;
  border-color: rgba(188, 160, 103, 0.3);
}

:deep(.p-dropdown:not(.p-disabled).p-focus) {
  border-color: #bca067;
  box-shadow: 0 0 0 1px #bca067;
}

:deep(.p-dropdown-panel) {
  border-color: #bca067;
}

:deep(.p-dropdown-item.p-highlight) {
  background-color: rgba(188, 160, 103, 0.1) !important;
  color: #bca067 !important;
}

/* Textarea styling */
:deep(.p-textarea) {
  width: 100%;
  font-family: 'Montserrat', sans-serif;
}

/* Button styling */
:deep(.p-button) {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.2s ease;
}

:deep(.p-button-primary) {
  background-color: #bca067;
  border-color: #bca067;
  color: white;
}

:deep(.p-button-primary:hover) {
  background-color: #ab8f56 !important;
  border-color: #ab8f56 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(188, 160, 103, 0.3);
}

:deep(.p-button-outlined) {
  color: #bca067;
  border-color: #bca067;
  background-color: transparent;
}

:deep(.p-button-outlined:hover) {
  background-color: rgba(188, 160, 103, 0.1) !important;
  border-color: #ab8f56 !important;
  color: #ab8f56 !important;
  transform: translateY(-2px);
}

:deep(.p-button:active) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(188, 160, 103, 0.2);
}

/* Image upload styling */
input[type='file'] {
  opacity: 0;
  position: absolute;
  z-index: -1;
}

.image-upload-label {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: white;
  color: #bca067;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-upload-label:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Ingredient and instruction items styling */
.list-inside span {
  transition: all 0.2s ease;
}

.list-inside span:hover {
  color: #dc3545;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .grid {
    width: 80%;
  }
}

@media (max-width: 768px) {
  .grid {
    width: 90%;
  }

  .flex.w-full {
    flex-direction: column;
  }

  .flex.w-full > div {
    width: 100%;
    border-right: none;
    padding-right: 0;
  }

  .flex.w-full > div:first-child {
    border-bottom: 2px dashed rgba(188, 160, 103, 0.3);
    padding-bottom: 2rem;
    margin-bottom: 2rem;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Theme color variables */
:root {
  --gold-color: #bca067;
  --gold-hover: #ab8f56;
  --gold-light: rgba(188, 160, 103, 0.1);
  --background-color: #ebe7e4;
}

/* Toast customization */
:deep(.p-toast) {
  font-family: 'Montserrat', sans-serif;
}

:deep(.p-toast-message) {
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

:deep(.p-toast-icon-close) {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

:deep(.p-toast-icon-close:hover) {
  opacity: 1;
}
</style>

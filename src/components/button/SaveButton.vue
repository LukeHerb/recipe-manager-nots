<template>
  <div class="absolute top-4 right-4 z-50">
    <Button
      :icon="isSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'"
      class="p-button-rounded p-button-text bg-white shadow-lg"
      style="width: 2.75rem; height: 2.75rem"
      aria-label="Save"
      @click="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import { generateClient } from 'aws-amplify/data'
import { type Schema } from '../../../amplify/data/resource'
const client = generateClient<Schema>()

const props = defineProps<{
  recipeId: string
  userId: string
  savedBy: Array<string>
}>()

const isSaved = ref(false)

async function handleSave() {
  // If the recipe is already saved, remove the user id from the savedBy array
  if (isSaved.value) {
    const recipe = {
      id: props.recipeId,
      savedBy: props.savedBy.filter((id) => id !== props.userId),
    }
    await client.models.Recipe.update(recipe)
    isSaved.value = !isSaved.value
    console.log('recipe unsaved')
    console.log(recipe)
    return
  }

  // update the recipe to include the user id in the savedBy array
  const recipe = {
    id: props.recipeId,
    savedBy: props.userId,
  }
  await client.models.Recipe.update(recipe)
  isSaved.value = !isSaved.value

  console.log('recipe saved')
  console.log(recipe)
}

onMounted(async () => {
  try {
    // Fetch the current recipe
    const response = await client.models.Recipe.list({
      filter: { id: { eq: props.recipeId } },
    })
    const recipe = response.data[0]

    // Check if the user has saved the recipe
    isSaved.value = recipe.savedBy.includes(props.userId)
  } catch (error) {
    console.error(error)
  }
})
</script>

<style scoped>
/* Menu styling */
:deep(.p-menu) {
  background: white;
  border: 2px solid rgba(188, 160, 103, 0.2);
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  min-width: 12rem;
  z-index: 1000;
}

:deep(.p-menuitem-link) {
  padding: 0.75rem 1rem;
  color: #2c3e50;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

:deep(.p-menuitem-link:hover) {
  background-color: rgba(188, 160, 103, 0.1);
}

:deep(.p-menuitem-icon) {
  color: #bca067;
  margin-right: 0.75rem;
  font-size: 1rem;
}

/* Menu button styling */
:deep(.p-button.p-button-text) {
  padding: 0.5rem;
  background: white;
  border: 2px solid #bca067;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

:deep(.p-button.p-button-text:hover) {
  background: white;
  border-color: #bca067;
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

:deep(.p-button.p-button-text .p-button-icon) {
  font-size: 1.5rem;
  color: #bca067;
  transition: color 0.2s ease;
}

:deep(.p-button.p-button-text:hover .p-button-icon) {
  color: #9a825a;
}

/* Dialog styling */
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

/* Dialog input styling */
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
</style>

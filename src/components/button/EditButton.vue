<template>
  <div class="z-50">
    <!-- Menu Trigger Button -->
    <Button
        icon="fa-solid fa-ellipsis-vertical"
        @click="menu.toggle($event)"
        class="p-button-rounded p-button-text bg-white shadow-lg"
        style="width: 2.75rem; height: 2.75rem"
        aria-label="Menu"
    />
    <Menu ref="menu" :model="menuItems" :popup="true" />

    <!-- Delete Confirmation Dialog -->
    <Dialog
        v-model:visible="showDeleteDialog"
        modal
        header="Delete Recipe"
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
              This will permanently delete the recipe "{{ recipeName }}" and all
              its associated reviews and images.
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
              label="Delete Recipe"
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
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Menu from 'primevue/menu'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../../amplify/data/resource'
import { remove } from 'aws-amplify/storage'

const props = defineProps<{
  recipeId: string
  recipeName: string
  images: string[]
}>()

const emit = defineEmits<{
  (e: 'deleted'): void
}>()

// Initialize client and utilities
const client = generateClient<Schema>()
const router = useRouter()
const toast = useToast()

// Component state
const menu = ref()
const showDeleteDialog = ref(false)
const showDeleteError = ref(false)
const deleteConfirmation = ref('')
const deleting = ref(false)

// Menu items configuration
const menuItems = ref([
  {
    label: 'Edit Recipe',
    icon: 'fa-solid fa-pen-to-square',
    command: () => router.push(`/recipe/${props.recipeId}/edit`),
  },
  {
    label: 'Delete Recipe',
    icon: 'fa-solid fa-trash',
    class: 'text-red-600',
    command: () => {
      showDeleteDialog.value = true
      deleteConfirmation.value = ''
      showDeleteError.value = false
    },
  },
])

// Delete handlers
function cancelDelete() {
  showDeleteDialog.value = false
  deleteConfirmation.value = ''
  showDeleteError.value = false
}

async function confirmDelete() {
  if (deleteConfirmation.value !== 'delete') {
    showDeleteError.value = true
    return
  }

  deleting.value = true
  try {
    // Delete the recipe
    await client.models.Recipe.delete({ id: props.recipeId })

    // Delete associated images
    await remove({
      path: `recipe-manager/images/${props.recipeId}/${props.images[0]}`,
    })

    // Delete associated reviews
    const reviewsResponse = await client.models.Review.list({
      filter: { recipeId: { eq: props.recipeId } },
    })

    if (reviewsResponse.data.length > 0) {
      await Promise.all(
        reviewsResponse.data.map((review) =>
          client.models.Review.delete({ id: review.id })
        )
      )
    }

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Recipe deleted successfully',
      life: 3000,
    })

    emit('deleted')
    router.push('/')
  } catch (error) {
    console.error('Error deleting recipe:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete recipe',
      life: 3000,
    })
  } finally {
    deleting.value = false
    showDeleteDialog.value = false
    deleteConfirmation.value = ''
    showDeleteError.value = false
  }
}
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

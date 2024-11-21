<template>
  <div class="z-50">
    <Button
        icon="fa-solid fa-print"
        class="p-button-rounded p-button-text bg-white shadow-lg"
        style="width: 2.75rem; height: 2.75rem"
        aria-label="Print"
        @click="printRecipe"
    />
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'

const props = defineProps<{
  name: string
  description: string
  createdBy: string
  course: string
  time: string
  numServings: string
  difficulty: string
  ingredients: string[]
  instructions: string[]
  createdAt: string
}>()

// Function to format date for printing
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Main print function
function printRecipe() {
  // Create a new window for printing
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  // Create the print content with styling
  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${props.name} - Recipe</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            line-height: 1.6;
          }
          h1 {
            color: #2c3e50;
            border-bottom: 2px solid #bca067;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .metadata {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin: 20px 0;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
          }
          .section {
            margin: 30px 0;
          }
          .section-title {
            color: #2c3e50;
            font-size: 1.5em;
            margin-bottom: 15px;
          }
          ul, ol {
            padding-left: 20px;
          }
          li {
            margin-bottom: 8px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 0.9em;
            color: #666;
          }
          @media print {
            body {
              margin: 0;
              padding: 15px;
            }
          }
        </style>
      </head>
      <body>
        <h1>${props.name}</h1>

        <p class="description">${props.description}</p>

        <div class="metadata">
          <div>Course: ${props.course}</div>
          <div>Difficulty: ${props.difficulty}</div>
          <div>Time: ${props.time}</div>
          <div>Servings: ${props.numServings}</div>
        </div>

        <div class="section">
          <h2 class="section-title">Ingredients</h2>
          <ul>
            ${props.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
          </ul>
        </div>

        <div class="section">
          <h2 class="section-title">Instructions</h2>
          <ol>
            ${props.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
          </ol>
        </div>

        <div class="footer">
          <p>Recipe by ${props.createdBy}</p>
          <p>Created on ${formatDate(props.createdAt)}</p>
          <p>Printed from Recipe Tutorial</p>
        </div>
      </body>
    </html>
  `

  // Write content to the new window
  printWindow.document.write(content)

  // Wait for content to load then print
  printWindow.document.close()
  printWindow.onload = function() {
    printWindow.print()
    // Close the window after printing (some browsers may do this automatically)
    setTimeout(() => {
      printWindow.close()
    }, 250)
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

/* Accessibility - Focus States */
:deep(.p-button:focus) {
  outline: 2px solid #bca067;
  outline-offset: 2px;
}

/* Reduce motion preferences */
@media (prefers-reduced-motion: reduce) {
  :deep(.p-button),
  :deep(.p-button:hover),
  :deep(.p-menuitem-link) {
    transition: none !important;
    transform: none !important;
  }
}
</style>
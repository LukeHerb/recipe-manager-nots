<template>
  <div class="wrapper">
    <main
      class="flex flex-col m-auto justify-center content-center items-center p-8"
    >
      <div class="grid gap-6 grid-cols-1 w-6/12">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-6 bg-white p-8 pb-2 rounded-xl">
            <div><input type="file" @change="handleFileUpload" /></div>
            <div>
              <button style="margin: 10px" @click="listFiles">
                Show Images
              </button>
            </div>
            <FloatLabel variant="on" class="w-full">
              <InputText
                id="on_label"
                v-model="recipe.name"
                autocomplete="off"
                class="w-full"
              />
              <label for="on_label">Recipe Name</label>
            </FloatLabel>
            <div class="card flex justify-between gap-4">
              <FloatLabel variant="on" class="w-full">
                <Select
                  v-model="recipe.course"
                  :options="courses"
                  class="w-full"
                />
                <label for="on_label">Course</label>
              </FloatLabel>
              <FloatLabel variant="on" class="w-full">
                <Select
                  v-model="recipe.difficulty"
                  :options="difficulties"
                  class="w-full"
                />
                <label for="on_label">Difficulty</label>
              </FloatLabel>
            </div>
            <div class="card flex justify-center gap-4">
              <FloatLabel variant="on" class="w-full">
                <Select v-model="recipe.time" :options="times" class="w-full" />
                <label for="on_label">Cooking Time</label>
              </FloatLabel>
              <FloatLabel variant="on" class="w-full">
                <Select
                  v-model="recipe.numServings"
                  :options="servings"
                  class="w-full"
                />
                <label for="on_label">Number of Servings</label>
              </FloatLabel>
            </div>
            <FloatLabel variant="on">
              <Textarea
                id="over_label"
                v-model="recipe.description"
                rows="5"
                class="w-full"
              />
              <label for="on_label">Description</label>
            </FloatLabel>
            <div class="flex w-full">
              <div
                class="flex flex-col gap-6 w-6/12 bg-white border-dashed border-r-2 pr-4 border-slate-400"
              >
                <div class="flex flex-col gap-4">
                  <div class="flex gap-3">
                    <FloatLabel variant="on" class="w-full">
                      <InputText
                        id="on_label"
                        v-model="inputIngredient"
                        autocomplete="off"
                        class="w-full"
                        v-on:submit="addIngredient"
                        @keydown.enter="addIngredient"
                      />
                      <label for="on_label">Ingredient</label>
                    </FloatLabel>
                  </div>
                </div>
                <ul class="list-small-disc list-inside">
                  <li
                    v-for="(ingredient, index) in recipe.ingredients"
                    :key="ingredient"
                  >
                    <span
                      class="text-base leading-7 pl-5 tracking-wider font-light hover:line-through cursor-pointer"
                      @click="removeIngredient(index)"
                      >{{ ingredient }}</span
                    >
                  </li>
                </ul>
              </div>
              <div class="flex flex-col gap-6 pl-4 w-6/12 bg-white rounded-xl">
                <FloatLabel variant="on" class="w-full">
                  <InputText
                    id="on_label"
                    v-model="inputInstruction"
                    rows="5"
                    class="w-full"
                    v-on:submit="addInstruction"
                    @keydown.enter="addInstruction"
                  />
                  <label for="on_label">{{ `Step ${currIndex}` }}</label>
                </FloatLabel>
                <ol class="list-decimal list-inside">
                  <li
                    v-for="(instruction, index) in recipe.instructions"
                    :key="instruction"
                  >
                    <span
                      class="text-base leading-7 pl-5 tracking-wider font-light hover:line-through cursor-pointer"
                      @click="removeInstruction(index)"
                      >{{ instruction }}</span
                    >
                  </li>
                </ol>
              </div>
            </div>
            <Button
              label="Submit"
              class="p-button-primary mt-4"
              @click="addRecipe"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import RadioButton from 'primevue/radiobutton'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import FloatLabel from 'primevue/floatlabel'
import Button from 'primevue/button'
import { generateClient } from 'aws-amplify/data'
import { type Schema } from '../../amplify/data/resource'
import { getCurrentUser } from 'aws-amplify/auth'
import { uploadData, list, getUrl } from 'aws-amplify/storage'

const currentUser = ref()

const client = generateClient<Schema>()

onMounted(async () => {
  currentUser.value = await getCurrentUser()
  console.log(currentUser.value)
})

const recipe = ref<{
  name: string
  course: string
  time: string
  numServings: string
  difficulty: string
  description: string
  ingredients: string[]
  instructions: string[]
}>({
  name: '',
  course: '',
  time: '',
  numServings: '',
  difficulty: '',
  description: '',
  ingredients: [],
  instructions: [],
})

const inputIngredient = ref('')
const inputInstruction = ref('')
const currIndex = ref(1)
const imgLink = ref()

const times = [
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
  '8 hours',
  '8 hours 30 minutes',
  '9 hours',
  '9 hours 30 minutes',
  '10 hours',
  '10 hours 30 minutes',
  '11 hours',
  '11 hours 30 minutes',
  '12 hours',
  '12 hours 30 minutes',
  '13 hours',
  '13 hours 30 minutes',
  '14 hours',
  '14 hours 30 minutes',
  '15 hours',
  '15 hours 30 minutes',
  '16 hours',
  '16 hours 30 minutes',
  '17 hours',
  '17 hours 30 minutes',
  '18 hours',
  '18 hours 30 minutes',
  '19 hours',
  '19 hours 30 minutes',
  '20 hours',
  '20 hours 30 minutes',
  '21 hours',
  '21 hours 30 minutes',
  '22 hours',
  '22 hours 30 minutes',
  '23 hours',
  '23 hours 30 minutes',
  '24 hours',
  '24+ hours',
]

const servings = [
  '1 serving',
  '2 servings',
  '3 servings',
  '4 servings',
  '5 servings',
  '6 servings',
  '7 servings',
  '8 servings',
  '9 servings',
  '10 servings',
  '10+ servings',
]

const courses = [
  'Appetizer',
  'Entree',
  'Dessert',
  'Side Dish',
  'Drink',
  'Other',
]

const difficulties = ['Easy', 'Medium', 'Hard']

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

const addRecipe = async () => {
  client.models.Recipe.create({
    name: recipe.value.name,
    description: recipe.value.description,
    time: recipe.value.time,
    course: recipe.value.course,
    numServings: recipe.value.numServings,
    difficulty: recipe.value.difficulty,
    ingredients: recipe.value.ingredients,
    instructions: recipe.value.instructions,
    createdBy: currentUser.value.signInDetails.loginId,
    owner: currentUser.value.username,
  }).then(() => {
    console.log('Recipe created successfully')
  })
}

const listFiles = async () => {
  const result = await list({
    path: 'recipe-manager/images/',
    // Alternatively, path: ({identityId}) => `album/{identityId}/photos/`,
    options: {
      bucket: 'recipe-manager-bucket',
      listAll: true,
    },
  })

  console.log(`recipe images: ${JSON.stringify(result)}`)
  imgLink.value = []
  result.items.forEach(async (item) => {
    const link = await getUrl({
      path: item.path,
      options: {
        bucket: 'recipe-manager-bucket',
        // url expiration time in seconds.
        expiresIn: 300,
      },
    })
    imgLink.value.push({ url: link.url.toString(), path: link.url.pathname })
    console.log(`temp url: ${link.url.toString()}`)
  })
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    console.log(`Uploading file: ${file.name}`)

    try {
      const result = uploadData({
        path: `recipe-manager/images/${file.name}`,
        data: file,
        options: {
          bucket: 'recipe-manager-bucket',
        },
      })
      console.log(result)

      console.log(`Upload successful: ${JSON.stringify(result)}`)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  } else {
    console.error('No file selected')
  }
}
</script>

<style scoped>
.list-small-disc {
  list-style-type: disc;
  font-size: 0.5rem;
}

.wrapper {
  background-image: url('../assets/create-recipe.jpg');
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  padding: 20px;
}
</style>

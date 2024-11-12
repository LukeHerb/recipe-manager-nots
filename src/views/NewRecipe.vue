<template>
  <div class="wrapper">
    <main
      class="flex flex-col m-auto justify-center content-center items-center p-8"
    >
      <div class="grid gap-6 grid-cols-1 w-6/12">
        <RecipeForm
          :initialRecipe="recipe"
          :isEditMode="false"
          :courses="courses"
          :difficulties="difficulties"
          :times="times"
          :servings="servings"
          @save="handleSave"
          @cancel="handleCancel"
          :recipeID="recipe.id"
        />
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
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'vue-router'
import RecipeForm from '../components/recipe/RecipeForm.vue'

const router = useRouter()

const currentUser = ref()

const client = generateClient<Schema>()

onMounted(async () => {
  currentUser.value = await getCurrentUser()
  console.log(currentUser.value)
})

const recipe = ref<{
  id: string
  name: string
  course: string
  time: string
  numServings: string
  difficulty: string
  description: string
  ingredients: string[]
  instructions: string[]
  imageFileNames: string[]
}>({
  id: uuidv4(),
  name: '',
  course: '',
  time: '',
  numServings: '',
  difficulty: '',
  description: '',
  ingredients: [],
  instructions: [],
  imageFileNames: [],
})

const inputIngredient = ref('')
const inputInstruction = ref('')
const currIndex = ref(1)
const link = ref()

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
    id: recipe.value.id,
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
    imageFileNames: recipe.value.imageFileNames,
  }).then(() => {
    router.push('/')
  })
}
const handleSave = async (newRecipe) => {
  try {
    // Create the new recipe using client
    await client.models.Recipe.create({
      ...newRecipe,
      id: recipe.value.id,
      createdBy: currentUser.value.signInDetails.loginId,
      owner: currentUser.value.username,
    })

    // Redirect to the home page upon success
    router.push('/')
  } catch (error) {
    console.error('Failed to create recipe:', error)
  }
}

const handleCancel = () => {
  router.push('/')
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    recipe.value.id = uuidv4()
    const file = target.files[0]
    console.log(`Uploading file: ${file.name}`)

    try {
      const result = await uploadData({
        path: `recipe-manager/images/${recipe.value.id}/${file.name}`,
        data: file,
        options: {
          bucket: 'recipe-manager-bucket',
        },
      }).result
      console.log(JSON.stringify(result))

      console.log(`Upload successful: ${JSON.stringify(result)}`)
      const getLink = await getUrl({
        path: `recipe-manager/images/${recipe.value.id}/${file.name}`,
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

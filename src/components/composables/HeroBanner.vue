<!-- src/components/composables/HeroBanner.vue -->
<template>
  <section class="relative w-full h-[600px] overflow-hidden wrapper">
    <!-- Background Image Container -->
    <div class="absolute inset-0">
      <!-- Gradient Overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"
        aria-hidden="true"
      ></div>
    </div>

    <!-- Content Container -->
    <div class="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col justify-center h-full">
        <!-- Hero Text Content -->
        <div class="max-w-3xl">
          <!-- Main Heading -->
          <h1
            class="font-playfair text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight"
          >
            Discover & Share Your
            <span class="text-[#bca067]">Culinary Journey</span>
          </h1>

          <!-- Subheading -->
          <p
            class="font-montserrat text-lg md:text-xl text-gray-200 mb-8 leading-relaxed"
          >
            Join our community of food enthusiasts. Share your favorite recipes,
            discover new dishes, and learn from experienced home chefs.
          </p>

          <!-- Call to Action Buttons -->
          <div class="flex flex-wrap gap-4">
            <button
              @click="$router.push('/addRecipe')"
              class="bg-[#bca067] hover:bg-[#ab8f56] text-white font-montserrat px-8 py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
            >
              Share Recipe
            </button>
            <button
              @click="handleBrowseClick"
              class="border-2 border-[#bca067] text-white hover:bg-[#bca067]/10 font-montserrat px-8 py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
            >
              Browse Recipes
            </button>
          </div>
        </div>

        <!-- Recipe Statistics -->
        <div class="absolute bottom-8 right-8">
          <div class="flex gap-8">
            <div
              v-for="stat in statistics"
              :key="stat.label"
              class="text-center"
            >
              <p class="text-[#bca067] font-playfair text-4xl font-bold mb-2">
                <span ref="counterRefs" class="counter-value">{{
                  stat.displayValue
                }}</span>
              </p>
              <p
                class="text-white font-montserrat text-sm uppercase tracking-wider"
              >
                {{ stat.label }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../../amplify/data/resource'

// Initialize router and API client
const router = useRouter()
const client = generateClient<Schema>()

// Define emits
const emit = defineEmits(['scroll-to-search'])

// Handle Browse Recipes button click
const handleBrowseClick = () => {
  if (window.location.pathname === '/') {
    emit('scroll-to-search')
  } else {
    router.push('/').then(() => {
      setTimeout(() => {
        emit('scroll-to-search')
      }, 100)
    })
  }
}

// Interface for statistics
interface Statistic {
  label: string
  value: number
  displayValue: number
  startValue: number
  endValue: number
}

// Initialize statistics with default values
const statistics = ref<Statistic[]>([
  {
    label: 'Active Users',
    value: 0,
    displayValue: 0,
    startValue: 0,
    endValue: 0,
  },
  {
    label: 'Recipes Shared',
    value: 0,
    displayValue: 0,
    startValue: 0,
    endValue: 0,
  },
  { label: 'Reviews', value: 0, displayValue: 0, startValue: 0, endValue: 0 },
])

// Animation configuration
const ANIMATION_DURATION = 2000 // 2 seconds
const FRAME_RATE = 60
const FRAMES = ANIMATION_DURATION / (1000 / FRAME_RATE)

// Easing function for smooth animation
function easeOutQuart(x: number): number {
  return 1 - Math.pow(1 - x, 4)
}

// Animate counter function
function animateCounter(stat: Statistic) {
  let frame = 0
  const animate = () => {
    if (frame <= FRAMES) {
      const progress = frame / FRAMES
      const easedProgress = easeOutQuart(progress)
      const currentValue = Math.round(
        stat.startValue + (stat.endValue - stat.startValue) * easedProgress
      )
      stat.displayValue = currentValue
      frame++
      requestAnimationFrame(animate)
    }
  }
  animate()
}

// Fetch statistics data
const fetchStatistics = async () => {
  try {
    // Fetch total recipes
    const recipesResponse = await client.models.Recipe.list()
    const totalRecipes = recipesResponse.data.length

    // Fetch total reviews
    const reviewsResponse = await client.models.Review.list()
    const totalReviews = reviewsResponse.data.length

    // Get unique users
    const recipeCreators = new Set(
      recipesResponse.data.map((recipe) => recipe.owner)
    )
    const reviewers = new Set(
      reviewsResponse.data.map((review) => review.owner)
    )
    const uniqueUsers = new Set([...recipeCreators, ...reviewers])

    // Update statistics with new values and trigger animations
    statistics.value = [
      {
        label: 'Active Users',
        value: uniqueUsers.size,
        displayValue: 0,
        startValue: 0,
        endValue: uniqueUsers.size,
      },
      {
        label: 'Recipes Shared',
        value: totalRecipes,
        displayValue: 0,
        startValue: 0,
        endValue: totalRecipes,
      },
      {
        label: 'Reviews',
        value: totalReviews,
        displayValue: 0,
        startValue: 0,
        endValue: totalReviews,
      },
    ]

    // Start animations
    statistics.value.forEach((stat) => {
      animateCounter(stat)
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchStatistics()
})
</script>

<style scoped>
/* Hero Section Styles */
.wrapper {
  background: url('../../assets/hero-image.jpeg');
  background-size: cover;
  background-position: center;
}
/* Hero Section Animations */
section {
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Button styling */
button {
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
}

/* Image optimization */
img {
  -webkit-font-smoothing: antialiased;
}

/* Text shadow for better readability */
h1,
p {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Counter animation styling */
.counter-value {
  display: inline-block;
  transition: all 0.1s ease-out;
}

/* Focus states for accessibility */
button:focus {
  outline: 2px solid #bca067;
  outline-offset: 2px;
}

/* Reduce motion if user prefers */
@media (prefers-reduced-motion: reduce) {
  section,
  button,
  .counter-value {
    animation: none;
    transition: none;
  }
}

/* Mobile optimization */
@media (max-width: 640px) {
  section {
    height: 500px;
  }

  h1 {
    font-size: 2.5rem;
    line-height: 1.2;
  }

  .counter-value {
    font-size: 1.875rem;
  }
}

/* Print styles */
@media print {
  section {
    height: auto;
  }

  button {
    display: none;
  }
}
</style>

<script setup>
import Header from './components/Header.vue';
import Steps from './components/Steps.vue';

import DragFile from './views/DragFile.vue'
import Review from './views/Review.vue'

import { ref, computed } from 'vue'
// import Home from './Home.vue'
// import Review from './Views/Review.vue'

const routes = {
  '/': DragFile,
  '/review': Review
}

const currentPath = ref(window.location.hash)

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
  console.log("at here now: "+currentPath.value)
})

const currentView = computed(() => {
  const path = currentPath.value.slice(1) || '/';
  const view = routes[path.split('?')[0]]; // Get the path without query parameters
  return view || NotFound;
});

// const currentLanguage = computed(() => {
//   const urlParams = new URLSearchParams(currentPath.value.split('?')[1]);
//   return urlParams.get('lang');
// });

</script>

<template>
  <link rel="stylesheet" href="https://at.alicdn.com/t/c/font_4585610_7vp1too427h.css">
  <Header />
  <Steps />
  <div class="container">
        <div class="muted-sect">
            <!-- <component :is="currentView" :selectedLanguage="currentLanguage"/> -->
            <component :is="currentView"/>
        </div>
    </div>

</template>

<style scoped>
.container{
    padding: 1rem 4rem;
}
.muted-sect{
    background-color: #F0F2F5;
    padding: 2rem;
    border-radius: 10px;
}
</style>

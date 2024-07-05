<script setup>
import Header from './components/Header.vue';
import Steps from './components/Steps.vue';

import DragFile from './views/DragFile.vue'
import Review from './views/Review.vue'
import Translating from './views/Translating.vue'
import CodeCheck from './views/CodeCheck.vue'
import NotFound from './views/NotFound.vue'
import { GetSetup } from './utils/apiCalls';

import ProgressSpinner from 'primevue/progressspinner';

import { ref, computed, onMounted } from 'vue'
// import Home from './Home.vue'
// import Review from './Views/Review.vue'

const showSteps = ref(true);
const isLoading = ref(true);

const fileCnt = ref(0);
const userCnt = ref(0);
const appName = ref('');
const appLogo = ref('');


const gettingSetup = async () => {
  try {
    const data = await GetSetup();
    // console.log("setupTitle: ", data);
    fileCnt.value = data.totalFilesTranslated;
    userCnt.value = data.totalUser;
    appName.value = data.websiteName;
    appLogo.value = data.logoUrl;
    return data;
  } catch (error) {
    apiError.value = error.message;
    throw error;
  }
}

const routes = {
  '/': DragFile,
  '/review': Review,
  '/translating': Translating,
  '/codecheck': CodeCheck
}

const currentPath = ref(window.location.hash)

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
  // console.log("at here now: "+currentPath.value)
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
const firstPage = computed(()=>{
  console.log("at here now: " + currentPath.value);
  if (currentPath.value == '/' || currentPath.value == '' || currentPath.value == '#/'){
    showSteps.value = true;
  }
  else {
    showSteps.value = false;
  }
  return showSteps.value;
})


onMounted(async () => {
  
  await gettingSetup();
  isLoading.value = false;
  
});

</script>

<template>
  <div v-if="isLoading" class="loading">
    <div class="loadingScreen">
        <ProgressSpinner style="width: 20%; height: 20%" strokeWidth="3" fill="transparent" animationDuration="2s" aria-label="Custom ProgressSpinner" />
        <h1 class="loadingTitle">
          正在访问网页...
        </h1>
        <h3 class="notice">
            您访问的网页快要好了...
        </h3>
    </div>
  </div>
  <div v-else>
    <link rel="stylesheet" href="https://at.alicdn.com/t/c/font_4585610_7vp1too427h.css">
    <Header :userCount="userCnt" :fileCount="fileCnt" :appTitle="appName" :logoSrc="appLogo" />
    <Steps v-if="firstPage"/>
    <div class="container">
      <div class="muted-sect">
          <!-- <component :is="currentView" :selectedLanguage="currentLanguage"/> -->
          <component :is="currentView"/>
      </div>
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

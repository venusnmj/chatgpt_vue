<script setup>
import Header from './components/Header.vue';
import Steps from './components/Steps.vue';

import DragFile from './views/DragFile.vue'
import Review from './views/Review.vue'
import Translating from './views/Translating.vue'
import CodeCheck from './views/CodeCheck.vue'
import NotFound from './views/NotFound.vue'
import NotAvailable from './components/NotAvailable.vue';
import { GetSetup } from './utils/apiCalls';
import { fileAttr } from './shared/fileAttr.js';


import LoadingScreen from './components/LoadingScreen.vue';
import ProgressSpinner from 'primevue/progressspinner';


import { ref, computed, onMounted, watch } from 'vue'
// import Home from './Home.vue'
// import Review from './Views/Review.vue'

const showSteps = ref(true);
const isLoading = ref(true);
const toRetry = ref(false);

const fileCnt = ref(0);
const userCnt = ref(0);
const appName = ref('');
const appLogo = ref('');
const excludeFiles = ref([]);
const excludeFolders = ref([]);
const setupInfo = ref();

const apiError = ref(null);
const errorMessage = ref('');


const gettingSetup = async () => {
  try {
    const data = await GetSetup();
    // console.log("setupInfo: ", data);
    // setupInfo.value = data;
    fileAttr.setupData = data;
    console.log("setupData: ", data);

    fileCnt.value = data.totalFilesTranslated;
    userCnt.value = data.totalUser;
    appName.value = data.websiteName;
    appLogo.value = data.logoUrl;
    excludeFiles.value = data.excludedFileTypes;
    excludeFolders.value = data.excludedDirectories;
    return data;
  } catch (error) {
    console.log(error.message);
    apiError.value = error.message;
    toRetry.value = true;
    throw error;
  }
}

const testProxy = async () => {
  try {
    const response = await fetch('http://192.168.0.104:8080/public/website-info');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};




const routes = {
  '/': DragFile,
  '/review': Review,
  '/translating': Translating,
  '/codecheck': CodeCheck,
}

const currentPath = ref(window.location.hash.slice(1) || '/');

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash.slice(1) || '/';
});

const handleError = (value) => {
  toRetry.value = value;
}
const setErrorMsg = (value) => {
  errorMessage.value = value;
}

const currentView = computed(() => {
  const path = currentPath.value.split('?')[0]; // Get the path without query parameters
  const view = routes[path] || NotFound;
  return view;
});



// const currentLanguage = computed(() => {
//   const urlParams = new URLSearchParams(currentPath.value.split('?')[1]);
//   return urlParams.get('lang');
// });
const firstPage = computed(()=>{
  console.log("at here now: " + currentPath.value);
  if (currentPath.value === '/' || currentPath.value === '') {
    showSteps.value = true;
  }
  else {
    showSteps.value = false;
  }
  return showSteps.value;
})


onMounted(async () => {
  // testProxy();
  await gettingSetup();
  isLoading.value = false;

  window.onbeforeunload = function() { console.log('gobackhome') };


});

</script>

<template>
  <link rel="stylesheet" href="https://at.alicdn.com/t/c/font_4585610_gove3xs4qw.css">
  <!-- <div v-if="isLoading" class="loading">
    <div class="loadingScreen">
        <ProgressSpinner style="width: 20%; height: 20%" strokeWidth="3" fill="transparent" animationDuration="2s" aria-label="Custom ProgressSpinner" />
        <h1 class="loadingTitle">
          正在访问网页...
        </h1>
        <h3 class="notice">
            您访问的网页快要好了...
        </h3>
    </div>
  </div> -->
  <NotAvailable v-if="toRetry" :errorMsg="errorMessage"/>
  <LoadingScreen v-else-if="isLoading"/> 
  <div v-else class="fullPage">
    <Header :userCount="userCnt" :fileCount="fileCnt" :appTitle="appName" :logoSrc="appLogo" />
    <Steps v-if="firstPage"/>
    <div class="container">
      <div class="changing-sect">
          <!-- <component :is="currentView" :selectedLanguage="currentLanguage"/> -->
          <component :is="currentView" @errorBool="handleError" @errMsg="setErrorMsg"/>
      </div>
    </div>
  </div>

</template>

<style scoped>
.container{
    padding: 1rem 4rem;
}
.loading{
  width: 100vw;
  height: 100vh;
}

/* .muted-sect{
    background-color: #F0F2F5;
    padding: 2rem;
    border-radius: 10px;
} */
</style>

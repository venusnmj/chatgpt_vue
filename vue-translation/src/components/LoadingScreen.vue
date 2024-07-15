<script setup>
import ProgressSpinner from 'primevue/progressspinner';
// const props = defineProps({
//     isLoading: Boolean,
// })

</script>
<template>
    <div class="loading">
    <div class="loadingScreen">
        <ProgressSpinner style="width: 30%; height: 30%" strokeWidth="3" fill="transparent" animationDuration="2s" aria-label="Custom ProgressSpinner" />
        <h1 class="loadingTitle">
          正在访问网页...
        </h1>
        <h3 class="notice">
            您访问的网页快要好了...
        </h3>
    </div>
  </div>
</template>
<style scoped>
.loading{
  width: 100vw;
  height: 100vh;
}
.loadingScreen{
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    gap: 1rem;
    padding: 3rem;
}
h1.loadingTitle{
    font-size: 2rem;
}
h3.notice{
    font-size: 1.5rem;
}

</style>
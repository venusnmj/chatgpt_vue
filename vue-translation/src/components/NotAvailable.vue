<script setup>
import { onMounted, ref } from 'vue';
import { fileAttr } from '../shared/fileAttr.js';


const nextLinkRef = ref(null);

const props = defineProps({
    errorMsg: String,
});

onMounted(() => {
    fileAttr.prevPage = '/';
});

</script>

<template>
<div class="full-sect">
    <div class="central">
        <i class="iconfont icon-error-fill"></i>
        <h1>{{ errorMsg ? errorMsg : '非常抱歉，请找网络空间或稍后再试' }}</h1>
        <!-- <h3>请稍后再试</h3> -->
        <a ref="nextLinkRef" href="." >重新再试</a>
    </div>
</div>

</template>

<style scope>
.central{
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}
h1{
    font-size: 2rem;
}
.full-sect{
    /* background-color: #F0F2F5; */
    padding: 2rem;
    border-radius: 10px;
    width: 100%;
    height: 100vh;
}
i.icon-error-fill{
    font-size: 6rem;
    line-height: normal;
}
a:not(:disabled){
    color: #006eff;
    font-size: 1.5rem;
}
</style>
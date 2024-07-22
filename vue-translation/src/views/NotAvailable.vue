<script setup>
import { onMounted, ref } from 'vue';
import { fileAttr } from '../shared/fileAttr.js';


const nextLinkRef = ref(null);

onMounted(() => {
    fileAttr.prevPage = '/';

});

</script>

<template>
<div class="full-sect">
    <div class="central">
        <h1>非常抱歉，我们在处理问题中</h1>
        <h3>请稍后再试</h3>
        <a ref="nextLinkRef" href="#/" ></a>
    </div>
</div>

</template>

<style scope>
.central{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}
.central h3{
    color: #006eff;
}
.full-sect{
    /* background-color: #F0F2F5; */
    padding: 2rem;
    border-radius: 10px;
    width: 100%;
    height: 100vh;
}
</style>
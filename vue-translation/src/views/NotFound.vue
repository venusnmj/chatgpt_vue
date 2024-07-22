<script setup>
import { onMounted, ref } from 'vue';
import { fileAttr } from '../shared/fileAttr.js';

const nextLinkRef = ref(null);
const timerVal = ref(5);

onMounted(() => {
    fileAttr.prevPage = '#/';
    if (nextLinkRef.value) {
        setTimeout(() => nextLinkRef.value.click(), 5000);
    }
    setInterval(function () {timerVal.value--}, 1000);
});

</script>

<template>
<div class="muted-sect">
    <div class="central">
        <h1>非常抱歉，你访问的页面不见了</h1>
        <h3>{{timerVal}}秒后回去首页</h3>
        <a ref="nextLinkRef" href="#/" style="display: none;"></a>
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
.muted-sect{
    background-color: #F0F2F5;
    padding: 2rem;
    border-radius: 10px;
}
</style>
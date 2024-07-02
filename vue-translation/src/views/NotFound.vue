<script setup>
import { onMounted, ref } from 'vue';

const nextLinkRef = ref(null);
const timerVal = ref(5);

onMounted(() => {
    if (nextLinkRef.value) {
        setTimeout(() => nextLinkRef.value.click(), 5000);
    }
    setInterval(function () {timerVal.value--}, 1000);
});

</script>

<template>
<div class="central">
    <h1>非常抱歉，你访问的页面不见了</h1>
    <h3>{{timerVal}}秒后回去首页</h3>
    <a ref="nextLinkRef" href="#/" style="display: none;"></a>
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
</style>
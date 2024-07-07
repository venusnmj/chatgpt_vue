<script setup>
import { onMounted, ref } from 'vue';

const nextLinkRef = ref(null);

onMounted(() => {
});

</script>

<template>
<div class="muted-sect">
    <div class="central">
        <h1>非常抱歉，我们在处理问题</h1>
        <!-- <h3>{{timerVal}}秒后回去首页</h3> -->
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
.muted-sect{
    background-color: #F0F2F5;
    padding: 2rem;
    border-radius: 10px;
}
</style>
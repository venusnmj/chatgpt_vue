<script setup>

</script>

<template>
    <div class="stepCont">
        <div class="step">
            <i class="iconfont icon-upload"></i>
            <h3>上传翻译代码文档</h3>
        </div>
        <div class="arrow">
            <i class="iconfont icon-i-right"></i>
        </div>
        <div class="step">
            <i class="iconfont icon-message-multi-language-fill"></i>
            <h3>选择翻译语言</h3>
        </div>
        <div class="arrow">
            <i class="iconfont icon-i-right"></i>
        </div>
        <div class="step">
            <i class="iconfont icon-tick"></i>
            <h3>开始翻译过程</h3>
        </div>
    </div>
</template>

<style scoped>
    .stepCont{
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 20%;
    }
    .step {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    i {
        font-size: 2rem;
        color: #0273FF;
    }
    i.icon-tick{
        border: #0273FF solid 0.2rem;
        height: 1.8rem;
        width: 1.8rem;
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 2.5rem;
    }
    h3{
        text-wrap: nowrap;
    }
    .arrow{
        height: 0.1rem;
        border-radius: 2.5rem;
        /* width: 4rem; */
        width: 100%;
        background-color: #0273FF;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .arrow i{
        /* border: #0273FF solid 0.2rem; */
        height: 1.3rem;
        width: 1.3rem;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 2.5rem;
        background-color: #0273FF;
        color: white;
    }
</style>
<script setup>
const props = defineProps({
  userCount: Number,
  fileCount: Number,
  appTitle: String,
  logoSrc: String,

})
</script>

<template>
    <header>
        <div class="title">
            <img :src="logoSrc" alt="">
            <h1>{{appTitle}}</h1>
        </div>
        <div class="stats">
            <h3><span>{{ userCount}} 用户</span>已使用</h3>
            <h3><span>{{ fileCount}} 文档</span>已翻译</h3>
        </div>
    </header>
</template>

<style scoped>
    header{
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 3rem 4rem;
    }
    div{
        display: flex;
        gap: 1rem;
        justify-content: center;
    }
    h1{
        font-weight: 600;
        font-size: 2rem;
    }
    span{
        color: #0273FF;
        margin-right: 1rem;
    }
    .stats{
        gap: 4rem;
    }
    @media only screen and (max-width: 768px) {
        header{
            padding: 5vw;
            padding-top: 50px;
            gap: 10px;

        }
    }
    
</style>
<script setup>

</script>

<template>
    <div class="desktopView centerView">
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
    </div>
    <div class="mobileView">
        <div class="stepCont">
            <div class="step">
                <i class="iconfont icon-upload"></i>
                <h3>上传翻译代码文档</h3>
            </div>
            <div class="step">
                <i class="iconfont icon-message-multi-language-fill"></i>
                <h3>选择翻译语言</h3>
            </div>
            <div class="step">
                <i class="iconfont icon-tick"></i>
                <h3>开始翻译过程</h3>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .desktopView {
        display: block;
    }
    .mobileView{
        display: none;
    }
    
    .centerView{
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .desktopView .stepCont{
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 4rem;
        width: 100%;
        max-width: 60rem;
    }
    .desktopView .step {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .desktopView i {
        font-size: 2rem;
        color: #0273FF;
    }
    .desktopView i.icon-tick{
        border: #0273FF solid 0.2rem;
        height: 1.8rem;
        width: 1.8rem;
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 2.5rem;
    }
    .desktopView h3{
        text-wrap: nowrap;
    }
    .desktopView .arrow{
        height: 0.1rem;
        border-radius: 2.5rem;
        /* width: 4rem; */
        width: 100%;
        background-color: #0273FF;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .desktopView .arrow i{
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
    
    @media only screen and (max-width: 768px) {
        
        .desktopView {
            display: none;
        }
        .mobileView{
            display: block;
        }
        .mobileView .stepCont{
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            padding: 5vw;
            width: 100%;
        }
        .mobileView .step {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .mobileView i {
            line-height: normal;
            font-size: 2rem;
            color: #0273FF;
        }
        .mobileView i.icon-tick{
            border: #0273FF solid 0.2rem;
            height: 1.8rem;
            width: 1.8rem;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 2.5rem;
        }
        .mobileView h3{
            text-wrap: nowrap;
        }
    }

    
</style>
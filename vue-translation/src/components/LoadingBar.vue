<script setup>
    import { computed } from 'vue';

    const props = defineProps({
        percentage: Number,
        fileName: String,
    })

    const computedWidth = computed(() => {
        return `${props.percentage}%`;
    })

    
</script>
<template>
    <div class="loadingSect">
        <div class="loadingText">
            <p>{{ fileName }}</p>
        </div>
        <div class="loadBar">
            <div class="loadingBg">
                <div class="loadingProcess" :style="{ width: computedWidth }">

                </div>
            </div>
            <div class="loadPercentage">
                <p>{{ percentage }}%</p>
            </div>
        </div>  
    </div>
</template>

<style scoped>
    .loadingSect {
        padding: 1rem;
    }
    .loadBar {
        width: 100%;
        /* padding: 1rem; */
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }
    .loadingBg {
        background-color: #D9D9D9;
        height: 0.6rem;
        width: 100%;
        border-radius: 2rem;
    }
    .loadingProcess {
        background-color: #0273FF;
        /* width: 50%; */
        /* width: 0%; */
        height: 0.6rem;
        border-radius: 2rem;
        transition: 0.2s;
    }
    
    .loadPercentage p{
        color: #0273FF;
        font-weight: 600;
    }
    .loadingText p{
        color: #0273FF;
    }
</style>
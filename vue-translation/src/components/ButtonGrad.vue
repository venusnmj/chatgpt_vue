<script setup>
import { computed } from 'vue';
    const props = defineProps({
        htmlContent: {
            type: String,
            required: true,
        },
        className: {
            type: String,
            default: '',
        },
    })
    const computedClass = computed(() => {
        return `button ${props.className}`;
    });
</script>

<template>
    <span :class="computedClass" v-html="htmlContent">
    </span>
</template>
<style scoped>
    .button{
        background-color: #3385ff;
        background-image: linear-gradient(90deg, #006eff, #13adff);
        /* font-size: 1.5rem; */
        color: #fff;
        box-shadow: 0 5px 10px 0 rgba(16, 110, 253, .3);
        padding: 0.3rem 4rem;
        border-radius: 10px;
        /* display: flex;
        align-items: center;
        text-align: center; */
        /* gap: 1rem; */
        cursor: pointer;
        font-size: 1rem;
        text-wrap: nowrap;
    
  /* height: 2.6rem;
  width: 10rem; */
  /* text-align: center;
  display: flex;
  align-items: center;
  justify-content: center; */
    }
    .button i{
        font-size: 2rem;
    }
    .button:hover {
        box-shadow: 0 0 0.661vw rgba(0, 0, 0, 0.05);
        -webkit-transform: translateY(-0.198vw);
        -ms-transform: translateY(-0.198vw);
        transform: translateY(-0.198vw);
    }
</style>
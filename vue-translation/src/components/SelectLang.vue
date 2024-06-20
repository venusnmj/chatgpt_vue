<script setup>
    import {ref, computed} from 'vue';
    import ButtonGrad from './ButtonGrad.vue';


    const selectedValue = ref('');
    const langSelected = ref(false);

    const emit = defineEmits(['language-selected']);


    function selected(){
        langSelected.value = true;
        console.log("language selected: " + selectedValue.value);
        emit('language-selected', selectedValue.value)
    }

    const computedColor = computed(() => {
        return langSelected.value
            ? '#000000'
            : '#999999'
    })

    const btnText = `选择翻译语言`;

    const props = defineProps({
        nextLink: {
            type: String,
            required: false,
        },
    })

    
</script>

<template>
    <div class="langSect">
        <div class="langMenu">
            <select id="lang" name="lang" v-model="selectedValue" @change="selected" v-bind:style="{ color: computedColor }">
                <option value="" disabled selected class="placeholder">选择翻译语言</option>
                <option value="eng">英语</option>
                <option value="spanish">西班牙语</option>
            </select>
            <i class="iconfont icon-down"></i>
        </div>
        <!-- <button class="button">
            选择翻译语言
        </button> -->
        <a :href="nextLink">
            <ButtonGrad :htmlContent="btnText" className="btnTrans"/>
        </a>        
    </div>
</template>

<style scoped>
    .langSect{
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 1rem;
    }
    select{
        height: 2.6rem;
        width: 10rem;
        font-size: 1rem;
        border: none;
        padding: 0rem 1rem;
        appearance: none;
        border-radius: 10px;
        overflow: hidden;
        cursor: pointer;
        color: #999999;
    }
    .langMenu{
        position: relative;
        display: flex;
        align-items: center;
    }
    
    .icon-down{
        position: absolute;
        right: 1rem;
        pointer-events: none;
    }
 
    /* .button{
        background-color: #3385ff;
        background-image: linear-gradient(90deg, #006eff, #13adff);
        box-shadow: 0 5px 10px 0 rgba(16, 110, 253, .3);
        border: none;
        font-size: 1rem;
        color: #fff;
        height: 2.6rem;
        width: 10rem;
        text-align: center;
        border-radius: 10px;
        cursor: pointer;
    }
    .button:hover {
        box-shadow: 0 0 0.661vw rgba(0, 0, 0, .05);
        -webkit-transform: translateY(-0.198vw);
        -ms-transform: translateY(-0.198vw);
        transform: translateY(-0.198vw);
    } */
     .btnTrans {
        font-size: 1rem;
        height: 2.6rem;
        width: 10rem;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
     }
     a{
        text-decoration: none;
     }
    
</style>

  
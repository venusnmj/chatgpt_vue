<script setup>
import { ref, computed, watch } from 'vue';
import ButtonGrad from './ButtonGrad.vue';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import MultiSelect from 'primevue/multiselect';
import Tooltip from 'primevue/tooltip';

const confirm = useConfirm();
const toast = useToast();

const selectedValue = ref('');
const langSelected = ref(false);
const selectedModel = ref('');
const modelSelected = ref(false);
const modelArr = ref([]);
const fileSelected = ref(true);

const emit = defineEmits(['language-selected', 'model-selected']);

function selected() {
    langSelected.value = true;
    console.log("language selected: " + selectedValue.value);
}

function modelSel() {
    modelSelected.value = true;
    console.log("save .code and .name: "+ JSON.stringify(selectedModel.value));
    modelArr.value = selectedModel.value.map(model => model);
    console.log("models selected: " + JSON.stringify(modelArr.value));
}

function checkLang() {
    console.log(fileSelected.value);
    if (selectedValue.value === '' ) {
        confirm.require({
            group: 'templating',
            header: '未选择语言',
            message: '请选择一种语言',
            rejectProps: {
                label: '取消',
                outlined: true,
                size: 'small'
            },
            acceptProps: {
                label: 'OK',
                size: 'small'
            }
        });
    } else if(selectedModel.value.length == 0){
        confirm.require({
            group: 'templating',
            header: '未选择AI模型',
            message: '请选择至少一种AI模型',
            rejectProps: {
                label: '取消',
                outlined: true,
                size: 'small'
            },
            acceptProps: {
                label: 'OK',
                size: 'small'
            }
        });
    } else if(!fileSelected.value){
        confirm.require({
            group: 'templating',
            header: '未选择任何文件',
            message: '请选择至少一个文件',
            rejectProps: {
                label: '取消',
                outlined: true,
                size: 'small'
            },
            acceptProps: {
                label: 'OK',
                size: 'small'
            }
        });
    }else {
        emit('language-selected', selectedValue.value);
        emit('model-selected', modelArr.value);
    }
}

const computedColor = computed(() => {
    return langSelected.value ? '#000000' : '#999999';
});

const btnText = `选择翻译语言`;

const props = defineProps({
    nextLink: {
        type: String,
        required: false,
    },
    langSelections: {
        type: Array,
        required: true,
    },
    modelSelections: {
        type: Array,
        required: true,
    },
    fileSelected: {
        type: Boolean,
        required: true,
    }
});

watch(() => props.fileSelected, (newVal) => {
    fileSelected.value = newVal;
});

</script>

<template>
    <ConfirmDialog group="templating" class="confirmPopup">
        <template #message="slotProps" class="confirmCustom">
            <div class="flex flex-col items-center w-full gap-3 border-b border-surface-200 dark:border-surface-700">
                <i :class="slotProps.message.icon" class="text-6xl text-primary"></i>
                <p>{{ slotProps.message.message }}</p>
            </div>
        </template>
    </ConfirmDialog>
    <div class="langSect">
        <MultiSelect v-model="selectedModel" :options="modelSelections" @change="modelSel" optionLabel="name" filter placeholder="Select Models" display="chip" class="w-full md:w-80">
            <template #option="slotProps">
                <div class="flex items-center modelHover" v-tooltip.top="slotProps.option.desc">
                    <div>{{ slotProps.option.name }}</div>
                </div>
            </template>
        </MultiSelect>
        <div class="langMenu">
            <select id="lang" name="lang" v-model="selectedValue" @change="selected" :style="{ color: computedColor }">
                <option value="" disabled selected class="placeholder">选择翻译语言</option>
                <option v-for="lang in langSelections" :value="lang">{{ lang }}</option>
            </select>
            <i class="iconfont icon-down"></i>
        </div>
        <a :href="nextLink" @click.prevent="checkLang">
            <ButtonGrad :htmlContent="btnText" className="btnTrans"/>
        </a>
    </div>
</template>

<style scoped>
.langSect {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1rem;
}
select {
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
.langMenu {
    position: relative;
    display: flex;
    align-items: center;
}
.icon-down {
    position: absolute;
    right: 1rem;
    pointer-events: none;
}
.btnTrans {
    font-size: 1rem;
    height: 2.6rem;
    width: 10rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
}
a {
    text-decoration: none;
}
.modelHover {
    width: 100%;
}
</style>

<style>
.p-dialog {
    width: 50vw;
}
.p-dialog-footer .p-button {
    background-color: #3385ff;
    border-color: #3385ff;
}
.p-dialog-footer .p-button-outlined {
    border-color: #3385ff;
    background-color: transparent;
    color: #3385ff;
}
.p-dialog-footer .p-button:not(:disabled):hover {
    background: #0273FF;
    border: 1px solid #3385ff;
    color: white;
}
.p-dialog-footer .p-button-outlined:not(:disabled):hover {
    background: rgba(16, 110, 253, .1);
    border-color: #3385ff;
    color: #3385ff;
}
.p-multiselect-label-container {
    width: 17rem;
}
</style>

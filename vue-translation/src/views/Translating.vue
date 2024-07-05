<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { fileAttr } from '../shared/fileAttr.js';
import PrimeVue from 'primevue/config';
import Tree from 'primevue/tree';
import "primeicons/primeicons.css";
import LoadingBar from '../components/LoadingBar.vue';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import ButtonGrad from '../components/ButtonGrad.vue'


const selectedKey = ref(null);
const dropdownVisiblePre = ref(false);
const dropdownVisiblePost = ref(false);
const expandedKeys = ref({});
const fileCode = ref(fileAttr.fileBef);
const selectedFile = ref(null);
const fileType = ref('pi pi-fw pi-folder');
const loadVal = ref(0);
const buttonText = ref(`继续`);

const errorBool = ref(false);
const completedBool = ref(true);

const displayBool = computed(() => {
    return errorBool && completedBool;
})


const toggleDropdownPre = () => {
    dropdownVisiblePre.value = !dropdownVisiblePre.value;
};

const toggleDropdownPost = () => {
    dropdownVisiblePost.value = !dropdownVisiblePost.value;
};

const handleNodeSelectPre = (event) => {
    console.log("pre"+JSON.stringify(selectedKey));
    console.log(event.node)
    dropdownVisiblePre.value = false;
};

const handleNodeSelectPost = (event) => {
    console.log("post"+JSON.stringify(selectedKey));
    console.log(event.node)
    dropdownVisiblePost.value = false;
};

const selectedKeyLabel = computed(() => {

  return selectedFile.value ? selectedFile.value : '选择文件';
});

const collectKeys = (nodes, keys = {}) => {
  nodes.forEach(node => {
    keys[node.key] = true;
    if (node.children) {
      collectKeys(node.children, keys);
    }
  });
  return keys;
};

onMounted(() => {
    console.log(fileAttr.fileBef);
  expandedKeys.value = collectKeys(fileAttr.nodes);
  selectedFile.value = findLabelByKey(fileAttr.nodes, 0);
});

const findNodeByKey = (nodeList, searchKey) => {
    for (const [key, value] of Object.entries(nodeList)) {
        if (value.key === searchKey && value.name) {
          // console.log("filename: "+value.name);
            // console.log("found: " + value.key + " " + value.name);
            return [value.key, value];
        }
    }
    return null;
};
const findLabelByKey = (nodes, searchKey) => {
  for (const node of nodes) {
    if (node.key === searchKey) {
      return node.label;
    }
    if (node.children && node.children.length > 0) {
      const foundLabel = findLabelByKey(node.children, searchKey);
      if (foundLabel) {
        return foundLabel;
      }
    }
  }
  return null;
};

watch(selectedKey, (newVal, oldVal) => {
    console.log(Object.keys(newVal));
    const key = Object.keys(newVal)[0];
    const node = findNodeByKey(fileCode.value, key);
    // console.log("node is "+ node[1].name);
    if(node !== null){
        selectedFile.value = node[1].name;
        fileType.value = "pi pi-fw pi-file";
    }
    else{
        selectedFile.value = findLabelByKey(fileAttr.nodes, key);
        console.log(selectedFile.value);
        fileType.value = 'pi pi-fw pi-folder';
    }
    
})

</script>

<template>
    <div class="filesCtrl">
        <div class="pre-Ctrl">
            <div class="dropdown-container">
                <div class="dropdown-toggle" @click="toggleDropdownPre">
                <span class="showFile"><i :class="fileType"></i>{{ selectedKeyLabel }}</span>
                <i class="pi pi-chevron-down"></i>
                </div>
                <div v-if="dropdownVisiblePre" class="dropdown-content">
                <Tree
                    v-model:selectionKeys="selectedKey"
                    v-model:expandedKeys="expandedKeys"
                    :value="fileAttr.nodes"
                    selectionMode="single"
                    @node-select="handleNodeSelectPre"
                />
                </div>
            </div>
        </div>
        <div class="arr-Ctrl">
            <i class="iconfont icon-right"/>
        </div>
        <div class="post-Ctrl">
            <div class="dropdown-container">
                <div class="dropdown-toggle" @click="toggleDropdownPost">
                <span class="showFile"><i :class="fileType"></i>{{ selectedKeyLabel }}</span>
                <i class="pi pi-chevron-down"></i>
                </div>
                <div v-if="dropdownVisiblePost" class="dropdown-content">
                <Tree
                    v-model:selectionKeys="selectedKey"
                    v-model:expandedKeys="expandedKeys"
                    :value="fileAttr.nodes"
                    selectionMode="single"
                    @node-select="handleNodeSelectPost"
                />
                </div>
            </div>
        </div>
    
    </div>
    <div class="returnStatus">
        <div v-if="errorBool" class="error">
            <i class="pi pi-times-circle" />
            <h1 class="loadingTitle">
                10/12 文档已翻译
            </h1>
            <h3 class="notice done">
                翻译已完成
            </h3>
            <div class="errorActions">
                <Button label="用原版" severity="secondary" outlined />
                <Button type="button" label="重试文档" severity="danger" badge="2"/>
            </div>
        </div>
        <div v-else-if="completedBool" class="success">
            <i class="pi pi-check-circle" />
            <h1 class="loadingTitle">
                12/12 文档已翻译
            </h1>
            <h3 class="notice done">
                翻译已完成
            </h3>
            <div class="doneActions">
                <a href="#/codecheck">
                    <ButtonGrad className="btnTrans" :htmlContent="buttonText" />
                </a>
            </div>
        </div>
        <div v-else class="loading">
            <div class="loadingScreen">
                <ProgressSpinner style="width: 20%; height: 20%" strokeWidth="3" fill="transparent" animationDuration="2s" aria-label="Custom ProgressSpinner" />
                <h1 class="loadingTitle">
                    正在翻译中...
                </h1>
                <h3 class="notice">
                    AI 可能会犯错误。请检查重要信息。 
                </h3>
            </div>
            <LoadingBar :percentage="loadVal"/>
        </div>
      
        
    </div>
</template>

<style scoped>
.filesCtrl{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
}
i.icon-right {
    font-size: 2rem;
    color: white;
}
.errorActions, .doneActions{
    display: flex;
    gap: 1rem;
    justify-content: center;
    padding-top: 3rem;
}
.error i.pi-times-circle, .success i.pi-check-circle{
    font-size: 7rem;
}
.error i.pi-times-circle{
    color: #ef4444;
}
.success i.pi-check-circle{
    color: #22c55e;
}
.arr-Ctrl{
    height: 3rem;
    width: 3rem;
    background-image: linear-gradient(90deg, #006eff, #13adff);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3rem;
}
.dropdown-container {
  position: relative;
}
div.pre-Ctrl, div.post-Ctrl{
    width: 40%;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem 1rem;
  /* border: 1px solid #ccc; */
  border-radius: 0.25rem;
  background-color: #fff;
}

.dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  border: 1px solid #ccc;
  z-index: 1000;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-toggle i {
  margin-left: auto;
}
.showFile{
    display: flex;
    gap: 1rem;
    align-items: center;
}
.loadingScreen, .error, .success{
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    gap: 1rem;
    padding: 3rem;
}
h3.notice{
    color: #999999;
}
h3.notice.done{
    color: #006eff;
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

</style>
<style>
.p-progressspinner-spin .p-progressspinner-circle{
    stroke: #006eff;
    animation: p-progressspinner-dash 1.5s ease-in-out infinite;
}


</style>

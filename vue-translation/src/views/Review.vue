<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import SelectLang from '../components/SelectLang.vue';
import { fileAttr } from '../shared/fileAttr.js';
// import PrimeVue from 'primevue/config';
import Tree from 'primevue/tree';
import "primeicons/primeicons.css";
import Button from 'primevue/button';
import CodeEditor from '../components/CodeEditor.vue';
import LoadingSection from '../components/LoadingSection.vue'
import ProgressSpinner from 'primevue/progressspinner';
import { GetModels } from '../utils/apiCalls';

const mimeTypes = {
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'java': 'text/x-java-source',
    'py': 'text/x-python',
    'sql': 'application/sql',
    'php': 'application/x-httpd-php',
    'md': 'text/markdown',
    'cpp': 'text/x-c++src',
    'rs': 'text/rust',
    'go': 'text/x-go',
    'yaml': 'application/x-yaml',
    'yml': 'application/x-yaml',
    // Add more mappings as needed
};




const apiError = ref(null);

const selectedKey = ref({});
const fileCode = ref(fileAttr.fileBef);
const expandedKeys = ref({});
const nodes = ref(fileAttr.nodes);
const codeStr = ref('');
const codeLang = ref('');
const allLang = ref([]);
const allModels = ref([]);

const transArr = ref([]);
const modelArr = ref([]);


const isLoading = ref(true);
const isSubmitted = ref(false);

const isEditable = computed(() => codeStr.value !== '');

const expandAll = () => {
    for (let node of nodes.value) {
        expandNode(node);
    }
    expandedKeys.value = { ...expandedKeys.value };
};

const collapseAll = () => {
    expandedKeys.value = {};
};

const expandNode = (node) => {
    if (node.children && node.children.length) {
        expandedKeys.value[node.key] = true;
        for (let child of node.children) {
            expandNode(child);
        }
    }
};

const findNodeByKey = (nodeList, searchKey) => {
    for (const [key, value] of Object.entries(nodeList)) {
        if (value.key === searchKey && value.name) {
            return [value.key, value];
        }
    }
    return null;
};

const findCodeByKey = (nodeList, searchKey) => {
    for (const [key, value] of Object.entries(nodeList)) {
        if (value.key === searchKey) {
            return value.code;
        }
    }
    return null;
};

const collectKeys = (nodes, keys = {}) => {
    nodes.forEach(node => {
        if(node.selectable){
            keys[node.key] = { checked: true, partialChecked: false };
        }
        if (node.children) {
            collectKeys(node.children, keys);
        }
    });
    return keys;
};

const changeKey = (nodes, keyVal) => {
    nodes.forEach(node => {
        if(node.key == keyVal){
            node.styleClass = "selectColor";
        } else if(!node.selectable){
            node.styleClass = "disableCheck";
        } else {
            node.styleClass = "";
        }
        if (node.children) {
            changeKey(node.children, keyVal);
        }
    });
};

const disableKey = (nodes) => {
    nodes.forEach(node => {
        if(!node.selectable){
            node.styleClass = "disableCheck";
        } else {
            node.styleClass = "";
        }
        if (node.children) {
            disableKey(node.children);
        }
    });
};

const addTranslate = (nodeList, keyVal, selected) => {
    for (const [key, value] of Object.entries(nodeList)) {
        if(value.key == keyVal){
            value.translate = selected;
        }
    }
}

const editCodeBef = (nodeList, keyVal, codeNew) => {
    for (const value of nodeList) {
        if(value.key == keyVal){
            value.code = codeNew;
            // console.log(value.name);
            const codeBlob = convertCodeToBlob(codeNew, value.type);
            console.log("blob: "+codeBlob);
            value.content = codeBlob;


            // Create a URL for the Blob (for example, to use it as a downloadable link)
            const blobUrl = URL.createObjectURL(codeBlob);
            // console.log(blobUrl);

            // Example of how to create a download link dynamically
            const downloadLink = document.createElement('a');
            downloadLink.href = blobUrl;
            downloadLink.download = value.name;
            downloadLink.textContent = 'Download Code';
            value.downloadFile = downloadLink;
            console.log(downloadLink);
            // document.body.appendChild(downloadLink);

        }
    }
}

// Function to get MIME type based on file extension
const getMimeType = (fileName) => {
    const ext = fileName.toLowerCase();
    return mimeTypes[ext] || 'application/octet-stream';
};


// Function to convert a code string to a Blob with the correct MIME type
const convertCodeToBlob = (codeString, fileName) => {
    const mimeType = getMimeType(fileName);
    return new Blob([codeString], { type: mimeType });
};

const checkHighlighted = (nodes) => {
    nodes.forEach(node => {
        if(node.styleClass == 'selectColor'){
            editCodeBef(fileCode.value, node.key, codeStr.value)
            // console.log('code update '+JSON.stringify(fileCode.value));
        }
        if (node.children) {
            checkHighlighted(node.children);
        }
    })
    console.log(JSON.stringify(fileCode.value));
}

const unHighlight = async (nodes) => {
    nodes.forEach(node => {
        if(node.styleClass == 'selectColor'){
            node.styleClass = '';
        }
        if (node.children) {
            unHighlight(node.children);
        }
    })
}

const gettingSetup = async () => {
    allLang.value = fileAttr.setupData.languageOptions;
//   try {
//     const data = await GetSetup();
//     // console.log(data);
//     allLang.value = data.languageOptions;
//     // console.log(allLang.value);
//     // console.log(excludeFiles.value);
//     // console.log(excludeFolders.value);
//     return data;
//   } catch (error) {
//     apiError.value = error.message;
//     throw error;
//   }
}

const gettingModels = async () => {
    try {
    const data = await GetModels();
    // console.log('model'+ JSON.stringify(data));
    // console.log(data.length+' '+JSON.stringify(data[0]))
    for(var i=0; i<data.length; i++){
        const addModel = {
            name: data[i].displayName,
            code: data[i].modelName,
            desc: data[i].description
        }
        allModels.value.push(addModel);
    }
    // for (var i = 0; i){
    //     console.log(model);
    // }
    
    // allModels.value = data;
    // console.log(allLang.value);
    // console.log(excludeFiles.value);
    // console.log(excludeFolders.value);
    return data;
  } catch (error) {
    apiError.value = error.message;
    throw error;
  }
}

onMounted(async () => {
  await gettingSetup();
  await gettingModels();
  isLoading.value = false;

  
});

onMounted(() => {
    disableKey(nodes.value);
    selectedKey.value = collectKeys(nodes.value);
});

watch(isSubmitted, (newVal) => {
    if(newVal==true && nextLinkRef.value){

        nextLinkRef.value.click();
    }
}) 

watch(selectedKey, (newVal, oldVal) => {
  if(newVal){
    let testVal = oldVal;
    let oppVal = newVal;
    if(Object.keys(newVal).length > Object.keys(oldVal).length){
        testVal = newVal;
        oppVal = oldVal;
    }

    for (const [key, value] of Object.entries(testVal)) {
        if (!oppVal || !oppVal[key] || oppVal[key].checked !== value.checked || oppVal[key].partialChecked !== value.partialChecked) {
            const node = findNodeByKey(fileCode.value, key);
            if(node !== null){
                if(newVal[key]){
                    addTranslate(fileCode.value, key, true);
                } else {
                    addTranslate(fileCode.value, key, false);
                }
            }
        }
    }
  }
});

const handleCodeUpdate = (newCode) => {
    codeStr.value = newCode;
    checkHighlighted(nodes.value);
};

const handleKeyEvent = (event) => {
    console.log('Key event detected:', event);
    checkHighlighted(nodes.value);
};

const TranslatableArr = async (nodeList) => {
    for (const [key, value] of Object.entries(nodeList)) {
        if(value.selectable){
            transArr.value.push(value);
        }
    }
}

const nextLinkRef = ref(null);



const submitLanguage = (lang) => {
    // console.log("language on submit "+lang);
    isLoading.value = true;
    transArr.value = [];
    TranslatableArr(fileCode.value);
    // await SubmitSelected(transArr.value, lang, userID.value);
    // console.log("all Translatables: "+ transArr.value );
    unHighlight(nodes.value);

    fileAttr.selectedLanguage = lang;
    fileAttr.fileBef = fileCode.value;
    // console.log('final code val '+ JSON.stringify(fileCode.value));
    
    fileAttr.nodes = nodes.value;
    fileAttr.fileAft = transArr.value
    // console.log('submitLanguage()' + fileAttr.fileAft);
    //submit all the selected files below
    //code here
    
    

    // console.log("user is "+userID);
    isLoading.value = false;
    isSubmitted.value = true;

    // if (nextLinkRef.value) {
    //     nextLinkRef.value.click();
    // }
    
};

const assignModels = (nodeList, modelNames) => {
    for (const value of nodeList) {
        if(value.selectable && value.translate){
            console.log(JSON.stringify(value));
            value.models = modelNames;
        }
    }
}

const submitModel = (model) => {
    console.log("this model "+ model );

    // console.log('trans array: '+ JSON.stringify(transArr.value));
    // assignModels(transArr.value, model);
    
    fileAttr.selectedModel = model;
}



const onNodeSelect = (node) => {
    if(node.label.includes('.')){
        changeKey(nodes.value, node.key);
        let newCode = findCodeByKey(fileCode.value, node.key);
        codeStr.value = `${findCodeByKey(fileCode.value ,node.key)}`;

        codeLang.value = node.fileType;

        if(codeLang.value == "py"){
            codeLang.value = "python";
        } else if(codeLang.value == "js"){
            codeLang.value = "javascript";
        }
    } else {
        codeStr.value = '';
    }
};
</script>

<template>
    <div class="muted-sect">
        <LoadingSection v-if="isLoading" />
        <div v-else class="loaded">
            <div class="reviewCode">
                <div class="directorySect">
                    <div class="directBtn">
                        <Button type="button" icon="pi pi-plus" label="Expand All" @click="expandAll">展开</Button>
                        <Button type="button" icon="pi pi-minus" label="Collapse All" @click="collapseAll">收起</Button>
                    </div>
                    <div class="fileDir" ref="clickDir">
                        <Tree v-model:expandedKeys="expandedKeys" v-model:selectionKeys="selectedKey" :value="fileAttr.nodes" selectionMode="checkbox" @nodeSelect="onNodeSelect" @nodeUnselect="onNodeSelect" class="w-full md:w-[30rem] file-tree">
                        </Tree>
                    </div>
                </div>
                <div class="codeSect">
                    <CodeEditor :codeDoc="codeStr" :language="codeLang" :isEditable="isEditable" @update:codeDoc="handleCodeUpdate" @key-event="handleKeyEvent"/>
                </div>
            </div>
            <SelectLang nextLink="#/translating" @language-selected="submitLanguage" @model-selected="submitModel" :langSelections="allLang" :modelSelections="allModels"/>
            <a ref="nextLinkRef" href="#/translating" style="display: none;"></a>
        </div>
    </div>
</template>

<style>
.file-tree .p-tree-node-selectable {
    position: relative;
}
.file-tree .p-checkbox {
    position: absolute;
    right: 0;
}
.file-tree.p-tree {
    background-color: transparent;
    padding: 0px;
}
.reviewCode {
    display: flex;  
    gap: 20px;
}
.directorySect {
    width: 30%;
    display: flex;  
    flex-direction: column;
    gap: 20px;
}
.codeSect {
    width: 70%;
    height: 100%;
    overflow-y: scroll;
}
.directBtn {
    display: flex;
    gap: 10px;
}
.directBtn .p-button {
    background-color: transparent;
    border: solid #3385ff 2px;
    color: #3385ff;
}
.directBtn .p-button:not(:disabled):hover {
    background-color: white;
    border: solid #3385ff 2px;
    color: #3385ff;
}
.fileDir {
    height: 350px;
    overflow-y: scroll;
    padding-right: 10px;
}
.fileDir::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 7px;
}
.fileDir::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: rgba(0, 0, 0, .5);
    -webkit-box-shadow: 0 0 1px rgba(255, 255, 255, .5);
}
.cm-editor.ͼo {
    height: 100%;
    border-radius: 0.5rem;
}
.selectColor .p-tree-node-label {
    color: #3385ff;
}
.disableCheck .p-tree-node-label, .disableCheck .p-tree-node-icon {
    color: #999999;
}
.disableCheck {
    pointer-events: none;
}
.completedColor .p-tree-node-label, .completedColor .p-tree-node-icon{
    color: #16a34a;
}

.muted-sect{
    background-color: #F0F2F5;
    padding: 2rem;
    border-radius: 10px;
}
/* .loadingScreen{
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    gap: 1rem;
    padding: 3rem;
} */
</style>

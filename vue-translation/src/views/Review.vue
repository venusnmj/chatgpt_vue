<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import SelectLang from '../components/SelectLang.vue';
import { fileAttr } from '../shared/fileAttr.js';
// import PrimeVue from 'primevue/config';
import Tree from 'primevue/tree';
import "primeicons/primeicons.css";
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import CodeEditor from '../components/CodeEditor.vue';
import LoadingSection from '../components/LoadingSection.vue'
import FloatLabel from 'primevue/floatlabel';
import ProgressSpinner from 'primevue/progressspinner';
import { GetModels } from '../utils/apiCalls';

const MAX_CHARS = 500;

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
const emit = defineEmits(['errorBool']);

const selectedKey = ref({});
const fileCode = ref(fileAttr.fileBef);
const expandedKeys = ref({});
const nodes = ref(fileAttr.nodes);
const codeStr = ref('请选择文档来展示');
const codeLang = ref('');
const allLang = ref([]);
const allModels = ref([]);

const transArr = ref([]);
const modelArr = ref([]);

const nextLinkRef = ref(null);

const isLoading = ref(true);
const isSubmitted = ref(false);
const hasFileSel = ref(false);
const requestVal = ref('');
const disableRequest = ref(true);

const selectedFile = ref(null);
const activeFile = ref();
const selectedMobileKey = ref(null);
const dropdownVisiblePre = ref(false);
const fileType = ref('pi pi-fw pi-folder');
const noMatch = ref(false);



const remainingChars = computed(() => MAX_CHARS - requestVal.value.length);

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

const findReqByKey = (nodeList, searchKey) => {
    for (const [key, value] of Object.entries(nodeList)) {
        if (value.key === searchKey) {
            if(value.request){
                return value.request;
            }
        }
    }
    return '';
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
            console.log('confirm type '+value.type);
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

const saveRequest = (event) => {
    // console.log('request changed '+event.target.value);
    // let regex = /^[\p{L}\p{N} ,.!?\\-_]+$/u;


    if (requestVal.value.match(/^[\p{L}\p{N} ,.!?\-_，。'"“”]+$/u) || requestVal.value == '') {
        noMatch.value = false;
        checkRequest(nodes.value);
    }
    else{
        noMatch.value = true;
        checkRequest(nodes.value);
    }
    

}

const checkRequest = (nodes) => {
    nodes.forEach(node => {
        if(node.styleClass == 'selectColor'){
            console.log('request update ' + requestVal.value);
            editRequest(fileCode.value, node.key, requestVal.value);
            node.request = requestVal.value;
            // console.log('code update '+JSON.stringify(fileCode.value));
        }
        if (node.children) {
            checkRequest(node.children);
        }
    })
    // console.log(JSON.stringify(fileCode.value));
}
const editRequest = (nodeList, keyVal, requestNew) => {
    for (const value of nodeList) {
        if(value.key == keyVal){
            value.request = requestNew;
        }
    }
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
    if(fileAttr.setupData.languageOptions == 'Error fetching data'){
        // apiError.value = error.message;
        // emit('errorBool', true);
        throw error;
    }
    allLang.value = fileAttr.setupData.languageOptions;
    
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
    // apiError.value = error.message;
    // emit('errorBool', true);
    throw error;
  }
}

onMounted(async () => {
    selectedFile.value = findLabelByKey(fileAttr.nodes, 0);
    try{
        await gettingSetup();
        await gettingModels();
        await expandAll();
    }
    catch(error){
        apiError.value = error.message;
        emit('errorBool', true);
    }
  
  console.log("this must exist "+ JSON.stringify(nodes.value));
  if(nodes.value.length == 0){
    console.log("refresh to home");
    fileAttr.selectedLanguage = null;
    fileAttr.selectedModel = [];
    fileAttr.displayModel = [];
    fileAttr.nodes = [];
    fileAttr.fileBef = [];
    fileAttr.fileAft = [];
    // fileAttr.gotToFinal = null;
    // fileAttr.gotToStart = true;
    window.location.href = '#/';
  }
  else if(fileAttr.prevPage!='/' && fileAttr.prevPage!='#/'){
    console.log("refresh to home");
    fileAttr.selectedLanguage = null;
    fileAttr.selectedModel = [];
    fileAttr.displayModel = [];
    fileAttr.nodes = [];
    fileAttr.fileBef = [];
    fileAttr.fileAft = [];
    // fileAttr.gotToFinal = null;
    // fileAttr.gotToStart = true;
    window.location.href = '#/';
  }
  console.log('prev page is '+fileAttr.prevPage);

//   else if(fileAttr.fileAft.length!=0){
//     fileAttr.fileAft = [];
    
//     window.location.href = '#/';
//   }

  isLoading.value = false;

  
});
watch(selectedMobileKey, (newVal, oldVal) => {
    // console.log(Object.keys(newVal));
    const key = Object.keys(newVal)[0];
    activeFile.value = key;
    console.log("should i save this key? "+key)
    const node = findNodeByKey(fileCode.value, key);
    if (node !== null) {
        selectedFile.value = node[1].name;
        if(node[1].name.includes('.')){
            disableRequest.value = false;
        }
        else{
            disableRequest.value = true;
        }
        
        // console.log(node[1].code);

        codeStr.value = `${node[1].code}`;

        console.log("check node "+ JSON.stringify(node[1]));
        // console.log(storeMod.value);
        
        


        codeLang.value = node[1].type;
        // if (codeLang.value == "py") {
        //     codeLang.value = "python";
        // } else if (codeLang.value == "js") {
        //     codeLang.value = "javascript";
        // }
        console.log("codeLang: " + codeLang.value);
    } else {
        disableRequest.value = true;
        selectedFile.value = findLabelByKey(fileAttr.nodes, key);
        console.log(selectedFile.value);
        fileType.value = 'pi pi-fw pi-folder';
        codeStr.value = '请选择文档来展示';
        // codeResult.value = '请选择文档来展示';
    }

    if (oldVal) {
        let testVal = oldVal;
        let oppVal = newVal;
        for (const [key, value] of Object.entries(testVal)) {
            if (!oppVal || !oppVal[key] || oppVal[key].checked !== value.checked || oppVal[key].partialChecked !== value.partialChecked) {
                if (value.checked === true && value.partialChecked === false) {
                    const node = findNodeByKey(fileCode.value, key);
                    if (node !== null) {
                        console.log("node is " + node[1].name);
                        codeStr.value = `${node[1].code}`;
                        // codeResult.value = `${node[1].transCode}`;
                        codeLang.value = node[1].type;
                        // if (codeLang.value == "py") {
                        //     codeLang.value = "python";
                        // } else if (codeLang.value == "js") {
                        //     codeLang.value = "javascript";
                        // }
                        console.log("codeLang: " + codeLang.value);
                    }
                }
            }
        }
    }
});

onMounted(() => {
    disableKey(nodes.value);
    selectedKey.value = collectKeys(nodes.value);
});

watch(isSubmitted, (newVal) => {
    if(newVal==true && nextLinkRef.value){
        fileAttr.prevPage = window.location.hash.slice(1) || '/';
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

    // console.log("check empty "+ JSON.stringify(newVal));
    console.log("check length "+ Object.keys(newVal).length);
    if (Object.keys(newVal).length == 0){
        hasFileSel.value = false;
    }
    else{
        hasFileSel.value = true;
    }
    console.log(hasFileSel.value);

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
    console.log("this model "+ model[0].name);
    fileAttr.selectedModel = [];

    // console.log('trans array: '+ JSON.stringify(transArr.value));
    // assignModels(transArr.value, model);
    for(var i=0; i<model.length; i++){
        fileAttr.selectedModel.push(model[i].code);
        fileAttr.displayModel.push(model[i].name);
    }
    
    
}

const onNodeSelect = (node) => {
    if(node.label.includes('.')){
        disableRequest.value = false;
        changeKey(nodes.value, node.key);
        let newCode = findCodeByKey(fileCode.value, node.key);
        codeStr.value = `${findCodeByKey(fileCode.value ,node.key)}`;

        requestVal.value = `${findReqByKey(fileCode.value, node.key)}`

        codeLang.value = node.fileType;
        console.log('selectable val: '+node.selectable);

        // if(codeLang.value == "py"){
        //     codeLang.value = "python";
        // } else if(codeLang.value == "js"){
        //     codeLang.value = "javascript";
        // }
        selectedFile.value = node.label;
        fileType.value = "pi pi-fw pi-file";
    } else {
        disableRequest.value = true;
        codeStr.value = '请选择文档来展示';
        selectedFile.value = node.label;
        fileType.value = "pi pi-fw pi-folder";
    }
};



const toggleDropdownPre = () => {
    dropdownVisiblePre.value = !dropdownVisiblePre.value;
};

const handleNodeSelectPre = (event) => {
    console.log("pre" + JSON.stringify(selectedKey.value));
    dropdownVisiblePre.value = false;
};

const selectedKeyLabel = computed(() => {
    return selectedFile.value ? selectedFile.value : '选择文件';
});

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
                        <Tree v-model:expandedKeys="expandedKeys" v-model:selectionKeys="selectedKey" :value="fileAttr.nodes" selectionMode="checkbox" @nodeSelect="onNodeSelect" @nodeUnselect="onNodeSelect" class="w-full md:w-[30rem] file-tree desktopView">
                        </Tree>
                        <div class="dropdown-container mobileView">
                            <div class="dropdown-toggle" @click="toggleDropdownPre">
                            <span class="showFile"><i :class="fileType"></i>{{ selectedKeyLabel }}</span>
                            <i class="pi pi-chevron-down"></i>
                            </div>
                            <div v-if="dropdownVisiblePre" class="dropdown-content checked">
                                <Tree v-model:expandedKeys="expandedKeys" v-model:selectionKeys="selectedKey" :value="fileAttr.nodes" selectionMode="checkbox" @nodeSelect="onNodeSelect" @nodeUnselect="onNodeSelect" class="w-full md:w-[30rem] file-tree">
                                </Tree>
                            <!-- <Tree
                                v-model:selectionKeys="selectedMobileKey"
                                v-model:expandedKeys="expandedKeys"
                                :value="fileAttr.nodes"
                                selectionMode="single"
                                @node-select="handleNodeSelectPre"
                            /> -->
                            </div>
                        </div>
                    </div>
                </div>
                <div class="codeSect">
                    <div class="codeText">
                        <CodeEditor :codeDoc="codeStr" :language="codeLang" :isEditable="isEditable" @update:codeDoc="handleCodeUpdate" @key-event="handleKeyEvent"/>
                    </div>
                    <div class="inputText">
                        <FloatLabel>
                            <Textarea v-if="disableRequest" disabled/>
                            <Textarea v-else v-model="requestVal" maxlength="500" @input="saveRequest" :invalid="noMatch"/>
                            <label>特别要求（比如“不要翻译任何姓名之类的词”）</label>
                        </FloatLabel>
                        <div v-if="!disableRequest" class="char-counter">
                            剩{{ remainingChars }}字
                        </div>
                    </div>
                </div>
            </div>
            <SelectLang 
            nextLink="#/translating" 
            @language-selected="submitLanguage" 
            @model-selected="submitModel" 
            :langSelections="allLang" 
            :modelSelections="allModels"
            :fileSelected="hasFileSel"
            :requestError="noMatch"
            />
            <a ref="nextLinkRef" href="#/translating" style="display: none;"></a>
        </div>
    </div>
</template>

<style scoped>

</style>
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
.codeSect{
    width: 70%;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding-bottom: 1rem;
}
.codeText {
    background-color: #282c34;
    width: 100%;
    height: 300px;
    overflow-y: scroll;
    border-radius: 0.5rem;
}
.inputText{
    height: 100px;
}
.inputText .p-textarea, .inputText .p-floatlabel{
    height: 100%;
    width: 100%;
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

.errorColor .p-tree-node-label, .errorColor .p-tree-node-icon{
    color: #e06c75;
}
.p-tree-node-content.p-tree-node-selected.errorColor .p-tree-node-label, .p-tree-node-content.p-tree-node-selected.errorColor .p-tree-node-icon{
    color: #e06c75;
}
.p-tree-node-content.p-tree-node-selected .p-tree-node-icon{
    color: inherit;
}
.p-textarea.p-invalid:enabled:focus{
    border-color: #f87171;
}

/* .muted-sect{
    background-color: #F0F2F5;
    padding: 2rem;
    border-radius: 10px;
} */
.char-counter {
    font-size: 0.8rem;
    color: #666;
    text-align: right;
    margin-top: 5px;
}
@media only screen and (max-width: 768px) {
    .reviewCode {
        flex-direction: column;
    }
    .directorySect, .codeSect{
        width: 100%;
    }
    .fileDir{
        height: auto;
        overflow-y:visible;
    }
}


.desktopView, div.desktopView {
    display: block;
}
.mobileView, div.mobileView{
    display: none;
}
@media only screen and (max-width: 768px) {
  .desktopView, div.desktopView {
      display: none;
  }
  .mobileView, div.mobileView{
      display: block;
  }
  .dropdown-container {
    position: relative;
}
    .dropdown-toggle {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        background-color: #fff;
    }
    .dropdown-content.checked {
        position: absolute;
        top: 100%;
        left: 0;
        background-color: white;
        border: 1px solid #ccc;
        z-index: 1000;
        width: 100%;
        max-height: 300px;
        overflow-y: auto;
        padding: 5vw;
    }
    .dropdown-toggle i {
        margin-left: auto;
    }
}
</style>

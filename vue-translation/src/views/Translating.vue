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
import { SendFile, PollingFile, RetryFile } from '../utils/apiCalls';
import { file } from 'jszip';

const apiError = ref(null);
const fileError = ref(false);
const selectedKey = ref(null);
const dropdownVisiblePre = ref(false);
const dropdownVisiblePost = ref(false);
const expandedKeys = ref({});
const fileCode = ref(fileAttr.fileBef);
const transArr = ref(fileAttr.fileAft);
const userID = ref(fileAttr.userId);
const selectLang = ref(fileAttr.selectedLanguage);
const selectModel = ref(fileAttr.selectedModel);
const nodes = ref(fileAttr.nodes);
const storeJwt = ref(fileAttr.userJwt);
const emit = defineEmits(['errorBool']);

const selectedFile = ref(null);
const fileType = ref('pi pi-fw pi-folder');
const loadVal = ref(0);
const buttonText = ref(`继续`);
const pgLoading = ref(true);
const errorBool = ref(false);
const completedBool = ref(false);
const allProcess = ref(0);
const doneProcess = ref(0);
const nextLinkRef = ref(null);
const restartLink = ref(null);
const sentArr = ref([]);
const failedFiles = ref([]);

// Computed property for progress string
const loadString = computed(() => {
    return `${doneProcess.value}/${allProcess.value} 已翻译`;
});

// Function to collect keys for expanding all nodes
const collectKeys = async (nodes, keys = {}) => {
  nodes.forEach(node => {
    keys[node.key] = true;
    if (node.children) {
      collectKeys(node.children, keys);
    }
  });
  return keys;
};

// Function to add completed class to nodes
const addCompleted = (fileArr, nodes) => {
    for (const [key, value] of Object.entries(fileArr)) {
        if (value.completed) {
            doneClass(nodes, value.key);
        }
    }
    return nodes;
};

// Function to add done class to nodes
const doneClass = (nodes, keyVal) => {
    nodes.forEach(node => {
        if (node.key === keyVal) {
            node.styleClass = "completedColor";
            node.icon = "pi pi-fw pi-check-circle";
        }
        if (node.children) {
            doneClass(node.children, keyVal);
        }
    });
}

// Delay function
const delay = (time) => {
  return new Promise(res => setTimeout(res, time));
}

// Polling function to check file status
const PollingFiles = async (fileArr, total, userId, userJwt) => {
    let done = 0;
    let state = '';
    console.log("check models "+ JSON.stringify(selectModel.value));
    for (const [key, value] of Object.entries(fileArr)) {
        if (value.translate) {
            for(var i=0; i<selectModel.value.length; i++){
                console.log('model name passed '+selectModel.value[i]);
                state = await HandlePolling(userId, value.fileId, userJwt, selectModel.value[i]);
                while (state === 'processing') {
                    await delay(1000);
                    state = await HandlePolling(userId, value.fileId, userJwt, selectModel.value[i]);
                }
                if (state === 'completed') {
                    done++;
                    value.completed = true;
                    loadVal.value = Math.floor((done / total) * 100);
                    doneProcess.value = done;
                }
                else{
                    
                    console.log('failed state '+state);
                    // console.log('errorBool should change');
                    console.log('failed file '+ JSON.stringify(value));
                    const newFailure = {
                        fileId: value.fileId,
                        content: value.content,
                        path: value.path,
                        model: selectModel.value[i],
                        request: value.request ? value.request : null,
                        error: state
                    }
                    failedFiles.value.push(newFailure);
                    pgLoading.value = false;
                    errorBool.value = true;
                    emit('errorBool', true);
                    emit('errMsg', '请检查您上传的代码或文件夹名');
                }
            }
            
        }
    }
    loadVal.value = Math.floor((done / total) * 100);
    return done;
}

// Check if all files are completed
const completedLoad = async (done, total) => {
    if (done === total) {
        loadVal.value = 100;
        await delay(300);
        completedBool.value = true;
    }
}

// Polling handler to check status
const HandlePolling = async (userId, fileId, userJwt, modelName) => {
    try {
        const data = await PollingFile(userId, fileId, userJwt, modelName);
        if(data.error){
            console.log('poll error '+data.error)
            pgLoading.value = false;
            errorBool.value = true;
            return data.error;
        }
        // if (data.error === 'Internal server error') {
        //     pgLoading.value = false;
        //     errorBool.value = true;
        // } else if (data.error === 'ID not found') {
        //     currentPath.value = '#/';
        // }
        return data.status;
    } catch (error) {
        apiError.value = error.message;
        emit('errorBool', true);
        throw error;
    }
}


// Function to find node by key
const findNodeByKey = (nodeList, searchKey) => {
    for (const [key, value] of Object.entries(nodeList)) {
        if (value.key === searchKey && value.name) {
            return [value.key, value];
        }
    }
    return null;
};

// Function to find label by key
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

// Prepare next step
const prepNext = async () => {
    fileAttr.prevPage = window.location.hash.slice(1) || '/';
    nextLinkRef.value.click();
}

// Submit selected files for translation
const SubmitSelected = async (fileArr, tarLang, userId, userJwt, modelNames) => {
    let sentArr = [];
    let reqArr = {};
    console.log("before submitfiles filearr " + fileArr.value);
    for (const [key, value] of Object.entries(fileArr)) {
        if(value.request){
            console.log('check request new pg '+value.request)
            reqArr[value.fileId] = value.request;
        }
        if (value.translate) {
            const newSent = {
                id: value.fileId,
                file: new Blob([value.content]), // Example Blob
                filePath: value.path
            };
            sentArr.push(newSent);
        }
    }
    console.log("before submitfiles " + sentArr.value);
    await SubmitFiles(userId, sentArr, userJwt, tarLang, modelNames, reqArr);
    return sentArr.length;
};

// Submit files
const SubmitFiles = async (userId, filesData, jwt, tarLang, modelNames, reqArr) => {
    try {
        // console.log("beforecallingapi "+filesData.value);
        // filesData.forEach(fileData => {
        //     console.log('i need help');
            
        // });
        const data = await SendFile(userId, filesData, jwt, tarLang, modelNames, reqArr);
        return data;
    } catch (error) {
        console.error('API Error:', error.message);
        throw error;
        
    }
};

const retryTranslation = async () => {
    for(const retryFile of failedFiles.value){
        console.log(retryFile);
        console.log(retryFile.error);
        if(retryFile.error == 'Bad Request: Invalid parameters.'){
            // await RetryFile(userID.value, storeJwt.value, retryFile.fileId, retryFile.model, retryFile.content, retryFile.path, selectLang.value, retryFile.request);
        }
        else if(retryFile.error == 'Internal server error'){
            await RetryFile(userID.value, storeJwt.value, retryFile.fileId, retryFile.model);
            const state = await HandlePolling(useruserID.value, retryFile.fileId, storeJwt.value, retryFile.model);
        }
        else{
            emit('errorBool', true);
            emit('errMsg', '请检查您上传的代码或文件夹名');
        }
    }
    
}

// Watch selected key
watch(selectedKey, (newVal) => {
    const key = Object.keys(newVal)[0];
    const node = findNodeByKey(fileCode.value, key);
    if (node !== null) {
        selectedFile.value = node[1].name;
        fileType.value = "pi pi-fw pi-file";
    } else {
        selectedFile.value = findLabelByKey(nodes.value, key);
        fileType.value = 'pi pi-fw pi-folder';
    }
});

// On mounted lifecycle hook
onMounted(async () => {
    sentArr.value = [];
    expandedKeys.value = await collectKeys(nodes.value);
    selectedFile.value = findLabelByKey(nodes.value, 0);

    allProcess.value = await SubmitSelected(transArr.value, selectLang.value, userID.value, storeJwt.value, selectModel.value)*selectModel.value.length;

    if(nodes.value.length == 0){
        // console.log("refresh to home");
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
    else if(fileAttr.prevPage!='/review'){
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

    pgLoading.value = false;

    doneProcess.value = await PollingFiles(transArr.value, allProcess.value, userID.value, storeJwt.value);
    await completedLoad(doneProcess.value, allProcess.value);
    addCompleted(transArr.value, nodes.value);
    
    

    // else if(fileAttr.gotToFinal!=null){
    //     // console.log("refresh to home");
    //     fileAttr.gotToFinal=null;
    //     window.location.href = '#/';
        
    // }
    
});
</script>

<template>
    <div class="muted-sect">
        <a href="#/" ref="restartLink" style="display: none;"></a>
        <div v-if="pgLoading" class="loading">
            <div class="loadingScreen">
                <ProgressSpinner style="width: 20%; height: 20%" strokeWidth="3" fill="transparent" animationDuration="2s" aria-label="Custom ProgressSpinner" />
                <h1 class="loadingTitle">
                    正在访问网页...
                </h1>
                <h3 class="notice">
                    您访问的网页快要好了...
                </h3>
            </div>
        </div>
        <div v-else class="loaded">
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
                        {{`${doneProcess}/${allProcess}`}} 文档已翻译
                    </h1>
                    <h3 class="notice done">
                        翻译出现问题
                    </h3>
                    <div class="errorActions">
                        <Button label="用原版" severity="secondary" outlined />
                        <Button type="button" label="重试文档" severity="danger" :badge="allProcess-doneProcess" @click="retryTranslation"/>
                    </div>
                </div>
                <div v-else-if="completedBool" class="success">
                    <i class="pi pi-check-circle" />
                    <h1 class="loadingTitle">
                        {{`${doneProcess}/${allProcess}`}} 文档已翻译
                    </h1>
                    <h3 class="notice done">
                        翻译已完成
                    </h3>
                    <div class="doneActions">
                        <a href="#/codecheck" ref="nextLinkRef" style="display: none;"></a>
                        <a @click.prevent="prepNext">
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
                    <LoadingBar :percentage="loadVal" :fileName="loadString"/>
                </div>
            </div>
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
/* .muted-sect{
    background-color: #F0F2F5;
    padding: 2rem;
    border-radius: 10px;
} */
</style>
<style>
.p-progressspinner-spin .p-progressspinner-circle{
    stroke: #006eff;
    animation: p-progressspinner-dash 1.5s ease-in-out infinite;
}
</style>

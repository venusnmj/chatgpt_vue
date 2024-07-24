

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { fileAttr } from '../shared/fileAttr.js';
import PrimeVue from 'primevue/config';
import Tree from 'primevue/tree';
import SelectButton from 'primevue/selectbutton';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import Textarea from 'primevue/textarea';
import FloatLabel from 'primevue/floatlabel';
import ProgressSpinner from 'primevue/progressspinner';
import "primeicons/primeicons.css";

import CodeEditor from '../components/CodeEditor.vue';
import ButtonGrad from '../components/ButtonGrad.vue';
import { GetTranslation, RetryFile, PollingFile } from '../utils/apiCalls';
import JSZip, { file } from 'jszip';
import FileSaver from 'file-saver';
import LoadingSection from '@/components/LoadingSection.vue';

const MAX_CHARS = 500;

const selectedKey = ref(null);
const dropdownVisiblePre = ref(false);
const dropdownVisiblePost = ref(false);
const expandedKeys = ref({});
const nodes = ref(fileAttr.nodes);
const fileCode = ref(fileAttr.fileBef);
// const transArr = ref(fileAttr.fileAft);
const userID = ref(fileAttr.userId);
const storeJwt = ref(fileAttr.userJwt);
const selectModel = ref(fileAttr.selectedModel);
const disModel = ref(fileAttr.displayModel);
const selectLang = ref(fileAttr.selectedLanguage);


const selectedFile = ref(null);
const fileType = ref('pi pi-fw pi-folder');

const agnText = ref(`重新再来`);
const downloadText = ref('下载压缩包');
const codeStr = ref();
const codeResult = ref();
const codeLang = ref();
const zipFolder = ref(''); 

const storeMod = ref(0);
const hasTrans = ref(false);
const activeChip = ref(null); 
const activeFile = ref();

const downloadModel = ref(disModel.value[0]);
const modelOptions = ref([]);
const downloadVisible = ref(false);
const downloadMod = ref(0);
const OptError = ref(false);
const fileRetry = ref(false); 
const fileEdit = ref(false);
const retryLoading = ref(false);

const emit = defineEmits(['errorBool', 'errMsg']);
const isLoading = ref(true);

const requestVal = ref('');
const remainingChars = computed(() => MAX_CHARS - requestVal.value.length);




// const options = ref(['One-Way', 'Return']);

const createOptions = async () => {
    // downloadModel.value = disModel.value[0];
    downloadMod.value = 0;
    for (var i=0; i<disModel.value.length; i++){
        const newOpt = {
            name: disModel.value[i],
            code: selectModel.value[i]
        }
        modelOptions.value.push(newOpt);
    }
    downloadModel.value = modelOptions.value[downloadMod.value];
}



const toggleDropdownPre = () => {
    dropdownVisiblePre.value = !dropdownVisiblePre.value;
};

const toggleDropdownPost = () => {
    dropdownVisiblePost.value = !dropdownVisiblePost.value;
};

const handleNodeSelectPre = (event) => {
    console.log("pre" + JSON.stringify(selectedKey.value));
    dropdownVisiblePre.value = false;
};

const handleNodeSelectPost = (event) => {
    console.log("post" + JSON.stringify(selectedKey.value));
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

const GetTranslated = async (userId, fileId, userJwt, modelName) => {
    try {
        const data = await GetTranslation(userId, fileId, userJwt, modelName);
        // console.log("new GetTranslation" + data.content);
        return data.content;
    } catch (error) {
        console.error('Error getting translation:', error.message);
        emit('errorBool', true);
        throw error;
    }
};

const addCode = async (fileArr) => {
    for (const [key, value] of Object.entries(fileArr)) {
        if (value.translate && value.completed) {
            console.log("no. of models " + selectModel.value.length);
            console.log("model? "+ value.models)
            const multiModel = [];
            for(var i=0; i<selectModel.value.length; i++){
                // value.transCode.push()
                // const codeName = "code"+selectModel.value[i];
                const translation = await GetTranslated(userID.value, value.fileId, storeJwt.value, selectModel.value[i]);
                console.log("translation of "+selectModel.value[i]+ " is "+translation);
                multiModel.push(translation);
            }
            // console.log('multiModel ' + multiModel);
            value.transCode = multiModel;
            console.log('multiModel ' + value.transCode.length);
            console.log('final '+value.transCode);
            
        } else if (!value.translate) {
            value.transCode = value.code;
        }
    }
    updateTreeWithTransCode(fileAttr.nodes, fileArr);
};

const updateTreeWithTransCode = (nodes, fileArr) => {
    nodes.forEach(node => {
        const file = fileArr.find(f => f.key === node.key);
        if (file) {
            node.transCode = file.transCode;
            node.translate = file.translate;
            node.completed = file.completed;
        }
        if (node.children) {
            updateTreeWithTransCode(node.children, fileArr);
        }
    });
};

onMounted(async () => {
    await createOptions();
    console.log("model on codecheck pg: "+ JSON.stringify(selectModel.value) )
    await addCode(fileAttr.fileBef);
    expandedKeys.value = collectKeys(fileAttr.nodes);
    selectedFile.value = findLabelByKey(fileAttr.nodes, 0);

    activeChip.value = disModel.value[0];
    

    // fileAttr.gotToFinal = true;

    if(nodes.value.length == 0){
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
    else if(fileAttr.prevPage!='/translating'){
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
    isLoading.value = false;

    // else if(fileAttr.gotToStart != null){
    //     // fileAttr.fileAft = [];
    //     // fileAttr.gotToFinal=null;
    //     fileAttr.gotToStart = null;
        
    //     window.location.href = '#/';
    // }
    // console.log('after retry '+fileAttr.gotToStart);


});

const findNodeByKey = (nodeList, searchKey) => {
    for (const [key, value] of Object.entries(nodeList)) {
        if (value.key === searchKey && value.name) {
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

const traverseTree = async (nodes, zip, path = '') => {
    console.log("zip version "+downloadMod.value);
    nodes.forEach(node => {
        console.log("what's in each node: "+node.transCode);
        
      if(node.key == 0){
        zipFolder.value = node.label;
      }
        const currentPath = path ? `${path}/${node.label}` : node.label;
        console.log("path is " + currentPath);
        if (node.children.length != 0) {
          console.log("path has "+ node.children.length+ " child at " + currentPath);
          traverseTree(node.children, zip, currentPath);
        } else {  
            if(node.translate && node.completed){
                for(var i=0; i<node.transCode.length; i++){
                    if(node.transCode[downloadMod.value]){
                        // console.log(node.transCode[downloadMod.value]);
                        console.log(`Adding file: ${currentPath}`);
                        zip.file(currentPath, node.transCode[downloadMod.value]);
                    }
                    else if(node.content){
                        console.log(`image? ${currentPath}`);
                        zip.file(currentPath, node.content);
                    }
                    else {
                        console.log(node);
                        console.warn(`Skipping empty file: ${currentPath}`);
                    }
                }
            }
            else{
                if(node.transCode){
                    // console.log(node.transCode);
                    console.log(`Adding file: ${currentPath}`);
                    zip.file(currentPath, node.transCode);
                }
                else if(node.content){
                    console.log(`image? ${currentPath}`);
                    zip.file(currentPath, node.content);
                }
                else {
                    console.log(node);
                    console.warn(`Skipping empty file: ${currentPath}`);
                }
            }
            
        }
    });
};

const handleDownloadClick = async () => {
    if(downloadModel.value == null){
        OptError.value = true;
    }
    else{
        OptError.value = false;
        const zip = new JSZip();
        await traverseTree(fileAttr.nodes, zip);

        const content = await zip.generateAsync({ type: 'blob' });
        console.log("Zip file content:", content);
        FileSaver.saveAs(content, `${zipFolder.value}_translated.zip`);
        downloadVisible.value = false
    }

};

const changeCodeModel = async (label) => {
    // console.log('how to get model '+label);
    // console.log('if more than or eq 2 ' + selectModel.value.length);
    activeChip.value = label;
    console.log('Selected model label:', label);

    if(disModel.value.length > 1){
        for(var i=0; i<disModel.value.length; i++){
            if( label == disModel.value[i] ){
                // selectModel.value[i]
                storeMod.value = i;
            }
        }
    }
    console.log('storeMod is ' + storeMod.value)


}


watch (storeMod, (newVal) => {
    const node = findNodeByKey(fileCode.value, activeFile.value);
    if (node !== null) {
        selectedFile.value = node[1].name;
        // fileType.value = "pi pi-fw pi-file";
        // console.log(node[1].code);

        codeStr.value = `${node[1].code}`;

        // console.log(node[1].transCode[storeMod.value]);
        // console.log(storeMod.value);
        console.log(node[1]);
        if(node[1].error && node[1].error.length != 0 && (node[1].completed != true)){
            
            console.log('check this err '+selectModel.value[storeMod.value])
            for(const err of node[1].error){
                if(err.model == selectModel.value[storeMod.value]){
                    console.log('get right err '+ err.error);
                    if(err.error == 'Internal server error'){
                        fileEdit.value = false;
                        fileRetry.value = true;
                    }
                    else if(err.error == 'Bad Request: Invalid parameters.'){
                        requestVal.value = node[1].request;
                        fileRetry.value = false;
                        fileEdit.value = true;
                    }
                }
            }
            

        }else{
            fileRetry.value = false;
            fileEdit.value = false;
            codeResult.value = `${node[1].transCode[storeMod.value]}`;
        }
        // codeResult.value = `${node[1].transCode[storeMod.value]}`;
    }
})



watch(selectedKey, (newVal, oldVal) => {
    // console.log(Object.keys(newVal));
    const key = Object.keys(newVal)[0];
    activeFile.value = key;
    console.log("should i save this key? "+key)
    const node = findNodeByKey(fileCode.value, key);
    if (node !== null) {
        selectedFile.value = node[1].name;
        if(node[1].completed){
            fileRetry.value = false;
            fileEdit.value = false;
            fileType.value = "pi pi-fw pi-check-circle";
        }
        else if(node[1].error && node[1].error.length != 0  && (node[1].completed != true)){
            // fileRetry.value = true;
            // fileEdit.value = false;
            fileType.value = "pi pi-fw pi-exclamation-circle";
        }
        else{
            fileRetry.value = false;
            fileEdit.value = false;
            fileType.value = "pi pi-fw pi-file";
        }
        
        // console.log(node[1].code);

        codeStr.value = `${node[1].code}`;

        console.log("check node "+ JSON.stringify(node[1]));
        // console.log(storeMod.value);

        if(!node[1].translate){
            codeResult.value = `${node[1].transCode}`;
            hasTrans.value = false;
        }
        else{
            if(node[1].error && node[1].error.length != 0 && (node[1].completed != true)){
                // codeResult.value = `文件翻译出现了问题 ${storeMod.value}`;
                // console.log(node[1]);
                console.log('check this err '+selectModel.value[storeMod.value])
                for(const err of node[1].error){
                    if(err.model == selectModel.value[storeMod.value]){
                        console.log('get right err '+ err.error);
                        if(err.error == 'Internal server error'){
                            fileEdit.value = false;
                            fileRetry.value = true;
                        }
                        else if(err.error == 'Bad Request: Invalid parameters.'){
                            requestVal.value = node[1].request;
                            fileRetry.value = false;
                            fileEdit.value = true;
                            
                        }
                    }
                }
                
            }else{
                codeResult.value = `${node[1].transCode[storeMod.value]}`;
            }
            hasTrans.value = true;
            
        }
        
        


        codeLang.value = node[1].type;
        // if (codeLang.value == "py") {
        //     codeLang.value = "python";
        // } else if (codeLang.value == "js") {
        //     codeLang.value = "javascript";
        // }
        console.log("codeLang: " + codeLang.value);
    } else {
        selectedFile.value = findLabelByKey(fileAttr.nodes, key);
        console.log(selectedFile.value);
        fileType.value = 'pi pi-fw pi-folder';
        codeStr.value = '请选择文档来展示';
        codeResult.value = '请选择文档来展示';
        hasTrans.value = false;
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
                        codeResult.value = `${node[1].transCode}`;
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

const storeOpt = () => {
    console.log(downloadModel.value);
    if(downloadModel.value != null){
        for(var i=0; i<disModel.value.length; i++){
            if(downloadModel.value.name == disModel.value[i]){
                downloadMod.value = i;
            }
        }
        console.log(downloadMod.value);
    }
    
}


const handleCodeUpdate = (newCode) => {
    codeStr.value = newCode;
};
const handleResultUpdate = (newCode) => {
    codeResult.value = newCode;

    console.log('model to update: ' + selectModel.value[storeMod.value]);
    console.log('file to update: ' + activeFile.value);
    console.log(codeResult.value);
    const node = findNodeByKey(fileCode.value, activeFile.value);
    if (node !== null) {
        console.log(node[1].name);
        if(node[1].translate && node[1].completed){
            node[1].transCode[storeMod.value] = codeResult.value;
        }
        else{
            node[1].transCode = codeResult.value;
        }
    }
};

const againButton = async () => {
    fileAttr.selectedLanguage = null;
    fileAttr.selectedModel = [];
    fileAttr.displayModel = [];
    fileAttr.nodes = [];
    fileAttr.fileBef = [];
    fileAttr.fileAft = [];
    // fileAttr.gotToFinal = null;
    // fileAttr.gotToStart = true;
    fileAttr.prevPage = window.location.hash.slice(1) || '/';
    window.location.href = '#/';
}

const retryTranslation = async () => {
    console.log(selectedFile.value);
    console.log(activeFile.value);
    console.log(storeMod.value);
    const node = findNodeByKey(fileCode.value, activeFile.value);
    console.log(node);

    for(var i=0; i<selectModel.value.length; i++){
        await RetryFile(userID.value, storeJwt.value, node[1].fileId, selectModel.value[i], node[1].content, node[1].path, selectLang.value, node[1].request);
        let state = await HandlePolling(userID.value, node[1].fileId, storeJwt.value, selectModel.value[i]);
        while (state === 'processing') {
            retryLoading.value = true;
            await delay(1000);
            state = await HandlePolling(userID.value, node[1].fileId, storeJwt.value, selectModel.value[i]);
        }
        if (state === 'completed') {
            
            // codeResult.value = 

            const multiModel = [];
            const translation = await GetTranslated(userID.value, node[1].fileId, storeJwt.value, selectModel.value[i]);
            multiModel.push(translation);

            if(node[1].transCode){
                node[1].transCode[i] = translation;
            }
            else{
                multiModel[i] = translation;
                node[1].transCode = multiModel;
            }

            if(i==(selectModel.value.length-1)){
                console.log(state);
                node[1].completed = true;
                fileType.value = "pi pi-fw pi-check-circle";
                fileEdit.value = false;
                fileRetry.value = false;
                retryLoading.value = false;
                await addCode(fileAttr.fileBef);
                // codeResult.value = node[1].transCode[storeMod.value];
            }
            if(selectModel.value[storeMod.value] == selectModel.value[i]){
                codeResult.value = node[1].transCode[storeMod.value];
            }
            
            console.log('final '+node[1].transCode);
            
            doneClass(nodes.value, node[1].key);
            
        }
        else{
            fileEdit.value = true;
            fileRetry.value = false;
            retryLoading.value = false;
        }
        // console.log(state);
    }

    // await RetryFile(userID.value, storeJwt.value, node[1].fileId, selectModel.value[storeMod.value], node[1].content, node[1].path, selectLang.value, node[1].request);
    // //RetryFile
    // let state = await HandlePolling(userID.value, node[1].fileId, storeJwt.value, selectModel.value[storeMod.value]);

    // while (state === 'processing') {
    //     await delay(1000);
    //     state = await HandlePolling(userID.value, node[1].fileId, storeJwt.value, selectModel.value[storeMod.value]);
    // }
    // if (state === 'completed') {
    //     // codeResult.value = 

    //     const multiModel = [];
    //     const translation = await GetTranslated(userID.value, node[1].fileId, storeJwt.value, selectModel.value[storeMod.value]);
    //     if(node[1].transCode){
    //         node[1].transCode[storeMod.value] = translation;
    //     }
    //     else{
    //         multiModel[storeMod.value] = translation;
    //         node[1].transCode = multiModel;
    //     }
        
    //     console.log('final '+node[1].transCode);
    //     codeResult.value = node[1].transCode[storeMod.value];
    //     doneClass(nodes.value, node[1].key);
        
    //     fileEdit.value = false;
    //     fileRetry.value = false;
    // }
    // else{
    //     fileEdit.value = true;
    //     fileRetry.value = false;
    // }
    // console.log(state);

}

const resendTranslation = async () => {
    console.log(selectedFile.value);
    console.log(activeFile.value);
    console.log(storeMod.value);
    const node = findNodeByKey(fileCode.value, activeFile.value);
    console.log(node);
    //RetryFile
}

// Delay function
const delay = (time) => {
  return new Promise(res => setTimeout(res, time));
}

const HandlePolling = async (userId, fileId, userJwt, modelName) => {
    try {
        const data = await PollingFile(userId, fileId, userJwt, modelName);
        if(data.error){
            // console.log('poll error '+data.error)
            // pgLoading.value = false;
            // errorBool.value = true;
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

const saveRequest = (event) => {
    // console.log('request changed '+event.target.value);
    checkRequest(nodes.value)
}
const checkRequest = (nodes) => {
    nodes.forEach(node => {
        if(node.key == activeFile.value){
            console.log('request update ' + requestVal.value);
            editRequest(fileCode.value, node.key, requestVal.value);
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
            console.log(value.request);
        }
    }
}


</script>
<template>
    <Dialog v-model:visible="downloadVisible" modal header="Edit Profile" :style="{ width: '25rem' }">
        <template #header>
            <h3>选择模型来下载压缩包</h3>
        </template>
        <div class="dlPopBody">
            <SelectButton v-model="downloadModel" :options="modelOptions" optionLabel="code" dataKey="code" aria-labelledby="custom" @click="storeOpt">
                <template #option="slotProps">
                    {{ slotProps.option.name }}
                </template>
            </SelectButton>
            <div class="dlPopErrorMsg" v-if="OptError">
                <p>请选择模型</p>
            </div>
        </div>
        <template #footer>
            <Button label="取消" outlined severity="secondary" @click="downloadVisible = false" autofocus />
            <Button label="下载" severity="info" @click="handleDownloadClick" autofocus />
        </template>
    </Dialog>
    <LoadingSection v-if="isLoading"/>
    <div class="muted-sect" v-else>
      <div class="filesCtrl">
        <div class="pre-Ctrl desktopView">
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
        <div class="arr-Ctrl desktopView">
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
      <div class="modelChoose">
          <div class="modelDisplay desktopView">
              <Chip label="原版" class="selected"/>
          </div>
          <div class="modelDisplay">
            
              <Chip v-if="hasTrans" v-for="mod in disModel" 
              :key="mod"
              :label="mod"
              :class="{ active: activeChip === mod }" 
              @click="changeCodeModel(mod)"/>
              <Chip v-else label="原版" class="selected"/>
              <!-- <Chip label="Action" className="chipModel"/> -->
              <!-- <Chip label="Comedy" className="chipModel"/> -->
          </div>
      </div>
      <div class="codeHandle">
        <div class="eqHeight">
            <div v-if="fileEdit" class="codeBef reSubmit">
                <CodeEditor :codeDoc="codeStr" :language="codeLang" @update:codeDoc="handleCodeUpdate" :isEditable="true"/>
                <div class="inputText">
                    <FloatLabel>
                        <Textarea v-model="requestVal" maxlength="500" @input="saveRequest" class="desktopView"/>
                        <Textarea v-model="requestVal" maxlength="500" @input="saveRequest" autoResize class="mobileView"/>
                        <label>特别要求（比如“不要翻译任何姓名之类的词”）</label>
                    </FloatLabel>
                    <div class="char-counter">
                        剩{{ remainingChars }}字
                    </div>
                </div>
            </div>
            <div v-else class="codeBef desktopView">
                <CodeEditor :codeDoc="codeStr" :language="codeLang" @update:codeDoc="handleCodeUpdate" :isEditable="false"/>
            </div>
            <div v-if="fileEdit" class="codeAft">  
                
                <div v-if="retryLoading" class="loading">
                    <div class="loadingScreen">
                        <ProgressSpinner style="width: 50%; height: 50%" strokeWidth="3" fill="transparent" animationDuration="2s" aria-label="Custom ProgressSpinner" />
                        <h1 class="loadingTitle">
                            正在访问网页...
                        </h1>
                        <h3 class="notice">
                            您访问的网页快要好了...
                        </h3>
                    </div>
                </div>
                <div v-else class="retryCol">
                    <i class="pi pi-times-circle" />
                    
                    <h1 class="retryTitle">
                        翻译出现问题   <br>    
                        <span class="retryContent">修改再重试</span>
                    </h1>
                    
                    <Button type="button" label="重试翻译文档" severity="danger" @click="retryTranslation"/>
                </div>
            </div>
            <div v-else-if="fileRetry" class="codeAft">  
                <div class="retryCol">
                    <i class="pi pi-times-circle" />
                    <h1 class="retryTitle">
                        翻译出现问题
                    </h1>
                    <Button type="button" label="重试翻译文档" severity="danger" @click="resendTranslation"/>
                </div>
                
            </div>
            <div v-else class="codeAft">
                <CodeEditor :codeDoc="codeResult" :language="codeLang" @update:codeDoc="handleResultUpdate"/>
            </div>
        </div>
      </div>
      <!-- <div class="modelOpt">
        <SelectButton v-model="downloadModel" :options="modelOptions" optionLabel="code" dataKey="code" aria-labelledby="custom">
            <template #option="slotProps">
                {{ slotProps.option.name }}
            </template>
        </SelectButton>
      </div> -->
      <div class="endBtn">
        <div class="btnBtm">
          <ButtonGrad className="btnTrans btnRight" :htmlContent="downloadText" @click="downloadVisible = true"/>
        </div>
        <div class="btnBtm">
          <a @click="againButton">
            <ButtonGrad className="btnTrans" :htmlContent="agnText"/>
          </a>
        </div>
      </div>
    </div>
  </template>
<style scoped>
.filesCtrl {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
}
i.icon-right {
    font-size: 2rem;
    color: white;
}
.arr-Ctrl {
    height: 3rem;
    width: 3rem;
    background-image: linear-gradient(90deg, #006eff, #13adff);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3rem;
    align-self: flex-start;
}
.dropdown-container {
  position: relative;
}

div.pre-Ctrl, div.post-Ctrl {
    width: 45%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem 1rem;
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
.showFile {
    display: flex;
    gap: 1rem;
    align-items: center;
}
.showFile .pi-check-circle{
    color: #16a34a;
}
.showFile .pi-exclamation-circle{
    color: #e06c75;
}
.cm-editor.ͼo {
  height: 100%;
  border-radius: 0.5rem;
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
.btnRight {
    align-self: flex-end;
}
a {
  text-decoration: none;
}
.endBtn {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0rem;
}

div.codeBef, div.codeAft {
    width: 49%;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    background-color: #282c34;
    border-radius: 0.5rem;
}


div.btnBtm {
    width: 49%;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

div.codeBef, div.codeAft {
    height: auto;
}



.codeHandle {
    max-height: 400px;
    overflow-y: scroll;
    border-radius: 0.5rem;
}
.eqHeight{
    display: flex;
    gap: 1rem;
    align-items: stretch;
    justify-content: space-between;
    border-radius: 0.5rem;
}
.retryCol i.pi-times-circle{
    font-size: 7rem;
    color: #ef4444;
}
.retryTitle{
    color: #fff;
    text-align: center;
    line-height: normal;
}
.retryContent{
    font-size: 1rem;
    color: #fff;
}
.retryCol{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1rem 2rem;
    height: 400px;
}

div.reSubmit .cm-editor{
    max-height: 250px;
}
div.reSubmit{
    background-color: transparent;
    /* padding-bottom: 2rem; */
}
.reSubmit .inputText{
    height: auto;
}
.loadingScreen{
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    gap: 1rem;
    padding: 3rem;
    color: #fff;
}

.modelChoose{
    display: flex;
    justify-content: space-between;
    padding: 1.5rem 0rem;
}
.modelDisplay{
    width: 49%;
    display: flex;
    gap: 0.5rem;
    /* justify-content: center; */
}
.p-chip{
    background-color: #fff;
    padding: 0.2rem 1rem;
}
.p-chip:hover{
    cursor: pointer;
    background-color: #d0def4;
}
.modelDisplay .p-chip.selected{
    background-color: #d0def4;
}
.p-chip.active {
    background-color: #d0def4;
}
.dlPopBody{
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.dlPopErrorMsg{
    color: #e06c75;
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
  div.post-Ctrl, div.codeAft, .modelDisplay{
    width: 100%;
  }
  .eqHeight{
    flex-direction: column;
  }
  div.reSubmit{
    width: 100%;
  }
}
</style>
<style>
.p-togglebutton.p-togglebutton-checked{
    color: #006eff;
}
</style>

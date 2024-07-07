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
import { SendFile, PollingFile, RetryFile, GetTranslation } from '../utils/apiCalls';


const apiError = ref(null);

const selectedKey = ref(null);
const dropdownVisiblePre = ref(false);
const dropdownVisiblePost = ref(false);
const expandedKeys = ref({});
const fileCode = ref(fileAttr.fileBef);
const transArr = ref(fileAttr.fileAft);
const userID = ref(fileAttr.userId);
const selectLang = ref(fileAttr.selectedLanguage);
// var oldnodes = fileAttr.nodes;
const nodes = ref(fileAttr.nodes);
const storeJwt = ref(fileAttr.userJwt);

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

const sentArr = ref([]);



// const isTranslating = ref(false);
// const needRetry = ref(false);
// const isDone = ref(false);


const loadString = computed(() => {
    return `${doneProcess.value}/${allProcess.value} 已翻译`
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

const collectKeys = async (nodes, keys = {}) => {
  nodes.forEach(node => {
    keys[node.key] = true;
    if (node.children) {
      collectKeys(node.children, keys);
    }
  });
  return keys;
};

const addCompleted = (fileArr, nodes) => {
    for (const [key, value] of Object.entries(fileArr)) {
        if(value.completed){
            console.log("done is "+value.key);
            doneClass(nodes, value.key);
        }
    }
    return nodes;
};

const doneClass = (nodes, keyVal) => {
    nodes.forEach(node => {
        if(node.key == keyVal){
            node.styleClass = "completedColor";
            node.icon = "pi pi-fw pi-check-circle"
        }
        if (node.children) {
            doneClass(node.children, keyVal);
        }
    })
    console.log(nodes);
}

const delay = (time) => {
  return new Promise(res => {
    setTimeout(res,time)
  });
}

// const GetTranslated = async (userId, fileId, userJwt) => {
//     try {
//         const data = await GetTranslation(userId, fileId, userJwt);
//         console.log(data.content)
//         return data.content;
//     } catch (error) {
//         apiError.value = error.message;
//         throw error;
//     }
// }

const PollingFiles = async (fileArr, total, userId, userJwt) => {
    let done = 0;
    let state = '';
    // let allProcess = 0;
    for (const [key, value] of Object.entries(fileArr)) {
        if(value.translate){
            state = await HandlePolling(userId , value.fileId, userJwt);
            while(state == 'processing'){
                console.log("to translate "+value.key + " " + value.path);
                await delay(300);
                state = await HandlePolling(userId, value.fileId, userJwt);
            }
            if(state == 'completed'){
                done++;
                value.completed = true;
                console.log("old completed status true:" + value.key + Object.values(fileAttr.fileBef));
                // value.code = await GetTranslated(userId, value.fileId, userJwt)
            }
            
        }
    }
    
    console.log(done + "/" + total);
    console.log(Math.floor((done/total)*100));
    loadVal.value = Math.floor((done/total)*100);
    return done;

    
}

const completedLoad = async (done, total) => {
    if(done == total){
        loadVal.value = 100;
        delay(300);
        completedBool.value = true;
    }
}

const HandlePolling = async (userId, fileId, userJwt) => {
    try {
        const data = await PollingFile(userId, fileId, userJwt);
        console.log(data.status)
        return data.status;
    } catch (error) {
        apiError.value = error.message;
        throw error;
    }
}

onMounted(async () => {
    sentArr.value = [];
    console.log("start of translating "+ JSON.stringify(fileAttr.fileBef));
    expandedKeys.value = await collectKeys(nodes.value);
    selectedFile.value = findLabelByKey(nodes.value, 0);

    allProcess.value = await SubmitSelected(transArr.value, selectLang.value, userID.value, storeJwt.value);
    console.log("all submitted processes "+allProcess.value)
    pgLoading.value = false;

    console.log("before polling: "+ JSON.stringify(fileAttr.fileBef));
    //PollingFiles writes on new array
    doneProcess.value = await PollingFiles(transArr.value, allProcess.value, userID.value, storeJwt.value);
    await completedLoad(doneProcess.value, allProcess.value);
    console.log("after polling: "+ JSON.stringify(fileAttr.fileBef));
    console.log("array after: "+ JSON.stringify(transArr.value));
    addCompleted(transArr.value, nodes.value);
    console.log("end of mounting: "+ JSON.stringify(fileAttr.fileBef));
})

// onMounted(() => {
//     sentArr.value = [];
//     console.log("start of translating "+ JSON.stringify(fileAttr.fileBef));
//     expandedKeys.value = collectKeys(nodes.value);
//     selectedFile.value = findLabelByKey(nodes.value, 0);
//     // expandedKeys.value = collectKeys(fileAttr.nodes);
//     // selectedFile.value = findLabelByKey(fileAttr.nodes, 0);
// });

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

const prepNext = async () => {
    // fileAttr.fileAft = transArr.value;
    console.log("check prior content: "+ JSON.stringify(fileAttr.fileBef));
    console.log("check translated content: "+ JSON.stringify(fileAttr.fileAft));
    nextLinkRef.value.click();
}

const SubmitSelected = async (fileArr, tarLang, userId, userJwt) => {
    let sentArr = [];
    for (const [key, value] of Object.entries(fileArr)) {
        if(value.translate){
            console.log(userId + " " + value.fileId + " " + tarLang + " " + value.path);
            console.log("file content is " + value.content);

            const newSent = {
                id: value.fileId,
                file: new Blob([value.content]), // Example Blob
                targetLanguage: tarLang,
                filePath: value.path
            };
            sentArr.push(newSent);
        }
    }
    console.log("filesData", sentArr);
    await SubmitFiles(userId, sentArr, userJwt);
    return sentArr.length;
};

const SubmitFiles = async (userId, filesData, jwt) => {
    try {
        const data = await SendFile(userId, filesData, jwt);
        console.log(data);
        return data;
    } catch (error) {
        console.error('API Error:', error.message);
        throw error;
    }
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
        // selectedFile.value = findLabelByKey(fileAttr.nodes, key);
        selectedFile.value = findLabelByKey(nodes.value, key);
        console.log(selectedFile.value);
        fileType.value = 'pi pi-fw pi-folder';
    }
    
})

</script>

<template>
    <div class="muted-sect">
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
                        {{`${doneProcess}/${allProcess}`}} 文档已翻译
                    </h1>
                    <h3 class="notice done">
                        翻译已完成
                    </h3>
                    <div class="doneActions">
                        <a href="#/codecheck" ref="nextLinkRef"  style="display: none;"></a>
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
.muted-sect{
    background-color: #F0F2F5;
    padding: 2rem;
    border-radius: 10px;
}
.loadingScreen{
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    gap: 1rem;
    padding: 3rem;
}

</style>
<style>
.p-progressspinner-spin .p-progressspinner-circle{
    stroke: #006eff;
    animation: p-progressspinner-dash 1.5s ease-in-out infinite;
}


</style>

<script setup>
import { ref, computed, onMounted } from 'vue';
import JSZip from 'jszip';
import LoadingBar from '../components/LoadingBar.vue';
import ButtonGrad from '../components/ButtonGrad.vue';
import { fileAttr } from '../shared/fileAttr.js';
import { GetTranslatable, GetUserIp, GetSetup, GetHistory, PutUserId, AuthenticateUser } from '../utils/apiCalls';
import { getCookie, setCookie } from '../utils/getcookie';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import ProgressSpinner from 'primevue/progressspinner';



const buttonText = ref(`<i class='btnicon iconfont icon-upload'></i>上传文档`);
const nextText = `选择翻译语言`;

const props = defineProps({
  percentage: Number,
  fileName: String,
});

const files = ref([]);
const directories = ref([]);
const befFiles = ref([]);
const folderKeys = ref([]);
const loadVal = ref(0);
const hasFiles = computed(() => files.value.length > 0);
const fileArea = ref(null);
const fileInput = ref(null);
const nextLinkRef = ref(null);
const serverDown = ref(null)


const apiError = ref(null);
// const fileTranslatable = ref(null);
const listTrans = ref(null); 
const userIp = ref(null);
const userRandom = ref(null);
const currentDate = ref(null);
const userId = ref(null);
const storeJwt = ref(null);

const visible = ref(false);

const isLoading = ref(true);

const excludeFiles = ref([]);
const excludeFolders = ref([]);

const hasHistory = ref(false);
const fileHistory = ref([]);


const computedWidth = computed(() => {
  return `${props.percentage}%`;
});

const handleDragOver = (event) => {
  event.preventDefault();
  fileArea.value.classList.add('drag-over');
  event.dataTransfer.dropEffect = 'copy';
  loadVal.value = 0;
};

const handleDragLeave = () => {
  fileArea.value.classList.remove('drag-over');
};

const handleDrop = async (event) => {
  fileArea.value.classList.remove('drag-over');
  event.preventDefault();
  const droppedFiles = event.dataTransfer.files;
  await processFiles(droppedFiles);
};

const handleFileSelect = async (event) => {
  const selectedFiles = event.target.files;
  await processFiles(selectedFiles);
};



const prepSharedData = async (fileList) => {
  files.value = Array.from(fileList);
  directories.value = [];
  befFiles.value = [];
  folderKeys.value = [];
  const keyCounter = { value: 0 };

  const getKey = () => {
    return (keyCounter.value++).toString();
  };

  for (const file of fileList) {
    if (file.name.endsWith('.zip')) {
      // console.log("im calling uncompressZip");
      await uncompressZip(file);
    } else {
      // Update the entries with the translatable status
      await handleIndividualFile(file, getKey);
    }
  }
  // console.log("prepSharedData befFiles: " + befFiles.value);
  // console.log("prepSharedData directories: " + directories.value);
  return [befFiles.value, directories.value];
}

const getFileTranslatable = async (nodeList) => {
  // console.log("Initial nodeList: ", JSON.stringify(nodeList));
  // console.log("befFiles before translatable: ", JSON.stringify(befFiles.value, null, 2));
  try {
    const allPath = [];
    for (const [key, value] of Object.entries(nodeList)) {
      // console.log(value.path);
      allPath.push(value.path);
    }
    // console.log(allPath);
    console.log(storeJwt.value);

    const data = await GetTranslatable(userId.value, allPath, storeJwt.value);
    listTrans.value = data;
    // console.log("Translatable list: ", JSON.stringify(listTrans.value));
    return data;
  } catch (error) {
    apiError.value = error.message;
    console.error("Error in getFileTranslatable:", error);
    throw error;
  }
};

const processFiles = async (fileList) => {
  const arrResult = await prepSharedData(fileList);
  
  befFiles.value = arrResult[0];
  directories.value = arrResult[1];

  // console.log('processFiles:\n' + befFiles.value + directories.value);
  
  await getFileTranslatable(befFiles.value);

  await assignSelectableTree(directories.value);
  await assignSelectableList(befFiles.value);

  fileAttr.nodes = directories.value;
  fileAttr.fileBef = befFiles.value;
  fileAttr.folders = folderKeys.value;
  // console.log("fileAttr nodes: ", JSON.stringify(fileAttr.nodes));
  // console.log("fileAttr fileBef: ", JSON.stringify(fileAttr.fileBef));
  loadVal.value = 100;
};

const assignSelectableTree = async (nodes) => {
  nodes.forEach(node => {

      // console.log("tree node " + node.path);
      if (!node.path.includes('.')) {
        // console.log("folder node true " + node.key);        
        node.selectable = true;
        // console.log("folder node true " + JSON.stringify(node));

      }
      else{
        for (const fileT of listTrans.value) {
          if (fileT.filePath === node.path) {
            // console.log("key node true key " + node.key);
            node.selectable = true;
            // console.log("key node true " + JSON.stringify(node));
          }
        }
      }
      

      if (node.children) {
        assignSelectableTree(node.children);
      }

      if(!node.selectable){
        node.selectable = false;
      }
      // console.log("key node end " + JSON.stringify(node));

  });
  
};

const assignSelectableList = async (nodeList) => {
  // const nodeList = befFiles.value;
  for (const [key, value] of Object.entries(nodeList)) {
    for (const fileT of listTrans.value) {
      if (fileT.filePath === value.path) {
        console.log("assign fileId "+fileT.fileId);
        value.selectable = true;
        value.fileId = fileT.fileId
      }
    }
    if(!value.selectable){
      value.selectable = false;
    }
  }
}

// const checkSelectable = async (nodeList, keyVal) => {
//   for (const [key, value] of Object.entries(nodeList)) {
//     if(value.key == keyVal){
//       console.log('key: '+ value.key);
//       console.log('path:'+ value.path);
//       return value;
//     }
//       // console.log("list node "+value.path);
//   }
// }

// const assignFileId = (relativePath) => {
//   if (relativePath.includes('.')) {
//     for (const fileT of listTrans.value) {
//       if (fileT.filePath === relativePath) {
//         console.log("assign fileId "+fileT.fileId);
//         return (fileT.fileId);
//       }
//     }
//   }
//   return null;
// }


const handleIndividualFile = async (file, getKey) => {
  if (!(file.name.includes('__MACOSX') || file.name.includes('DS_Store') || file.name.endsWith('/'))) {
    const fileContent = await readFileContent(file);
    // const fileTranslatable = assignSelectable(file.name);
    // console.log("get this bool for " + file.name + ": " + fileTranslatable);
    const newEntry = {
      key: getKey(),
      label: file.name,
      path: file.name,
      icon: 'pi pi-fw pi-file',
      data: `${file.name} File`,
      children: [],
      // selectable: fileTranslatable,
      fileType: file.name.split('.').pop(),
    };

    befFiles.value.push({
      key: newEntry.key,
      type: file.name.split('.').pop(),
      path: file.name,
      name: file.name,
      content: file,
      code: fileContent,
      // selectable: fileTranslatable,
      // fileId: assignFileId(file.name)
    });

    directories.value.push(newEntry);
  }
};


const uncompressZip = async (file) => {
  const jszip = new JSZip();
  befFiles.value = [];
  try {
    const zip = await jszip.loadAsync(file);
    const treeData = [];
    const keyCounter = { value: 0 };

    const getKey = () => {
      return (keyCounter.value++).toString();
    };

    const addEntry = async (relativePath, blob, content) => {
      const pathParts = relativePath.split('/');
      let currentLevel = treeData;

      for (const part of pathParts) {
        let existingPath = currentLevel.find(item => item.label === part);
        if (!existingPath) {
          const newEntry = {
            key: getKey(),
            label: part,
            path: part === pathParts[pathParts.length - 1] ? relativePath : pathParts[pathParts.length - 2],
            icon: part === pathParts[pathParts.length - 1] ? 'pi pi-fw pi-file' : 'pi pi-fw pi-folder',
            data: part === pathParts[pathParts.length - 1] ? 'File' : 'Folder',
            children: [],
            fileType: part.split('.').pop(),
          };

          currentLevel.push(newEntry);
          existingPath = newEntry;

          // Add to befFiles if it's a file
          if (part === pathParts[pathParts.length - 1] && relativePath.includes('.')) {
            befFiles.value.push({
              key: newEntry.key,
              type: part.split('.').pop(),
              path: relativePath,
              name: part,
              content: blob,
              code: content,
            });
          }
        }
        currentLevel = existingPath.children;
      }
    };

    // console.log("inside uncompressZip: Starting to process zip entries");

    const promises = [];
    zip.forEach((relativePath, zipEntry) => {
      if (!(zipEntry.name.includes('__MACOSX') || zipEntry.name.includes('DS_Store') || zipEntry.name.endsWith('/'))) {
        promises.push(
          zipEntry.async('blob').then((blob) => {
            return zipEntry.async('string').then((content) => {
              return addEntry(relativePath, blob, content);
            });
          })
        );
      }
    });

    await Promise.all(promises);

    directories.value = treeData;
    // console.log("inside uncompressZip: befFiles.value: ", befFiles.value);
    // console.log("inside uncompressZip: directories.value: ", directories.value);
  } catch (error) {
    console.error('Error uncompressing zip file:', error);
  }
  loadVal.value = 100;
};



const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};


const generateRandomId = async () => {
  // console.log("randomId "+Math.random().toString(36).substring(2,16));
  let randomId = localStorage.getItem('randomId');
  if (!randomId) {
    randomId = getCookie('randomId');
    if(!randomId){
      localStorage.setItem('randomId', randomId);
      randomId = Math.random().toString(36).substring(2, 16);
      localStorage.setItem('randomId', randomId);
      setCookie('randomId', randomId, 365);
    }
    else {
      localStorage.setItem('randomId', randomId);
    }
  }
  else {
    if (!getCookie('randomId')) {
      setCookie('randomId', randomId, 365);
    }
  }
  console.log(randomId);
  return randomId;


}

const getIpAddress = async () => {
  try {
    const data = await GetUserIp();
    userIp.value = data;
    console.log("ipAddress: ", data);
    return data;
  } catch (error) {
    apiError.value = error.message;
    throw error;
  }
}

const checkUserId = async (userId, userIp) => {
  try {
    const data = await PutUserId(userId, userIp);
    // userIp.value = data;
    console.log("checkUserStatus: ", data);
    
    const jwtToken = await AuthenticateUser(userId);
    if(data.error = 'Bad request: uid taken'){
      await gettingHistory(userId, jwtToken.jwt);
    }
    return jwtToken.jwt;
  } catch (error) {
    apiError.value = error.message;
    throw error;
  }
}

const generateUserId = async () => {
  try{
    userRandom.value = await generateRandomId();
  } catch(e){
    console.error(e)
  }
  try {
    await getIpAddress();
  } catch (e) {
    console.error(e);
    serverDown.value.click();
  }
  const date = new Date();
  currentDate.value = date.toISOString().substring(0,10);
  console.log(currentDate.value);
  
  userId.value = userIp.value + userRandom.value + currentDate.value;
  console.log("1st page user is "+userId.value);

  storeJwt.value = await checkUserId(userId.value, userIp.value);
  console.log("JWT token: "+storeJwt.value);
  // fileAttr.userId = userId.value;
}

const gettingSetup = async () => {
  try {
    const data = await GetSetup();
    excludeFiles.value = data.excludedFileTypes;
    excludeFolders.value = data.excludedDirectories;
    // console.log(excludeFiles.value);
    // console.log(excludeFolders.value);
    return data;
  } catch (error) {
    apiError.value = error.message;
    throw error;
  }
}

const gettingHistory = async (userId, jwt) => {
  try {
    const data = await GetHistory(userId, jwt);
    fileHistory.value = data;
    if(data == "no past translated files"){
      hasHistory.value = false;
      console.log(data);
    }
    // console.log(excludeFiles.value);
    // console.log(excludeFolders.value);
    return data;
  } catch (error) {
    apiError.value = error.message;
    throw error;
  }
}

const handleFileClick = () => {
  fileInput.value.click();
  loadVal.value = 0;
}

const prepNext = async () => {
  nextLinkRef.value.click();
}




onMounted(async () => {
  
  // generateRandomId();
  await generateUserId();
  await gettingSetup();
  // await gettingHistory();
  isLoading.value = false;

  fileAttr.userJwt = storeJwt.value;
  fileAttr.userId = userId.value;

  // fileArea.value.addEventListener('click', () => {
  //   fileInput.value.click();
  //   loadVal.value = 0;
  // });
  
});

</script>

<template>
  
  <div class="muted-sect">
    <a ref="serverDown" href="#/notavailable" style="display: none;"></a>
    <div v-if="isLoading" class="loading">
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
      <div
        class="file-drop-area"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
        ref="fileArea"
        @click="handleFileClick"
      >
        <div v-if="!hasFiles" class="file-drop-message">
          <label for="fileUpload" class="drag-field">
            <ButtonGrad className="buttonFile" :htmlContent="buttonText" />
            <span>点击上传代码文或压缩包 或 拖拽代码文或压缩包至此</span>
            <!-- <span>最大支持50M文档</span> -->
          </label>
        </div>
        <div v-else class="file-list">
          <ul>
            <li v-for="file in files" :key="file.name">{{ file.name }}</li>
          </ul>
        </div>
        <input
          type="file"
          multiple
          ref="fileInput"
          @change="handleFileSelect"
          style="display: none;"
        />
      </div>
      <div class="btnCont" v-if="hasFiles">
        <div>
          <LoadingBar :fileName="hasFiles ? files[files.length - 1].name : null" :percentage="loadVal" />
        </div>
        <div class="nextCont">
          <a ref="nextLinkRef" href="#/review" style="display: none;"></a>
          <a @click.prevent="prepNext">
            <ButtonGrad :htmlContent="nextText" className="btnTrans"/>
          </a>
        </div>
      </div>
      <div class="filesAccepted">
        <Button label="什么文件/文件夹可以上传?" @click="visible = true" link />
        <Dialog v-model:visible="visible" maximizable modal header="什么文件/文件夹可以上传?" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
          <p class="m-0">
            可接受的文件: &nbsp;
          </p>
          <p>
              <span v-for="file in excludeFiles">
                {{ file + "， " }}
              </span>
          </p>
          <br>
          <p class="m-0">
            可接受的文件夹: &nbsp;
          </p>
          <p>
              <span v-for="folder in excludeFolders">
                {{ folder + "， " }}
              </span>
          </p>
        </Dialog>
      </div>
      <div v-if="hasHistory" class="pastHistory">
        <h3>
          已翻译的文件
        </h3>
        <div class="pastFiles">
          <Button v-for="history in fileHistory" :label="history.filePath.substring(history.filePath.lastIndexOf('/') + 1)" icon="pi pi-fw pi-download" severity="secondary" text raised/>
        </div>

      </div>
    </div>
  </div>
  
</template>

<style scoped>
.file-drop-area {
  border: 2px dashed #13adff;
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
  width: 100%;
}
.file-drop-area.drag-over {
  background-color: rgba(1, 115, 255, 0.1);
}
.file-drop-message {
  cursor: inherit;
}
.file-list {
  list-style: none;
  padding: 0;
}
.file-list li {
  margin: 5px 0;
}
.file-drop-message {
  width: 100%;
  margin: 1rem;
  display: flex;
  flex-direction: column;
}
.btnCont {
  display: flex;
  width: 100%;
  flex-direction: column;
  margin: 1rem;
}
.nextCont {
  display: flex;
  justify-content: center;
}
.drag-field {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  cursor: inherit;
}
.buttonFile {
  padding: 0.3rem 4rem;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  text-align: center;
  gap: 1rem;
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

.buttonFile i {
  font-size: 2rem;
}
li {
  list-style-type: none;
}
.filesAccepted{
  /* display: flex; */
  padding: 1rem;
  width: 100%;
  text-align: center;
}
.p-button-link{
  color: #999999;
  text-decoration: underline;
}
.p-button-link:not(:disabled):hover{
  color: #0273FF;
}
.loadingScreen{
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    gap: 1rem;
    padding: 3rem;
}
.pastHistory{
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.pastHistory h2{
  font-weight: 700;
}
.pastFiles{
  display: flex;
  gap: 1rem;
  /* flex: 1; */
  flex-wrap: wrap;
}
.m-0{
  font-weight: 700;
  font-size: 1.2rem;
}
.muted-sect{
    background-color: #F0F2F5;
    padding: 2rem;
    border-radius: 10px;
}
.loaded{
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
<style>
.p-dialog-header .p-dialog-title{
  font-size: 2rem;
}
.buttonFile i {
  font-size: 1.5rem;
}
</style>

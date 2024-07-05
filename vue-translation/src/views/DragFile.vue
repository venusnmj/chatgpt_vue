<script setup>
import { ref, computed, onMounted } from 'vue';
import JSZip from 'jszip';
import LoadingBar from '../components/LoadingBar.vue';
import SelectLang from '../components/SelectLang.vue';
import ButtonGrad from '../components/ButtonGrad.vue';
import { fileAttr } from '../shared/fileAttr.js';
import { GetTranslatable, GetUserIp, GetSetup, GetHistory } from '../utils/apiCalls';
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

const apiError = ref(null);
// const fileTranslatable = ref(null);
const listTrans = ref(null); 
const userIp = ref(null);
const userRandom = ref(null);
const currentDate = ref(null);
const userId = ref(null);

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

const getFileTranslatable = async () => {
  try {
    const data = await GetTranslatable(befFiles.value);
    listTrans.value = data;
    console.log("listTrans: ", listTrans.value);
    return data;
  } catch (error) {
    apiError.value = error.message;
    throw error;
  }
};


const processFiles = async (fileList) => {
  files.value = Array.from(fileList);
  directories.value = [];
  befFiles.value = [];
  folderKeys.value = [];
  const keyCounter = { value: 0 };

  const getKey = () => {
    return (keyCounter.value++).toString();
  };

  for (const file of fileList) {
    if (!file.name.endsWith('.zip')) {
      // Process individual files first to get their paths
      await handleIndividualFile(file, getKey);
    }
  }

  // Fetch the translatable files after processing the individual files
  try {
    await getFileTranslatable();
  } catch (e) {
    console.error(e);
  }

  for (const file of fileList) {
    if (file.name.endsWith('.zip')) {
      await uncompressZip(file);
    } else {
      // Update the entries with the translatable status
      await updateFileEntry(file);
    }
  }

  // Update the shared state with the processed files
  fileAttr.nodes = directories.value;
  fileAttr.fileBef = befFiles.value;
  fileAttr.folders = folderKeys.value
  console.log(fileAttr.nodes);
  console.log(fileAttr.fileBef);
  loadVal.value = 100;
};

const assignSelectable = (relativePath) => {
  if (!relativePath.includes('.')) {
    return true; // Directories are always selectable
  }
  for (const fileT of listTrans.value) {
    if (fileT.filePath === relativePath) {
      return true;
    }
  }
  return false;
};


const handleIndividualFile = async (file, getKey) => {
  if (!(file.name.includes('__MACOSX') || file.name.includes('DS_Store') || file.name.endsWith('/'))) {
    const fileContent = await readFileContent(file);
    const fileTranslatable = assignSelectable(file.name);
    // console.log("get this bool for " + file.name + ": " + fileTranslatable);
    const newEntry = {
      key: getKey(),
      label: file.name,
      icon: 'pi pi-fw pi-file',
      data: `${file.name} File`,
      children: [],
      selectable: fileTranslatable,
      fileType: file.name.split('.').pop(),
    };

    befFiles.value.push({
      key: newEntry.key,
      type: file.name.split('.').pop(),
      path: file.name,
      name: file.name,
      content: file,
      code: fileContent,
      selectable: fileTranslatable
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
          const fileTranslatable = assignSelectable(relativePath);
          // console.log("get this bool for " + part + ": " + fileTranslatable);
          const newEntry = {
            key: getKey(),
            label: part,
            icon: part === pathParts[pathParts.length - 1] ? 'pi pi-fw pi-file' : 'pi pi-fw pi-folder',
            data: part === pathParts[pathParts.length - 1] ? 'File' : 'Folder',
            children: [],
            selectable: part === pathParts[pathParts.length - 1] ? fileTranslatable : true,
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
              selectable: part === pathParts[pathParts.length - 1] ? fileTranslatable : true
            });
          }
          
        }
        currentLevel = existingPath.children;
      }
    };

    const promises = [];
    zip.forEach((relativePath, zipEntry) => {
      if (!(zipEntry.name.includes('__MACOSX') || zipEntry.name.includes('DS_Store') || zipEntry.name.endsWith('/'))) {
        promises.push(
          zipEntry.async('blob').then((blob) => {
            zipEntry.async('string').then((content) => {
              addEntry(relativePath, blob, content);
            });
          })
        );
      }
    });

    await Promise.all(promises);
    directories.value = treeData;
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
    userIp.value = data.userIp;
    console.log("ipAddress: ", data.userIp);
    return data;
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
  }
  const date = new Date();
  currentDate.value = date.toISOString().substring(0,10);
  console.log(currentDate.value);
  
  userId.value = userIp.value + userRandom.value + currentDate.value;
  console.log(userId.value);

  fileAttr.userId = userId.value;
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

const gettingHistory = async () => {
  try {
    const data = await GetHistory(userId);
    fileHistory.value = data;
    console.log(data)
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




onMounted(async () => {
  
  // generateRandomId();
  await generateUserId();
  await gettingSetup();
  await gettingHistory();
  isLoading.value = false;

  // fileArea.value.addEventListener('click', () => {
  //   fileInput.value.click();
  //   loadVal.value = 0;
  // });
  
});

</script>

<template>
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
        <a href="#/review">
          <ButtonGrad :htmlContent="nextText" className="btnTrans"/>
        </a>
      </div>
    </div>
    <div class="filesAccepted">
      <Button label="什么文件/文件夹可以上传？" @click="visible = true" link />
      <Dialog v-model:visible="visible" maximizable modal header="什么文件/文件夹可以上传？" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <p class="m-0">
          可接受的文件: &nbsp;
            <span v-for="file in excludeFiles">
              {{ file + "， " }}
            </span>
        </p>
        <br>
        <p class="m-0">
          可接受的文件夹: &nbsp;
            <span v-for="folder in excludeFolders">
              {{ folder + "， " }}
            </span>
        </p>
      </Dialog>
    </div>
    <div class="pastHistory">
      <h3>
        已翻译的文件
      </h3>
      <div class="pastFiles">
        <Button v-for="history in fileHistory" :label="history.filePath.substring(history.filePath.lastIndexOf('/') + 1)" icon="pi pi-fw pi-file" severity="secondary" text raised/>
      </div>
    </div>
  </div>
  
</template>

<style scoped>
.file-drop-area {
  border: 2px dashed #13adff;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
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
.pastFiles{
  display: flex;
  gap: 1rem;
  /* flex: 1; */
  flex-wrap: wrap;
}
</style>

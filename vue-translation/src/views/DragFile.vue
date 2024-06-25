<script setup>
import { ref, computed, onMounted } from 'vue';
import JSZip from 'jszip';
import LoadingBar from '../components/LoadingBar.vue';
import SelectLang from '../components/SelectLang.vue';
import ButtonGrad from '../components/ButtonGrad.vue';
import { fileAttr } from '../shared/fileAttr.js';

const buttonText = ref(`<i class='btnicon iconfont icon-upload'></i>上传文档`);
const nextText = `选择翻译语言`;

const props = defineProps({
  percentage: Number,
  fileName: String,
});

const files = ref([]);
const directories = ref([]);
const befFiles = ref([]);
const loadVal = ref(0);
const hasFiles = computed(() => files.value.length > 0);
const fileArea = ref(null);
const fileInput = ref(null);

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

const processFiles = async (fileList) => {
  files.value = Array.from(fileList);
  directories.value = [];

  for (const file of fileList) {
    if (file.name.endsWith('.zip')) {
      await uncompressZip(file);
    } else {
      directories.value.push({ name: file.name });
    }
  }

  // Update the shared state with the processed files
  fileAttr.nodes = directories.value;
  fileAttr.fileBef = befFiles.value;
  console.log(fileAttr.nodes);
  console.log(fileAttr.fileBef);
  loadVal.value = 100;
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

    const addEntry = (relativePath, blob, content) => {
      const pathParts = relativePath.split('/');
      let currentLevel = treeData;

      pathParts.forEach((part, index) => {
        let existingPath = currentLevel.find(item => item.label === part);
        if (!existingPath) {
          const newEntry = {
            key: getKey(),
            label: part,
            icon: index === pathParts.length - 1 ? 'pi pi-fw pi-file' : 'pi pi-fw pi-folder',
            data: `${part} ${index === pathParts.length - 1 ? 'File' : 'Folder'}`,
            children: []
          };

          currentLevel.push(newEntry);
          existingPath = newEntry;

          // Add to befFiles if it's a file
          if (index === pathParts.length - 1 && relativePath.includes('.')) {
            befFiles.value.push({
              key: newEntry.key,
              type: part.split('.').pop(),
              path: relativePath,
              name: part,
              content: blob,
              code: content
            });
          }
        }
        currentLevel = existingPath.children;
      });
    };

    zip.forEach((relativePath, zipEntry) => {
      if (!(zipEntry.name.includes('__MACOSX') || zipEntry.name.includes('DS_Store') || zipEntry.name.endsWith('/'))) {
        zipEntry.async('blob').then((blob) => {
          zipEntry.async('string').then((content) => {
          addEntry(relativePath, blob, content);
          })
        });
      }
    });

    directories.value = treeData;
  } catch (error) {
    console.error('Error uncompressing zip file:', error);
  }
  loadVal.value = 100;
};

onMounted(() => {
  fileArea.value.addEventListener('click', () => {
    fileInput.value.click();
    loadVal.value = 0;
  });
});
</script>

<template>
  <div
    class="file-drop-area"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    ref="fileArea"
  >
    <div v-if="!hasFiles" class="file-drop-message">
      <label for="fileUpload" class="drag-field">
        <ButtonGrad className="buttonFile" :htmlContent="buttonText" />
        <span>点击上传代码文或压缩包 或 拖拽代码文或压缩包至此</span>
        <span>最大支持50M文档</span>
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
  gap: 1.2rem;
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
</style>

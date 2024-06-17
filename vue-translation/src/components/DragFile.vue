<script setup>
import { computed } from 'vue';
import LoadingBar from './LoadingBar.vue';
import SelectLang from './SelectLang.vue';
import JSZip from 'jszip';

const props = defineProps({
  percentage: Number,
  fileName: String,
});

const computedWidth = computed(() => {
  return `${props.percentage}%`;
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
        <span id="uploadBtn" class="button">
          <i class="iconfont icon-upload"></i>
          上传文档
        </span>
        <span>点击上传代码文或压缩包 或 拖拽代码文或压缩包至此</span>
        <span>最大支持50M文档</span>
      </label>
      <!-- Drag and drop files here or click to upload -->
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
  <SelectLang />
  <div>
    <LoadingBar :fileName="hasFiles ? files[files.length - 1].name : null" :percentage="loadVal" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      loadVal: 0,
      files: [],
      hasFiles: false,
    };
  },
  methods: {
    handleDragOver(event) {
      event.dataTransfer.dropEffect = 'copy';
      this.$refs.fileArea.classList.add('drag-over');
      this.loadVal = 0;
    },
    handleDragLeave() {
      this.$refs.fileArea.classList.remove('drag-over');
    },
    handleDrop(event) {
      this.$refs.fileArea.classList.remove('drag-over');
      const droppedFiles = event.dataTransfer.files;
      this.processFiles(droppedFiles);
    //   this.loadVal = 100;
    },
    handleFileSelect(event) {
      const selectedFiles = event.target.files;
      this.processFiles(selectedFiles);
    },
    async processFiles(fileList) {
      this.files = Array.from(fileList);
      this.hasFiles = this.files.length > 0;
      this.loadVal = 0;
      
      for (const file of fileList) {
        if (file.name.endsWith('.zip')) {
            console.log('yes its a zip');
          await this.uncompressZip(file);
        } else {
          for (let i = 0; i <= 100; i++) {
            this.loadVal = i;
            await new Promise((resolve) => setTimeout(resolve, 10));
          }
        }
      }
    },
    async uncompressZip(file) {
        console.log("unzipping begin "+file.name);
      const jszip = new JSZip();
      try {
        const zip = await jszip.loadAsync(file, {
          onUpdate: (percent) => {
            console.log("percent get: "+percent);
            this.loadVal = Math.floor(percent * 100);
          },
        });
        const files = [];
        zip.forEach((relativePath, zipEntry) => {
          files.push(zipEntry.name);
        });
        console.log('Uncompressed files:', files);
      } catch (error) {
        console.error('Error uncompressing zip file:', error);
      }
      this.loadVal = 100;
    },
  },
  mounted() {
    this.$refs.fileArea.addEventListener('click', () => {
      this.$refs.fileInput.click();
      this.loadVal = 0;
    });
  },
};
</script>

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
.drag-field {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  cursor: inherit;
}
.button {
  background-color: #3385ff;
  background-image: linear-gradient(90deg, #006eff, #13adff);
  font-size: 1.5rem;
  color: #fff;
  box-shadow: 0 5px 10px 0 rgba(16, 110, 253, 0.3);
  padding: 0.3rem 4rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
}
.button i {
  font-size: 2rem;
}
.button:hover {
  box-shadow: 0 0 0.661vw rgba(0, 0, 0, 0.05);
  -webkit-transform: translateY(-0.198vw);
  -ms-transform: translateY(-0.198vw);
  transform: translateY(-0.198vw);
}
li {
  list-style-type: none;
}
</style>

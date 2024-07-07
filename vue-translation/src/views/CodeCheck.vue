<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { fileAttr } from '../shared/fileAttr.js';
import PrimeVue from 'primevue/config';
import Tree from 'primevue/tree';
import "primeicons/primeicons.css";
import CodeEditor from '../components/CodeEditor.vue'
import ButtonGrad from '../components/ButtonGrad.vue'
import { GetTranslation } from '../utils/apiCalls';


const selectedKey = ref(null);
const dropdownVisiblePre = ref(false);
const dropdownVisiblePost = ref(false);
const expandedKeys = ref({});
const fileCode = ref(fileAttr.fileBef);
const transArr = ref(fileAttr.fileAft);
const userID = ref(fileAttr.userId);
const storeJwt = ref(fileAttr.userJwt);
const selectedFile = ref(null);
const fileType = ref('pi pi-fw pi-folder');

const agnText = ref(`重新再来`);
const downloadText = ref('下载压缩包');
const codeStr = ref();
const codeResult = ref();
const codeLang = ref();





const toggleDropdownPre = () => {
    dropdownVisiblePre.value = !dropdownVisiblePre.value;
};

const toggleDropdownPost = () => {
    dropdownVisiblePost.value = !dropdownVisiblePost.value;
};

const handleNodeSelectPre = (event) => {
    console.log("pre"+JSON.stringify(selectedKey));
    dropdownVisiblePre.value = false;
};

const handleNodeSelectPost = (event) => {
    console.log("post"+JSON.stringify(selectedKey));
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


const GetTranslated = async (userId, fileId, userJwt) => {
    try {
        const data = await GetTranslation(userId, fileId, userJwt);
        console.log(data.content)
        return data.content;
    } catch (error) {
        apiError.value = error.message;
        throw error;
    }
}

const addCode = async (fileArr) => {
  for (const [key, value] of Object.entries(fileArr)) {
    if(value.translate && value.completed){
      value.transCode = await GetTranslated(userID.value, value.fileId, storeJwt.value);
    }
    else if(!value.translate){
      value.transCode = value.code;
    }
  }
}

onMounted( async () => {
  await addCode(fileAttr.fileBef);
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
        console.log(node[1].code);
        
        codeStr.value = `${node[1].code}`;
        codeResult.value = `${node[1].transCode}`;

        

        codeLang.value = node[1].type;
        if(codeLang.value == "py"){
            codeLang.value = "python";
        }
        else if(codeLang.value == "js"){
            codeLang.value = "javascript"
        }
        console.log("codeLang: "+ codeLang.value);
    }
    else{
        selectedFile.value = findLabelByKey(fileAttr.nodes, key);
        console.log(selectedFile.value);
        fileType.value = 'pi pi-fw pi-folder';
    }



    if(oldVal){
    // console.log("old: "+ JSON.stringify(oldVal));
    // console.log("old length: "+Object.keys(oldVal).length);
    // console.log("new length: "+Object.keys(newVal).length);
    // console.log(fileCode.value);
    // console.log(nodes);
    let testVal = oldVal;
    let oppVal = newVal;
    
    for (const [key, value] of Object.entries(testVal)) {
        if (!oppVal || !oppVal[key] || oppVal[key].checked !== value.checked || oppVal[key].partialChecked !== value.partialChecked) {
          if (value.checked === true && value.partialChecked === false) {
            const node = findNodeByKey(fileCode.value, key);
            if(node !== null){
              console.log("node is "+ node[1].name);
              codeStr.value = `${node[1].code}`;
              codeResult.value = `${node[1].transCode}`;

              codeLang.value = node[1].type;
              if(codeLang.value == "py"){
                codeLang.value = "python";
              }
              else if(codeLang.value == "js"){
                codeLang.value = "javascript"
              }
              // console.log("codeString: "+codeStr.value);
              console.log("codeLang: "+ codeLang.value);
            }
          }
        }
      }
      
    }
    
})

const handleCodeUpdate = (newCode) => {
    codeStr.value = newCode;
};
const handleResultUpdate = (newCode) => {
    codeResult.value = newCode;
};

</script>

<template>
  <div class="muted-sect">
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
    <div class="endBtn">
        <div class="codeBef">
            <CodeEditor :codeDoc="codeStr" :language="codeLang" @update:codeDoc="handleCodeUpdate"/>
            <ButtonGrad className="btnTrans btnRight" :htmlContent="downloadText"/>
        </div>
        <div class="codeAft">
            <CodeEditor :codeDoc="codeResult" :language="codeLang" @update:codeDoc="handleResultUpdate"/>
            <a href="#/">
                <ButtonGrad className="btnTrans" :htmlContent="agnText"/>
            </a>
        </div>
    </div>
  </div>
</template>

<style scoped>
.filesCtrl{
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
}
i.icon-right {
    font-size: 2rem;
    color: white;
}
.arr-Ctrl{
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

div.pre-Ctrl, div.post-Ctrl{
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
.cm-editor.ͼo{
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
.btnRight{
    align-self: flex-end;
}
a {
  text-decoration: none;
}
.endBtn{
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0rem;
}

div.codeBef, div.codeAft{
    width: 49%;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.muted-sect{
    background-color: #F0F2F5;
    padding: 2rem;
    border-radius: 10px;
}

</style>

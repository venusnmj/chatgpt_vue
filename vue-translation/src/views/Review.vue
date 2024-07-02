<script setup>
import { ref, onMounted, watch } from 'vue';
import SelectLang from '../components/SelectLang.vue'
import { fileAttr } from '../shared/fileAttr.js'
import PrimeVue from 'primevue/config';
import Tree from 'primevue/tree';
import "primeicons/primeicons.css";
import Button from 'primevue/button';
import CodeEditor from '../components/CodeEditor.vue'
// import ConfirmDialog from 'primevue/confirmdialog';
// import { useConfirm } from "primevue/useconfirm";
// import Toast from 'primevue/toast';
// import { useToast } from "primevue/usetoast";
// import ConfirmationService from 'primevue/confirmationservice';


// const confirm = useConfirm();
// const toast = useToast();



const selectedKey = ref({});

// format for file directory
const treeData = [
  {
      key: '0',
      label: 'Documents',
      data: 'Documents Folder',
      icon: 'pi pi-fw pi-inbox',
      children: [
          {
              key: '0-0',
              label: 'Work',
              data: 'Work Folder',
              icon: 'pi pi-fw pi-cog',
              children: [
                  { key: '0-0-0', label: 'Expenses.doc', icon: 'pi pi-fw pi-file', data: 'Expenses Document' },
                  { key: '0-0-1', label: 'Resume.doc', icon: 'pi pi-fw pi-file', data: 'Resume Document' }
              ]
          },
          {
              key: '0-1',
              label: 'Home',
              data: 'Home Folder',
              icon: 'pi pi-fw pi-home',
              children: [{ key: '0-1-0', label: 'Invoices.txt', icon: 'pi pi-fw pi-file', data: 'Invoices for this month' }]
          }
      ]
  },
];

const fileCode = ref(fileAttr.fileBef);
const expandedKeys = ref({});
const nodes = ref(fileAttr.nodes);
const codeStr = ref();
const codeLang = ref();

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

const clickDir = ref(null);

// Get file content 
const findNodeCode = (fileList, key) => {
    for (const file of fileList) {
        if (file.key === key) {
            return file.code;
        }
        if (file.children && file.children.length) {
            const foundCode = findNodeCode(file.children, key);
            if (foundCode) {
                return foundCode;
            }
        }
    }
    return null;
};

// Get file name 
const findNodeLabel = (fileList, key) => {
    for (const file of fileList) {
        if (file.key === key) {
            return file.name;
        }
    }
    return null;
};

// Get file key 
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

const collectKeys = (nodes, keys = {}) => {
  nodes.forEach(node => {
    keys[node.key] = { checked: true, partialChecked: false };
    if (node.children) {
      collectKeys(node.children, keys);
    }
  });
  return keys;
};

const changeKey = (nodes, keyVal) => {
  nodes.forEach(node => {
    if(node.key == keyVal){
      console.log("change colour: " + JSON.stringify(node) );
      console.log("change"+node.key);
      console.log(node.label.split('.').pop() );
      node.styleClass = "selectColor";
    }
    else{
      node.styleClass = "";
    }
    if (node.children) {
      changeKey(node.children, keyVal);
    }
  });
  
}
const disableKey = (nodes, keys = {}) => {
  nodes.forEach(node => {
    console.log(JSON.stringify(node) )
    console.log(node.label.split('.').pop() );
  });
};

onMounted(() => {
  selectedKey.value = collectKeys(nodes.value);
  console.log("for tree nodes: "+ JSON.stringify(nodes.value));
});

watch(selectedKey, (newVal, oldVal) => {
  let codeChange;
  if(oldVal){
    console.log(oldVal);
    // console.log("old length: "+Object.keys(oldVal).length);
    // console.log("new length: "+Object.keys(newVal).length);
    // console.log(fileCode.value);
    // console.log(nodes);
    let testVal = oldVal;
    let oppVal = newVal;
    
    if(Object.keys(newVal).length > Object.keys(oldVal).length){
      testVal = newVal;
      oppVal = oldVal;
    }
    
    for (const [key, value] of Object.entries(testVal)) {
        if (!oppVal || !oppVal[key] || oppVal[key].checked !== value.checked || oppVal[key].partialChecked !== value.partialChecked) {
          if (value.checked === true && value.partialChecked === false) {
            const node = findNodeByKey(fileCode.value, key);
            if(node !== null){
              console.log("node is "+ node[1].name);
              codeStr.value = `${node[1].code}`;

              codeLang.value = node[1].type;
              changeKey(nodes.value, key);
            
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
  }, { deep: true });

const handleCodeUpdate = (newCode) => {
    codeStr.value = newCode;
};

const nextLinkRef = ref(null);

const submitLanguage = (lang) => {
    console.log("submitted lang: " + lang);
    fileAttr.selectedLanguage = lang;

    if (nextLinkRef.value) {
        nextLinkRef.value.click();
    }
};

</script>

<template>
    <div class="reviewCode">
      <div class="directorySect">
        <div class="directBtn">
          <Button type="button" icon="pi pi-plus" label="Expand All" @click="expandAll">展开</Button>
          <Button type="button" icon="pi pi-minus" label="Collapse All" @click="collapseAll">收起</Button>
        </div>
        <div class="fileDir" ref="clickDir">
          <!-- <Tree v-model:expandedKeys="expandedKeys" v-model:selectionKeys="selectedKey" :value="fileAttr.nodes" selectionMode="checkbox" class="w-full md:w-[30rem] file-tree" > 
          </Tree> -->
          <Tree v-model:expandedKeys="expandedKeys" v-model:selectionKeys="selectedKey" :value="fileAttr.nodes" selectionMode="checkbox" class="w-full md:w-[30rem] file-tree" > 
            <template #default="slotProps">
                <b>{{ slotProps.node.label }} HEHE</b>
            </template>
          </Tree>
        </div>
      </div>
      <div class="codeSect">
        <CodeEditor :codeDoc="codeStr" :language="codeLang" @update:codeDoc="handleCodeUpdate"/>
      </div>
    </div>
    <SelectLang nextLink="#/translating" @language-selected="submitLanguage"/>
    <a ref="nextLinkRef" href="#/translating" style="display: none;"></a>
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
/* .fileDir {
} */
.codeSect {
    width: 70%;
    /* height: 300px; */
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
.fileDir{
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
.cm-editor.ͼo{
  height: 100%;
  border-radius: 0.5rem;
}
.selectColor .p-tree-node-label{
  color: #3385ff;
}

</style>

<script setup>
import { ref, onMounted, defineComponent, watch } from 'vue';
import SelectLang from '../components/SelectLang.vue'
import { fileAttr } from '../shared/fileAttr.js'
import DirectoryItem from '../components/DirectoryItem.vue'
import PrimeVue from 'primevue/config';
import Tree from 'primevue/tree';
import "primeicons/primeicons.css";
import Button from 'primevue/button';
import CodeEditor from '../components/CodeEditor.vue'

const selectedKey = ref(null);

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

const logSelectedLabels = () => {
    // console.log(fileCode.value);
    for (const [key, value] of Object.entries(selectedKey.value)) {
        if (value.checked === true && value.partialChecked === false) {
            const code = findNodeCode(fileCode.value, key);
            const label = findNodeLabel(fileCode.value, key);
            // console.log(label);
            // console.log(code);
        }
    }
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


watch(selectedKey, (newVal, oldVal) => {
  let codeChange;
  if(oldVal){
    console.log("old length: "+Object.keys(oldVal).length);
    console.log("new length: "+Object.keys(newVal).length);
    console.log(fileCode.value);
    console.log(nodes);
    let testVal;
    let oppVal;
    
    if(Object.keys(newVal).length > Object.keys(oldVal).length){
      testVal = newVal;
      oppVal = oldVal;
    }
    else if(Object.keys(oldVal).length > Object.keys(newVal).length){
      testVal = oldVal;
      oppVal = newVal;
    }
    
    for (const [key, value] of Object.entries(testVal)) {
        if (!oppVal || !oppVal[key] || oppVal[key].checked !== value.checked || oppVal[key].partialChecked !== value.partialChecked) {
          if (value.checked === true && value.partialChecked === false) {
            if(findNodeByKey(fileCode.value, key)){
              const node = findNodeByKey(fileCode.value, key);
              console.log("node is "+ node[1].name);
              codeStr.value = `${node[1].code}`;
              codeLang.value = node[1].type;
              console.log("codeString: "+codeStr.value);
              console.log("codeLang: "+ node[1].type);
            }
              
    
            
            
            
            
            
            // if(node.name){
            //   console.log(`Key: ${key}, Label: ${node.name}`);
            // }
            
            // if (label && label.includes('.')) { 
            //   const selectedNode = findNodeByKey(fileCode.value, key);
            //   if (selectedNode && selectedNode.data && selectedNode.data.code) {
            //     console.log(`Key: ${key}, Label: ${label}`);
            //   }
            // }
          }
        }
      }
  }

  // if (newVal) {
  //   for (const [key, value] of Object.entries(newVal)) {
  //     if (!oldVal || !oldVal[key] || oldVal[key].checked !== value.checked || oldVal[key].partialChecked !== value.partialChecked) {
  //       console.log(`Key changed: ${key}`);
  //       if (value.checked === true && value.partialChecked === false) {
  //         const label = findNodeLabel(fileCode.value, key);
  //         if (label && label.includes('.')) { // Ensure label is not null or undefined
  //           const selectedNode = findNodeByKey(fileCode.value, key);
  //           if (selectedNode && selectedNode.data && selectedNode.data.code) {
  //             console.log(`Key: ${key}, Label: ${label}, Code: ${selectedNode.data.code}`);
  //           }
  //         }
  //       }
  //     }
  //   }
  // }
}, { deep: true });

const handleCodeUpdate = (newCode) => {
    codeStr.value = newCode;
};


// onMounted(() => {
//     clickDir.value.addEventListener('click', () => {
//         try {
//             logSelectedLabels();
//         } catch (error) {
//             console.error(error);
//         }
//     });
// });
</script>

<template>
    <h1>Hello Review</h1>
    <div class="reviewCode">
      <div class="directorySect">
        <div class="directBtn">
          <Button type="button" icon="pi pi-plus" label="Expand All" @click="expandAll">Expand</Button>
          <Button type="button" icon="pi pi-minus" label="Collapse All" @click="collapseAll">Collapse</Button>
        </div>
        <div class="fileDir" ref="clickDir">
          <Tree v-model:expandedKeys="expandedKeys" v-model:selectionKeys="selectedKey" :value="fileAttr.nodes" selectionMode="checkbox" class="w-full md:w-[30rem] file-tree"></Tree>
        </div>
      </div>
      <div class="codeSect">
        <CodeEditor :codeDoc="codeStr" @update:codeDoc="handleCodeUpdate"/>
      </div>
    </div>
    <SelectLang />
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
.fileDir {
}
.codeSect {
    width: 70%;
    height: 300px;
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
</style>

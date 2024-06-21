<script setup>
// import { ref, reactive, defineProps, defineEmits } from 'vue'
import { ref, onMounted, defineComponent } from 'vue';
// import { useToast } from "primevue/usetoast";
import SelectLang from '../components/SelectLang.vue'
import { fileAttr } from '../shared/fileAttr.js'
import DirectoryItem from '../components/DirectoryItem.vue'
import PrimeVue from 'primevue/config';
import Tree from 'primevue/tree';
import "primeicons/primeicons.css";
import Button from 'primevue/button';


// import { EditorState } from '@codemirror/state'
// import { Codemirror } from 'vue-codemirror'
// import { javascript } from '@codemirror/lang-javascript'
// import { oneDark } from '@codemirror/theme-one-dark'
// import {EditorView, keymap} from "@codemirror/view"
// import {defaultKeymap} from "@codemirror/commands"

import CodeEditor from '../components/CodeEditor.vue'


const selectedKey = ref(null);

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

// if (!fileAttr.files[0].children[0].dir) {
//   fileAttr.files[0].children[0].async('string').then((content) => {
//       console.log(content)
//   });
// }

// Assuming nodes and expandedKeys are coming from props or some other state management
const nodes = ref(fileAttr.nodes);
const expandedKeys = ref({});

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

// console.log("key"+selectedKey);
// console.log(treeData);
const clickDir = ref(null);


const findNodeLabel = (nodeList, key) => {
    for (const node of nodeList) {
        if (node.key === key) {
            return node.label;
        }
        if (node.children && node.children.length) {
            const foundLabel = findNodeLabel(node.children, key);
            if (foundLabel) {
                return foundLabel;
            }
        }
    }
    return null;
};

const logSelectedLabels = () => {
    for (const [key, value] of Object.entries(selectedKey.value)) {
        if (value.checked === true && value.partialChecked === false) {
            const label = findNodeLabel(nodes.value, key);
            if (label.includes('.')) {
                console.log(`Key: ${key}, Label: ${label},`);
            }
        }
    }
};

onMounted(() => {
    clickDir.value.addEventListener('click', () => {
        try {
            logSelectedLabels();
        } catch (error) {
            console.error(error);
        }
    });
});

// const logSelectedKeys = () => {
    
//     for (const [key, value] of Object.entries(selectedKey.value)) {
//         if (value.checked === true && value.partialChecked === false) {
          
//             console.log(key);
//             console.log(fileAttr.nodes[key].label);
//         }
//     }
    
// };

// onMounted(() => {
//     clickDir.value.addEventListener('click', () => {
//         try {
//             logSelectedKeys();
//         } catch (error) {
//             console.error(error);
//         }
//     });
// });

// onMounted(() => {
//   clickDir.value.addEventListener('click', () => {
//     try{
      
//       console.log("keys: "+ Object.keys(selectedKey.value));
//       console.log("values: "+ JSON.stringify(Object.values(selectedKey.value)));
//       console.log(selectedKey.value)
//     }
//     catch(error){

//     }

//   });
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
        <CodeEditor />
      </div>
    </div>
    <!-- <Tree :value="fileAttr.files" class="w-full md:w-[30rem]"></Tree> -->
    <SelectLang />
</template>

<!-- <script>
  import { defineComponent, ref, shallowRef } from 'vue'
  import { Codemirror } from 'vue-codemirror'
  import { javascript } from '@codemirror/lang-javascript'
  import { oneDark } from '@codemirror/theme-one-dark'

  export default defineComponent({
    components: {
      Codemirror
    },
    setup() {
      const code = ref(`console.log('Hello, world!')`)
      const extensions = [javascript(), oneDark]

      // Codemirror EditorView instance ref
      const view = shallowRef()
      const handleReady = (payload) => {
        view.value = payload.view
      }

      // Status is available at all times via Codemirror EditorView
      const getCodemirrorStates = () => {
        const state = view.value.state
        const ranges = state.selection.ranges
        const selected = ranges.reduce((r, range) => r + range.to - range.from, 0)
        const cursor = ranges[0].anchor
        const length = state.doc.length
        const lines = state.doc.lines
        // more state info ...
        // return ...
      }

      return {
        code,
        extensions,
        handleReady,
        log: console.log
      }
    }
  })
</script> -->

<style>
.file-tree .p-tree-node-selectable{
  position: relative;
}
.file-tree .p-checkbox {
    position: absolute;
    right: 0;
}
.file-tree.p-tree{
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
.fileDir{
  /* height: 300px;
  overflow-y: scroll;
  padding-right: 20px; */
}
.codeSect{
  width: 70%;
  height: 300px;
  overflow-y: scroll;
}
.directBtn{
  display: flex;
  gap: 10px;
}
.directBtn .p-button{
  background-color: transparent;
  border: solid #3385ff 2px;
  color: #3385ff;
}
.directBtn .p-button:not(:disabled):hover{
  background-color: white;
  border: solid #3385ff 2px;
  color: #3385ff;
}
</style>


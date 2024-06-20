<script setup>
// import { ref, reactive, defineProps, defineEmits } from 'vue'
import { ref, onMounted } from 'vue';
// import { useToast } from "primevue/usetoast";
import SelectLang from '../components/SelectLang.vue'
import { fileAttr } from '../shared/fileAttr.js'
import DirectoryItem from '../components/DirectoryItem.vue'
import PrimeVue from 'primevue/config';
import Tree from 'primevue/tree';

const selectedKey = ref(null);
console.log(fileAttr.files);

</script>

<template>
    <h1>Hello Review</h1>
    <!-- <Tree v-model:selectionKeys="selectedKey" :value="fileAttr.files" selectionMode="checkbox" class="w-full md:w-[30rem]"></Tree> -->
    <Tree :value="fileAttr.files" class="w-full md:w-[30rem]"></Tree>
    <SelectLang />
</template>

<style scoped>
</style>


<!-- 
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
-->

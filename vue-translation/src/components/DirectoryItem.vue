<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  item: Object,
});
</script>

<template>
  <li>
    <span>{{ item.name }}</span>
    <ul v-if="!item.isFile">
      <li v-for="child in item.children" :key="child.name">
        <DirectoryItem :item="child" />
      </li>
    </ul>
  </li>
</template>

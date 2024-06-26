<script setup>
// import { onMounted, ref } from 'vue';
// import { EditorState } from '@codemirror/state';
// import { EditorView } from '@codemirror/view';
// import { languages } from '@codemirror/language-data';
// import { oneDark } from '@codemirror/theme-one-dark'; // Optional: Import a theme

// const editor = ref(null);
// let view;

// const props = defineProps({
//   initialDoc: {
//     type: String,
//     default: '',
//   },
//   language: {
//     type: String,
//     default: 'javascript',
//   },
// });

// onMounted(() => {
//   const state = EditorState.create({
//     doc: '// Write your JavaScript code here\n',
//     extensions: [
//     //   basicSetup,
//       javascript(),
//       oneDark, // Apply the theme
//       EditorView.lineWrapping // Optional: Enable line wrapping
//     ]
//   });

//   new EditorView({
//     state,
//     parent: editor.value
//   });
// });

import { onMounted, ref, watch } from 'vue';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { languages } from '@codemirror/language-data';
import { autocompletion } from '@codemirror/autocomplete';
import { oneDark } from '@codemirror/theme-one-dark'; 

import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { sql } from '@codemirror/lang-sql';



const props = defineProps({
  codeDoc: {
    type: String,
    default: "function hello(){ let string = 'Hello World'}",
  },
  language: {
    type: String,
    default: 'javascript',
  },
});

const emit = defineEmits(['update:codeDoc']);
const editor = ref(null);
let view;

const languageExtensions = {
  javascript,
  css,
  html,
  java,
  python,
  json,
  xml,
  sql
};

const setupEditor = (doc, lang) => {
  const langExtension = languageExtensions[lang];
  const extensions = [
    langExtension ? langExtension() : javascript(),
    oneDark,
    autocompletion()
  ];

  const state = EditorState.create({
    doc,
    extensions
  });

  if (view) {
    view.setState(state);
  } else {
    view = new EditorView({
      state,
      parent: editor.value,
      dispatch: (transaction) => {
        view.update([transaction]);
        if (transaction.docChanged) {
          emit('update:codeDoc', view.state.doc.toString());
        }
      }
    });
  }
};

onMounted(() => {
  setupEditor(props.codeDoc, props.language);
});

watch(() => props.codeDoc, (newCode) => {
  if (view && newCode !== view.state.doc.toString()) {
    setupEditor(newCode, props.language);
  }
});

watch(() => props.language, (newLang) => {
  if (view) {
    setupEditor(view.state.doc.toString(), newLang);
  }
});
</script>

<template>
  <div ref="editor" class="cm-editor"></div>
</template>

<style scoped>
.cm-editor {
  height: 400px;
  border: 1px solid #ccc;
}
</style>







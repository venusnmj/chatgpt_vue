<script setup>
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
    default: "",
  },
  language: {
    type: String,
    default: 'javascript',
  },
  isEditable: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:codeDoc', 'key-event']);
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

const setupEditor = (doc, lang, editable) => {
  const langExtension = languageExtensions[lang];
  const extensions = [
    langExtension ? langExtension() : javascript(),
    oneDark,
    autocompletion(),
    EditorView.editable.of(editable)  // Make the editor editable or read-only
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

  // Add keydown event listener to emit key events to the parent
  view.dom.addEventListener('keydown', (event) => {
    emit('key-event', event);
  });
};

onMounted(() => {
  setupEditor(props.codeDoc, props.language, props.isEditable);
});

watch(() => props.codeDoc, (newCode) => {
  if (view && newCode !== view.state.doc.toString()) {
    setupEditor(newCode, props.language, props.isEditable);
  }
});

watch(() => props.language, (newLang) => {
  if (view) {
    setupEditor(view.state.doc.toString(), newLang, props.isEditable);
  }
});

watch(() => props.isEditable, (newEditable) => {
  if (view) {
    setupEditor(view.state.doc.toString(), props.language, newEditable);
  }
});
</script>

<template>
  <div ref="editor" class="cm-editor"></div>
</template>

<style scoped>
.cm-editor {
  height: 400px;
}
</style>

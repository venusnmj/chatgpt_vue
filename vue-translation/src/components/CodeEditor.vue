<script setup>
import { onMounted, ref, watch } from 'vue';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { autocompletion } from '@codemirror/autocomplete';
import { oneDark } from '@codemirror/theme-one-dark'; 
import { languages } from '@codemirror/language-data';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { sql } from '@codemirror/lang-sql';
import { php } from '@codemirror/lang-php';
import { markdown } from '@codemirror/lang-markdown';
import { cpp } from '@codemirror/lang-cpp';
import { rust } from '@codemirror/lang-rust';
import { go } from '@codemirror/lang-go';
import { yaml } from '@codemirror/lang-yaml';

const languageExtensions = {
  javascript,
  css,
  html,
  java,
  python,
  json,
  xml,
  sql,
  php,
  markdown,
  cpp,
  rust,
  go,
  yaml,
};

const codeTypes = {
    'js': 'javascript',
    'py': 'python',
    'md': 'markdown',
    'rs': 'rust',
    'go': 'go',
    'yml': 'yaml',
};


const props = defineProps({
  codeDoc: {
    type: String,
    default: "请选择文档来展示",
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

const getCodeType = (ext) => {
    return codeTypes[ext] || ext;
};

const emit = defineEmits(['update:codeDoc', 'key-event']);
const editor = ref(null);
let view;

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
  const langExt = getCodeType(props.language);
  setupEditor(props.codeDoc, langExt, props.isEditable);
});

watch(() => props.codeDoc, (newCode) => {
  if (view && newCode !== view.state.doc.toString()) {
    const langExt = getCodeType(props.language);
    setupEditor(newCode, langExt, props.isEditable);
  }
});

watch(() => props.language, (newLang) => {
  if (view) {
    const langExt = getCodeType(newLang);
    setupEditor(view.state.doc.toString(), langExt, props.isEditable);
  }
});

watch(() => props.isEditable, (newEditable) => {
  if (view) {
    const langExt = getCodeType(props.language);
    setupEditor(view.state.doc.toString(), langExt, newEditable);
  }
});
</script>

<template>
  <div ref="editor" class="cm-editor"></div>
</template>

<style scoped>
/* .cm-editor {
  height: 400px;
} */
@media only screen and (max-width: 768px) {
  .cm-editor {
    height: 100%;
  }
}
</style>

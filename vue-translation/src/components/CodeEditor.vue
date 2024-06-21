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
  initialDoc: {
    type: String,
    default: "function hello(){ let string = 'Hello World'}",
  },
  language: {
    type: String,
    default: 'javascript',
  },
});

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

const setupEditor = () => {
  const langExtension = languageExtensions[props.language];
  const extensions = [
    langExtension ? langExtension() : javascript(),
    oneDark,
    autocompletion()
  ];

  const state = EditorState.create({
    doc: props.initialDoc,
    extensions
  });

  if (view) {
    view.setState(state);
  } else {
    view = new EditorView({
      state,
      parent: editor.value
    });
  }
};

onMounted(() => {
  setupEditor();
});

watch(() => props.language, () => {
  setupEditor();
});
</script>

<template>
    <div ref="editor"></div>
</template>

<style scoped>
.cm-editor {
height: 400px;
border: 1px solid #ccc;
}
</style> 


<!-- 
<template>
    <div ref="editor"></div>
</template>
<script setup>
import { onMounted, ref, watch } from 'vue';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from '@codemirror/basic-setup';
import { languages } from '@codemirror/language-data';
import { autocompletion } from '@codemirror/autocomplete';

const props = defineProps({
  initialDoc: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: 'javascript',
  },
});

const editor = ref(null);
let view;

const setupEditor = () => {
  const langSupport = languages.find(lang => lang.name.toLowerCase() === props.language.toLowerCase());
  const extensions = [
    basicSetup,
    langSupport?.support || [],
    autocompletion()
  ];

  const state = EditorState.create({
    doc: props.initialDoc,
    extensions
  });

  if (view) {
    view.setState(state);
  } else {
    view = new EditorView({
      state,
      parent: editor.value
    });
  }
};

onMounted(() => {
  setupEditor();
});

watch(() => props.language, () => {
  setupEditor();
});
</script>

<style scoped>
.cm-editor {
height: 400px;
border: 1px solid #ccc;
}
</style> -->
  
<!-- <template>
    <div ref="editor" class="cm-editor"></div>
  </template>
  
  <script setup>
  import { onMounted, ref, watch } from 'vue';
  import { EditorState } from '@codemirror/state';
  import { EditorView, basicSetup } from '@codemirror/basic-setup';
  import { languages } from '@codemirror/language-data';
  import { autocompletion } from '@codemirror/autocomplete';
  
  const props = defineProps({
    initialDoc: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: 'javascript',
    },
  });
  
  const editor = ref(null);
  let view;
  
  const setupEditor = () => {
    const langSupport = languages.find(lang => lang.name.toLowerCase() === props.language.toLowerCase());
    const extensions = [
      basicSetup,
      langSupport?.support || [],
      autocompletion()
    ];
  
    const state = EditorState.create({
      doc: props.initialDoc,
      extensions
    });
  
    if (view) {
      view.setState(state);
    } else {
      view = new EditorView({
        state,
        parent: editor.value
      });
    }
  };
  
  onMounted(() => {
    setupEditor();
  });
  
  watch(() => props.language, () => {
    setupEditor();
  });
  </script>
  
  <style scoped>
  .cm-editor {
    height: 400px;
    border: 1px solid #ccc;
  }
  </style> -->
  
  
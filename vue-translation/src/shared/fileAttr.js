import { reactive } from 'vue';

export const fileAttr = reactive({
  selectedLanguage: null,
  selectedModel: [],
  displayModel: [],
  nodes: [],
  fileBef: [],
  fileAft: [],
  userId: null,
  userJwt: '',
  setupData: {},
  // gotToFinal: null,
  // gotToStart: null,
  prevPage: null,
});

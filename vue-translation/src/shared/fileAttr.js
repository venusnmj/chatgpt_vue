import { reactive } from 'vue';

export const fileAttr = reactive({
  selectedLanguage: null,
  selectedModel: [],
  nodes: [],
  fileBef: [],
  fileAft: [],
  userId: null,
  userJwt: '',
  setupData: {},
});

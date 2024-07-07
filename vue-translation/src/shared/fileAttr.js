import { reactive } from 'vue';

export const fileAttr = reactive({
  selectedLanguage: null,
  nodes: [],
  fileBef: [],
  fileAft: [],
  userId: null,
  userJwt: '',
});

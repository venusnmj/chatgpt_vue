import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import PrimeVue from 'primevue/config';
import Tree from 'primevue/tree';
import "primeicons/primeicons.css";

import Aura from '@primevue/themes/aura';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';


const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

app.directive('tooltip', Tooltip);

app.use(ConfirmationService);
app.use(ToastService);

app.component('Tree', Tree);

app.mount('#app');



// createApp(App).mount('#app')

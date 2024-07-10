import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // server: {
  //   proxy: {
  //     '/public': {
  //       target: 'http://192.168.31.239:8080',
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/public/, ''),
  //     },
  //   },
  // },
});

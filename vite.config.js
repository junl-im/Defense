import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/Defense/',
  build: {
    target:'es2020',
    sourcemap:false,
    rollupOptions: { input: { main: resolve('index.html'), spritePreview: resolve('sprite-preview.html') } }
  }
});

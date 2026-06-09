import { defineConfig } from 'vite';

// GitHub Pages project site: /<repo-name>/
// Custom domain or username site: /
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});

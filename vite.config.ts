import { defineConfig } from 'vite';

// v2.35.7 실행 복구 패치:
// 기본 base를 './'로 둔다. 이렇게 해야 Firebase Hosting 루트, GitHub Pages 하위 경로,
// 로컬 정적 미리보기처럼 주소 루트가 서로 다른 환경에서도 빌드 산출물의 JS/CSS 청크가 404가 나지 않는다.
// 특정 배포에서 절대 경로가 필요하면 VITE_BASE_PATH=/ 처럼 환경변수로 덮어쓴다.
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? './',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  build: {
    target: 'es2020',
  },
});

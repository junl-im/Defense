# Patch Apply Guide

1. ZIP 압축을 풉니다.
2. 안의 내용을 프로젝트 루트에 덮어씁니다.
3. 기존 버전별 README/docs가 많이 쌓여 있다면 한 번만 실행합니다.

```bash
node scripts/cleanup-versioned-patch-files.mjs
```

4. 빌드합니다.

```bash
npm run build
```

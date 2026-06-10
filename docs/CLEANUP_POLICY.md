# Cleanup Policy

## 문제

`README-v4.1-premium-polish-patch.md`처럼 패치마다 루트 README가 새로 생기면 저장소에 문서 쓰레기가 계속 쌓입니다.

## 해결

앞으로는 다음 파일만 갱신합니다.

- `README.md`
- `docs/PATCH_NOTES.md`
- `docs/VISUAL_GUIDE.md`
- `docs/ASSET_MANIFEST.json`
- `docs/CLEANUP_POLICY.md`

## 기존 파일 정리

아래 명령을 한 번 실행하세요.

```bash
node scripts/cleanup-versioned-patch-files.mjs
```

삭제 대상 예시:

- `README-v4.1-premium-polish-patch.md`
- `README-v4.8-compact-login-visual-polish-patch.md`
- `docs/*_V48.md`
- `docs/asset-manifest-v48.json`

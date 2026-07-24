# v1.0.12 CI Optional Image Dependencies Hotfix

## 증상

GitHub Actions의 `npm run verify` 단계에서 다음 오류가 발생했습니다.

```text
ModuleNotFoundError: No module named 'PIL'
```

## 원인

`generate-visual-polish-assets-v112.py`와 `generate-p0-directional-atlases-v112.py`가 `--check` 모드에서도 Pillow, NumPy, trimesh를 모듈 시작 시점에 불러오고 있었습니다. CI는 이미 생성되어 커밋된 이미지의 무결성만 검사하므로 무거운 이미지 생성 패키지를 설치하지 않는 구조입니다.

## 수정

- 두 v1.0.12 스크립트의 `--check` 경로를 Python 표준 라이브러리 전용으로 변경했습니다.
- WebP RIFF 헤더를 직접 읽어 형식, 크기, 알파 정보를 검사합니다.
- Pillow, NumPy, trimesh는 실제 이미지 재생성 시에만 지연 로드합니다.
- `verify:release:v112`는 `python -S`로 실행해 선택 패키지 없는 검증을 강제합니다.
- GitHub Actions 사전 검사에 두 v1.0.12 이미지 검사를 추가했습니다.
- 실제 재생성용 `requirements-atlas.txt`에 trimesh를 명시했습니다.

런타임 이미지, 아틀라스 바이트, 게임 로직, 저장 데이터, 버전 ID는 변경하지 않았습니다.

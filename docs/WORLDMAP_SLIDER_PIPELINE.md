# World Map Slider Pipeline

v1.3부터 월드맵은 카드형 슬라이더 구조를 기준으로 확장합니다.

## 조작

- 모바일: 좌우 스와이프로 스테이지 이동
- PC: 좌우 화살표 클릭, 카드 클릭, 하단 도트 클릭
- 선택된 카드 재클릭: 해금된 스테이지라면 바로 전투 시작

## 권장 이미지 규격

```txt
public/assets/maps/stage_card_001.png  512x288
public/assets/maps/stage_card_002.png  512x288
public/assets/maps/stage_card_003.png  512x288
public/assets/maps/stage_card_004.png  512x288
```

실제 표시 영역은 게임 내부에서 248x136 근처로 리사이즈됩니다. 원본은 16:9 비율을 유지하는 것이 좋습니다.

## 향후 v1.4 확장 제안

- 스테이지 카드에 미니 보스 아이콘 추가
- 지역별 챕터 배경 분리
- 난이도 별도 배지 추가
- 클리어 별 수에 따라 카드 테두리 변화
- 카드 진입 시 짧은 카메라 줌/구름 이동 연출 추가

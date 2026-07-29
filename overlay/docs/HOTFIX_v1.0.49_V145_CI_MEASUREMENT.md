# v1.0.49 v145 CI Measurement Hotfix

## 실패 원인

GitHub Actions 로그는 런타임 오류 0건, heap 증가 9.772MB, texture -2, geometry -220, context loss/restore 1:1로 안정적이었다. 반면 SwiftShader 소프트웨어 렌더러의 frame p95 216.6ms와 측정 프레임 중 누적된 long task 556건을 실제 게임 회귀와 동일하게 판정해 실패했다. frame slope는 -5.497ms/10 waves로 악화가 아니라 개선 방향이었다.

## 수정 원칙

1. 실제 하드웨어 성능 기준은 완화하지 않는다.
2. 소프트웨어 renderer임이 확인된 CI에서만 기준 대비 악화율을 사용한다.
3. 높은 절대 수치를 무조건 통과시키지 않고 p95 비율, 증가량, 정규화 기울기, long-task/frame 비율을 함께 제한한다.
4. 프레임 창이 timeout되거나 요청 표본을 채우지 못하면 환경 문제라도 실패시킨다.
5. 통과 보고서의 failure digest에는 first regression을 생성하지 않는다.

## 재발 방지 회귀 픽스처

- SwiftShader 200ms급 안정 표본 + 누적 long task 500건 이상: 통과
- 동일 표본을 하드웨어 프로필로 판정: 실패
- SwiftShader에서 p95가 기준 대비 35%/50ms를 초과하거나 기울기가 악화: 실패
- long-task/frame 비율이 초기 기준보다 증가: 실패
- 24프레임 창이 timeout 또는 최소 표본 미달: 실패

export type PolishIssueSeverity = "info" | "warn" | "critical";

export type PolishIssue = {
  id: string;
  severity: PolishIssueSeverity;
  title: string;
  detail: string;
  fixHint: string;
};

export type RuntimePolishSnapshot = {
  width: number;
  height: number;
  dpr: number;
  isMobile: boolean;
  isPortrait: boolean;
  fps?: number;
};

export class PolishAuditV41 {
  static inspect(snapshot: RuntimePolishSnapshot): PolishIssue[] {
    const issues: PolishIssue[] = [];

    if (!snapshot.isMobile && snapshot.isPortrait) {
      issues.push({
        id: "pc-portrait-window",
        severity: "info",
        title: "PC portrait browser window detected",
        detail: "PC에서는 절대 회전하지 않고 레이아웃만 letterbox 처리해야 합니다.",
        fixHint: "WebShell에서 모바일 여부를 우선 판정하고 PC fullscreen/orientation lock 호출을 금지합니다.",
      });
    }

    if (snapshot.isMobile && snapshot.isPortrait) {
      issues.push({
        id: "mobile-landscape-guard",
        severity: "warn",
        title: "Mobile portrait session",
        detail: "모바일 세로 화면에서는 landscape lock 또는 CSS fallback이 필요합니다.",
        fixHint: "사용자 첫 터치 이후 orientation.lock('landscape')를 시도하고 실패 시 canvas wrapper를 회전합니다.",
      });
    }

    if (snapshot.dpr > 2.5) {
      issues.push({
        id: "high-dpr-budget",
        severity: "warn",
        title: "High DPR device",
        detail: "고해상도 모바일에서 이펙트와 텍스트 렌더링 비용이 상승할 수 있습니다.",
        fixHint: "QualityManager에서 DPR cap 또는 effect budget을 낮춥니다.",
      });
    }

    if (typeof snapshot.fps === "number" && snapshot.fps < 45) {
      issues.push({
        id: "low-fps",
        severity: "critical",
        title: "Low FPS detected",
        detail: "전투 중 체감 품질이 떨어질 수 있습니다.",
        fixHint: "부유 파티클, 폭발 잔상, damage number 수량을 줄입니다.",
      });
    }

    return issues;
  }
}

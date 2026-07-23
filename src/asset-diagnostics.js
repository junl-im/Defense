const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
})[character]);

export function buildAssetDiagnostics(statuses, labels, goldenSampleId) {
  const loaded = statuses.filter((status) => status.loaded).length;
  const approved = statuses.filter((status) => status.approval?.productionReady).length;
  const review = statuses.filter((status) => status.approval?.status === 'art-review').length;
  const fallbacks = statuses.reduce((sum, status) => sum + status.fallbacks, 0);
  const golden = statuses.find((status) => status.id === goldenSampleId);
  const summary = `GLB 로드 ${loaded}/${statuses.length} · 골든 샘플 Skin ${golden?.metrics?.skins || 0} · Clip ${golden?.metrics?.animations?.length || 0}/11${fallbacks ? ` · 폴백 ${fallbacks}회` : ''}`;
  const html = statuses.map((status) => {
    const approval = status.approval;
    const isReview = approval?.status === 'art-review';
    const state = status.loaded
      ? approval?.productionReady ? 'AAA 제작 승인' : isReview ? `골든 샘플 기술 검수 · Skin ${status.metrics?.skins || 0} · Clip ${status.metrics?.animations?.length || 0}` : '개발용 프로토타입 GLB'
      : '절차형 폴백';
    const runtime = status.instances || status.fallbacks ? ` · 누적 생성 ${status.instances || 0}${status.fallbacks ? ` / 폴백 ${status.fallbacks}` : ''}` : '';
    const reason = approval?.reasons?.join(' · ') || status.failure || status.url || status.id;
    const className = approval?.productionReady ? 'approved' : isReview ? 'review' : status.loaded ? 'prototype' : 'fallback';
    return `<div class="asset-diagnostic-item ${className}" title="${escapeHtml(reason)}"><i></i><span><b>${escapeHtml(labels[status.id] || status.id)}</b><small>${escapeHtml(state + runtime)}</small></span></div>`;
  }).join('');
  return { count: `리뷰 ${review} · 승인 ${approved}`, summary, html, loaded, review, approved, fallbacks };
}

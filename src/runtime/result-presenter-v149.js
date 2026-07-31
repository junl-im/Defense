function number(value) {
  return Math.round(Number(value) || 0).toLocaleString();
}

function html(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
}

function stars(rank) {
  return '★'.repeat(Math.max(0, Math.min(9, Number(rank) || 0)));
}

export function buildRunResultPresentationV149(context = {}) {
  const {
    won = false, score = 0, coreHp = 0, kills = 0, maxRank = 0, units = [], unitTypes = {}, runStats = {},
    activeRunMode = {}, runSeed = '', dailyEdict = {}, selectedSeedModeId = 'daily', guardianCouncil = {}, equipmentState = {}
  } = context;
  const baseScore = Number.isFinite(Number(score)) ? Number(score) : 0;
  const finalScore = baseScore + (won ? 5000 + Math.round((Number(coreHp) || 0) * 30) : 0);
  const summary = Object.create(null);
  for (const unit of units) {
    if (!unit || unit.showcase) continue;
    summary[unit.type] = Math.max(summary[unit.type] || 0, Number(unit.rank) || 0);
  }
  const unitsHtml = Object.entries(summary).map(([type, rank]) => {
    const spec = unitTypes[type] || { symbol: '◆', name: type };
    return `<span class="result-unit">${html(spec.symbol)} ${html(spec.name)} ${stars(rank)}</span>`;
  }).join('') || '<span class="result-unit">소환 기록 없음</span>';
  const damageEntries = Object.entries(runStats.damageByType || {}).sort((a, b) => Number(b[1]) - Number(a[1]));
  const [topType, topDamage] = damageEntries[0] || [null, 0];
  const topSpec = topType ? unitTypes[topType] : null;
  const councilBond = guardianCouncil.bond || { icon: '◆', name: '수호 의회' };
  const councilSupport = guardianCouncil.support || { name: '지원 미선택' };
  const analysisHtml = `
      <div><span>최고 피해</span><b>${topSpec && topDamage > 0 ? `${html(topSpec.symbol)} ${html(topSpec.name)}` : '대장 깨비'}</b><small>${number(topDamage || runStats.heroDamage)} 피해</small></div>
      <div><span>집중 명령</span><b>${number(runStats.commandsUsed)}회</b><small>${number(runStats.commandDamage)} 강화 피해</small></div>
      <div><span>이동·수집</span><b>${number(runStats.moveOrders)}회 지정</b><small>엽전 ${number(runStats.coinsCollected)} · 회피 ${number(runStats.dangerDodges)}</small></div>
      <div><span>월식 전과</span><b>보스 ${number(runStats.bossKills)} · 정예 ${number(runStats.eliteKills)}</b><small>결계 방어 ${number(runStats.wardBlocks)}회 · 대박 폭주 ${number(runStats.jackpotTriggers)}회</small></div>
      <div><span>원정 기록</span><b>${html(activeRunMode.icon || '◆')} ${html(activeRunMode.name || '기본 원정')}</b><small>도전 ${number(runStats.trialsCompleted)}회 · 유물 ${number(runStats.relicsChosen)}개 · 세트 ${number(runStats.relicSetsActivated)}</small></div>
      <div><span>위험 패턴</span><b>회피 ${number(runStats.dangerDodges)}회</b><small>파열 회피 ${number(runStats.eliteBurstDodges)} · 피격 ${number(runStats.eliteBurstHits)} · 보스 피격 ${number(runStats.bossHazardHits)}</small></div>
      <div><span>수호신 폭주</span><b>${number(runStats.guardianBursts)}회</b><small>최대 연속 처치 ${number(runStats.maxKillChain)} · 질주 ${number(runStats.dashUses)}회</small></div>
      <div><span>도감 연구</span><b>발견 ${number(runStats.codexDiscoveries)} · 전리품 ${number(runStats.codexDrops)}</b><small>약점 해독 ${number(runStats.weaknessUnlocks)} · 약점 공격 ${number(runStats.weaknessHits)}회</small></div>
      <div><span>수호 의회</span><b>${html(councilBond.icon)} ${html(councilBond.name)}</b><small>${html(councilSupport.name)} · 캠페인 ACT ${number(runStats.actsCleared)}/4</small></div>
      <div><span>보스 파훼</span><b>BREAK ${number(runStats.bossBreaks)}회</b><small>장비 단조 누적 ${number(equipmentState.forged)}회 · 정수 ${number(equipmentState.essence)}</small></div>
      <div><span>원정 시드</span><b>${html(runSeed || '-')}</b><small>${html(dailyEdict.icon || '◆')} ${html(dailyEdict.name || '기본 칙령')} · ${selectedSeedModeId === 'daily' ? '오늘의 원정' : '자유 원정'}</small></div>`;
  return Object.freeze({
    id: 'DD-RUN-RESULT-PRESENTER-V149',
    won: Boolean(won),
    finalScore,
    kicker: won ? 'MOON MARKET SAVED' : 'THE TREE HAS FALLEN',
    title: won ? '달빛 장터 수호 성공!' : '신목을 지키지 못했습니다',
    scoreText: number(finalScore),
    killsText: number(kills),
    rankText: `${Number(maxRank) || 0}★`,
    unitsHtml,
    analysisHtml
  });
}

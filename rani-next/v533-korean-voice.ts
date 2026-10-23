/**
 * v5.33 — Spoken Korean only when it matches a confirmed in-game emergency.
 *
 * Notices remain visible even if they are not spoken. No save, game rules,
 * speech volume or user preference changes. Unrecognized text stays silent.
 */
export type RaniVoiceDecision = { text: string; urgent: true } | null;
export function raniVoiceNotice(text: string, kind: 'info' | 'warn'): RaniVoiceDecision {
  if (kind !== 'warn') return null;
  const notice = String(text || '').replace(/<[^>]*>/g, '').trim();
  if (notice === '주민들이 굶주리고 있습니다!') {
    return {text: '식량 경고. 주민들이 굶주리고 있습니다.', urgent: true};
  }
  if (notice === '영주성이 공격받고 있습니다!') {
    return {text: '긴급 상황. 영주성이 공격받고 있습니다.', urgent: true};
  }
  if (/^적군이 (북쪽|남쪽|동쪽|서쪽|북동쪽|북서쪽|남동쪽|남서쪽)에서 접근합니다!$/.test(notice)) {
    return {text: notice.replace('!', '.'), urgent: true};
  }
  if (/^화재 발생! .{1,80}에 불이 났습니다\.$/.test(notice)) {
    return {text: '화재 경고. 영지에 화재가 발생했습니다.', urgent: true};
  }
  if (/^.{1,80}이\(가\) 함락되었습니다!$/.test(notice)) {
    return {text: '방어 경고. 아군 건물이 함락되었습니다.', urgent: true};
  }
  if (/^.{1,80}이\(가\) 파괴되었습니다!$/.test(notice)) {
    return {text: '피해 경고. 아군 건물이 파괴되었습니다.', urgent: true};
  }
  if (notice === '영주가 사망하여 영지를 잃었습니다.') {
    return {text: '영주가 사망했습니다. 영지를 잃었습니다.', urgent: true};
  }
  return null;
}

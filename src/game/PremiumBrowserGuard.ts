export type BrowserGuardStatus = {
  isMobile: boolean;
  isKakaoTalk: boolean;
  backGuardInstalled: boolean;
  beforeUnloadAvailable: boolean;
};

export function getBrowserGuardStatus(): BrowserGuardStatus {
  const ua = navigator.userAgent || '';
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  return {
    isMobile,
    isKakaoTalk: /KAKAOTALK/i.test(ua),
    backGuardInstalled: history.length > 1,
    beforeUnloadAvailable: 'onbeforeunload' in window,
  };
}

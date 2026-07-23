export const KOREAN_LANGUAGE_GUARD_VERSION = '20.0.0';

const ICON_MAP = Object.freeze({
  '鬼':'👹','王':'👑','面':'🎭','履':'🥾','岩':'🪨','符':'🧿','魂':'💠','骨':'🦴','羽':'🪶','牙':'🦷','鬣':'🦁','鱗':'💎','珠':'🔮','蝕':'🌘','卷':'📜','三':'✦','鈴':'🔔','靈':'✨','封':'🔒','月':'🌙','五':'✦','刃':'⚔️','祭':'🕯️','護':'🛡️','盾':'🛡️','禁':'⛔','鎭':'🔨','山':'⛰️','鏡':'🪞','冊':'📖','裂':'💥','日':'☀️','妖':'👾','走':'💨','呪':'🌀','烏':'🐦','虎':'🐯','龍':'🐉','木':'🌳','門':'⛩️','市':'🏮','燈':'🏮','將':'🗿','壺':'🏺','石':'🪨','物':'📦','火':'🔥','氷':'❄️','風':'🌪️','雷':'⚡','警':'⚠️','神':'✨','砲':'💣','大':'★'
});
const ISOLATED_HAN = /^[\u3400-\u9fff]$/u;

function replaceTextNode(node) {
  const value = node.nodeValue?.trim();
  if (!value || !ISOLATED_HAN.test(value)) return false;
  const replacement = ICON_MAP[value] || '✦';
  node.nodeValue = node.nodeValue.replace(value, replacement);
  return true;
}

function sanitize(root = document.body) {
  if (!root) return 0;
  let count = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) if (replaceTextNode(node)) count += 1;
  return count;
}

export function installKoreanLanguageGuard() {
  const stats = { replacements: sanitize(), mutations: 0 };
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'characterData') {
        if (replaceTextNode(record.target)) stats.replacements += 1;
        continue;
      }
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          if (replaceTextNode(node)) stats.replacements += 1;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          stats.replacements += sanitize(node);
        }
      }
    }
    stats.mutations += records.length;
  });
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true });
  document.documentElement.lang = 'ko';
  window.__DOKKAEBI_LANGUAGE_GUARD__ = Object.freeze({ version: KOREAN_LANGUAGE_GUARD_VERSION, stats });
  return { observer, stats };
}

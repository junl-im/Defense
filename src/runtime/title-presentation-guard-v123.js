export const TITLE_PRESENTATION_MARKER_V123 = 'DD-TITLE-PRESENTATION-V123';

export function installTitlePresentationGuardV123(doc = globalThis.document) {
  if (!doc) return { installed: false };
  const replacements = new Map([
    ['도깨비 운빨 수호대 3D', '도깨비 럭 디펜스 3D'],
    ['도깨비 운빨 수호대', '도깨비 럭 디펜스 3D'],
    ['운빨 수호대', '럭 디펜스 3D'],
  ]);
  const walker = doc.createTreeWalker(doc.documentElement, NodeFilter.SHOW_TEXT);
  let replaced = 0;
  while (walker.nextNode()) {
    const node = walker.currentNode;
    let value = node.nodeValue || '';
    for (const [oldText, newText] of replacements) {
      if (value.includes(oldText)) { value = value.split(oldText).join(newText); replaced += 1; }
    }
    node.nodeValue = value;
  }
  doc.documentElement.dataset.ddTitleV123 = 'ready';
  globalThis.__DOKKAEBI_TITLE_PRESENTATION_V123__ = { marker: TITLE_PRESENTATION_MARKER_V123, replaced, mascot: 'original-v112' };
  return { installed: true, replaced };
}

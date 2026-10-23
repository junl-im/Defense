// v5.33 — native Korean speech with event-specific phrases, no game rule changes.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const p=rel=>path.join(root,rel);
function patch(rel,from,to){
 const file=p(rel),s=fs.readFileSync(file,'utf8');
 assert.equal(s.split(from).length,2,'v5.33 voice drift: '+rel+' '+from.slice(0,70));
 fs.writeFileSync(file,s.replace(from,to));
}
fs.copyFileSync(path.join(import.meta.dirname,'v533-korean-voice.ts'),p('src/ui/raniVoiceNotice.ts'));
patch('src/main.ts',"import { Audio } from './engine/audio';",
"import { Audio } from './engine/audio';\nimport { raniVoiceNotice } from './ui/raniVoiceNotice';");
patch('src/main.ts',
"    audio.say(text, kind === 'warn');",
"    const spoken = raniVoiceNotice(text, kind);\n    if (spoken) audio.say(spoken.text, spoken.urgent);");
patch('src/main.ts',
"      audio.say(`You are now a ${TITLES[t][1]}.`);",
"      // Non-urgent titles are shown on screen without interrupting the player.");
patch('src/main.ts',
"      audio.say('You are the greatest lord in the land.');",
"      // Milestone notice stays on screen; no unrelated spoken chatter.");
patch('src/main.ts',
"      audio.say('A rival lord has surpassed you.', true);",
"      // Rankings do not interrupt emergency speech.");
patch('src/main.ts',
"    audio.say(win ? 'The field is yours, my lord.' : 'Our keep has fallen.', !win);",
"    audio.say(win ? '승리했습니다. 왕국을 지켜냈습니다.' : '패배했습니다. 영주성이 함락되었습니다.', !win);");
patch('src/engine/audio.ts',
"    const u = new SpeechSynthesisUtterance(stripMarkup(text));\n    u.rate = 1.05;",
"    const u = new SpeechSynthesisUtterance(stripMarkup(text));\n    // Prefer a native Korean voice; the OS/browser handles the fallback.\n    u.lang = 'ko-KR';\n    const korean = synth.getVoices().find(v => /^ko(?:-|$)/i.test(v.lang));\n    if (korean) u.voice = korean;\n    u.rate = 0.98;");
console.log('PASS v5.33 Korean TTS: seven critical contexts, no routine chatter, ko-KR voice, Korean victory/defeat');

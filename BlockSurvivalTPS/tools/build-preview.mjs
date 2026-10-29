// © 2026 곰같은여우. Builds a standalone static preview without disturbing Defense Pages.
import {build} from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(base,'dist');
fs.rmSync(dist,{recursive:true,force:true});
fs.mkdirSync(dist,{recursive:true});
await build({
 entryPoints:[path.join(base,'src/game.mjs')],
 bundle:true,format:'esm',platform:'browser',target:['es2020'],minify:true,
 outfile:path.join(dist,'game.bundle.js'),
 legalComments:'external',logLevel:'info'
});
const html=fs.readFileSync(path.join(base,'index.html'),'utf8')
 .replace(/<script type="importmap">[\s\S]*?<\/script>\s*/,'')
 .replace('./src/game.mjs','./game.bundle.js');
if(!html.includes('game.bundle.js')||html.includes('type="importmap"'))throw Error('Standalone preview HTML rewrite failed');
fs.writeFileSync(path.join(dist,'index.html'),html);
fs.copyFileSync(path.join(base,'style.css'),path.join(dist,'style.css'));
const license=path.join(base,'node_modules/three/LICENSE');
if(!fs.existsSync(license))throw Error('Three.js MIT license must be distributed');
fs.copyFileSync(license,path.join(dist,'THREE_LICENSE.txt'));
fs.writeFileSync(path.join(dist,'START_HERE.txt'),[
 '곰같은여우 | Block Survival TPS Alpha 0.1',
 '1. 압축을 푼 뒤 이 폴더에서 간단한 웹 서버를 실행합니다.',
 '2. Python 설치 시: python -m http.server 8000',
 '3. 브라우저: http://localhost:8000/',
 '4. PC: WASD, 마우스 시점, 좌클릭 사격, R 재장전, Shift 질주, ESC 일시정지',
 '5. 모바일: 왼쪽 조이스틱, 오른쪽 시점 드래그, 사격/장전/달리기 버튼',
 '6. 외부 CC0 모델 3종은 선택 로딩; 인터넷 미연결 시 블록형 기본 모델로 진행합니다.',
 '7. 이 ZIP은 원본 라니킹덤과 독립적인 프리뷰 빌드입니다.',
 '8. 저작권: 자체 코드/게임 © 2026 곰같은여우; Three.js MIT; 외부 GLB CC0 개별 출처',
 '9. 3D 모델 출처 및 상세 라이선스: https://github.com/junl-im/Defense/tree/feature/block-survival-tps-v01-20261029/BlockSurvivalTPS/research',
 '10. 온라인 공개 서비스 출시 이전 단계; 실제 모바일 FPS는 아직 미측정입니다.'
].join('\n')+'\n');
console.log('Standalone TPS preview built:',dist);

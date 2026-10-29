// © 2026 곰같은여우. Builds a standalone static preview without disturbing Defense Pages.
import {build} from 'esbuild';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {compactGlb} from './compact-glb.mjs';
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
// Ship selected CC0 models locally so 3D art does not depend on a third-party CDN at runtime.
const sources=JSON.parse(fs.readFileSync(path.join(base,'research/source-lock.json'),'utf8'));
const select=[
 ['minion','gobkit-free-lowpoly','minion/minion-a01.glb'],
 ['bat','gobkit-free-lowpoly','animal/Bat.glb'],
 ['gun','kenney-fps-media','models/blaster.glb'],
 ['ruin','kaykit-dungeon-remastered','Assets/gltf/wall_broken.gltf.glb'],
 ['chest','kaykit-dungeon-remastered','Assets/gltf/chest.glb'],
 ['barrel','kaykit-dungeon-remastered','Assets/gltf/barrel_large.gltf.glb'],
 ['crates','kaykit-dungeon-remastered','Assets/gltf/crates_stacked.gltf.glb'],
 ['hero','kaykit-adventurers','Characters/gltf/Knight.glb',['Idle','Walking_A','Running_A','1H_Ranged_Shoot','1H_Ranged_Reload','Hit_A']],
 ['undead','kaykit-skeletons','Characters/gltf/Skeleton_Minion.glb',['Idle_Combat','Walking_D_Skeletons','Running_A','Unarmed_Melee_Attack_Punch_A','Death_A','Hit_A']]
];
const assetDir=path.join(dist,'assets');
fs.mkdirSync(assetDir,{recursive:true});
const provenance={schema:'block-survival-tps-runtime-cc0/v1',assets:[]};
for(const [id,packId,file,clips] of select){
 const pack=sources.packs.find(p=>p.id===packId);
 if(!pack || !pack.files.includes(file)||pack.license!=='CC0-1.0')throw Error('Unapproved CC0 asset: '+id);
 const url='https://raw.githubusercontent.com/'+pack.repository+'/'+pack.commit+'/'+pack.prefix+file;
 let bytes;
 for(let attempt=1;attempt<=3;attempt++){
  try{
   const response=await fetch(url,{signal:AbortSignal.timeout(25000)});
   if(!response.ok)throw Error('HTTP '+response.status);
   bytes=Buffer.from(await response.arrayBuffer());
   if(bytes.length<28||bytes.length>8*1024*1024||bytes.toString('ascii',0,4)!=='glTF')
    throw Error('Not a valid, bounded GLB: '+id);
   break;
  }catch(err){if(attempt===3)throw Error('Cannot acquire pinned CC0 runtime asset '+id+': '+err.message);}
 }
 const originalBytes=bytes.length;
 const originSha256=crypto.createHash('sha256').update(bytes).digest('hex');
 if(clips){bytes=compactGlb(bytes,clips);}
 fs.writeFileSync(path.join(assetDir,id+'.glb'),bytes);
 provenance.assets.push({id,pack:packId,source:url,commit:pack.commit,license:pack.license,originalBytes,
  originSha256,clips:clips||[],bytes:bytes.length,
  sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
}
fs.writeFileSync(path.join(assetDir,'PROVENANCE.json'),JSON.stringify(provenance,null,2)+'\n');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8')
 .replace(/<script type="importmap">[\s\S]*?<\/script>\s*/,'')
 .replace('./src/game.mjs','./game.bundle.js');
if(!html.includes('game.bundle.js')||html.includes('type="importmap"'))throw Error('Standalone preview HTML rewrite failed');
fs.writeFileSync(path.join(dist,'index.html'),html);
fs.copyFileSync(path.join(base,'style.css'),path.join(dist,'style.css'));
// A fully self-contained file: double-click to play, no localhost or external code CDN.
const embeddedJs=fs.readFileSync(path.join(dist,'game.bundle.js'),'utf8').replace(/<\/script/gi,'<\\/script');
const embeddedCss=fs.readFileSync(path.join(dist,'style.css'),'utf8').replace(/<\/style/gi,'<\\/style');
const direct=html
 .replace('<link rel="stylesheet" href="./style.css">','<style>'+embeddedCss+'</style>')
 .replace('<script type="module" src="./game.bundle.js"></script>','<script type="module">'+embeddedJs+'</script>');
if(!direct.includes('<script type="module">')||!direct.includes('<style>')||direct.length<embeddedJs.length)throw Error('Direct HTML was not fully embedded');
fs.writeFileSync(path.join(dist,'BLOCK_SURVIVAL_TPS_바로실행.html'),direct);
const license=path.join(base,'node_modules/three/LICENSE');
if(!fs.existsSync(license))throw Error('Three.js MIT license must be distributed');
fs.copyFileSync(license,path.join(dist,'THREE_LICENSE.txt'));
fs.writeFileSync(path.join(dist,'START_HERE.txt'),[
 '곰같은여우 | Block Survival TPS Alpha 0.4',
 '1. 가장 쉬운 실행: BLOCK_SURVIVAL_TPS_바로실행.html 파일을 더블클릭합니다.',
 '2. 브라우저가 최신 WebGL을 지원해야 3D가 표시됩니다.',
 '3. 웹서버 방식도 지원: python -m http.server 8000 후 http://localhost:8000/',
 '4. PC: WASD, 마우스 시점, 좌클릭 사격, R 재장전, Shift 질주, ESC 일시정지',
 '5. 모바일: 왼쪽 조이스틱, 오른쪽 시점 드래그, 사격/장전/달리기 버튼',
 '6. KayKit 리깅 생존자·언데드, Gobkit 몹, Kenney 총기 등 공식 CC0 원본 9종 내장. 네트워크 불필요.',
 '7. 이 ZIP은 설치용 게임이 아닌 브라우저 실행 보조 파일입니다. 공개 웹사이트에서도 플레이할 수 있습니다.',
 '8. 저작권: 자체 코드/게임 © 2026 곰같은여우; Three.js MIT; 외부 GLB CC0 개별 출처',
 '9. 3D 모델 출처 및 상세 라이선스: https://github.com/junl-im/Defense/tree/main/BlockSurvivalTPS/research',
 '10. 온라인 공개 서비스 출시 이전 단계; 실제 모바일 FPS는 아직 미측정입니다.'
].join('\n')+'\n');
console.log('Standalone TPS preview built:',dist);

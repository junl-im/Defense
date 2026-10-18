// Public GitHub Pages end-to-end availability check (real external URL).
// Deliberately separate from headless local WebGL QA.
const revision=process.env.GITHUB_SHA||'';
const root='https://junl-im.github.io/Defense/';
const checks=[
 {path:'',kind:'html',contains:['Defense Reboot','히로인 군단','src=']},
 {path:'assets/characters/medieval.glb',kind:'glb'},
 {path:'assets/characters/witch.glb',kind:'glb'},
 {path:'assets/sprites/ally-female.png',kind:'png'},
 {path:'assets/sprites/enemy-female.png',kind:'png'},
 {path:'assets/sprites/heroine-portrait.png',kind:'png'}
];
async function verify(entry){
 const url=root+entry.path+'?preview_rev='+encodeURIComponent(revision);
 const rsp=await fetch(url,{signal:AbortSignal.timeout(15000),cache:'no-store'});
 if(!rsp.ok)throw Error(entry.path+' HTTP '+rsp.status);
 const bytes=new Uint8Array(await rsp.arrayBuffer());
 if(entry.kind==='glb' && !(bytes[0]===103&&bytes[1]===108&&bytes[2]===84&&bytes[3]===70))throw Error(entry.path+' GLB magic missing');
 if(entry.kind==='png' && !(bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71))throw Error(entry.path+' PNG magic missing');
 if(entry.kind==='html'){
  const body=new TextDecoder().decode(bytes);
  for(const key of entry.contains)if(!body.includes(key))throw Error('Live page missing '+key);
 }
 return entry.path||'index.html';
}
let failures=[];
for(let attempt=1;attempt<=12;attempt++){
 failures=[];
 for(const target of checks){
  try{const name=await verify(target);console.log('PASS',name);}
  catch(error){failures.push(error.message);}
 }
 if(failures.length===0){console.log('Published preview HTTP and essential art are live at',root);process.exit(0);}
 console.warn('Attempt',attempt,'failed:',failures.join(' | '));
 if(attempt<12)await new Promise(ok=>setTimeout(ok,8000));
}
console.error('GitHub Pages did not serve all expected new-game files:',failures);
process.exit(1);

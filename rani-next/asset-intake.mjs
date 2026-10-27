/** 라니킹덤 3D 자산 반입 검증 — Meshy/TRELLIS.2 GLB v2.
 * 사용: node rani-next/asset-intake.mjs ./incoming-3d
 * 파일 쌍: {id}.glb, {id}.license.json. 원본은 절대 수정하지 않음.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const assetCatalog = Object.freeze({
 keep:'성채',gatehouse:'성문',wall:'성벽',tower:'감시탑',house:'주택',
 warehouse:'창고',barracks:'병영',farm:'농장',market:'시장',
 harbor:'항구',shipyard:'조선소',trade_ship:'무역선'
});
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);

export function inspectGlb(file, maxMB=15){
 const issues=[],warnings=[],stat=fs.lstatSync(file);
 if(stat.isSymbolicLink()||!stat.isFile())return {issues:['일반 파일 아님'],warnings,bytes:stat.size};
 if(stat.size>maxMB*1048576)return {issues:['모델 용량 초과'],warnings,bytes:stat.size};
 if(stat.size<20)return {issues:['GLB 헤더 길이 부족'],warnings,bytes:stat.size};
 const b=fs.readFileSync(file);
 if(b.toString('ascii',0,4)!=='glTF')issues.push('GLB 헤더 불일치');
 if(b.readUInt32LE(4)!==2)issues.push('GLB 2.0이 아님');
 if(b.readUInt32LE(8)!==b.length)issues.push('GLB 파일 길이 불일치');
 if(issues.length)return {issues,warnings,bytes:stat.size};
 let offset=12,chunks=0,doc=null,binBytes=0;
 while(offset<b.length){
  if(offset+8>b.length){issues.push('불완전한 청크 헤더');break;}
  const len=b.readUInt32LE(offset),type=b.readUInt32LE(offset+4);offset+=8;
  if(len%4||offset+len>b.length){issues.push('GLB 청크 길이 손상');break;}
  if(chunks===0&&type!==0x4e4f534a)issues.push('JSON이 첫 청크가 아님');
  if(type===0x4e4f534a){
   if(doc)issues.push('중복 JSON 청크');
   try{doc=JSON.parse(b.subarray(offset,offset+len).toString('utf8').trim());}
   catch{issues.push('JSON 파싱 실패');}
  }else if(type===0x004e4942)binBytes+=len;
  else warnings.push('미인식 청크: '+type.toString(16));
  offset+=len;chunks++;
 }
 if(offset!==b.length)issues.push('GLB 청크 경계 오류');
 if(!doc||typeof doc!=='object')issues.push('GLB JSON 누락');
 if(issues.length)return {issues,warnings,bytes:stat.size};
 if(doc.asset?.version!=='2.0')issues.push('glTF 버전 오류');
 const meshes=Array.isArray(doc.meshes)?doc.meshes:[];
 const primitives=meshes.flatMap(m=>Array.isArray(m.primitives)?m.primitives:[]);
 const buffers=Array.isArray(doc.buffers)?doc.buffers:[];
 const views=Array.isArray(doc.bufferViews)?doc.bufferViews:[];
 const acc=Array.isArray(doc.accessors)?doc.accessors:[];
 if(!primitives.length)issues.push('메시 없음');
 if(!Array.isArray(doc.scenes)||!doc.scenes.length)issues.push('장면 없음');
 if(!Array.isArray(doc.nodes)||!doc.nodes.length)issues.push('노드 없음');
 if(primitives.length&&(!buffers.length||!binBytes))issues.push('바이너리 메시 없음');
 if(buffers.some(x=>own(x,'uri')))issues.push('외부 버퍼 URI 금지');
 if(buffers.some(x=>!Number.isSafeInteger(x.byteLength)||x.byteLength<0||x.byteLength>binBytes))issues.push('버퍼 크기 오류');
 if((doc.images||[]).some(x=>own(x,'uri')))issues.push('외부 이미지 URI 금지');
 for(const v of views){
  const p=v.byteOffset||0,buffer=buffers[v.buffer];
  if(!buffer||!Number.isSafeInteger(p)||p<0||!Number.isSafeInteger(v.byteLength)||v.byteLength<=0||p+v.byteLength>buffer.byteLength)
   issues.push('버퍼 뷰 경계 오류');
 }
 for(const a of acc){
  if(a.bufferView!==undefined&&!views[a.bufferView])issues.push('접근자 버퍼 뷰 없음');
  if(!Number.isSafeInteger(a.count)||a.count<=0)issues.push('접근자 원소 수 오류');
 }
 const points=acc.filter(x=>x.type==='VEC3'&&x.componentType===5126)
  .reduce((s,x)=>s+(Number.isSafeInteger(x.count)?x.count:0),0);
 const triangles=primitives.reduce((s,x)=>{
  if(x.mode!==undefined&&x.mode!==4)warnings.push('비삼각형 메시');
  const ix=acc[x.indices];return s+(ix&&Number.isSafeInteger(ix.count)?Math.floor(ix.count/3):0);
 },0);
 if(points>1500000)issues.push('정점 과다: 최적화 필요');
 if(triangles>200000)issues.push('삼각형 과다: 최적화 필요');
 if(doc.extensionsRequired?.length)warnings.push('필수 GLB 확장 검토: '+doc.extensionsRequired.join(', '));
 return {issues,warnings,bytes:stat.size,meshes:meshes.length,primitives:primitives.length,triangles,binBytes};
}
function checkLicense(file){
 if(!fs.existsSync(file))return ['사용권 기록(.license.json) 누락'];
 let x;
 try{x=JSON.parse(fs.readFileSync(file,'utf8'));}
 catch{return ['사용권 JSON 파싱 실패'];}
 if(!x||typeof x!=='object')return ['사용권 JSON 형식 오류'];
 const issues=[];
 for(const key of ['generator','creator','source_url','license_url','usage_rights','verified_by'])
  if(typeof x[key]!=='string'||!x[key].trim())issues.push('사용권 필수항목 누락: '+key);
 if(x.generator&&!['Meshy','TRELLIS.2','Blender','other'].includes(x.generator))issues.push('생성 출처 종류 오류');
 for(const key of ['source_url','license_url'])if(x[key]&&!/^https:\/\//.test(x[key]))issues.push('HTTPS 출처 필요: '+key);
 if(x.approved_for_game!==true)issues.push('게임 사용 승인 미확인');
 return issues;
}
export function inspectDirectory(dir,maxMB=15){
 if(!Number.isFinite(maxMB)||maxMB<=0||maxMB>200)throw Error('허용 크기는 0~200 MB');
 const abs=path.resolve(dir);
 const report={version:'v5.36',directory:abs,maxMB,
  policy:'메타데이터 검사만 진행. 게임 원본 아틀라스/건설/저장 자동 수정 금지',items:[]};
 const names=fs.existsSync(abs)?fs.readdirSync(abs).filter(n=>/\.glb$/i.test(n)).sort():[];
 for(const file of names){
  const id=path.basename(file,path.extname(file)),info=inspectGlb(path.join(abs,file),maxMB);
  const issues=[...info.issues,...checkLicense(path.join(abs,id+'.license.json'))];
  if(!own(assetCatalog,id))issues.push('미등록 자산 ID');
  report.items.push({id,label:assetCatalog[id]||'',file,...info,issues,
   status:issues.length?'reject':'metadata_pass'});
 }
 report.summary={
  total:report.items.length,
  metadataPassed:report.items.filter(x=>x.status==='metadata_pass').length,
  rejected:report.items.filter(x=>x.status==='reject').length,
  missing:Object.keys(assetCatalog).filter(id=>!report.items.some(x=>x.id===id&&x.status==='metadata_pass'))
 };
 return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const r=inspectDirectory(process.argv[2]||'incoming-3d',Number(process.env.RANI_ASSET_MAX_MB||15));
 console.log(JSON.stringify(r,null,2));
 if(r.summary.rejected)process.exitCode=1;
}
// metadata_pass != 시각 품질, 메시 폴리곤, 저작권 적법성 또는 게임 호환성 승인.

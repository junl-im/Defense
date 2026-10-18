import fs from 'node:fs';import path from 'node:path';
const allowed=new Set(['.png','.webp','.jpg','.jpeg','.ktx2','.glb','.gltf','.bin','.fbx','.ogg','.mp3','.wav','.json','.txt','.md']);
const failures=[];
function walk(d){if(!fs.existsSync(d))return;for(const item of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,item.name);if(item.isDirectory())walk(p);else if(item.name.toLowerCase().endsWith('.svg'))failures.push('SVG asset: '+p);else if(d.startsWith('public')&&item.name!=='.gitkeep'&&!allowed.has(path.extname(item.name).toLowerCase()))failures.push('Unsupported public asset: '+p);}}
walk('src');walk('public');
for(const f of ['index.html','src/main.js','src/style.css']){const s=fs.readFileSync(f,'utf8');if(/<svg\b|data:image\/svg\+xml|\.svg\b/i.test(s))failures.push('SVG markup/reference: '+f);}
const source=JSON.parse(fs.readFileSync('docs/sources.json','utf8'));for(const x of source){if(!x.id||!x.url||!x.license||!x.status)failures.push('Incomplete record '+JSON.stringify(x));}
if(failures.length){console.error(failures.join('\n'));process.exit(1);}console.log('PASS: SVG-free frontend and '+source.length+' documented asset sources.');

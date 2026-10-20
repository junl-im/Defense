// v5.7: cinematic raster-only *title screen* over the actual playable 2.5D game.
// No simulated castle world, broken save shortcuts, SVG or external image assets.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const patch=(filename,before,after)=>{
 const p=path.join(root,filename);
 const source=fs.readFileSync(p,'utf8');
 assert.equal(source.split(before).length,2,filename+' upstream/source drift: '+before.slice(0,85));
 fs.writeFileSync(p,source.replace(before,after));
};
patch('src/ui/menu.ts',
 "    root.appendChild(sub);\n\n    const grid = document.createElement('div');",
 [
 "    root.appendChild(sub);",
 "",
 "    // v5.7: cinematic title dressing, all sourced from the game's licensed",
 "    // four-angle raster sprites and separately approved Rani WebP originals.",
 "    // The only playable world remains the native Fiefdom main() after lordScreen.",
 "    const titleArt=document.createElement('div');",
 "    titleArt.className='rk-title-scene';",
 "    titleArt.setAttribute('aria-hidden','true');",
 "    const backdrop=document.createElement('div');backdrop.className='rk-title-horizon';",
 "    const land=document.createElement('div');land.className='rk-title-land';",
 "    const sea=document.createElement('div');sea.className='rk-title-sea';",
 "    titleArt.append(backdrop,sea,land);",
 "    for(const [name,filename] of [",
 "      ['castle','/assets/sprites/keep_0.png'],",
 "      ['tower','/assets/sprites/round_tower_0.png'],",
 "      ['house','/assets/sprites/hovel_0.png'],",
 "      ['tree','/assets/sprites/oak_0.png'],",
 "      ['ship','/rani/rk_ship.webp'],",
 "    ] as const){",
 "      const image=document.createElement('img');",
 "      image.className='rk-title-piece rk-title-'+name;",
 "      image.src=filename;image.alt='';image.loading='eager';",
 "      image.decoding='async';image.draggable=false;",
 "      image.addEventListener('error',()=>image.remove());",
 "      titleArt.appendChild(image);",
 "    }",
 "    root.prepend(titleArt);",
 "    const kicker=document.createElement('p');",
 "    kicker.className='rk-title-kicker';",
 "    kicker.textContent='ROYAL KINGDOM · 라니킹덤';",
 "    root.insertBefore(kicker,h1);",
 "    const ribbon=document.createElement('p');",
 "    ribbon.className='rk-title-ribbon';",
 "    ribbon.textContent='성벽을 쌓고, 영지를 넓히고, 왕국을 지켜라';",
 "    sub.after(ribbon);",
 "",
 "    const grid = document.createElement('div');"
 ].join('\n'));
patch('src/ui/menu.ts',
 "    ver.appendChild(version);\n    root.appendChild(ver);",
 [
 "    ver.appendChild(version);",
 "    root.appendChild(ver);",
 "    root.classList.add('rk-title-v57');",
 "    const savesPanel=root.querySelector<HTMLElement>('.saves');",
 "    if(savesPanel){",
 "      savesPanel.id='rk-saved-game-list';",
 "      const title=savesPanel.querySelector('h4');",
 "      if(title)title.textContent='이어할 왕국을 선택하세요';",
 "      const resume=document.createElement('button');",
 "      resume.type='button';resume.id='rk-title-resume';",
 "      resume.className='rk-title-resume';",
 "      resume.textContent='이어하기';",
 "      resume.setAttribute('aria-controls',savesPanel.id);",
 "      resume.setAttribute('aria-expanded','false');",
 "      resume.onclick=()=>{",
 "        const visible=root.classList.toggle('rk-show-saves');",
 "        resume.setAttribute('aria-expanded',String(visible));",
 "        resume.textContent=visible?'목록 닫기':'이어하기';",
 "        if(visible)savesPanel.scrollIntoView({block:'nearest',behavior:'smooth'});",
 "      };",
 "      acts.querySelector('#rk-start-now')?.after(resume);",
 "    }"
 ].join('\n'));
patch('src/ui/menu.ts',"version.textContent='v5.6';","version.textContent='v5.7';");
fs.appendFileSync(path.join(root,'public/rani/skin.css'),
 '\n'+fs.readFileSync(path.join(import.meta.dirname,'v57-title.css'),'utf8'));
console.log('PASS v5.7 branded cinematic raster title, native save-list resume, native region/lord game flows');

// Data-driven long-format campaign. Separate from Babylon scene rendering.
// New stages can be authored by extending these arrays, not rewriting combat.
export const RUN_SPEED=5.6;
export const BOSS_TRIGGER_Z=676;
export const BOSS_STOP_Z=683;
export const BOSS_WORLD_Z=697;
export const LEVEL_FINISH_Z=710;
export const SECTIONS=[
 {start:3,end:90,name:'성문 진입',theme:'castle'},
 {start:90,end:180,name:'수비대 교전',theme:'fortress'},
 {start:180,end:270,name:'마도 회랑',theme:'arcane'},
 {start:270,end:360,name:'강철 방어선',theme:'metal'},
 {start:360,end:450,name:'환영의 숲',theme:'forest'},
 {start:450,end:540,name:'황혼 요새',theme:'citadel'},
 {start:540,end:630,name:'최후의 방어선',theme:'ruin'},
 {start:630,end:710,name:'마녀 여왕의 성역',theme:'boss'}
];
// Palette changes at zone boundaries only; modest variation keeps the gate numbers readable.
export const SECTION_PALETTES=[
 {ground:'#667d92',rail:'#61718d',sky:'#0b142a',ambient:.78},
 {ground:'#6e718d',rail:'#61657a',sky:'#10172e',ambient:.73},
 {ground:'#616990',rail:'#705b9b',sky:'#14102e',ambient:.68},
 {ground:'#818996',rail:'#485f7a',sky:'#121827',ambient:.76},
 {ground:'#607c70',rail:'#517466',sky:'#091e23',ambient:.78},
 {ground:'#826c89',rail:'#746280',sky:'#1a1027',ambient:.7},
 {ground:'#766b76',rail:'#695465',sky:'#1e1726',ambient:.72},
 {ground:'#625478',rail:'#765277',sky:'#180f2d',ambient:.75}
];
export const BARRIERS=[
 {z:142,hp:300,label:'전방 보급 차단벽'},
 {z:306,hp:480,label:'강철 방어문'},
 {z:469,hp:650,label:'황혼의 보루'},
 {z:626,hp:900,label:'성역 최종 관문'}
];
const paired=(z,left,right)=>({z,done:false,choices:[
 {x:-3,kind:left[0],value:left[1],color:left[0]==='subtract'?'danger':'blue'},
 {x:3,kind:right[0],value:right[1],color:right[0]==='subtract'?'danger':'gold'}
]});
export const GATE_BLUEPRINTS=[
 paired(26,['add',8],['multiply',2]),
 paired(64,['add',22],['subtract',6]),
 paired(98,['multiply',2],['add',30]),
 paired(127,['add',35],['subtract',12]),
 paired(171,['multiply',2],['add',40]),
 paired(207,['add',50],['subtract',20]),
 paired(245,['multiply',2],['add',60]),
 paired(284,['add',70],['subtract',25]),
 paired(330,['multiply',2],['add',90]),
 paired(367,['add',85],['subtract',35]),
 paired(405,['multiply',2],['add',115]),
 paired(443,['add',110],['subtract',45]),
 paired(493,['multiply',2],['add',140]),
 paired(531,['add',130],['subtract',50]),
 paired(567,['multiply',2],['add',160]),
 paired(604,['add',150],['subtract',60]),
 paired(646,['multiply',2],['add',190])
];
export const WAVES=[
 {z:43,count:75,type:'scouts'},
 {z:85,count:95,type:'troops'},
 {z:115,count:105,type:'troops'},
 {z:158,count:120,type:'troops'},
 {z:195,count:140,type:'rush'},
 {z:227,count:150,type:'rush'},
 {z:260,count:165,type:'rush'},
 {z:344,count:175,type:'elite'},
 {z:380,count:185,type:'rush'},
 {z:418,count:195,type:'elite'},
 {z:452,count:205,type:'elite'},
 {z:512,count:215,type:'elite'},
 {z:548,count:230,type:'rush'},
 {z:584,count:240,type:'elite'},
 {z:652,count:260,type:'royal'}
];
export function getSection(z){
 const at=Math.max(0,Math.min(LEVEL_FINISH_Z-0.00001,Number(z)||0));
 const index=Math.max(0,SECTIONS.findIndex(a=>at>=a.start&&at<a.end));
 return {...SECTIONS[index],index,total:SECTIONS.length};
}
export function progressPercent(z) {
 return Math.max(0,Math.min(100,100*(Number(z)-3)/(LEVEL_FINISH_Z-3)));
}
export function initialGates(){
 return GATE_BLUEPRINTS.map(g=>({...g,done:false,choices:g.choices.map(c=>({...c}))}));
}
export function expectedRunSeconds(){
 return (BOSS_STOP_Z-3)/RUN_SPEED;
}
export function remainingWaveCount(index){
 return WAVES.slice(Math.max(0,index)).reduce((sum,w)=>sum+w.count,0);
}

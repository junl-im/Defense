/* No SVG. Existing temporary emoji remain ONLY where individual art is pending. */
import { RANI_RESOURCE_ICONS, RANI_GAMEPLAY_ICONS } from './RaniAssetRegistry.js';
const ICONS={"wood":"🌲","stone":"🪨","food":"🌾","gold":"🪙","influence":"👑","population":"👥","stability":"🛡️","storage":"📦","settlement":"🏘️","village_tier":"🏘️","town":"🏙️","city":"🏙️","kingdom":"🏰","castle":"🏰","bridge":"◆","farm":"🌾","lumber_mill":"🌲","mine":"⛏️","market":"🏪","watchtower":"◆","road":"🛤️","trade_post":"🏪","garrison":"🛡️","archer_tower":"🏹","ballista_tower":"◆","gate":"◆","bastion":"◆","siege_camp":"◆","warfare":"⚔️","apiary":"◆","fishing_pier":"◆","bakery":"◆","sawmill":"◆","forge":"◆","stable":"◆","barracks":"⚔️","temple":"◆","port":"◆","university":"📚","observatory":"◆","library":"◆","unit_bow":"🏹","unit_knight":"🐎","crop_rotation":"◆","iron_tools":"◆","crossbows":"◆","upgrade":"◆","build":"🏗️","agriculture":"◆","mining":"◆","engineering":"◆","trade":"◆","military":"◆","research":"📚","friendly":"◆","neutral":"◆","hostile":"◆","barbarian":"◆","bandit":"◆","caravan":"◆","raid":"◆","famine":"◆","prosperity":"◆","migration":"◆","map":"🗺️","borders":"◆","reclaim":"◆","gift":"◆","flag":"🚩","sword":"⚔️","forest":"🌲","field":"🌾","river":"🌊","mountain":"◆","village":"🏘️","meadow":"◆","hills":"◆","lake":"🌊","quarry":"⛏️","swamp":"◆","ruins":"◆"};
export const GAME_ICONS=Object.fromEntries(Object.keys(ICONS).map(k=>[k,{emoji:ICONS[k]}]));
export function iconSvg(key){return ICONS[key]||'◆'}
export function iconLabel(key){const names={"wood":"목재","stone":"석재","food":"식량","gold":"금화","influence":"영향력","forest":"숲","field":"농경지","river":"강","mountain":"산악","village":"마을","meadow":"초원","hills":"구릉","lake":"호수","quarry":"채석장","swamp":"늪지","ruins":"유적","sword":"전투","map":"지도","flag":"점령","caravan":"상단","storage":"창고","raid":"약탈","famine":"기근","prosperity":"번영","migration":"이주"}; return names[key]||ICONS[key]||'항목'}
export function iconHtml(key,size='sm'){
  const asset=RANI_RESOURCE_ICONS[key]||RANI_GAMEPLAY_ICONS[key];
  if(!asset)return '<span class="ico ico--'+size+' ico-'+key+'" aria-hidden="true">'+iconSvg(key)+'</span>';
  // Only approved literal paths from the registry; no string-built remote URLs.
  // A browser image error will reveal the previous pictogram automatically.
  return '<span class="ico ico--'+size+' ico-'+key+' rani-raster-ico" aria-hidden="true">'+
    '<img class="rani-raster-image" src="'+asset+'" alt="" draggable="false" decoding="async">'+
    '<span class="rani-raster-fallback" hidden>'+iconSvg(key)+'</span></span>';
}
if(typeof document!=='undefined'){
  document.addEventListener('error',e=>{
    const img=e.target;
    if(!(img instanceof HTMLImageElement)||!img.classList.contains('rani-raster-image'))return;
    img.hidden=true;
    const fallback=img.nextElementSibling;
    if(fallback?.classList.contains('rani-raster-fallback'))fallback.hidden=false;
  },true);
}
export function withIcon(key,text){return iconHtml(key)+' '+text}
export function tileIconHtml(type,previewColor){const color=/^#[0-9a-fA-F]{3,8}$/.test(previewColor||'')?previewColor:'#947a52';return '<span class="ico ico--tile ico-tile" style="--swatch:'+color+'" aria-hidden="true">'+iconSvg(type)+'</span>'}

// One packed raster atlas: 11 distinct 2.5D hex thumbnails, no SVG glyphs.
// Grid positions are fixed and isolated from the saved kingdom's tile data.
export const TERRAIN_ATLAS_URL = 'assets/terrain/rani-terrain-atlas.webp';
export const TERRAIN_CELL_SIZE = 160;
export const TERRAIN_SLOTS = Object.freeze({
  forest:[0,0], field:[1,0], meadow:[2,0], hills:[3,0],
  river:[0,1], lake:[1,1], swamp:[2,1], mountain:[3,1],
  quarry:[0,2], village:[1,2], ruins:[2,2],
});
export function terrainArtworkPosition(type) {
  const [column,row] = TERRAIN_SLOTS[type] || TERRAIN_SLOTS.meadow;
  return `${column*100/3}% ${row*50}%`;
}
export function paintTerrainArtwork(ctx,atlas,type,x,y,size) {
  if(!atlas?.complete || atlas.naturalWidth!==640 || atlas.naturalHeight!==480)return false;
  const [col,row]=TERRAIN_SLOTS[type] || TERRAIN_SLOTS.meadow;
  ctx.drawImage(atlas,col*TERRAIN_CELL_SIZE,row*TERRAIN_CELL_SIZE,
    TERRAIN_CELL_SIZE,TERRAIN_CELL_SIZE,x,y,size,size);
  return true;
}

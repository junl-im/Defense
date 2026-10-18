import { TILE_TYPES } from '../tiles/TileDefs.js';
import { SAVE_KEY } from './SaveSystem.js';

export const BEFORE_IMPORT_KEY = 'kingdom-slg-before-import-v1';
export const MAX_BACKUP_BYTES = 2 * 1024 * 1024;
const object = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const finite = (v) => typeof v === 'number' && Number.isFinite(v);
const dangerous = new Set(['__proto__', 'prototype', 'constructor']);

export function validateBackup(text) {
  if (typeof text !== 'string' || !text.trim()) throw new Error('백업 파일이 비어 있습니다.');
  if (new TextEncoder().encode(text).length > MAX_BACKUP_BYTES) throw new Error('파일은 2MB 이하여야 합니다.');
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('정상적인 JSON 파일이 아닙니다.'); }
  if (!object(data) || ![2, 3].includes(data.version)) throw new Error('지원하지 않는 백업 버전입니다.');
  if (!Array.isArray(data.cells) || data.cells.length < 1 || data.cells.length > 2500 ||
      !Number.isInteger(data.tilesPlaced) || data.tilesPlaced < 1 ||
      data.tilesPlaced > data.cells.length) throw new Error('영토 기록이 올바르지 않습니다.');
  if (!finite(data.score) || data.score < 0 ||
      !Number.isInteger(data.drawCount) || data.drawCount < 0 ||
      !Number.isInteger(data.worldSeed) || data.worldSeed < 0 ||
      data.worldSeed > 0xffffffff) throw new Error('왕국 기본 기록이 올바르지 않습니다.');
  let nodes = 0;
  const visit = (v, depth) => {
    if (++nodes > 50000 || depth > 18) throw new Error('백업 파일 구조가 너무 복잡합니다.');
    if (typeof v === 'string' && v.length > 120000) throw new Error('백업 데이터에 비정상적인 문자열이 있습니다.');
    if (Array.isArray(v)) {
      if (v.length > 12000) throw new Error('백업 배열이 너무 큽니다.');
      for (const el of v) visit(el, depth+1);
    } else if (object(v)) {
      if (Object.keys(v).length > 3000) throw new Error('백업 속성이 너무 많습니다.');
      for (const [key, value] of Object.entries(v)) {
        if (dangerous.has(key)) throw new Error('허용되지 않은 백업 항목이 있습니다.');
        visit(value, depth+1);
      }
    } else if (v !== null && typeof v !== 'string' && typeof v !== 'boolean' && !finite(v)) {
      throw new Error('지원하지 않는 저장 항목 형식입니다.');
    }
  };
  visit(data, 0);
  let origin = false;
  const coords = new Set();
  for (const c of data.cells) {
    if (!object(c) || !Number.isInteger(c.q) || !Number.isInteger(c.r) ||
        Math.abs(c.q)>150 || Math.abs(c.r)>150 ||
        !Object.hasOwn(TILE_TYPES, c.t) ||
        !Number.isInteger(c.v) || c.v < 0 || c.v >= TILE_TYPES[c.t].variants.length ||
        !Number.isInteger(c.rot) || c.rot < 0 || c.rot > 5 ||
        (c.age !== undefined && (!finite(c.age) || c.age<0 || c.age>1e9))) {
      throw new Error('지형 데이터가 올바르지 않습니다.');
    }
    if (c.owner !== undefined && (typeof c.owner !== 'string' || c.owner.length > 120))
      throw new Error('지형 소유자 정보가 올바르지 않습니다.');
    for (const arr of [c.road, c.river]) {
      if (arr === undefined) continue;
      if (!Array.isArray(arr) || arr.length > 6 ||
        arr.some((edge)=>!Number.isInteger(edge) || edge<0 || edge>5))
        throw new Error('도로 또는 강 정보가 올바르지 않습니다.');
    }
    const key=c.q+','+c.r;
    if(coords.has(key)) throw new Error('영토 좌표가 중복되었습니다.');
    coords.add(key);
    if(c.q===0 && c.r===0 && c.t==='village') origin=true;
  }
  if(!origin) throw new Error('시작 마을이 존재하지 않습니다.');
  if (data.next != null && (!object(data.next) || !Object.hasOwn(TILE_TYPES,data.next.type) ||
      !Number.isInteger(data.next.variant) || data.next.variant < 0 ||
      data.next.variant >= TILE_TYPES[data.next.type].variants.length))
    throw new Error('선택 지형 데이터가 올바르지 않습니다.');
  for (const key of ['resources','citizens','progression','territory','factions','buildings','research','army']) {
    if (data[key] != null && !object(data[key])) throw new Error('저장 구성 요소에 오류가 있습니다.');
  }
  return data;
}

export function exportKingdom(game) {
  if (!game.saveSystem.enabled) throw new Error('브라우저 저장소를 사용할 수 없습니다.');
  game.saveSystem.save(game);
  const raw=localStorage.getItem(SAVE_KEY);
  if(!raw) throw new Error('저장된 왕국 기록이 없습니다.');
  validateBackup(raw);
  return raw;
}

export function importKingdom(text) {
  const data=validateBackup(text);
  const old=localStorage.getItem(SAVE_KEY);
  if(old!==null) localStorage.setItem(BEFORE_IMPORT_KEY,old);
  else localStorage.removeItem(BEFORE_IMPORT_KEY);
  try { localStorage.setItem(SAVE_KEY,JSON.stringify(data)); }
  catch {
    if(old===null) localStorage.removeItem(SAVE_KEY);
    else localStorage.setItem(SAVE_KEY,old);
    throw new Error('복원 저장에 실패했습니다. 기존 기록을 유지했습니다.');
  }
  return data;
}

export function canUndoImport() {
  try {return !!localStorage.getItem(BEFORE_IMPORT_KEY);} catch {return false;}
}

export function undoImport() {
  const raw=localStorage.getItem(BEFORE_IMPORT_KEY);
  if(!raw) throw new Error('되돌릴 왕국 기록이 없습니다.');
  const previous=validateBackup(raw);
  localStorage.setItem(SAVE_KEY,JSON.stringify(previous));
  localStorage.removeItem(BEFORE_IMPORT_KEY);
  return previous;
}

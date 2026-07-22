import fs from 'node:fs';
const main=fs.readFileSync('src/main.js','utf8');
const system=fs.readFileSync('src/engine/animation-state-system.js','utf8');
for(const token of ['AnimationMixer','distanceLimit','idle','move','run','attack','skill','hit','death','setBaseState']) if(!system.includes(token)) throw new Error(`animation token missing: ${token}`);
for(const token of ['new AnimationStateSystem','animations.createController','animations.setBaseState','animations.trigger','animations.update']) if(!main.includes(token)) throw new Error(`main integration missing: ${token}`);
if(main.includes('releaseEnemyModel(enemy);\n    const color') && main.includes('enemy.group.traverse((object)=>{object.geometry?.dispose()')) throw new Error('pooled enemy assets must not be disposed on kill');
console.log('Animation system verification passed.');

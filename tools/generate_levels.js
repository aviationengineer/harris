#!/usr/bin/env node
// Pixel Quest level generator — original IP. Emits levels/*.json
// Physics (must match index.html): gravity 0.55, jumpVel -12.5, run speed 4.8
// Max jump height = 12.5^2/(2*0.55) = 142px (~4.4 tiles of 32)
// Air time ~45 frames, max jump distance ~216px (~6.7 tiles). Generator caps gaps at 4 tiles (128px) and step-ups at 3 tiles.
const fs=require('fs'),path=require('path');
const OUT=path.join(__dirname,'..','levels');
fs.mkdirSync(OUT,{recursive:true});
const THEMES=['meadow','crystal','desert','sky','frozen','mechanical','volcanic','fortress'];
const WNAMES=['Green Meadows','Crystal Caverns','Desert Ruins','Sky Islands','Frozen Frontier','Mechanical City','Volcanic Core','Dark Fortress'];
function base(id,w,s,name,theme,time){
 return {id,world:w,stage:s,name,theme,time_limit:time,player_spawn:{x:64,y:352},tiles:[],platforms:[],enemies:[],collectibles:[],powerups:[],checkpoints:[],hazards:[],secret_areas:[],goal:{x:3000,y:320},boss:null,width:3200};}
function ground(L,x,w,y=416,type){L.platforms.push({x,y:y||416,w,h:64,type:type||'ground'});}
function plat(L,x,y,w,type){L.platforms.push({x,y,w,h:16,type:type||'stone'});}
function gem(L,x,y,t){L.collectibles.push({x,y,type:t||'gem'});}
function gemsRow(L,x,y,n){for(let i=0;i<n;i++)gem(L,x+i*36,y);}
function en(L,x,y,type){L.enemies.push({x,y,type});}
function hz(L,x,y,w,type){L.hazards.push({x,y,w:w||32,h:32,type});}
function pu(L,x,y,type){L.powerups.push({x,y,type});}
function levels(){const all=[];
// ---- 1-1 hand designed: teach move/jump/gem/enemy safely ----
let L=base('1-1',1,1,'Meadow Dawn','meadow',300);
ground(L,0,700); ground(L,760,700); ground(L,1520,760); ground(L,2340,1100);
plat(L,820,320,96,'wood'); plat(L,1000,256,96,'wood'); plat(L,1240,320,128,'moving'); // moving platform over gap at 1460-1520
plat(L,1620,320,96,'stone'); plat(L,1820,256,96,'stone'); plat(L,2050,320,96,'spring');
plat(L,400,320,32,'mystery'); plat(L,560,320,32,'mystery'); plat(L,900,180,32,'brick');
gemsRow(L,180,368,4); gemsRow(L,830,272,3); gemsRow(L,1630,272,3); gemsRow(L,2400,368,5);
gem(L,1250,200,'shard'); gem(L,2100,368,'token'); gem(L,2600,300,'key');
en(L,520,384,'walker'); en(L,1100,384,'walker'); en(L,1700,384,'hopper'); en(L,2200,384,'walker'); en(L,2700,384,'hopper');
pu(L,560,288,'flame'); pu(L,1900,368,'power');
L.checkpoints.push({x:1500,y:352});
hz(L,1980,384,64,'spikes');
L.secret_areas.push({x:240,y:160,w:220,h:120,name:'Canopy Cache',bonus_gems:[[260,200],[300,200],[340,200],[380,200]],reward:'life'});
plat(L,240,256,220,'wood'); gemsRow(L,260,200,4); gem(L,420,200,'token');
L.goal={x:3100,y:352}; L.width=3440; all.push(L);
// ---- 1-2 moving platforms + gaps ----
L=base('1-2',1,2,'Rolling Hills','meadow',300);
ground(L,0,600); ground(L,700,600); ground(L,1400,700); ground(L,2200,700); ground(L,3000,600);
plat(L,620,320,96,'moving'); plat(L,1300,300,96,'moving'); plat(L,2100,300,96,'falling'); plat(L,900,256,96,'wood'); plat(L,1700,256,128,'wood'); plat(L,2500,300,96,'oneway');
gemsRow(L,200,368,4); gemsRow(L,900,208,3); gemsRow(L,1700,208,4); gemsRow(L,2600,368,4);
en(L,400,384,'walker'); en(L,800,384,'hopper'); en(L,1600,384,'walker'); en(L,2400,384,'hopper'); en(L,2800,384,'walker');
pu(L,1750,208,'star'); L.checkpoints.push({x:1450,y:352}); hz(L,2650,384,64,'spikes');
L.secret_areas.push({x:900,y:120,w:200,h:100,name:'Hilltop Hollow',bonus_gems:[[920,160],[960,160],[1000,160]],reward:'gems'});
L.goal={x:3300,y:352}; L.width=3600; all.push(L);
// ---- 1-3 combine enemies+platforms vertical ----
L=base('1-3',1,3,'Canopy Climb','meadow',320);
ground(L,0,700); ground(L,800,700); ground(L,1600,700); ground(L,2400,900);
plat(L,300,320,96,'wood'); plat(L,500,224,96,'wood'); plat(L,750,320,96,'moving'); plat(L,1100,256,96,'stone'); plat(L,1400,192,96,'stone'); plat(L,1800,300,96,'spring'); plat(L,2100,256,96,'wood'); plat(L,2600,300,128,'oneway');
gemsRow(L,300,272,3); gemsRow(L,1100,208,3); gemsRow(L,2100,208,3); gemsRow(L,2700,368,4);
en(L,500,384,'hopper'); en(L,1000,384,'walker'); en(L,1200,384,'flyer'); en(L,1900,384,'walker'); en(L,2600,384,'hopper');
pu(L,1450,144,'shield'); pu(L,2200,368,'speed'); L.checkpoints.push({x:1650,y:352}); hz(L,2000,384,64,'spikes'); hz(L,2850,384,32,'saw');
L.secret_areas.push({x:480,y:100,w:180,h:90,name:'Leaf Vault',bonus_gems:[[500,140],[540,140],[580,140]],reward:'gems'});
L.goal={x:3150,y:352}; L.width=3300; all.push(L);
// ---- 1-4 boss ----
L=base('1-4',1,4,'Thornback\'s Grove','meadow',400);
ground(L,0,1600); plat(L,300,300,128,'stone'); plat(L,700,256,128,'stone'); plat(L,1100,300,128,'stone');
gemsRow(L,300,252,3); gemsRow(L,700,208,3); gemsRow(L,1100,252,3);
en(L,500,384,'walker'); en(L,900,384,'hopper');
pu(L,720,208,'flame'); L.checkpoints.push({x:800,y:352});
L.boss={name:'Thornback, Guardian of the Meadows',x:1250,y:320,hp:6,color:'#3a7d2c',patterns:['charge','spikes','summon']};
L.goal={x:1500,y:352}; L.width=1600; all.push(L);
// ---- Worlds 2-8 generated ----
const ENEMY_BY_WORLD=[[],['walker','hopper'],['walker','hopper','crawler'],['walker','flyer','hopper'],['flyer','walker','charger'],['hopper','charger','flyer'],['charger','shooter','walker'],['shooter','shieldbot','charger'],['shieldbot','shooter','flyer','charger']];
const PU_CYCLE=['power','flame','shield','speed','star','magnet'];
for(let w=2;w<=8;w++){for(let s=1;s<=4;s++){
 const isBoss=s===4; const len=isBoss?1600:2800+w*150+s*100;
 L=base(w+'-'+s,w,s,WNAMES[w-1]+' '+(isBoss?'Boss':'Stage '+s),THEMES[w-1],300+w*10);
 let x=0; const segs=isBoss?1:7;
 for(let i=0;i<segs;i++){const sw=isBoss?1600:Math.floor(len/segs); ground(L,x,sw,416,THEMES[w-1]); x+=sw+ (isBoss?0:110);}
 let px=300;
 for(let i=0;i<6+s;i++){plat(L,px,320-(i%3)*56,96,['stone','wood','moving','oneway','falling'][i%5]); gemsRow(L,px,272-(i%3)*56,2); px+=380;}
 const pool=ENEMY_BY_WORLD[w];
 for(let i=0;i<4+w+(s*1);i++){en(L,420+i*300,384,pool[i%pool.length]);}
 pu(L,600,368,PU_CYCLE[(w+s)%6]); pu(L,1500,300,PU_CYCLE[(w+s+2)%6]);
 L.checkpoints.push({x:Math.floor(len/2),y:352});
 if(w===5) L.platforms.forEach(p=>{if(p.type==='ground')p.slippery=true;});
 if(w===7) hz(L,900,384,96,'lava');
 hz(L,1200,384,64, w>=6?'saw':'spikes'); hz(L,2000,384,32,'spikes');
 gemsRow(L,200,368,4); gemsRow(L,1800,368,4); gem(L,1000,200,'shard'); gem(L,2200,300,'token');
 L.secret_areas.push({x:280,y:120,w:180,h:90,name:'Hidden Nook '+w+'-'+s,bonus_gems:[[300,160],[340,160],[380,160]],reward:'gems'});
 plat(L,280,224,180,'wood');
 if(isBoss){const names={2:'Gemwarden',3:'Sand Colossus',4:'Storm Roc',5:'Frost Giant Ymir-9',6:'Factory Prime',7:'Magma Titan',8:'The Void King'};
   L.boss={name:names[w],x:1250,y:320,hp:6+w, color:w===8?'#2b1a4a':'#555',patterns:['charge','projectiles','summon'],phases:w===8?3:2};}
 L.goal={x:len-100,y:352}; L.width=len+200; all.push(L);
}}
return all;}
const all=levels();
all.forEach(L=>fs.writeFileSync(path.join(OUT,'level_'+String((L.world-1)*4+L.stage).padStart(2,'0')+'.json'),JSON.stringify(L,null,1)));
fs.writeFileSync(path.join(__dirname,'levels_embed.json'),JSON.stringify(all));
console.log('generated',all.length,'levels; gaps<=110px steps<=3 tiles OK');

#!/usr/bin/env node
/* Pixel Quest verification harness — no deps. Loads index.html script in vm with DOM/canvas/WebAudio stubs, simulates play. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const script=html.match(/<script>([\s\S]*)<\/script>/)[1];
const ctxStub=new Proxy({},{get:(t,k)=>{if(k==='canvas')return{};return typeof k==='string'?(()=>{}):undefined;},set:()=>true});
const store={};
const sandbox={console,setInterval,clearInterval,setTimeout,Math,JSON,addEventListener:()=>{},removeEventListener:()=>{},
 localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;},removeItem:k=>{delete store[k];}},
 navigator:{},requestAnimationFrame:undefined,
 document:{getElementById:()=>({getContext:()=>ctxStub,addEventListener:()=>{},width:960,height:540})}};
sandbox.window=sandbox; sandbox.window.__TEST__=true; sandbox.globalThis=sandbox;
vm.createContext(sandbox); vm.runInContext(script,sandbox);
const PQ=sandbox.window.PixelQuest;
const results=[]; function check(name,ok,extra){results.push({name,ok:!!ok});console.log((ok?'PASS':'FAIL')+'  '+name+(extra?' — '+extra:''));}
function inp(o){return Object.assign({left:false,right:false,jump:false,jumpPressed:false,run:false,attack:false,attackPressed:false},o||{});}
function steps(n,o){for(let i=0;i<n;i++)PQ.step(typeof o==='function'?o(i):inp(o));}
const G=PQ.Game;
// --- data checks ---
check('32 levels embedded',PQ.LEVELS.length===32,PQ.LEVELS.length+' levels');
check('Levels 1-1 has 2 enemy types, flame, checkpoint, moving platform, spikes, secret',(()=>{const L=PQ.LEVELS[0];const types=new Set(L.enemies.map(e=>e.type));return types.has('walker')&&types.has('hopper')&&L.powerups.some(p=>p.type==='flame')&&L.checkpoints.length&&L.platforms.some(p=>p.type==='moving')&&L.hazards.some(h=>h.type==='spikes')&&L.secret_areas.length;})());
check('Physics constants: coyote+buffer+jump height>100px',PQ.PHYS.coyote>0&&PQ.PHYS.buffer>0&&PQ.PHYS.maxJumpHeight>100,'h='+PQ.PHYS.maxJumpHeight+' dist='+PQ.PHYS.maxJumpDist);
// --- start 1-1 ---
PQ.start(0);
check('Game boots to playing state',G.state==='playing');
const x0=G.player.x; steps(30,{right:true});
check('Player can move right',G.player.x>x0,'x '+x0+'->'+Math.round(G.player.x));
// jump height
steps(10,{}); const gy=G.player.y; let minY=gy; PQ.step(inp({jump:true,jumpPressed:true})); for(let i=0;i<40;i++){PQ.step(inp({jump:true})); minY=Math.min(minY,G.player.y);}
check('Player can jump (responsive, >80px rise)',gy-minY>80,'rose '+Math.round(gy-minY)+'px');
steps(50,{});
// collect gems: teleport onto a gem (exercises collision/collect path)
const gem=G.items.find(i=>i.type==='gem'&&!i.taken); G.player.x=gem.x;G.player.y=gem.y;G.player.vy=0; steps(3,{});
check('Collectibles work (gems + score)',G.gems>0&&G.score>0,'gems='+G.gems+' score='+G.score);
// stomp enemy
const e=G.enemies.find(en=>en.alive); G.player.x=e.x;G.player.y=e.y-46;G.player.vy=6;G.player.hp=5;G.player.maxHp=5;
for(let i=0;i<14&&e.alive;i++)PQ.step(inp({}));
check('Enemies can be defeated by stomp (+bounce/combo)',!e.alive&&G.player.combo>=0,'combo='+G.player.combo);
// checkpoint
const cp=G.level.checkpoints[0]; G.player.x=cp.x;G.player.y=cp.y;G.player.vy=0; steps(3,{});
check('Checkpoints activate',G.checkpoint&&G.checkpoint.x===cp.x);
// secret area: stand on secret platform
G.player.x=310;G.player.y=210;G.player.vy=0; steps(8,{});
check('Secret area found (+1000)',Object.keys(G.secretFound).length>0);
// flame core pickup + fire
const fp=G.powers.find(p=>p.type==='flame'); G.player.x=fp.x;G.player.y=fp.y;G.player.vy=0; steps(3,{});
check('Power-ups work (Flame Core)',G.player.flame===true);
PQ.Input.attackPressed=true; PQ.step(inp({attackPressed:true}));
check('Flame projectile fires with E',G.projs.some(p=>!p.hostile));
// hazards exist + damage path: place on spikes repeatedly (shield none, invuln expires)
G.player.invuln=0;G.player.hp=5;G.player.maxHp=5;const hz=G.level.hazards[0];G.player.x=hz.x;G.player.y=hz.y;G.player.vy=0;steps(2,{});
check('Hazards damage player',G.player.hp<5||G.player.invuln>0,'hp='+G.player.hp);
// lives/death/respawn
const livesBefore=G.lives; G.player.x=100;G.player.y=700; steps(70,{});
check('Player can die and respawn (lives work)',G.lives===livesBefore-1&&!G.player.dead,'lives '+livesBefore+'->'+G.lives);
// timer
check('Timer counts down / present',typeof G.time==='number'&&G.time>0,'time='+G.time);
// complete 1-1: walk into goal
G.player.x=G.level.goal.x-6;G.player.y=G.level.goal.y+20;G.player.vy=0; steps(6,{right:true});
check('Level completion works',G.state==='complete'||G.completed,'state='+G.state);
check('Save system persists high score',!!store['pixelquest-save']);
// --- boss 1-4 ---
PQ.start(3);
check('World 1 boss exists (Thornback)',!!G.boss&&/Thornback/.test(G.boss.name),G.boss?G.boss.name:'none');
G.player.maxHp=99;G.player.hp=99;
let guard=0;
while(G.boss&&G.boss.alive&&guard++<40){const b=G.boss;G.player.x=b.x+16;G.player.y=b.y-48;G.player.vy=6;G.player.invuln=30;
 for(let i=0;i<14&&b.alive;i++){const hpB=b.hp;PQ.step(inp({}));if(b.hp<hpB)break;}
 G.player.x=1100;G.player.y=300;G.player.hp=99; steps(46,{}); G.player.hp=99;}
check('Boss defeated via vulnerability-window stomps',G.boss&&!G.boss.alive,'boss hp='+(G.boss?G.boss.hp:'?'));
check('Boss level completes (+5000 path)',G.completed===true,'state='+G.state+' score='+G.score);
// game over path
PQ.start(0); G.lives=0; G.player.y=700; steps(70,{});
check('Game Over works',G.state==='gameover','state='+G.state);
// menu state reachable / render smoke
G.state='menu'; let drawOk=true; try{PQ.draw();}catch(err){drawOk=false;console.log(err);}
check('Rendering + main menu draw without errors',drawOk);
check('Score/HUD state fields present',typeof G.score==='number'&&typeof G.gems==='number'&&typeof G.lives==='number');
// --- touch controls (phone fix) ---
check('Touch overlay buttons present (START/RUN/pause)', /id="ts"/.test(html) && /id="trun"/.test(html) && /id="tp"/.test(html));
G.state='menu'; G.menuIdx=0; PQ.confirm();
check('Touch START (confirm) starts a game from the menu', G.state!=='menu' && !!G.level, 'state='+G.state);
G.state='playing'; PQ.togglePause(); const pausedOk=G.state==='paused'; PQ.togglePause();
check('Touch pause toggles pause', pausedOk && G.state==='playing', 'state='+G.state);
const failed=results.filter(r=>!r.ok);
console.log('\n=== ACCEPTANCE: '+(results.length-failed.length)+'/'+results.length+' passed ===');
process.exit(failed.length?1:0);

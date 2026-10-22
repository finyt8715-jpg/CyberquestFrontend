'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/phish-maze.js'),'utf8');
function model(){const c=vm.createContext({});vm.runInContext(source,c);return c}
function step(c,r){return [...c.advancePhishMaze(r,.1),...c.advancePhishMaze(r,.1)]}

test('maze is rectangular, enclosed and every pickup and gate is reachable',()=>{
 const c=model(),map=vm.runInContext('PHISH_MAZE_MAP',c),dist=c.mazeDistances(1,1);
 map.forEach((row,y)=>{assert.equal(row.length,15);[...row].forEach((cell,x)=>{if(y===0||y===14||x===0||x===14)assert.equal(cell,'#');if(cell!=='#')assert.ok(dist.has(c.mazeKey(x,y)),`${x},${y} must be reachable`)})});
 assert.equal(map.join('').match(/[123]/g).length,3);assert.equal(map.join('').match(/E/g).length,1);
});
test('movement respects walls and buffers turns until an intersection',()=>{
 const c=model(),r=c.newPhishMaze();c.steerPhishMaze(r,'up');step(c,r);assert.equal(r.y,1);assert.equal(r.x,2);
 r.x=3;r.y=1;r.playerTick=0;r.dir='right';c.steerPhishMaze(r,'down');step(c,r);assert.equal(r.x,4);assert.equal(r.y,1);step(c,r);assert.equal(r.x,4);assert.equal(r.y,2);
 c.steerPhishMaze(r,'invalid');assert.equal(r.wanted,'down');
});
test('all three real checks unlock the exit; data bits and checks score once',()=>{
 const c=model(),r=c.newPhishMaze();r.bots.forEach(b=>b.sleep=999);
 r.x=13;r.y=7;step(c,r);assert.equal(r.complete,false);
 for(const [x,y] of [[11,1],[1,7],[4,13]]){r.x=x;r.y=y;step(c,r)}
 assert.ok(r.verified.every(Boolean));assert.equal(r.score,180);step(c,r);assert.equal(r.score,180);
 r.x=2;r.y=1;step(c,r);assert.equal(r.bytes,1);step(c,r);assert.equal(r.bytes,1);
 r.x=13;r.y=7;assert.ok(step(c,r).some(e=>e.type==='complete'));assert.equal(r.complete,true);
 const elapsed=r.elapsed;step(c,r);assert.equal(r.elapsed,elapsed);
});
test('shield quarantines bots, expires, and hits preserve earned verification',()=>{
 const c=model(),r=c.newPhishMaze();r.bots.forEach(b=>b.sleep=999);r.x=1;r.y=3;step(c,r);assert.ok(r.shield>6);
 const bot=r.bots[0];bot.x=1;bot.y=3;bot.sleep=0;step(c,r);assert.equal(r.tags,1);assert.equal(r.hearts,3);assert.ok(bot.sleep>4);
 r.shield=.01;r.invulnerable=0;r.verified[0]=true;bot.x=r.x;bot.y=r.y;bot.sleep=0;step(c,r);assert.equal(r.hearts,2);assert.equal(r.x,1);assert.equal(r.y,1);assert.equal(r.verified[0],true);
 for(let i=0;i<2;i++){r.invulnerable=0;bot.x=r.x;bot.y=r.y;bot.sleep=0;step(c,r)}
 assert.equal(r.failed,true);const elapsed=r.elapsed;step(c,r);assert.equal(r.elapsed,elapsed);assert.equal(c.newPhishMaze().hearts,3);
});
test('scam bot follows a walkable route toward the player',()=>{
 const c=model(),r=c.newPhishMaze();const bot=r.bots[0];bot.sleep=0;r.bots.slice(1).forEach(b=>b.sleep=999);const distances=c.mazeDistances(r.x,r.y),before=distances.get(c.mazeKey(bot.x,bot.y));r.botTick=.42;c.advancePhishMaze(r,.02);assert.ok(c.mazeOpen(bot.x,bot.y));assert.ok(distances.get(c.mazeKey(bot.x,bot.y))<before);
});

test('arcade movement interpolates along corridors and turns without cutting through walls',()=>{
 const c=model(),r=c.newPhishMaze();r.bots.forEach(b=>b.sleep=999);
 r.x=3;r.y=1;c.steerPhishMaze(r,'down');
 c.advancePhishMaze(r,.1);c.advancePhishMaze(r,.08);
 let p=c.mazePosition(r,r.elapsed);assert.equal(p.x,3);assert.equal(p.y,1);
 c.advancePhishMaze(r,.09);p=c.mazePosition(r,r.elapsed);assert.ok(Math.abs(p.x-3.5)<1e-8);assert.equal(p.y,1);
 c.advancePhishMaze(r,.09);p=c.mazePosition(r,r.elapsed);assert.equal(p.x,4);assert.equal(p.y,1);
 c.advancePhishMaze(r,.09);p=c.mazePosition(r,r.elapsed);assert.equal(p.x,4);assert.ok(Math.abs(p.y-1.5)<1e-8);
 const bot=r.bots[0];c.mazeMove(bot,8,3,r.elapsed,.43);
 assert.equal(c.mazePosition(bot,r.elapsed+.215).x,7.5);
 assert.equal(c.mazePosition(bot,r.elapsed+1).x,8);
});

test('movement speed and visual position agree at 30, 60 and 120 frames per second',()=>{
 const results=[30,60,120].map(fps=>{
  const c=model(),r=c.newPhishMaze();r.bots.forEach(b=>b.sleep=999);c.steerPhishMaze(r,'right');
  for(let i=0;i<fps*.6;i++)c.advancePhishMaze(r,1/fps);
  return {x:r.x,bytes:r.bytes,visualX:c.mazePosition(r,r.elapsed).x};
 });
 results.forEach(r=>{assert.equal(r.x,4);assert.equal(r.bytes,3);assert.ok(Math.abs(r.visualX-10/3)<1e-8)});
});

test('hits and shield tags snap to spawn instead of animating through the maze',()=>{
 const c=model(),r=c.newPhishMaze(),bot=r.bots[0];r.invulnerable=0;
 c.mazeMove(r,4,3,0,.18);c.mazeMove(bot,4,3,0,.43);bot.sleep=0;
 c.advancePhishMaze(r,.01);assert.equal(r.motion,null);assert.equal(bot.motion,null);
 assert.equal(c.mazePosition(r,r.elapsed).x,1);assert.equal(c.mazePosition(r,r.elapsed).y,1);
 r.shield=7;c.mazeMove(bot,1,1,r.elapsed,.43);bot.sleep=0;
 c.advancePhishMaze(r,.01);assert.equal(r.tags,1);assert.equal(bot.motion,null);assert.equal(c.mazePosition(bot,r.elapsed).x,bot.homeX);
});

function mount(){
 let time=1000,next=0,finished=0;const frames=new Map(),events={},awards=[];
 const gfx=new Proxy({},{get:()=>()=>{}}),canvas={tagName:'CANVAS',getContext:()=>gfx,getBoundingClientRect:()=>({width:390}),focus(){},setPointerCapture(){}};
 const nodes=new Map(),node=s=>{if(!nodes.has(s))nodes.set(s,{classList:{toggle(){}},querySelector:()=>({textContent:''})});return nodes.get(s)};
 const el={innerHTML:'',isConnected:true,querySelector:s=>s==='canvas'?canvas:node(s)};
 const c=vm.createContext({el,performance:{now:()=>time},window:{devicePixelRatio:1,addEventListener:(n,fn)=>events[n]=fn,removeEventListener:n=>delete events[n]},document:{hidden:false,addEventListener:(n,fn)=>events[n]=fn,removeEventListener:n=>delete events[n]},requestAnimationFrame:fn=>{frames.set(++next,fn);return next},cancelAnimationFrame:id=>frames.delete(id),dailyActive:true,dailyLast:0,SFX:{ok(){},bad(){}},ctx:{add:n=>awards.push(n)},finish:()=>finished++});
 vm.runInContext(source+'\nconst advanceOriginal=advancePhishMaze;let observed;advancePhishMaze=(run,dt)=>{observed=run;return advanceOriginal(run,dt)};phishMaze(el,ctx,finish)',c);
 return {el,c,events,frames,awards,canvas,finished:()=>finished,run:()=>vm.runInContext('observed',c),click:(s,dataset={})=>el.onclick?.({target:{closest:x=>s===x?{dataset}:null}}),frame:()=>{time+=60;const list=[...frames.values()];frames.clear();list.forEach(fn=>fn(time))}};
}
test('maze supports touch/keyboard, pause, hidden tabs, retry and one completion award',()=>{
 const t=mount();assert.equal(t.c.dailyActive,false);t.click('[data-maze-start]');t.frame();assert.equal(t.c.dailyActive,true);
 t.el.onkeydown({key:'ArrowDown',preventDefault(){}});assert.equal(t.run().wanted,'down');
 t.el.onpointerdown({target:t.canvas,clientX:100,clientY:100,pointerId:1});t.el.onpointerup({clientX:50,clientY:100});assert.equal(t.run().wanted,'left');
 t.click('[data-maze-dir]',{mazeDir:'right'});assert.equal(t.run().wanted,'right');
 t.click('[data-maze-pause]');assert.equal(t.frames.size,0);assert.equal(t.c.dailyActive,false);t.click('[data-maze-start]');
 t.c.document.hidden=true;t.events.visibilitychange();assert.equal(t.frames.size,0);t.c.document.hidden=false;t.click('[data-maze-start]');
 let r=t.run();r.hearts=1;r.invulnerable=0;r.moving=false;r.playerTick=.17;r.bots[0].x=r.x;r.bots[0].y=r.y;r.bots[0].sleep=0;t.frame();assert.match(t.el.innerHTML,/RETRY THE MAZE/);assert.equal(t.awards.length,0);
 t.click('[data-maze-next]');t.click('[data-maze-start]');t.frame();r=t.run();assert.equal(r.hearts,3);r.verified=[true,true,true];r.x=13;r.y=7;r.playerTick=.17;r.bots.forEach(b=>b.sleep=999);t.frame();
 assert.match(t.el.innerHTML,/Two gates/);assert.equal(t.awards.length,1);assert.equal(t.c.dailyActive,false);t.click('[data-maze-next]');t.click('[data-maze-next]');assert.equal(t.finished(),1);assert.equal(t.frames.size,0);assert.equal(t.c.dailyActive,true);assert.deepEqual(Object.keys(t.events),[]);
});
test('leaving the maze stops its frame loop and does not award completion',()=>{
 const t=mount();t.click('[data-maze-start]');t.frame();t.el.isConnected=false;t.frame();assert.equal(t.frames.size,0);assert.equal(t.awards.length,0);assert.equal(t.finished(),0);assert.equal(t.el.onclick,null);
});

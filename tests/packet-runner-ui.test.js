'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/packet-runner.js'),'utf8');

function mount(){
 let time=1000,next=0,finished=0;const frames=new Map(),events={},awards=[];
 const gfx=new Proxy({measureText:t=>({width:t.length*7}),createLinearGradient:()=>({addColorStop(){}})},{get:(target,key)=>target[key]||(()=>{})});
 const canvas={tagName:'CANVAS',getContext:()=>gfx,getBoundingClientRect:()=>({width:390,height:500,left:0}),focus(){},setPointerCapture(){}};
 const nodes=new Map();
 const node=selector=>{if(!nodes.has(selector))nodes.set(selector,{style:{},classList:{toggle(){}},querySelector:()=>({textContent:''})});return nodes.get(selector)};
 const el={innerHTML:'',isConnected:true,querySelector:selector=>selector==='canvas'?canvas:node(selector)};
 const context=vm.createContext({el,performance:{now:()=>time},window:{devicePixelRatio:1,addEventListener:(name,fn)=>events[name]=fn,removeEventListener:name=>delete events[name]},document:{hidden:false,addEventListener:(name,fn)=>events[name]=fn,removeEventListener:name=>delete events[name]},requestAnimationFrame:fn=>{frames.set(++next,fn);return next},cancelAnimationFrame:id=>frames.delete(id),dailyActive:true,dailyLast:0,SFX:{ok(){},bad(){}},ctx:{add:n=>awards.push(n)},finish:()=>finished++});
 vm.runInContext(source+'\nconst originalAdvance=advancePacketRun;let observedRun;advancePacketRun=(run,dt)=>{observedRun=run;return originalAdvance(run,dt)};packetRescue(el,ctx,finish)',context);
 const click=selector=>el.onclick?.({target:{closest:s=>s===selector?{dataset:{}}:null}});
 const frame=()=>{time+=60;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(time))};
 return {el,canvas,context,frames,events,awards,click,frame,finished:()=>finished,run:()=>vm.runInContext('observedRun',context)};
}

test('runner controls survive pause, retry and the single gate transition',()=>{
 const t=mount();assert.equal(t.context.dailyActive,false);assert.equal(t.frames.size,0);
 t.click('[data-runner-start]');t.frame();assert.equal(t.context.dailyActive,true);
 t.el.onkeydown({key:'ArrowUp',target:t.canvas,preventDefault(){}});assert.ok(t.run().jumpTime>0);
 t.el.onpointerdown({target:t.canvas,clientX:200,clientY:100,pointerId:1});t.el.onpointerup({clientX:100,clientY:100});assert.equal(t.run().lane,0);
 t.run().jumpTime=0;t.el.onpointerdown({target:t.canvas,clientX:100,clientY:200,pointerId:2});t.el.onpointerup({clientX:100,clientY:100});assert.ok(t.run().jumpTime>0);
 t.run().jumpTime=0;t.run().jumpHeight=0;t.el.onkeydown({key:'ArrowDown',target:t.canvas,preventDefault(){}});assert.ok(t.run().slideTime>0);
 t.run().slideTime=0;t.el.onpointerdown({target:t.canvas,clientX:100,clientY:100,pointerId:3});t.el.onpointerup({clientX:100,clientY:200});assert.ok(t.run().slideTime>0);
 t.click('[data-runner-pause]');assert.equal(t.frames.size,0);assert.equal(t.context.dailyActive,false);
 t.click('[data-runner-start]');assert.equal(t.frames.size,1);
 t.context.document.hidden=true;t.events.visibilitychange();assert.equal(t.frames.size,0);assert.equal(t.context.dailyActive,false);
 t.context.document.hidden=false;t.events.visibilitychange();assert.equal(t.frames.size,0);t.click('[data-runner-start]');
 const failed=t.run();failed.shield=1;failed.invulnerable=0;failed.entities=[{kind:'wall',lane:failed.lane,y:.82,label:'FAKE PORTAL'}];t.frame();
 assert.match(t.el.innerHTML,/RETRY THIS RESCUE/);assert.equal(t.awards.length,0);
 t.click('[data-runner-next]');t.click('[data-runner-start]');t.frame();assert.equal(t.run().index,0);assert.equal(t.run().shield,3);
 for(let i=0;i<1;i++){
  const run=t.run();assert.equal(run.index,i);run.elapsed=70;run.verified=[true,true,true];run.gate=true;run.entities=[{kind:'gate',lane:-1,y:.82}];t.frame();
  assert.equal(t.awards.length,i+1);assert.equal(t.frames.size,0);assert.equal(t.context.dailyActive,false);
  assert.match(t.el.innerHTML,/ENTER THE PHISH MAZE/);t.click('[data-runner-next]');
 }
 assert.equal(t.finished(),1);assert.equal(t.context.dailyActive,true);assert.equal(t.el.onkeydown,null);
});

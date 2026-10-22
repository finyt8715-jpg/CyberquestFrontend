'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/cyberquest.html'),'utf8');
const arcade=fs.readFileSync(path.join(__dirname,'../src/phish-arcade.js'),'utf8');
const runner=fs.readFileSync(path.join(__dirname,'../src/packet-runner.js'),'utf8');
const decisions=['report','keep','report','report','keep','keep','report','report'];
function mount(){
 const el={innerHTML:'',isConnected:true,querySelector:()=>({focus(){}}),scrollIntoView(){}};
 const awards=[],timers=new Map();let inbox=0,timerId=0,runnerFinish,runnerStarts=0,mazeFinish,mazeStarts=0;
 const sandbox=vm.createContext({el,ctx:{add:n=>awards.push(n)},SFX:{ok(){},bad(){}},phish(){inbox++},packetRescue(_el,_ctx,finish){runnerStarts++;runnerFinish=finish},phishMaze(_el,_ctx,finish){mazeStarts++;mazeFinish=finish},setTimeout:fn=>{timers.set(++timerId,fn);return timerId},clearTimeout:id=>timers.delete(id)});
 vm.runInContext(arcade,sandbox);vm.runInContext('phishCampaign(el,ctx)',sandbox);
 const click=(selector,dataset={})=>el.onclick?.({target:{closest:s=>s===selector?{dataset}:null}});
 const flush=()=>{const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn())};
 return {el,awards,click,flush,timers,sandbox,inbox:()=>inbox,runnerStarts:()=>runnerStarts,finishRunner:()=>runnerFinish?.(),mazeStarts:()=>mazeStarts,finishMaze:()=>mazeFinish?.()};
}
function clearClues(t){for(const clue of ['domain','code','urgent'])t.click('[data-clue]',{clue});t.click('[data-game-next]')}
test('Level 2 starts with games and retains all six questions in the final quiz',()=>{
 const t=mount();assert.match(t.el.innerHTML,/LET’S PLAY/);assert.doesNotMatch(t.el.innerHTML,/data-attack-choice/);
 const sandbox=vm.createContext({SERVER:false});vm.runInContext(source.slice(source.indexOf('const S={'),source.indexOf('function hdr(){')),sandbox);
 assert.equal(vm.runInContext('S.assign[2]',sandbox),'phish');assert.equal(vm.runInContext('S.assign[3]',sandbox),'shoot');
 assert.equal(vm.runInContext('LV[1].q.length',sandbox),6);assert.match(vm.runInContext('LV[1].q[0][0]',sandbox),/mailbox closes/);
});

test('runner then maze must both finish before the inbox opens',()=>{
 const t=mount();t.click('[data-arcade-start]');t.click('[data-game-next]');assert.match(t.el.innerHTML,/Something feels off/);
 t.click('[data-clue]',{clue:'logo'});t.click('[data-clue]',{clue:'logo'});assert.deepEqual(t.awards,[-10]);
 for(const clue of ['domain','code','urgent']){t.click('[data-clue]',{clue});t.click('[data-clue]',{clue})}
 assert.deepEqual(t.awards,[-10,50,50,50]);assert.match(t.el.innerHTML,/SITE QUARANTINED/);
 t.click('[data-game-next]');t.click('[data-game-next]');assert.match(t.el.innerHTML,/Parcel desk/);
 for(const message of decisions){const count=t.awards.length;t.click('[data-message]',{message});t.click('[data-message]',{message});assert.equal(t.awards.length,count+1);t.flush()}
 assert.match(t.el.innerHTML,/Inbox defended/);t.click('[data-game-next]');assert.equal(t.runnerStarts(),1);assert.equal(t.inbox(),0);
 t.click('[data-game-next]');assert.equal(t.runnerStarts(),1);
 t.finishRunner();assert.equal(t.mazeStarts(),1);assert.equal(t.inbox(),0);t.finishMaze();assert.equal(t.inbox(),1);assert.equal(t.el.onkeydown,null);assert.equal(t.el.onpointermove,null);assert.equal(t.timers.size,0);
});

test('patrol supports dragging, keyboard, automatic dealing and review pace',()=>{
 const t=mount();t.click('[data-arcade-start]');clearClues(t);
 const card={style:{}},target={closest:s=>s==='[data-swipe-card]'?card:null};
 t.el.onpointerdown({target,clientX:20,clientY:30});t.el.onpointermove({clientX:120});assert.match(card.style.transform,/translateX\(100px\)/);t.el.onpointerup({clientX:130,clientY:35});
 assert.equal(t.awards.at(-1),-10);assert.match(t.el.innerHTML,/MISSED SIGNAL/);assert.match(t.el.innerHTML,/Delivery payments/);assert.equal(t.timers.size,1);
 const count=t.awards.length;t.el.onkeydown({target,key:'ArrowRight',preventDefault(){}});assert.equal(t.awards.length,count);
 t.click('[data-pace]');assert.equal(t.timers.size,0);t.flush();assert.match(t.el.innerHTML,/Parcel desk/);
 t.click('[data-message-next]');t.el.onkeydown({target,key:'ArrowRight',preventDefault(){}});assert.equal(t.awards.at(-1),50);assert.equal(t.timers.size,0);
 t.click('[data-pace]');assert.equal(t.timers.size,1);t.flush();assert.match(t.el.innerHTML,/Project lead/);
});

test('leaving the stage cancels automatic progression without touching a new view',()=>{
 const t=mount();t.click('[data-arcade-start]');clearClues(t);t.click('[data-message]',{message:'report'});
 t.el.isConnected=false;const html=t.el.innerHTML,count=t.awards.length;t.flush();assert.equal(t.el.innerHTML,html);assert.equal(t.awards.length,count);assert.equal(t.inbox(),0);
});

test('Packet Rescue steering, pickups and gate conditions work for the single runner gate',()=>{
 const sandbox=vm.createContext({});vm.runInContext(runner,sandbox);
 for(let index=0;index<1;index++){
  const run=sandbox.newPacketRun(index);assert.equal(run.lane,1);assert.equal(run.shield,3);assert.equal(run.verified.filter(Boolean).length,0);
  sandbox.steerPacket(run,0);assert.equal(run.lane,0);sandbox.steerPacket(run,3);assert.equal(run.lane,0);sandbox.steerPacket(run,2);assert.equal(run.lane,2);
  run.entities=[{kind:'check',index:0,lane:2,y:.82,label:'KNOWN CALLBACK'}];
  assert.equal(sandbox.advancePacketRun(run,.1)[0].type,'check');assert.equal(run.verified[0],true);
  run.entities=[{kind:'trap',index:0,lane:2,y:.82,label:'CLICK TO VERIFY'}];
  assert.equal(sandbox.advancePacketRun(run,.1)[0].type,'hit');assert.equal(run.verified.filter(Boolean).length,1);assert.equal(run.shield,2);
  run.entities=[];run.elapsed=59.95+index*5;sandbox.advancePacketRun(run,.1);assert.equal(run.gate,false);
  run.verified=[true,true,true];sandbox.advancePacketRun(run,.1);assert.equal(run.gate,true);
  run.entities=[{kind:'gate',lane:-1,y:.82,label:'VERIFIED GATE'}];assert.equal(sandbox.advancePacketRun(run,.1)[0].type,'complete');assert.equal(run.complete,true);
 }
});

test('runner cycles through scam themes and keeps offering missing verification',()=>{
 const sandbox=vm.createContext({});vm.runInContext(runner,sandbox);
 const run=sandbox.newPacketRun(0);for(let i=0;i<30;i++)sandbox.spawnPacketWave(run);
 assert.equal(run.entities.filter(o=>o.kind==='check').length,8);
 assert.equal(new Set(run.entities.filter(o=>o.kind==='check').map(o=>o.lane)).size,3);
 assert.equal(new Set(run.entities.filter(o=>o.kind==='bot').map(o=>o.label)).size,5);
 assert.equal(new Set(run.entities.filter(o=>o.kind==='trap').map(o=>o.label)).size,3);
 assert.ok(run.entities.some(o=>o.kind==='byte'&&o.high));
 assert.ok(run.entities.some(o=>o.kind==='wall'));
});

test('jump clears low hazards, lands again and cannot be held for unlimited flight',()=>{
 const sandbox=vm.createContext({});vm.runInContext(runner,sandbox);const run=sandbox.newPacketRun(0);
 assert.equal(sandbox.jumpPacket(run),true);assert.equal(sandbox.jumpPacket(run),false);
 for(let i=0;i<3;i++)sandbox.advancePacketRun(run,.1);
 assert.ok(run.jumpHeight>.5);
 run.entities=[{kind:'barrier',lane:1,y:.82,label:'URGENCY'}];
 assert.equal(sandbox.advancePacketRun(run,.1)[0].type,'jump');assert.equal(run.shield,3);assert.equal(run.cleared,1);
 for(let i=0;i<7;i++)sandbox.advancePacketRun(run,.1);
 assert.equal(run.jumpHeight,0);assert.equal(sandbox.jumpPacket(run),true);
});

test('jumping cannot bypass a train or turn bait into verification',()=>{
 const sandbox=vm.createContext({});vm.runInContext(runner,sandbox);
 for(const kind of ['wall','trap']){
  const run=sandbox.newPacketRun(0);run.jumpTime=.3;run.entities=[{kind,lane:1,y:.82,label:'BAIT'}];
  const events=sandbox.advancePacketRun(run,.1);assert.equal(events[0].type,'hit');assert.equal(run.shield,2);assert.equal(run.verified.filter(Boolean).length,0);
 }
});

test('long trains still collide when entering beside them after the nose passes',()=>{
 const sandbox=vm.createContext({});vm.runInContext(runner,sandbox);const run=sandbox.newPacketRun(0);
 const train={kind:'wall',lane:0,y:.82,length:12,label:'SCAM EXPRESS'};run.entities=[train];
 sandbox.advancePacketRun(run,.1);assert.equal(run.shield,3);assert.equal(train.passed,false);assert.notEqual(train.resolved,true);
 sandbox.steerPacket(run,0);const events=sandbox.advancePacketRun(run,.1);
 assert.equal(events[0].type,'hit');assert.equal(run.shield,2);assert.equal(train.hit,true);assert.notEqual(train.resolved,true);
 run.invulnerable=0;sandbox.advancePacketRun(run,.1);assert.equal(run.shield,2,'one train cannot repeatedly remove hearts');
 run.lane=1;while(!train.passed)sandbox.advancePacketRun(run,.1);
 assert.equal(train.resolved,true);assert.ok(run.entities.includes(train),'tail remains available to render after crossing the player');
 sandbox.steerPacket(run,0);run.invulnerable=0;sandbox.advancePacketRun(run,.1);assert.equal(run.shield,2,'the lane opens only once the train tail passes');
});

test('train choreography starts immediately, leaves a clear lane and offers both safe trails and jump bonuses',()=>{
 const sandbox=vm.createContext({});vm.runInContext(runner,sandbox);const run=sandbox.newPacketRun(0);
 for(let wave=0;wave<24;wave++){
  run.entities=[];sandbox.spawnPacketWave(run);
  const hazards=run.entities.filter(o=>['wall','bot','barrier','overhead','trap'].includes(o.kind));
  const clear=[0,1,2].filter(lane=>!hazards.some(o=>o.lane===lane));assert.ok(clear.length>=1);
  assert.ok(run.entities.some(o=>o.kind==='byte'&&!o.high&&clear.includes(o.lane)),'coins must lead down a clear route');
  for(const train of run.entities.filter(o=>o.kind==='wall'))assert.ok(train.length>=10&&train.length<=12);
  if(wave===0)assert.ok(run.entities.some(o=>o.kind==='wall'));
  if(wave%8===2)assert.ok(run.entities.some(o=>o.kind==='byte'&&o.high));
 }
 // At actual running speed even the longest tail clears before the next wave.
 const route=sandbox.newPacketRun(0);route.shield=999;
 for(let frame=0;frame<1000;frame++){
  sandbox.advancePacketRun(route,.1);
  const passing=route.entities.filter(o=>o.kind==='wall'&&o.y>=.83&&!o.passed);
  assert.ok(passing.length<=1,'successive trains must not overlap across all three lanes');
 }
});

test('only collected pickups disappear; missed pickups remain available to render',()=>{
 const sandbox=vm.createContext({});vm.runInContext(runner,sandbox);const run=sandbox.newPacketRun(0);
 const missed={kind:'byte',lane:0,y:.82},taken={kind:'byte',lane:1,y:.82};run.entities=[missed,taken];
 sandbox.advancePacketRun(run,.1);assert.equal(run.bytes,1);assert.equal(missed.passed,true);assert.notEqual(missed.collected,true);assert.equal(taken.collected,true);
});

test('verification earns one shield, then three hits stop the rescue',()=>{
 const sandbox=vm.createContext({});vm.runInContext(runner,sandbox);const run=sandbox.newPacketRun(0);
 for(let i=0;i<3;i++){run.entities=[{kind:'check',index:i,lane:1,y:.82,label:'CHECK'}];sandbox.advancePacketRun(run,.1)}
 assert.equal(run.guard,1);
 run.entities=[{kind:'trap',lane:1,y:.82,label:'BAIT'}];assert.equal(sandbox.advancePacketRun(run,.1)[0].type,'guard');assert.equal(run.shield,3);assert.equal(run.guard,0);
 for(let i=0;i<3;i++){run.invulnerable=0;run.entities=[{kind:'trap',lane:1,y:.82,label:'BAIT'}];sandbox.advancePacketRun(run,.1)}
 assert.equal(run.failed,true);const elapsed=run.elapsed;sandbox.advancePacketRun(run,.1);assert.equal(run.elapsed,elapsed);assert.equal(sandbox.jumpPacket(run),false);
});

test('slide clears overhead scanners but does not protect from trains or low barriers',()=>{
 const sandbox=vm.createContext({});vm.runInContext(runner,sandbox);
 const run=sandbox.newPacketRun(0);assert.equal(sandbox.slidePacket(run),true);assert.equal(sandbox.slidePacket(run),false);assert.equal(sandbox.jumpPacket(run),false);
 run.entities=[{kind:'overhead',lane:1,y:.82,label:'SCANNER'}];assert.equal(sandbox.advancePacketRun(run,.1)[0].type,'slide');assert.equal(run.shield,3);assert.equal(run.cleared,1);
 for(const kind of ['wall','barrier']){run.invulnerable=0;run.entities=[{kind,lane:1,y:.82,label:'OBSTACLE'}];assert.equal(sandbox.advancePacketRun(run,.1)[0].type,'hit')}
 for(let i=0;i<9;i++)sandbox.advancePacketRun(run,.1);assert.equal(run.slideTime,0);assert.equal(sandbox.jumpPacket(run),true);assert.equal(sandbox.slidePacket(run),false);
 const standing=sandbox.newPacketRun(0);standing.entities=[{kind:'overhead',lane:1,y:.82,label:'SCANNER'}];assert.equal(sandbox.advancePacketRun(standing,.1)[0].type,'hit');
});

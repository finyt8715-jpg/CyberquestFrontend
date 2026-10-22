/* Packet Rescue — Byte's three-lane courier run. Physics stays independent of rendering. */
const PACKET_STAGES=[
 {zone:'NEON TRANSIT / PAYMENT DISTRICT',title:'Run the neon network',request:'A “director” wants an urgent payment. Carry it through three real checks.',checks:['KNOWN CALLBACK','SECOND APPROVER','SENDER CHECK'],lesson:'A familiar name is not proof. Call a known finance contact and use the approved payment process.',duration:60,accent:'#65dbfa',sky:'#102c4e',building:'#174666'}

];
const PACKET_BOTS=[['PHISH','MAIL'],['FAKE BOSS','BOSS'],['URGENCY','TIME'],['SMS','SMS'],['QR','QR']];
const PACKET_TRAPS=[['CLICK TO VERIFY','BAIT'],['FREE ACCESS','BAIT'],['QUICK LOGIN','BAIT']];
const PACKET_JUMP_SECONDS=.92;
function newPacketRun(index){return {index,lane:1,visualLane:1,elapsed:0,waveClock:0,waves:0,entities:[],verified:[false,false,false],shield:3,hits:0,invulnerable:0,gate:false,complete:false,failed:false,jumpTime:0,jumpHeight:0,jumps:0,slideTime:0,slides:0,cleared:0,bytes:0,combo:0,bestCombo:0,score:0,guard:0,pulse:0}}
function steerPacket(run,lane){if(!run.complete&&!run.failed&&Number.isInteger(lane)&&lane>=0&&lane<3)run.lane=lane}
function jumpPacket(run){if(run.complete||run.failed||run.jumpTime>0||run.slideTime>0)return false;run.jumpTime=.001;run.jumps++;return true}
function slidePacket(run){if(run.complete||run.failed||run.slideTime>0||run.jumpTime>0)return false;run.slideTime=.85;run.slides++;return true}
function packetCombo(run,points){run.combo++;run.bestCombo=Math.max(run.bestCombo,run.combo);const multiplier=Math.min(4,1+Math.floor(run.combo/6));run.score+=points*multiplier;return multiplier}
function spawnPacketWave(run){
 if(run.gate)return;
 const w=run.waves++,lane=(w+Math.floor(w/4)+run.index)%3,missing=run.verified.findIndex(v=>!v),bot=(w+run.index)%5;
 const add=(kind,lane,index,label,y=-.14,high=false)=>{const entity={kind,lane,index,label,y,high};if(kind==='wall')entity.length=10+w%3;run.entities.push(entity)};
 let free=(lane+2)%3;
 if(w%4===1&&missing>=0){add('check',lane,missing,PACKET_STAGES[run.index].checks[missing]);add('bot',(lane+1)%3,bot,PACKET_BOTS[bot][0])}
 else if(w%4===2){
  const overhead=w%8===6;add(overhead?'overhead':'barrier',lane,0,overhead?'PHISH SCANNER':'URGENCY TRAP');add('wall',(lane+1)%3,0,'PHISH EXPRESS');
  // The low barrier has an optional jump arc. The third lane stays fully clear.
  if(!overhead)for(let i=0;i<3;i++)add('byte',lane,0,'DATA',-.10-i*.07,true);
 }
 else if(w%4===3){const trap=Math.floor(w/4)%3;add('trap',lane,trap,PACKET_TRAPS[trap][0]);add('wall',(lane+1)%3,0,'FAKE LOGIN EXPRESS')}
 else {add('wall',lane,0,'SCAM EXPRESS');if(w>0)add('bot',(lane+1)%3,bot,PACKET_BOTS[bot][0])}
 // Each wave has a clear lane marked by a continuous data trail. Trains are
 // shorter than the distance between waves, so their tails cannot seal it off.
 for(let i=0;i<5;i++)add('byte',free,0,'DATA',-.14-i*.08);
}
function advancePacketRun(run,seconds){
 if(run.complete||run.failed||!Number.isFinite(seconds)||seconds<=0)return [];
 const dt=Math.min(seconds,.12),events=[];
 run.elapsed+=dt;run.waveClock+=dt;run.slideTime=Math.max(0,run.slideTime-dt);run.invulnerable=Math.max(0,run.invulnerable-dt);run.pulse=Math.max(0,run.pulse-dt);
 run.visualLane+=(run.lane-run.visualLane)*(1-Math.exp(-dt*18));
 if(run.jumpTime>0){run.jumpTime+=dt;if(run.jumpTime>=PACKET_JUMP_SECONDS){run.jumpTime=0;run.jumpHeight=0}else run.jumpHeight=Math.sin(Math.PI*run.jumpTime/PACKET_JUMP_SECONDS)}
 if(run.waveClock>=1.9-run.index*.12){run.waveClock=0;spawnPacketWave(run)}
 if(run.elapsed>=PACKET_STAGES[run.index].duration&&run.verified.every(Boolean)&&!run.gate){run.gate=true;run.entities=[{kind:'gate',lane:-1,y:-.12,label:'TRUSTED ROUTE'}];events.push({type:'gate'})}
 const speed=.26+run.index*.025+Math.min(run.elapsed/1200,.04);
 for(const entity of run.entities){
  entity.y+=dt*(entity.kind==='gate'?.38:speed);
  if(entity.kind==='wall'){
   // A train occupies the lane until its tail passes. Changing into its side
   // must collide too; resolving every obstacle at its nose made that possible.
   entity.passed=entity.y>.83+(entity.length||10)/52;
   if(entity.passed){entity.resolved=true;continue}
   if(entity.y<.83||entity.hit||entity.lane!==run.lane||run.invulnerable>0)continue;
   entity.hit=true;
  }else{
   if(entity.resolved||entity.y<.83)continue;
   entity.resolved=true;entity.passed=true;
  }
  if(entity.kind==='gate'){run.complete=true;events.push({type:'complete'});break}
  if(entity.lane!==run.lane)continue;
  if(entity.kind==='check'){
   entity.collected=true;
   if(!run.verified[entity.index]){run.verified[entity.index]=true;run.score+=60;run.shield=Math.min(3,run.shield+1);run.pulse=1;events.push({type:'check',index:entity.index,label:entity.label});if(run.verified.every(Boolean)){run.guard=1;events.push({type:'trust'})}}
  }else if(entity.kind==='byte'){
   if(!entity.high||run.jumpHeight>.48){entity.collected=true;run.bytes++;const multiplier=packetCombo(run,2);events.push({type:'byte',lane:entity.lane,multiplier})}
  }else if(entity.kind==='overhead'&&run.slideTime>0){run.cleared++;const multiplier=packetCombo(run,15);events.push({type:'slide',lane:entity.lane,multiplier})}
  else if((entity.kind==='bot'||entity.kind==='barrier')&&run.jumpHeight>.5){run.cleared++;const multiplier=packetCombo(run,10);events.push({type:'jump',lane:entity.lane,multiplier})}
  else if(run.invulnerable===0){
   run.invulnerable=1.35;run.combo=0;
   if(run.guard){run.guard=0;run.pulse=1;events.push({type:'guard'})}
   else {run.hits++;run.shield--;run.score=Math.max(0,run.score-20);run.failed=run.shield===0;events.push({type:'hit',kind:entity.kind,label:entity.label});if(run.failed){events.push({type:'failed'});break}}
  }
 }
 run.entities=run.entities.filter(o=>o.y<(o.kind==='wall'?.83+(o.length||10)/52+.28:1.16));
 return events;
}

function packetRescue(el,ctx,finish){
 let run=newPacketRun(0),mode='brief',raf=0,last=0,surface,g,width=0,height=0,pointer=null,disposed=false,observer=null,city=null,sceneId=0;
 let particles=[],notice='SWITCH LANES. JUMP THE TRAPS. KEEP YOUR PACKET SAFE.',noticeUntil=0,hudKey='';
 const active=()=>!disposed&&el.isConnected!==false;
 const now=()=>performance.now();
 const clock=on=>{if(typeof dailyActive!=='undefined'){dailyActive=on;dailyLast=Date.now()}};
 const stage=()=>PACKET_STAGES[run.index];
 function halt(){if(raf)cancelAnimationFrame(raf);raf=0;clock(false)}
 function dispose(){halt();sceneId++;city?.dispose();city=null;disposed=true;observer?.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);el.onclick=el.onkeydown=el.onpointerdown=el.onpointerup=el.onpointercancel=null}
 function message(text){notice=text;noticeUntil=now()+2600;const node=el.querySelector('[data-runner-status]');if(node)node.textContent=text}
 function scene(){
  mode='brief';city?.dispose();city=null;const thisScene=++sceneId;
  el.innerHTML=`<section class="attack-lab pr-shell pr-v2 pr-neon" aria-labelledby="pr-title" style="--route-accent:${stage().accent}">
   <div class="pr-topline"><span>TRUSTED ROUTES <i>/</i> PACKET RESCUE</span><span>GATE 01 / 02</span></div>
   <div class="pr-heading"><div><p class="attack-type">${stage().zone}</p><h2 id="pr-title">${stage().title}</h2></div><div class="pr-clock"><b data-runner-clock>${stage().duration}</b><small>SEC TO GATE</small></div></div>
   <div class="pr-checks">${stage().checks.map((c,i)=>`<span data-runner-check="${i}"><b>◇</b>${c}</span>`).join('')}</div>
   <div class="pr-track-wrap"><canvas class="pr-canvas" width="960" height="620" tabindex="0" role="img" aria-label="Byte's three-lane runner. Left and right change lanes. Space or up arrow jumps. Down arrow slides. Swipe sideways to steer, up to jump, down to slide."></canvas>
    <div class="pr-live"><div><span>PACKET INTEGRITY</span><b data-runner-shield>♥ ♥ ♥</b></div><div class="pr-combo"><b data-runner-combo>1×</b><span data-runner-bytes>0 DATA BITS</span></div><button type="button" data-runner-pause aria-label="Pause Packet Rescue">Ⅱ</button></div>
    <div class="pr-distance"><i data-runner-distance></i></div><div class="pr-game-status" data-runner-status role="status">${notice}</div><div class="pr-overlay" data-runner-overlay></div>
   </div>
   <div class="pr-bottom"><div class="pr-direction"><button type="button" data-steer="left" aria-label="Move left">← <span>LEFT</span></button><button type="button" data-runner-jump class="pr-jump" aria-label="Jump">↑ <span>JUMP</span><kbd>SPACE</kbd></button><button type="button" data-steer="right" aria-label="Move right"><span>RIGHT</span> →</button><button type="button" data-runner-slide class="pr-slide" aria-label="Slide">↓ <span>SLIDE</span></button></div><small>← → STEER · ↑ JUMP · ↓ SLIDE<br>ON PHONE: SWIPE OR USE BUTTONS</small></div>
  </section>`;
  surface=el.querySelector('canvas');g=surface.getContext('2d');hudKey='';resize();bind();updateHud();brief();
  loadCity(thisScene);
 }
 async function loadCity(id){
  if(typeof document.createElement!=='function')return;
  try{
   const module=await import('./packet-city.mjs?v=__PACKET_CITY_VERSION__');
   if(!active()||id!==sceneId||mode==='result')return;
   const next=surface.cloneNode(false),view=module.createPacketCity(next);
   const focused=document.activeElement===surface;surface.replaceWith(next);surface=next;city=view;
   surface.addEventListener('webglcontextlost',()=>{if(active()&&city===view&&mode==='running')pause()});
   resize();if(focused)surface.focus({preventScroll:true});
  }catch(error){if(active()&&id===sceneId)console.warn('Packet Rescue is using its canvas renderer.',error)}
 }
 function brief(){
  mode='brief';halt();const overlay=el.querySelector('[data-runner-overlay]');overlay.hidden=false;
  overlay.innerHTML=`<div class="pr-brief"><div class="pr-brief-tag">NEON TRANSIT · GATE 01</div><h3>RUN THE CITY.<br><em>OUTSMART THE SCAM.</em></h3><p>${stage().request}</p><div class="pr-rules"><span><b>↑</b><strong>JUMP</strong><small>Leap over bots & low rails</small></span><span><b>↔</b><strong>DODGE</strong><small>Sidestep scam trains & bait</small></span><span><b>↓</b><strong>SLIDE</strong><small>Duck under overhead scanners</small></span></div><button class="btn attack-next" type="button" data-runner-start>LET’S RUN →</button><small class="pr-brief-note">Collect 3 gold verification shields · Next: Phish Maze</small></div>`;
 }
 function begin(){if(!active()||!['brief','paused'].includes(mode))return;mode='running';el.querySelector('[data-runner-overlay]').hidden=true;last=now();clock(true);surface.focus({preventScroll:true});raf=requestAnimationFrame(tick)}
 function pause(){if(mode!=='running')return;mode='paused';halt();const overlay=el.querySelector('[data-runner-overlay]');overlay.hidden=false;overlay.innerHTML='<div class="pr-brief pr-pause-card"><div class="pr-brief-tag">PACKET ON HOLD</div><h3>Take a breath.</h3><p>Your route is waiting right here.</p><button class="btn attack-next" type="button" data-runner-start>RESUME RUN →</button></div>'}
 function visibility(){if(!active()){dispose();return}if(document.hidden)pause()}
 function resize(){if(!surface||!g||mode==='result')return;const r=surface.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);width=Math.max(1,r.width);height=Math.max(1,r.height);if(city){city.resize(width,height);city.render(run);return}surface.width=Math.round(width*dpr);surface.height=Math.round(height*dpr);g.setTransform(dpr,0,0,dpr,0,0);draw()}
 function project(lane,depth){const d=Math.max(0,depth),p=Math.pow(d/.83,1.65);return {x:width/2+(lane-1)*width*(.055+.235*p),y:height*.17+height*.67*p,s:.17+.83*p}}
 function box(x,y,w,h,r,fill,stroke){g.beginPath();g.roundRect(x,y,w,h,r);if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.strokeStyle=stroke;g.stroke()}}
 function line(points,color,weight=2){g.beginPath();points.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.strokeStyle=color;g.lineWidth=weight;g.stroke()}
 function text(value,x,y,size,color='#fff',weight=700){g.fillStyle=color;g.font=`${weight} ${size}px 'Rajdhani',Arial,sans-serif`;g.textAlign='center';g.fillText(value,x,y)}
 function world(){
  const W=width,H=height,t=run.elapsed,m=stage(),horizon=H*.17;
  const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#061326');sky.addColorStop(.5,m.sky);sky.addColorStop(1,'#07121e');g.fillStyle=sky;g.fillRect(0,0,W,H);
  g.save();g.globalAlpha=.15;g.fillStyle=m.accent;g.beginPath();g.arc(W*.5,horizon,Math.min(W*.24,H*.25),0,Math.PI*2);g.fill();g.restore();
  // Distinct server skylines pass on both sides of the suspended cable.
  for(let side of [-1,1])for(let i=0;i<9;i++){
   const d=((i/9+t*.055)%1),p=d*d,bw=W*(.025+.09*p),bh=H*(.06+.32*p),x=W/2+side*W*(.15+.45*p),y=horizon+H*.85*p;
   g.globalAlpha=.35+.5*d;box(x-bw/2,y-bh,bw,bh,3,m.building);g.fillStyle='#030e20';g.fillRect(x-bw/2+3,y-bh+4,bw*.17,bh-4);
   for(let row=0;row<5;row++){g.fillStyle=row%2?m.accent:'#8eabbf';g.globalAlpha=.15+.45*d;g.fillRect(x-bw*.2,y-bh+bh*(.15+row*.15),bw*.5,Math.max(1,2*p))}
  }g.globalAlpha=1;
  // Network cable lanes use the same projection as collision objects.
  g.beginPath();g.moveTo(W*.40,horizon);g.lineTo(W*.60,horizon);g.lineTo(W*1.04,H);g.lineTo(-W*.04,H);g.closePath();g.fillStyle='#122a3e';g.fill();
  for(let lane=0;lane<3;lane++){const top=project(lane,0),bottom=project(lane,1);g.lineWidth=W*.035;g.strokeStyle='#ffffff04';line([[top.x,top.y],[bottom.x,bottom.y]],'#ffffff04',W*.035)}
  for(const lane of [-.5,.5,1.5,2.5]){const a=project(lane,0),b=project(lane,1.05);line([[a.x,a.y],[b.x,b.y]],lane===-.5||lane===2.5?m.accent:'#82b4c34a',lane===-.5||lane===2.5?3:1)}
  for(let k=0;k<18;k++){const d=(k/18+t*.28)%1,a=project(-.5,d),b=project(2.5,d);line([[a.x,a.y],[b.x,b.y]],'#80c7dc22',1+2*d)}
  const gx=W*.5,gy=horizon-8,gs=Math.min(W*.08,54);g.save();g.shadowBlur=16;g.shadowColor=m.accent;
  for(let i=0;i<3;i++){const a=(i*2*Math.PI/3)-Math.PI*.5;g.beginPath();g.arc(gx,gy,gs,a,a+1.75);g.lineWidth=5;g.strokeStyle=run.verified[i]?'#f6ce82':'#405e74';g.stroke()}g.restore();text('TRUST GATE',gx,gy+4,Math.max(8,gs*.22),'#c8e8f5');
  if(run.gate){g.save();g.globalAlpha=.12+.07*Math.sin(t*8);g.fillStyle='#a1ffd7';g.fillRect(0,0,W,H);g.restore()}
 }
 function item(o){
  const p=project(o.lane,o.y),size=Math.min(90,width*.16)*p.s,x=p.x,y=p.y;
  g.save();g.translate(x,y);g.lineWidth=2;
  if(o.kind==='gate'){
   g.translate(width/2-x,0);g.shadowColor='#8cffc7';g.shadowBlur=28;box(-width*.41,-height*.3*p.s,width*.82,height*.3*p.s,14,'#3df2a41a','#8cffc7');text('ROUTE VERIFIED',0,-height*.17*p.s,Math.max(15,30*p.s),'#defff1');text('DELIVER THE PACKET',0,-height*.11*p.s,Math.max(10,15*p.s),'#8cffc7');g.restore();return
  }
  if(o.kind==='byte'){
   const lift=o.high?size*1.25:0;g.translate(0,-size*.45-lift);g.rotate(run.elapsed*2);g.fillStyle='#c8f8ff';g.shadowColor=stage().accent;g.shadowBlur=12;g.fillRect(-size*.11,-size*.11,size*.22,size*.22);g.strokeStyle=stage().accent;g.strokeRect(-size*.18,-size*.18,size*.36,size*.36);g.restore();return
  }
  g.fillStyle='#0005';g.beginPath();g.ellipse(0,2,size*.58,size*.12,0,0,Math.PI*2);g.fill();
  if(o.kind==='check'){
   const bob=Math.sin(run.elapsed*3+o.index)*size*.06;g.translate(0,-size*.55+bob);g.shadowColor='#f8c971';g.shadowBlur=15;
   g.beginPath();g.moveTo(0,-size*.52);g.lineTo(size*.44,-size*.33);g.lineTo(size*.35,size*.18);g.lineTo(0,size*.46);g.lineTo(-size*.35,size*.18);g.lineTo(-size*.44,-size*.33);g.closePath();g.fillStyle='#cd9844';g.fill();g.strokeStyle='#ffe6aa';g.stroke();text('✓',0,size*.13,size*.58,'#fff8da');g.shadowBlur=0;
  }else if(o.kind==='bot'){
   g.translate(0,-size*.47);const type=o.index%5;g.shadowColor='#f06b80';g.shadowBlur=8;
   box(-size*.44,-size*.4,size*.88,size*.7,size*.14,'#793f59','#f29ca9');box(-size*.36,-size*.32,size*.72,size*.33,size*.07,'#25182e');
   line([[-size*.27,-size*.25],[-size*.08,-size*.17]],'#ffcb9b',3);line([[size*.27,-size*.25],[size*.08,-size*.17]],'#ffcb9b',3);
   g.shadowBlur=0;line([[-size*.15,size*.03],[0,-size*.02],[size*.15,size*.03]],'#ffc8cc',2);
   if(type===0){line([[-size*.37,-size*.44],[0,-size*.65],[size*.37,-size*.44]],'#fbb4c3',3)}
   if(type===1){line([[-size*.3,-size*.43],[-size*.38,-size*.7],[-size*.08,-size*.55],[0,-size*.78],[size*.13,-size*.55],[size*.37,-size*.7],[size*.29,-size*.43]],'#f8c373',3)}
   if(type===2){g.beginPath();g.arc(0,-size*.58,size*.18,0,Math.PI*2);g.strokeStyle='#f4c276';g.stroke();line([[0,-size*.7],[0,-size*.58],[size*.1,-size*.53]],'#f4c276',2)}
   if(type===3){box(-size*.23,-size*.68,size*.46,size*.23,4,'#d49ec0');text('···',0,-size*.48,size*.26,'#482c49')}
   if(type===4){for(let a=0;a<3;a++)for(let b=0;b<3;b++)if((a+b)%2===0)g.fillRect((a-1)*size*.14-size*.05,-size*.72+b*size*.11,size*.1,size*.1)}
   for(let foot of [-1,1]){box(foot*size*.28-size*.14,size*.24,size*.28,size*.16,4,'#3e233a','#bd708f')}
  }else if(o.kind==='barrier'){
   box(-size*.57,-size*.45,size*1.14,size*.32,4,'#d29b51','#ffe1a8');for(let k=-2;k<3;k++)line([[k*size*.22,-size*.43],[k*size*.22+size*.18,-size*.15]],'#6a3c43',5);line([[-size*.5,-size*.18],[-size*.5,0]],'#d7a473',5);line([[size*.5,-size*.18],[size*.5,0]],'#d7a473',5);text('JUMP',0,-size*.57,Math.max(9,size*.2),'#ffe0a8');
  }else if(o.kind==='overhead'){
   box(-size*.55,-size*1.65,size*1.1,size*.8,6,'#271c43','#ff83bf');line([[-size*.56,-size*1.65],[-size*.56,0]],'#87c4d1',4);line([[size*.56,-size*1.65],[size*.56,0]],'#87c4d1',4);text('↓ SLIDE',0,-size*1.2,Math.max(10,size*.22),'#ffb2d3');
  }else if(o.kind==='wall'){
   box(-size*.5,-size*1.55,size,size*1.55,8,'#321b37','#e27ca1');box(-size*.38,-size*1.4,size*.76,size*1.23,5,'#d26b942b','#ff9cbd');text('×',0,-size*.6,size*.7,'#ffb1c7');text('DODGE',0,-size*1.68,Math.max(9,size*.19),'#ffc6d8');
  }else{
   g.translate(0,-size*.62);g.rotate(Math.sin(run.elapsed*2)*.08);g.beginPath();g.moveTo(0,-size*.46);g.lineTo(size*.46,0);g.lineTo(0,size*.46);g.lineTo(-size*.46,0);g.closePath();g.fillStyle='#b8648d';g.fill();g.strokeStyle='#ffd0e1';g.stroke();text('↗',0,size*.13,size*.55,'#fff');
  }
  g.restore();if(o.y>.28){const label=o.label,fs=Math.max(9,Math.min(14,size*.2));g.font=`700 ${fs}px 'Rajdhani',Arial,sans-serif`;const lw=Math.min(width*.29,g.measureText(label).width+14);box(x-lw/2,y+8,lw,19,5,'#071527e8');text(label,x,y+21,fs,o.kind==='check'?'#ffe1a1':'#ffc5d5')}
 }
 function courier(){
  const p=project(run.visualLane,.83),size=Math.min(78,width*.17),lift=run.jumpHeight*size*1.7,t=run.elapsed,bob=run.jumpTime?0:Math.sin(t*17)*size*.035,lean=(run.lane-run.visualLane)*.32;
  g.save();g.translate(p.x,p.y);g.fillStyle='#0007';g.beginPath();g.ellipse(0,7,size*(.43-run.jumpHeight*.13),size*.11,0,0,Math.PI*2);g.fill();
  if(run.guard||run.pulse>0){g.strokeStyle=run.guard?'#f7d086':'#8ff7d0';g.lineWidth=2;g.globalAlpha=.6;g.beginPath();g.ellipse(0,-size*.58-lift,size*.68,size*.91,0,0,Math.PI*2);g.stroke();g.globalAlpha=1}
  g.translate(0,-lift+bob);if(run.slideTime>0)g.scale(1.2,.48);g.rotate(lean);if(run.invulnerable>0)g.globalAlpha=.55+.45*Math.abs(Math.sin(t*19));
  // Backpack = the protected packet. Byte runs on articulated legs, rather than flying.
  box(-size*.33,-size*.96,size*.66,size*.58,size*.13,'#d6a44e','#ffe0a2');
  const stride=run.jumpTime?-.55:Math.sin(t*17)*.65;
  for(let side of [-1,1]){g.save();g.translate(side*size*.17,-size*.35);g.rotate(side*stride);line([[0,0],[side*size*.08,size*.17],[side*size*.04,size*.31]],'#91c7d7',size*.13);box(-size*.12,size*.24,size*.29,size*.13,4,'#e0f4f2','#73bbd4');g.restore()}
  box(-size*.27,-size*.94,size*.54,size*.62,size*.12,'#e7f0e8','#6dafbf');box(-size*.2,-size*.79,size*.4,size*.28,5,'#173b53');text('✓',0,-size*.57,size*.23,'#f2ce84');
  for(let side of [-1,1]){g.save();g.translate(side*size*.3,-size*.81);g.rotate(run.jumpTime?side*-.95:side*-stride*.7);line([[0,0],[side*size*.09,size*.2],[side*size*.03,size*.28]],'#c7dedc',size*.1);box(side*size*.03-size*.07,size*.23,size*.14,size*.14,4,'#edbc6d');g.restore()}
  // Amber scarf and a bright visor give the courier its own identity.
  g.fillStyle='#edb558';g.beginPath();g.moveTo(-size*.21,-size*.98);g.lineTo(-size*.68,-size*.83+Math.sin(t*12)*size*.08);g.lineTo(-size*.51,-size*1.06);g.closePath();g.fill();
  box(-size*.33,-size*1.48,size*.66,size*.55,size*.16,'#eaf3ec','#82b4c4');box(-size*.27,-size*1.35,size*.54,size*.23,size*.08,'#132e45');
  for(let side of [-1,1])box(side*size*.13-size*.065,-size*1.29,size*.13,size*.065,3,'#77e6ed');
  line([[0,-size*1.49],[size*.04,-size*1.63]],'#83bdcb',3);g.fillStyle='#f1c86d';g.beginPath();g.arc(size*.04,-size*1.66,size*.055,0,Math.PI*2);g.fill();g.restore();
 }
 function burst(lane,color){const p=project(lane,.83);for(let i=0;i<12;i++){const angle=i*Math.PI/6;particles.push({x:p.x,y:p.y-height*.09,vx:Math.cos(angle)*80,vy:Math.sin(angle)*90-40,life:.55,color})}}
 function draw(){if(city){city.render(run);return}if(!g)return;world();for(const o of run.entities.filter(o=>!o.resolved&&o.y>-.12).sort((a,b)=>a.y-b.y))item(o);courier();for(const p of particles){g.globalAlpha=p.life/.55;g.fillStyle=p.color;g.fillRect(p.x,p.y,4,4)}g.globalAlpha=1}
 function updateHud(){
  const key=[Math.floor(run.elapsed),run.shield,run.bytes,run.combo,...run.verified].join(':');if(key===hudKey)return;hudKey=key;
  el.querySelector('[data-runner-clock]').textContent=run.gate?'GO':run.elapsed>=stage().duration?'+'+Math.floor(run.elapsed-stage().duration):Math.ceil(stage().duration-run.elapsed);
  el.querySelector('.pr-clock small').textContent=run.gate?'GATE OPEN':run.elapsed>=stage().duration?'FIND CHECKS':'SEC TO GATE';
  el.querySelector('[data-runner-shield]').textContent='♥ '.repeat(run.shield)+'♡ '.repeat(3-run.shield);
  el.querySelector('[data-runner-bytes]').textContent=run.bytes+' DATA BITS';el.querySelector('[data-runner-combo]').textContent=Math.min(4,1+Math.floor(run.combo/6))+'×';
  el.querySelector('[data-runner-distance]').style.width=Math.min(100,run.elapsed/stage().duration*100)+'%';
  run.verified.forEach((done,i)=>{const chip=el.querySelector(`[data-runner-check="${i}"]`);chip.classList.toggle('collected',done);chip.querySelector('b').textContent=done?'✓':'◇'});
  if(now()>noticeUntil){const copy=run.gate?'TRUSTED ROUTE OPEN. BRING IT HOME!':run.elapsed>=stage().duration?'GATE LOCKED · GRAB THE MISSING GOLD CHECKS':run.verified.every(Boolean)?'TRUST SHIELD READY · ONE FREE SCAM BLOCK':'SHIELDS = VERIFY · COINS = BONUS · DODGE THE TRAINS';el.querySelector('[data-runner-status]').textContent=copy}
 }
 function result(success){
  mode='result';halt();sceneId++;city?.dispose();city=null;const stars=run.hits===0?3:run.hits<3?2:1;
  if(success)ctx.add(run.score+100+run.shield*20,'packet delivered');
  if(!active())return;
  el.innerHTML=`<section class="attack-lab pr-result pr-v2"><p class="attack-type">${stage().zone} / ${success?'DELIVERY COMPLETE':'PACKET INTERCEPTED'}</p><div class="pr-result-stars">${success?'★'.repeat(stars)+'☆'.repeat(3-stars):'↻'}</div><h2>${success?'Special delivery.':'Byte needs a reboot.'}</h2><p>${success?stage().lesson:'Three hits stopped this delivery. Jump low obstacles, slide under scanners, and change lanes around server trains and bait. Try this stage again.'}</p><div class="pr-result-stats"><span><b>${run.bytes}</b>DATA BITS</span><span><b>${run.cleared}</b>CLEAN MOVES</span><span><b>${run.bestCombo}</b>BEST STREAK</span></div><button class="btn attack-next" type="button" data-runner-next>${success?'ENTER THE PHISH MAZE →':'RETRY THIS RESCUE →'}</button></section>`;
  el.onclick=e=>{if(!e.target.closest('[data-runner-next]'))return;el.onclick=null;if(success){dispose();clock(true);finish();return}run=newPacketRun(0);particles=[];notice='SWITCH LANES. JUMP THE TRAPS. KEEP YOUR PACKET SAFE.';scene()};el.onkeydown=el.onpointerdown=el.onpointerup=el.onpointercancel=null;
 }
 function tick(timestamp){
  if(!active()){dispose();return}if(mode!=='running')return;
  const dt=Math.min(.06,(timestamp-last)/1000||0);last=timestamp;
  const events=advancePacketRun(run,dt);
  for(const e of events){
   if(e.type==='check'){SFX.ok();burst(run.lane,'#ffd580');message('✓ '+e.label+' SECURED · +60')}
   else if(e.type==='trust'){message('ALL CHECKS SECURED! TRUST SHIELD ACTIVATED')}
   else if(e.type==='slide'){burst(e.lane,'#f68ed1');message('CLEAN SLIDE! '+e.multiplier+'× COMBO')}
   else if(e.type==='jump'){burst(e.lane,stage().accent);message('CLEAN JUMP! '+e.multiplier+'× COMBO')}
   else if(e.type==='byte'){burst(e.lane,stage().accent)}
   else if(e.type==='guard'){SFX.ok();message('TRUST SHIELD BLOCKED THAT SCAM!')}
   else if(e.type==='hit'){SFX.bad();message(e.kind==='overhead'?'SCANNER HIT! SWIPE DOWN OR PRESS ↓ TO SLIDE.':e.kind==='wall'?'SCAM TRAIN! CHANGE LANES AND WAIT FOR ITS TAIL.':e.kind==='trap'?'THAT BADGE WAS BAIT. USE REAL CHECKS.':'SCAM HIT! JUMP OR CHANGE LANES.')}
   else if(e.type==='gate'){SFX.ok();message('THREE CHECKS. ONE SAFE DELIVERY. LET’S GO!')}
   else if(e.type==='complete'){SFX.ok();result(true);return}
   else if(e.type==='failed'){result(false);return}
  }
  particles=particles.filter(p=>{p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;return p.life>0});updateHud();draw();raf=requestAnimationFrame(tick)
 }
 function steer(lane){if(mode==='running'&&active())steerPacket(run,lane)}
 function leap(){if(mode==='running'&&active())jumpPacket(run)}
 function duck(){if(mode==='running'&&active())slidePacket(run)}
 function bind(){
  el.onclick=e=>{const t=e.target;if(t.closest('[data-runner-start]')){begin();return}if(t.closest('[data-runner-pause]')){pause();return}if(t.closest('[data-runner-jump]')){leap();return}if(t.closest('[data-runner-slide]')){duck();return}const button=t.closest('[data-steer]');if(button)steer(run.lane+(button.dataset.steer==='left'?-1:1))};
  el.onkeydown=e=>{if(!active())return;if(['ArrowLeft','a','A','ArrowRight','d','D','ArrowUp','w','W','ArrowDown','s','S',' '].includes(e.key)){if(e.target.tagName==='BUTTON'&&e.key===' ')return;e.preventDefault();if(['ArrowDown','s','S'].includes(e.key)){if(!e.repeat)duck()}else if(['ArrowUp','w','W',' '].includes(e.key)){if(!e.repeat)leap()}else steer(run.lane+(['ArrowLeft','a','A'].includes(e.key)?-1:1))}else if(e.key==='p'||e.key==='P'){e.preventDefault();mode==='running'?pause():mode==='paused'&&begin()}};
  el.onpointerdown=e=>{if(e.target===surface&&mode==='running'){pointer={x:e.clientX,y:e.clientY};surface.setPointerCapture?.(e.pointerId)}};
  el.onpointerup=e=>{if(!pointer)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer=null;if(dy>28&&Math.abs(dy)>Math.abs(dx)){duck();return}if(dy<-28&&Math.abs(dy)>Math.abs(dx)){leap();return}if(Math.abs(dx)>28&&Math.abs(dx)>Math.abs(dy)){steer(run.lane+(dx<0?-1:1));return}if(Math.abs(dx)<20&&Math.abs(dy)<20){const r=surface.getBoundingClientRect();steer(Math.max(0,Math.min(2,Math.floor((e.clientX-r.left)/r.width*3))))}};
  el.onpointercancel=()=>{pointer=null}
 }
 window.addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);
 if(typeof MutationObserver!=='undefined'){observer=new MutationObserver(()=>{if(!active())dispose()});observer.observe(el.closest('#app')||el.parentNode,{childList:true,subtree:true})}
 scene();
}

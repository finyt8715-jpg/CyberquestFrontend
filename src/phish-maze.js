/* Trust Chase: a second gate in Trusted Routes. Model is independent of the canvas. */
const PHISH_MAZE_MAP=[
 '###############',
 '#S....#....1..#',
 '#.##..#..##...#',
 '#o...........o#',
 '#.##.#.#.##.#.#',
 '#....#.#....#.#',
 '###..#...#..#.#',
 '#2...#.#.#...E#',
 '#.##...#...##.#',
 '#....#...#....#',
 '#.##.#.#.#.##.#',
 '#o...#.#.....o#',
 '#.#..#...##.#.#',
 '#...3.........#',
 '###############'
];
const MAZE_CHECKS=[
 {name:'EXACT DOMAIN',icon:'1',tip:'Check the exact website address. A familiar logo alone proves nothing.'},
 {name:'KNOWN IT CONTACT',icon:'2',tip:'Contact IT using the company directory, not the number in a surprise message.'},
 {name:'SELF-STARTED MFA',icon:'3',tip:'Approve only sign-ins you started. Never share your one-time code.'}
];
const MAZE_DIRS={up:[0,-1],right:[1,0],down:[0,1],left:[-1,0]};
const MAZE_BOT_HOMES=[[7,3],[11,7],[9,13]];
const MAZE_PLAYER_STEP=.18,MAZE_BOT_STEP=.43;
function mazeOpen(x,y){return !!PHISH_MAZE_MAP[y]?.[x]&&PHISH_MAZE_MAP[y][x]!=='#'}
function mazeKey(x,y){return x+','+y}
// Interpolate each straight corridor segment; never ease diagonally through a corner.
// Simulation time also freezes these animations when the game is paused.
function mazePosition(actor,time){
 const m=actor.motion;if(!m||m.x!==actor.x||m.y!==actor.y)return {x:actor.x,y:actor.y};
 const p=Math.max(0,Math.min(1,(time-m.start)/m.duration));
 return {x:m.fromX+(m.x-m.fromX)*p,y:m.fromY+(m.y-m.fromY)*p};
}
function mazeMove(actor,x,y,start,duration){
 actor.motion={fromX:actor.x,fromY:actor.y,x,y,start,duration};actor.x=x;actor.y=y;
}
function newPhishMaze(){
 const dots=new Set(),powers=new Set();
 PHISH_MAZE_MAP.forEach((row,y)=>[...row].forEach((c,x)=>{if(c==='.')dots.add(mazeKey(x,y));if(c==='o')powers.add(mazeKey(x,y))}));
 return {x:1,y:1,dir:'right',wanted:'right',moving:false,elapsed:0,playerTick:0,botTick:0,dots,powers,verified:[false,false,false],hearts:3,shield:0,invulnerable:2,score:0,bytes:0,tags:0,complete:false,failed:false,bots:MAZE_BOT_HOMES.map(([x,y],i)=>({x,y,homeX:x,homeY:y,id:i,sleep:3+i}))};
}
function steerPhishMaze(run,dir){if(MAZE_DIRS[dir]&&!run.complete&&!run.failed){run.wanted=dir;run.moving=true}}
function mazeDistances(x,y){
 const queue=[[x,y]],dist=new Map([[mazeKey(x,y),0]]);
 for(let i=0;i<queue.length;i++){const [cx,cy]=queue[i];for(const [dx,dy] of Object.values(MAZE_DIRS)){const nx=cx+dx,ny=cy+dy,k=mazeKey(nx,ny);if(mazeOpen(nx,ny)&&!dist.has(k)){dist.set(k,dist.get(mazeKey(cx,cy))+1);queue.push([nx,ny])}}}
 return dist;
}
function mazeContact(run,events){
 for(const bot of run.bots){
  if(bot.sleep>0||bot.x!==run.x||bot.y!==run.y)continue;
  if(run.shield>0){bot.x=bot.homeX;bot.y=bot.homeY;bot.motion=null;bot.sleep=5;run.score+=40;run.tags++;events.push({type:'tag'});continue}
  if(run.invulnerable>0)continue;
  run.hearts--;run.invulnerable=2.5;run.x=1;run.y=1;run.motion=null;run.moving=false;run.playerTick=0;
  run.bots.forEach(b=>{b.x=b.homeX;b.y=b.homeY;b.motion=null;b.sleep=2});
  events.push({type:'hit'});if(run.hearts===0){run.failed=true;events.push({type:'failed'})}break;
 }
}
function advancePhishMaze(run,seconds){
 if(run.complete||run.failed||!Number.isFinite(seconds)||seconds<=0)return [];
 const dt=Math.min(.1,seconds),events=[];
 run.elapsed+=dt;run.playerTick+=dt;run.botTick+=dt;run.shield=Math.max(0,run.shield-dt);run.invulnerable=Math.max(0,run.invulnerable-dt);
 run.bots.forEach(b=>b.sleep=Math.max(0,b.sleep-dt));
 mazeContact(run,events);if(run.failed)return events;
 if(run.playerTick+1e-9>=MAZE_PLAYER_STEP){
  run.playerTick=Math.max(0,run.playerTick-MAZE_PLAYER_STEP);
  const can=dir=>{const [dx,dy]=MAZE_DIRS[dir];return mazeOpen(run.x+dx,run.y+dy)};
  if(run.moving&&can(run.wanted))run.dir=run.wanted;
  if(run.moving&&can(run.dir)){const [dx,dy]=MAZE_DIRS[run.dir];mazeMove(run,run.x+dx,run.y+dy,run.elapsed-run.playerTick,MAZE_PLAYER_STEP)}
  const key=mazeKey(run.x,run.y),cell=PHISH_MAZE_MAP[run.y][run.x];
  if(run.dots.delete(key)){run.score+=2;run.bytes++;events.push({type:'byte'})}
  if(run.powers.delete(key)){run.shield=7;events.push({type:'shield'})}
  if(/^[123]$/.test(cell)&&!run.verified[Number(cell)-1]){const i=Number(cell)-1;run.verified[i]=true;run.score+=60;events.push({type:'check',index:i})}
  mazeContact(run,events);
  if(!run.failed&&PHISH_MAZE_MAP[run.y][run.x]==='E'){
   if(run.verified.every(Boolean)){run.complete=true;events.push({type:'complete'});return events}
   if(run.moving)events.push({type:'locked'});run.moving=false;
  }
 }
 if(!run.failed&&run.botTick+1e-9>=MAZE_BOT_STEP){
  run.botTick=Math.max(0,run.botTick-MAZE_BOT_STEP);
  for(const bot of run.bots){
   if(bot.sleep>0)continue;
   // Bots chase, anticipate a turn, or intercept near the exit. Shield turns the chase around.
   const [dx,dy]=MAZE_DIRS[run.dir],ahead=bot.id===1&&mazeOpen(run.x+dx*2,run.y+dy*2);
   const target=bot.id===2&&run.verified.filter(Boolean).length<2?[11,7]:ahead?[run.x+dx*2,run.y+dy*2]:[run.x,run.y];
   const dist=mazeDistances(...target);
   const choices=Object.values(MAZE_DIRS).map(([a,b])=>[bot.x+a,bot.y+b]).filter(([x,y])=>mazeOpen(x,y));
   choices.sort((a,b)=>((dist.get(mazeKey(...a))??999)-(dist.get(mazeKey(...b))??999))*(run.shield>0?-1:1));
   if(choices.length)mazeMove(bot,...choices[0],run.elapsed-run.botTick,MAZE_BOT_STEP);mazeContact(run,events);if(run.failed)break;
  }
 }
 return events;
}

function phishMaze(el,ctx,finish){
 let run=newPhishMaze(),mode='brief',raf=0,last=0,canvas,g,size=0,board=null,observer=null,disposed=false,pointer=null,noticeUntil=0,hudKey='',bursts=[];
 const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const active=()=>!disposed&&el.isConnected!==false;
 const clock=on=>{if(typeof dailyActive!=='undefined'){dailyActive=on;dailyLast=Date.now()}};
 function halt(){cancelAnimationFrame(raf);raf=0;clock(false)}
 function dispose(){if(disposed)return;halt();disposed=true;observer?.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);el.onclick=el.onkeydown=el.onpointerdown=el.onpointerup=el.onpointercancel=null}
 function status(copy){const node=el.querySelector('[data-maze-status]');if(node)node.textContent=copy;noticeUntil=performance.now()+4200}
 function scene(){
  mode='brief';halt();hudKey='';bursts=[];
  el.innerHTML=`<section class="attack-lab pm-shell" aria-labelledby="pm-title"><div class="pm-topline"><span>TRUSTED ROUTES / PHISH MAZE</span><b>GATE 02 / 02</b></div><div class="pm-heading"><div><p class="attack-type">THE VERIFICATION ARCADE</p><h2 id="pm-title">PHISH <em>MAZE</em><small>CHOMP THE BITS. OUTSMART THE SCAMS.</small></h2></div><div class="pm-gate-badge"><span>✓</span>GATE 01<br>SECURED</div></div><div class="pm-layout"><div class="pm-arena"><div class="pm-hud"><span><small>INTEGRITY</small><b data-maze-hearts>♥ ♥ ♥</b></span><span><small>SCORE</small><b data-maze-score>00000</b></span><span class="pm-bits"><small>BITS</small><b data-maze-bytes>0</b></span><button type="button" data-maze-pause aria-label="Pause maze">Ⅱ</button></div><canvas class="pm-canvas" tabindex="0" role="img" aria-label="Phish Maze. Use arrow keys, WASD, swipe, or direction buttons. Collect the three numbered gold checks and reach the exit on the right. Avoid scam bots; mint shields give temporary protection."></canvas><div class="pm-overlay" data-maze-overlay></div><div class="pm-status" data-maze-status role="status">Collect 1, 2 and 3. Then find the trusted exit →</div></div><aside class="pm-sidebar"><div class="pm-mission"><p class="attack-type">YOUR EXIT KEYS</p><h3>Verify. Then enter.</h3><p>A surprise payroll link brought you here. Build a trusted route back.</p><div class="pm-checks">${MAZE_CHECKS.map((c,i)=>`<div data-maze-check="${i}"><b>${i+1}</b><span>${c.name}<small>Find the gold beacon</small></span></div>`).join('')}</div></div><div class="pm-legend"><span><i class="pm-dot"></i>Data bits <small>Bonus points</small></span><span><i class="pm-power">✦</i>Trust shield <small>7 sec · Tag bots for a bonus</small></span><span><i class="pm-bot">!</i>Scam bots <small>Phish · Fake boss · QR bait</small></span></div><div class="pm-controls"><button type="button" data-maze-dir="up" aria-label="Move up">↑</button><button type="button" data-maze-dir="left" aria-label="Move left">←</button><button type="button" data-maze-dir="down" aria-label="Move down">↓</button><button type="button" data-maze-dir="right" aria-label="Move right">→</button></div><small class="pm-control-note">ARROWS / WASD · SWIPE TO TURN<br>Keep moving. Queue your next turn early.</small></aside></div></section>`;
  canvas=el.querySelector('canvas');g=canvas.getContext('2d');resize();bind();overlay(false);hud();
 }
 function overlay(paused){const node=el.querySelector('[data-maze-overlay]');node.hidden=false;node.innerHTML=`<div class="pm-brief"><div class="pm-brief-icon">${paused?'Ⅱ':'◕'}</div><p class="attack-type">${paused?'ROUTE PAUSED':'GATE 01 CLEAR · NEW CHALLENGE'}</p><h3>${paused?'Your packet is safe.':'READY,<br>PLAYER ONE?'}</h3><p>${paused?'Take a breath. Continue when you’re ready.':'<strong>Chomp</strong> the bits. <strong>Dodge</strong> the bots.<br>Find <strong>3 gold keys</strong> to open the exit.<br>Mint shields let you chase back!'}</p><button class="btn attack-next" type="button" data-maze-start>${paused?'RESUME CHASE →':'START CHASE →'}</button><small>${paused?'Your daily play clock is paused.':'Arrows / WASD · Swipe · On-screen controls'}</small></div>`}
 function begin(){if(!active()||!['brief','paused'].includes(mode))return;mode='running';el.querySelector('[data-maze-overlay]').hidden=true;clock(true);canvas.focus({preventScroll:true});last=performance.now();raf=requestAnimationFrame(tick)}
 function pause(){if(mode!=='running')return;mode='paused';halt();overlay(true)}
 function visibility(){if(!active()){dispose();return}if(document.hidden)pause()}
 function resize(){
  if(!active()||mode==='result'||!canvas)return;
  size=Math.max(1,canvas.getBoundingClientRect().width);const dpr=Math.min(window.devicePixelRatio||1,2);
  canvas.width=canvas.height=Math.round(size*dpr);g.setTransform(dpr,0,0,dpr,0,0);
  // Cache the neon walls: only characters and pickups need repainting each frame.
  board=document.createElement?.('canvas')||null;
  if(board){board.width=canvas.width;board.height=canvas.height;const bg=board.getContext('2d');bg.setTransform(dpr,0,0,dpr,0,0);paintBoard(bg)}
  draw();
 }
 function paintBoard(bg){
  const cell=size/15;bg.fillStyle='#090c23';bg.fillRect(0,0,size,size);
  PHISH_MAZE_MAP.forEach((row,y)=>[...row].forEach((c,x)=>{
   const left=x*cell,top=y*cell;
   if(c!=='#'){
    bg.fillStyle=(x+y)%2?'#11152e':'#10132b';bg.fillRect(left,top,cell,cell);return;
   }
   const color=y<5?'#55dff7':y<10?'#a592ff':'#ff77bc';
   bg.fillStyle=y<5?'#133149':y<10?'#242249':'#39203f';bg.fillRect(left,top,cell,cell);
   bg.beginPath();const inset=cell*.12;
   // Only outline exposed edges, forming continuous arcade corridors.
   if(mazeOpen(x,y-1)){bg.moveTo(left,top+inset);bg.lineTo(left+cell,top+inset)}
   if(mazeOpen(x,y+1)){bg.moveTo(left,top+cell-inset);bg.lineTo(left+cell,top+cell-inset)}
   if(mazeOpen(x-1,y)){bg.moveTo(left+inset,top);bg.lineTo(left+inset,top+cell)}
   if(mazeOpen(x+1,y)){bg.moveTo(left+cell-inset,top);bg.lineTo(left+cell-inset,top+cell)}
   bg.strokeStyle=color;bg.lineWidth=Math.max(1.3,cell*.065);bg.lineCap='round';bg.shadowColor=color;bg.shadowBlur=5;bg.stroke();bg.shadowBlur=0;
   // Tiny circuit inlays keep large wall blocks from becoming flat slabs.
   bg.fillStyle=color+'30';bg.fillRect(left+cell*.43,top+cell*.43,cell*.14,cell*.14);
  }));
  bg.strokeStyle='#8498e04d';bg.lineWidth=2;bg.strokeRect(1,1,size-2,size-2);
 }
 function draw(){
  const cell=size/15,t=run.elapsed,decor=reducedMotion?0:t;
  g.clearRect(0,0,size,size);if(board)g.drawImage(board,0,0,size,size);else paintBoard(g);
  function circle(x,y,r,color){g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fillStyle=color;g.fill()}
  function label(text,x,y,color,font=.38){g.font='800 '+cell*font+'px "JetBrains Mono",monospace';g.textAlign='center';g.textBaseline='middle';g.fillStyle=color;g.fillText(text,x,y)}
  PHISH_MAZE_MAP.forEach((row,y)=>[...row].forEach((c,x)=>{
   const cx=(x+.5)*cell,cy=(y+.5)*cell;
   if(run.dots.has(mazeKey(x,y))){g.fillStyle='#ffe9a0';g.fillRect(cx-cell*.07,cy-cell*.07,cell*.14,cell*.14)}
   if(run.powers.has(mazeKey(x,y))){
    const pulse=1+.08*Math.sin(decor*4);circle(cx,cy,cell*.36*pulse,'#63ffd521');circle(cx,cy,cell*.24,'#71ffd4');
    g.strokeStyle='#c2ffed';g.lineWidth=1;g.stroke();label('✦',cx,cy,'#133c41',.39);
   }
   if(/^[123]$/.test(c)&&!run.verified[Number(c)-1]){
    g.save();g.translate(cx,cy);g.shadowColor='#ffcb55';g.shadowBlur=10;
    g.fillStyle='#ffd565';g.strokeStyle='#fff1b3';g.lineWidth=cell*.045;
    g.beginPath();g.roundRect(-cell*.33,-cell*.33,cell*.66,cell*.66,cell*.1);g.fill();g.stroke();g.shadowBlur=0;
    label(c,0,0,'#372543',.5);g.restore();
   }
   if(c==='E'){
    const open=run.verified.every(Boolean);g.fillStyle=open?'#74ffd4':'#292d53';g.strokeStyle=open?'#d5fff3':'#6d71a4';g.lineWidth=cell*.045;
    g.beginPath();g.roundRect(x*cell+cell*.05,y*cell+cell*.05,cell*.9,cell*.9,cell*.12);g.fill();g.stroke();
    label(open?'→':'×',cx,cy,open?'#163a42':'#c2c5e9',.65);
   }
  }));
  run.bots.forEach(bot=>{
   const pos=mazePosition(bot,t),x=(pos.x+.5)*cell,y=(pos.y+.5)*cell,colors=['#ff5d93','#bb93ff','#ff995b'];
   const scared=run.shield>0,color=scared?'#649dff':colors[bot.id],foot=Math.floor(decor*9+bot.id)%2;
   g.save();g.globalAlpha=bot.sleep>0?.38:1;g.translate(x,y);
   g.shadowColor=color;g.shadowBlur=bot.sleep>0?0:7;g.fillStyle=color;
   // Chunky pixel bots, each with a distinct antenna and symbol.
   g.beginPath();g.moveTo(-cell*.34,cell*.33);g.lineTo(-cell*.34,-cell*.12);g.lineTo(-cell*.23,-cell*.12);g.lineTo(-cell*.23,-cell*.28);g.lineTo(-cell*.12,-cell*.28);g.lineTo(-cell*.12,-cell*.35);g.lineTo(cell*.12,-cell*.35);g.lineTo(cell*.12,-cell*.28);g.lineTo(cell*.23,-cell*.28);g.lineTo(cell*.23,-cell*.12);g.lineTo(cell*.34,-cell*.12);g.lineTo(cell*.34,cell*.33);
   for(let i=3;i>=-3;i--)g.lineTo(cell*i*.1,cell*((i+foot)%2===0?.2:.33));g.closePath();g.fill();g.shadowBlur=0;
   g.fillStyle='#172140';g.fillRect(-cell*.25,-cell*.13,cell*.5,cell*.2);
   const lookX=Math.sign(run.x-bot.x)*cell*.025,lookY=Math.sign(run.y-bot.y)*cell*.025;
   g.fillStyle=scared?'#f1f5ff':'#fff5dc';g.fillRect(-cell*.19+lookX,-cell*.085+lookY,cell*.11,cell*.09);g.fillRect(cell*.08+lookX,-cell*.085+lookY,cell*.11,cell*.09);
   label(scared?'·':['@','!','#'][bot.id],0,cell*.2,'#18213b',.22);
   g.fillStyle=color;g.fillRect(-cell*.025,-cell*.48,cell*.05,cell*.13);circle(0,-cell*.48,cell*.055,'#fff2cd');g.restore();
  });
  const pos=mazePosition(run,t),px=(pos.x+.5)*cell,py=(pos.y+.5)*cell;
  g.save();g.translate(px,py);if(run.invulnerable>0)g.globalAlpha=reducedMotion?.8:.65+.35*Math.abs(Math.sin(t*9));
  if(run.shield>0){g.strokeStyle='#78ffda';g.lineWidth=cell*.065;g.beginPath();g.arc(0,0,cell*.46,0,Math.PI*2);g.stroke()}
  g.rotate(({right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2})[run.dir]);
  const chomping=run.motion&&t-run.motion.start<MAZE_PLAYER_STEP;
  const mouth=chomping&&!reducedMotion?.18+.36*(.5+.5*Math.sin(t*26)):.22;
  g.shadowColor='#ffd359';g.shadowBlur=9;g.fillStyle='#ffdc64';g.beginPath();g.moveTo(0,0);g.arc(0,0,cell*.35,mouth,Math.PI*2-mouth);g.closePath();g.fill();g.shadowBlur=0;
  circle(-cell*.02,-cell*.2,cell*.055,'#17203c');g.fillStyle='#fff2b3';g.fillRect(-cell*.23,-cell*.13,cell*.07,cell*.07);g.restore();
  bursts=bursts.filter(b=>t-b.start<.55);
  if(!reducedMotion)bursts.forEach(b=>{
   const p=(t-b.start)/.55;g.save();g.globalAlpha=1-p;g.strokeStyle=b.color;g.lineWidth=2;g.beginPath();g.arc((b.x+.5)*cell,(b.y+.5)*cell,cell*(.3+p*.7),0,Math.PI*2);g.stroke();
   for(let i=0;i<6;i++){const a=i*Math.PI/3;g.fillStyle=b.color;g.fillRect((b.x+.5+Math.cos(a)*p)*cell,(b.y+.5+Math.sin(a)*p)*cell,cell*.08,cell*.08)}g.restore();
  });
 }
 function hud(){
  const key=[run.hearts,run.score,run.bytes,...run.verified,Math.ceil(run.shield),performance.now()>noticeUntil].join(':');
  if(key===hudKey)return;hudKey=key;
  el.querySelector('[data-maze-score]').textContent=String(run.score).padStart(5,'0');
  el.querySelector('[data-maze-hearts]').textContent='♥ '.repeat(run.hearts)+'♡ '.repeat(3-run.hearts);el.querySelector('[data-maze-bytes]').textContent=run.bytes;
  run.verified.forEach((done,i)=>{const node=el.querySelector(`[data-maze-check="${i}"]`);node.classList.toggle('collected',done);node.querySelector('b').textContent=done?'✓':i+1;node.querySelector('small').textContent=done?'Verified · key secured':'Find the gold beacon'});
  if(performance.now()>noticeUntil)el.querySelector('[data-maze-status]').textContent=run.shield>0?`TRUST SHIELD · ${Math.ceil(run.shield)}s · Chase the bots!`:run.verified.every(Boolean)?'ALL KEYS SECURED · REACH THE EXIT ON THE RIGHT →':'Collect the gold checks · Mint shields protect you';
 }
 function result(success){
  mode='result';halt();if(success)ctx.add(run.score+100+run.hearts*20,'phish maze verified');if(!active())return;
  el.innerHTML=`<section class="attack-lab pr-result pm-result"><p class="attack-type">GATE 02 / ${success?'NETWORK VERIFIED':'PACKET INTERCEPTED'}</p><div class="pr-result-stars">${success?'★'.repeat(run.hearts)+'☆'.repeat(3-run.hearts):'↻'}</div><h2>${success?'Two gates. One safe packet.':'Another route awaits.'}</h2><p>${success?'You escaped the fake payroll link. Use the exact domain, a known IT contact and MFA you started to keep real work safe.':'The scam bots caught your packet. Take a different turn, grab a mint shield, and try again.'}</p><div class="pr-result-stats"><span><b>${run.bytes}</b>DATA BITS</span><span><b>${run.tags}</b>BOTS TAGGED</span><span><b>${Math.floor(run.elapsed)}s</b>CHASE TIME</span></div><button type="button" class="btn attack-next" data-maze-next>${success?'OPEN PHISH OR LEGIT INBOX →':'RETRY THE MAZE →'}</button></section>`;
  el.onkeydown=el.onpointerdown=el.onpointerup=el.onpointercancel=null;
  el.onclick=e=>{if(!e.target.closest('[data-maze-next]'))return;el.onclick=null;if(success){dispose();clock(true);finish()}else{run=newPhishMaze();scene()}};
 }
 function tick(time){
  if(!active()){dispose();return}if(mode!=='running')return;const dt=Math.max(0,Math.min(.06,(time-last)/1000));last=time;
  for(const event of advancePhishMaze(run,dt)){
   if(['check','shield','tag'].includes(event.type))bursts.push({x:run.x,y:run.y,start:run.elapsed,color:event.type==='check'?'#ffdc64':'#78ffda'});
   if(event.type==='check'){SFX.ok();status('✓ '+MAZE_CHECKS[event.index].tip)}
   if(event.type==='shield'){SFX.ok();status('TRUST SHIELD! You can tag scam bots for 7 seconds.')}
   if(event.type==='tag'){SFX.ok();status('SCAM BOT QUARANTINED · +40')}
   if(event.type==='hit'){SFX.bad();status('SCAM HIT · Your keys are safe. Choose a direction to restart.')}
   if(event.type==='locked')status('EXIT LOCKED · Find all 3 gold verification checks first.');
   if(event.type==='complete'){SFX.ok();result(true);return}if(event.type==='failed'){result(false);return}
  }
  hud();draw();raf=requestAnimationFrame(tick);
 }
 function steer(dir){if(mode==='running'&&active())steerPhishMaze(run,dir)}
 function bind(){
  el.onclick=e=>{if(e.target.closest('[data-maze-start]')){begin();return}if(e.target.closest('[data-maze-pause]')){pause();return}const button=e.target.closest('[data-maze-dir]');if(button)steer(button.dataset.mazeDir)};
  el.onkeydown=e=>{const dir={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'}[e.key];if(dir){e.preventDefault();steer(dir)}else if(e.key.toLowerCase()==='p'){e.preventDefault();mode==='running'?pause():mode==='paused'&&begin()}};
  el.onpointerdown=e=>{if(e.target===canvas&&mode==='running'){pointer={x:e.clientX,y:e.clientY};canvas.setPointerCapture?.(e.pointerId)}};
  el.onpointerup=e=>{if(!pointer)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer=null;if(Math.max(Math.abs(dx),Math.abs(dy))<15)return;steer(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up')};el.onpointercancel=()=>{pointer=null};
 }
 window.addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);
 if(typeof MutationObserver!=='undefined'){observer=new MutationObserver(()=>{if(!active())dispose()});observer.observe(el.closest('#app')||el.parentNode,{childList:true,subtree:true})}
 scene();
}

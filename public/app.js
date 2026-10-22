
const $=s=>document.querySelector(s),fmt=n=>n.toLocaleString('en-US');
const SERVER=!!window.CQ_SERVER,STATIC=!!window.CQ_STATIC;
async function api(path,method,body){
 const ac=new AbortController(),to=setTimeout(()=>ac.abort(),20000);
 try{const r=await fetch('/api'+path,{method:method||'GET',credentials:'same-origin',signal:ac.signal,headers:{'Content-Type':'application/json','X-Requested-With':'cq'},body:body===undefined?undefined:JSON.stringify(body)});
  let d=null;try{d=await r.json()}catch(e){}
  if(!r.ok){const e=new Error((d&&d.error)||('Request failed ('+r.status+')'));e.status=r.status;e.code=d&&d.code;throw e}
  return d}catch(e){if(e.name=='AbortError'){const t=new Error('The server took too long to respond. Please try again.');t.status=0;throw t}if(e.status===undefined){e.status=0;e.message='Cannot reach the server. Check your connection.'}throw e}
 finally{clearTimeout(to)}}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* ---------- audio: UI sounds + background music (WebAudio, no files) ---------- */
const SFX=(()=>{const s={sfx:true,music:true};let ac,mg,mm,mt=0,st=0,started=0,duckOn=0;
 const wake=()=>{if(!ac){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;try{ac=new C();mg=ac.createGain();mg.gain.value=.7;mg.connect(ac.destination);mm=ac.createGain();mm.gain.value=duckOn?.15:.5;mm.connect(mg)}catch(e){ac=null;return null}}if(ac.state=='suspended')ac.resume();return ac};
 const tone=(f,d=.1,ty='square',v=.05,t0=0,fe,dest)=>{if(!s.sfx&&!dest)return;const a=wake();if(!a)return;try{const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+t0;o.type=ty;o.frequency.setValueAtTime(f,t);if(fe)o.frequency.exponentialRampToValueAtTime(fe,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(dest||mg);o.start(t);o.stop(t+d+.03)}catch(e){}};
 const sc=[220,261.6,293.7,329.6,392,440,523.3],ml=[0,2,4,2,5,4,2,1,0,2,4,5,6,5,4,2,0,2,4,2,5,4,2,1,0,1,2,4,3,2,1,0],bs=[110,87.3,98,82.4];
 const tick=()=>{const i=st++%32;tone(sc[ml[i]],.14,'triangle',.05,0,0,mm);if(i%4==0)tone(bs[(i>>3)%4],.3,'square',.035,0,0,mm)};
 const startM=()=>{if(!s.music||mt||!started)return;if(wake())mt=setInterval(tick,160)},stopM=()=>{clearInterval(mt);mt=0};
 document.addEventListener('visibilitychange',()=>document.hidden?stopM():startM());
 return{s,tone,duck(on){duckOn=on;if(mm)mm.gain.value=on?.15:.5},
  gesture(){if(!started){started=1;startM()}},
  toggle(k){s[k]=!s[k];if(k=='music')s.music?startM():stopM();if(k=='sfx'&&s.sfx)this.click()},
  click(){tone(620,.04,'square',.035,0,880)},
  ok(){[660,880,1175].forEach((f,i)=>tone(f,.1,'square',.04,i*.07))},
  bad(){tone(200,.18,'sawtooth',.05,0,110);tone(150,.2,'sawtooth',.04,.1,90)},
  win(){[523,659,784,1047].forEach((f,i)=>tone(f,.14,'square',.045,i*.09))},
  lose(){[392,330,262,196].forEach((f,i)=>tone(f,.18,'sawtooth',.04,i*.12))},
  blip(){tone(150+Math.random()*120,.05,'square',.03)},
  ring(){[0,.5].forEach(t=>{tone(440,.35,'sine',.05,t);tone(480,.35,'sine',.05,t)})}}})();
const beepSfx=(f,d,ty)=>SFX.tone(f,d||.12,ty||'square');
document.addEventListener('pointerdown',()=>SFX.gesture(),{once:true});document.addEventListener('keydown',()=>SFX.gesture(),{once:true});
document.addEventListener('click',e=>{if(e.target.closest('button,[role=button],.node,.rw,.mail'))SFX.click()},true);
const ADMIN=()=>{if(SERVER)return!!S.admin;if(STATIC&&!window.CQ_DEMO)return false;try{return /[?&]admin(=|&|$)/.test(location.search)||localStorage.getItem('cq-admin')=='1'}catch(e){return false}};
/* ---------- persistence (progress is saved on this device until the backend exists) ---------- */
const KEY='cyberquest.v1';
const BASICS_VERSION=1;
const BASICS_LIMITS={quiz:8,match:6,sort:6};
function cleanBasics(value){
 const result={version:BASICS_VERSION,quiz:[],match:[],sort:[]};
 if(!value||value.version!==BASICS_VERSION)return result;
 for(const kind of Object.keys(BASICS_LIMITS)){
  if(!Array.isArray(value[kind]))continue;
  result[kind]=[...new Set(value[kind].filter(n=>Number.isInteger(n)&&n>=0&&n<BASICS_LIMITS[kind]))].sort((a,b)=>a-b)
 }
 return result
}
const basicsUserKey=id=>'cyberquest.basics.v1.'+String(id);
const savedLevelCount=()=>typeof LV==='undefined'?5:LV.length;
function save(){try{localStorage.setItem(KEY,JSON.stringify(SERVER?{fx:SFX.s}:{missionOrder:5,name:S.name,best:S.best,done:S.done,claimed:S.claimed,cases:S.cases,photo:S.photo,basics:cleanBasics(S.basics),fx:SFX.s}));if(SERVER&&S.user&&S.user.id){localStorage.setItem('cyberquest.profile.'+S.user.id,S.photo||'');localStorage.setItem(basicsUserKey(S.user.id),JSON.stringify(cleanBasics(S.basics)))}return true}catch(e){return false}}
function load(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(!d)return;S.name=String(d.name||'').slice(0,40);S.photo=profilePhotoValid(d.photo)?d.photo:'';
 if(!SERVER&&d.missionOrder!==2&&d.missionOrder!==3&&d.missionOrder!==4&&d.missionOrder!==5){const remap=n=>+n===5?1:+n+1;d.best=Object.fromEntries(Object.entries(d.best||{}).filter(([k])=>+k>=1&&+k<=5).map(([k,v])=>[remap(k),v]));if(Array.isArray(d.done))d.done=d.done.filter(n=>n>=1&&n<=5).map(remap)}
 if(!SERVER&&d.missionOrder!==3&&d.missionOrder!==4&&d.missionOrder!==5){const remap=n=>({1:2,2:3,3:1,4:4,5:5})[+n];d.best=Object.fromEntries(Object.entries(d.best||{}).filter(([k])=>remap(k)).map(([k,v])=>[remap(k),v]));if(Array.isArray(d.done))d.done=d.done.filter(n=>remap(n)).map(remap)}
 if(!SERVER&&d.missionOrder!==4&&d.missionOrder!==5){const remap=n=>({1:2,2:1,3:3,4:4,5:5})[+n];d.best=Object.fromEntries(Object.entries(d.best||{}).filter(([k])=>remap(k)).map(([k,v])=>[remap(k),v]));if(Array.isArray(d.done))d.done=d.done.filter(n=>remap(n)).map(remap)}
 if(!SERVER&&d.missionOrder!==5){const remap=n=>({1:1,2:3,3:2,4:4,5:5})[+n];d.best=Object.fromEntries(Object.entries(d.best||{}).filter(([k])=>remap(k)).map(([k,v])=>[remap(k),v]));if(Array.isArray(d.done))d.done=d.done.filter(n=>remap(n)).map(remap)}
 S.best={};for(const k in (d.best||{}))if(+k>=1&&+k<=savedLevelCount()&&isFinite(d.best[k]))S.best[k]=Math.max(0,+d.best[k]);
 S.done=Array.isArray(d.done)?d.done.filter(n=>Number.isInteger(n)&&n>=1&&n<=savedLevelCount()):[];S.claimed=d.claimed&&typeof d.claimed=='object'?d.claimed:{};S.cases=d.cases&&typeof d.cases=='object'?d.cases:{};if(!SERVER)S.basics=cleanBasics(d.basics);
 if(d.fx){S.fxLoaded=1;SFX.s.sfx=d.fx.sfx!==false;SFX.s.music=d.fx.music!==false}}catch(e){}}
/* Backend adapter (phase 2): replace save()/load() and these stubs with real calls
   POST /api/progress, GET /api/leaderboard?day=today, POST /api/rewards/claim. Scores must be validated server-side. */

const S={name:'',photo:'',best:{},base:0,cases:{},claimed:{},basics:{version:1,quiz:[],match:[],sort:[]},score:0,done:[],view:'games',sel:1,cur:1,lp:0,combo:0,menuOpen:false,lastResult:null,assign:{1:'sorter',2:'phish',3:'shoot',4:'desk',5:'voice'}};
const EXTRA_LEVELS=[];
const ATTACK_BRIEFS=[
 {kind:'EMAIL / FAKE LOGIN',icon:'✉',title:'The stolen sign-in',lesson:'Phishing copies a familiar email or login screen to steal your password. The sender and the final website address matter more than the logo.',message:'IT Helpdesk: “Your mailbox closes in 30 minutes. Sign in at innovatiview-login.co to keep access.”',question:'What is your move?',choices:['Open the link and sign in before the deadline','Open the company portal yourself and report the email','Reply and ask the sender if it is real'],correct:1,clue:'The look-alike domain and 30-minute threat are the trap. Visit the real portal directly.'},
 {kind:'SPEAR PHISHING',icon:'◎',title:'A trap with your name on it',lesson:'Spear phishing uses your name, role or a real project to feel personal. Specific details can be researched or stolen; they do not prove the sender is trusted.',message:'“Hi, your Atlas project report is ready. Please open the shared file and sign in again.” The sender is a name you know, but the address is external.',question:'How do you check it?',choices:['Sign in because the project name is correct','Forward the link to your project team','Ask the colleague through a known work channel before opening it'],correct:2,clue:'A real project name is bait. Confirm with the person through a trusted channel.'},
 {kind:'EXECUTIVE / BEC',icon:'♛',title:'The boss rush',lesson:'Attackers impersonate a CEO or director to redirect payments, buy gift cards or change bank details. This is business email compromise (BEC). Urgency and secrecy are pressure tactics.',message:'Director: “I am in meetings. Pay this supplier to the NEW bank account today. Keep it between us.”',question:'What protects the company?',choices:['Call the director or finance on a number you already know','Pay now, then verify afterward','Reply to the same message for confirmation'],correct:0,clue:'Never change payment details from one message. Verify independently with an approved contact.'},
 {kind:'SMISHING',icon:'▣',title:'The text-message lure',lesson:'Smishing is phishing by SMS or chat. Short links and delivery or account warnings can lead to fake sites or apps.',message:'SMS: “Your work delivery is on hold. Update your address and company login at iv-delivery.help/track.”',question:'What do you do?',choices:['Tap the short link to see the package','Send the text to a colleague to test it','Check the delivery in the approved service and report the text'],correct:2,clue:'Use the service you already trust; do not enter work credentials from a text link.'},
 {kind:'VISHING',icon:'◉',title:'The voice on the line',lesson:'Vishing is phishing by phone. Caller ID can be spoofed. Real support staff do not need your password, one-time code or MFA approval.',message:'Caller: “IT security here. Read me the six-digit code so I can stop an account lockout.”',question:'What is the safe reply?',choices:['Read the code because it is IT','Hang up, report it, and call IT using the known number','Approve the MFA prompt instead'],correct:1,clue:'Never share a code or approve an unexpected prompt, even when the caller sounds official.'},
 {kind:'QR / URGENCY',icon:'▦',title:'The hidden destination',lesson:'QR codes can hide a fake sign-in address. A poster or document saying “scan now or lose access” is still an unverified link.',message:'A QR sticker near the office printer says: “Mandatory security update. Scan and log in before 5 PM.”',question:'What should you do?',choices:['Scan it because it is inside the office','Ask everyone on your team to scan it','Use the official IT portal and report the suspicious sticker'],correct:2,clue:'Physical placement does not make a QR code safe. Check through the official portal.'}
];
const LV=[
{n:1,name:'Data sorter',blurb:'Take your seat at the Innovatiview desk. Read each incoming file and place it in the Public, Internal or Confidential tray.',q:[['Can you send customer data to your personal email to work from home?',['Yes, if you delete it later','Only on weekends','No, use approved company tools','Yes, with a password in the subject'],2,'Company data stays in approved company systems.'],['A colleague you do not know chats you asking for the customer list for an urgent audit. What do you do first?',['Send it, audits are important','Verify who they are and whether they are authorised','Send half of it','Post it in the group chat'],1,'Confirm identity and need-to-know before sharing any confidential data.']]},
{n:2,name:'Phish or legit',blurb:'Investigate a fake login, flick scam messages away and clear a runner gate and escape a phishing maze. Then defend a 10-email inbox and finish with a six-question knowledge check.',q:ATTACK_BRIEFS.map(b=>[b.message+' '+b.question,b.choices,b.correct,b.clue])},
{n:3,name:'Firewall defender',blurb:'Arcade shooter. Blast weak passwords, malware and phishing links. Let the safe stuff through.',q:[['Which password is strongest?',['Innovati@2026','P@ssw0rd!','correct-horse-lamp-orbit-47','Alex1234'],2,'Long passphrases beat short clever ones.'],['What does multi-factor authentication (MFA) add?',['A second proof of identity beyond your password','Faster logins','A longer password','Nothing important'],0,'Even if a password leaks, the attacker still needs your second factor.']]},
{n:4,name:'Desk inspector',blurb:'Four case files: a cubicle, the reception desk, a meeting room and a home office. Close every case to finish the level.',q:[['You find an unlabeled USB drive. What do you do?',['Plug it in to find the owner','Hand it to IT security','Take it home','Leave it on a desk'],1,'Unknown drives can carry malware. IT can inspect them safely.'],['Someone follows you through a secure door without using a badge. You…',['Hold the door, it is polite','Politely challenge them and report it to security','Ignore it','Lend them your badge'],1,'Tailgating defeats door security. Challenge and report.']]},
{n:5,name:'Voice trap',blurb:'Take four phone calls. Spot the scammers, verify the genuine caller, and never give away a code.',q:[['A caller says they are from IT and asks for your one-time code. What do you do?',['Read it out, they are IT','Refuse, hang up and report it','Read half of it','Ask them to email you first'],1,'IT will never ask for your OTP. Hang up and report it.'],['Caller ID shows your bank’s real number, but the caller asks for your PIN. What do you do?',['Trust it, the number matches','Give the PIN and change it later','Hang up and call the number on your card','Ask for their employee ID and continue'],2,'Caller ID can be spoofed. Always call back on a number you trust.']]}];
EXTRA_LEVELS.forEach((entry,index)=>{const n=index+6;LV.push({n,name:entry.name,blurb:entry.blurb,q:entry.questions.map(q=>[q.prompt,q.options,q.correct,q.explanation]),meta:entry.meta});S.assign[n]=entry.game});
const BOTS=[['Meera K',620],['Dev Patel',540],['Sana R',480],['Jon M',410],['Lia T',350],['Omar S',280],['Tia B',190],['Raj N',120]];
const board=()=>[...BOTS,[esc(S.name||'You'),S.score,1]].sort((a,b)=>b[1]-a[1]);
const rank=()=>SERVER?(S.rank||'-'):board().findIndex(r=>r[2])+1;
const open=n=>n==1||S.done.includes(n)||S.done.includes(n-1);
const curLv=()=>LV.find(l=>!S.done.includes(l.n))||LV[LV.length-1];
const tier=()=>['Rookie','Scout','Guardian','Defender','Sentinel'][Math.min(S.done.length,4)];
const total=()=>Object.values(S.best).reduce((a,b)=>a+(+b||0),0);
function hdr(){if(S.view!=='play')dailyActive=false;
 const entry=document.body.dataset.entry==='login'&&(S.view==='welcome'||S.view==='login');
 $('#player-avatar').innerHTML=S.name&&!entry?`<button type="button" class="header-avatar-control" data-a="profile" aria-label="Open player profile" title="Your player profile">${hubAvatar(S.name,S.photo)}</button>`:'';
 document.body.dataset.view=S.view;$('#app').classList.toggle('platform-view',S.view!=='play');
 const tabs=[['games','PLAY Now'],['dash','Dashboard'],['road','Missions'],['top','Leaderboard'],['rew','Rewards']];if(ADMIN())tabs.push(['admin','Admin']);
 $('#nav').innerHTML='';
 const dock=$('#bottom-dock'),showDock=S.name&&!entry&&!['play','welcome','login','pwd','basics'].includes(S.view);
 dock.hidden=!showDock;if(showDock){dock.innerHTML=`<nav id="bottom-dock-panel" class="bottom-dock-panel" aria-label="Main pages" ${S.menuOpen?'':'hidden'}>${tabs.map(t=>`<button data-a="nav" data-v="${t[0]}" class="${S.view==t[0]?'on':''}" aria-current="${S.view==t[0]?'page':'false'}">${t[1]}</button>`).join('')}</nav><button class="bottom-dock-toggle" type="button" data-a="menu" aria-controls="bottom-dock-panel" aria-expanded="${S.menuOpen}" aria-label="${S.menuOpen?'Close':'Open'} options menu"><span class="dock-grid" aria-hidden="true">▦</span><span>OPTIONS</span><b>${S.menuOpen?'×':'⌃'}</b></button>`}
 $('#me').innerHTML=S.name&&!entry?`<b class="amb">RANK #${rank()} &nbsp; ${esc(S.name).toUpperCase()}</b><br>${fmt(S.score)} PTS // <span class="mint">LVL ${String(Math.min(LV.length,S.done.length+1)).padStart(2,'0')} ${tier().toUpperCase()}</span>`:'';
 $('#aud').innerHTML=`<button data-a="fx" aria-pressed="${SFX.s.sfx}" aria-label="Sound effects">SFX ${SFX.s.sfx?'ON':'OFF'}</button><button data-a="mus" aria-pressed="${SFX.s.music}" aria-label="Background music">MUSIC ${SFX.s.music?'ON':'OFF'}</button>`;
 dailyPaint();save()}
function toast(t,c){const e=$('#toast');e.textContent=t;e.style.color=c;e.style.borderColor=c;e.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display='none',1400)}
/* score model: each level keeps its best score; the total is the sum of the bests (replays cannot inflate it) */
function add(n,label){if(S.view!=='play'||!dailyAllow())return;S.lp=Math.max(0,S.lp+n);S.score=S.base+Math.max(S.best[S.cur]||0,S.lp);hdr();toast((n>0?'+':'−')+Math.abs(n)+(label?' '+label:''),n>0?'#10b981':'#ef4444')}
const V={
games(){lobbyGames()},
dash(){lobbyDashboard()},
road(){const P=[[300,480],[130,375],[340,270],[140,160],[330,60]],s=LV[S.sel-1],c=curLv().n;
 $('#app').innerHTML=`<div class="split"><div class="map"><svg viewBox="0 0 520 560"><polyline points="${P.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#ffb800" stroke-width="10" stroke-dasharray="14 8" opacity=".55"/></svg>
 ${P.map((p,i)=>{const n=i+1,st=S.done.includes(n)?'done':n==c?'cur':'';return (n==c?`<div class="you" style="left:${p[0]/5.2}%;top:${p[1]/5.6}%">YOU</div>`:'')+`<button class="node ${st} ${n==S.sel?'sel':''}" data-a="sel" data-v="${n}" style="left:${p[0]/5.2}%;top:${p[1]/5.6}%" aria-label="Level ${n}">${st=='done'?'✓':open(n)?n:'🔒'}</button>`}).join('')}</div>
 <div class="panel"><div class="cart-h"><span class="lbl">Level 0${s.n}</span><span class="chip"><i class="led ${S.done.includes(s.n)?'g':open(s.n)?'':'r'}"></i>${S.done.includes(s.n)?'Cleared':open(s.n)?'Open':'Locked'}</span></div>
 <h2>${s.name}</h2><p class="mut">${s.blurb}</p><p class="lbl">Game module: ${GAMES[S.assign[s.n]].title}</p>
 <button class="btn" data-a="play" data-v="${s.n}" ${open(s.n)?'':'disabled'}>${S.done.includes(s.n)?'Play again':'Play game'}</button>
 ${open(s.n)?'':'<p class="mut">Clear level '+(s.n-1)+' to unlock.</p>'}</div></div>`},
top(){$('#app').innerHTML=`<div class="panel"><div class="cart-h"><span class="lbl">Daily high scores</span><span class="lbl">Demo board with sample players</span></div><table><tr class="lbl"><th>#</th><th>Operator</th><th>Points today</th></tr>
 ${board().map((r,i)=>`<tr class="${r[2]?'me2':''}"><td>${r[2]?'&gt; ':''}${i+1}</td><td>${r[0]}${r[2]?' (you)':''}</td><td>${fmt(r[1])}</td></tr>`).join('')}</table></div>`},
admin(){$('#app').innerHTML=`<div class="panel"><div class="cart-h"><span class="lbl">Admin // game registry</span><span class="chip"><i class="led"></i>Prototype</span></div>
 <p class="mut">Each level plays one registered game. Admins add new games without touching the engine.</p>
 <table><tr class="lbl"><th>Level</th><th>Name</th><th>Game module</th></tr>${LV.map(l=>`<tr><td>${l.n}</td><td>${l.name}</td><td><select data-a="asg" data-v="${l.n}" style="background:#0b0c0e;color:#f8fafc;border:1px solid #323542;padding:6px">${Object.entries(GAMES).map(([k,g])=>`<option value="${k}" ${S.assign[l.n]==k?'selected':''}>${g.title}</option>`).join('')}</select></td></tr>`).join('')}</table></div>
 <div class="split"><div class="panel"><h3>Register a game</h3><p class="mut">Adds a placeholder module to the registry.</p><input id="gn" placeholder="Game title" style="width:100%;padding:10px;background:#0b0c0e;color:#f8fafc;border:1px solid #323542;font:inherit"><br><br><button class="btn" data-a="reg">Add game</button></div>
 <div class="panel"><h3>Game contract</h3><pre class="inset" style="overflow:auto;margin:10px 0">{ id, title,
  mount(el, ctx) }
// ctx.add(points, label)
// ctx.done()  -&gt; quiz</pre><button class="btn sub" data-a="unlock">Unlock all levels</button> <button class="btn red" data-a="reset">Reset demo</button></div></div>
 <div class="panel"><div class="cart-h"><span class="lbl">Rewards catalog</span><span class="chip"><i class="led"></i>Prototype</span></div><p class="mut">Set the score each reward needs. Players must also clear all 5 levels.</p><table><tr class="lbl"><th>Reward</th><th>Required score</th></tr>${REW.map(r=>`<tr><td>${r.name}</td><td><input type="number" min="0" step="100" value="${r.req}" data-a="req" data-v="${r.id}" style="width:110px;padding:6px;background:#0b0c0e;color:#f8fafc;border:1px solid #323542;font:inherit"></td></tr>`).join('')}</table><br><button class="btn sub" data-a="demo">Demo: clear all levels + 3,600 pts</button></div>`}};
/* ---------- game engine ---------- */
const GAMES={sorter:{title:'Data sorter',mount:sorter},voice:{title:'Voice trap',mount:voice},desk:{title:'Desk inspector',mount:desk},shoot:{title:'Firewall defender',mount:shoot},phish:{title:'Phish or legit',mount(el,ctx){S.cur===2?phishCampaign(el,ctx):phish(el,ctx)}},stub:{title:'Placeholder round',mount(el,ctx){el.innerHTML=`<div class="panel"><div class="cart-h"><span class="lbl">Module not installed</span></div><p>This level's game gets built in the next phase.</p><button class="btn" id="go">Run placeholder round</button></div>`;$('#go').onclick=()=>{ctx.add(50,'bonus');ctx.done()}}}};
const ctx={add,done:()=>{S.gameLp=S.lp;quiz(0,0)}};
let firewallNative=false;
function enterFirewallScreen(){document.body.classList.add('firewall-immersive');if(innerWidth<=600&&innerHeight>innerWidth)return;try{if(document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().then(()=>{if(document.body.classList.contains('firewall-immersive'))firewallNative=true;else document.exitFullscreen().catch(()=>{})}).catch(()=>{})}catch(e){}}
function leaveFirewallScreen(){const wasImmersive=document.body.classList.contains('firewall-immersive');document.body.classList.remove('firewall-immersive');firewallNative=false;if(wasImmersive&&document.fullscreenElement===document.documentElement)document.exitFullscreen().catch(()=>{})}
document.addEventListener('fullscreenchange',()=>{if(document.fullscreenElement===document.documentElement){firewallNative=true;return}if(firewallNative&&document.body.classList.contains('firewall-immersive')){firewallNative=false;act.nav('games')}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('firewall-immersive')){e.preventDefault();act.nav('games')}});
function stage(t){S.view='play';hdr();const l=LV[S.cur-1],firewall=t==='Game'&&S.assign[S.cur]==='shoot';$('#app').innerHTML=`<div class="${firewall?'firewall-stagebar':''}" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><div><div class="lbl">Level ${l.n} // ${t}</div><h2>${l.name}</h2></div>${firewall?`<span class="firewall-session">TODAY <b data-daily-time>${dailyText()}</b></span>`:''}<button class="btn sub${firewall?' firewall-exit':''}" data-a="nav" data-v="${firewall?'games':'road'}">Exit</button></div><div id="stage"></div>`;window.scrollTo(0,0);return $('#stage')}
async function play(n){if(!basicsComplete()){S.view='basics';render();return}if(!dailyAllow()||!open(n))return;dailyActive=S.assign[n]!=='shoot';dailyLast=Date.now();if(SERVER){try{S.att=(await api('/levels/'+n+'/start','POST')).attemptId}catch(e){dailyActive=false;toast(e.message,'#ef4444');return}}S.cur=n;S.lp=0;S.combo=0;S.base=total()-(S.best[n]||0);S.score=total();S.lastResult=null;GAMES[S.assign[n]].mount(stage('Game'),ctx)}
function quiz(i,ok){if(!dailyAllow())return;const l=LV[S.cur-1],el=stage('Quiz '+(i+1)+'/'+l.q.length);
 if(i>=l.q.length)return result(ok);
 const q=l.q[i];el.innerHTML=`<div class="panel"><h3 style="text-transform:none;line-height:1.5">${q[0]}</h3>${q[1].map((o,k)=>`<button class="btn sub opt" data-a="ans" data-v="${k}">${o}</button>`).join('')}<div id="qf"></div></div>`;
 el.onclick=async e=>{const b=e.target.closest('[data-a=ans]');if(!b||el.dataset.l)return;el.dataset.l=1;let ans=q[2],why=q[3],r=+b.dataset.v==q[2],dl=r?50:-25;
  if(SERVER){try{const s=await api('/attempts/'+S.att+'/answer','POST',{q:i,a:+b.dataset.v});ans=s.answer;why=s.why;r=s.correct;dl=s.delta}catch(x){el.dataset.l='';toast(x.message,'#ef4444');return}}
  SFX[r?'ok':'bad']();if(dl)add(dl,r?'quiz':'wrong');
  el.querySelectorAll('.opt').forEach((o,k)=>{if(k==ans)o.style.borderColor='#10b981';else if(o==b)o.style.borderColor='#ef4444'});
  $('#qf').innerHTML=`<div class="fb"><b class="${r?'mint':'red'}">${r?'Correct. +50':'Wrong. −25'}</b><br>${why}</div><br><button class="btn" id="nx">${i+1<l.q.length?'Next question':'See results'}</button>`;$('#nx').onclick=()=>{el.onclick=null;quiz(i+1,ok+r)}}}
function result(ok){if(!SERVER)return result0(ok);const el=stage('Saving');el.innerHTML='<div class="panel"><p class="mut">Saving your score…</p></div>';
 api('/attempts/'+S.att+'/finish','POST',{gameScore:S.gameLp||0}).then(r=>{S.best=r.best;S.done=r.cleared;S.score=r.total;S.rank=r.rank;result0(ok,r)}).catch(e=>{el.innerHTML=`<div class="panel"><h3 class="red">Could not save your score</h3><p class="mut">${esc(e.message)}</p><button class="btn" id="rt">Try again</button> <button class="btn sub" data-a="nav" data-v="road">Roadmap</button></div>`;$('#rt').onclick=()=>result(ok)})}
function result0(ok,r){if(!dailyAllow())return;dailyActive=false;const l=LV[S.cur-1],pts=r?r.score:S.lp;if(!r){if(!S.done.includes(l.n))S.done.push(l.n);S.best[l.n]=Math.max(S.best[l.n]||0,S.lp);S.score=total()}S.lastResult={level:l.n,points:pts,correct:ok,total:l.q.length};S.sel=Math.min(l.n+1,LV.length);S.menuOpen=false;S.view='road';SFX.win();render()}
/* ---------- level 2: social engineering lab and phishing inbox ---------- */
const ic=(p,s=24)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="${p}"/></svg>`;
const IC={menu:'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',search:'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
tune:'M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z',
help:'M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z',
gear:'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
pen:'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
inbox:'M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10z',
star:'M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z',
snooze:'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
send:'M4.01 6.03l7.51 3.22-7.52-1 .01-2.22m7.5 8.72L4 17.97v-2.22l7.51-1M2.01 3L2 10l15 2-15 2 .01 7L23 12 2.01 3z',
file:'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z',
bag:'M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2h2V8h4v2h2V8h2v12z',
more:'M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z',tag:'M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z',
ppl:'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
info:'M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
refresh:'M17.65 6.35A7.96 7.96 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
dots:'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
l:'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z',r:'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',back:'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
warn:'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',ok:'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z',plus:'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
apps:'M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z'};
const LOGO='<svg width="40" height="30" viewBox="52 42 88 66"><path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6"/><path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15"/><path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2"/><path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92"/><path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2"/></svg>';
function phish(el,ctx){
 /* [sender, address, subject, isPhish, body, link text, link url, attachment, explanation, date] */
 const F='<div class="foot">This email and any attachments are confidential and intended only for the named recipient. If you have received it in error, please notify the sender and delete it.</div>',
 SG=(n,t,x)=>'<div class="sig">Regards,<br><b>'+n+'</b><br>'+t+'<br>Innovatiview Technologies Pvt. Ltd.<br>Ext. '+x+'</div>';
 const E=[
 ['HR Team','hr@innovatiview.com','Holiday calendar 2026 published on the intranet',0,'<p>Dear all,</p><p>Please find the official holiday calendar for 2026 on the intranet. It lists the 12 company holidays and the optional holidays, which can be chosen on a first-come basis through the HR portal.</p><p>You can view and download the calendar here: {L}</p><p>If you have any questions, please write to us or speak to your HR business partner.</p>'+SG('Neha Kapoor','HR Business Partner | People &amp; Culture','4012')+F,'Holiday calendar 2026','innovatiview.com/hr/calendar',0,'Exact company domain, a named sender with title and extension, a normal request and a link that stays on innovatiview.com.','3:18 AM'],
 ['IT Helpdesk','it-support@innovatiview.co','ACTION REQUIRED: Your password expires in 24 hours',1,'<p>Dear User,</p><p>Our system has detected that your email password will expire in <b>24 hours</b>. To avoid losing access to your mailbox, calendar and files, you must verify your account immediately.</p><p>{L}</p><p>Failure to do so will result in permanent suspension of your account.</p><p>Thank you for your cooperation.</p><div class="sig">IT Support Team<br>Innovatiview</div>','Keep my password','innovatiview-login.co/reset',0,'The sender ends in .co, not .com. It uses a generic "Dear User", has no named sender or extension, threatens suspension and links to an off-domain login page.','Sep 30'],
 ['Rahul Mehta','rahul.mehta.ceo@gmail.com','Quick favour (confidential)',1,'<p>Hi Alex,</p><p>Are you available right now? I am in a client meeting and cannot take calls. I need a quick favour that must stay between us.</p><p>I need to purchase 5 gift cards (₹10,000 each) for a client delivery today. Please buy them from an online store and send me the card codes by reply. I will reimburse you by end of day.</p><p>Please keep this confidential and let me know as soon as it is done.</p><p>Regards,<br>Rahul Mehta<br><span style="color:#80868b">Sent from my iPhone</span></p>','','',0,'Executives do not use personal Gmail addresses for company requests. Secrecy, urgency, "no calls" and gift cards are classic CEO fraud.','Sep 30'],
 ['Payroll','payroll@innovatiview.com','Your payslip for September 2026 is now available',0,'<p>Dear Alex,</p><p>Your payslip for the month of September 2026 has been generated and is available in the payroll portal (company SSO login). Salary will be credited as per the usual schedule.</p><p>To view or download it, please open the portal here: {L}</p><p>For any payroll queries, please raise a ticket with the Finance Helpdesk within 5 working days.</p>'+SG('Payroll Operations','Finance','4230')+F,'Payroll portal','portal.innovatiview.com/payslip',0,'Exact domain, you are addressed by name, and the link goes to a portal.innovatiview.com sub-domain. Even so, you can always open the portal yourself.','Sep 30'],
 ['Accounts','accounts@innovatlview.com','Invoice 4471 – Overdue payment reminder',1,'<p>Hello,</p><p>This is a reminder that invoice <b>#4471</b> dated 12 September 2026 for ₹2,48,500 is now <b>overdue</b>. Please review the attached invoice and approve the payment today to avoid penalty charges.</p><p>Kindly confirm once the payment has been released.</p><p>Regards,<br>Accounts Department<br>Innovatiview</p>','','','invoice_4471.html','Look closely: "innovatlview" uses an l instead of an i. It also has a vague "Hello", no named contact, pressure to pay today and an unexpected .html attachment.','Sep 29'],
 ['Microsoft 365','no-reply@micros0ft-support.com','Microsoft account: unusual sign-in activity',1,'<p><b style="font-size:18px">Microsoft account</b></p><p><b>Unusual sign-in activity</b></p><p>We detected something unusual about a recent sign-in to the Microsoft account alex.carter@innovatiview.com.</p><p>Sign-in details:<br>Country/region: Russia<br>IP address: 203.0.113.45<br>Date: 28 Sep 2026, 11:42 PM</p><p>Please verify your account immediately: {L}</p><p>If you do not verify within 12 hours, your account will be suspended.</p><p>Thanks,<br>The Microsoft account team</p>','Verify account','micros0ft-support.com/verify',0,'"micros0ft" uses a zero instead of an o. The email copies the Microsoft style but adds a 12-hour suspension threat to rush you.','Sep 28'],
 ['IT Security','security@innovatiview.com','Reminder: Annual security awareness training due by 15 October',0,'<p>Dear colleagues,</p><p>This is a reminder that the annual Information Security Awareness training must be completed by <b>15 October 2026</b>. The course takes about 30 minutes and is mandatory for all employees.</p><p>You can access the course in the learning portal with your company SSO: {L}</p><p>Please remember that IT Security will never ask for your password over email or phone.</p><p>Thank you for helping keep Innovatiview safe.</p>'+SG('Karan Malhotra','Information Security Officer','4001')+F,'Learning portal','learn.innovatiview.com',0,'Exact domain, a named officer, a reasonable deadline, no threats, and the link stays on a innovatiview.com sub-domain.','Sep 27'],
 ['Facilities','facilities@innovatiview.com','Fire evacuation drill: Thursday, 11:00 AM',0,'<p>Dear all,</p><p>A scheduled fire evacuation drill will be held on <b>Thursday, 8 October at 11:00 AM</b>. When the alarm sounds, please:</p><ol><li>Stop work and lock your laptop screen.</li><li>Use the nearest stairwell. Do not use the lifts.</li><li>Assemble at the main car park and wait for your floor warden.</li></ol><p>The drill should take around 20 minutes. Thank you for your cooperation.</p>'+SG('Mohit Arora','Facilities Manager','4300')+F,'','',0,'A routine notice from the right domain with a named sender and nothing to click.','Sep 27'],
 ['Sneha Rao','sneha.rao@innovatiview.com.hr-portal.net','Updated leave policy: acknowledgement required',1,'<p>Hi Alex,</p><p>HR has updated the leave policy effective 1 October. All employees must read and sign the attached policy document today. Please open the attachment and sign in with your company email and password to acknowledge it.</p><p>Employees who have not acknowledged by end of day will have their leave applications blocked.</p><p>Thanks,<br>Sneha Rao<br>HR Operations</p>','','','leave_policy.pdf.exe','Read the domain from the right: it is hr-portal.net, and innovatiview.com is only a decoy prefix. A .pdf.exe file is a program, and the email asks for your password and threatens you.','Sep 26'],
 ['Google','no-reply@accounts.google.com','Security alert',0,'<p><b style="font-size:18px">A new sign-in on Windows</b></p><p>alex.carter@innovatiview.com</p><p>We noticed a new sign-in to your Google Account on a Windows device. If this was you, you do not need to do anything. If not, we will help you secure your account.</p><p>{L}</p><p style="color:#80868b;font-size:12px">You can also see security activity at myaccount.google.com/notifications.<br>You received this email to let you know about important changes to your Google Account and services.<br>© 2026 Google LLC</p>','Check activity','myaccount.google.com/notifications',0,'The genuine google.com domain and no demand or threat. Even so, the safest habit is to check your account by visiting it yourself.','Sep 26']];
 const snp=e=>e[4].replace(/<[^>]+>/g,' ').replace('{L}',e[5]).replace(/\s+/g,' ').trim();
 const bdy=m=>m[4].replace('{L}',m[5]?`<button type="button" class="mail-link" data-l="${m[6]}" title="https://${m[6]}">${m[5]}</button>`:''),dom=a=>a.split('@')[1];
 const pf=(S.name||'Alex').split(' ')[0],pm=((S.name||'alex carter').toLowerCase().replace(/[^a-z ]/g,'').trim().replace(/\s+/g,'.')||'user')+'@innovatiview.com';
 E.forEach(e=>e.forEach((v,i)=>{if(typeof v=='string')e[i]=v.replace(/alex\.carter@innovatiview\.com/g,pm).replace(/\bAlex\b/g,esc(pf))}));
 const A={},seen={},earned={};let sel=-1,combo=0,bestCombo=0,det=0,finished=false;
 const n=()=>Object.keys(A).length,correct=()=>E.filter((m,i)=>A[i]===m[3]).length,un=()=>E.length-Object.keys(seen).length;
 const nav=[['inbox','Inbox',1],['star','Starred'],['snooze','Snoozed'],['send','Sent'],['file','Drafts'],['bag','Purchases'],['more','More']];
 const rail=`<div class="rr"><svg width="24" height="24" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill="#1a73e8"/><text x="12" y="16.5" font-size="10" text-anchor="middle" fill="#fff" font-family="Arial">31</text></svg><svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="9" r="6" fill="#fbbc04"/><rect x="9" y="15" width="6" height="5" fill="#fbbc04"/></svg><svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1a73e8"/><path d="M7 12l3 3 7-7" stroke="#fff" stroke-width="2" fill="none"/></svg><svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="#1a73e8"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6z" fill="#1a73e8"/></svg>${ic(IC.plus)}</div>`;
 const top=`<div class="gt"><div class="ib">${ic(IC.menu)}</div><div class="logo">${LOGO}Gmail</div><div class="srch">${ic(IC.search)}<span>Search mail</span>${ic(IC.tune)}</div><div class="upg"><div class="ib">${ic(IC.help)}</div><div class="ib">${ic(IC.gear)}</div><b>Upgrade</b><div class="ib">${ic(IC.apps)}</div><div class="av">A</div></div></div>`;
 const side=()=>`<div class="sb"><div class="cmp">${ic(IC.pen)}Compose</div>${nav.map(x=>`<div class="ni ${x[2]?'a':''}">${ic(IC[x[0]],20)}${x[1]}${x[2]&&un()?'<em>'+un()+'</em>':''}</div>`).join('')}<div class="lab">Labels ${ic(IC.plus,20)}</div></div>`;
 function list(){return `<div class="tb"><div class="cb"></div>${ic(IC.more,18)}<div class="ib">${ic(IC.refresh,20)}</div><div class="ib">${ic(IC.dots,20)}</div><span class="sp">1–${E.length} of ${E.length}</span>${ic(IC.l)}${ic(IC.r)}</div>
  <div class="tabs"><div class="tab a">${ic(IC.inbox,20)}Primary</div><div class="tab">${ic(IC.tag,20)}Promotions</div><div class="tab">${ic(IC.ppl,20)}Social</div><div class="tab">${ic(IC.info,20)}Updates</div></div>
  ${E.map((e,i)=>`<div class="rw ${seen[i]?'rd':''}" data-m="${i}" tabindex="0" role="button"><div class="cb"></div>${ic(IC.star,20)}<div class="sn">${e[0]}</div><div class="ms">${A[i]!=null?`<span class="lb ${e[3]?'p':'l'}">${e[3]?'Phishing':'Legit'}</span>`:''}<b>${e[2]}</b> - ${snp(e)}</div><div class="dt">${e[9]}</div>${e[7]?`<div class="br"></div><span class="ac"><i></i>${e[7]}</span>`:''}</div>`).join('')}`}
 function mail(){const m=E[sel],d=A[sel]!=null,ok=A[sel]==m[3];
  return `<div class="tb"><button type="button" class="ib gm-icon" data-back="1" aria-label="Back to inbox">${ic(IC.back)}</button><div class="ib">${ic(IC.dots,20)}</div><span class="sp">${sel+1} of ${E.length}</span></div>
  <div class="ev"><div class="subj" id="mail-title" tabindex="-1">${m[2]}<span>Inbox</span></div><div class="hd"><div class="av" style="background:#5f6368">${m[0][0]}</div><div class="ph"><b>${m[0]}</b> <small>&lt;${m[1]}&gt;</small><button type="button" class="sd gm-detail" data-d="1" aria-label="${det?'Hide':'Inspect'} sender address" aria-expanded="${!!det}">to me ▾</button>${det?`<div class="det">from: <b>${m[0]}</b> &lt;${m[1]}&gt;<br>to: ${pm}<br>date: ${m[9]}<br>mailed-by: ${dom(m[1])}<br>signed-by: ${dom(m[1])}</div>`:''}</div><small>${m[9]}</small></div>
  <div class="bd">${bdy(m)}${m[7]?`<span class="ac"><i></i>${m[7]}</span>`:''}</div>
  ${d?`<div class="fb mail-feedback ${ok?'':'wrong'}" id="mail-feedback" role="status" tabindex="-1"><b class="${ok?'mint':'red'}">${ok?'Correct. +'+earned[sel]:'Wrong. −50'}</b><br>This email is ${m[3]?'<b class="red">PHISHING</b>':'<b class="mint">LEGIT</b>'}. ${m[8]}</div>${n()<E.length?'<br><div style="padding-left:56px"><button class="btn sub" data-n="1">Next email</button></div>':''}`:`<div class="vd"><button type="button" class="pl rp" data-v="1">${ic(IC.warn,18).replace('<svg','<svg style="fill:#d93025"')}Report phishing</button><button type="button" class="pl sf" data-v="0">${ic(IC.ok,18).replace('<svg','<svg style="fill:#188038"')}Mark as safe</button></div>`}</div>`}
 function debrief(){const hits=correct(),missed=E.filter((m,i)=>A[i]!==m[3]);return `<section class="mail-debrief" id="mail-report" tabindex="-1"><span class="lbl">Mission complete // Inbox secured</span><h3 style="margin:12px 0">${hits===E.length?'Perfect detection':hits>=8?'Sharp-eyed defender':'Training complete'}</h3><p>You identified <b>${hits} of ${E.length}</b> emails correctly. Best streak: <b>${bestCombo}</b>. Mission score: <b>${fmt(S.lp)} points</b>.</p><p>Skill unlocked: inspect the sender, check the destination, and question the request. A familiar name or logo alone is never proof.</p>${missed.length?`<details><summary>Review ${missed.length} missed clue${missed.length===1?'':'s'}</summary><ul>${missed.map(m=>`<li><b>${m[2]}</b> — ${m[8]}</li>`).join('')}</ul></details>`:'<p class="mint">Clean sweep! Take those detective skills into the knowledge check.</p>'}<button class="btn" id="fin">Continue to quiz &gt;</button></section>`}
 function draw(focus){el.innerHTML=`<div class="hint"><span class="lbl">Open each email. Report phishing or mark safe. Company domain: <b class="amb">innovatiview.com</b></span><span class="lbl">${n()}/${E.length} sorted ${combo>1?'// combo x'+combo:''} ${n()==E.length?'<button class="btn" data-review="1" style="margin-left:12px">Review results</button>':''}</span></div>
  <div class="gm">${top}<div class="gb">${side()}<div class="mp">${sel<0?list():mail()}</div>${rail}</div><div class="status" id="st" role="status"></div></div>${n()===E.length?debrief():''}`;if(focus){const target=el.querySelector(focus);if(target)target.focus()}}
 const go=t=>{const r=t.closest('[data-m]');if(r){sel=+r.dataset.m;seen[sel]=1;det=0;draw('#mail-title');return 1}};
 el.onclick=e=>{const t=e.target;
  if(t.closest('#fin')){if(n()!==E.length||finished)return;finished=true;return ctx.done()}
  if(t.closest('[data-review]')){const report=el.querySelector('#mail-report');if(report){report.focus();report.scrollIntoView({block:'center'})}return}
  if(t.closest('[data-n]')){sel=E.findIndex((_,i)=>A[i]==null);det=0;if(sel>=0)seen[sel]=1;return draw('#mail-title')}
  const v=t.closest('[data-v]');if(v&&sel>=0&&A[sel]==null){const r=+v.dataset.v===E[sel][3];A[sel]=+v.dataset.v;combo=r?combo+1:0;bestCombo=Math.max(bestCombo,combo);earned[sel]=r?100+25*Math.min(combo-1,4):-50;SFX[r?'ok':'bad']();ctx.add(earned[sel],r?(combo>1?'streak '+combo:'good detection'):'clue missed');return draw('#mail-feedback')}
  if(t.closest('[data-l]'))return toast('Training link — inspect the destination, never open it.','#ffb800');
  if(t.closest('[data-d]')){det=!det;return draw('[data-d]')}
  if(t.closest('[data-back]')){sel=-1;return draw('[data-m]')}
  go(t)};
 el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){const row=e.target.closest('[data-m]');if(row){e.preventDefault();go(row)}}};
 const previewLink=e=>{const link=e.target.closest('[data-l]'),status=el.querySelector('#st');if(status)status.textContent=link?'https://'+link.dataset.l:''};
 el.onmouseover=previewLink;el.onfocusin=previewLink;
 el.onmouseout=el.onfocusout=()=>{const status=el.querySelector('#st');if(status)status.textContent=''};
 draw()}
/* ---------- level 3: firewall defender (shooter) ---------- */
function firewallTutorial(){return `<div class="firewall-tutorial"><div class="firewall-tutorial-copy"><div class="lbl mint">LEVEL 03 · QUICK BRIEFING</div><h2>DEFEND THE NETWORK.</h2><p class="firewall-ship-intro">The violet spaceship is yours.</p><div class="firewall-quick-rules"><p><b>SHOOT</b> Viruses, fake or unknown requests, weak passwords, public files, and OFF protections.</p><p><b>LET PASS</b> ON protections, locked or private files, verified checks, and backups.</p></div><p class="firewall-label-tip">Sharp warning cards: shoot. Rounded check cards: let pass. Read the labels too.</p><div class="firewall-controls"><span><b>PHONE</b> Drag to move · tap to fire</span><span><b>KEYBOARD</b> ← → to move · Space to fire</span></div><button class="btn" id="st0">START GAME →</button><small>45-second round · Your daily timer starts when you begin.</small></div><div class="firewall-demo" role="img" aria-label="Violet defender ship firing toward an angry virus while a trusted packet passes safely"><svg viewBox="0 0 380 250" aria-hidden="true"><defs><linearGradient id="fw-demo-bg" x2="0" y2="1"><stop stop-color="#21182f"/><stop offset="1" stop-color="#0b1925"/></linearGradient><linearGradient id="fw-demo-ship" x2="0" y2="1"><stop stop-color="#c6a5f5"/><stop offset="1" stop-color="#604185"/></linearGradient></defs><rect width="380" height="250" fill="url(#fw-demo-bg)"/><g stroke="#926dc52a" stroke-width="1"><path d="M0 45h380M0 90h380M0 135h380M0 180h380M55 0v250M130 0v250M205 0v250M280 0v250M355 0v250"/></g><path d="M0 209h380" stroke="#baf263" stroke-width="3" stroke-dasharray="9 6"/><path d="M190 179v-78" stroke="#dfffad" stroke-width="5" stroke-linecap="round"/><path d="M190 80l-6 16h12z" fill="#e8ffd0"/><g transform="translate(190 198)"><path d="M0-34 12-12 30 12 27 20 9 10 0 18-9 10-27 20-30 12-12-12z" fill="url(#fw-demo-ship)" stroke="#dfc7ff" stroke-width="3"/><ellipse cy="-9" rx="5" ry="12" fill="#baf263"/><path d="M-11 15-7 29 0 17 7 29 11 15" fill="#baf263" opacity=".8"/></g><g transform="translate(190 53)" fill="#b05b94" stroke="#ffd0df" stroke-width="3"><path d="M0-27 9-19 23-22 21-8 30 0 21 8 23 22 9 19 0 27-9 19-23 22-21 8-30 0-21-8-23-22-9-19z"/><path d="m-14-7 9 4m19-4-9 4" stroke="#3f1737" stroke-width="4"/><path d="M-12 10q12-13 24 0" fill="none" stroke="#351026" stroke-width="4"/></g><g transform="translate(292 93)"><rect x="-51" y="-23" width="102" height="46" rx="12" fill="#20383e" stroke="#87e4d0" stroke-width="2"/><circle cx="-30" cy="0" r="12" fill="none" stroke="#87e4d0" stroke-width="2"/><path d="m-36 0 5 5 8-10" fill="none" stroke="#87e4d0" stroke-width="2"/><path d="M-11 0h44" stroke="#d8f8f2" stroke-width="3"/></g></svg><span class="firewall-demo-label ship">YOUR SHIP</span><span class="firewall-demo-label virus">SHOOT THREATS</span><span class="firewall-demo-label safe">LET SAFE PASS</span></div></div>`}
function shoot(el,ctx){
 let W=800,H=450,portrait=false;
 const TH=[
  ['Weak: 123456','weak password','credential'],['Weak: password1','weak password','credential'],['Weak: qwerty','weak password','credential'],['Weak: admin123','weak password','credential'],
  ['Reused password','reused password','credential'],['Shared password','shared account','credential'],['Leaked password','exposed password','credential'],['Screen unlocked','unlocked device','credential'],
  ['Unknown short link','suspicious short link','phish'],['Fake login page','fake sign-in page','phish'],['Fake payroll mail','payroll phishing','phish'],['Gift card scam','gift card scam','phish'],
  ['Code theft request','code theft','phish'],['Unknown MFA prompt','unexpected MFA prompt','phish'],['Unknown reset link','unexpected reset link','phish'],['Unknown QR sign-in','unknown QR sign-in','phish'],
  ['Fake bank request','impersonation','phish'],['Fake helpdesk call','support scam','phish'],['Unknown ID request','identity data request','phish'],['Fake website copy','lookalike website','phish'],
  ['Fake delivery text','delivery scam','phish'],['Fake lockout text','scare tactic','phish'],['Unknown doc link','unexpected share invite','phish'],['Unknown remote app','unsolicited remote access','phish'],
  ['Virus gift.exe','malware','virus'],['Worm virus','malware','virus'],['Virus invoice.exe','malware attachment','virus'],['Virus photo.scr','malware screensaver','virus'],
  ['Virus crack.exe','untrusted software','virus'],['Virus resume.exe','malware attachment','virus'],['Unknown USB.exe','untrusted USB file','virus'],['Trojan virus','malware','virus'],
  ['Public HR file','overshared file','risk'],['Antivirus OFF','disabled protection','risk'],['Updates OFF','unpatched device','risk'],['Public payroll','sensitive data leak','risk']
 ],
 OK=[
  ['MFA ON','MFA'],['Updates ON','updates'],['Backup ready','backups'],['Strong password','strong passphrase'],['VPN ON','VPN'],['Passkey ON','passkey'],
  ['Unique password','unique password'],['Screen locked','screen lock'],['Files encrypted','encryption'],['Phish reported','reporting'],['Unknown MFA denied','MFA denied'],['Sender verified','sender verification'],
  ['Full URL checked','URL check'],['Known number called','callback verification'],['Private file share','limited sharing'],['Access limited','least privilege'],['Auto-updates ON','auto updates'],
  ['Backup tested','tested backup'],['Approved app','approved software'],['Unknown USB blocked','unknown USB avoided'],['Signed out','session safety'],['Attachment checked','attachment check'],
  ['Privacy screen ON','screen privacy'],['Trusted bookmark','trusted sign-in path']
 ];
 el.innerHTML=`<div class="firewall-shell"><div class="panel firewall-brief" id="gb"><div class="cart-h"><span class="lbl">Mission 03 // Network defense</span><span class="chip">45-second survival</span></div>${firewallTutorial()}</div><div class="firewall-arena" hidden><canvas id="cv" width="800" height="450" aria-label="Firewall Defender arena. Read the labels to decide which packets to shoot. Block viruses and risky traffic; let trusted traffic pass. Drag to aim and tap to fire on touchscreens; arrow keys move and Space fires on keyboard." tabindex="0" style="display:none;width:100%;margin:0 auto;touch-action:none;cursor:crosshair"></canvas><div class="firewall-arena-foot"><span>READ THE SIGNAL</span><span>BLOCK RISK · PASS TRUSTED</span><span>← → MOVE · SPACE FIRE</span><span class="firewall-touch-hint">DRAG TO AIM · TAP TO FIRE</span></div></div></div>`;
 const cv=$('#cv'),g=cv.getContext('2d'),gb=$('#gb'),F='700 12px "JetBrains Mono",monospace',R=(a,b)=>a+Math.random()*(b-a);
 let ship=W/2,shipBank=0,priorShip=W/2,bul=[],it=[],pt=[],tx=[],rings=[],hp=100,t=45,sp=0,cd=0,combo=0,fl=0,fc='',kl=0,kr=0,run=0,last=0,bossed=0,k={k:0,s:0,f:0,m:0};
 function resizeArena(){
  const mobile=innerWidth<=600&&innerHeight>innerWidth,arena=el.querySelector('.firewall-arena'),foot=el.querySelector('.firewall-arena-foot'),stage=el.closest('#stage');
  const nextW=mobile?420:800,nextH=mobile?Math.max(420,Math.floor(nextW*(stage.clientHeight-foot.offsetHeight-4)/Math.max(1,arena.clientWidth))):450;
  if(nextW===W&&nextH===H)return;
  const sx=nextW/W,sy=nextH/H;ship*=sx;priorShip*=sx;
  bul.forEach(o=>{o.x*=sx;o.y*=sy});it.forEach(o=>{o.x*=sx;o.y*=sy;if(o.vx)o.vx*=sx});
  for(const list of [pt,tx,rings])list.forEach(o=>{o.x*=sx;o.y*=sy});
  W=nextW;H=nextH;portrait=mobile;cv.width=W;cv.height=H
 }
 const threatDeck=[],safeDeck=[],recent=[];
 function nextSignal(pool,deck){
  if(!deck.length)deck.push(...pool.map((_,i)=>i));
  const fresh=deck.filter(i=>!recent.includes(pool[i][0])),choices=fresh.length?fresh:deck;
  const id=choices[Math.floor(Math.random()*choices.length)];deck.splice(deck.indexOf(id),1);
  recent.push(pool[id][0]);if(recent.length>8)recent.shift();return pool[id]
 }
 const fire=()=>{if(run&&cd<=0){bul.push({x:ship,y:H-63});cd=.18;SFX.tone(880,.05,'square',.03,0,440)}};
 const boom=(x,y,c,n=12)=>{rings.push({x,y,r:5,l:.38,c});for(let i=0;i<n;i++)pt.push({x,y,vx:R(-140,140),vy:R(-140,140),l:.5,c})};
 const say=(x,y,s,c)=>tx.push({x,y,s,c,l:1});
 const px=e=>{const r=cv.getBoundingClientRect();return Math.max(34,Math.min(W-34,(e.clientX-r.left)*W/r.width))};
 cv.onpointermove=e=>{ship=px(e)};cv.onpointerdown=e=>{ship=px(e);fire()};
 const kd=e=>{if(!run)return;if(e.key=='ArrowLeft')kl=1;if(e.key=='ArrowRight')kr=1;if(e.key==' '){e.preventDefault();fire()}};
 const ku=e=>{if(e.key=='ArrowLeft')kl=0;if(e.key=='ArrowRight')kr=0};
 document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
 function spawn(){
  const bad=Math.random()<.62,e=bad?nextSignal(TH,threatDeck):nextSignal(OK,safeDeck),kind=bad?e[2]:'safe',virus=kind==='virus';
  // Angular warning frames distinguish threats; trusted traffic has a soft frame.
  // Labels and icons repeat the distinction without relying on color alone.
  const shape=virus?Math.floor(R(0,3)):bad?{credential:1,phish:2,risk:3}[kind]:0;
  g.font=`700 ${portrait?15:14}px "JetBrains Mono",monospace`;
  const w=virus?140:Math.max(shape===2?176:154,g.measureText(e[0]).width+72),h=virus?118:shape===2?60:shape===3?58:54;
  it.push({x:0,y:-h/2-12,w,h,v:R(40,58)+(45-t)*.65,bad,kind,l:e[0],tip:e[1],shape});
  const i=it[it.length-1];i.x=R(i.w/2+4,W-i.w/2-4)
 }
 function update(dt){
  t-=dt;cd-=dt;fl-=dt;ship=Math.max(34,Math.min(W-34,ship+(kr-kl)*500*dt));
  if(t<=12&&!bossed){bossed=1;it.push({boss:1,x:W/2,y:88,w:176,h:128,hp:6,vx:65,bad:1,kind:'virus',l:'RANSOMWARE',tip:'ransomware'});say(W/2,168,'RANSOMWARE INBOUND','#ff708d')}
  sp-=dt;if(sp<=0&&t>3){spawn();sp=Math.max(1.1,1.65-(45-t)*.012)}
  bul.forEach(b=>b.y-=520*(H/450)*dt);bul=bul.filter(b=>b.y>-10);
  it.forEach(i=>{if(i.boss){i.x+=i.vx*dt;if(i.x<i.w/2||i.x>W-i.w/2)i.vx*=-1;i.y+=(H-124)/12.5*dt}else i.y+=i.v*(H/450)*dt});
  bul.forEach(b=>it.forEach(i=>{if(b.dead||i.dead)return;if(Math.abs(b.x-i.x)<i.w/2&&Math.abs(b.y-i.y)<i.h/2+6){b.dead=1;
   if(i.boss){i.hp--;boom(b.x,b.y,'#ffb800',8);if(i.hp<=0){i.dead=1;k.k++;boom(i.x,i.y,'#baf263',36);ctx.add(100,'boss down');say(i.x,i.y,'RANSOMWARE STOPPED · BACK UP!','#baf263')}}
   else if(i.bad){i.dead=1;k.k++;combo++;boom(i.x,i.y,'#baf263',16);SFX.tone(520,.09,'square',.05,0,1040);ctx.add(20+5*Math.min(combo-1,4),combo>1?'combo x'+combo:'');say(i.x,i.y,i.kind==='virus'?'VIRUS QUARANTINED':i.tip.toUpperCase()+' BLOCKED','#baf263')}
   else{i.dead=1;k.f++;combo=0;boom(i.x,i.y,'#ef4444');fl=.2;fc='#ef4444';SFX.bad();ctx.add(-50,'friendly fire');say(i.x,i.y,'That was '+i.tip+'!','#ef4444')}}}));
  bul=bul.filter(b=>!b.dead);
  it.forEach(i=>{if(i.dead||i.y<H-36)return;i.dead=1;
   if(i.boss){hp=0;ctx.add(-100,'boss breach')}
   else if(i.bad){hp-=20;k.m++;combo=0;fl=.25;fc='#ef4444';SFX.bad();ctx.add(-25,'breach');say(i.x,H-50,i.tip+' got in','#ef4444')}
   else{k.s++;ctx.add(10,'secured');say(i.x,H-50,i.tip+' ok','#94a3b8')}});
  it=it.filter(i=>!i.dead);
  pt.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt});pt=pt.filter(p=>p.l>0);rings.forEach(r=>{r.r+=130*dt;r.l-=dt});rings=rings.filter(r=>r.l>0);tx.forEach(s=>{s.y-=24*dt;s.l-=dt});tx=tx.filter(s=>s.l>0);
  if(hp<=0||t<=0)end()}
 function virusGlyph(x,y,r,boss=false,shape=0){
  const phase=(45-t)*2.4+x*.012;
  g.save();g.translate(x,y);g.rotate(Math.sin(phase)*.08);g.shadowColor=boss?'#d95d9c':'#ff688a';g.shadowBlur=boss?30:19;
  g.fillStyle=boss?'#7b2346':'#9f3558';
  const spikes=boss||shape===0?12:shape===1?6:8;for(let n=0;n<spikes;n++){const a=n*Math.PI*2/spikes+phase*.11;g.beginPath();g.moveTo(Math.cos(a-.17)*r,Math.sin(a-.17)*r);g.lineTo(Math.cos(a)*(r+11),Math.sin(a)*(r+11));g.lineTo(Math.cos(a+.17)*r,Math.sin(a+.17)*r);g.closePath();g.fill()}
  const skin=g.createRadialGradient(-r*.4,-r*.5,2,0,0,r*1.2);skin.addColorStop(0,boss?'#f17697':'#ff9aab');skin.addColorStop(.55,boss?'#9f2b5c':'#c64a70');skin.addColorStop(1,boss?'#351a42':'#47192e');g.fillStyle=skin;g.beginPath();
  if(!boss&&shape===1){for(let n=0;n<6;n++){const a=n*Math.PI/3-Math.PI/2;n?g.lineTo(Math.cos(a)*r,Math.sin(a)*r):g.moveTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath()}
  else if(!boss&&shape===2){g.moveTo(-r,-r*.7);g.lineTo(-r*.55,-r);g.lineTo(r*.55,-r);g.lineTo(r,-r*.7);g.lineTo(r,r*.7);g.lineTo(r*.55,r);g.lineTo(-r*.55,r);g.lineTo(-r,r*.7);g.closePath()}
  else g.arc(0,0,r,0,Math.PI*2);
  g.fill();g.shadowBlur=0;g.strokeStyle=boss?'#f7a3bd':'#ffc3cf';g.lineWidth=2;g.stroke();
  g.strokeStyle='#421229';g.lineWidth=boss?5:3;g.lineCap='round';
  g.beginPath();g.moveTo(-r*.67,-r*.35);g.lineTo(-r*.1,-r*.12);g.moveTo(r*.67,-r*.35);g.lineTo(r*.1,-r*.12);g.stroke();
  g.fillStyle='#290d21';g.beginPath();g.moveTo(-r*.52,-r*.05);g.lineTo(-r*.12,r*.06);g.lineTo(-r*.48,r*.21);g.moveTo(r*.52,-r*.05);g.lineTo(r*.12,r*.06);g.lineTo(r*.48,r*.21);g.fill();
  g.fillStyle='#fff0ba';g.beginPath();g.arc(-r*.34,r*.06,boss?3:2,0,Math.PI*2);g.arc(r*.34,r*.06,boss?3:2,0,Math.PI*2);g.fill();
  g.fillStyle='#300d26';g.beginPath();g.moveTo(-r*.46,r*.43);g.quadraticCurveTo(0,r*.22,r*.46,r*.43);g.lineTo(r*.35,r*.72);g.lineTo(r*.18,r*.53);g.lineTo(0,r*.76);g.lineTo(-r*.18,r*.53);g.lineTo(-r*.35,r*.72);g.closePath();g.fill();
  g.strokeStyle='#ffd1dd';g.lineWidth=1.5;g.stroke();
  if(boss){g.strokeStyle='#ffb9d0';g.lineWidth=3;g.beginPath();g.moveTo(-r*.8,-r*.58);g.lineTo(-r*.53,-r*1.28);g.lineTo(-r*.17,-r*.79);g.moveTo(r*.8,-r*.58);g.lineTo(r*.53,-r*1.28);g.lineTo(r*.17,-r*.79);g.stroke()}
  g.restore()
 }
 function packet(i){
  // Shape, icon, and color reinforce the plain-language label.
  const left=i.x-i.w/2,right=left+i.w,top=i.y-i.h/2,bottom=i.y+i.h/2;
  const edge=i.bad?i.kind==='credential'?'#ffad8b':i.kind==='phish'?'#f596c7':'#f2c875':'#87e4d0';
  const fill=i.bad?i.kind==='risk'?'#3d302d':'#402638':'#20383e';
  g.save();g.shadowColor=edge;g.shadowBlur=12;g.fillStyle=fill;g.strokeStyle=edge;g.lineWidth=2;g.beginPath();
  if(i.shape===1){g.moveTo(left+14,top);g.lineTo(right-14,top);g.lineTo(right,top+14);g.lineTo(right,bottom-14);g.lineTo(right-14,bottom);g.lineTo(left+14,bottom);g.lineTo(left,bottom-14);g.lineTo(left,top+14);g.closePath()}
  else if(i.shape===2){g.moveTo(left+25,top);g.lineTo(right-25,top);g.lineTo(right,i.y);g.lineTo(right-25,bottom);g.lineTo(left+25,bottom);g.lineTo(left,i.y);g.closePath()}
  else if(i.shape===3){g.moveTo(left+9,top);g.lineTo(right-28,top);g.lineTo(right,top+18);g.lineTo(right-10,bottom-7);g.lineTo(right-28,bottom);g.lineTo(left+12,bottom);g.lineTo(left,bottom-12);g.lineTo(left,top+10);g.closePath()}
  else g.roundRect(left,top,i.w,i.h,10);
  g.fill();g.stroke();g.shadowBlur=0;
  g.strokeStyle=edge;g.globalAlpha=.55;g.beginPath();g.moveTo(left+40,top+8);g.lineTo(left+40,bottom-8);g.stroke();g.globalAlpha=1;
  g.strokeStyle=edge;g.lineWidth=2;g.beginPath();
  if(i.bad){g.moveTo(left+22,i.y-12);g.lineTo(left+33,i.y+10);g.lineTo(left+11,i.y+10);g.closePath();g.stroke();g.beginPath();g.moveTo(left+22,i.y-5);g.lineTo(left+22,i.y+2);g.stroke();g.fillStyle=edge;g.beginPath();g.arc(left+22,i.y+6,1.5,0,Math.PI*2);g.fill()}
  else{g.arc(left+22,i.y,12,0,Math.PI*2);g.stroke();g.beginPath();g.moveTo(left+16,i.y);g.lineTo(left+21,i.y+5);g.lineTo(left+29,i.y-5);g.stroke()}
  g.font=`700 ${portrait?15:14}px "JetBrains Mono",monospace`;g.textAlign='left';g.fillStyle='#faf7ff';g.fillText(i.l,left+51,i.y+1);g.restore()
 }
 function shipGlyph(){
  const drift=Math.max(-.22,Math.min(.22,(ship-priorShip)*.013+(kr-kl)*.08));shipBank+=(drift-shipBank)*.2;priorShip=ship;
  const flame=15+Math.sin(performance.now()*.03)*4;
  g.save();g.translate(ship,H-28);g.rotate(shipBank);
  const aura=g.createRadialGradient(0,6,3,0,6,43);aura.addColorStop(0,'#baf26377');aura.addColorStop(1,'#baf26300');g.fillStyle=aura;g.beginPath();g.arc(0,6,43,0,Math.PI*2);g.fill();
  for(const side of [-1,1]){const engine=g.createLinearGradient(0,11,0,31);engine.addColorStop(0,'#f5ffd4');engine.addColorStop(.42,'#baf263');engine.addColorStop(1,'#a065ef00');g.fillStyle=engine;g.beginPath();g.moveTo(side*8,12);g.lineTo(side*12,12+flame);g.lineTo(side*16,12);g.closePath();g.fill()}
  g.shadowColor='#ad82f2';g.shadowBlur=19;g.fillStyle='#392b58';g.strokeStyle='#c7a9f3';g.lineWidth=2;g.beginPath();g.moveTo(0,-31);g.lineTo(10,-15);g.lineTo(28,9);g.lineTo(30,18);g.lineTo(10,10);g.lineTo(0,17);g.lineTo(-10,10);g.lineTo(-30,18);g.lineTo(-28,9);g.lineTo(-10,-15);g.closePath();g.fill();g.stroke();g.shadowBlur=0;
  g.fillStyle='#7650aa';g.beginPath();g.moveTo(0,-27);g.lineTo(8,-10);g.lineTo(19,8);g.lineTo(8,4);g.lineTo(0,13);g.lineTo(-8,4);g.lineTo(-19,8);g.lineTo(-8,-10);g.closePath();g.fill();
  g.strokeStyle='#baf263';g.lineWidth=2;g.beginPath();g.moveTo(-25,11);g.lineTo(-14,7);g.moveTo(25,11);g.lineTo(14,7);g.stroke();
  g.fillStyle='#d5e5ff';g.beginPath();g.ellipse(0,-10,5,11,0,0,Math.PI*2);g.fill();g.fillStyle='#baf263';g.beginPath();g.ellipse(0,-11,3,7,0,0,Math.PI*2);g.fill();
  g.fillStyle='#e2c9ff';g.beginPath();g.arc(0,-28,2.5,0,Math.PI*2);g.fill();
  if(cd>.12){g.fillStyle='#edffd3';g.shadowColor='#baf263';g.shadowBlur=18;g.beginPath();g.arc(0,-37,5,0,Math.PI*2);g.fill()}
  g.restore()
 }
 function draw(){
  const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#171326');sky.addColorStop(.55,'#141429');sky.addColorStop(1,'#091824');g.fillStyle=sky;g.fillRect(0,0,W,H);
  g.strokeStyle='#aa88d220';g.lineWidth=1;for(let x=-W;x<W*2;x+=64){g.beginPath();g.moveTo(W/2+(x-W/2)*.28,0);g.lineTo(x,H);g.stroke()}for(let y=0;y<H;y+=46){const yy=(y+(45-t)*15)%H;g.beginPath();g.moveTo(0,yy);g.lineTo(W,yy);g.stroke()}
  for(let j=0;j<32;j++){g.fillStyle=j%4?'#bda6e856':'#baf263aa';g.fillRect((j*139)%W,(j*71+(45-t)*(j%3+1)*8)%H,2,2)}
  g.strokeStyle='#ad83ec24';g.lineWidth=2;for(let side=0;side<2;side++){const x=side?W-23:23;g.beginPath();g.moveTo(x,55);g.lineTo(x,H-105);g.lineTo(side?W-43:43,H-85);g.stroke();for(let y=85;y<H-85;y+=70){g.fillStyle='#ad83ec66';g.beginPath();g.arc(x,y,3,0,Math.PI*2);g.fill()}}
  const glow=g.createLinearGradient(0,H-95,0,H);glow.addColorStop(0,'#baf26300');glow.addColorStop(1,hp>40?'#baf26338':'#ff607344');g.fillStyle=glow;g.fillRect(0,H-95,W,95);
  const wave=t>30?'01':t>12?'02':'03';
  g.setLineDash([8,6]);g.strokeStyle=hp>40?'#baf263':'#ff708d';g.lineWidth=3;g.shadowColor=g.strokeStyle;g.shadowBlur=13;g.beginPath();g.moveTo(0,H-42);g.lineTo(W,H-42);g.stroke();g.shadowBlur=0;g.setLineDash([]);
  g.font=F;g.textAlign='center';g.textBaseline='middle';
  it.forEach(i=>{if(i.kind==='virus'){
   if(i.boss){g.strokeStyle='#ff799560';g.lineWidth=2;g.beginPath();g.arc(i.x,i.y,51+Math.sin((45-t)*5)*3,0,Math.PI*2);g.stroke()}virusGlyph(i.x,i.y,i.boss?39:27,!!i.boss,i.shape);
   g.fillStyle='#24152d';g.strokeStyle='#ff7794';g.lineWidth=2;g.beginPath();g.roundRect(i.x-(i.boss?73:70),i.y+(i.boss?43:35),i.boss?146:140,i.boss?20:24,6);g.fill();g.stroke();g.fillStyle='#ffe7ed';g.font=i.boss?'700 11px "JetBrains Mono",monospace':`700 ${portrait?13:12}px "JetBrains Mono",monospace`;g.fillText(i.l,i.x,i.y+(i.boss?53:47));g.font=F;
   if(i.boss){g.fillStyle='#4b2b43';g.fillRect(i.x-65,i.y+69,130,5);g.fillStyle='#ff708d';g.fillRect(i.x-65,i.y+69,130*i.hp/6,5)}
  }else packet(i)});
  g.shadowColor='#baf263';g.shadowBlur=15;g.fillStyle='#e5ffae';bul.forEach(b=>{g.beginPath();g.roundRect(b.x-3,b.y-13,6,21,3);g.fill()});g.shadowBlur=0;
  shipGlyph();
  rings.forEach(r=>{g.globalAlpha=Math.min(1,r.l*2.5);g.strokeStyle=r.c;g.lineWidth=3;g.beginPath();g.arc(r.x,r.y,r.r,0,Math.PI*2);g.stroke();g.globalAlpha=1});
  pt.forEach(p=>{g.fillStyle=p.c;g.fillRect(p.x,p.y,4,4)});
  g.font=F;g.textAlign='center';tx.forEach(s=>{g.globalAlpha=Math.min(1,s.l*2);g.fillStyle=s.c;g.fillText(s.s,Math.max(125,Math.min(W-125,s.x)),s.y);g.globalAlpha=1});
  if(fl>0){g.fillStyle=fc;g.globalAlpha=.2;g.fillRect(0,0,W,H);g.globalAlpha=1}
  // Portrait phones get a two-row HUD so the readouts stay legible.
  const hud=portrait?58:36;
  g.fillStyle='#130f1ef0';g.fillRect(0,0,W,hud);g.strokeStyle='#765c9755';g.beginPath();g.moveTo(0,hud-.5);g.lineTo(W,hud-.5);g.stroke();
  g.font=`700 ${portrait?13:12}px "JetBrains Mono",monospace`;g.textBaseline='middle';g.textAlign='left';g.fillStyle=hp>40?'#baf263':'#ff708d';g.fillText('INTEGRITY '+Math.max(0,hp)+'%',portrait?12:14,portrait?16:15);
  if(portrait){
   g.textAlign='right';g.fillStyle='#e2d4f0';g.fillText('TIME 00:'+String(Math.max(0,Math.ceil(t))).padStart(2,'0'),W-12,16);
   g.fillStyle='#473450';g.fillRect(12,29,W-24,4);g.fillStyle=hp>40?'#baf263':'#ff708d';g.fillRect(12,29,(W-24)*Math.max(0,hp)/100,4);
   g.textAlign='left';g.fillStyle='#e2d4f0';g.fillText('WAVE '+wave+' / 03',12,46);g.textAlign='right';g.fillStyle='#baf263';g.fillText('SCORE '+S.lp,W-12,46)
  }else{
   g.fillStyle='#473450';g.fillRect(14,27,162,4);g.fillStyle=hp>40?'#baf263':'#ff708d';g.fillRect(14,27,162*Math.max(0,hp)/100,4);
   g.fillStyle='#e2d4f0';g.fillText('WAVE '+wave+' / 03',235,18);g.fillText('TIME 00:'+String(Math.max(0,Math.ceil(t))).padStart(2,'0'),390,18);g.textAlign='right';g.fillStyle='#baf263';g.fillText('SCORE '+S.lp,W-14,18)
  }
 }
 function tick(now){if(cv.dataset.x)return;if(!cv.isConnected){document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);window.removeEventListener('resize',resizeArena);return}
  const dt=Math.min(.05,(now-last)/1000);last=now;if(run)update(dt);draw();requestAnimationFrame(tick)}
 function end(){run=0;cv.dataset.x=1;leaveFirewallScreen();document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);window.removeEventListener('resize',resizeArena);const held=hp>0,b=held?Math.round(hp/2):0;SFX[held?'win':'lose']();if(b)ctx.add(b,'firewall bonus');
  cv.style.display='none';el.querySelector('.firewall-arena').hidden=true;gb.style.display='';gb.innerHTML=`<div class="cart-h"><span class="lbl">Firewall report</span><span class="chip"><i class="led ${held?'g':'r'}"></i>${held?'Firewall held':'Breached'}</span></div>
  <h2>${held?'Firewall held':'Firewall breached'}</h2><div class="grid" style="margin:14px 0"><div class="inset"><div class="lbl">Threats stopped</div><div class="big">${k.k}</div></div><div class="inset"><div class="lbl">Breaches</div><div class="big red">${k.m}</div></div><div class="inset"><div class="lbl">Safe items shot</div><div class="big red">${k.f}</div></div><div class="inset"><div class="lbl">Safe items passed</div><div class="big">${k.s}</div></div></div>
  <p class="mut">Remember: use unique passphrases and MFA. Verify unexpected sign-in requests, links, QR codes and support calls. Avoid unknown files, keep devices updated and share sensitive files only with the right people.</p><button class="btn" id="fin2">Continue to quiz</button>`;$('#fin2').onclick=()=>ctx.done()}
 $('#st0').onclick=()=>{gb.style.display='none';el.querySelector('.firewall-arena').hidden=false;cv.style.display='block';dailyActive=true;dailyLast=Date.now();dailyPaint();enterFirewallScreen();resizeArena();window.addEventListener('resize',resizeArena);cv.focus();run=1;last=performance.now();requestAnimationFrame(tick)}}
/* ---------- game 3: desk inspector (case files) ---------- */
const R=(x,y,w,h,f,s)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${s?` stroke="${s}"`:''}/>`,
T=(x,y,s,f,z,a)=>`<text x="${x}" y="${y}" fill="${f||'#f8fafc'}" font-size="${z||9}" text-anchor="${a||'middle'}" font-family="JetBrains Mono,monospace" font-weight="700">${s}</text>`;
const FLOOR=R(0,395,800,125,'#232838')+'<path d="M0 440H800M0 485H800M133 395V520M266 395V520M400 395V520M533 395V520M666 395V520" stroke="#1b1f2b"/>';
const PLANT=(x,y)=>R(x+4,y+44,38,28,'#7c4a2d')+`<path d="M${x+23} ${y+44}L${x+12} ${y+6}L${x+22} ${y+24}L${x+28} ${y}L${x+32} ${y+26}L${x+44} ${y+8}L${x+36} ${y+44}Z" fill="#10b981"/>`;
function sceneRecep(){
 const I=[
 ['logo',0,'Company logo wall',[230,60,240,90],R(230,60,240,90,'#22242d','#3d4152')+T(350,104,'INNOVATIVIEW','#ffb800',20)+T(350,126,'TECHNOLOGIES','#94a3b8',10),'Branding. Harmless.'],
 ['keys',1,'Key cabinet left open with a server room key inside',[122,66,98,108],R(140,70,70,100,'#323542','#3d4152')+R(124,72,18,96,'#3a4256','#4d5778')+R(150,84,5,14,'#ffb800')+R(166,84,5,14,'#ffb800')+R(182,84,5,14,'#ffb800')+R(150,120,5,14,'#ffb800')+R(166,120,5,14,'#ffb800')+R(180,118,24,14,'#ef4444')+T(192,128,'SRV','#fff',6),'Key cabinets must stay locked and every key signed out. A server room key is especially sensitive.'],
 ['clock',0,'Wall clock',[418,160,44,44],'<circle cx="440" cy="182" r="20" fill="#f1f5f9" stroke="#0b0c0e" stroke-width="3"/><path d="M440 182L444 170M440 182V194" stroke="#0b0c0e" stroke-width="2.5"/>','A clock. Harmless.'],
 ['wifi',1,'Staff Wi-Fi password printed on the guest sign',[488,78,130,78],R(490,80,126,74,'#f8fafc','#94a3b8')+T(553,98,'WI-FI','#0b0c0e',9)+T(553,114,'Guest: Welcome-1','#0b0c0e',8)+T(553,132,'Staff: Innov@2026','#dc2626',8)+T(553,146,'(do not share)','#94a3b8',6),'Guests need a separate guest network. Never print staff credentials where visitors can see them.'],
 ['vip',1,'Board listing today’s VIP visitors and executive schedule',[488,168,130,94],R(490,170,126,90,'#e5e7eb')+T(553,186,'TODAY','#0b0c0e',8)+T(553,202,'10:00 CEO, Acme Corp','#1d4ed8',7)+T(553,216,'12:30 Mr. Rao (audit)','#1d4ed8',7)+T(553,230,'15:00 Board: Rm A','#dc2626',7)+T(553,246,'Exec in office: yes','#0f766e',7),'Visitor and executive schedules help attackers plan. Share them only with people who need them.'],
 ['pc',1,'Unlocked reception PC showing the staff directory',[148,208,104,92],R(150,214,100,66,'#0b0c0e','#3d4152')+R(154,218,92,58,'#12324a')+T(200,236,'STAFF DIRECTORY','#6ffbbe',7)+T(200,248,'names, phones, emails','#94a3b8',6)+T(200,262,'SESSION OPEN','#ffb800',7)+R(192,280,16,18,'#22242d')+R(176,296,48,4,'#22242d'),'Lock the reception PC every time you step away. It holds names and numbers attackers love.'],
 ['note',1,'Door code on a sticky note',[244,218,36,34],R(248,222,28,26,'#ffe082')+T(262,234,'Door','#0b0c0e',6)+T(262,244,'4821','#0b0c0e',8),'Door codes belong in your head or a secure system, not on a note.'],
 ['vlog',1,'Visitor log left open with names and phone numbers',[266,274,80,28],R(270,282,72,18,'#f1f5f9','#94a3b8')+R(274,286,34,2,'#94a3b8')+R(274,291,46,2,'#94a3b8')+T(326,297,'+91 98..','#dc2626',5),'A paper log exposes everyone who has visited. Use a digital sign-in, or cover earlier entries.'],
 ['spare',1,'Spare employee badges left in a tray',[356,272,70,32],R(360,292,62,10,'#323542')+R(364,278,14,20,'#10b981')+R(382,278,14,20,'#10b981')+R(400,278,14,20,'#f8fafc')+T(371,292,'ID','#0b0c0e',5)+T(389,292,'ID','#0b0c0e',5)+T(407,292,'V','#0b0c0e',5),'Spare badges must be locked away. Anyone holding one can walk straight in.'],
 ['san',0,'Hand sanitizer',[474,276,22,26],R(480,284,10,16,'#93c5fd')+R(482,278,6,6,'#94a3b8'),'Hand sanitizer. Harmless.'],
 ['esc',1,'Visitor walking into the staff area unescorted',[44,168,80,232],'<g class="bob">'+R(64,170,32,10,'#3b2f2f')+R(66,178,28,28,'#e0b48a')+R(54,206,52,90,'#475569')+R(76,222,16,22,'#ffb800')+T(84,238,'V','#0b0c0e',9)+R(42,210,12,64,'#475569')+R(106,210,12,64,'#475569')+R(58,296,20,94,'#2a2f45')+R(82,296,20,94,'#2a2f45')+'</g>','Visitors must always be escorted. Politely stop them and call their host.'],
 ['parcel',1,'Unattended parcel left by the entrance',[556,418,70,56],R(560,430,60,40,'#a98467','#5b4b3c')+R(560,444,60,6,'#d6c3a5')+T(590,464,'NO LABEL','#0b0c0e',6),'Report unexpected packages to security. Do not open or move them.'],
 ['sofa',0,'Visitor sofa',[226,410,160,64],R(230,430,150,40,'#3a4256')+R(230,414,150,18,'#4d5778'),'A sofa for visitors. Harmless.'],
 ['disp',0,'Water dispenser',[436,404,42,78],R(440,410,34,70,'#e5e7eb','#94a3b8')+R(444,414,26,24,'#93c5fd'),'A water dispenser. Harmless.'],
 ['plant',0,'Plant',[698,400,50,78],PLANT(702,402),'A plant. Harmless.']];
 const BG=R(0,0,800,520,'#1b1f2b')+FLOOR+R(30,120,90,280,'#263044','#4d5778')+R(122,240,12,24,'#0b0c0e','#3d4152')+'<rect class="blink" x="125" y="244" width="6" height="6" fill="#10b981"/>'+T(75,108,'STAFF ONLY','#94a3b8',9)+R(630,110,150,290,'#263044','#4d5778')+R(638,120,134,200,'#2d3b57')+T(705,100,'ENTRANCE','#94a3b8',9)+R(130,300,430,20,'#8a7660')+R(130,320,430,80,'#5b4b3c')+R(140,330,410,60,'#4a3d30');
 return {id:'recep',cn:'Case #0418',name:'Reception desk',sub:'The front desk is empty while the receptionist is on a break.',intro:'The receptionist has stepped out for a break. Check the lobby for anything a visitor or an attacker could use.',T0:180,I,BG}}
function sceneMeet(){
 const I=[
 ['proj',1,'Projector still showing the confidential acquisition deck',[240,50,320,150],R(240,50,320,150,'#e5e7eb','#94a3b8')+R(248,58,304,134,'#12324a')+T(400,100,'Q4 ACQUISITION PLAN','#f8fafc',18)+T(400,124,'CONFIDENTIAL','#ef4444',14)+T(400,150,'Target: Acme Corp | Offer: ₹86 Cr','#ffb800',9)+T(400,168,'Board approval: pending','#94a3b8',8),'When the meeting ends, stop sharing and switch the projector off. Anyone walking past can read the screen.'],
 ['board',1,'Whiteboard with server IPs and a root password',[600,70,180,120],R(600,70,180,120,'#c9ced8')+R(606,76,168,108,'#f1f5f9')+T(612,98,'Falcon env','#1d4ed8',9,'start')+T(612,116,'10.0.4.17','#1d4ed8',9,'start')+T(612,134,'root / Falcon#2026','#dc2626',9,'start')+T(612,152,'Client: Acme','#0f766e',9,'start'),'Wipe the board before you leave. Never write credentials or client details on it.'],
 ['sign',0,'Room booked sign',[40,130,70,40],R(40,130,70,40,'#181920','#ffb800')+T(75,148,'ROOM B','#ffb800',9)+T(75,162,'BOOKED','#f8fafc',8),'A booking sign. Harmless.'],
 ['clock',0,'Wall clock',[130,70,44,44],'<circle cx="152" cy="92" r="20" fill="#f1f5f9" stroke="#0b0c0e" stroke-width="3"/><path d="M152 92V78M152 92L162 98" stroke="#0b0c0e" stroke-width="2.5"/>','A clock. Harmless.'],
 ['papers',1,'Board pack left on the table',[176,276,76,32],R(180,292,66,8,'#f1f5f9')+R(184,285,58,8,'#e5e7eb')+R(188,278,50,8,'#f1f5f9')+T(213,285,'BOARD PACK','#ef4444',5),'Collect every printout when a meeting ends. Confidential papers must not stay in a shared room.'],
 ['pass',1,'Meeting passcode on a sticky note',[262,282,36,24],R(266,286,28,18,'#ffe082')+T(280,296,'Pass:','#0b0c0e',5)+T(280,302,'Falcon1','#0b0c0e',5),'Passcodes on notes let anyone join or listen in. Share them only through the invite.'],
 ['badge2',1,'Access badge left on the table',[324,278,26,32],R(330,280,14,22,'#10b981','#f8fafc')+T(337,296,'ID','#0b0c0e',6),'A badge left behind opens doors for whoever finds it. Hand it to security.'],
 ['spk',1,'Conference phone still on a live call',[376,284,66,22],R(380,292,56,10,'#0b0c0e','#3d4152')+'<rect class="blink" x="386" y="295" width="4" height="4" fill="#10b981"/>'+T(414,300,'LIVE CALL','#10b981',5),'End calls when the meeting is over. An open line can broadcast private talk to outsiders.'],
 ['jug',0,'Water jug',[450,264,28,40],R(456,276,16,26,'#93c5fd')+R(454,270,20,6,'#94a3b8'),'A water jug. Harmless.'],
 ['pcusb',1,'USB drive left in the presentation PC',[498,276,60,30],R(500,284,40,18,'#22242d','#3d4152')+R(540,290,10,6,'#ffb800')+T(520,296,'PC','#94a3b8',5),'Unknown USB drives can carry malware or hold company data. Remove it and hand it to IT.'],
 ['laptop',1,'Unclaimed laptop left behind, screen unlocked',[570,260,84,48],R(574,297,76,6,'#2b3040')+R(580,264,64,34,'#0b0c0e','#3d4152')+R(583,267,58,28,'#f8fafc')+T(612,284,'Welcome back','#0b0c0e',6),'Report unclaimed devices to security straight away. Do not use or power them down yourself.'],
 ['markers',0,'Marker tray',[660,284,34,18],R(664,290,26,8,'#323542')+R(668,285,3,5,'#ef4444')+R(674,285,3,5,'#3b82f6')+R(680,285,3,5,'#10b981'),'Markers. Harmless.'],
 ['bin',1,'Meeting notes in an open paper bin',[100,402,66,74],R(104,430,50,44,'#2b3040','#3d4152')+R(110,414,14,20,'#f1f5f9')+R(124,410,24,22,'#f1f5f9')+T(136,424,'NOTES','#ef4444',5),'Notes with client or plan details belong in the shredder, not an open bin.'],
 ['plant',0,'Plant',[690,396,52,80],PLANT(694,402),'A plant. Harmless.']];
 const BG=R(0,0,800,520,'#1b1f2b')+FLOOR+R(200,10,400,8,'#323542')+R(150,254,40,46,'#2b3040')+R(300,254,40,46,'#2b3040')+R(440,254,40,46,'#2b3040')+R(590,254,40,46,'#2b3040')+R(100,300,600,16,'#8a7660')+R(100,316,600,18,'#5b4b3c')+R(130,334,12,66,'#3a4256')+R(658,334,12,66,'#3a4256');
 return {id:'meet',cn:'Case #0419',name:'Meeting room B',sub:'A confidential board meeting just ended and everyone left in a hurry.',intro:'A confidential board meeting just ended in Meeting room B and everyone left in a rush. Check what they left behind.',T0:180,I,BG}}
function sceneHome(){
 const I=[
 ['books',0,'Bookshelf',[596,86,170,176],R(600,90,160,170,'#5b4b3c')+R(606,96,148,70,'#2b3040')+R(606,176,148,70,'#2b3040')+R(610,108,10,58,'#ef4444')+R(622,112,10,54,'#3b82f6')+R(634,106,10,60,'#10b981')+R(646,114,10,52,'#ffb800')+R(612,188,10,58,'#93c5fd')+R(624,192,10,54,'#f8fafc')+R(636,186,10,60,'#ef4444'),'Books. Harmless.'],
 ['window',0,'Window',[330,60,170,120],R(330,60,170,120,'#4d5778')+R(336,66,76,108,'#2d3b57')+R(418,66,76,108,'#2d3b57'),'A window. Harmless.'],
 ['photo',0,'Photo frame',[90,96,50,40],R(90,96,50,40,'#8a7660')+R(95,101,40,30,'#38405a')+R(106,108,8,8,'#e0b48a')+R(103,116,14,12,'#10b981'),'A family photo. Harmless.'],
 ['kid',1,'Child using the work laptop',[88,172,110,132],'<g class="bob">'+R(98,174,90,20,'#f8fafc')+T(143,188,'Can I play?','#0b0c0e',8)+R(114,196,30,8,'#3b2f2f')+R(116,202,26,26,'#e0b48a')+R(110,230,38,50,'#f59e0b')+R(148,236,30,8,'#e0b48a')+R(114,280,14,20,'#2a2f45')+R(132,280,14,20,'#2a2f45')+'</g>','Work devices are for you alone. Family members should never use them.'],
 ['notebook',1,'Notebook with a VPN password written in it',[156,284,62,18],R(158,290,56,10,'#f1f5f9','#94a3b8')+T(186,298,'vpn: Home#12','#0b0c0e',5),'Passwords written in notebooks are easy to lose or copy. Use a password manager.'],
 ['lap',1,'Work file being emailed to a personal Gmail',[218,196,130,108],R(222,290,130,10,'#2b3040')+R(230,200,114,90,'#0b0c0e','#3d4152')+R(234,204,106,82,'#f8fafc')+R(234,204,106,10,'#d93025')+T(287,212,'Gmail','#fff',6)+T(240,230,'To: dev.home@gmail.com','#202124',6,'start')+T(240,244,'Attach: Client_DB.xlsx','#202124',6,'start')+R(240,256,34,12,'#1a73e8')+T(257,265,'Send','#fff',6),'Never forward company files to a personal email account. Use approved company tools.'],
 ['note',1,'Sticky note with the VPN password on the laptop',[340,200,40,38],R(344,204,30,28,'#ffe082')+T(359,216,'VPN:','#0b0c0e',6)+T(359,226,'Home@26','#0b0c0e',6),'Passwords on notes get seen by family and visitors. Use a password manager.'],
 ['phoneusb',1,'Personal phone plugged into the work laptop',[352,264,34,40],R(358,266,20,34,'#0b0c0e','#3d4152')+R(361,270,14,22,'#1e293b')+'<path d="M352 296H358" stroke="#94a3b8" stroke-width="2"/>','Personal phones can carry malware or copy data. Charge them from a wall socket instead.'],
 ['mug',0,'Coffee mug',[384,278,28,24],R(388,282,18,18,'#f8fafc')+'<rect x="406" y="286" width="5" height="8" fill="none" stroke="#f8fafc" stroke-width="2"/>','A mug. Harmless.'],
 ['headset',0,'Company headset on its stand',[410,268,30,36],R(420,294,10,6,'#323542')+'<path d="M414 296V282Q425 268 436 282V296" stroke="#94a3b8" stroke-width="3" fill="none"/>','A headset on its stand. Harmless.'],
 ['printer',1,'Client contract left in the home printer',[436,262,82,42],R(440,284,72,18,'#323542','#3d4152')+R(456,266,40,22,'#f1f5f9')+T(476,280,'CONTRACT','#ef4444',6),'Collect printouts straight away and shred them. Do not leave client documents at home.'],
 ['spk',1,'Smart speaker next to the work desk during calls',[520,248,34,56],R(524,262,24,38,'#323542')+R(524,264,24,4,'#10b981'),'Smart speakers can record voice. Keep them out of the room during confidential calls.'],
 ['router',1,'Router still using the default admin password',[592,290,92,50],R(584,334,150,8,'#5b4b3c')+R(606,296,4,18,'#22242d')+R(654,296,4,18,'#22242d')+R(600,314,70,20,'#22242d','#3d4152')+R(610,320,50,10,'#f1f5f9')+T(635,328,'admin / admin','#dc2626',5),'Change the default router login and Wi-Fi password. Defaults are public knowledge.'],
 ['plant',0,'Plant',[700,396,52,80],PLANT(704,402),'A plant. Harmless.'],
 ['cat',0,'Cat',[566,424,104,48],R(570,440,44,26,'#f59e0b')+R(606,430,22,22,'#f59e0b')+R(606,424,6,8,'#f59e0b')+R(622,424,6,8,'#f59e0b'),'A cat. Harmless.']];
 const BG=R(0,0,800,520,'#1b1f2b')+R(0,395,800,125,'#2a2530')+'<path d="M0 440H800M0 485H800" stroke="#1b1f2b"/>'+R(80,300,470,10,'#8a7660')+R(80,310,470,14,'#5b4b3c')+R(92,324,10,72,'#3a4256')+R(520,324,10,72,'#3a4256');
 return {id:'home',cn:'Case #0420',name:'Home office',sub:'Dev works from home on Fridays. Check the remote work setup.',intro:'Dev works from home on Fridays. Visit the home office and check the remote work setup.',T0:180,I,BG}}
function desk(el,ctx){
 const SC=[sceneCube(),sceneRecep(),sceneMeet(),sceneHome()];S.cases=S.cases||{};
 function hub(){const n=Object.keys(S.cases).length,all=n==SC.length;
  el.innerHTML=`<div class="panel"><div class="cart-h"><span class="lbl">Slot-04 // Case files</span><span class="chip"><i class="led ${all?'g':''}"></i>${n}/${SC.length} closed</span></div><h2>Desk inspector: case files</h2><p class="mut" style="max-width:64ch">Four sites need a security inspection. Close every case to finish the level. Closed cases can be replayed for practice, without points.</p>
  <div class="grid" style="margin-top:14px;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">${SC.map((c,k)=>{const r=S.cases[c.id];return `<div class="inset"><div class="lbl">${c.cn}</div><h3 style="margin:6px 0">${c.name}</h3><div class="mut" style="min-height:40px">${c.sub}</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 12px"><span class="chip">${c.I.filter(i=>i[1]).length} risks</span><span class="chip">${c.T0}s</span>${r?`<span class="chip mint">Grade ${r.g}</span>`:''}</div><button class="btn ${r?'sub':''}" data-c="${k}" style="width:100%;box-sizing:border-box">${r?'Practice (no points)':'Start inspection'}</button></div>`}).join('')}</div><br><button class="btn" id="fin" ${all?'':'disabled'}>${all?'Continue to quiz':'Close all cases to continue'}</button></div>`;
  el.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{const c=SC[+b.dataset.c],pr=!!S.cases[c.id],b0=S.lp;inspect(el,pr?()=>{}:ctx.add,c,r=>{if(!pr){S.cases[c.id]={g:r.g,pts:Math.max(0,S.lp-b0)};save();if(SERVER)api('/me/cases','PUT',{cases:{[c.id]:S.cases[c.id]}}).catch(e=>toast(e.message,'#ef4444'))}hub()})});
  const f=$('#fin');if(f)f.onclick=()=>ctx.done()}
 hub()}
function sceneCube(){
 const I=[
 ['board',1,'Whiteboard with Wi-Fi password',[110,80,190,110],R(110,80,190,110,'#c9ced8')+R(116,86,178,98,'#f1f5f9')+T(124,110,'Wi-Fi: Innov@2026','#1d4ed8',11,'start')+T(124,134,'admin / admin','#dc2626',11,'start')+T(124,158,'VPN: ask Sam','#0f766e',10,'start')+R(116,176,60,5,'#94a3b8'),'Never write Wi-Fi or admin passwords where visitors can read them.'],
 ['clock',0,'Wall clock',[320,80,60,60],'<circle cx="350" cy="110" r="28" fill="#f1f5f9" stroke="#0b0c0e" stroke-width="3"/><path d="M350 110L354 92M350 110V128" stroke="#0b0c0e" stroke-width="3"/><line class="sec" x1="350" y1="110" x2="350" y2="86" stroke="#ef4444" stroke-width="1.5"/>','Just a clock. It is lunch time, which is why the desk is empty.'],
 ['poster',0,'Clean desk poster',[400,80,90,110],R(400,80,90,110,'#181920','#ffb800')+T(445,112,'CLEAN DESK','#ffb800',10)+T(445,128,'= SAFE DESK','#f8fafc',9)+R(425,142,40,30,'none','#10b981'),'A reminder poster. Harmless.'],
 ['cal',0,'Wall calendar',[505,90,42,52],R(505,90,42,52,'#f8fafc')+R(505,90,42,12,'#ef4444')+T(526,126,'OCT','#0b0c0e',8)+T(526,138,'05','#0b0c0e',12),'A calendar. Harmless.'],
 ['laptop',0,'Locked laptop with cable',[92,294,60,26],R(92,296,56,22,'#2b3040','#3d4152')+T(120,310,'LOCKED','#94a3b8',7)+'<path d="M148 312H156V334" stroke="#ef4444" stroke-width="2" fill="none"/>','A locked, cable-secured laptop is good practice.'],
 ['screen',1,'Unlocked screen, nobody at the desk',[200,190,180,100],R(200,190,180,100,'#0b0c0e','#3d4152')+R(206,196,168,88,'#12324a')+R(206,196,168,12,'#1e5a8a')+T(212,205,'Inbox (24)  inbox','#f8fafc',7,'start')+R(212,214,110,5,'#4a7aa5')+R(212,224,90,5,'#4a7aa5')+R(212,234,120,5,'#4a7aa5')+T(290,260,'SESSION OPEN','#6ffbbe',11)+T(290,274,'no password needed','#94a3b8',7)+'<rect class="blink" x="352" y="244" width="5" height="10" fill="#ffb800"/>','Lock your screen (Win+L) every time you step away, even for a minute.'],
 ['note',1,'Sticky note with a password',[346,166,44,42],'<g transform="rotate(7 368 188)">'+R(350,170,36,34,'#ffe082')+T(368,184,'pw:','#0b0c0e',8)+T(368,195,'Spring26!','#0b0c0e',6.5)+'</g>','Sticky-note passwords are visible to everyone. Use a password manager.'],
 ['phone',1,'One-time code showing on phone',[150,268,36,50],R(150,268,36,50,'#0b0c0e','#3d4152')+R(153,272,30,40,'#1e293b')+T(168,286,'SMS','#94a3b8',6)+T(168,298,'OTP','#ffb800',8)+T(168,308,'482913','#ffb800',8),'Codes on a lock screen can be read or photographed. Turn off message previews.'],
 ['mug',0,'Coffee mug',[388,278,34,42],R(392,298,20,20,'#f8fafc')+'<rect x="412" y="303" width="6" height="10" fill="none" stroke="#f8fafc" stroke-width="2"/><path class="steam" d="M398 294q-4-6 0-12q4-6 0-12" stroke="#94a3b8" fill="none" stroke-width="2"/>','Just a mug. Harmless.'],
 ['pens',0,'Pen holder',[423,286,20,34],R(425,300,14,18,'#323542')+R(428,290,2,12,'#ef4444')+R(432,288,2,14,'#3b82f6')+R(436,291,2,11,'#10b981'),'Pens. Harmless.'],
 ['badge',1,'Access badge left on the desk',[358,292,26,34],'<path d="M371 290V298" stroke="#10b981" stroke-width="2"/>'+R(360,296,22,28,'#f8fafc','#10b981')+R(364,300,14,10,'#10b981')+T(371,319,'ID','#0b0c0e',7),'Keep your badge on you. A lost or unattended badge opens doors for strangers.'],
 ['print',1,'Confidential folder in the open',[448,282,52,36],R(448,282,52,36,'#f1f5f9','#94a3b8')+R(448,288,52,8,'#ef4444')+T(474,295,'CONFIDENTIAL','#fff',6)+T(474,309,'Q3 payroll','#0b0c0e',7),'Lock sensitive papers away at the end of the day and when you leave your desk.'],
 ['usb',1,'Unknown USB drive',[510,302,38,18],R(512,306,26,10,'#ffb800')+R(538,308,8,6,'#94a3b8')+T(525,314,'USB','#0b0c0e',6),'Unknown USB drives can carry malware. Hand them to IT and never plug them in.'],
 ['keys',1,'Keys left in the drawer lock',[466,340,42,24],R(470,344,14,14,'#0b0c0e')+R(477,350,18,3,'#ffb800')+'<rect x="495" y="347" width="8" height="9" fill="none" stroke="#ffb800" stroke-width="2"/>','Keys in a lock defeat the lock. Take them with you.'],
 ['bin',1,'Unshredded payroll sheets in the paper bin',[108,402,60,70],R(112,424,48,46,'#2b3040','#3d4152')+R(118,408,16,20,'#f1f5f9')+R(126,404,24,22,'#f1f5f9')+T(138,418,'SALARY','#ef4444',5)+T(136,456,'PAPER','#94a3b8',6),'Confidential paper belongs in the shredder, not an open bin.'],
 ['shred',0,'Shredder',[425,402,58,64],R(425,402,58,64,'#323542','#3d4152')+R(430,408,48,6,'#0b0c0e')+T(454,440,'SHRED','#f8fafc',8)+R(432,452,40,8,'#181920'),'A shredder is exactly where confidential paper should go.'],
 ['plant',0,'Plant',[510,396,42,76],R(512,442,34,28,'#7c4a2d')+'<path d="M529 442L519 405L529 425L535 398L538 428L550 408L542 442Z" fill="#10b981"/>','A plant. Harmless.'],
 ['tail',1,'Stranger tailgating through the door',[644,168,80,230],'<g class="bob">'+R(666,172,34,8,'#0b0c0e')+R(670,180,26,30,'#e0b48a')+R(676,192,3,3,'#0b0c0e')+R(686,192,3,3,'#0b0c0e')+R(656,212,54,94,'#6b7a99')+R(644,216,12,66,'#6b7a99')+R(710,216,12,66,'#6b7a99')+R(662,306,20,84,'#2a2f45')+R(686,306,20,84,'#2a2f45')+R(658,388,26,8,'#0b0c0e')+R(684,388,26,8,'#0b0c0e')+'</g>','Politely challenge anyone without a badge and report it. Never hold the door for strangers.'],
 ['underkb',1,'Password note hidden under the keyboard',[212,306,44,14],R(216,310,34,6,'#ffe082','#caa94a'),'Under the keyboard is the first place a thief looks. Use a password manager instead.'],
 ['printer',1,'Sensitive printout forgotten in the printer tray',[640,402,94,70],R(640,432,92,38,'#2b3040','#3d4152')+R(646,422,80,12,'#22242d')+R(668,404,34,22,'#f1f5f9')+T(685,418,'HR LIST','#ef4444',6)+R(652,444,30,4,'#0b0c0e')+T(710,458,'PRINTER','#94a3b8',6),'Collect printouts immediately, or use secure pull-printing with your badge.'],
 ['bag',1,'Laptop bag left open and unattended',[186,396,80,74],R(190,424,72,42,'#3a4256','#4d5778')+R(204,404,44,24,'#0b0c0e','#3d4152')+R(209,408,34,15,'#1e5a8a')+'<path d="M200 424Q226 398 252 424" stroke="#4d5778" fill="none" stroke-width="3"/>'+T(226,452,'BAG','#94a3b8',7),'Never leave a laptop bag unattended, and keep company devices out of sight or locked away.'],
 ['wedge',1,'Secure door propped open with a wedge',[604,378,38,26],'<polygon points="612,400 642,400 612,386" fill="#ffb800" stroke="#0b0c0e"/>','A propped door skips the badge reader and lets anyone walk in. Remove the wedge.'],
 ['frame',0,'Family photo frame',[500,152,50,40],R(500,152,50,40,'#8a7660')+R(505,157,40,30,'#38405a')+R(515,162,8,8,'#e0b48a')+R(512,170,14,14,'#10b981')+R(530,164,8,8,'#e0b48a')+R(527,172,14,12,'#ffb800'),'A personal photo. Harmless.'],
 ['cork',0,'Corkboard with team notes',[110,200,84,62],R(110,200,84,62,'#8a6a45','#5b4b3c')+R(118,208,22,18,'#f8fafc')+R(146,208,22,18,'#ffe082')+R(124,232,26,20,'#93c5fd')+R(158,234,24,18,'#fca5a5'),'Team photos and lunch notes. No passwords here.'],
 ['ext',0,'Fire extinguisher',[772,320,26,76],R(776,336,18,56,'#ef4444')+R(780,326,10,12,'#0b0c0e')+T(785,368,'FIRE','#fff',5),'Safety equipment in the right place. Harmless.'],
 ['chair',0,'Office chair',[278,348,86,100],R(284,350,72,40,'#2b3040','#3d4152')+R(280,392,80,14,'#323542')+R(314,406,12,28,'#22242d')+R(288,434,64,6,'#22242d'),'Just a chair. Harmless.'],
 ['cactus',0,'Desk cactus',[550,292,22,30],R(554,308,14,12,'#7c4a2d')+R(558,294,6,16,'#10b981')+R(552,298,5,8,'#10b981')+R(565,298,5,8,'#10b981'),'A tiny cactus. Harmless.']];
 const BG=R(0,0,800,520,'#1b1f2b')+R(0,395,800,125,'#232838')+'<path d="M0 440H800M0 485H800M133 395V520M266 395V520M400 395V520M533 395V520M666 395V520" stroke="#1b1f2b"/><polygon points="40,84 90,60 90,392 40,430" fill="#2e3550"/><polygon points="560,60 590,76 590,410 560,392" fill="#2e3550"/>'+R(90,60,470,332,'#38405a')+R(90,52,470,10,'#4d5778')+R(590,40,210,360,'#202638')+R(610,110,160,290,'#263044','#4d5778')+R(618,120,144,200,'#2d3b57')+R(640,350,100,6,'#94a3b8')+R(594,240,12,24,'#0b0c0e','#3d4152')+'<rect class="blink" x="597" y="244" width="6" height="6" fill="#ef4444"/>'+T(690,100,'STAFF ONLY','#94a3b8',9)+R(80,318,490,8,'#8a7660')+R(80,326,490,12,'#5b4b3c')+R(92,338,10,60,'#3a4256')+R(440,338,110,60,'#2b3040','#3d4152')+R(446,342,98,16,'#323542')+R(446,362,98,16,'#323542')+R(446,382,98,12,'#323542')+R(284,290,12,22,'#22242d')+R(262,312,56,6,'#22242d')+R(212,300,130,10,'#22242d','#3d4152')+R(346,302,10,8,'#22242d');
 return {id:'cube',cn:'Case #0417',name:'Cubicle 12 · 3D',sub:'Explore a realistic 3D workstation. Dev has stepped away for lunch.',intro:'Dev has gone to lunch and left cubicle 12 a mess. You are the security inspector.',T0:180,I,BG}}
function inspect(el,ad,sc,back){
 if(!sc.flat){
  el.innerHTML='<div class="panel"><h2>Preparing your 3D case file…</h2><p class="mut">Setting up the room, lighting and inspection tools.</p></div>';
  import('/desk3d.mjs?v=372428c04d').then(m=>{if(el.isConnected)m.mountCubicle(el,{items:sc.I,onScore:ad,onDone:back,caseFile:sc})}).catch(e=>{
   if(!el.isConnected)return;console.error('3D cubicle unavailable',e);el.innerHTML='<div class="panel"><h2>3D view unavailable</h2><p>This browser could not start the 3D view. You can still complete the inspection in the illustrated version.</p><button class="btn" id="flat-desk">Open illustrated inspection</button></div>';el.querySelector('#flat-desk').onclick=()=>inspect(el,ad,{...sc,flat:true},back)
  });return
 }
 const I=sc.I,BG=sc.BG,risks=I.filter(i=>i[1]),T0=sc.T0;
 const grp=i=>{const h=i[3];return `<g data-i="${i[0]}" style="cursor:crosshair">${i[4]}<rect class="ol" x="${h[0]-3}" y="${h[1]-3}" width="${h[2]+6}" height="${h[3]+6}" fill="#000" fill-opacity="0" stroke="none" stroke-width="3"/></g>`};
 el.innerHTML=`<style>@keyframes pop{0%{transform:scale(2.2);opacity:0}60%{transform:scale(.92);opacity:1}100%{transform:scale(1)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes steam{0%{opacity:0;transform:translateY(4px)}50%{opacity:.8}100%{opacity:0;transform:translateY(-6px)}}@keyframes bl{50%{opacity:0}}@keyframes bob{50%{transform:translateY(-2px)}}@keyframes snap{from{opacity:.5}to{opacity:0}}
.pop{transform-box:fill-box;transform-origin:center;animation:pop .35s ease-out}.sec{animation:spin 60s linear infinite;transform-origin:350px 110px}.steam{animation:steam 2.4s ease-in infinite}.blink{animation:bl 1s steps(1) infinite}.bob{animation:bob 1.6s ease-in-out infinite}.snap{animation:snap .3s forwards}
.dk{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:16px}@media(max-width:900px){.dk{grid-template-columns:1fr}}.dk [data-i]:hover .ol{stroke:rgba(248,250,252,.55)}.low{animation:bl .6s steps(1) infinite;color:#ef4444!important}</style>
 <div class="panel" id="gb"><div class="cart-h"><span class="lbl">Slot-03 // ${sc.cn}</span><span class="chip"><i class="led"></i>Standby</span></div><h2>${sc.name}</h2>
 <p>${sc.intro} Sweep the room with your torch and <b class="red">click every security risk</b> before time runs out. Harmless objects are decoys.</p>
 <div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0"><span class="chip mint">Risk found +40</span><span class="chip mint">Streak bonus up to +30</span><span class="chip red">False alarm −20</span><span class="chip">Hint −10</span><span class="chip mint">Time bonus</span></div>
 <p class="mut">${risks.length} risks hidden. ${T0} seconds. Rank from Intern to Chief Inspector.</p><button class="btn" id="st0">Start inspection</button></div>
 <div id="sc" style="display:none"><div class="dk"><div><div class="inset" style="padding:6px"><svg id="sv" viewBox="0 0 800 520" style="width:100%;display:block;touch-action:none"><defs><radialGradient id="tg" gradientUnits="userSpaceOnUse" cx="400" cy="260" r="270"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".4" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient></defs>${BG}${I.map(grp).join('')}<rect id="dim" width="800" height="520" fill="url(#tg)" pointer-events="none"/><circle id="rt" cx="400" cy="260" r="14" fill="none" stroke="#ffb800" stroke-width="2" pointer-events="none"/><g id="fx" pointer-events="none"></g></svg></div><div class="fb" id="msg">HQ: Move your torch around the cubicle and click anything that looks like a security risk.</div></div>
 <div class="panel" style="padding:14px"><div class="lbl">Inspector ${esc(S.name)} // ${sc.name}</div><div class="big" id="ht">${T0}s</div><div style="height:8px;background:#323542;margin:6px 0 10px"><b id="tb" style="display:block;height:100%;width:100%;background:#ffb800"></b></div>
 <div style="display:flex;justify-content:space-between"><span class="lbl" id="hf"></span><span class="lbl amb" id="hs"></span></div>
 <div style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0"><button class="btn sub" id="hh" style="padding:6px 10px">Hint −10</button><button class="btn sub" id="tt" style="padding:6px 10px">Torch on</button><button class="btn sub" id="sn" style="padding:6px 10px">Sound on</button></div>
 <div class="lbl">Evidence log</div>${risks.map((r,k)=>`<div id="lg-${r[0]}" class="inset" style="padding:4px 10px;margin-top:5px;font-size:11px">☐ Risk ${k+1}: ???</div>`).join('')}</div></div><div id="sum"></div></div>`;
 const found={};let t=T0,over=0,iv,st=0,fa=0,snd=1,AC;
 const beep=(f,d,ty)=>SFX.tone(f,d||.12,ty||'square');
 const ol=id=>$('#sv [data-i='+id+'] .ol'),say=(s,c)=>{$('#msg').innerHTML=s;$('#msg').style.borderColor=c},
 hud=()=>{$('#hf').textContent='Found '+Object.keys(found).length+'/'+risks.length;$('#hs').textContent=st>1?'Streak x'+st:'';$('#ht').textContent=t+'s';$('#tb').style.width=(t/T0*100)+'%';$('#tb').style.background=t<=15?'#ef4444':'#ffb800';$('#ht').className='big'+(t<=10&&!over?' low':'')},
 stamp=(i,txt,c,ms)=>{const h=i[3],id='s'+Date.now()+Math.random();$('#fx').insertAdjacentHTML('beforeend',`<g id="${id}" transform="translate(${h[0]+h[2]/2} ${h[1]+h[3]/2}) rotate(-12)"><g class="pop">${R(-38,-13,76,26,'#0b0c0e',c)}${T(0,5,txt,c,13)}</g></g>`);setTimeout(()=>{const n=document.getElementById(id);n&&n.remove()},ms)},
 snap=()=>{$('#fx').insertAdjacentHTML('beforeend','<rect class="snap" width="800" height="520" fill="#fff"/>');setTimeout(()=>{$('#fx .snap')&&$('#fx .snap').remove()},320)};
 function end(){if(over)return;over=1;clearInterval(iv);const n=Object.keys(found).length,all=n==risks.length;if(all&&t>0)ad(t,'time bonus');hud();
  $('#hh').style.opacity=.4;$('#dim').setAttribute('display','none');
  risks.forEach(i=>{const r=$('#lg-'+i[0]);if(!found[i[0]]){const o=ol(i[0]);o.setAttribute('stroke','#ef4444');o.setAttribute('stroke-dasharray','5 3');r.innerHTML='✗ '+i[2];r.style.color='#ef4444'}});
  const G=all&&!fa?['S','Chief inspector']:all?['A','Senior inspector']:n>=risks.length*.7?['B','Inspector']:n>=risks.length*.5?['C','Trainee']:['D','Intern'];beep(all?1175:200,.3);
  say(all?'<b class="mint">Case closed. Every risk found.</b>':'<b class="red">Time is up.</b> Missed risks are outlined in red.',all?'#10b981':'#ef4444');
  $('#sum').innerHTML=`<div class="panel" style="margin-top:16px"><div class="cart-h"><span class="lbl">Inspection report // ${sc.cn}</span><span class="chip"><i class="led ${all?'g':'r'}"></i>${n}/${risks.length}</span></div>
  <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;margin-bottom:12px"><div class="big" style="font-size:64px;line-height:1">${G[0]}</div><div><h3>${G[1]}</h3><div class="mut">${fa} false alarm${fa==1?'':'s'}. ${all?t+'s left on the clock.':''}</div></div></div>
  <table>${risks.map(i=>`<tr><td class="${found[i[0]]?'mint':'red'}">${found[i[0]]?'✓':'✗'}</td><td><b>${i[2]}</b><br><span class="mut">${i[5]}</span></td></tr>`).join('')}</table><br><button class="btn" id="fin3">Back to case files</button></div>`;$('#fin3').onclick=()=>back({g:G[0],n,all})}
 $('#st0').onclick=()=>{$('#gb').style.display='none';$('#sc').style.display='block';hud();beep(660,.1);
  const sv=$('#sv'),aim=e=>{const r=sv.getBoundingClientRect(),x=(e.clientX-r.left)*800/r.width,y=(e.clientY-r.top)*520/r.height,g=$('#tg');g.setAttribute('cx',x);g.setAttribute('cy',y);$('#rt').setAttribute('cx',x);$('#rt').setAttribute('cy',y)};
  sv.onpointermove=aim;
  iv=setInterval(()=>{if(!$('#sv')){clearInterval(iv);return}t--;hud();if(t<=10&&t>0)beep(440,.05);if(t<=0)end()},1000);
  sv.onclick=e=>{aim(e);const g=e.target.closest('[data-i]');if(!g||over)return;const i=I.find(x=>x[0]==g.dataset.i),o=ol(i[0]);if(found[i[0]])return;
   if(i[1]){found[i[0]]=1;st++;const b=Math.min(st-1,3)*10;o.removeAttribute('stroke-dasharray');o.setAttribute('stroke','#10b981');ad(40+b,st>1?'streak x'+st:'risk found');snap();stamp(i,'RISK!','#ffb800',1800);beep(880,.1);setTimeout(()=>beep(1175,.12),90);
    const r=$('#lg-'+i[0]);r.innerHTML='✓ '+i[2];r.style.color='#10b981';r.style.borderColor='#10b981';say('<b class="mint">Risk logged: '+i[2]+'.</b> '+i[5],'#10b981');hud();if(Object.keys(found).length==risks.length)end()}
   else{st=0;fa++;ad(-20,'false alarm');o.setAttribute('stroke','#ef4444');stamp(i,'NOPE','#ef4444',700);beep(160,.2,'sawtooth');setTimeout(()=>{if(!over)o.setAttribute('stroke','none')},600);say('<b class="red">False alarm: '+i[2]+'.</b> '+i[5],'#ef4444');hud()}};
  $('#hh').onclick=()=>{const r=risks.filter(i=>!found[i[0]]);if(!r.length||over)return;ad(-10,'hint');const o=ol(r[Math.floor(Math.random()*r.length)][0]);o.setAttribute('stroke','#ffb800');o.setAttribute('stroke-dasharray','4 3');setTimeout(()=>{if(!found[o.parentNode.dataset.i]&&!over){o.setAttribute('stroke','none');o.removeAttribute('stroke-dasharray')}},1500)};
  $('#tt').onclick=e=>{const d=$('#dim'),on=d.getAttribute('display')!='none';d.setAttribute('display',on?'none':'inline');e.target.textContent='Torch '+(on?'off':'on')};
  $('#sn').onclick=e=>{SFX.toggle('sfx');e.target.textContent='Sound '+(SFX.s.sfx?'on':'off');hdr()}}}
/* ---------- voice recordings: optional pre-recorded audio per caller line ---------- */
/* Keys look like c1-a (call 1, line a). Put hosted files at VOICE.base + key + '.mp3', e.g. '/audio/voice/c1-a.mp3'. */
const VDB=(()=>{let db;const open=()=>db||(db=new Promise((res,rej)=>{try{const r=indexedDB.open('cq-voice',1);r.onupgradeneeded=()=>r.result.createObjectStore('v');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}}));
 const tx=(m,f)=>open().then(d=>new Promise((res,rej)=>{const t=d.transaction('v',m),q=f(t.objectStore('v'));t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error)}));
 return{get:k=>tx('readonly',s=>s.get(k)),put:(k,b)=>tx('readwrite',s=>s.put(b,k)),del:k=>tx('readwrite',s=>s.delete(k)),keys:()=>tx('readonly',s=>s.getAllKeys())}})();
const VST=SERVER?{keys:()=>api('/voice').then(m=>{VOICE.man=m;return Object.keys(m)}),
 put:(k,b)=>fetch('/api/admin/voice/'+k,{method:'PUT',credentials:'same-origin',headers:{'Content-Type':(b.type||'audio/webm').split(';')[0],'X-Requested-With':'cq'},body:b}).then(r=>r.ok?VST.keys():r.json().then(d=>{throw new Error(d.error||'Upload failed')})),
 del:k=>api('/admin/voice/'+k,'DELETE').then(()=>VST.keys())}:VDB;
const VOICE={base:'',man:{},cur:null,
 async src(key){if((SERVER||STATIC)&&this.man&&this.man[key])return '/audio/voice/'+key+'.'+this.man[key];if(SERVER)return null;try{const b=await VDB.get(key);if(b)return URL.createObjectURL(b)}catch(e){}return this.base?this.base+key+'.mp3':null},
 play(src,end,fail){this.stop();let d=0;const f=()=>{if(!d){d=1;end()}},x=()=>{if(!d){d=1;fail()}};try{const a=new Audio(src);this.cur=a;a.onended=f;a.onerror=x;const p=a.play();if(p&&p.catch)p.catch(x);setTimeout(f,45000)}catch(e){x()}},
 stop(){if(this.cur){try{this.cur.pause()}catch(e){}this.cur=null}}};
/* ---------- game 4: voice trap (phone call simulation) ---------- */
const TACT={Urgency:'Pressure to act now so you skip the checks.',Authority:'Claims a trusted role to lower your guard.',Fear:'Threatens a bad outcome to cloud your judgement.',Secrecy:'Asks you to avoid colleagues who would spot the scam.','Data grab':'Asks for codes, PINs or passwords that no real team needs.',Verifiable:'A detail you can check yourself, such as a ticket number.','No pressure':'A genuine caller lets you verify first.'},GOODT=['Verifiable','No pressure'];
/* node: s = caller speech, [[phrase|Tactic]] marks a flaggable phrase; reply = [text, risk change, points, next node (W win, L breach, M missed genuine call), feedback] */
const CALLS=[
{name:'IT Helpdesk',num:'+91 11 4000 8812',note:'Not in your contacts',vish:1,nodes:{
 a:{s:'Hello, this is [[Rakesh from the IT helpdesk|Authority]]. Our system shows [[malware on your laptop that is leaking company data|Fear]]. I need to fix it [[right now, before it spreads|Urgency]].',o:[
  ['“Oh no! What do you need me to do?”',25,-10,'b','You started following instructions before checking who this is.'],
  ['“Please give me your name and ticket number. I will call the helpdesk back on the official number.”',-25,30,'c','Verifying through a second, official channel is exactly right.'],
  ['“Sure, go ahead. I am at my desk.”',20,-10,'b','You went along without verifying the caller.']]},
 b:{s:'Great. I am sending a [[6-digit code to your phone|Data grab]]. [[Read it to me|Data grab]] and I will clear the virus. [[Please do not tell anyone, this is confidential|Secrecy]].',o:[
  ['Read the code out loud.',100,-40,'L','One-time codes are for you alone. Reading it out handed over your account.'],
  ['“Why does IT need my code? Nobody should ever ask for it.”',-15,20,'c','Good challenge. Real IT staff never ask for a one-time code.'],
  ['“I am hanging up and reporting this to IT Security.”',-100,50,'W','Hang up and report: the safest move.']]},
 c:{s:'There is [[no time for tickets|Urgency]]. If you hang up, [[your account will be locked in five minutes|Fear]]. Do you want to lose all your files?',o:[
  ['“I will hang up and call the helpdesk myself.”',-100,50,'W','You refused to be rushed and used an official channel.'],
  ['“Okay, skip the ticket. What do you need?”',40,-20,'b','Pressure is the tactic. Never skip verification.'],
  ['“Send me a message through the helpdesk portal and I will check it there.”',-30,30,'W','Asking for proof in a channel you trust ends most scams.']]}}},
{name:'Apex Supplies',num:'+91 98765 43210',note:'Calling about a payment',vish:1,nodes:{
 a:{s:'Hi, this is [[Meera from Apex Supplies, your regular vendor|Authority]]. We changed banks last week. Please update our account before [[today’s 4 PM payment run|Urgency]], or [[our shipment will be held and you will be fined|Fear]].',o:[
  ['“Sure, what is the new account number?”',35,-20,'b','Never change payment details on the strength of one phone call.'],
  ['“I need a written request, and I will call your known contact number to confirm.”',-30,30,'c','A callback to a known number is the standard control.'],
  ['“Send me an email and I will update it.”',20,-10,'b','An email alone can be forged. Verify with a known contact first.']]},
 b:{s:'The new account is 4412 8890 3321. I will [[email the form later, please process it first|Urgency]]. And [[please do not involve your manager, they are travelling|Secrecy]].',o:[
  ['Update the account straight away.',100,-40,'L','The payment would have gone to the fraudster.'],
  ['“I will confirm with the vendor record and my manager first.”',-35,30,'c','Right. Checks and approvals exist for exactly this.'],
  ['“I am escalating this to Finance Security and ending the call.”',-100,50,'W','Escalating suspicious payment requests protects the company.']]},
 c:{s:'Calling back would take too long. [[It is a big penalty if this payment bounces|Fear]]. Just this once?',o:[
  ['“Policy requires a callback. I will not make an exception.”',-100,40,'W','Holding firm on policy is the right call.'],
  ['“Fine, just this once.”',60,-30,'L','Exceptions are exactly what fraudsters ask for.'],
  ['“Let me transfer you to my manager.”',-30,25,'W','Bringing in a second person breaks the secrecy the scammer depends on.']]}}},
{name:'Bank Fraud Desk',num:'1800 000 5521',note:'Caller ID shows a bank number',vish:1,nodes:{
 a:{s:'This is the [[fraud prevention team at your bank|Authority]]. We have blocked [[a suspicious ₹48,000 transaction on your card|Fear]]. To cancel it, I need to [[confirm your card details right now|Urgency]].',o:[
  ['“Why are you calling me at work?”',10,0,'b','Questioning is fine, but you still have not verified who this is.'],
  ['“I will hang up and call the number printed on my card.”',-100,50,'W','Calling back on a number you trust is right. Caller ID can be faked.'],
  ['“Okay, my card number is…”',100,-40,'L','You gave card details to an unverified caller.']]},
 b:{s:'For your safety, [[just read me your card number, the CVV and your PIN|Data grab]]. This is a [[special secure line, the number on your card will not connect you|Authority]].',o:[
  ['Give the CVV and PIN.',100,-40,'L','No bank ever asks for your PIN or CVV.'],
  ['“Banks never ask for a PIN. I am hanging up and calling my bank.”',-100,50,'W','Correct. One question exposed the scam.'],
  ['“Let me fetch my card first.”',30,-10,'c','Stalling while still on the line keeps you inside their script.']]},
 c:{s:'Hurry, the [[transaction will go through in two minutes|Urgency]]. Read the numbers now.',o:[
  ['Read out the card number.',100,-40,'L','Card details given to a caller you cannot verify.'],
  ['“I am ending this call and phoning the bank directly.”',-100,50,'W','You took control of the call. Well done.'],
  ['“Hold on, I want to check with my manager.”',-30,20,'W','Slowing down and getting a second opinion defeats pressure tactics.']]}}},
{name:'IT Service Desk',num:'Ext. 4001',note:'Internal extension in your directory',vish:0,nodes:{
 a:{s:'Hi, this is [[Karan from the IT Service Desk|Verifiable]]. I am following up on [[ticket INC-2291 you raised yesterday about your slow laptop|Verifiable]]. [[Do you have two minutes?|No pressure]]',o:[
  ['“Yes, I raised that ticket. Please go ahead.”',-10,20,'b','Good: the ticket details match what you know.'],
  ['“Can you tell me what the ticket was about?”',-20,25,'b','Smart verification. A genuine caller can answer easily.'],
  ['“I never talk to IT on the phone. Goodbye.”',0,-30,'M','Being careful is good, but a quick check would have confirmed this call was genuine.']]},
 b:{s:'I will [[start a remote session with the company tool, you will see an approval prompt on screen|Verifiable]]. I will [[never ask for your password|No pressure]].',o:[
  ['“I will approve the prompt once I see the ticket number on it.”',-40,40,'W','Perfect: you verified inside the tool and kept control.'],
  ['“Just take my password to save time.”',100,-40,'L','Even with genuine IT, passwords are never shared.'],
  ['“Please email me the details first and I will confirm.”',-15,20,'W','Reasonable. Genuine IT is happy to be verified.']]}}}];
function voice(el,ctx){
 let k=0,risk=0,found={},seen={},tm,spk,sec=0,ok=0,fnd=0,tot=0;
 const mk=s=>s.replace(/\[\[(.+?)\|(.+?)\]\]/g,(m,t,g)=>`<u data-t="${g}" tabindex="0" role="button">${t}</u>`),
 bub=(h,c)=>{const t=$('#tr');t.insertAdjacentHTML('beforeend',`<div class="bb ${c||''}">${h}</div>`);t.scrollTop=t.scrollHeight},
 side=()=>`<div class="panel"><div class="cart-h"><span class="lbl">Call ${k+1} of ${CALLS.length}</span><span class="chip"><i class="led"></i>${ok} handled safely</span></div><h3>How to play</h3><p class="mut">Listen, then choose your reply. <b class="amb">Tap the underlined phrases</b> to flag a tactic (+10). Keep the risk meter low.</p><div class="lbl">Golden rules</div><p class="mut">1. Caller ID can be faked.<br>2. Never share codes, PINs or passwords.<br>3. Hang up and call back on a number you trust.</p><div class="lbl">Flagged this call</div><div id="fl" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"></div></div>`;
 function intro(){el.innerHTML=`<div class="panel"><div class="cart-h"><span class="lbl">Slot-04 // Voice trap</span><span class="chip"><i class="led"></i>Standby</span></div><h2>Voice trap</h2><p style="max-width:62ch">Your desk phone is about to ring. Four callers, four conversations. Some are scammers and one is genuine. Choose your replies carefully and <b class="amb">tap the underlined phrases</b> to flag manipulation tactics.</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0"><span class="chip mint">Safe reply up to +50</span><span class="chip red">Risky reply down to −40</span><span class="chip">Flag a tactic +10</span></div><p class="mut">If the risk meter reaches 100, the caller wins.</p><button class="btn" id="go">Pick up the phone</button></div>`;$('#go').onclick=ring}
 function ring(){SFX.duck(1);const c=CALLS[k];risk=0;found={};seen={};sec=0;fnd=0;tot=0;
  el.innerHTML=`<div class="vt"><div class="phone" style="text-align:center"><div class="lbl">Incoming call ${k+1}/${CALLS.length}</div><div class="cav" style="margin:18px auto;width:72px;height:72px;font-size:30px">☎</div><h3>${c.name}</h3><div class="mut">${c.num}</div><div class="mut" style="margin:6px 0 18px">${c.note}</div><button class="btn" id="ans">Answer</button></div>${side()}</div>`;
  const rg=setInterval(()=>{if(!$('#ans')){clearInterval(rg);return}SFX.ring()},1600);SFX.ring();
  $('#ans').onclick=()=>{clearInterval(rg);talk()}}
 function talk(){const c=CALLS[k];
  el.innerHTML=`<div class="vt"><div class="phone"><div class="ph-h"><div class="cav">☎</div><div><b>${c.name}</b><div class="mut">${c.num}</div></div><div id="tm" class="amb" style="margin-left:auto">00:00</div></div><div class="wave" id="wv">${'<i></i>'.repeat(22)}</div><div class="lbl">Risk meter</div><div class="meter"><b id="rm"></b></div><div class="tr" id="tr" aria-live="polite"></div><div id="op"></div></div>${side()}</div>`;
  tm=setInterval(()=>{if(!$('#tm')){clearInterval(tm);return}sec++;$('#tm').textContent=String(sec/60|0).padStart(2,'0')+':'+String(sec%60).padStart(2,'0')},1000);
  $('#tr').onclick=e=>flag(e.target.closest('u'));$('#tr').onkeydown=e=>{if(e.key=='Enter'||e.key==' '){const u=e.target.closest('u');if(u){e.preventDefault();flag(u)}}};speak('a')}
 function flag(u){if(!u||u.classList.contains('fl'))return;const g=u.dataset.t;u.classList.add('fl');if(GOODT.includes(g))u.classList.add('gd');found[g]=1;fnd++;add(10,'flag: '+g);SFX.ok();
  $('#fl').insertAdjacentHTML('beforeend',`<span class="chip ${GOODT.includes(g)?'mint':'red'}">${g}</span>`)}
 function speak(id){const n=CALLS[k].nodes[id];(n.s.match(/\[\[(.+?)\|(.+?)\]\]/g)||[]).forEach(m=>{tot++;seen[m.slice(2,-2).split('|')[1]]=1});
  $('#op').innerHTML='';bub(mk(n.s));const len=n.s.replace(/\[\[(.+?)\|.+?\]\]/g,'$1').length,d=Math.min(2400,700+len*14);$('#wv').classList.add('on');let fd=0;
  const done=()=>{if(fd)return;fd=1;clearInterval(spk);if($('#wv')){$('#wv').classList.remove('on');opts(n)}},
  synth=()=>{if(fd)return;let b=0;clearInterval(spk);spk=setInterval(()=>{SFX.blip();if(++b*90>d)done()},90)};
  VOICE.src('c'+(k+1)+'-'+id).then(src=>{if(!$('#wv'))return;src?VOICE.play(src,done,synth):synth()})}
 function opts(n){const o=n.o.slice().sort(()=>Math.random()-.5);$('#op').innerHTML=o.map((x,i)=>`<button class="btn sub opt" data-i="${i}" style="text-transform:none;letter-spacing:0">${x[0]}</button>`).join('');
  $('#op').onclick=e=>{const b=e.target.closest('[data-i]');if(b)pick(o[+b.dataset.i])}}
 function pick(o){$('#op').onclick=null;$('#op').innerHTML='';bub(o[0],'me');add(o[2],o[2]>=0?'safe reply':'risky reply');SFX[o[2]>=0?'ok':'bad']();
  risk=Math.max(0,Math.min(100,risk+o[1]));$('#rm').style.width=risk+'%';$('#rm').style.background=risk>60?'#ef4444':'#ffb800';
  bub(`<b class="${o[2]>=0?'mint':'red'}">${o[2]>=0?'+':'−'}${Math.abs(o[2])}</b> ${o[4]}`,'fb2');
  let nx=o[3];if(risk>=100&&!'WLM'.includes(nx))nx='L';
  if('WLM'.includes(nx))setTimeout(()=>end(nx),1500);else setTimeout(()=>speak(nx),1400)}
 function end(r){clearInterval(tm);clearInterval(spk);VOICE.stop();SFX.duck(0);const c=CALLS[k],good=r=='W',T={W:'Call handled safely',L:'You were breached',M:'You missed a genuine call'};if(good)ok++;SFX[good?'win':'lose']();
  el.querySelector('.phone').innerHTML=`<div class="lbl">Call ${k+1} result</div><h2 class="${good?'mint':'red'}" style="margin:6px 0">${T[r]}</h2><p class="mut">${c.vish?'This was a vishing call.':'This was a genuine call.'} Flags spotted: ${fnd}/${tot}.</p><table>${Object.keys(seen).map(t=>`<tr><td class="${found[t]?'mint':'mut'}">${found[t]?'✓':'·'}</td><td><b>${t}</b><br><span class="mut">${TACT[t]}</span></td></tr>`).join('')}</table><br><button class="btn" id="nc">${k+1<CALLS.length?'Next call':'See results'}</button>`;
  $('#nc').onclick=()=>{k++;k<CALLS.length?ring():fin()}}
 function fin(){SFX.duck(0);VOICE.stop();const G=ok==CALLS.length?'Hang-up hero':ok>=3?'Sharp ear':ok>=2?'Getting there':'Trainee';
  el.innerHTML=`<div class="panel"><div class="cart-h"><span class="lbl">Voice trap report</span><span class="chip"><i class="led ${ok>=3?'g':'r'}"></i>${ok}/${CALLS.length}</span></div><h1>${G}</h1><p class="mut">You handled ${ok} of ${CALLS.length} calls safely. Remember: verify through a channel you trust, and never share codes, PINs or passwords.</p><button class="btn" id="fv">Continue to quiz</button></div>`;$('#fv').onclick=()=>ctx.done()}
 intro()}
/* ---------- level 1: data sorter desk shift ---------- */
/* [file name, preview text, class 0 Public / 1 Internal / 2 Confidential, why, owner] */
const FILES=[
['press_release_launch.docx','Our new product launches Monday. Media enquiries: pr@innovatiview.com.',0,'Approved for release, so it is Public.','Marketing'],
['careers_job_ad.pdf','We are hiring a QA engineer. Apply on our careers page.',0,'Job adverts are published for everyone.','HR'],
['marketing_flyer.png','Flyer: Innovatiview at Tech Expo 2026. Visit stall 14.',0,'Marketing material is meant to be seen by the public.','Marketing'],
['company_brochure.pdf','About us, our services and our offices.',0,'A published brochure is Public.','Marketing'],
['event_invite_techexpo.pdf','You are invited to our open demo day. Everyone is welcome.',0,'Invitations meant for outsiders are Public.','Events'],
['holiday_calendar_2026.pdf','Company holidays and optional holidays for 2026.',1,'Useful for staff but not for the public: Internal.','HR'],
['org_chart_q3.pdf','Teams, managers and reporting lines.',1,'Org charts help social engineers, so keep them Internal.','HR'],
['employee_handbook.pdf','Leave, conduct and expense policies for all staff.',1,'Staff policies are Internal.','HR'],
['team_standup_notes.txt','Release 4.2 testing done. Demo slot to be confirmed.',1,'Day-to-day working notes are Internal.','Platform team'],
['office_floor_plan.pdf','Floor 3: server room, exits, camera positions.',1,'Floor plans show security weak spots. Internal.','Facilities'],
['wifi_setup_guide.pdf','How to connect your laptop to the staff network.',1,'Internal IT guides should stay inside the company.','IT'],
['intranet_news_oct.docx','Welcome to our new joiners and the festival party plan.',1,'Internal news is for employees only.','Communications'],
['training_schedule.xlsx','Security training slots for October, per team.',1,'Internal planning data.','IT Security'],
['salary_review_2026.xlsx','Name, Grade, CTC: Priya S. | L4 | ₹18,40,000',2,'Pay details are Confidential: only HR and named managers.','HR'],
['customer_list_export.csv','Acme Corp, Mr. Rao, +91 98xxx, contract ₹4 Cr',2,'Customer data is Confidential and often protected by law.','Sales'],
['passwords_backup.txt','vpn: Winter#26 | admin: Root@123',2,'Credentials are Confidential. They should not be stored in a file at all.','IT'],
['board_minutes_q3.pdf','Acquisition of Falcon Ltd approved, not yet announced.',2,'Unannounced deals are Confidential.','Executive office'],
['source_code_core_v4.zip','Proprietary pricing engine, all modules.',2,'Source code is a core company asset: Confidential.','Engineering'],
['client_contract_acme.pdf','NDA signed. Do not disclose terms to any third party.',2,'Contracts under NDA are Confidential.','Legal'],
['hr_disciplinary_case.docx','Case 117: warning issued to employee ID 4821.',2,'Personnel cases are Confidential.','HR'],
['vpn_config_prod.ovpn','-----BEGIN PRIVATE KEY----- MIIEvQIBADANB...',2,'Private keys are Confidential.','IT'],
['bank_account_details.xlsx','Acct 4412 8890 3321 | vendor payments | approvers',2,'Bank details are Confidential.','Finance']];
const EXC={docx:'#60a5fa',xlsx:'#34d399',pdf:'#f87171',csv:'#34d399',txt:'#94a3b8',zip:'#ffb800',png:'#c4b5fd',ovpn:'#94a3b8'};
function sorter(el,ctx){
 const BN=[['Public','Approved for anyone','#48c5ed'],['Internal','Employees only','#d9aa5b'],['Confidential','Named people only','#ed9295']];
 const T0=120,FILE_TIME=18,COUNT=9;
 el.innerHTML=`<div class="sorter-intro" id="sorter-intro"><div class="sorter-kicker">LEVEL 01 · YOUR FIRST DESK SHIFT</div><h2>Every file has a place.</h2><p>You are at your Innovatiview desk. Nine documents have arrived. Read each one, then put it in the right tray before it leaves your desk.</p><div class="sorter-rules"><div class="sorter-rule"><b>01 / PUBLIC</b><small>Already approved for anyone to see, such as a published job advert.</small></div><div class="sorter-rule"><b>02 / INTERNAL</b><small>Useful to employees, but not intended for the public.</small></div><div class="sorter-rule"><b>03 / CONFIDENTIAL</b><small>Customer, financial, personnel, or secret business details.</small></div></div><button type="button" class="sorter-start" id="st0">TAKE YOUR SEAT →</button><small class="sorter-help">Tap a tray, drag the paper, or press 1, 2, or 3. You have two minutes. Feedback appears after every file.</small></div>
 <div class="sorter-game" id="sg" style="display:none"><div class="sorter-hud"><div><small>INCOMING DESK FILES</small><b id="sorter-progress">01 / ${COUNT}</b></div><div><small>SHIFT CLOCK</small><b id="sorter-time">2:00</b></div><div><small>DATA SAFETY</small><b id="sorter-vault">100%</b></div><div><small>POINTS</small><b id="sorter-points">0</b></div></div><div class="sorter-room" aria-hidden="true"><div class="sorter-window"></div><div class="sorter-screen"></div><div class="sorter-screen-stand"></div><div class="sorter-lamp"></div><div class="sorter-mug"></div><div class="sorter-keyboard"></div><div class="sorter-inbox"><b>INCOMING</b><small id="sorter-queue">9 files</small></div></div><div class="sorter-worktop"><div class="sorter-paper" id="sorter-doc" tabindex="0" aria-label="Current file. Drag it to a tray or select a tray below."></div></div><div class="sorter-action"><p class="sorter-action-label">WHERE SHOULD THIS DOCUMENT GO?</p><div class="sorter-trays">${BN.map((b,i)=>`<button type="button" class="sorter-tray" data-b="${i}" style="--tray:${b[2]}" aria-label="Sort as ${b[0]}"><span class="sorter-tray-icon">0${i+1}</span><span class="sorter-tray-copy"><b>${b[0].toUpperCase()}</b><small>${b[1]}</small></span><span class="sorter-tray-key">${i+1}</span></button>`).join('')}</div><div class="sorter-feedback" id="sorter-msg" role="status">Read the document on your desk, then choose a tray.</div></div></div>`;
 let queue=[],cur=null,t=T0,deadline=FILE_TIME,vault=100,combo=0,correct=0,seen=0,mistakes=[],clock=null,over=false,reviewing=false,drag=false,startX=0,startY=0;
 const find=s=>el.querySelector(s);
 const shuffle=items=>{const copy=items.slice();for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy};
 const minutes=s=>{const whole=Math.ceil(s);return `${Math.floor(whole/60)}:${String(whole%60).padStart(2,'0')}`};
 function paintHud(){find('#sorter-time').textContent=minutes(t);find('#sorter-time').classList.toggle('low',t<=20);find('#sorter-vault').textContent=vault+'%';find('#sorter-vault').classList.toggle('low',vault<=40);find('#sorter-vault').classList.toggle('good',vault>40);find('#sorter-points').textContent=S.lp;const bar=find('#sorter-deadline');if(bar){bar.style.width=Math.max(0,deadline/FILE_TIME*100)+'%';bar.style.background=deadline<=5?'#e9797f':'#1ca4dd'}}
 function showFile(){cur=queue.shift();seen++;deadline=FILE_TIME;reviewing=false;const extension=cur[0].split('.').pop().toUpperCase();find('#sorter-progress').textContent=String(seen).padStart(2,'0')+' / '+COUNT;find('#sorter-queue').textContent=queue.length+' waiting';find('#sorter-doc').className='sorter-paper';find('#sorter-doc').innerHTML=`<div class="sorter-paper-head"><span class="sorter-file-icon">${esc(extension)}</span><span class="sorter-file-meta"><b>${esc(cur[0])}</b><small>FROM: ${esc(cur[4])} · INCOMING</small></span></div><div class="sorter-paper-label">DOCUMENT PREVIEW</div><div class="sorter-preview">${esc(cur[1])}</div><div class="sorter-deadline" aria-label="Time left for this file"><b id="sorter-deadline"></b></div><div class="sorter-paper-footer"><span>READ BEFORE FILING</span><span>DRAG OR TAP A TRAY</span></div>`;find('#sorter-msg').className='sorter-feedback';find('#sorter-msg').textContent='Read the document on your desk, then choose a tray.';el.querySelectorAll('.sorter-tray').forEach(b=>b.disabled=false);paintHud()}
 function feedback(title,explanation,tone){const box=find('#sorter-msg');box.className='sorter-feedback '+tone;box.innerHTML=`<span><b>${title}</b>${esc(explanation)}</span><button type="button" class="sorter-next" id="sorter-next">${queue.length&&vault>0&&t>0?'NEXT FILE →':'VIEW SHIFT REPORT →'}</button>`}
 function classify(choice){if(over||reviewing||!cur)return;reviewing=true;const category=cur[2],file=cur;el.querySelectorAll('.sorter-tray').forEach(b=>b.disabled=true);
  if(choice===category){correct++;combo++;ctx.add(25+Math.min(combo-1,4)*5,combo>1?'combo x'+combo:'sorted');SFX.ok();find('#sorter-doc').classList.add('resolved','review-good');feedback('Filed correctly · '+BN[category][0],file[3],'good')}
  else if(choice<0){combo=0;vault=Math.max(0,vault-15);mistakes.push({file,choice});ctx.add(-20,'too slow');SFX.bad();find('#sorter-doc').classList.add('resolved','review-bad');feedback('Time ran out · '+BN[category][0],file[3],'warn')}
  else if(choice>category){combo=0;mistakes.push({file,choice});ctx.add(-10,'too strict');SFX.bad();find('#sorter-doc').classList.add('resolved','review-bad');feedback('Too restrictive · '+BN[category][0],file[3]+' Keeping useful information too restricted slows work.','warn')}
  else{combo=0;vault=Math.max(0,vault-10*(category-choice));mistakes.push({file,choice});ctx.add(-20*(category-choice),'data leak');SFX.bad();find('#sorter-doc').classList.add('resolved','review-bad');feedback('Data risk · '+BN[category][0],file[3]+' This needs a more protected tray.','bad')}
  paintHud()}
 function finish(){if(over)return;over=true;clearInterval(clock);document.removeEventListener('keydown',onKey);const held=vault>0,accuracy=correct/Math.max(1,correct+mistakes.length),grade=held&&accuracy>=.9?'S':accuracy>=.8?'A':accuracy>=.65?'B':accuracy>=.5?'C':'D';if(held)ctx.add(Math.round(vault/2),'data safety bonus');SFX[held?'win':'lose']();el.innerHTML=`<div class="sorter-report"><div class="sorter-kicker">DESK SHIFT COMPLETE</div><h2>Your filing report</h2><div class="sorter-report-grid"><div class="sorter-grade">${grade}</div><div><b>${correct} of ${seen} files sorted correctly</b><p>Data safety: ${vault}% · ${mistakes.length} to review. ${held?'You kept the desk secure.':'The desk needs more care next shift.'}</p></div></div>${mistakes.length?`<div class="sorter-review">${mistakes.slice(0,9).map(m=>`<article><b>${esc(m.file[0])}</b><span>${m.choice<0?'Not sorted':BN[m.choice][0]} → ${BN[m.file[2]][0]}</span><div>${esc(m.file[3])}</div></article>`).join('')}</div>`:'<p>Perfect filing. You recognized what should be shared and what must stay protected.</p>'}<button type="button" class="btn" id="fin5">CONTINUE TO KNOWLEDGE CHECK →</button></div>`;find('#fin5').onclick=()=>ctx.done()}
 function next(){if(!reviewing)return;if(queue.length&&vault>0&&t>0)showFile();else finish()}
 function onKey(event){if(over||!el.isConnected||event.target.closest('input,textarea,select'))return;const code=event.key;if(reviewing&&(code==='Enter'||code===' ')){event.preventDefault();next();return}const number=Number(code);if(!reviewing&&number>=1&&number<=3&&String(number)===code){event.preventDefault();classify(number-1)}}
 find('#st0').onclick=()=>{find('#sorter-intro').remove();find('#sg').style.display='block';window.scrollTo(0,0);queue=shuffle([0,1,2].flatMap(category=>shuffle(FILES.filter(f=>f[2]===category)).slice(0,COUNT/3)));showFile();document.addEventListener('keydown',onKey);const paper=find('#sorter-doc');paper.onpointerdown=e=>{if(reviewing||over)return;drag=true;startX=e.clientX;startY=e.clientY;try{paper.setPointerCapture(e.pointerId)}catch(error){}};paper.onpointermove=e=>{if(drag)paper.style.transform=`translate(${e.clientX-startX}px,${e.clientY-startY}px) rotate(${(e.clientX-startX)/35-2}deg)`};paper.onpointerup=e=>{if(!drag)return;drag=false;paper.style.transform='';paper.style.visibility='hidden';const target=document.elementFromPoint(e.clientX,e.clientY);paper.style.visibility='';const tray=target&&target.closest('.sorter-tray');if(tray)classify(+tray.dataset.b)};find('#sg').onclick=e=>{const tray=e.target.closest('.sorter-tray');if(tray)classify(+tray.dataset.b);else if(e.target.closest('#sorter-next'))next()};clock=setInterval(()=>{if(!el.isConnected){clearInterval(clock);document.removeEventListener('keydown',onKey);return}if(over||reviewing)return;t=Math.max(0,t-.1);deadline=Math.max(0,deadline-.1);paintHud();if(t<=0)classify(-1);else if(deadline<=0)classify(-1)},100)};
}
/* ---------- rewards ---------- */
const REW=[
{id:'cafe',name:'Cafeteria coupon',req:1000,d:'One free meal at the office cafeteria.',i:'coupon'},
{id:'bottle',name:'Steel water bottle',req:2000,d:'Insulated 750 ml bottle with the CyberQuest logo.',i:'bottle'},
{id:'mug',name:'CyberQuest mug',req:2800,d:'Ceramic coffee mug for your desk.',i:'mug'},
{id:'tee',name:'CyberQuest t-shirt',req:3500,d:'Soft cotton tee in the arcade colours.',i:'tee'},
{id:'gift',name:'Gift voucher',req:4200,d:'Grand prize shopping voucher for top defenders.',i:'gift'}];
const ICON={
coupon:'<rect x="6" y="16" width="52" height="32" fill="#ffb800"/><rect x="2" y="28" width="8" height="8" fill="#181920"/><rect x="54" y="28" width="8" height="8" fill="#181920"/><path d="M42 18V46" stroke="#0b0c0e" stroke-dasharray="3 3"/><text x="24" y="36" font-size="9" fill="#0b0c0e" text-anchor="middle" font-family="JetBrains Mono" font-weight="700">MEAL</text><text x="50" y="36" font-size="7" fill="#0b0c0e" text-anchor="middle" font-family="JetBrains Mono" font-weight="700">1x</text>',
bottle:'<rect x="26" y="4" width="12" height="8" fill="#ffb800"/><rect x="28" y="12" width="8" height="6" fill="#94a3b8"/><rect x="20" y="18" width="24" height="42" fill="#10b981"/><rect x="20" y="32" width="24" height="14" fill="#f8fafc"/><text x="32" y="42" font-size="8" fill="#0b0c0e" text-anchor="middle" font-family="JetBrains Mono" font-weight="700">CQ</text>',
mug:'<rect x="10" y="16" width="34" height="36" fill="#f8fafc"/><rect x="44" y="24" width="10" height="18" fill="none" stroke="#f8fafc" stroke-width="5"/><rect x="10" y="16" width="34" height="8" fill="#ffb800"/><text x="27" y="42" font-size="9" fill="#0b0c0e" text-anchor="middle" font-family="JetBrains Mono" font-weight="700">CQ</text>',
tee:'<polygon points="14,12 24,8 32,14 40,8 50,12 60,24 52,30 48,26 48,56 16,56 16,26 12,30 4,24" fill="#10b981"/><text x="32" y="40" font-size="10" fill="#0b0c0e" text-anchor="middle" font-family="JetBrains Mono" font-weight="700">CQ</text>',
gift:'<rect x="12" y="26" width="40" height="30" fill="#ef4444"/><rect x="29" y="26" width="6" height="30" fill="#ffb800"/><rect x="12" y="36" width="40" height="6" fill="#ffb800"/><rect x="22" y="16" width="20" height="10" fill="#ffb800"/>'};
const allDone=()=>LV.every(l=>S.done.includes(l.n));
function nextRew(){const nr=REW.slice().sort((a,b)=>a.req-b.req).find(r=>S.score<r.req);
 return `<div class="inset"><div class="lbl">Next reward</div><div class="big" style="font-size:16px;line-height:24px">${allDone()?(nr?nr.name:'All unlocked'):'Locked'}</div><div class="mut">${allDone()?(nr?fmt(nr.req-S.score)+' pts to go':'Claim them all'):S.done.length+'/'+LV.length+' levels cleared'}</div></div>`}
function vAdmin(){const rows=[];CALLS.forEach((c,i)=>Object.keys(c.nodes).forEach(id=>rows.push({key:'c'+(i+1)+'-'+id,call:c.name,text:c.nodes[id].s.replace(/\[\[(.+?)\|.+?\]\]/g,'$1')})));
 $('#app').insertAdjacentHTML('beforeend',`<div class="panel" id="vx"><div class="cart-h"><span class="lbl">Voice recordings // Level 4</span><span class="chip"><i class="led"></i>Optional</span></div><p class="mut" style="max-width:70ch">Each caller line can play a pre-recorded voice. Lines without a recording use the built-in synthetic voice. ${SERVER?'Recordings are stored on the server and every player hears them straight away.':(STATIC?'Recordings made here are stored in this browser only. Use Download for each line, copy the files into public/audio/voice/ with the names shown, then redeploy.':'Recordings added here are stored in this browser only. To ship them to everyone, host the files with the names shown (for example c1-a.mp3) and set VOICE.base to their folder.')}</p>${rows.map(r=>`<div class="inset" style="margin-top:8px" data-k="${r.key}"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><span class="lbl">${r.call} // ${r.key}.mp3</span><span class="chip" data-st><i class="led"></i>Synthetic voice</span></div><p class="mut" style="margin:6px 0 8px">“${r.text}”</p><div style="display:flex;gap:6px;flex-wrap:wrap"><label class="btn sub" style="padding:6px 10px">Upload<input type="file" accept="audio/*" data-up hidden></label><button class="btn sub" data-vr style="padding:6px 10px">Record</button><button class="btn sub" data-vp style="padding:6px 10px">Play</button><button class="btn sub" data-vd style="padding:6px 10px">Remove</button>${SERVER?'':'<button class="btn sub" data-vx style="padding:6px 10px">Download</button>'}</div></div>`).join('')}</div>`);
 const root=$('#vx'),refresh=()=>VST.keys().then(ks=>root.querySelectorAll('[data-k]').forEach(r=>{const has=ks.includes(r.dataset.k);r.querySelector('[data-st]').innerHTML=`<i class="led ${has?'g':''}"></i>${has?'Recorded':'Synthetic voice'}`})).catch(()=>{});
 refresh();
 root.onchange=e=>{const i=e.target.closest('[data-up]');if(!i||!i.files[0])return;const f=i.files[0],k=i.closest('[data-k]').dataset.k;if(f.size>8e6){toast('File too large (max 8 MB)','#ef4444');return}VST.put(k,f).then(()=>{toast('Recording saved','#10b981');refresh()}).catch(()=>toast('Could not save here','#ef4444'))};
 root.onclick=async e=>{const row=e.target.closest('[data-k]');if(!row)return;const k=row.dataset.k;
  if(e.target.closest('[data-vp]')){const src=await VOICE.src(k);src?VOICE.play(src,()=>{},()=>toast('Could not play this file','#ef4444')):toast('No recording yet','#ffb800')}
  else if(e.target.closest('[data-vx]')){const b=await VDB.get(k).catch(()=>null);if(!b){toast('No recording yet','#ffb800');return}const x={'audio/mpeg':'mp3','audio/mp4':'m4a','audio/webm':'webm','audio/ogg':'ogg','audio/wav':'wav'}[(b.type||'').split(';')[0]]||'webm',a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=k+'.'+x;document.body.appendChild(a);a.click();a.remove()}
  else if(e.target.closest('[data-vd]')){VST.del(k).then(refresh).catch(()=>{})}
  else if(e.target.closest('[data-vr]')){const b=e.target.closest('[data-vr]');if(vAdmin.m){vAdmin.m.stop();return}
   try{const st=await navigator.mediaDevices.getUserMedia({audio:true}),m=new MediaRecorder(st),ch=[];vAdmin.m=m;b.textContent='Stop';m.ondataavailable=x=>ch.push(x.data);m.onstop=()=>{st.getTracks().forEach(t=>t.stop());vAdmin.m=null;b.textContent='Record';VST.put(k,new Blob(ch,{type:m.mimeType||'audio/webm'})).then(()=>{toast('Recording saved','#10b981');refresh()}).catch(x=>toast(x.message,'#ef4444'))};m.start()}catch(x){toast('Microphone not available here. Upload a file instead.','#ef4444')}}}}
const _adm=V.admin;V.admin=function(){_adm();vAdmin()};
/* ---------- server mode (used when the page is served by the CyberQuest backend) ---------- */
function applyMe(me){S.user=me.user;S.photo=readServerPhoto(me.user.id);S.name=me.user.mustChange?'':me.user.name;S.admin=me.user.role=='admin';S.best=me.best||{};S.done=me.cleared||[];S.cases=me.cases||{};S.claimed=me.claims||{};S.rank=me.rank;S.score=total();try{S.basics=cleanBasics(JSON.parse(localStorage.getItem(basicsUserKey(me.user.id))||'null'))}catch(e){S.basics=cleanBasics(null)}}
function applyCfg(cfg,vm){LV.forEach(l=>{const c=cfg.levels.find(x=>x.n==l.n);if(c)l.q=c.quiz.map(z=>[z.q,z.options,-1,''])});REW.length=0;cfg.rewards.forEach(r=>REW.push({id:r.id,name:r.name,req:r.req,d:r.d,i:r.i}));VOICE.man=vm||{}}
async function boot(){
 load();
 if(!SERVER){if(document.body.dataset.entry==='login')S.view='welcome';else if(!S.name){location.replace('/login');return}if(STATIC)fetch('/audio/voice/manifest.json',{cache:'no-cache'}).then(r=>r.ok?r.json():{}).then(m=>{VOICE.man=m||{}}).catch(()=>{});S.score=total();render();return}
 try{const me=await api('/me');applyMe(me);
  if(me.user.mustChange){S.view='pwd';render();return}
  const [cfg,vm]=await Promise.all([api('/config'),api('/voice')]);applyCfg(cfg,vm);
  if(document.body.dataset.entry==='login'){location.replace('/');return}
  if(['login','pwd','welcome'].includes(S.view))S.view='games';render()
 }catch(e){if(e.status==401){S.user=null;S.name='';S.view='login';render()}else{S.view='login';render();const m=$('#lerr');if(m)m.textContent=e.message}}}
const FIELD='width:100%;margin:6px 0 14px;padding:12px;background:#0b0c0e;color:#f8fafc;border:1px solid #323542;font:inherit';
V.road=lobbyMissions;
V.top=()=>{$('#app').innerHTML=leaderboardView(board().map((r,i)=>({rank:i+1,name:r[0],score:r[1],me:!!r[2]})),{sample:true})};
V.login=lobbyLogin;
V.pwd=function(){const must=S.user&&S.user.mustChange;
 $('#app').innerHTML=`<div class="panel" style="max-width:520px;margin:40px auto"><div class="cart-h"><span class="lbl">Account // Password</span><span class="chip"><i class="led ${must?'r':''}"></i>${must?'Change required':'Change password'}</span></div><h2>Choose a new password</h2><p class="mut">${must?'You must choose your own password before you continue.':'Pick a password only you know.'} Use at least 10 characters.</p>
 <label class="lbl" for="p0">Current password</label><input id="p0" type="password" autocomplete="current-password" style="${FIELD}"><label class="lbl" for="p1">New password</label><input id="p1" type="password" autocomplete="new-password" style="${FIELD}"><label class="lbl" for="p2">Repeat new password</label><input id="p2" type="password" autocomplete="new-password" style="${FIELD}">
 <div id="perr" class="red" role="alert" style="min-height:22px;margin-bottom:8px"></div><button class="btn" data-a="dopwd">Save password</button> ${must?'':'<button class="btn sub" data-a="nav" data-v="dash">Cancel</button>'}</div>`;$('#p0').focus()};
if(SERVER){
 V.top=function(){$('#app').innerHTML='<div class="panel"><p class="mut">Loading…</p></div>';
  Promise.all([api('/leaderboard?scope=today&limit=25'),api('/leaderboard?scope=all&limit=25')]).then(([d,a])=>{if(S.view!='top')return;
   const m=d.rows.find(r=>r.me)||d.me;if(m){S.rank=m.rank;hdr()}
   $('#app').innerHTML=leaderboardView(d.rows,{title:'Today’s top defenders',me:d.me})+leaderboardView(a.rows,{title:'All-time legends',me:a.me});
  }).catch(e=>{$('#app').innerHTML=`<div class="panel"><p class="red">${esc(e.message)}</p></div>`})};
 V.admin=async function(){$('#app').innerHTML='<div class="panel"><p class="mut">Loading…</p></div>';
  try{const [st,rw,cl,fl,us]=await Promise.all([api('/admin/stats'),api('/admin/rewards'),api('/admin/claims'),api('/admin/attempts?flagged=1'),api('/admin/users')]);
   if(S.view!='admin')return;
   const when=t=>t?new Date(t).toLocaleString():'never',IN='padding:6px;background:#0b0c0e;color:#f8fafc;border:1px solid #323542;font:inherit';
   $('#app').innerHTML=`${S.admMsg?`<div class="panel" role="status"><b class="amb">${esc(S.admMsg)}</b></div>`:''}
   <div class="panel"><div class="cart-h"><span class="lbl">Admin // Overview</span><a class="btn sub" style="padding:6px 10px" href="/api/admin/export/progress.csv">Export progress CSV</a></div>
    <div class="grid"><div class="inset"><div class="lbl">Players</div><div class="big">${st.users}</div></div><div class="inset"><div class="lbl">Active, last 24h</div><div class="big">${st.activeLast24h}</div></div><div class="inset"><div class="lbl">Cleared all levels</div><div class="big">${st.completedAll}</div></div><div class="inset"><div class="lbl">Flagged attempts</div><div class="big ${st.flagged?'red':''}">${st.flagged}</div></div></div>
    <table><tr class="lbl"><th>Level</th><th>Players who cleared it</th><th>Average best score</th></tr>${st.perLevel.map(l=>`<tr><td>${l.level}</td><td>${l.cleared}</td><td>${fmt(l.avg||0)}</td></tr>`).join('')}</table></div>
   <div class="panel"><div class="cart-h"><span class="lbl">Rewards catalog</span></div><table><tr class="lbl"><th>Reward</th><th>Score</th><th>Stock</th><th>On</th><th></th></tr>${rw.map(r=>`<tr data-id="${r.id}"><td>${esc(r.name)}</td><td><input data-f="req" type="number" min="0" step="100" value="${r.req}" style="width:90px;${IN}"></td><td><input data-f="stock" type="number" min="0" placeholder="unlimited" value="${r.stock===null?'':r.stock}" style="width:100px;${IN}"></td><td><input data-f="active" type="checkbox" ${r.active?'checked':''} aria-label="Active"></td><td><button class="btn sub" style="padding:6px 10px" data-a="adm" data-v="rw">Save</button></td></tr>`).join('')}</table></div>
   <div class="panel"><div class="cart-h"><span class="lbl">Reward claims</span></div>${cl.length?`<table><tr class="lbl"><th>Code</th><th>Player</th><th>Reward</th><th>Status</th><th></th></tr>${cl.map(c=>`<tr data-code="${esc(c.code)}"><td><b>${esc(c.code)}</b></td><td>${esc(c.name)}<br><span class="mut">${esc(c.email)}</span></td><td>${esc(c.reward)}</td><td>${c.status}</td><td>${c.status=='issued'?'<button class="btn sub" style="padding:6px 10px" data-a="adm" data-v="collect">Collected</button> <button class="btn sub" style="padding:6px 10px" data-a="adm" data-v="cancel">Cancel</button>':''}</td></tr>`).join('')}</table>`:'<p class="mut">No claims yet.</p>'}</div>
   <div class="panel"><div class="cart-h"><span class="lbl">Flagged attempts</span></div>${fl.length?`<table><tr class="lbl"><th>Player</th><th>Level</th><th>Score</th><th>Reason</th><th></th></tr>${fl.map(a=>`<tr data-aid="${a.id}"><td>${esc(a.name)}<br><span class="mut">${esc(a.email)}</span></td><td>${a.level}</td><td>${a.score??'-'}</td><td>${esc(a.flag_reason||'')}</td><td><button class="btn sub" style="padding:6px 10px" data-a="adm" data-v="dismiss">Dismiss</button> <button class="btn red" style="padding:6px 10px" data-a="adm" data-v="void">Void</button></td></tr>`).join('')}</table>`:'<p class="mut">Nothing to review.</p>'}</div>
   <div class="panel"><div class="cart-h"><span class="lbl">Players</span></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><input id="nu-e" type="email" placeholder="email@${esc(window.CQ_DOMAIN||'company.com')}" style="${IN}"><input id="nu-n" placeholder="Full name" style="${IN}"><select id="nu-r" style="${IN}"><option value="player">Player</option><option value="admin">Admin</option></select><button class="btn" data-a="adm" data-v="newuser">Add player</button></div>
    <table><tr class="lbl"><th>Player</th><th>Cleared</th><th>Score</th><th>Last login</th><th></th></tr>${us.map(u=>`<tr data-uid="${u.id}"><td>${esc(u.name)}${u.role=='admin'?' <span class="chip">admin</span>':''}${u.active?'':' <span class="chip">inactive</span>'}<br><span class="mut">${esc(u.email)}</span></td><td>${u.cleared}/5</td><td>${fmt(u.total)}</td><td class="mut">${when(u.last_login)}</td><td>${window.CQ_AUTH=='password'?'<button class="btn sub" style="padding:6px 10px" data-a="adm" data-v="reset">Reset password</button> ':''}<button class="btn sub" style="padding:6px 10px" data-a="adm" data-v="${u.active?'off':'on'}">${u.active?'Deactivate':'Activate'}</button></td></tr>`).join('')}</table></div>`;
   S.admMsg='';vAdmin()
  }catch(e){$('#app').innerHTML=`<div class="panel"><p class="red">${esc(e.message)}</p></div>`}};
}
V.welcome=lobbyWelcome;
V.basics=basicsView;
V.profile=lobbyProfile;
V.rew=function(){const all=allDone(),anyC=Object.keys(S.claimed).length;
 $('#app').innerHTML=`<div class="panel"><div class="cart-h"><span class="lbl">Rewards cabinet</span><span class="chip"><i class="led ${all?'g':'r'}"></i>${all?'Unlocked':'Locked'}</span></div>
 <h2>Earn real rewards</h2><p class="mut" style="max-width:64ch">Clear all ${LV.length} levels, then reach a reward's score to claim it. Wrong answers and false alarms lower your score, so play carefully.</p>
 <div class="grid" style="margin-top:14px"><div class="inset"><div class="lbl">Levels cleared</div><div class="big">${S.done.length} / ${LV.length}</div><div class="seg">${LV.map(l=>`<b class="${S.done.includes(l.n)?'f':''}"></b>`).join('')}</div></div><div class="inset"><div class="lbl">Your score</div><div class="big">${fmt(S.score)}</div><div class="mut">${all?'Gate open':'Clear every level to open the gate'}</div></div></div></div>
 <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(230px,1fr))">${REW.map((r,k)=>{const ok=all&&S.score>=r.req,c=S.claimed[r.id],p=Math.min(100,S.score/r.req*100);
  return `<div class="panel"><div class="cart-h"><span class="lbl">Reward-0${k+1}</span><span class="chip"><i class="led ${c?'g':ok?'':'r'}"></i>${c?'Claimed':ok?'Ready':'Locked'}</span></div>
  <div class="inset" style="display:grid;place-items:center;padding:14px"><svg viewBox="0 0 64 64" width="96" height="96" style="shape-rendering:crispEdges">${ICON[r.i]}</svg></div>
  <h3 style="margin:12px 0 4px">${r.name}</h3><div class="mut" style="min-height:40px">${r.d}</div>
  <div class="lbl" style="margin-top:10px">Needs ${fmt(r.req)} pts + all levels</div><div style="height:6px;background:#323542;margin:6px 0 12px"><b style="display:block;height:100%;width:${p}%;background:${ok?'#10b981':'#ffb800'}"></b></div>
  ${c?`<div class="inset mint" style="text-align:center;font-weight:700">CODE: ${c}</div>`:`<button class="btn" style="width:100%;box-sizing:border-box" data-a="claim" data-v="${r.id}" ${ok?'':'disabled'}>${ok?'Claim reward':all?fmt(r.req-S.score)+' pts to go':'Clear all levels'}</button>`}</div>`}).join('')}</div>
 ${anyC?'<p class="mut">Show your code at the HR desk with your employee ID to collect the reward.</p>':''}`};
/* ---------- wiring ---------- */
const act={nav:v=>{leaveFirewallScreen();if(S.view=='play')S.score=total();VOICE.stop();SFX.duck(0);S.menuOpen=false;if(v!=='road')S.lastResult=null;S.view=v;render()},dismissResult:()=>{S.lastResult=null;render()},menu:()=>{S.menuOpen=!S.menuOpen;const dock=$('#bottom-dock');dock.querySelector('#bottom-dock-panel').hidden=!S.menuOpen;dock.querySelector('.bottom-dock-toggle').setAttribute('aria-expanded',String(S.menuOpen));dock.querySelector('.bottom-dock-toggle').setAttribute('aria-label',S.menuOpen?'Close options menu':'Open options menu');dock.querySelector('.bottom-dock-toggle b').textContent=S.menuOpen?'×':'⌃'},fx:()=>{SFX.toggle('sfx');hdr()},mus:()=>{SFX.toggle('music');hdr()},setname:()=>{const v=$('#nm').value.replace(/\s+/g,' ').trim().slice(0,40);if(!v){toast('Please enter your name','#ef4444');return}const previous=S.name;S.name=v;S.view='games';if(document.body.dataset.entry==='login'){if(!save()){S.name=previous;S.view='welcome';toast('Your browser could not save the player profile. Please enable browser storage.','#ef4444');return}location.assign('/');return}render()},rename:()=>{S.view='welcome';render()},resetme:()=>{if(!act._c){act._c=1;toast('Click again to confirm reset','#ffb800');setTimeout(()=>act._c=0,4000);return}act._c=0;S.best={};S.done=[];S.claimed={};S.cases={};S.score=0;S.sel=1;S.view='dash';render();toast('Progress reset','#10b981')},sel:v=>{S.sel=+v;render()},play:v=>play(+v),quickplay:v=>play(+v,true),
 asg:(v,e)=>{S.assign[v]=e.value},reg:()=>{const n=$('#gn').value.trim();if(n){GAMES['g'+Date.now()]={title:n,mount:GAMES.stub.mount};render();toast('Game added','#10b981')}},
 unlock:()=>{S.done=[1,2,3,4];render()},reset:()=>{S.score=0;S.best={};S.done=[];S.sel=1;S.claimed={};S.cases={};render()},demo:()=>{S.done=[1,2,3,4,5];S.best={1:1600,2:800,3:700,4:250,5:250};S.score=total();render()},claim:v=>{const r=REW.find(x=>x.id==v);if(!r||S.claimed[v]||!allDone()||S.score<r.req)return;if(SERVER){api('/rewards/'+v+'/claim','POST').then(d=>{S.claimed[v]=d.code;SFX.win();render();toast('Reward claimed','#10b981')}).catch(e=>toast(e.message,'#ef4444'));return}S.claimed[v]='CQ-'+v.toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase();SFX.win();render();toast('Reward claimed','#10b981')}};
Object.assign(act,{
 profile:()=>act.nav('profile'),
 entry:()=>location.assign('/login'),
 dologin:()=>{const em=$('#em').value.trim(),pw=$('#pw').value;if(!em||!pw){$('#lerr').textContent='Enter your email and password.';return}
  api('/auth/login','POST',{email:em,password:pw}).then(()=>boot()).catch(e=>{$('#lerr').textContent=e.message;SFX.bad()})},
 pwd:()=>{S.view='pwd';render()},
 dopwd:()=>{const c=$('#p0').value,n=$('#p1').value;if(n!==$('#p2').value){$('#perr').textContent='The new passwords do not match.';return}
  api('/me/password','POST',{current:c,next:n}).then(()=>{toast('Password changed','#10b981');S.view='games';boot()}).catch(e=>{$('#perr').textContent=e.message})},
 logout:()=>{api('/auth/logout','POST').catch(()=>{}).finally(()=>{S.user=null;S.admin=false;S.name='';S.photo='';S.best={};S.done=[];S.claimed={};S.cases={};S.score=0;S.view='login';render()})},
 adm:async(v,el)=>{const tr=el.closest('tr'),done=m=>{S.admMsg=m||'';V.admin()},fail=e=>{S.admMsg=e.message;V.admin()};
  try{
   if(v=='rw'){const g=f=>tr.querySelector('[data-f='+f+']'),sv=g('stock').value.trim();await api('/admin/rewards/'+tr.dataset.id,'PUT',{req:+g('req').value,stock:sv===''?null:+sv,active:g('active').checked});done('Reward saved')}
   else if(v=='collect'||v=='cancel'){await api('/admin/claims/'+tr.dataset.code+'/'+v,'POST');done('Claim updated')}
   else if(v=='dismiss'||v=='void'){await api('/admin/attempts/'+tr.dataset.aid+'/review','POST',{action:v});done('Attempt reviewed')}
   else if(v=='reset'){const r=await api('/admin/users/'+tr.dataset.uid+'/reset-password','POST');done('Temporary password (shown once): '+r.tempPassword)}
   else if(v=='off'||v=='on'){await api('/admin/users/'+tr.dataset.uid+'/active','POST',{active:v=='on'});done('User updated')}
   else if(v=='newuser'){const r=await api('/admin/users','POST',{email:$('#nu-e').value,name:$('#nu-n').value,role:$('#nu-r').value});done('Created '+r.email+'. Temporary password (shown once): '+r.tempPassword)}
  }catch(e){fail(e)}}});
document.addEventListener('click',e=>{const a=e.target.closest('[data-a]');if(a&&a.tagName!='SELECT'&&act[a.dataset.a])act[a.dataset.a](a.dataset.v,a)});
document.addEventListener('click',e=>{if(S.menuOpen&&!e.target.closest('#bottom-dock'))act.menu()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&S.menuOpen){act.menu();$('#bottom-dock .bottom-dock-toggle')?.focus()}});
document.addEventListener('change',e=>{if(e.target.dataset.a=='asg')act.asg(e.target.dataset.v,e.target);if(e.target.dataset.a=='req'){const r=REW.find(x=>x.id==e.target.dataset.v);if(r&&+e.target.value>=0)r.req=+e.target.value}});
function render(){if(SERVER){if(!S.user&&S.view!='pwd')S.view='login'}else if(!S.name)S.view='welcome';if(S.view=='admin'&&!ADMIN())S.view='dash';if(S.name&&!basicsComplete()&&!['welcome','login','pwd','basics','admin'].includes(S.view))S.view='basics';hdr();V[S.view]();dailyPaint()}
function crash(e){try{console.error(e)}catch(x){}$('#err').hidden=false}
window.addEventListener('error',e=>crash(e.error||e.message));window.addEventListener('unhandledrejection',e=>crash(e.reason));
$('#rl').onclick=()=>location.reload();
document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()=='a'){try{localStorage.setItem('cq-admin',localStorage.getItem('cq-admin')=='1'?'0':'1')}catch(x){}render()}});

/* Daily playtime, paused whenever the game is not visible. The v2 key gives
   players a fresh allowance after the earlier countdown became stuck. */
const DAILY_PLAY_KEY='cyberquest.daily-play.v2',DAILY_PLAY_MS=15*60*1000;
let dailyActive=false,dailyLast=Date.now(),dailyMemory=null;
function dailyDate(now=new Date()){return now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate()}
function dailyRead(){
 const day=dailyDate(),fresh={day,used:0,updated:Date.now()};
 try{const raw=localStorage.getItem(DAILY_PLAY_KEY);if(raw){const saved=JSON.parse(raw);if(saved&&saved.day===day&&Number.isFinite(saved.used)&&saved.used>=0&&saved.used<=DAILY_PLAY_MS)return saved}}
 catch(e){}
 return dailyMemory&&dailyMemory.day===day?dailyMemory:fresh
}
function dailyWrite(record){dailyMemory=record;try{localStorage.setItem(DAILY_PLAY_KEY,JSON.stringify(record))}catch(e){}}
function dailyRemaining(){return Math.max(0,DAILY_PLAY_MS-dailyRead().used)}
function dailyText(){const secs=Math.ceil(dailyRemaining()/1000);return String(Math.floor(secs/60)).padStart(2,'0')+':'+String(secs%60).padStart(2,'0')}
function dailyPaint(){
 let badge=document.getElementById('daily-clock');if(!badge){badge=document.createElement('div');badge.id='daily-clock';badge.className='daily-clock';document.querySelector('header').appendChild(badge)}
 badge.hidden=!S.name||['welcome','login','pwd','basics'].includes(S.view);badge.textContent='TODAY '+dailyText();badge.title='15 minutes of visible gameplay per day. Resets at local midnight.';
 document.querySelectorAll('[data-daily-time]').forEach(e=>e.textContent=dailyText());
 document.querySelectorAll('[data-a="play"],[data-a="quickplay"]').forEach(b=>{if(!dailyRemaining()){b.disabled=true;b.dataset.dailyLocked='1'}else if(b.dataset.dailyLocked){b.disabled=!open(+b.dataset.v);delete b.dataset.dailyLocked}})
}
function dailyAllow(){
 if(dailyRemaining()>0)return true;
 dailyActive=false;leaveFirewallScreen();VOICE.stop();SFX.duck(0);S.score=total();S.view='games';render();
 const notice=document.createElement('div');notice.className='daily-expired';notice.setAttribute('role','alert');notice.innerHTML='<b>Your daily playtime is complete.</b><p>Your 15 minutes reset at local midnight. Your progress is saved.</p>';document.getElementById('app').prepend(notice);return false
}
function dailyTick(){
 const now=Date.now();
 if(dailyActive&&S.view==='play'&&!document.hidden){
  const record=dailyRead();record.used=Math.min(DAILY_PLAY_MS,record.used+Math.max(0,now-Math.max(dailyLast,Number(record.updated)||dailyLast)));record.updated=now;dailyWrite(record);
  if(record.used>=DAILY_PLAY_MS)dailyAllow()
 }
 dailyLast=now;dailyPaint()
}
setInterval(dailyTick,250);
window.addEventListener('pagehide',dailyTick);
document.addEventListener('visibilitychange',()=>{dailyLast=Date.now();dailyPaint()});
window.addEventListener('storage',e=>{if(e.key===DAILY_PLAY_KEY){dailyPaint();if(dailyActive&&!dailyRemaining())dailyAllow()}});

boot();

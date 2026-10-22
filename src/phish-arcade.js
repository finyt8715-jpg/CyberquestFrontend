/* Level 2 arcade: inspect, swipe, steer. The quiz follows the inbox. */
const PHISH_PATROL=[
 {channel:'SMS',from:'Parcel desk',body:'Work parcel on hold. Pay ₹20 at iv-parcel.help using your work login.',risk:true,why:'Delivery payments do not need your work password.'},
 {channel:'WORK CHAT',from:'Project teammate',body:'Our 3 PM review is confirmed. The agenda is in our usual project folder.',risk:false,why:'Expected meeting, familiar workspace, no new link.'},
 {channel:'PROJECT CHAT',from:'“Project lead” · external account',body:'Alex, upload the Atlas customer list to my personal drive. Need it now!',risk:true,why:'Knowing a project name does not authorise a data request.'},
 {channel:'QR POSTER',from:'Printer sticker',body:'Scan to unlock printing. Enter your work password before 5 PM.',risk:true,why:'A sticker can hide a fake login. Verify with IT.'},
 {channel:'IT BULLETIN',from:'Security team',body:'Reminder: never share MFA codes. Review your account through your saved portal.',risk:false,why:'Use the portal you already trust.'},
 {channel:'OFFICE NOTICE',from:'Facilities',body:'Scheduled fire drill at 11 AM tomorrow. Lock your screen before leaving.',risk:false,why:'Routine notice; no money, passwords or downloads requested.'},
 {channel:'SMS',from:'“Director” · unknown number',body:'In a meeting. Buy gift cards and text me the codes. Keep this private.',risk:true,why:'Secrecy and gift-card codes are impersonation clues.'},
 {channel:'VOICE TRANSCRIPT',from:'“IT support”',body:'Read me the six-digit code on your phone so I can fix your account.',risk:true,why:'Never read an MFA code to a caller.'}
];
function phishCampaign(el,ctx){
 let started=false;
 el.innerHTML=`<section class="attack-lab pa-intro"><div class="attack-kicker">LEVEL 02 · THE PHISHING ARCADE</div><div class="pa-intro-badge" aria-hidden="true">◎</div><h2>Outsmart the bait.</h2><p>Inspect a fake login. Swipe the scams. Run the cable. Escape the maze.</p><div class="pa-intro-games"><article><b>01 / LINK DETECTIVE</b><span>Scan the screen. Find three hidden traps.</span></article><article><b>02 / MESSAGE PATROL</b><span>Flick messages into the right lane. Build a streak.</span></article><article><b>03 / PACKET RESCUE</b><span>Jump with Byte. Dodge scam bots. Grab real checks to clear the first gate.</span></article><article><b>04 / PHISH MAZE</b><span>Collect the keys. Outrun phishing bots. Unlock the second gate.</span></article></div><p class="pa-intro-route">4 mini-games → Phish or Legit inbox → final knowledge check</p><button class="btn attack-next" data-arcade-start>LET’S PLAY →</button><small>Touch, mouse or keyboard. Learn as you play.</small></section>`;
 el.onclick=e=>{if(!started&&e.target.closest('[data-arcade-start]')){started=true;phishMiniGames(el,ctx)}};
}

function phishMiniGames(el,ctx){
 let game=0,card=0,answer=null,feedback='',streak=0,bestStreak=0,patrolHits=0,points=0,finished=false,swipeStart=null,autoTimer=null,manual=false;
 const found=new Set(),decoys=new Set();
 const clues={
  domain:{risk:true,label:'Look-alike domain',why:'Wrong destination: innovatiview-login.co is not innovatiview.com.'},
  code:{risk:true,label:'Code sent to a person',why:'Never send your MFA code to a support agent.'},
  urgent:{risk:true,label:'Lockout pressure',why:'The deadline is bait. Open the real portal yourself.'},
  logo:{risk:false,why:'Logos can be copied. Look for evidence in the address and request.'},
  help:{risk:false,why:'A help label is not evidence. Inspect the address, code request and deadline.'}
 };
 const alive=()=>!finished&&el.isConnected!==false;
 function award(n,label){points=Math.max(0,points+n);ctx.add(n,label)}
 function clearAdvance(){if(autoTimer!==null){clearTimeout(autoTimer);autoTimer=null}}
 const names=['Link detective','Message patrol','Packet rescue','Phish maze'];
 function frame(content){return `<section class="attack-lab pa-arena" aria-labelledby="pa-title"><div class="attack-lab-top"><span class="attack-kicker">PHISHING ARCADE</span><span class="pa-score">✦ ${points} <small>PTS</small></span></div><div class="pa-track">${names.map((n,i)=>`<span class="${i<game?'done':i===game?'active':''}">${i<game?'✓':String(i+1).padStart(2,'0')} ${n}</span>`).join('')}</div>${content}</section>`}
 const note=()=>`<div class="pa-feedback pa-live-feedback" role="status">${feedback||'Scan carefully. Every clue counts.'}</div>`;
 function draw(focus){
  if(game===0){
   const hit=id=>found.has(id)?'found':decoys.has(id)?'checked':'';
   const disabled=id=>found.has(id)||decoys.has(id)?'disabled':'';
   el.innerHTML=frame(`<div class="pa-heading"><div><p class="attack-type">DETECTIVE MODE / CASE 01</p><h2 id="pa-title">Something feels off.</h2><p>Tap 3 suspicious details. No real credentials needed.</p></div><strong class="pa-counter">${found.size}<small> / 3 evidence</small></strong></div><div class="ld-workstation"><div class="ld-window-tabs"><span class="ld-traffic" aria-hidden="true">● ● ●</span><span>▣ &nbsp; Workspace · Sign in <i>×</i></span><b>＋</b><em>SIMULATION</em></div><div class="ld-toolbar"><span aria-hidden="true">← &nbsp; → &nbsp; ↻</span><button class="pa-hotspot ld-url ${hit('domain')}" data-clue="domain" ${disabled('domain')} aria-label="Inspect website address">${found.has('domain')?'⚑':'◈'} &nbsp; innovatiview-login.co<span>/workspace/verify</span></button><span aria-hidden="true">⋮</span></div><div class="ld-page"><aside class="ld-brand-panel"><span class="ld-wordmark">▣ INNOVATIVIEW</span><div class="ld-orbit" aria-hidden="true"><span>◈</span><i></i><b>+</b><em>●</em></div><h3>Your work.<br>One workspace.</h3><p>Connect. Collaborate. Create.</p><small>Workspace identity services</small></aside><div class="ld-login"><button class="pa-hotspot ld-login-brand ${hit('logo')}" data-clue="logo" ${disabled('logo')}>▣ &nbsp; Workspace</button><h3>Welcome back</h3><p class="ld-login-sub">Continue to your employee account</p><div class="ld-field"><small>Work email</small><span>employee@innovatiview.com</span><b>✎</b></div><div class="ld-field"><small>Password</small><span class="ld-password">••••••••••••</span><b>◉</b></div><button class="pa-hotspot ld-code ${hit('code')}" data-clue="code" ${disabled('code')}><span>Verification code ${found.has('code')?'⚑':''}</span><div aria-hidden="true"><i>0</i><i>0</i><i>0</i><i>0</i><i>0</i><i>0</i></div><small>Your support agent will receive this MFA code.</small></button><button class="pa-hotspot ld-urgency ${hit('urgent')}" data-clue="urgent" ${disabled('urgent')}><span>◷</span><div>Session expires in <b>10:00</b><small>Verify now to prevent account lockout.</small></div>${found.has('urgent')?'⚑':''}</button><div class="ld-signin" aria-hidden="true">Continue securely &nbsp; →</div><button class="pa-hotspot ld-help ${hit('help')}" data-clue="help" ${disabled('help')}>Having trouble signing in?</button><small class="ld-simulation">Training screen · nothing is submitted</small></div></div><div class="ld-evidence">${['domain','code','urgent'].map((id,i)=>`<span class="${found.has(id)?'collected':''}"><b>${found.has(id)?'✓':'0'+(i+1)}</b>${found.has(id)?clues[id].label:'Evidence unknown'}</span>`).join('')}</div>${found.size===3?'<div class="ld-sealed"><b>✓ SITE QUARANTINED</b><span>Credentials protected. Nice detective work.</span></div>':''}</div>${note()}${found.size===3?'<button class="btn attack-next" data-game-next>CASE CLOSED · MESSAGE PATROL →</button>':''}`);
  }else if(game===1){
   if(card===PHISH_PATROL.length){el.innerHTML=frame(`<div class="pa-round-clear"><span>✦</span><p class="attack-type">PATROL COMPLETE</p><h2 id="pa-title">Inbox defended.</h2><div><b>${patrolHits} / ${PHISH_PATROL.length}<small>CORRECT CALLS</small></b><b>${bestStreak}×<small>BEST STREAK</small></b></div><button class="btn attack-next" data-game-next>DEPLOY PACKET RESCUE →</button></div>`)}else{
    const m=PHISH_PATROL[card],judged=answer!==null,correct=answer===m.risk;
    el.innerHTML=frame(`<div class="pa-heading"><div><p class="attack-type">FLICK / SORT / PROTECT</p><h2 id="pa-title">Clear the signal.</h2><p>← Report suspicious &nbsp; · &nbsp; Keep expected →</p></div><strong class="pa-counter">${card+1}<small> / ${PHISH_PATROL.length}</small></strong></div><div class="mp-hud"><span>⚡ ${streak}<small>STREAK</small></span><div class="mp-meter"><i style="width:${card/PHISH_PATROL.length*100}%"></i></div><button data-pace aria-pressed="${manual}">${manual?'▶ Auto deal':'Ⅱ Review pace'}</button></div><div class="mp-arena"><div class="mp-lane report"><b>⌫</b><span>QUARANTINE</span><small>← LEFT</small></div><div class="mp-deck"><div class="mp-ghost"></div><article class="mp-card ${judged?'mp-fling-'+(answer?'left':'right'):''}" data-swipe-card tabindex="0" aria-label="Message. Swipe or press left to report, right to keep."><div class="mp-card-top"><span>${m.channel}</span><span>● ● ●</span></div><div class="mp-avatar" aria-hidden="true">${m.channel==='QR POSTER'?'▦':m.channel==='VOICE TRANSCRIPT'?'☎':'✉'}</div><h3>${m.from}</h3><p>${m.body}</p><div class="mp-card-bottom"><span>INCOMING TRANSMISSION</span><b>↔</b></div></article><div class="mp-verdict ${judged?'show':''}" role="status"><b>${judged?(correct?'NICE CATCH!':'MISSED SIGNAL'):''}</b><span>${judged?m.why:''}</span><small>${judged?(m.risk?'SCAM → QUARANTINE':'EXPECTED → TRUSTED'):''}</small></div></div><div class="mp-lane keep"><b>◈</b><span>TRUSTED</span><small>RIGHT →</small></div></div><div class="mp-controls"><button data-message="report" ${judged?'disabled':''}>⌫ &nbsp; REPORT</button><span>DRAG / SWIPE / ← →</span><button data-message="keep" ${judged?'disabled':''}>KEEP &nbsp; ◈</button></div>${judged&&manual?'<button class="btn attack-next" data-message-next>DEAL NEXT SIGNAL →</button>':''}`);
   }
  }
  if(focus)el.querySelector?.(focus)?.focus({preventScroll:true});
 }
 function nextMessage(){clearAdvance();if(!alive()||game!==1||answer===null||card>=PHISH_PATROL.length)return;card++;answer=null;swipeStart=null;draw(card===PHISH_PATROL.length?'[data-game-next]':'[data-swipe-card]')}
 function schedule(){clearAdvance();if(!manual)autoTimer=setTimeout(()=>{autoTimer=null;nextMessage()},1700)}
 function judge(risk){if(!alive()||game!==1||answer!==null||card>=PHISH_PATROL.length)return;answer=risk;const correct=risk===PHISH_PATROL[card].risk;streak=correct?streak+1:0;bestStreak=Math.max(bestStreak,streak);if(correct)patrolHits++;award(correct?50+10*Math.min(streak-1,3):-10,correct?'signal secured':'signal missed');SFX[correct?'ok':'bad']();draw(manual?'[data-message-next]':null);schedule()}
 el.onclick=e=>{
  if(!alive())return;
  const t=e.target,clue=t.closest('[data-clue]'),message=t.closest('[data-message]');
  if(game===0&&clue){const id=clue.dataset.clue,c=clues[id];if(!c||found.has(id)||decoys.has(id))return;feedback=c.why;if(c.risk){found.add(id);award(50,'evidence secured');SFX.ok()}else{decoys.add(id);award(-10,'keep scanning');SFX.bad()}draw(found.size===3?'[data-game-next]':'[data-clue]:not(:disabled)');return}
  if(game===1&&message)return judge(message.dataset.message==='report');
  if(game===1&&t.closest('[data-pace]')){manual=!manual;if(manual)clearAdvance();else if(answer!==null)schedule();draw('[data-pace]');return}
  if(game===1&&t.closest('[data-message-next]'))return nextMessage();
  if(t.closest('[data-game-next]')){if(game===0&&found.size===3){game=1;feedback='';draw('[data-swipe-card]');el.scrollIntoView?.({block:'start'})}else if(game===1&&card===PHISH_PATROL.length){finished=true;clearAdvance();el.onclick=el.onkeydown=el.onpointerdown=el.onpointermove=el.onpointerup=el.onpointercancel=null;packetRescue(el,ctx,()=>phishMaze(el,ctx,()=>phish(el,ctx)));el.scrollIntoView?.({block:'start'})}}
 };
 el.onkeydown=e=>{if(game===1&&e.target.closest('[data-swipe-card]')&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();judge(e.key==='ArrowLeft')}};
 el.onpointerdown=e=>{const target=e.target.closest('[data-swipe-card]');if(game===1&&answer===null&&target){swipeStart={x:e.clientX,y:e.clientY,target};target.setPointerCapture?.(e.pointerId)}};
 el.onpointermove=e=>{if(!swipeStart||answer!==null)return;const dx=e.clientX-swipeStart.x;swipeStart.target.style.transform=`translateX(${Math.max(-145,Math.min(145,dx))}px) rotate(${dx/20}deg)`};
 el.onpointerup=e=>{if(!swipeStart)return;const {x,y,target}=swipeStart,dx=e.clientX-x,dy=e.clientY-y;swipeStart=null;target.style.transform='';if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)judge(dx<0)};
 el.onpointercancel=()=>{if(swipeStart)swipeStart.target.style.transform='';swipeStart=null};
 draw();
}

/* Dashboard and onboarding presentation. All scoring and game behavior stay in app.js. */
const HUB_MISSIONS = [
 {kind:'vault',tag:'Data protection',copy:'Sort the files. Keep sensitive data safe.',detail:'Desk shift · 9 files',color:'linear-gradient(145deg,#2b2b2b,#11274a)'},
 {kind:'mail',tag:'Social engineering',copy:'Hunt clues, swipe scams and steer packets past scam bots. Then secure your inbox.',detail:'3 mini-games · 10 emails',color:'linear-gradient(145deg,#11274a,#d1202733)'},
 {kind:'shield',tag:'Arcade defense',copy:'Keep the firewall standing. Stop the threats.',detail:'45-second round',color:'linear-gradient(145deg,#11274a,#1ca4dd3d)'},
 {kind:'desk',tag:'Investigation',copy:'Explore the office. Find the security risks.',detail:'4 case files · 3D',color:'linear-gradient(145deg,#11274a,#d0964040)'},
 {kind:'voice',tag:'Social engineering',copy:'Take the call. Outsmart the impersonator.',detail:'4 conversations',color:'linear-gradient(145deg,#11274a,#1ca4dd59)'}
];

function missionMeta(level){return HUB_MISSIONS[level.n-1]||level.meta}

function profilePhotoValid(photo) {
 return typeof photo==='string'&&photo.length<=180000&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(photo);
}

function hubAvatar(name,photo) {
 if(profilePhotoValid(photo))return `<img class="hub-photo" src="${photo}" alt="">`;
 const initials=String(name||'Player').trim().split(/\s+/).slice(0,2).map(n=>n[0]||'').join('').toUpperCase();
 return `<span aria-hidden="true">${esc(initials)}</span>`;
}

function readServerPhoto(userId) {
 try{const photo=localStorage.getItem('cyberquest.profile.'+userId)||'';return profilePhotoValid(photo)?photo:''}catch(e){return ''}
}

function hubArt(kind, id) {
 const shapes = {
 mail:`<g transform="translate(26 28)"><rect x="26" y="22" width="123" height="75" rx="7" fill="#11274a" opacity=".45" transform="translate(7 12)"/><path d="M24 24h124v74H24z" fill="url(#${id}-face)" stroke="#d2d0cd" stroke-width="1.4"/><path d="M24 24l62 43 62-43" fill="#d2d0cd"/><path d="M24 98l43-38m81 38l-43-38" stroke="#1ca4dd" stroke-width="2"/><circle cx="146" cy="35" r="19" fill="#d12027" stroke="#ffffff"/><path d="M146 25v12m0 7v2" stroke="#11274a" stroke-width="3" stroke-linecap="round"/><path d="M5 63h12m148 10h14m-133 44h77" stroke="#1ca4dd" stroke-width="2"/></g>`,
 shield:`<g transform="translate(37 13)"><path d="M68 5l55 23v54c0 25-27 48-55 62-28-14-55-37-55-62V28z" fill="#11274a" opacity=".5" transform="translate(8 8)"/><path d="M68 5l55 23v54c0 25-27 48-55 62-28-14-55-37-55-62V28z" fill="url(#${id}-face)" stroke="#1ca4dd" stroke-width="2"/><path d="M68 20l40 17v44c0 18-21 36-40 46-19-10-40-28-40-46V37z" fill="#11274a"/><path d="M45 72l16 15 33-36" fill="none" stroke="#1da049" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M-16 49H4m129 0h22M-3 109h14m117 0h20" stroke="#d2d0cd" stroke-width="2"/></g>`,
 desk:`<g transform="translate(23 8)"><path d="M87 14L9 49v74l78 34 79-34V49z" fill="#11274a" stroke="#1ca4dd"/><path d="M87 14v89l79 20V49z" fill="#1ca4dd"/><path d="M9 49l78 35v73L9 123z" fill="#2b2b2b"/><path d="M22 81l65-27 65 27-65 30z" fill="#d09640" stroke="#d2d0cd"/><path d="M22 81v7l65 30 65-30v-7l-65 30z" fill="#d09640"/><path d="M31 91v35m109-35v35" stroke="#d2d0cd" stroke-width="5"/><path d="M68 45l39 17v31L68 77z" fill="#11274a" stroke="#d2d0cd"/><path d="M73 52l29 13v20L73 72z" fill="#1ca4dd"/><path d="M83 91l17 7-13 6-17-7z" fill="#11274a"/><path d="M59 115l28 11 20-10v17l-20 12-28-12z" fill="#11274a"/><path d="M87 145v10" stroke="#1ca4dd" stroke-width="3"/><circle cx="129" cy="82" r="6" fill="#d2d0cd"/></g>`,
 voice:`<g transform="translate(26 16)"><circle cx="80" cy="66" r="57" fill="#11274a" stroke="#1ca4dd"/><path d="M35 69V54a45 45 0 0190 0v15" stroke="#d2d0cd" stroke-width="13" fill="none"/><rect x="22" y="58" width="23" height="42" rx="8" fill="url(#${id}-face)" stroke="#d2d0cd"/><rect x="115" y="58" width="23" height="42" rx="8" fill="url(#${id}-face)" stroke="#d2d0cd"/><path d="M127 100v11c0 9-12 15-35 15" stroke="#d2d0cd" stroke-width="4" fill="none"/><rect x="74" y="121" width="21" height="9" rx="4" fill="#1da049"/><path d="M53 70v9m11-24v40m11-26v14m11-29v43m11-28v14m11-17v20" stroke="#1ca4dd" stroke-width="4" stroke-linecap="round"/></g>`,
 vault:`<g transform="translate(25 15)"><path d="M38 28l88-12 27 15v101l-89 17-26-20z" fill="#11274a" stroke="#1ca4dd"/><path d="M38 28l26 14 89-11-27-15z" fill="#1ca4dd"/><path d="M64 42l89-11v101l-89 17z" fill="url(#${id}-face)"/><path d="M75 54l65-10v77l-65 11z" fill="#2b2b2b" stroke="#d2d0cd"/><ellipse cx="108" cy="85" rx="21" ry="24" fill="#1ca4dd" stroke="#1ca4dd" stroke-width="3"/><path d="M108 66v39m-15-30l29 21m-30 1l31-24" stroke="#d2d0cd" stroke-width="4"/><circle cx="108" cy="85" r="6" fill="#d09640"/><path d="M52 49v74" stroke="#11274a" stroke-width="5"/><path d="M16 80h17m126-11h12M19 108h14" stroke="#1ca4dd" stroke-width="2"/></g>`
 };
 return `<svg viewBox="0 0 220 170" aria-hidden="true"><defs><linearGradient id="${id}-face" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1ca4dd"/><stop offset="1" stop-color="#11274a"/></linearGradient><radialGradient id="${id}-glow"><stop stop-color="#d2d0cd" stop-opacity=".24"/><stop offset="1" stop-color="#d2d0cd" stop-opacity="0"/></radialGradient></defs><circle cx="112" cy="85" r="104" fill="url(#${id}-glow)"/><path d="M0 34H220M0 68H220M0 102H220M0 136H220M44 0V170M88 0V170M132 0V170M176 0V170" stroke="#d2d0cd09"/>${shapes[kind]||shapes.shield}</svg>`;
}

function hubDefenderArt(id) {
 return `<svg viewBox="0 0 360 340" aria-hidden="true"><defs><linearGradient id="${id}-metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1ca4dd"/><stop offset=".45" stop-color="#11274a"/><stop offset="1" stop-color="#2b2b2b"/></linearGradient><linearGradient id="${id}-core" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1ca4dd"/><stop offset="1" stop-color="#1da049"/></linearGradient><radialGradient id="${id}-aura"><stop stop-color="#d2d0cd" stop-opacity=".3"/><stop offset="1" stop-color="#1ca4dd" stop-opacity="0"/></radialGradient></defs><circle cx="180" cy="173" r="163" fill="url(#${id}-aura)"/><g transform="translate(0 9)"><ellipse cx="180" cy="260" rx="109" ry="33" fill="#d2d0cd0b" stroke="#d2d0cd2d"/><ellipse cx="180" cy="260" rx="80" ry="22" fill="none" stroke="#1da04926"/><path d="M43 153l36-69 82-35 87 30 58 85-34 70-87 44-103-41z" fill="none" stroke="#d2d0cd20"/><path d="M52 195l-22-40 30-44m208-28l44 54-9 61M86 261l80 35 60-19" fill="none" stroke="#1ca4dd52" stroke-width="2"/><path d="M177 72l91 37v75c0 43-42 80-91 99-49-19-91-56-91-99v-75z" fill="#11274a" transform="translate(9 7)"/><path d="M177 62l91 37v75c0 43-42 80-91 99-49-19-91-56-91-99V99z" fill="url(#${id}-metal)" stroke="#ffffff" stroke-width="1.5"/><path d="M177 78l75 31v65c0 33-34 63-75 82-41-19-75-49-75-82v-65z" fill="#11274a" stroke="#1da0493b"/><path d="M177 94l60 24v57c0 27-27 51-60 67-33-16-60-40-60-67v-57z" fill="#11274a" stroke="#1da04980"/><path d="M151 146l25-15 29 16v32l-28 20-29-19z" fill="url(#${id}-core)"/><path d="M154 159l17 16 27-30" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M117 119l22 9m-22 52l24-7m96-54l-22 9m22 52l-24-7M177 96v21m0 97v21" stroke="#1da04980" stroke-width="2"/><path d="M57 167h27m187-12h27m-171-94V41h32m69 192v28h25" stroke="#d2d0cd5e" fill="none"/><circle cx="55" cy="167" r="4" fill="#1da049"/><circle cx="300" cy="155" r="3" fill="#d2d0cd"/><circle cx="128" cy="41" r="3" fill="#d2d0cd"/><path d="M82 293h197" stroke="#1da04926"/><path d="M97 298h30m105 0h30" stroke="#1ca4dd51"/></g></svg>`;
}

function lobbyDashboard() {
 const current=curLv(),cleared=LV.filter(l=>S.done.includes(l.n)).length;
 const earned=REW.filter(r=>allDone()&&S.score>=r.req).length;
 const reward=REW.slice().sort((a,b)=>a.req-b.req).find(r=>!S.claimed[r.id])||REW[REW.length-1];
 const rewardProgress=reward?(reward.req?Math.min(100,S.score/reward.req*100):100):0;
 $('#app').innerHTML=`<div class="lobby"><div class="hub-welcome"><div><h1>Ready for your next win, <span>${esc(S.name.split(' ')[0])}?</span></h1><p>Your skills. Your progress. Your next challenge.</p></div><div class="hub-session"><b>●</b> ${SERVER?'Company player profile':'Progress saved on this device'}</div></div>
 <div class="hub-top"><section class="hub-hero insight-carousel" aria-label="Cyber awareness insights" aria-roledescription="carousel"><div class="hub-hero-copy"><div class="hub-eyebrow"><span class="live-dot"></span>Cyber awareness. Game on.</div><h2>LEVEL UP.<br><em>STAY SHARP.</em></h2><p>Catch the scams. Protect your team. Turn everyday security skills into your next high score.</p><div class="hub-actions"><button class="hub-button" data-a="play" data-v="${current.n}">${cleared===LV.length?'Play again':'Continue mission'}<span class="arrow" aria-hidden="true">↗</span></button><button class="hub-button secondary" data-a="nav" data-v="road">Explore missions</button></div></div><div class="hub-hero-art">${hubDefenderArt('hero')}<span class="hub-art-tag">BUILD YOUR DEFENDER INSTINCT</span></div><div class="insight-controls"><button type="button" data-slide-prev aria-label="Previous insight">←</button><div class="insight-dots">${CYBER_INSIGHTS.map((x,i)=>`<button type="button" data-slide="${i}" aria-label="Insight ${i+1}: ${x.label}" aria-pressed="${i===0}"></button>`).join('')}</div><span data-slide-count>01 / 05</span><button type="button" data-slide-next aria-label="Next insight">→</button><button type="button" data-slide-pause aria-label="Pause slideshow">Ⅱ</button></div></section>
 <aside class="hub-player"><div class="hub-player-top"><button class="hub-link" data-a="profile">Player profile ↗</button><span>${tier()}</span></div><div class="hub-profile"><button type="button" class="hub-avatar hub-avatar-edit" data-a="profile" aria-label="Edit player profile">${hubAvatar(S.name,S.photo)}</button><div><h3>${esc(S.name)}</h3><p>CyberQuest defender</p></div><div class="hub-player-level"><small>LEVEL</small>${String(Math.min(LV.length,cleared+1)).padStart(2,'0')}</div></div><div class="hub-progress-label"><span>Campaign progress</span><b>${cleared}/${LV.length} complete</b></div><div class="hub-progress" role="progressbar" aria-label="Campaign completion" aria-valuemin="0" aria-valuemax="${LV.length}" aria-valuenow="${cleared}"><span style="width:${cleared/LV.length*100}%"></span></div><div class="hub-level-dots" aria-label="Level completion">${LV.map(l=>`<span class="${S.done.includes(l.n)?'complete':''}" aria-label="Level ${l.n}: ${S.done.includes(l.n)?'complete':'not complete'}">${S.done.includes(l.n)?'✓':l.n}</span>`).join('')}</div><div class="hub-player-foot">${cleared===LV.length?'Campaign cleared. Beat your best scores.':'Up next: '+esc(current.name)}</div></aside></div>
 <section class="hub-stats" aria-label="Player statistics"><div class="hub-stat"><span class="hub-stat-icon" aria-hidden="true">ϟ</span><div><p>Total points</p><strong>${fmt(S.score)}</strong><small>PTS</small></div></div><div class="hub-stat"><span class="hub-stat-icon" aria-hidden="true">✓</span><div><p>Missions cleared</p><strong>${cleared}<small>/ ${LV.length}</small></strong></div></div><div class="hub-stat"><span class="hub-stat-icon" aria-hidden="true">♜</span><div><p>${SERVER?'Leaderboard rank':'Sample board rank'}</p><strong>#${rank()}</strong></div></div><div class="hub-stat"><span class="hub-stat-icon" aria-hidden="true">◇</span><div><p>Rewards unlocked</p><strong>${earned}<small>/ ${REW.length}</small></strong></div></div></section>
 <section class="hub-missions"><div class="hub-heading-row"><div><div class="hub-eyebrow" style="color:#1ca4dd">THE CAMPAIGN</div><h2>Pick your next challenge</h2><p>${LV.length} ways to play. Skills that stay with you.</p></div><button class="hub-link" data-a="nav" data-v="road">Mission map <span aria-hidden="true">↗</span></button></div><div class="hub-cards">${LV.map((l,i)=>{const meta=missionMeta(l),done=S.done.includes(l.n),available=open(l.n);return `<article class="hub-card ${available?'':'locked'}"><div class="hub-card-art" style="--card-bg:${meta.color}">${hubArt(meta.kind,'mission-'+l.n)}<span class="hub-card-status ${done?'complete':available?'ready':''}">${done?'✓ Completed':available?'Ready to play':'Locked'}</span></div><div class="hub-card-body"><div class="hub-card-index">0${l.n} / ${meta.tag}</div><h3>${l.name}</h3><p>${meta.copy}</p><div class="hub-card-foot"><span>${meta.detail}</span><span>${S.best[l.n]?fmt(S.best[l.n])+' best':l.q.length+' quiz Qs'}</span></div><button class="hub-button ${done||!available?'secondary':''}" data-a="play" data-v="${l.n}" aria-label="${done?'Replay':available?'Play':'Locked'} ${esc(l.name)}" ${available?'':'disabled'}>${done?'Beat your best':available?'Play mission':'Clear level '+(l.n-1)}<span aria-hidden="true">${available?'↗':'⌑'}</span></button></div></article>`}).join('')}</div></section>
 <div class="hub-bottom">${reward?`<section class="hub-reward"><div class="hub-reward-art" aria-hidden="true"><svg viewBox="0 0 64 64">${ICON[reward.i]||''}</svg></div><div class="hub-reward-copy"><div class="hub-eyebrow" style="color:#d2d0cd">Play. Progress. Get rewarded.</div><h3>${esc(reward.name)}</h3><p>${esc(reward.d)}</p><div class="hub-progress" role="progressbar" aria-label="Score progress toward ${esc(reward.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(rewardProgress)}"><span style="width:${rewardProgress}%"></span></div><p>${fmt(S.score)} / ${fmt(reward.req)} pts · ${allDone()?'All levels cleared':'Clear all '+LV.length+' levels to claim'}</p><button class="hub-link" data-a="nav" data-v="rew">Open reward locker <span aria-hidden="true">↗</span></button></div></section>`:''}
 <section class="hub-skills"><div class="hub-eyebrow" style="color:#1ca4dd">YOUR SKILL COLLECTION</div><h3>Build instincts. Not just points.</h3><div class="hub-skill-list">${['Data classification','Phishing detection','Threat defense','Office security','Caller verification'].map((skill,i)=>`<span class="${S.done.includes(i+1)?'earned':''}">${S.done.includes(i+1)?'✓ ':''}${skill}</span>`).join('')}</div><p>Complete a mission to add its skill to your collection.</p></section></div>
 <div class="hub-settings"><span class="hub-eyebrow" style="color:#1ca4dd">PLAYER SETTINGS</span>${SERVER?(window.CQ_AUTH==='password'?'<button class="hub-link" data-a="pwd">Change password</button><button class="hub-link" data-a="logout">Sign out</button>':''):'<button class="hub-link" data-a="profile">Edit player profile</button><button class="hub-link" data-a="resetme">Reset progress</button>'}</div></div>`;
 const carousel=$('#app').querySelector?.('.insight-carousel');if(carousel)mountInsights(carousel);
}

function retroCyberArt() {
 return `<svg viewBox="0 0 500 290" aria-hidden="true" style="shape-rendering:crispEdges"><defs><linearGradient id="retro-screen" x2="0" y2="1"><stop stop-color="#11274a"/><stop offset="1" stop-color="#11274a"/></linearGradient></defs><path d="M22 242h456m-400-28h338m-316-21h294" stroke="#1ca4dd50" stroke-width="2"/><ellipse cx="250" cy="247" rx="132" ry="18" fill="#1ca4dd12"/><path d="M158 59h184v14h14v136h-14v14H158v-14h-14V73h14z" fill="#11274a" stroke="#1ca4dd" stroke-width="3"/><rect x="159" y="76" width="182" height="126" fill="url(#retro-screen)"/><path d="M178 97h50m-50 10h30m-30 10h43m69 60h28" stroke="#1ca4dd" stroke-width="3"/><path d="M238 105h24v-8h16v8h24v65h-8v16h-16v8h-16v-8h-16v-16h-8z" fill="#1da049"/><path d="M250 118h40v43h-7v14h-13v7h-7v-7h-7v-14h-6z" fill="#11274a"/><path d="M256 141h7v7h7v-7h7v-7h7v7h-7v7h-7v7h-7v-7h-7z" fill="#ffffff"/><rect x="239" y="223" width="22" height="18" fill="#1ca4dd"/><rect x="219" y="241" width="62" height="7" fill="#1ca4dd"/><path d="M69 49h46v7h7v29h-7v7H69v-7h-7V56h7z" fill="#1ca4dd"/><path d="M69 57l23 16 23-16" stroke="#d2d0cd" stroke-width="5" fill="none"/><path d="M102 36h14v7h7v14h-7v7h-14v-7h-7V43h7z" fill="#d12027"/><path d="M109 43v7m0 5v2" stroke="#11274a" stroke-width="3"/><path d="M378 91h42v7h7v37h-7v7h-42v-7h-7V98h7z" fill="#1ca4dd"/><path d="M386 108v-8h24v8m-27 0h30v22h-30z" stroke="#d2d0cd" stroke-width="3" fill="none"/><path d="M398 117v7" stroke="#d09640" stroke-width="3"/><path d="M90 167h42v7h7v40h-7v7H90z" fill="#11274a"/><path d="M100 184h28m-28 10h22m-22 10h28" stroke="#1ca4dd" stroke-width="3"/><path d="M392 193h18v6h6v18h-6v6h-18v-6h-6v-18h6z" fill="#1da049"/><path d="M57 125h8v8h-8zm275-96h8v8h-8zm109 126h8v8h-8z" fill="#d2d0cd"/><path d="M44 30h7m-4-4v8m385-10h7m-4-4v8M53 215h7m-4-4v8" stroke="#1da049" stroke-width="2"/></svg>`;
}

function retroEntry(form) {
 return `<div class="retro-entry"><section class="retro-story"><div class="retro-kicker"><span></span>CYBERQUEST / AWARENESS ARCADE</div><h1>DEFEND YOUR<br><em>DIGITAL WORLD.</em></h1><p>Scams are getting smarter. So can you.<br>Play your way to sharper cyber instincts.</p><div class="retro-art">${retroCyberArt()}</div><div class="retro-skill-tags"><span>01 / SPOT PHISHING</span><span>02 / PROTECT ACCESS</span><span>03 / GUARD DATA</span></div><div class="retro-caption">5 missions. Real-world skills. Your next high score.</div></section><section class="retro-card"><div class="retro-card-bar"><span>PLAYER ACCESS TERMINAL</span><span aria-hidden="true">● ● ●</span></div><div class="retro-card-body"><span class="retro-pixel-label">INSERT PLAYER<span class="retro-cursor" aria-hidden="true">_</span></span><h2>Your quest starts here.</h2>${form}<div class="retro-rules"><span>YOUR FIRST DEFENSE</span><p>Check the sender. Protect your passwords.<br>Never share a one-time code.</p></div></div><div class="retro-card-footer">LEARN IT. PLAY IT. USE IT.</div></section></div>`;
}

function lobbyWelcome() {
 $('#app').innerHTML=retroEntry(`<p class="retro-form-intro">Enter your player name to start Cyber Awareness Basics. Clear 20 checks to unlock the arcade.</p><label for="nm">PLAYER NAME</label><input id="nm" maxlength="40" autocomplete="name" value="${esc(S.name)}" placeholder="Choose your player name"><button class="retro-start" data-a="setname">START BASICS <span aria-hidden="true">▶</span></button><small>Press Enter to begin. Your progress stays in this browser.</small>`);
 $('#nm').focus();$('#nm').onkeydown=e=>{if(e.key==='Enter')act.setname()};
}

function lobbyLogin() {
 const proxy=window.CQ_AUTH==='proxy';
 const form=proxy?`<p class="retro-form-intro">Sign in through your company portal, then return to begin your mission.</p><div id="lerr" role="alert" class="profile-error"></div><button class="retro-start" id="rl2">RELOAD TERMINAL <span aria-hidden="true">↻</span></button>`:`<p class="retro-form-intro">Use your company account to continue your mission.</p><label for="em">COMPANY EMAIL</label><input id="em" type="email" autocomplete="username" placeholder="you@company.com"><label for="pw">PASSWORD</label><input id="pw" type="password" autocomplete="current-password" placeholder="Your company password"><div id="lerr" role="alert" class="profile-error"></div><button class="retro-start" data-a="dologin">SIGN IN & PLAY <span aria-hidden="true">▶</span></button>`;
 $('#app').innerHTML=retroEntry(form);
 if(proxy){$('#rl2').onclick=()=>location.reload();return}
 $('#em').focus();$('#pw').onkeydown=e=>{if(e.key==='Enter')act.dologin()};$('#em').onkeydown=e=>{if(e.key==='Enter')$('#pw').focus()};
}

async function resizeProfilePhoto(file) {
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a JPG, PNG, or WebP image.');
 if(file.size>8*1024*1024)throw new Error('Choose a photo smaller than 8 MB.');
 const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('This file could not be read. Try another photo.'));reader.readAsDataURL(file)});
  const image=new Image();image.src=data;
  try{await image.decode()}catch(e){throw new Error('This image could not be opened. Try another photo.')}
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d');const side=Math.min(image.naturalWidth,image.naturalHeight);
  if(!side)throw new Error('This image could not be opened. Try another photo.');
  ctx.fillStyle='#11274a';ctx.fillRect(0,0,256,256);
  ctx.drawImage(image,(image.naturalWidth-side)/2,(image.naturalHeight-side)/2,side,side,0,0,256,256);
  const photo=canvas.toDataURL('image/jpeg',.86);
  if(!profilePhotoValid(photo))throw new Error('This photo could not be saved. Try a smaller image.');
  return photo;
}

function lobbyProfile() {
 const cleared=LV.filter(l=>S.done.includes(l.n)).length;
 $('#app').innerHTML=`<section class="profile-editor" id="profile-editor"><div class="hub-heading-row"><div><div class="hub-eyebrow">YOUR PLAYER IDENTITY</div><h1>Make it yours.</h1><p>A familiar face. A sharper defender.</p></div><button class="hub-link" data-a="nav" data-v="dash">← Dashboard</button></div><div class="profile-grid"><aside class="profile-preview"><div class="profile-large-avatar" id="profile-photo-preview">${hubAvatar(S.name,S.photo)}</div><h2 id="profile-name-preview">${esc(S.name)}</h2><span class="profile-tier">${tier()} / Level ${String(Math.min(LV.length,cleared+1)).padStart(2,'0')}</span><div class="profile-preview-stats"><div><strong>${fmt(S.score)}</strong><span>POINTS</span></div><div><strong>${cleared}/${LV.length}</strong><span>MISSIONS</span></div></div><p>Your photo appears on your dashboard and in the top-left profile icon.</p></aside><form class="profile-form" id="profile-form"><h2>Edit player profile</h2><p>Choose a photo and make your player card your own.</p><label for="profile-name">Player name</label><input id="profile-name" maxlength="40" value="${esc(S.name)}" autocomplete="name" ${SERVER?'readonly':''}>${SERVER?'<small>Your name is managed by your company account.</small>':''}<label for="profile-photo-input">Profile photo</label><input id="profile-photo-input" type="file" accept="image/jpeg,image/png,image/webp" class="profile-file" aria-describedby="photo-help"><div class="profile-photo-actions"><button type="button" class="hub-button secondary" id="profile-choose">Upload photo</button><button type="button" class="hub-link" id="profile-remove" ${profilePhotoValid(S.photo)?'':'disabled'}>Remove photo</button></div><small id="photo-help">JPG, PNG, or WebP · up to 8 MB. Center-cropped into a square. Saved only in this browser.</small><p class="profile-error" id="profile-error" role="alert"></p><div class="profile-form-actions"><button type="submit" class="hub-button" id="profile-save">Save profile <span aria-hidden="true">✓</span></button><button type="button" class="hub-button secondary" data-a="nav" data-v="dash">Cancel</button></div></form></div><button class="hub-link profile-entry-link" data-a="entry">Back to player entry ↗</button></section>`;
 const root=$('#profile-editor'),nameInput=root.querySelector('#profile-name'),input=root.querySelector('#profile-photo-input'),preview=root.querySelector('#profile-photo-preview'),error=root.querySelector('#profile-error'),saveButton=root.querySelector('#profile-save'),remove=root.querySelector('#profile-remove');
 let draftPhoto=profilePhotoValid(S.photo)?S.photo:'',revision=0;
 const show=()=>{preview.innerHTML=hubAvatar(nameInput.value||'Player',draftPhoto);root.querySelector('#profile-name-preview').textContent=nameInput.value||'Player';remove.disabled=!draftPhoto};
 nameInput.oninput=show;
 root.querySelector('#profile-choose').onclick=()=>input.click();
 input.onchange=async()=>{
  const file=input.files[0];if(!file)return;const request=++revision;error.textContent='';saveButton.disabled=true;
  try{const photo=await resizeProfilePhoto(file);if(request!==revision||!root.isConnected)return;draftPhoto=photo;show()}
  catch(e){if(request===revision&&root.isConnected)error.textContent=e.message||'Could not open this photo. Try another image.'}
  finally{if(request===revision&&root.isConnected){saveButton.disabled=false;input.value=''}}
 };
 remove.onclick=()=>{revision++;draftPhoto='';input.value='';error.textContent='';saveButton.disabled=false;show()};
 root.querySelector('#profile-form').onsubmit=e=>{
  e.preventDefault();if(saveButton.disabled)return;
  const name=nameInput.value.replace(/\s+/g,' ').trim().slice(0,40);
  if(!name){error.textContent='Enter a player name before saving.';nameInput.focus();return}
  const previous={name:S.name,photo:S.photo};if(!SERVER)S.name=name;S.photo=draftPhoto;
  if(!save()){S.name=previous.name;S.photo=previous.photo;error.textContent='Your browser could not save the profile. Free some browser storage and try again.';return}
  S.view='dash';render();toast('Player profile saved','#1da049');
 };
}
function leaderboardView(rows,{sample=false,title='Top defenders',me=null}={}){
 const podium=rows.filter(r=>r.rank<=3),own=rows.find(r=>r.me)||me;
 const row=r=>`<tr class="${r.me?'ranking-you':''}"><td><span class="rank-number">${r.rank<=3?['🥇','🥈','🥉'][r.rank-1]:'#'+r.rank}</span></td><td><div class="ranking-player"><span class="ranking-avatar">${hubAvatar(r.name,r.me?S.photo:'')}</span><b>${esc(r.name)}${r.me?' <em>YOU</em>':''}</b></div></td><td class="rank-points">${fmt(r.score)} <small>PTS</small></td></tr>`;
 return `<section class="arena-board"><header class="arena-heading"><div><div class="hub-eyebrow">THE HALL OF DEFENDERS</div><h1>${esc(title)}</h1><p>Sharp instincts. Strong scores. A place in the spotlight.</p></div><span class="board-mode">${sample?'SAMPLE LEADERBOARD':'PLAYER RANKINGS'}</span></header>${sample?'<p class="board-note">Practice standings with sample players and your browser’s saved score.</p>':''}<div class="champion-podium" aria-label="Top three players">${podium.map(r=>`<article class="podium-card podium-${r.rank}"><div class="podium-award">${['♛','✦','✧'][r.rank-1]}</div><div class="podium-avatar">${hubAvatar(r.name,r.me?S.photo:'')}<span>${r.rank}</span></div><div class="podium-title">${['CHAMPION','SILVER DEFENDER','BRONZE DEFENDER'][r.rank-1]}</div><h2>${esc(r.name)}${r.me?' (you)':''}</h2><p>${['Leading the charge. Setting the standard.','Brilliant instincts. A standout performance.','A podium finish. A defender to celebrate.'][r.rank-1]}</p><strong>${fmt(r.score)} <small>PTS</small></strong></article>`).join('')}</div>${!rows.length?'<div class="ranking-empty"><h2>The podium is waiting.</h2><p>Finish a mission to put your name on the board.</p></div>':''}${own?`<div class="your-standing"><span class="hub-avatar">${hubAvatar(own.name,S.photo)}</span><div><small>YOUR POSITION</small><b>#${own.rank} · ${esc(own.name)}</b></div><strong>${fmt(own.score)} <small>PTS</small></strong><button class="hub-button secondary" data-a="nav" data-v="road">Play a mission ↗</button></div>`:''}<div class="rankings"><div class="hub-heading-row"><h2>The standings</h2><span>${rows.length} players shown</span></div><table><thead><tr><th scope="col">Rank</th><th scope="col">Player</th><th scope="col">Score</th></tr></thead><tbody>${rows.map(row).join('')}${me&&!rows.some(r=>r.me)?row(me):''}</tbody></table></div></section>`;
}

const CYBER_INSIGHTS=[
 {label:'Cyber awareness. Game on.',title:'LEVEL UP.',accent:'STAY SHARP.',copy:'Catch the scams. Protect your team. Turn everyday security skills into your next high score.',tag:'BUILD YOUR DEFENDER INSTINCT',kind:null,color:'#11274a'},
 {label:'01 / Spot the phishing trap',title:'PAUSE FIRST.',accent:'CLICK LATER.',copy:'An urgent message is a reason to slow down. Check the sender’s full address and open the official app or website to verify the request.',tag:'URGENCY IS NOT PROOF',kind:'mail',color:'#11274a'},
 {label:'02 / Protect your accounts',title:'ONE ACCOUNT.',accent:'ONE PASSWORD.',copy:'Use a unique password for every account. Let a password manager remember them, and turn on multi-factor authentication wherever available.',tag:'ADD AN EXTRA LAYER OF DEFENSE',kind:'shield',color:'#2b2b2b'},
 {label:'03 / Keep your workspace safe',title:'STEP AWAY.',accent:'LOCK IT UP.',copy:'Lock your screen before leaving your desk. Keep badges and sensitive papers secure, even when you are only stepping away for a moment.',tag:'SMALL HABIT. STRONG DEFENSE.',kind:'desk',color:'#11274a'},
 {label:'04 / Verify unexpected requests',title:'SOUNDS REAL?',accent:'CHECK AGAIN.',copy:'A familiar name or voice is not enough. Verify unexpected requests for money, files or login codes using a trusted contact method.',tag:'VERIFY BEFORE YOU SHARE',kind:'voice',color:'#2b2b2b'}
];
function mountInsights(root){
 let index=0,paused=window.matchMedia('(prefers-reduced-motion: reduce)').matches,hover=false,focused=false;
 const q=s=>root.querySelector(s),dots=[...root.querySelectorAll('[data-slide]')];
 function show(n){index=(n+CYBER_INSIGHTS.length)%CYBER_INSIGHTS.length;const s=CYBER_INSIGHTS[index];q('.hub-eyebrow').textContent=s.label;q('h2').innerHTML=`${s.title}<br><em>${s.accent}</em>`;q('.hub-hero-copy>p').textContent=s.copy;q('.hub-hero-art').innerHTML=(s.kind?hubArt(s.kind,'insight-art'):hubDefenderArt('hero'))+`<span class="hub-art-tag">${s.tag}</span>`;root.style.setProperty('--insight-color',s.color);q('[data-slide-count]').textContent=String(index+1).padStart(2,'0')+' / 05';dots.forEach((d,i)=>d.setAttribute('aria-pressed',String(i===index)));}
 function state(){q('[data-slide-pause]').textContent=paused?'▶':'Ⅱ';q('[data-slide-pause]').setAttribute('aria-label',paused?'Play slideshow':'Pause slideshow');}
 function manual(n){paused=true;state();show(n)}
 q('[data-slide-prev]').onclick=()=>manual(index-1);q('[data-slide-next]').onclick=()=>manual(index+1);dots.forEach(d=>d.onclick=()=>manual(+d.dataset.slide));q('[data-slide-pause]').onclick=()=>{paused=!paused;state()};
 root.onmouseenter=()=>hover=true;root.onmouseleave=()=>hover=false;root.onfocusin=()=>focused=true;root.onfocusout=e=>focused=root.contains(e.relatedTarget);
 const timer=setInterval(()=>{if(!root.isConnected){clearInterval(timer);observer.disconnect();return}if(!paused&&!hover&&!focused&&!document.hidden)show(index+1)},8500);
 const observer=new MutationObserver(()=>{if(!root.isConnected){clearInterval(timer);observer.disconnect()}});observer.observe(root.parentNode.parentNode,{childList:true,subtree:true});state();
}

function dataSorterCoverArt(){
 return `<svg class="play-scene" viewBox="0 0 1100 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="sort-bg" x2="1" y2="1"><stop stop-color="#07142d"/><stop offset=".55" stop-color="#11274a"/><stop offset="1" stop-color="#092b42"/></linearGradient><linearGradient id="sort-card" x2="0" y2="1"><stop stop-color="#f4f9ff"/><stop offset="1" stop-color="#a9c5d8"/></linearGradient><linearGradient id="sort-belt" x2="0" y2="1"><stop stop-color="#335a78"/><stop offset="1" stop-color="#0b1c33"/></linearGradient><radialGradient id="sort-glow"><stop stop-color="#1ca4dd" stop-opacity=".5"/><stop offset="1" stop-color="#1ca4dd" stop-opacity="0"/></radialGradient></defs><rect width="1100" height="700" fill="url(#sort-bg)"/><circle cx="810" cy="305" r="360" fill="url(#sort-glow)"/><g stroke="#54bbdf" stroke-opacity=".12"><path d="M0 85h1100M0 175h1100M0 265h1100M0 355h1100M0 445h1100M0 535h1100M0 625h1100M95 0v700M225 0v700M355 0v700M485 0v700M615 0v700M745 0v700M875 0v700M1005 0v700"/></g><path d="M0 510 1100 400v300H0z" fill="#081728" opacity=".78"/><g transform="translate(710 64) rotate(9)"><rect x="22" y="22" width="258" height="340" rx="17" fill="#000" opacity=".3"/><path d="M0 0h210l49 49v292q0 18-18 18H18q-18 0-18-18z" fill="url(#sort-card)" stroke="#59c6f0" stroke-width="5"/><path d="M210 0v49h49" fill="#8ebbd1" stroke="#59c6f0" stroke-width="4"/><rect x="24" y="29" width="125" height="24" rx="5" fill="#11274a"/><path d="M28 91h193M28 115h149M28 139h185M28 163h126M28 280h188M28 304h137" stroke="#5b8ba6" stroke-width="9" stroke-linecap="round"/><rect x="27" y="198" width="201" height="54" rx="9" fill="#d09640"/><path d="m49 226 13 13 26-28" fill="none" stroke="#11274a" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M100 224h104" stroke="#11274a" stroke-width="8" stroke-linecap="round"/></g><g transform="translate(595 450)"><path d="M0 0h500v69H0z" fill="url(#sort-belt)" stroke="#65bee2" stroke-width="4"/><path d="M16 15h468M16 55h468" stroke="#1ca4dd" stroke-opacity=".65" stroke-width="3"/><g fill="#0b2038" stroke="#5fa4c1" stroke-width="4"><circle cx="37" cy="35" r="20"/><circle cx="122" cy="35" r="20"/><circle cx="207" cy="35" r="20"/><circle cx="292" cy="35" r="20"/><circle cx="377" cy="35" r="20"/><circle cx="462" cy="35" r="20"/></g><path d="M26 73v66m445-66v66" stroke="#557b90" stroke-width="18"/></g><g font-family="Arial,sans-serif" font-weight="800" text-anchor="middle"><g transform="translate(615 570)"><path d="M0 0h136l-12 100H12z" fill="#21547d" stroke="#60c6ef" stroke-width="4"/><text x="68" y="55" font-size="13" fill="#eaf8ff">PUBLIC</text></g><g transform="translate(776 570)"><path d="M0 0h136l-12 100H12z" fill="#294d64" stroke="#99d6ee" stroke-width="4"/><text x="68" y="55" font-size="13" fill="#eaf8ff">INTERNAL</text></g><g transform="translate(937 570)"><path d="M0 0h136l-12 100H12z" fill="#816029" stroke="#e9b458" stroke-width="4"/><text x="68" y="55" font-size="12" fill="#fff4de">CONFIDENTIAL</text></g></g><g fill="#d09640"><circle cx="175" cy="98" r="3"/><circle cx="971" cy="104" r="3"/><circle cx="482" cy="568" r="3"/></g></svg>`;
}

function lobbyGames(){
 $('#app').innerHTML=`<section class="play-now-page"><div class="play-now-cover">${dataSorterCoverArt()}<div class="play-cover-shade"></div><div class="play-now-copy"><div class="play-now-kicker"><span class="live-dot"></span> LEVEL 01 · DATA PROTECTION</div><h1>DATA<br>SORTER</h1><p>Sort the files. Protect what matters.</p><button class="play-now-launch" data-a="quickplay" data-v="1" aria-label="Play Data Sorter now"><span aria-hidden="true">▶</span><b>PLAY NOW</b></button><div class="play-now-time"><strong data-daily-time>15:00</strong> REMAINING TODAY</div></div></div></section>`;
}


/* Upward campaign path: level one is always the bottom checkpoint. */
function lobbyMissions(){
 const selected=LV.find(l=>l.n===S.sel)||curLv(),meta=missionMeta(selected),done=S.done.includes(selected.n),available=open(selected.n);
 const count=LV.length,height=Math.max(1050,count*210),step=height/count;
 const points=Array.from({length:count},(_,i)=>({x:i%2?430:170,y:Math.round(step*(i+.5))}));
 const route=points.reduce((d,p,i)=>i?d+' C'+points[i-1].x+' '+Math.round((points[i-1].y+p.y)/2)+' '+p.x+' '+Math.round((points[i-1].y+p.y)/2)+' '+p.x+' '+p.y:'M'+p.x+' '+p.y,'');
 const victory=S.lastResult?`<div class='journey-victory' role='status'><span class='journey-victory-medal' aria-hidden='true'>★</span><div><small>MISSION ${String(S.lastResult.level).padStart(2,'0')} CLEARED</small><b>Your journey continues!</b><p>+${fmt(S.lastResult.points)} pts · Quiz ${S.lastResult.correct}/${S.lastResult.total} · ${S.lastResult.level<count?'Level '+String(S.lastResult.level+1).padStart(2,'0')+' unlocked':'All levels cleared'}</p></div><button type='button' data-a='dismissResult' aria-label='Dismiss mission result'>×</button></div>`:'';
 const stops=LV.map((l,i)=>{
  const cleared=S.done.includes(l.n),here=l.n===curLv().n&&!cleared,display=count-1-i,m=missionMeta(l);
  const color=['#1ca4dd','#d09640','#d2d0cd','#1da049','#d09640'][i%5];
  return `<button type='button' data-a='sel' data-v='${l.n}' class='journey-stop ${display%2?'right':'left'} ${cleared?'cleared':''} ${here?'current':''} ${selected.n===l.n?'selected':''}' style='--level-accent:${color}' aria-label='Select ${esc(l.name)}' aria-pressed='${selected.n===l.n}'>${here?'<span class="journey-here">YOU ARE HERE</span>':''}<span class='journey-node'><em>${String(l.n).padStart(2,'0')}</em>${cleared?'<i class="journey-clear">✓</i>':''}</span><span class='journey-stars' aria-label='${cleared?'Level cleared':here?'Current level':'Level locked'}'>${cleared?'★ ★ ★':here?'★ ☆ ☆':'☆ ☆ ☆'}</span><span class='journey-stop-copy'><small>LEVEL ${String(l.n).padStart(2,'0')} · ${cleared?'COMPLETE':here?'UP NEXT':'LOCKED'}</small><b>${esc(l.name)}</b><span>${esc(m.tag)}</span></span></button>`;
 }).join('');
 $('#app').innerHTML=`<section class='campaign'>${victory}<header class='arena-heading'><div><div class='hub-eyebrow'>EVERY DEFENDER STARTS SOMEWHERE</div><h1>Your defender journey</h1><p>Start at Level 01 below. Follow the path upward to the next checkpoint.</p></div><div class='arena-counter'><b>${S.done.length}<small> / ${count}</small></b><span>MISSIONS CLEARED</span></div></header><div class='journey-layout'><div class='journey-map'><div class='journey-map-head'><b>DEFENDER WORLD</b><span>${S.done.length} / ${count} BADGES</span></div><div class='journey-finish'><span>⚑</span><b>CYBER DEFENDER</b><small>${S.done.length===count?'Journey complete. Keep sharpening your skills.':'Reach the summit by clearing every chapter.'}</small></div><div class='journey-path'><svg class='journey-route' viewBox='0 0 600 ${height}' preserveAspectRatio='none' aria-hidden='true'><path d='${route}' fill='none' stroke='#315474' stroke-width='28'/><path d='${route}' fill='none' stroke='#1ca4dd' stroke-width='6' stroke-dasharray='10 13'/></svg><div class='journey-stops' style='height:${height}px' aria-label='Your mission journey'>${stops}</div></div><div class='journey-start'>YOUR JOURNEY STARTS HERE <span>↑</span></div></div><div class='campaign-feature'><div class='campaign-art' style='background:${meta.color}'>${hubArt(meta.kind,'campaign-feature')}<span>MISSION ${String(selected.n).padStart(2,'0')} / ${String(count).padStart(2,'0')}</span></div><div class='campaign-info'><div class='hub-eyebrow'>${esc(meta.tag)}</div><h2>${esc(selected.name)}</h2><p>${esc(selected.blurb)}</p><div class='campaign-facts'><span><b>${esc(meta.detail)}</b>Game challenge</span><span><b>${selected.q.length} questions</b>Knowledge check</span><span><b>${fmt(S.best[selected.n]||0)} pts</b>Your personal best</span></div><button class='hub-button' data-a='play' data-v='${selected.n}' ${available?'':'disabled'}>${done?'Replay & beat your best':available?'Launch mission →':'Clear mission '+(selected.n-1)+' to unlock'}</button><small>${done?'Mission cleared. Replays keep your highest score.':available?'Ready when you are. Your next win starts here.':'Complete the previous mission to continue your campaign.'}</small></div></div></div><div class='campaign-tip'><span>✦</span><div><b>Every mission builds a real-world skill.</b><p>Keep climbing. Each new checkpoint gives you another chance to practice.</p></div><button class='hub-link' data-a='nav' data-v='top'>Meet the top defenders ↗</button></div></section>`;
}

/* Required, untimed cyber-awareness briefing before the arcade unlocks. */
const BASICS_QUIZ=[
 {question:'What does multi-factor authentication (MFA) add to a work account?',choices:['A second check that it is really you','A shared password for the team','A faster way to skip sign-in','A replacement for software updates'],answer:0,why:'MFA asks for another proof of identity, so a stolen password alone is not enough.'},
 {question:'Which password habit is safest for your work accounts?',choices:['Reuse one memorable password everywhere','Use a long, unique password for each account','Add the current year to a short password','Share your password with your manager'],answer:1,why:'Use long, unique passwords. An approved password manager can create and remember them.'},
 {question:'Someone claiming to be IT asks for your one-time sign-in code. What do you do?',choices:['Read it out if they sound helpful','Send only half of the code','Refuse and contact the help desk using an approved channel','Approve the sign-in and change the password later'],answer:2,why:'Never share a one-time code or approve an MFA request you did not start.'},
 {question:'You leave your desk for a short conversation. What should happen first?',choices:['Leave your laptop open so work can continue','Ask a colleague to watch your screen','Lock your screen and secure sensitive papers','Turn the monitor brightness down'],answer:2,why:'Lock your screen every time you step away, and keep confidential documents out of view.'},
 {question:'An urgent email asks you to sign in through a link. What is the safest first move?',choices:['Click quickly before the deadline','Open the known company portal yourself and report the suspicious message','Reply with your password to check whether it is real','Forward the link to everyone on your team'],answer:1,why:'Urgency can be a phishing trick. Use a known address or app, then report the message.'},
 {question:'Your work laptop says an approved security update is ready. What should you do?',choices:['Install it through the approved update process','Ignore it until the computer breaks','Download a different installer from a search result','Disable updates to keep the laptop fast'],answer:0,why:'Approved updates fix known weaknesses. Follow your organization’s update process.'},
 {question:'You find an unknown USB drive near your workstation. What is safest?',choices:['Plug it in to find the owner','Give it to a colleague to test','Take it home for later','Hand it to IT or security without connecting it'],answer:3,why:'Unknown removable drives can be unsafe. Let your security team handle them.'},
 {question:'You notice a strange login alert or a lost confidential document. What now?',choices:['Wait to see whether it happens again','Report it promptly using your organization’s security channel','Delete the alert and keep working','Post the details in a public chat'],answer:1,why:'Early reporting gives your organization the best chance to contain a problem.'}
];
const BASICS_MATCH=[
 {place:'WORKSTATION',scenario:'An unlocked laptop is left at an empty desk.',action:'Lock the screen before stepping away.',why:'A locked screen keeps others out of a signed-in account.'},
 {place:'STAFF ENTRANCE',scenario:'A visitor follows someone toward a staff-only area without a badge.',action:'Verify the visitor and direct them to the approved check-in process.',why:'Do not let an unverified visitor bypass physical access controls.'},
 {place:'SHARED TABLE',scenario:'A printout with customer details sits on a shared table.',action:'Secure the paper using approved storage and alert its owner.',why:'Confidential papers should not be left where others can read them.'},
 {place:'MEETING ROOM',scenario:'You find a USB drive beside a meeting-room computer.',action:'Hand the unknown device to IT without plugging it in.',why:'Unknown devices may contain malware or expose data.'},
 {place:'YOUR PHONE',scenario:'Your phone shows an MFA approval request you did not initiate.',action:'Deny the request and report the unexpected prompt.',why:'An unexpected MFA prompt may mean someone has your password.'},
 {place:'FILE REQUEST',scenario:'A colleague asks for a payroll file for an urgent task.',action:'Verify their identity and need-to-know through an approved channel.',why:'Urgency does not replace permission to access confidential data.'}
];
const BASICS_MATCH_ORDER=[3,0,5,2,4,1];
const BASICS_QUIZ_TOPICS=['ACCOUNT ACCESS','PASSWORDS','ONE-TIME CODES','DESK SECURITY','PHISHING','DEVICE UPDATES','UNKNOWN DEVICES','INCIDENT REPORTING'];
const BASICS_SORT=[
 {name:'Approved careers flyer',file:'Innovatiview_Careers_Approved.pdf',type:'PDF',team:'People team',detail:'This sample flyer is approved for sharing on the public careers page.',preview:'Open roles · How to apply · Public contact',category:'Public',why:'Approved careers material can be shared outside Innovatiview.'},
 {name:'Office visitor guide',file:'Innovatiview_Visitor_Guide.docx',type:'DOC',team:'Workplace team',detail:'A staff-only guide to checking in visitors at the office.',preview:'Reception steps · Badge return · Staff contacts',category:'Internal',why:'This work instruction is for Innovatiview staff, not for public release.'},
 {name:'Client service agreement',file:'Innovatiview_Client_Agreement_Draft.pdf',type:'PDF',team:'Client team',detail:'A draft with client terms, pricing, and signature fields.',preview:'Client terms · Pricing · Signatures',category:'Confidential',why:'Client agreements contain sensitive business details and need restricted access.'},
 {name:'Published service brochure',file:'Innovatiview_Service_Brochure.pdf',type:'PDF',team:'Marketing team',detail:'An approved brochure already published on the company website.',preview:'Services overview · Public enquiries',category:'Public',why:'Material approved for the public website belongs in Public.'},
 {name:'Employee payroll export',file:'Innovatiview_Payroll_Export.xlsx',type:'XLS',team:'People team',detail:'A sample export containing names, salaries, and bank details.',preview:'Employee names · Salaries · Bank details',category:'Confidential',why:'Payroll contains highly sensitive personal information and is need-to-know only.'},
 {name:'Team kickoff notes',file:'Innovatiview_Team_Kickoff.docx',type:'DOC',team:'Operations team',detail:'Planning notes for staff, without client or employee records.',preview:'Objectives · Owners · Next steps',category:'Internal',why:'Routine staff planning notes stay inside Innovatiview.'}
];
const BASICS_MODULES=[
 {kind:'quiz',name:'Cyber security quiz',short:'Know the essentials',total:8,tag:'ACCOUNT DEFENSE',icon:'01'},
 {kind:'match',name:'Match the right response',short:'Secure your workspace',total:6,tag:'DESK AWARENESS',icon:'02'},
 {kind:'sort',name:'Sort the files',short:'Handle data with care',total:6,tag:'DATA HANDLING',icon:'03'}
];
let basicsHold=null,basicsFeedback=null,basicsSelected=null,basicsWrongChoice=null,basicsTransition=null;
const basicsCount=()=>{const b=cleanBasics(S.basics);return b.quiz.length+b.match.length+b.sort.length};
const basicsComplete=()=>basicsCount()===20;
function basicsCurrent(){
 const b=cleanBasics(S.basics);
 return BASICS_MODULES.find(m=>b[m.kind].length<m.total)||null
}
function basicsMark(kind,index){
 const previous=S.basics;
 const updated=cleanBasics(previous);
 if(updated[kind].includes(index))return true;
 updated[kind].push(index);updated[kind].sort((a,b)=>a-b);
 S.basics=updated;
 if(save())return true;
 S.basics=previous;
 basicsFeedback={type:'error',text:'Your progress could not be saved. Enable browser storage and try again.'};
 return false
}
function basicsNotice(){
 if(!basicsFeedback)return '';
 return `<div class="basics-feedback ${basicsFeedback.type}" id="basics-feedback" role="status" tabindex="-1"><span aria-hidden="true">${basicsFeedback.type==='good'?'✓':basicsFeedback.type==='error'?'!':'↻'}</span><p>${esc(basicsFeedback.text)}</p>${basicsHold?'<button type="button" data-basic="advance">Next check →</button>':''}</div>`
}
function basicsQuizCard(index){
 const item=BASICS_QUIZ[index],held=basicsHold&&basicsHold.kind==='quiz',done=cleanBasics(S.basics).quiz.length;
 return `<div class="basics-stage-head"><span>MODULE 01 / KNOW THE ESSENTIALS</span><b>CHECK ${String(index+1).padStart(2,'0')} / 08</b></div>
 <div class="basics-challenge-title"><div><span class="basics-mode-label">KNOWLEDGE CHECK</span><h2>Cyber security quiz</h2><p class="basics-stage-intro">Build the habits that protect your account and your workstation.</p></div><div class="basics-challenge-icon" aria-hidden="true">?</div></div>
 <div class="basics-quiz-meter" aria-label="${done} of 8 quiz questions complete">${BASICS_QUIZ.map((_,i)=>`<span class="${i<done?'complete':i===index?'current':''}"></span>`).join('')}</div>
 <div class="basics-question"><div class="basics-question-top"><span>DECISION ${String(index+1).padStart(2,'0')}</span><span>${BASICS_QUIZ_TOPICS[index]}</span></div><h3>${esc(item.question)}</h3><div class="basics-question-foot"><span class="basics-pulse" aria-hidden="true"></span> THINK LIKE A DEFENDER</div></div>
 <div class="basics-choice-label">SELECT THE SAFEST RESPONSE <span>01—04</span></div>
 <div class="basics-answers">${item.choices.map((choice,i)=>`<button type="button" data-basic="quiz" data-choice="${i}" class="basics-answer ${held&&i===item.answer?'correct':''} ${basicsWrongChoice===i?'wrong':''}" ${held||basicsWrongChoice===i?'disabled':''}><span class="basics-answer-key">${String.fromCharCode(65+i)}</span><span class="basics-answer-text">${esc(choice)}</span><span class="basics-answer-arrow" aria-hidden="true">↗</span></button>`).join('')}</div>${basicsNotice()}`
}
function basicsMatchCard(){
 const done=cleanBasics(S.basics).match;
 return `<div class="basics-stage-head"><span>MODULE 02 / SECURE YOUR WORKSPACE</span><b>${done.length} / 06 MATCHED</b></div>
 <div class="basics-challenge-title"><div><span class="basics-mode-label">FIELD EXERCISE</span><h2>Match the right response</h2><p class="basics-stage-intro">Pick a situation on the left. Connect it to the safest action on the right.</p></div><div class="basics-challenge-icon match" aria-hidden="true">⇄</div></div>
 <div class="basics-match-meter"><span>CONNECTIONS MADE</span><div aria-label="${done.length} of 6 pairs matched">${BASICS_MATCH.map((_,i)=>`<i class="${done.includes(i)?'complete':''}">${done.includes(i)?'✓':String(i+1).padStart(2,'0')}</i>`).join('')}</div><b>${done.length}/6</b></div>
 <div class="basics-match-grid"><div class="basics-match-column situations"><div class="basics-match-column-head"><span class="basics-column-glyph" aria-hidden="true">!</span><div><small>CHOOSE FIRST</small><h3>WORKPLACE SITUATION</h3></div></div>${BASICS_MATCH.map((pair,i)=>`<button type="button" data-basic="scenario" data-choice="${i}" class="basics-match-card ${done.includes(i)?'matched':''} ${basicsSelected===i?'selected':''}" aria-pressed="${basicsSelected===i}" ${done.includes(i)?'disabled':''}><small class="basics-match-number">${String(i+1).padStart(2,'0')}</small><span class="basics-match-copy"><small>${pair.place}</small>${esc(pair.scenario)}</span>${done.includes(i)?'<b aria-label="Matched">✓</b>':'<em aria-hidden="true">↗</em>'}</button>`).join('')}</div>
 <div class="basics-match-column actions"><div class="basics-match-column-head"><span class="basics-column-glyph" aria-hidden="true">✓</span><div><small>THEN CONNECT</small><h3>SAFE ACTION</h3></div></div><div class="basics-selected-situation" role="status"><small>ACTIVE SITUATION</small><span>${basicsSelected===null?'Select a situation, then choose its safest action.':esc(BASICS_MATCH[basicsSelected].scenario)}</span></div>${BASICS_MATCH_ORDER.map((i,position)=>`<button type="button" data-basic="action" data-choice="${i}" class="basics-match-card ${done.includes(i)?'matched':''} ${basicsWrongChoice===i?'wrong':''}" ${done.includes(i)?'disabled':''}><small class="basics-match-number">${String.fromCharCode(65+position)}</small><span>${esc(BASICS_MATCH[i].action)}</span>${done.includes(i)?'<b aria-label="Matched">✓</b>':'<em aria-hidden="true">↗</em>'}</button>`).join('')}</div></div>${basicsNotice()}`
}
function basicsSortCard(index){
 const item=BASICS_SORT[index],held=basicsHold&&basicsHold.kind==='sort',done=cleanBasics(S.basics).sort.length;
 return `<div class="basics-stage-head"><span>MODULE 03 / HANDLE DATA WITH CARE</span><b>FILE ${String(index+1).padStart(2,'0')} / 06</b></div>
 <div class="basics-challenge-title"><div><span class="basics-mode-label">DATA HANDLING CHALLENGE</span><h2>Sort the files</h2><p class="basics-stage-intro">Classify six sample Innovatiview files. For real documents, follow your company policy.</p></div><div class="basics-challenge-icon sort" aria-hidden="true">▤</div></div>
 <div class="basics-sort-meter" aria-label="${done} of 6 files classified">${BASICS_SORT.map((_,i)=>`<span class="${i<done?'complete':i===index?'current':''}"></span>`).join('')}</div>
 <div class="basics-sort-console"><div class="basics-sort-console-top"><span><i></i> INNOVATIVIEW / TRAINING INBOX</span><b>FILE ${String(index+1).padStart(2,'0')} OF 06</b></div>
 <div class="basics-file"><div class="basics-file-sheet basics-file-sheet-${item.type.toLowerCase()}" aria-hidden="true"><div class="basics-file-sheet-brand">IV <span>INNOVATIVIEW</span></div><div class="basics-file-sheet-lines"><i></i><i></i><i></i><i></i></div><strong>${item.type}</strong></div><div class="basics-file-details"><div class="basics-file-overline"><span>TRAINING SAMPLE</span><span>${esc(item.team)}</span></div><h3>${esc(item.name)}</h3><code>${esc(item.file)}</code><p>${esc(item.detail)}</p><div class="basics-file-preview"><small>FILE CONTENTS</small><span>${esc(item.preview)}</span></div></div></div></div>
 <div class="basics-sort-title"><span>CHOOSE A DESTINATION</span><b>Where should this file live?</b></div>
 <div class="basics-bins">${['Public','Internal','Confidential'].map((category,i)=>`<button type="button" data-basic="sort" data-choice="${i}" class="basics-bin basics-bin-${category.toLowerCase()} ${held&&category===item.category?'correct':''} ${basicsWrongChoice===i?'wrong':''}" ${held||basicsWrongChoice===i?'disabled':''}><span class="basics-bin-folder" aria-hidden="true">${['◎','▣','◆'][i]}</span><span class="basics-bin-copy"><b>${category}</b><small>${['Approved for anyone','Staff use only','Approved need-to-know'][i]}</small></span><span class="basics-bin-arrow" aria-hidden="true">↗</span></button>`).join('')}</div>${basicsNotice()}`
}
function basicsMilestone(kind){
 const final=kind==='sort'||basicsComplete();
 const title=final?'Basics cleared. Game on.':kind==='quiz'?'Module 01 cleared.':'Module 02 cleared.';
 const copy=final?'You have mastered all 20 checks. Your 15-minute daily game timer starts when you begin playing.':kind==='quiz'?'You know the core account and device habits. Next, protect the space around your desk.':'You can spot workplace risks. One final challenge: sort company information safely.';
 return `<div class="basics-milestone"><div class="basics-medal" aria-hidden="true">${final?'★':'✓'}</div><span class="basics-kicker">${final?'20 / 20 CHECKS COMPLETE':'CHECKPOINT CLEARED'}</span><h2>${title}</h2><p>${copy}</p><button type="button" class="basics-primary" data-basic="${final?'unlock':'continue'}">${final?'Enter PLAY Now':'Continue to next module'} <span aria-hidden="true">→</span></button></div>`
}
function basicsView(){
 S.basics=cleanBasics(S.basics);
 const progress=basicsCount(),current=basicsCurrent();
 const kind=basicsHold?basicsHold.kind:basicsTransition||current?.kind||'sort';
 const module=BASICS_MODULES.find(m=>m.kind===kind)||BASICS_MODULES[2];
 const count=S.basics[module.kind].length;
 let stage;
 if(basicsTransition||!current)stage=basicsMilestone(basicsTransition||'sort');
 else if(kind==='quiz')stage=basicsQuizCard(basicsHold?.index??BASICS_QUIZ.findIndex((_,i)=>!S.basics.quiz.includes(i)));
 else if(kind==='match')stage=basicsMatchCard();
 else stage=basicsSortCard(basicsHold?.index??BASICS_SORT.findIndex((_,i)=>!S.basics.sort.includes(i)));
 const tips=kind==='quiz'?['Turn on MFA for your work account.','Use long, unique passwords.','Report unexpected prompts and messages.']:kind==='match'?['Lock the screen before leaving.','Keep confidential papers out of view.','Verify visitors and unusual requests.']:['Public: approved for external release.','Internal: only for employees.','Confidential: approved need-to-know only.'];
 const first=String(S.name||'Defender').trim().split(/\s+/)[0];
 $('#app').innerHTML=`<section class="basics-shell">
 <header class="basics-hero"><div class="basics-hero-copy"><div class="basics-kicker"><i></i> REQUIRED PLAYER BRIEFING</div><small>WELCOME, ${esc(first).toUpperCase()}</small><h1>Know the basics.<br><em>Then play to win.</em></h1><p>Three short modules. Twenty checks. Learn to protect your account, your desk, and company data before the arcade unlocks.</p><div class="basics-hero-chips"><span>NO GAME TIME USED</span><span>PROGRESS SAVED</span></div></div><div class="basics-hero-art" aria-hidden="true"><div class="basics-monitor"><span>✓</span><i></i><i></i></div><div class="basics-desk"></div><div class="basics-note">CONFIDENTIAL <b>◆</b></div><div class="basics-shield">✓</div></div></header>
 <div class="basics-progress"><div><span class="basics-kicker">YOUR READINESS</span><b>${progress}<small> / 20 CHECKS</small></b></div><div class="basics-track" role="progressbar" aria-label="Basics completed" aria-valuemin="0" aria-valuemax="20" aria-valuenow="${progress}"><span style="width:${progress*5}%"></span></div><strong>${basicsComplete()?'ARCADE UNLOCKED':'ARCADE LOCKED UNTIL BASICS ARE COMPLETE'}</strong></div>
 <div class="basics-modules" aria-label="Training modules">${BASICS_MODULES.map((m,i)=>`<div class="basics-module ${S.basics[m.kind].length===m.total?'done':kind===m.kind?'active':'locked'}"><span class="basics-module-number">${m.icon}</span><div><small>${m.tag}</small><b>${m.name}</b><p>${m.short}</p></div><strong>${S.basics[m.kind].length===m.total?'✓':S.basics[m.kind].length+'/'+m.total}</strong></div>`).join('')}</div>
 <div class="basics-workspace"><section class="basics-stage basics-stage-${kind}" id="basics-stage" aria-label="Current training challenge">${stage}</section><aside class="basics-aside"><div class="basics-aside-top"><span>FIELD GUIDE</span><strong>${module.icon}</strong></div><h3>Keep this in mind</h3><ul>${tips.map(t=>`<li><span>✓</span>${esc(t)}</li>`).join('')}</ul><div class="basics-aside-foot"><b>LEARN • PRACTICE • DEFEND</b><p>Wrong answer? Try again. Every check counts when you get it right.</p></div></aside></div>
 </section>`
}
function basicsAnswer(kind,choice){
 if(basicsHold||basicsTransition||basicsComplete())return;
 const done=cleanBasics(S.basics)[kind],items=kind==='quiz'?BASICS_QUIZ:BASICS_SORT;
 const index=items.findIndex((_,i)=>!done.includes(i));
 if(index<0)return;
 const item=items[index],right=kind==='quiz'?item.answer:['Public','Internal','Confidential'].indexOf(item.category);
 if(choice===right){
  if(!basicsMark(kind,index)){basicsView();return}
  basicsHold={kind,index};basicsWrongChoice=null;
  basicsFeedback={type:'good',text:item.why};SFX.ok()
 }else{
  basicsWrongChoice=choice;basicsFeedback={type:'retry',text:'Not quite. '+item.why};SFX.bad()
 }
 basicsView();document.getElementById('basics-feedback')?.focus()
}
function basicsMatchAction(action,choice){
 if(basicsTransition||basicsComplete())return;
 const done=cleanBasics(S.basics).match;
 if(action==='scenario'){
  if(done.includes(choice))return;
  basicsSelected=choice;basicsWrongChoice=null;basicsFeedback=null;basicsView();
  if(typeof window!=='undefined'&&window.matchMedia('(max-width: 600px)').matches)document.querySelector('.basics-selected-situation')?.scrollIntoView({behavior:'smooth',block:'center'});
  return
 }
 if(basicsSelected===null){basicsFeedback={type:'retry',text:'Select a situation first, then choose its safest action.'};basicsView();return}
 if(done.includes(choice))return;
 const pair=BASICS_MATCH[basicsSelected];
 if(choice===basicsSelected){
  if(!basicsMark('match',choice)){basicsView();return}
  basicsFeedback={type:'good',text:pair.why};basicsSelected=null;basicsWrongChoice=null;SFX.ok();
  if(S.basics.match.length===BASICS_MATCH.length)basicsTransition='match'
 }else{
  basicsWrongChoice=choice;basicsFeedback={type:'retry',text:'Try a different action. '+pair.why};SFX.bad()
 }
 basicsView();document.getElementById('basics-feedback')?.focus()
}
if(typeof document!=='undefined')document.addEventListener('click',e=>{
 const button=e.target.closest('[data-basic]');
 if(!button||S.view!=='basics')return;
 const action=button.dataset.basic,choice=Number(button.dataset.choice);
 if(action==='quiz'||action==='sort')basicsAnswer(action,choice);
 else if(action==='scenario'||action==='action')basicsMatchAction(action,choice);
 else if(action==='advance'){
  const previous=basicsHold?.kind;
  basicsHold=null;basicsFeedback=null;basicsWrongChoice=null;
  if(previous==='quiz'&&S.basics.quiz.length===BASICS_QUIZ.length)basicsTransition='quiz';
  if(previous==='sort'&&basicsComplete())basicsTransition='sort';
  basicsView()
 }else if(action==='continue'){
  basicsTransition=null;basicsFeedback=null;basicsSelected=null;basicsView()
 }else if(action==='unlock'&&basicsComplete()){
  basicsTransition=null;basicsFeedback=null;S.view='games';render()
 }
});

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
   const module=await import('./packet-city.mjs?v=fb2e94578c');
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

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

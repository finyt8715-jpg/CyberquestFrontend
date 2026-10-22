'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {validateLevel}=require('../scripts/levels');

const sample={
  name:'Password patrol',blurb:'Practice stronger passwords.',game:'shoot',
  questions:[
    {prompt:'Which is stronger?',options:['A long passphrase','password','123456','qwerty'],correct:0,explanation:'Length and uniqueness help.'},
    {prompt:'What helps after a leak?',options:['Enable MFA','Ignore it','Reuse it','Share it'],correct:0,explanation:'MFA adds another proof.'}
  ]
};

test('admin-authored level is playable in an existing game format and validates its quiz',()=>{
 const level=validateLevel(sample);
 assert.equal(level.game,'shoot');
 assert.equal(level.questions.length,2);
 assert.equal(level.meta.kind,'shield');
 assert.throws(()=>validateLevel({...sample,game:'stub'}),/available game format/);
 assert.throws(()=>validateLevel({...sample,name:'<script>'}),/plain text/);
 assert.throws(()=>validateLevel({...sample,questions:[sample.questions[0]]}),/2–5/);
 const source=fs.readFileSync(path.join(__dirname,'../src/cyberquest.html'),'utf8')
  .replace('/*__EXTRA_LEVELS__*/[]',JSON.stringify([level]));
 const sandbox=vm.createContext({});
 vm.runInContext(source.slice(source.indexOf('const S={'),source.indexOf('function hdr(){')),sandbox);
 assert.equal(vm.runInContext('LV.length',sandbox),6);
 assert.equal(vm.runInContext('S.assign[6]',sandbox),'shoot');
 assert.equal(vm.runInContext('LV[5].q.length',sandbox),2);
 vm.runInContext('S.done=[1,2,3,4,5]',sandbox);
 assert.equal(vm.runInContext('open(6)',sandbox),true);
});

test('mission route grows upward as new levels are added',()=>{
 const app={innerHTML:''};
 const LV=Array.from({length:6},(_,i)=>({n:i+1,name:'Mission '+(i+1),blurb:'Lesson',q:[[1]],meta:{kind:'shield',tag:'Arcade defense',color:'#2f2342',detail:'Round'}}));
 const sandbox=vm.createContext({LV,S:{sel:1,done:[],best:{},lastResult:null},$ :()=>app,curLv:()=>LV[0],open:n=>n===1,missionMeta:l=>l.meta,hubArt:()=>'',fmt:n=>String(n),esc:s=>String(s)});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/mission-map.js'),'utf8'),sandbox);
 vm.runInContext('lobbyMissions()',sandbox);
 const html=app.innerHTML;
 assert.match(html,/0<small> \/ 6<\/small>/);
 assert.match(html,/MISSION 01 \/ 06/);
 assert.match(html,/height:1260px/);
 assert.ok(html.indexOf("class='journey-finish'")<html.indexOf("class='journey-stops'"));
 assert.ok(html.indexOf("class='journey-stops'")<html.indexOf("class='journey-start'"));
 assert.match(fs.readFileSync(path.join(__dirname,'../src/lobby.css'),'utf8'),/\.journey-path \.journey-stops\{flex-direction:column-reverse\}/);
});

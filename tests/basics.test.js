'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const core=fs.readFileSync('src/cyberquest.html','utf8');
const basics=fs.readFileSync('src/basics.js','utf8');
const persistence=core.slice(core.indexOf("const KEY='"),core.indexOf('/* Backend adapter'));

function training(){
 const listeners={},app={innerHTML:''},saved=[];
 const S={name:'Taylor',view:'basics',basics:{version:1,quiz:[],match:[],sort:[]}};
 const context=vm.createContext({
  S,SERVER:false,$:()=>app,esc:s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
  document:{addEventListener:(name,fn)=>listeners[name]=fn,getElementById:()=>({focus(){}})},
  SFX:{ok(){},bad(){}},save:()=>{saved.push(JSON.stringify(S.basics));return true},render:()=>{context.rendered=true}
 });
 vm.runInContext(core.slice(core.indexOf('const BASICS_VERSION='),core.indexOf('const savedLevelCount=')),context);
 vm.runInContext(basics,context);
 const click=(action,choice=0)=>listeners.click({target:{closest:()=>({dataset:{basic:action,choice:String(choice)}})}});
 return {context,S,app,saved,click,run:code=>vm.runInContext(code,context)};
}

test('the basics path has 20 distinct checks across quiz, matching and sorting',()=>{
 const t=training();
 assert.deepEqual(JSON.parse(t.run("JSON.stringify([BASICS_QUIZ.length,BASICS_MATCH.length,BASICS_SORT.length])")),[8,6,6]);
 assert.match(t.run('basicsView(); S.view'),/basics/);
 assert.match(t.app.innerHTML,/20 CHECKS/);
 assert.match(t.app.innerHTML,/Cyber security quiz/);
 assert.equal(t.run('basicsComplete()'),false);
});

test('wrong choices cannot unlock gameplay; correct responses advance and persist',()=>{
 const t=training();
 t.click('quiz',1);
 assert.equal(t.S.basics.quiz.length,0);
 assert.match(t.app.innerHTML,/Not quite/);
 const quizAnswers=JSON.parse(t.run('JSON.stringify(BASICS_QUIZ.map(q=>q.answer))'));
 quizAnswers.forEach((answer,i)=>{t.click('quiz',answer);assert.equal(t.S.basics.quiz.length,i+1);t.click('advance')});
 assert.match(t.app.innerHTML,/Module 01 cleared/);
 t.click('continue');
 t.click('scenario',0);
 t.click('action',1);
 assert.equal(t.S.basics.match.length,0);
 for(let i=0;i<6;i++){t.click('scenario',i);t.click('action',i)}
 assert.equal(t.S.basics.match.length,6);
 assert.match(t.app.innerHTML,/Module 02 cleared/);
 t.click('continue');
 const categories=JSON.parse(t.run("JSON.stringify(BASICS_SORT.map(x=>['Public','Internal','Confidential'].indexOf(x.category)))"));
 categories.forEach((answer,i)=>{t.click('sort',answer);assert.equal(t.S.basics.sort.length,i+1);if(i<5)t.click('advance')});
 assert.equal(t.run('basicsComplete()'),true);
 assert.match(t.app.innerHTML,/Basics cleared/);
 assert.equal(t.saved.length,20);
 t.click('unlock');
 assert.equal(t.S.view,'games');
 assert.equal(t.context.rendered,true);
});

test('saved progress is normalized and kept separate for server accounts',()=>{
 const store=new Map(),S={name:'Taylor',photo:'',best:{},done:[],claimed:{},cases:{},basics:{version:1,quiz:[0,1],match:[0],sort:[]}};
 const context=vm.createContext({
  SERVER:false,S,SFX:{s:{sfx:true,music:false}},profilePhotoValid:()=>false,
  localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)}
 });
 vm.runInContext(persistence,context);
 assert.equal(vm.runInContext('save()',context),true);
 S.basics={version:1,quiz:[],match:[],sort:[]};
 vm.runInContext('load()',context);
 assert.equal(JSON.stringify(S.basics.quiz),'[0,1]');
 assert.equal(JSON.stringify(S.basics.match),'[0]');
 const sanitized=JSON.parse(vm.runInContext('JSON.stringify(cleanBasics({version:1,quiz:[0,0,99],match:[-1,2],sort:[1]}))',context));
 assert.deepEqual(sanitized,{version:1,quiz:[0],match:[2],sort:[1]});
 context.SERVER=true;S.user={id:41};vm.runInContext('save()',context);
 S.user={id:42};S.basics={version:1,quiz:[],match:[],sort:[]};vm.runInContext('save()',context);
 assert.notEqual(store.get('cyberquest.basics.v1.41'),store.get('cyberquest.basics.v1.42'));
});

test('incomplete basics block the platform route and direct game launch',async()=>{
 const t=training();
 let gamesShown=0,mounted=0;
 Object.assign(t.context,{
  V:{basics:()=>t.run('basicsView()'),games:()=>gamesShown++},
  hdr(){},dailyPaint(){},ADMIN:()=>false,
  dailyAllow:()=>true,open:()=>true,dailyActive:false,dailyLast:0,
  GAMES:{sorter:{mount(){mounted++}}},stage:()=>({}),ctx:{},total:()=>100
 });
 t.S.assign={1:'sorter'};t.S.best={};
 vm.runInContext(core.slice(core.indexOf('async function play(n){'),core.indexOf('function quiz(')),t.context);
 vm.runInContext(core.slice(core.indexOf('function render(){'),core.indexOf('function crash(')),t.context);
 t.S.view='games';t.run('render()');
 assert.equal(t.S.view,'basics');
 assert.equal(gamesShown,0);
 await t.run('play(1)');
 assert.equal(mounted,0);
 t.S.basics={version:1,quiz:[0,1,2,3,4,5,6,7],match:[0,1,2,3,4,5],sort:[0,1,2,3,4,5]};
 t.S.view='games';t.run('render()');
 assert.equal(gamesShown,1);
 await t.run('play(1)');
 assert.equal(mounted,1);
});

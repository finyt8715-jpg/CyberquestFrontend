'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/cyberquest.html'),'utf8');

function setup(){
 let now=new Date(2026,9,21,12).getTime(),hidden=false;
 const store=new Map([['cyberquest.daily-play',JSON.stringify({used:900000})]]),events={},badge={},button={dataset:{v:'1'},disabled:false};
 class Clock extends Date{constructor(...args){super(...(args.length?args:[now]))}static now(){return now}}
 const S={name:'Tester',view:'play',score:0};
 const context=vm.createContext({Date:Clock,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},setInterval:()=>{},window:{addEventListener:(name,fn)=>events[name]=fn},document:{get hidden(){return hidden},addEventListener:(name,fn)=>events[name]=fn,getElementById:id=>id==='app'?{prepend(){}}:badge,querySelectorAll:selector=>selector.includes('data-a')?[button]:[],createElement:()=>({setAttribute(){}}),querySelector:()=>({appendChild(){}})},S,open:()=>true,VOICE:{stop(){}},SFX:{duck(){}},total:()=>0,render(){},leaveFirewallScreen(){},toast(){}});
 const start=source.indexOf('const DAILY_PLAY_KEY='),end=source.indexOf('\nboot();',start);
 vm.runInContext(source.slice(start,end),context);
 return {context,store,events,badge,button,S,advance:ms=>{now+=ms},setHidden:value=>{hidden=value;events.visibilitychange?.()},run:code=>vm.runInContext(code,context)}
}

test('repaired timer starts at 15 minutes and ignores exhausted legacy data',()=>{
 const t=setup();assert.equal(t.run('dailyText()'),'15:00');assert.equal(t.run('dailyAllow()'),true);
 t.run('dailyActive=true;dailyTick()');t.advance(60000);t.run('dailyTick()');assert.equal(t.run('dailyText()'),'14:00');
 t.setHidden(true);t.advance(300000);t.run('dailyTick()');assert.equal(t.run('dailyText()'),'14:00');
 t.setHidden(false);t.advance(60000);t.run('dailyTick()');assert.equal(t.run('dailyText()'),'13:00');
});

test('expiry blocks play, midnight restores it, and the button unlocks',()=>{
 const t=setup();t.run('dailyActive=true;dailyTick()');t.advance(900000);t.run('dailyTick()');
 assert.equal(t.run('dailyRemaining()'),0);assert.equal(t.S.view,'games');assert.equal(t.button.disabled,true);
 t.advance(86400000);t.run('dailyPaint()');assert.equal(t.run('dailyText()'),'15:00');assert.equal(t.button.disabled,false);assert.equal(t.run('dailyAllow()'),true);
});

test('malformed current timer data resets instead of leaving games locked',()=>{
 const t=setup();t.store.set('cyberquest.daily-play.v2','broken');assert.equal(t.run('dailyText()'),'15:00');assert.equal(t.run('dailyAllow()'),true);
});

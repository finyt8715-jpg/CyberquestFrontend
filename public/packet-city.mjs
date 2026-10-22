import * as THREE from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/rounded-box.mjs';

// Stylized metro chase. Scenery, textures and the character are generated locally.
export function createPacketCity(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(52,1,.1,160);
 scene.fog=new THREE.Fog('#796896',36,125);
 const materials=[],geometries=[],textures=[],geoCache=new Map(),artCache=new Map(),chunks=[],entityMeshes=new Map();
 const boxGeo=new THREE.BoxGeometry(1,1,1),sphereGeo=new THREE.SphereGeometry(1,16,12),cylinderGeo=new THREE.CylinderGeometry(1,1,1,16),planeGeo=new THREE.PlaneGeometry(1,1);
 geometries.push(boxGeo,sphereGeo,cylinderGeo,planeGeo);
 function material(color,glow=0){const v=new THREE.MeshStandardMaterial({color,roughness:.78,metalness:.06,emissive:color,emissiveIntensity:glow});materials.push(v);return v}
 const m={ground:material('#626681'),sleeper:material('#45405e'),tie:material('#62566d'),rail:material('#abb2c9'),curb:material('#a0a4c0'),dark:material('#202c48'),glass:material('#193b5c'),glassLight:material('#46789c'),cream:material('#e0e9e7'),teal:material('#19adae'),coral:material('#ed557a'),violet:material('#8269bf'),blue:material('#477eb0'),purple:material('#494776'),pink:material('#f56dca',.65),cyan:material('#6cecf1',.7),gold:material('#ffca42',.3),mint:material('#7dffc5',.7),warm:material('#ffc580',.25),skin:material('#c58b6d'),hair:material('#292338'),jacket:material('#e94091'),hood:material('#39c9d3'),denim:material('#304876'),sole:material('#f3eada'),shoe:material('#e7a43d')};
 const sky=document.createElement('canvas');sky.width=16;sky.height=512;const skyCtx=sky.getContext('2d'),gradient=skyCtx.createLinearGradient(0,0,0,512);gradient.addColorStop(0,'#171f50');gradient.addColorStop(.45,'#675294');gradient.addColorStop(.76,'#de91b1');gradient.addColorStop(1,'#f4b8a2');skyCtx.fillStyle=gradient;skyCtx.fillRect(0,0,16,512);const skyTexture=new THREE.CanvasTexture(sky);skyTexture.colorSpace=THREE.SRGBColorSpace;textures.push(skyTexture);scene.background=skyTexture;
 scene.add(new THREE.HemisphereLight('#deeaff','#56517e',1.5));
 const key=new THREE.DirectionalLight('#fff0db',2.2);key.position.set(-10,18,12);scene.add(key);
 const rim=new THREE.DirectionalLight('#b0c7ff',1.2);rim.position.set(10,7,-12);scene.add(rim);
 function group(parent,x=0,y=0,z=0){const v=new THREE.Group();v.position.set(x,y,z);parent.add(v);return v}
 function mesh(parent,geo,mat,x,y,z,sx=1,sy=1,sz=1){const v=new THREE.Mesh(geo,mat);v.position.set(x,y,z);v.scale.set(sx,sy,sz);parent.add(v);return v}
 function box(p,x,y,z,w,h,d,mat){return mesh(p,boxGeo,mat,x,y,z,w,h,d)}
 function round(p,x,y,z,w,h,d,mat,r=.1){const k=[w,h,d,r].join(':');let geo=geoCache.get(k);if(!geo){geo=new RoundedBoxGeometry(w,h,d,2,r);geoCache.set(k,geo);geometries.push(geo)}return mesh(p,geo,mat,x,y,z)}
 function ball(p,x,y,z,w,h,d,mat){return mesh(p,sphereGeo,mat,x,y,z,w,h,d)}
 function cylinder(p,x,y,z,r,h,mat){return mesh(p,cylinderGeo,mat,x,y,z,r,h,r)}
 function batch(root){
  root.updateMatrixWorld(true);const batches=new Map(),inv=new THREE.Matrix4().copy(root.matrixWorld).invert();
  root.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh){const k=o.geometry.uuid+o.material.uuid;if(!batches.has(k))batches.set(k,[]);batches.get(k).push(o)}});
  for(const list of batches.values()){if(list.length<2)continue;const v=new THREE.InstancedMesh(list[0].geometry,list[0].material,list.length);list.forEach((o,i)=>{v.setMatrixAt(i,new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld));o.removeFromParent()});v.instanceMatrix.needsUpdate=true;v.computeBoundingSphere();root.add(v)}
 }
 function artwork(copy,fg='#eafaff',bg='#1d2a4c',graffiti=false){
  const k=copy+fg+bg+graffiti;if(artCache.has(k))return artCache.get(k);
  const c=document.createElement('canvas');c.width=512;c.height=192;const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,512,192);
  if(graffiti){g.fillStyle='#131c4040';for(let i=0;i<18;i++)g.fillRect((i*97)%512,(i*43)%192,50,10);g.translate(256,98);g.rotate(-.08);g.font='italic 900 86px Arial';g.textAlign='center';g.textBaseline='middle';g.lineWidth=12;g.strokeStyle='#1b244d';g.strokeText(copy,0,0,465);g.fillStyle=fg;g.fillText(copy,0,0,465);g.font='700 18px Arial';g.fillText('KEEP YOUR DATA MOVING',0,63)}
  else{g.strokeStyle=fg;g.lineWidth=7;g.strokeRect(7,7,498,178);g.font='900 58px Arial';g.textAlign='center';g.textBaseline='middle';g.fillStyle=fg;g.fillText(copy,256,98,470)}
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;textures.push(tex);const mat=new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide});materials.push(mat);artCache.set(k,mat);return mat;
 }
 function sign(p,copy,x,y,z,w,h,fg,bg,graffiti=false){return mesh(p,planeGeo,artwork(copy,fg,bg,graffiti),x,y,z,w,h,1)}
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=64;const sc=shadowCanvas.getContext('2d'),sg=sc.createRadialGradient(32,32,4,32,32,32);sg.addColorStop(0,'#0b123daa');sg.addColorStop(1,'#0b123d00');sc.fillStyle=sg;sc.fillRect(0,0,64,64);const shadowTexture=new THREE.CanvasTexture(shadowCanvas);textures.push(shadowTexture);const shadowMat=new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false});materials.push(shadowMat);
 function shadow(p,x,z,w,d){const v=mesh(p,planeGeo,shadowMat,x,.27,z,w,d,1);v.rotation.x=-Math.PI/2;return v}

 function train(parent,length=10,color=m.teal,threat=false){
  const car=group(parent),mid=.32-length/2;
  shadow(car,0,mid,3.4,length+1);
  round(car,0,1.9,mid,2.18,2.85,length,color,.25);round(car,0,3.17,mid,2.09,.42,length-.2,m.cream,.17);round(car,0,.63,mid,2.16,.6,length-.2,m.dark,.12);
  round(car,0,2.38,.35,1.79,.94,.14,m.dark,.18);round(car,0,2.4,.44,1.59,.7,.055,m.glassLight,.12);box(car,0,2.4,.48,.055,.72,.03,m.dark);box(car,-.43,2.56,.49,.49,.025,.025,m.cyan);
  round(car,0,1.22,.42,1.9,.45,.15,m.cream,.12);box(car,0,.86,.49,1.2,.09,.06,m.dark);
  for(let side of [-1,1]){
   ball(car,side*.72,1.28,.53,.14,.12,.055,m.warm);box(car,side*1.1,1.22,mid,.05,.22,length-.6,m.cream);
   for(let j=0;j<4;j++){const z=-.8-j*(length-1.9)/4;round(car,side*1.105,2.35,z,.07,.84,1.22,m.dark,.05);round(car,side*1.15,2.39,z,.025,.61,1.03,m.glassLight,.01);box(car,side*1.17,2.53,z,.025,.055,.86,m.cyan)}
   round(car,side*1.115,1.87,-length*.52,.085,2.1,1.35,m.cream,.06);box(car,side*1.17,1.8,-length*.52,.03,1.86,.045,m.dark);
   for(let z of [-1.2,1.5-length]){const wheel=cylinder(car,side*1.04,.47,z,.34,.17,m.dark);wheel.rotation.z=Math.PI/2;const hub=cylinder(car,side*1.14,.47,z,.15,.03,m.rail);hub.rotation.z=Math.PI/2}
   const art=sign(car,threat?'GLITCH':'BYTE',side*1.17,1.65,-length*.78,2,.72,threat?'#ffce6c':'#9ffff4',threat?'#e34e8a':'#20979e',true);art.rotation.y=side*Math.PI/2;
  }
  for(let z of [-1.8,-length*.65]){round(car,0,3.43,z,1.25,.22,1.2,m.rail,.08);for(let i=-3;i<=3;i++)box(car,i*.15,3.55,z,.06,.025,.86,m.dark)}
  sign(car,threat?'!  FAKE LOGIN':'NEON EXPRESS',0,2.99,.55,1.62,.27,threat?'#ffda6f':'#adf8ff','#192b47');
  if(threat)sign(car,'← DODGE →',0,1.78,.55,1.55,.36,'#ffe299','#712c57');
  batch(car);return car;
 }

 const skyline=group(scene);
 for(let side of [-1,1])for(let i=0;i<14;i++){
  const x=side*(12+i%4*4.6),z=-25-i*6,h=11+i*7%24,col=[m.purple,m.violet,m.blue][i%3];round(skyline,x,h/2,z,3+i%3,h,4,col,.12);box(skyline,x+.5,h+.8,z,.12,1.8,.12,m.cyan);
  for(let y=2;y<h;y+=2.3)for(let q=-1;q<=1;q++)box(skyline,x+q*.8,y,z+2.03,.32,.7,.04,(i+q)%3?m.warm:m.cyan);
 }
 ball(skyline,1,17,-112,10,10,.2,material('#ffadbc',.5));batch(skyline);
 const blockLength=14,totalLength=168;
 for(let i=0;i<12;i++){
  const block=group(scene);block.userData.offset=i*blockLength;chunks.push(block);box(block,0,-.23,0,9,.45,blockLength,m.ground);
  for(let lane=-1;lane<=1;lane++){
   box(block,lane*2.6,-.015,0,2.3,.1,blockLength,m.sleeper);
   for(let z=-6.5;z<7;z+=.85)box(block,lane*2.6,.045,z,2.05,.13,.22,m.tie);
   for(let side of [-1,1]){box(block,lane*2.6+side*.74,.13,0,.09,.17,blockLength,m.dark);box(block,lane*2.6+side*.74,.23,0,.12,.04,blockLength,m.cream)}
  }
  for(let side of [-1,1]){
   box(block,side*4.8,.08,0,1.4,.7,blockLength,m.curb);box(block,side*4.16,.46,0,.09,.04,blockLength,i%3?m.cyan:m.pink);box(block,side*5.45,.95,0,.3,1.6,blockLength,m.purple);
   for(let z of [-5,0,5]){box(block,side*5.4,2.05,z,.13,1.5,.13,m.rail);box(block,side*5.4,2.7,z,.16,.13,5,m.rail)}
   const h=6+(i*3+(side+1))%5,facade=group(block,side*(i%4===1?10.5:8.3+i%2),0,-1);
   round(facade,0,h/2,0,4.7,h,10,[m.blue,m.purple,m.teal,m.violet][(i+(side===1?2:0))%4],.12);box(facade,0,h+.13,0,5.05,.26,10.4,m.cream);box(facade,-side*2.4,h*.5,4.9,.045,h,.08,i%2?m.cyan:m.pink);box(facade,-side*2.44,1.9,0,.055,.065,9.8,i%2?m.pink:m.cyan);
   for(let row=0;row<3;row++)for(let col=0;col<4;col++){const z=-3.7+col*2.35,y=2+row*1.7;round(facade,-side*2.39,y,z,.08,1.12,1.4,m.dark,.04);box(facade,-side*2.45,y+.1,z,.03,.85,1.1,(row+col+i)%5===0?m.glass:(row+col+i)%3?m.warm:m.cyan);box(facade,-side*2.47,y,z,.04,1.1,.045,m.dark)}
   const board=sign(facade,['DATA CLUB','VERIFY','MFA ON','NO PHISH'][i%4],-side*2.5,h-.4,-2.1,3.5,1.1,i%2?'#a4fff7':'#ffe5aa',i%2?'#373f83':'#c34283',true);board.rotation.y=-side*Math.PI/2;
   const canopy=box(facade,-side*3,1.55,2,1.5,.13,4.5,i%2?m.coral:m.teal);canopy.rotation.z=side*.15;round(facade,-side*2.5,1.1,-3.4,.4,1.4,.85,m.rail,.05);
   box(block,side*4.8,3.1,4,.12,5.4,.12,m.dark);round(block,side*4.5,5.8,4,1,.22,.48,m.cream,.1);box(block,side*4.5,5.65,4,.75,.03,.33,m.warm);
   if(i%4===1){const parked=train(block,9,side===1?m.coral:m.teal);parked.position.set(side*7.1,0,5)}
   if(i%3===0){const post=group(block,side*4.85,0,-3);round(post,0,1.1,0,.7,2.2,.65,m.dark,.12);sign(post,'MFA',0,1.4,.34,.55,.7,'#83fff0','#253d65')}
  }
  if(i%3===0){for(let side of [-1,1])round(block,side*4.95,3.5,-5,.45,7,.6,m.violet,.12);round(block,0,7,-5,10.4,.6,.9,m.purple,.16);box(block,0,6.66,-4.52,9.5,.09,.04,m.cyan);sign(block,['BYTE CENTRAL','TRUST DISTRICT','NEON JUNCTION','SAFE ROUTE'][i/3],0,6.6,-4.45,3.6,.66,'#f9efc5','#374071')}
  batch(block);
 }

 // Streetwear courier: rounded limbs, headphones and sneakers, facing down the track.
 const courier=group(scene,0,0,4),body=group(courier),hips=group(body,0,1.02,0),legs=[],arms=[];
 round(body,0,1.52,0,.87,.91,.52,m.jacket,.2);round(body,0,1.09,0,.75,.2,.5,m.hood,.07);ball(body,0,1.98,-.04,.47,.26,.36,m.hood);ball(body,0,2.34,-.07,.36,.4,.33,m.skin);ball(body,0,2.52,-.03,.4,.27,.36,m.hair);
 for(let i=0;i<4;i++){const tuft=round(body,-.24+i*.15,2.63,-.06,.19,.28,.39,m.hair,.075);tuft.rotation.x=-.25;tuft.rotation.z=-.15}
 const band=round(body,0,2.51,.15,.78,.1,.17,m.dark,.045);band.rotation.x=.15;
 for(let side of [-1,1]){const ear=cylinder(body,side*.4,2.33,-.015,.16,.12,m.hood);ear.rotation.z=Math.PI/2;const glow=cylinder(body,side*.47,2.33,-.015,.085,.025,m.cyan);glow.rotation.z=Math.PI/2}
 round(body,0,1.51,.39,.65,.72,.27,m.dark,.12);round(body,0,1.5,.55,.48,.5,.075,m.hood,.07);sign(body,'01',0,1.5,.6,.3,.25,'#ecfffa','#1c5268');
 for(let side of [-1,1]){
  round(body,side*.3,1.55,.27,.1,.68,.09,m.cream,.04);
  const leg=group(hips,side*.22,0,0);legs.push(leg);round(leg,0,-.25,0,.31,.6,.34,m.denim,.11);const shin=group(leg,0,-.48,0);leg.userData.shin=shin;round(shin,0,-.2,0,.28,.44,.32,m.denim,.09);
  round(shin,0,-.45,-.15,.41,.25,.69,m.shoe,.11);round(shin,0,-.55,-.14,.44,.12,.72,m.sole,.055);round(shin,0,-.4,-.39,.32,.12,.22,m.sole,.05);for(let j=0;j<3;j++)box(shin,0,-.35,-.12-j*.08,.29,.025,.028,m.cream);
  const arm=group(body,side*.52,1.8,0);arms.push(arm);round(arm,0,-.2,0,.29,.51,.31,m.jacket,.12);const forearm=group(arm,0,-.38,0);arm.userData.forearm=forearm;round(forearm,0,-.16,0,.23,.37,.26,m.hood,.09);ball(forearm,0,-.36,0,.13,.16,.14,m.skin);forearm.rotation.x=-.55;
 }
 const scarf=round(body,-.35,1.93,.35,.19,.43,.06,m.gold,.025);scarf.rotation.x=.7;const playerShadow=shadow(scene,0,4,1.8,1.6);const ringGeo=new THREE.TorusGeometry(.8,.035,8,32);geometries.push(ringGeo);const aura=mesh(courier,ringGeo,m.mint,0,1.3,0,1,1.5,1);
 const coinGeo=new THREE.CylinderGeometry(.27,.27,.095,20);geometries.push(coinGeo);
 function entity(o){
  const root=group(scene);root.userData.entity=o;
  if(o.kind==='wall'){train(root,o.length||10,(o.length||10)%2?m.teal:m.coral,true)}
  else if(o.kind==='byte'){
   const coin=group(root,0,o.high?2.7:1.08,0);const disk=mesh(coin,coinGeo,m.gold,0,0,0);disk.rotation.x=Math.PI/2;const rim=mesh(coin,coinGeo,m.warm,0,0,.048,.79,.25,.79);rim.rotation.x=Math.PI/2;round(coin,0,0,.072,.085,.3,.03,m.gold,.02);root.userData.spin=coin;
  }else if(o.kind==='check'){
   const pickup=group(root,0,1.6,0);root.userData.hover=pickup;round(pickup,0,0,0,.83,.98,.22,m.gold,.17);round(pickup,0,0,.13,.61,.73,.035,m.dark,.1);const a=round(pickup,-.12,-.09,.18,.11,.31,.04,m.mint,.025);a.rotation.z=.7;const b=round(pickup,.08,0,.18,.11,.5,.04,m.mint,.025);b.rotation.z=-.6;root.userData.cue=sign(root,o.label,0,2.52,.05,2.25,.42,'#ffe5a6','#3b3457');
  }else if(o.kind==='barrier'){
   for(let side of [-1,1])round(root,side*.87,.56,0,.18,1.1,.33,m.cream,.045);round(root,0,.67,0,2.04,.63,.39,m.coral,.08);for(let k=-3;k<=3;k++){const stripe=box(root,k*.27,.67,.21,.13,.59,.025,m.cream);stripe.rotation.z=-.4}root.userData.cue=sign(root,'↑ JUMP',0,1.43,0,1.4,.36,'#fff0b0','#7b405e');shadow(root,0,0,2.6,1.2);
  }else if(o.kind==='overhead'){
   for(let side of [-1,1])round(root,side*1.04,1.62,0,.2,3.24,.35,m.cream,.07);round(root,0,2.58,0,2.23,1.4,.55,m.violet,.12);box(root,0,1.9,.3,2.18,.12,.04,m.pink);root.userData.cue=sign(root,'↓ SLIDE',0,2.65,.32,1.9,.5,'#f8e8ff','#493064');shadow(root,0,0,2.5,1.2);
  }else if(o.kind==='bot'){
   const bot=group(root,0,.72,0);root.userData.hover=bot;round(bot,0,0,0,1.1,.75,.7,m.violet,.2);round(bot,0,.02,.36,.85,.44,.08,m.dark,.12);for(let side of [-1,1]){const brow=box(bot,side*.23,.07,.43,.25,.07,.04,m.pink);brow.rotation.z=side*.34;round(bot,side*.66,0,0,.3,.25,.43,m.dark,.1);ball(bot,side*.64,-.08,0,.17,.09,.2,m.cyan)}root.userData.cue=sign(root,o.label,0,1.6,0,1.5,.32,'#ffc8de','#493064');shadow(root,0,0,1.8,1.2);
  }else if(o.kind==='gate'){
   for(let side of [-1,1]){round(root,side*4.1,3,0,.5,6,.6,m.cream,.12);box(root,side*3.82,3,.33,.07,5.7,.04,m.mint)}round(root,0,6,0,8.8,.5,.6,m.teal,.1);sign(root,'ROUTE VERIFIED',0,5,0,5,.8,'#b4ffdb','#1d4f68');
  }else{
   const bait=round(root,0,1.12,0,.85,.85,.25,m.pink,.12);bait.rotation.z=Math.PI/4;root.userData.hover=bait;root.userData.cue=sign(root,'BAIT · DODGE',0,2,0,1.8,.37,'#ffe2ec','#7b405e');shadow(root,0,0,1.4,1);
  }
  if(root.userData.hover)root.userData.hover.userData.baseY=root.userData.hover.position.y;
  return root;
 }
 const sparks=[];for(let i=0;i<12;i++)sparks.push(ball(scene,0,-10,0,.045,.045,.045,i%2?m.gold:m.cyan));
 let disposed=false,lastSize='',previousScore=0,burstUntil=0;
 function resize(width,height){if(disposed)return;const k=width+':'+height;if(k===lastSize)return;lastSize=k;renderer.setSize(width,height,false);camera.aspect=width/height;camera.fov=width<height?68:52;camera.updateProjectionMatrix()}
 function releaseInstances(root){root.traverse(o=>{if(o.isInstancedMesh)o.dispose()})}
 function render(run){
  if(disposed)return;const t=run.elapsed,portrait=camera.aspect<1;chunks.forEach(block=>block.position.z=((block.userData.offset+t*14)%totalLength)-144);
  const live=new Set(run.entities.filter(o=>!o.collected&&o.y>-.5&&(o.kind==='wall'?o.y<.83+(o.length||10)/52+.23:o.y<1.16)));
  for(const [o,v] of entityMeshes)if(!live.has(o)){scene.remove(v);releaseInstances(v);entityMeshes.delete(o)}
  for(const o of live){let v=entityMeshes.get(o);if(!v){v=entity(o);entityMeshes.set(o,v)}v.position.set(o.kind==='gate'?0:(o.lane-1)*2.6,0,4+52*(o.y-.83));if(v.userData.spin)v.userData.spin.rotation.y=t*3.5;if(v.userData.hover)v.userData.hover.position.y=v.userData.hover.userData.baseY+Math.sin(t*4+(o.index||0))*.09;if(v.userData.cue)v.userData.cue.visible=o.y>.3&&o.y<.93}
  courier.position.set((run.visualLane-1)*2.6,run.jumpHeight*2.65,4);playerShadow.position.x=courier.position.x;playerShadow.scale.set(1.8-run.jumpHeight*.4,1.6-run.jumpHeight*.4,1);
  const slide=run.slideTime>0,air=run.jumpTime>0,phase=t*13;body.position.y=slide?-.65:Math.abs(Math.sin(phase))*.06;body.rotation.x=slide?-.65:air?.16:.1;body.rotation.z=(run.lane-run.visualLane)*-.24;body.rotation.y=Math.sin(phase)*.045;
  legs.forEach((leg,i)=>{const side=i===0?1:-1;leg.rotation.x=slide?-1.3:air?-.7:Math.sin(phase)*.85*side;leg.userData.shin.rotation.x=slide?1.85:air?1.25:Math.max(0,-Math.sin(phase)*side)*1.15});
  arms.forEach((arm,i)=>{arm.rotation.x=slide?.9:air?-1.6:Math.sin(phase)*(i===0?-.85:.85);arm.rotation.z=air?(i===0?-.22:.22):0;arm.userData.forearm.rotation.x=slide?-1.15:-.55});scarf.rotation.x=.8+Math.sin(t*16)*.15;
  aura.visible=!!run.guard||run.pulse>0;courier.visible=run.invulnerable<=0||Math.sin(t*26)>-.35;
  if(run.score>previousScore)burstUntil=t+.45;previousScore=run.score;sparks.forEach((v,i)=>{v.visible=t<burstUntil;const age=.45-(burstUntil-t),a=i*Math.PI/6;v.position.set(courier.position.x+Math.cos(a)*(age*2+.4),1.1+Math.sin(a)*age*2,4+Math.cos(a*2)*age*1.8)});
  camera.position.set((run.visualLane-1)*.16,portrait?5.15:4.85,portrait?13.1:12.1);camera.lookAt((run.visualLane-1)*.07,1.15,-12);renderer.render(scene,camera);
 }
 function dispose(){if(disposed)return;disposed=true;releaseInstances(scene);entityMeshes.clear();geometries.forEach(v=>v.dispose());materials.forEach(v=>v.dispose());textures.forEach(v=>v.dispose());renderer.dispose();renderer.forceContextLoss()}
 return {canvas,render,resize,dispose};
}

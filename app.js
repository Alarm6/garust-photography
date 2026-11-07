const person=document.querySelector('#person'),video=document.querySelector('#modelVideo'),playButton=document.querySelector('#playVideo'),menu=document.querySelector('#menu'),logo=document.querySelector('#logo');
const clamp=x=>Math.max(0,Math.min(1,x)),mix=(a,b,t)=>a+(b-a)*t,smooth=x=>{x=clamp(x);return x*x*(3-2*x)};let pending=false,visible=true;video.muted=true;video.defaultMuted=true;
function play(){if(visible)video.play().catch(()=>{playButton.hidden=false})}video.addEventListener('canplay',play);video.addEventListener('playing',()=>playButton.hidden=true);playButton.onclick=play;addEventListener('pointerdown',()=>{if(video.paused)play()},{once:true});addEventListener('keydown',()=>{if(video.paused)play()},{once:true});
function draw(){pending=false;const p=clamp(scrollY/(document.documentElement.scrollHeight-innerHeight))*13,W=innerWidth,H=document.querySelector("#stage").clientHeight;const studioEnd=7.8,catalogStart=4.8,catalogReady=8.9;const nextVisible=p<studioEnd;if(nextVisible!==visible){visible=nextVisible;if(visible)play();else video.pause()}
const retreat=smooth(p/studioEnd),size=Math.min(H*.84,W*1.04),scale=mix(1.05,.12,retreat);
person.style.width=size+'px';person.style.height=size+'px';
person.style.transform=`translate(${(W-size*scale)/2}px,${(H-size*scale)/2}px) scale(${scale})`;
const studioOpacity=1-smooth((p-5.5)/(studioEnd-5.5));
person.style.display=nextVisible?'block':'none';person.style.opacity=String(studioOpacity);
const studio=document.querySelector('#studioProps');
// Project each stand independently as the camera pulls back past its depth plane.
const cameraDistance=1/scale;
for(const [side,depth,direction] of [['right',.90,1],['left',1.43,-1]]){
  const distance=cameraDistance-depth;
  const perspective=1/Math.max(.13,distance);
  const compact=W<=650;
  const stand=studio.querySelector('.studio-'+side);
  const offset=compact?W*.38:Math.min(W*.32,size*.85);
  stand.style.left=W/2+direction*offset*perspective+'px';
  stand.style.top=H/2+size*.46*perspective+'px';
  stand.style.height=(compact?Math.min(H*.58,size*.86*perspective):size*1.26*perspective)+'px';
  stand.style.visibility=distance>.13?'visible':'hidden';
}
studio.style.opacity=String(studioOpacity);

const reveal=smooth((p-catalogStart)/1.2);
const settle=smooth((p-catalogStart)/(catalogReady-catalogStart));
menu.style.visibility=reveal>0?'visible':'hidden';
menu.style.opacity=String(reveal);menu.style.pointerEvents=p>=catalogReady-.01?'auto':'none';
menu.style.setProperty("--catalog-controls",smooth((p-studioEnd)/(catalogReady-studioEnd)));
window.catalog.render(mix(.37,1,clamp((p-catalogReady)/4.1)),settle);document.querySelector("#homeAlbums").hidden=p>=catalogReady-.01;}
function update(){if(!pending){pending=true;requestAnimationFrame(draw)}}addEventListener('scroll',update,{passive:true});addEventListener('resize',update);function direct(){if(location.hash==='#albums')requestAnimationFrame(()=>scrollTo({top:Math.ceil(8.9/13*(document.documentElement.scrollHeight-innerHeight)),behavior:'instant'}))}history.scrollRestoration='manual';
if(performance.getEntriesByType('navigation')[0]?.type==='reload'){
  history.replaceState(null,'',location.pathname+location.search);
  scrollTo({top:0,behavior:'instant'});
}
logo.addEventListener('click',event=>{
  event.preventDefault();
  history.replaceState(null,'',location.pathname+location.search);
  scrollTo({top:0,behavior:'instant'});
});
document.querySelector('#homeAlbums').addEventListener('click',event=>{
  event.preventDefault();
  history.replaceState(null,'','#albums');
  direct();
});
addEventListener('hashchange',direct);direct();draw();play();
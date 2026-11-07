(()=>{
const albums=window.GARUST_ALBUMS;
const asset=src=>/^https?:/.test(src)?src:'assets/'+src;const categories=[...new Set(albums.map(album=>album.type))];
let categoryFilter=categories[0];
const indices=()=>albums.map((a,i)=>i).filter(i=>albums[i].type===categoryFilter);
const mobileCatalog=matchMedia('(max-width:650px)');
const root=document.querySelector('#albumScene'),caption=document.querySelector('#openAlbum'),category=document.querySelector('#albumCategory'),viewer=document.querySelector('#albumViewer');let progress=0,selected=0,photo=0,rotation=0,drag=null,opening=false,mode='albums',entering=false;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),lerp=(a,b,t)=>a+(b-a)*t,ease=x=>{x=clamp(x);return x*x*(3-2*x)},cards=[];
let liftedSheet=null;
let entries=[],lastFrame="",thumbAlbum=-1;
const filter=document.querySelector('#albumFilter');
function label(i){const album=albums[i];caption.textContent=mode==='photos'?`${photo+1} / ${album.photos.length}`:album.title;category.textContent=mode==='photos'?album.title:album.type+' · '+(indices().indexOf(i)+1)+' / '+indices().length}
function build(){liftedSheet=null;lastFrame="";root.replaceChildren();cards.length=0;entries=mode==='albums'?indices().map(i=>({album:i,image:albums[i].cover||albums[i].photos[0]})):albums[selected].photos.map((image,i)=>({album:selected,image,photo:i}));
 entries.forEach((entry,i)=>{const button=document.createElement('button');button.className=mode==='photos'?'album-card photo-sheet':'album-card';button.setAttribute('aria-label',mode==='albums'?'Открыть альбом «'+albums[entry.album].title+'»':'Открыть фотографию '+(i+1)+' из альбома «'+albums[selected].title+'»');button.innerHTML='<span class="card-surface"><img data-src="'+asset(entry.image)+'" loading="lazy" alt="" draggable="false"><span class="card-edge"></span></span>';button.addEventListener('click',()=>{if(drag?.moved||opening||entering)return;if(mode==='albums')enterAlbum(entry.album,button);else{photo=entry.photo;label(selected);open(button,entry.image)}});button.addEventListener('pointerenter',()=>{if(!drag&&!opening&&!entering&&mode==='albums')label(entry.album)});button.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'&&mode==='photos'&&!entering&&!drag)liftSheet(button)});
 button.addEventListener('pointerleave',()=>{label(selected);if(liftedSheet===button)liftSheet(null)});
 button.addEventListener('focus',()=>{if(mode==='photos'&&!entering&&button.matches(':focus-visible'))liftSheet(button)});
 button.addEventListener('blur',()=>{if(liftedSheet===button)liftSheet(null)});root.append(button);cards.push(button)})
 root.setAttribute('aria-label',mode==='albums'?'Альбомы':'Фотографии альбома «'+albums[selected].title+'»');
}
function liftSheet(sheet){
 liftedSheet=sheet;
 const order=sheet?Number(sheet.dataset.order):-1;
 for(const card of cards){
   card.classList.toggle('sheet-lifted',card===sheet);
   card.classList.toggle('sheet-pushed',Number(card.dataset.order)<order);
 }
}
function arcLayout(width,height){
 const compact=width<=650;
 const unit=Math.min(width/(compact?510:864),height/(compact?640:486));
 return {compact,unit,radius:(compact?365:495)*unit,centerY:(compact?306:531)*unit};
}
function render(p,arrival=1){
 progress=p;
 const W=innerWidth,H=innerHeight,layout=arcLayout(W,H),{unit,compact}=layout;
 const deck=mode==='photos'?1:0,spread=ease(p);
 const radius=lerp(Math.hypot(W,H)/2+40*unit,layout.radius,arrival),centerY=layout.centerY*arrival;
 const frame=[p,arrival,W,H,mode,selected,photo,rotation,viewer.open].join("|");
 if(frame===lastFrame)return;
 lastFrame=frame;
 const anchor=mode==='albums'?entries.findIndex(entry=>entry.album===selected):0;
 const cardW=lerp(58,112,arrival)*unit,cardH=lerp(78,151,arrival)*unit;
 cards.forEach((button,i)=>{const raw=(i-anchor+cards.length)%cards.length,ringIndex=raw>cards.length/2?raw-cards.length:raw,theta=ringIndex*Math.PI/6+rotation,x=Math.sin(theta)*radius,y=centerY-Math.cos(theta)*radius,angle=theta*180/Math.PI,order=mode==='photos'?(i-photo+cards.length)%cards.length:0,spacing=(compact?60:lerp(56,90,spread))*unit,stackX=(compact?-34:-90)*unit+order*spacing;
 if(deck)button.dataset.order=order;
 button.style.width=lerp(cardW,(compact?270:200)*unit,deck)+'px';button.style.height=lerp(cardH,(compact?350:270)*unit,deck)+'px';button.style.transform=`translate3d(${lerp(x,stackX,deck)}px,${lerp(y,-5*unit,deck)}px,${0}px) translate(-50%,-50%) rotateZ(${lerp(angle,0,deck)}deg) rotateY(${-34*deck}deg)`;
 const visible=deck?(compact?order<5:stackX<W/2+120*unit):
   (compact&&arrival===1?Math.abs(ringIndex)<=3:ringIndex>=-5&&ringIndex<=6);
 const image=button.firstElementChild.firstElementChild;
 if(visible&&image.dataset.src){
   image.src=image.dataset.src;
   delete image.dataset.src;
 }button.style.visibility=visible?'visible':'hidden';button.setAttribute('aria-hidden',String(!visible));if(!root.hasAttribute('aria-busy'))button.style.opacity='1';button.tabIndex=visible?0:-1;button.style.zIndex=deck?String(50-order):String(20+Math.round(Math.cos(theta)*10));button.style.borderRadius=(deck?1:3)+'px';button.style.setProperty('--edge',String(deck));button.classList.toggle('front',order===0&&deck===1);
 });
 document.querySelector('.catalog-track i').style.height=(10+progress*90)+'%';
 const stage=viewer.open?'photos':deck?'folder':'albums';
 document.querySelectorAll('[data-view]').forEach(button=>{
   const view=button.dataset.view;
   button.disabled=view==='photos'&&stage==='albums';
   if(view===stage)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
 });
 document.querySelector('#stepBack').hidden=!deck;
 filter.hidden=Boolean(deck);
 root.classList.toggle('is-stack',deck===1);
 root.style.setProperty('--sheet-gap',Math.max(0,((compact?270:200)-(compact?60:lerp(56,90,spread)))*unit)+'px');
 if(liftedSheet)liftSheet(liftedSheet);
 document.querySelector('#catalogBack').setAttribute('aria-label',mode==='albums'?'Предыдущий альбом':'Предыдущая фотография');document.querySelector('#catalogNext').setAttribute('aria-label',mode==='albums'?'Следующий альбом':'Следующая фотография');
}
function select(delta){if(entering||opening)return;if(mode==='albums'){const list=indices();selected=list[(list.indexOf(selected)+delta+list.length)%list.length]}else photo=(photo+delta+albums[selected].photos.length)%albums[selected].photos.length;label(selected);render(progress)}
const reducedMotion=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
const motion={duration:460,easing:'cubic-bezier(.25,.75,.25,1)'};
const viewerStage=viewer.querySelector('.viewer-stage');

async function changeCatalog(direction,change,reveal){
 entering=true;
 try{
   if(!reducedMotion())await root.animate([
     {opacity:1,transform:'translateX(0)'},
     {opacity:0,transform:`translateX(${-direction*innerWidth*.22}px)`}
   ],{...motion,duration:260}).finished;
   change();
   build();label(selected);render(progress);
   if(reveal&&!reducedMotion())await reveal();
   else if(!reducedMotion())await root.animate([
     {opacity:0,transform:`translateX(${direction*innerWidth*.27}px)`},
     {opacity:1,transform:'translateX(0)'}
   ],motion).finished;
 }finally{entering=false}
}
function backToAlbums(){
 if(entering||opening)return;
 if(mode==='albums')return;
 return changeCatalog(-1,()=>{mode='albums';rotation=0;photo=0});
}
async function closePhoto(){
 if(viewerEntrance)await viewerEntrance;
 if(opening||!viewer.open)return;
 opening=true;
 try{
   if(!reducedMotion())await Promise.all([
     viewer.animate([{opacity:1},{opacity:0}],motion).finished,
     viewerStage.animate([{transform:'none'},{transform:'translateX(27vw) scale(.94)'}],motion).finished
   ]);
   viewer.close();
   render(progress);
 }finally{opening=false}
 if(mobileCatalog.matches)await backToAlbums();
}
async function revealAlbumSheets(){
 const sheets=cards.filter(card=>card.style.visibility==='visible');
 const width=innerWidth;
 let shift=Math.min(width*.44,520);
 root.style.translate=shift+'px';
 root.setAttribute('aria-busy','true');
 const loading=sheets.map(sheet=>{
   sheet.classList.add('sheet-pending');
   const image=sheet.querySelector('img');
   image.loading='eager';
   if(image.complete)return Promise.resolve(image.naturalWidth>0);
   return new Promise(resolve=>{
     const timeout=setTimeout(()=>finish(false),9000);
     function finish(loaded){
       clearTimeout(timeout);
       image.removeEventListener('load',onLoad);
       image.removeEventListener('error',onError);
       resolve(loaded);
     }
     const onLoad=()=>finish(true),onError=()=>finish(false);
     image.addEventListener('load',onLoad);
     image.addEventListener('error',onError);
   });
 });
 try{
   for(const [index,sheet] of sheets.entries()){
     if(!await loading[index])continue;
     sheet.classList.remove('sheet-pending');
     const nextShift=shift*(sheets.length-index-1)/(sheets.length-index);
     sheet.style.opacity='1';
     const step={duration:index===0?310:175,easing:'cubic-bezier(.2,.7,.25,1)'};
     await Promise.all([
       root.animate([{translate:shift+'px'},{translate:nextShift+'px'}],{...step,fill:'forwards'}).finished.then(animation=>{
         root.style.translate=nextShift+'px';
         animation.cancel();
       }),
       sheet.animate([{translate:Math.min(width*.25,260)+'px',opacity:0},{translate:'0px',opacity:1}],step).finished
     ]);
     shift=nextShift;
   }
 }finally{
   root.style.translate='';
   root.removeAttribute('aria-busy');
   for(const sheet of sheets){
     sheet.style.opacity='1';
     const image=sheet.querySelector('img');
     if(image.naturalWidth)sheet.classList.remove('sheet-pending');
     else image.addEventListener('load',()=>sheet.classList.remove('sheet-pending'),{once:true});
   }
 }
}
async function enterAlbum(index){
 if(entering||opening)return;
 if(!albums[index].photos.length){window.open(albums[index].source,'_blank','noopener');return}
 await changeCatalog(1,()=>{selected=index;photo=0;mode='photos'},revealAlbumSheets);
 if(mobileCatalog.matches)await open();
}
function showPhoto(n){const album=albums[selected];photo=(n+album.photos.length)%album.photos.length;document.querySelector('#viewerTitle').textContent=album.title;document.querySelector('#photoCount').textContent=String(photo+1).padStart(2,'0')+' / '+String(album.photos.length).padStart(2,'0');const image=document.querySelector('#viewerImage');image.src=asset(album.photos[photo]);document.querySelectorAll('.neighbor').forEach(button=>{
 const offset=Number(button.dataset.offset);
 const index=(photo+offset+album.photos.length)%album.photos.length;
 button.hidden=album.photos.length<=Math.abs(offset)*2-1;
 button.setAttribute('aria-label','Фотография '+(index+1));
 button.firstElementChild.src=asset(album.photos[index]);
});if(viewer.open&&!reducedMotion())image.animate([{opacity:.55},{opacity:1}],{duration:180,easing:'ease-out'});image.alt=album.title+' — фотография '+(photo+1);const thumbs=document.querySelector('#viewerThumbs');if(thumbAlbum!==selected){thumbAlbum=selected;thumbs.replaceChildren();album.photos.forEach((src,i)=>{const b=document.createElement('button');b.className=i===photo?'selected':'';b.setAttribute('aria-label','Фотография '+(i+1));b.innerHTML='<img src="'+asset(src)+'" loading="lazy" alt="">';b.onclick=()=>showPhoto(i);thumbs.append(b)});}thumbs.querySelector('.selected')?.classList.remove('selected');const active=thumbs.children[photo];active.classList.add('selected');thumbs.scrollLeft=active.offsetLeft-(thumbs.clientWidth-active.offsetWidth)/2}
let viewerEntrance=null;
async function open(){
 if(opening||entering||viewer.open||mode!=='photos')return;
 showPhoto(photo);
 document.body.style.overflow='hidden';
 viewer.showModal();render(progress);
 if(!reducedMotion()){
   opening=true;
   try{
     viewerEntrance=Promise.all([
       viewer.animate([{opacity:0},{opacity:1}],motion).finished,
       viewerStage.animate([{transform:'translateX(27vw) scale(.94)'},{transform:'none'}],motion).finished
     ]);
     await viewerEntrance;
   }finally{viewerEntrance=null;opening=false}
 }

}
let wheelTotal=0,lastWheelStep=-Infinity,lastWheelEvent=-Infinity;
viewerStage.addEventListener('wheel',event=>{
 if(event.ctrlKey||!event.target.closest('#viewerImage,.neighbor'))return;
 event.preventDefault();
 if(opening||albums[selected].photos.length<2)return;
 const now=performance.now();
 if(now-lastWheelEvent>160)wheelTotal=0;
 lastWheelEvent=now;
 if(now-lastWheelStep<230)return;
 const delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
 wheelTotal+=delta*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
 if(Math.abs(wheelTotal)<36)return;

 showPhoto(photo+Math.sign(wheelTotal));
 wheelTotal=0;lastWheelStep=now;
},{passive:false});

document.querySelectorAll('.neighbor').forEach(button=>{
 button.onclick=()=>showPhoto(photo+Number(button.dataset.offset));
});
document.querySelector('#viewerLogo').onclick=async event=>{
 event.preventDefault();await closePhoto();if(!viewer.open)document.querySelector('#logo').click();
};
viewer.addEventListener('cancel',event=>{event.preventDefault();closePhoto()});
viewer.addEventListener('close',()=>{document.body.style.overflow='';viewer.classList.remove('is-opening');opening=false;label(selected);render(progress)});
caption.onclick=()=>mode==='photos'?open():enterAlbum(selected,cards.find((c,i)=>entries[i].album===selected));document.querySelector('#catalogBack').onclick=()=>select(-1);document.querySelector('#catalogNext').onclick=()=>select(1);document.querySelector('#closeAlbum').onclick=closePhoto;
document.querySelector('#stepBack').onclick=backToAlbums;
document.querySelectorAll('[data-view]').forEach(button=>button.onclick=async()=>{
 if(opening||entering)return;
 const view=button.dataset.view;
 if(view==='albums'){
   if(viewer.open)await closePhoto();
   backToAlbums();
 }else if(view==='folder'){
   if(viewer.open)await closePhoto();
   else if(mode==='albums')caption.click();
 }else if(!viewer.open){
   open();
 }
});
addEventListener('keydown',e=>{if(opening||entering||document.activeElement?.matches('input,select'))return;if(e.key==='Escape'&&!viewer.open&&mode==='photos')backToAlbums();if(e.key==='ArrowRight'){if(viewer.open)showPhoto(photo+1);else if(document.querySelector('#menu').style.pointerEvents==='auto')select(1)}if(e.key==='ArrowLeft'){if(viewer.open)showPhoto(photo-1);else if(document.querySelector('#menu').style.pointerEvents==='auto')select(-1)}});
function turn(delta){if(mode!=='albums'||opening||entering)return;const list=indices(),step=Math.PI/6;rotation+=delta;while(rotation < -step/2){rotation+=step;selected=list[(list.indexOf(selected)+1)%list.length]}while(rotation > step/2){rotation-=step;selected=list[(list.indexOf(selected)-1+list.length)%list.length]}label(selected);render(progress)}
document.querySelector('#menu').addEventListener('wheel',event=>{
 if(mode!=='albums'||viewer.open||entering||opening||document.querySelector('#menu').style.pointerEvents!=='auto')return;
 if(!event.target.closest('#albumScene'))return;
 const {width,height,left,top}=root.getBoundingClientRect();
 const {unit,radius,centerY}=arcLayout(width,height);
 const x=event.clientX-left-width/2,y=event.clientY-top-height/2-centerY;
 const overArc=y<=0&&Math.abs(Math.hypot(x,y)-radius)<=105*unit;
 if(!overArc&&!event.target.closest('.album-card'))return;
 event.preventDefault();
 turn(-(event.deltaY+event.deltaX)*.0016);
},{passive:false});
root.addEventListener('pointerdown',event=>{
 if(entering||opening||!event.isPrimary)return;
 drag={x:event.clientX,y:event.clientY,moved:false};
});
addEventListener('pointermove',event=>{
 if(!drag||!event.isPrimary)return;
 const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
 if(!drag.moved&&(Math.abs(dx)<9||Math.abs(dx)<Math.abs(dy)))return;
 drag.moved=true;
 if(mode==='albums'){
   root.classList.add('dragging');turn(dx/300);drag.x=event.clientX;
 }
});
function finishDrag(event){
 if(drag?.moved&&mode==='photos'&&event.type==='pointerup'){
   const dx=event.clientX-drag.x;
   if(Math.abs(dx)>38)select(dx<0?1:-1);
 }
 root.classList.remove('dragging');setTimeout(()=>drag=null,0);
}
addEventListener('pointerup',finishDrag);
addEventListener('pointercancel',finishDrag);
let touchX,touchY;
viewerStage.addEventListener('touchstart',event=>{
 touchX=event.touches[0].clientX;touchY=event.touches[0].clientY;
},{passive:true});
viewerStage.addEventListener('touchend',event=>{
 const touch=event.changedTouches[0],dx=touch.clientX-touchX;
 if(!opening&&Math.abs(dx)>38&&Math.abs(dx)>Math.abs(touch.clientY-touchY))showPhoto(photo+(dx<0?1:-1));
},{passive:true});
categories.forEach((type,index)=>{
 const button=document.createElement('button');
 button.type='button';
 button.textContent=type;
 button.setAttribute('aria-pressed',String(index===0));
 button.onclick=async()=>{
   if(entering||opening||mode!=='albums'||type===categoryFilter)return;
   const direction=Math.sign(index-categories.indexOf(categoryFilter));
   entering=true;
   const slide=from=>root.animate(from,{duration:280,easing:'ease-in-out'}).finished;
   try{
     if(!reducedMotion())await slide([
       {transform:'translateX(0)',opacity:1},
       {transform:`translateX(${-direction*innerWidth*.33}px)`,opacity:0}
     ]);
     categoryFilter=type;
     selected=indices()[0];rotation=0;
     filter.querySelector('[aria-pressed="true"]').setAttribute('aria-pressed','false');
     button.setAttribute('aria-pressed','true');
     build();label(selected);render(progress);
     if(!reducedMotion())await slide([
       {transform:`translateX(${direction*innerWidth*.33}px)`,opacity:0},
       {transform:'translateX(0)',opacity:1}
     ]);
   }finally{entering=false}
 };
 filter.append(button);
});
window.catalog={render};build();label(0);render(0);
})();

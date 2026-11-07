const scrollSound=(()=>{
  let context,buffer,lastTick=-Infinity,lastScroll=scrollY,travel=0;

  function unlock(){
    if(!context){
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!Audio)return;
      context=new Audio();
      buffer=context.createBuffer(1,Math.ceil(context.sampleRate*.028),context.sampleRate);
      const samples=buffer.getChannelData(0);
      for(let i=0;i<samples.length;i++){
        const time=i/context.sampleRate;
        samples[i]=(Math.sin(2*Math.PI*1350*time)*.72+(Math.random()*2-1)*.28)
          *Math.min(1,time/.0015)*Math.exp(-time/.006);
      }
    }
    if(context.state==='suspended')context.resume().catch(()=>{});
  }

  function tick(){
    if(context?.state!=='running'||document.hidden)return;
    const now=context.currentTime;
    if(now-lastTick<.12)return;
    lastTick=now;
    const source=context.createBufferSource();
    const level=context.createGain();
    level.gain.value=.045;
    source.buffer=buffer;
    source.connect(level).connect(context.destination);
    source.onended=()=>{source.disconnect();level.disconnect()};
    source.start();
  }

  addEventListener('pointerdown',unlock,{passive:true});
  addEventListener('pointerup',unlock,{passive:true});
  addEventListener('keydown',unlock);
  addEventListener('wheel',()=>{
    if(!context&&navigator.userActivation?.hasBeenActive)unlock();
  },{passive:true});
  addEventListener('scroll',()=>{
    travel+=Math.abs(scrollY-lastScroll);
    lastScroll=scrollY;
    if(travel<70)return;
    travel=0;
    tick();
  },{passive:true});

  return tick;
})();

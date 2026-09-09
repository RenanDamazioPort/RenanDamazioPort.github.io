(()=>{
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx)return;

  const isChrome=/Chrome|CriOS/.test(navigator.userAgent)&&!/Edg|OPR/.test(navigator.userAgent);
  const isMobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  let ctx=null,master=null,compressor=null,timer=null,nextNoteTime=0,step=0,playing=false,unlocked=false,muted=false;

  const lead=[69,72,74,76,74,72,69,67,69,72,76,79,76,74,72,67];
  const bass=[45,null,45,null,48,null,43,null,45,null,41,null,43,null,40,null];
  const arp=[81,84,88,91,88,84,79,84];
  const midi=n=>440*Math.pow(2,(n-69)/12);
  const level=()=>Math.max(1,Number(document.getElementById('gameLevel')?.textContent)||1);

  function ensureAudio(){
    if(ctx)return;
    try{ctx=new AudioCtx({latencyHint:'interactive'})}catch(_){ctx=new AudioCtx()}
    master=ctx.createGain();
    compressor=ctx.createDynamicsCompressor();
    compressor.threshold.value=-18;
    compressor.knee.value=12;
    compressor.ratio.value=4;
    compressor.attack.value=.006;
    compressor.release.value=.18;
    master.gain.value=.0001;
    master.connect(compressor);
    compressor.connect(ctx.destination);
  }

  function primeAudio(){
    ensureAudio();
    try{ctx.resume()}catch(_){ }
    if(unlocked)return;
    try{
      const osc=ctx.createOscillator();
      const gain=ctx.createGain();
      gain.gain.setValueAtTime(.0001,ctx.currentTime);
      osc.connect(gain);gain.connect(master);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime+.02);
      unlocked=true;
    }catch(_){ }
  }

  function tone(note,time,duration,type,volume,detune=0){
    if(note==null||!ctx||!master)return;
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.type=type;
    osc.frequency.setValueAtTime(midi(note),time);
    osc.detune.setValueAtTime(detune,time);
    gain.gain.setValueAtTime(.0001,time);
    gain.gain.exponentialRampToValueAtTime(volume,time+.008);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0001,volume*.38),time+duration*.5);
    gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
    osc.connect(gain);gain.connect(master);
    osc.start(time);osc.stop(time+duration+.03);
  }

  function noise(time,duration,volume){
    if(!ctx||!master)return;
    const length=Math.max(1,Math.floor(ctx.sampleRate*duration));
    const buffer=ctx.createBuffer(1,length,ctx.sampleRate);
    const data=buffer.getChannelData(0);
    for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(1-i/length);
    const src=ctx.createBufferSource();
    const gain=ctx.createGain();
    const filter=ctx.createBiquadFilter();
    filter.type='highpass';filter.frequency.value=3800;
    gain.gain.setValueAtTime(volume,time);
    gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
    src.buffer=buffer;src.connect(filter);filter.connect(gain);gain.connect(master);
    src.start(time);src.stop(time+duration+.02);
  }

  function kick(time,volume=.08){
    if(!ctx||!master)return;
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.type='sine';
    osc.frequency.setValueAtTime(115,time);
    osc.frequency.exponentialRampToValueAtTime(48,time+.08);
    gain.gain.setValueAtTime(volume,time);
    gain.gain.exponentialRampToValueAtTime(.0001,time+.11);
    osc.connect(gain);gain.connect(master);
    osc.start(time);osc.stop(time+.13);
  }

  function startupBlip(){
    if(!ctx||!master||muted)return;
    const t=ctx.currentTime+.015;
    tone(72,t,.08,'square',.055);
    tone(79,t+.07,.11,'square',.07);
    tone(84,t+.14,.13,'triangle',.075);
  }

  function scheduleStep(time){
    const lv=level();
    const l=lead[step%lead.length]+(lv>=4&&step%8===7?12:0);
    const b=bass[step%bass.length];
    const a=arp[step%arp.length]+(lv>=6?12:0);
    tone(l,time,.13,'square',isChrome?.105:.09,step%2?4:-4);
    tone(l-12,time,.18,'triangle',.055);
    if(b!=null)tone(b,time,.27,'triangle',.11);
    if(step%2===1)tone(a,time,.065,'square',.025);
    if(step%4===0)kick(time,.065);
    if(step%4===2)noise(time,.045,.025);
    step++;
  }

  function scheduler(){
    if(!ctx||!playing)return;
    const bpm=Math.min(142,108+(level()-1)*4);
    const secondsPerStep=(60/bpm)/2;
    while(nextNoteTime<ctx.currentTime+.18){
      scheduleStep(nextNoteTime);
      nextNoteTime+=secondsPerStep;
    }
  }

  function beginMusic(){
    if(muted)return;
    primeAudio();
    if(playing){syncButton();return}
    playing=true;
    step=0;
    nextNoteTime=ctx.currentTime+.05;
    const target=isMobile?.62:(isChrome?.52:.40);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(Math.max(master.gain.value,.0001),ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(target,ctx.currentTime+.18);
    startupBlip();
    scheduler();
    clearInterval(timer);
    timer=setInterval(scheduler,isMobile?22:(isChrome?25:35));
    syncButton();
  }

  function stopMusic(){
    playing=false;
    clearInterval(timer);timer=null;
    if(ctx&&master){
      const t=ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(Math.max(master.gain.value,.0001),t);
      master.gain.exponentialRampToValueAtTime(.0001,t+.12);
    }
    syncButton();
  }

  function toggleMusic(){
    muted=!muted;
    if(muted)stopMusic();
    else{primeAudio();beginMusic()}
    syncButton();
  }

  function syncButton(){
    const btn=document.getElementById('gameAudioToggle');
    if(!btn)return;
    if(muted){btn.textContent='MÚSICA OFF';btn.setAttribute('aria-pressed','false');return}
    btn.textContent=playing?'MÚSICA ON':'ATIVAR SOM';
    btn.setAttribute('aria-pressed',playing?'true':'false');
  }

  function attachUI(){
    const help=document.querySelector('#easterOverlay .game-help');
    if(!help||document.getElementById('gameAudioToggle'))return;
    const btn=document.createElement('button');
    btn.id='gameAudioToggle';
    btn.className='game-audio-toggle';
    btn.type='button';
    btn._touchAt=0;
    btn.addEventListener('touchstart',e=>{
      btn._touchAt=Date.now();
      e.preventDefault();
      primeAudio();
      toggleMusic();
    },{passive:false});
    btn.addEventListener('click',()=>{
      if(Date.now()-btn._touchAt<650)return;
      toggleMusic();
    });
    help.appendChild(btn);
    syncButton();
  }

  function gameIsVisible(){
    const game=document.getElementById('eggGame');
    return !!game&&!game.hidden&&document.getElementById('easterOverlay')?.classList.contains('open');
  }

  function startFromGesture(){
    muted=false;
    primeAudio();
    beginMusic();
  }

  // Mobile browsers require audio creation/resume directly inside the user's gesture.
  document.addEventListener('touchstart',e=>{
    if(e.target?.closest?.('#eggLoginForm .login-enter,#gameRestart'))startFromGesture();
  },{capture:true,passive:true});

  document.addEventListener('pointerdown',e=>{
    if(e.pointerType==='touch')return;
    if(e.target?.closest?.('#eggLoginForm .login-enter,#gameRestart'))startFromGesture();
  },true);

  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#eggLoginForm .login-enter')){startFromGesture();return}
    const id=e.target?.id;
    if(id==='eggClose'||id==='gameExit')stopMusic();
    if(id==='gameRestart')startFromGesture();
  },true);

  document.addEventListener('submit',e=>{
    if(e.target?.id==='eggLoginForm')startFromGesture();
  },true);

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&document.getElementById('easterOverlay')?.classList.contains('open'))stopMusic();
    if(e.key==='Enter'&&document.activeElement?.id==='eggPlayer')startFromGesture();
  },true);

  const observer=new MutationObserver(()=>{
    attachUI();
    if(gameIsVisible()&&!muted&&!playing&&unlocked)beginMusic();
  });
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)stopMusic();
    else if(gameIsVisible()&&!muted&&unlocked)beginMusic();
  });
  window.addEventListener('focus',()=>{if(gameIsVisible()&&!muted&&unlocked&&!playing)beginMusic()});
  window.addEventListener('pageshow',()=>{if(gameIsVisible()&&!muted&&unlocked&&!playing)beginMusic()});

  attachUI();
})();
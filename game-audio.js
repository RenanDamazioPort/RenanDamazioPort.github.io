(()=>{
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx)return;

  const isChrome=/Chrome|CriOS/.test(navigator.userAgent)&&!/Edg|OPR/.test(navigator.userAgent);
  let ctx=null,master=null,compressor=null,timer=null,nextNoteTime=0,step=0,playing=false,unlocked=false;
  let muted=localStorage.getItem('rd-game-music-muted')==='1';

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
    master.gain.value=0.0001;
    master.connect(compressor);
    compressor.connect(ctx.destination);
  }

  async function unlockAudio(){
    ensureAudio();
    try{if(ctx.state!=='running')await ctx.resume()}catch(_){ }
    if(ctx.state!=='running')return false;
    if(!unlocked){
      const buffer=ctx.createBuffer(1,1,ctx.sampleRate);
      const source=ctx.createBufferSource();
      source.buffer=buffer;
      source.connect(master);
      source.start(0);
      unlocked=true;
    }
    syncButton();
    return true;
  }

  function tone(note,time,duration,type,volume,detune=0){
    if(note==null||!ctx||!master)return;
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.type=type;
    osc.frequency.setValueAtTime(midi(note),time);
    osc.detune.setValueAtTime(detune,time);
    gain.gain.setValueAtTime(0.0001,time);
    gain.gain.exponentialRampToValueAtTime(volume,time+.008);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0001,volume*.38),time+duration*.5);
    gain.gain.exponentialRampToValueAtTime(0.0001,time+duration);
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
    if(!ctx||!playing||ctx.state!=='running')return;
    const bpm=Math.min(142,108+(level()-1)*4);
    const secondsPerStep=(60/bpm)/2;
    while(nextNoteTime<ctx.currentTime+.16){
      scheduleStep(nextNoteTime);
      nextNoteTime+=secondsPerStep;
    }
  }

  async function startMusic(){
    if(muted)return;
    const ok=await unlockAudio();
    if(!ok)return;
    if(playing){syncButton();return}
    playing=true;
    step=0;
    nextNoteTime=ctx.currentTime+.03;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(Math.max(master.gain.value,0.0001),ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(isChrome?.52:.40,ctx.currentTime+.22);
    scheduler();
    clearInterval(timer);
    timer=setInterval(scheduler,isChrome?25:35);
    syncButton();
  }

  function stopMusic(){
    playing=false;
    clearInterval(timer);timer=null;
    if(ctx&&master){
      const t=ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(Math.max(master.gain.value,0.0001),t);
      master.gain.exponentialRampToValueAtTime(0.0001,t+.14);
    }
    syncButton();
  }

  async function toggleMusic(){
    muted=!muted;
    localStorage.setItem('rd-game-music-muted',muted?'1':'0');
    if(muted)stopMusic();else await startMusic();
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
    btn.addEventListener('pointerdown',unlockAudio,{passive:true});
    btn.addEventListener('click',toggleMusic);
    help.appendChild(btn);
    syncButton();
  }

  function gameIsVisible(){
    const game=document.getElementById('eggGame');
    return !!game&&!game.hidden&&document.getElementById('easterOverlay')?.classList.contains('open');
  }

  document.addEventListener('pointerdown',e=>{
    if(e.target?.closest?.('#eggLoginForm .login-enter,#gameAudioToggle,#gameRestart'))unlockAudio();
  },true);

  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#eggLoginForm .login-enter')){
      unlockAudio().then(()=>{if(!muted)startMusic()});
      return;
    }
    const id=e.target?.id;
    if(id==='eggClose'||id==='gameExit')stopMusic();
    if(id==='gameRestart'&&!muted)unlockAudio().then(startMusic);
  },true);

  document.addEventListener('submit',e=>{
    if(e.target?.id!=='eggLoginForm')return;
    unlockAudio().then(()=>{if(!muted)startMusic()});
  },true);

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&document.getElementById('easterOverlay')?.classList.contains('open'))stopMusic();
    if(e.key==='Enter'&&document.activeElement?.id==='eggPlayer')unlockAudio().then(()=>{if(!muted)startMusic()});
  },true);

  const observer=new MutationObserver(()=>{
    attachUI();
    if(gameIsVisible()&&!muted&&!playing&&unlocked)startMusic();
  });
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)stopMusic();
    else if(gameIsVisible()&&!muted&&unlocked)startMusic();
  });

  window.addEventListener('focus',()=>{
    if(gameIsVisible()&&!muted&&unlocked&&!playing)startMusic();
  });

  attachUI();
})();
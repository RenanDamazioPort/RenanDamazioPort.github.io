(()=>{
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx)return;

  let ctx=null,master=null,timer=null,nextNoteTime=0,step=0,playing=false,unlocked=false;
  let muted=localStorage.getItem('rd-game-music-muted')==='1';

  const lead=[69,72,74,76,74,72,69,67,69,72,76,79,76,74,72,67];
  const bass=[45,null,45,null,48,null,43,null,45,null,41,null,43,null,40,null];
  const midi=n=>440*Math.pow(2,(n-69)/12);
  const level=()=>Math.max(1,Number(document.getElementById('gameLevel')?.textContent)||1);

  function ensureAudio(){
    if(ctx)return;
    ctx=new AudioCtx();
    master=ctx.createGain();
    master.gain.value=0.0001;
    master.connect(ctx.destination);
  }

  async function unlockAudio(){
    ensureAudio();
    try{await ctx.resume()}catch(_){ }
    if(ctx.state!=='running')return false;
    if(!unlocked){
      const osc=ctx.createOscillator();
      const gain=ctx.createGain();
      gain.gain.value=0.0001;
      osc.connect(gain);gain.connect(master);
      osc.start();osc.stop(ctx.currentTime+.015);
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
    gain.gain.exponentialRampToValueAtTime(volume,time+.012);
    gain.gain.exponentialRampToValueAtTime(0.0001,time+duration);
    osc.connect(gain);gain.connect(master);
    osc.start(time);osc.stop(time+duration+.035);
  }

  function scheduleStep(time){
    const lv=level();
    const l=lead[step%lead.length]+(lv>=4&&step%8===7?12:0);
    const b=bass[step%bass.length];
    tone(l,time,.14,'square',.20,step%2?5:-5);
    tone(l-12,time,.18,'triangle',.085);
    if(b!=null)tone(b,time,.27,'triangle',.16);
    if(step%4===2)tone(81,time,.05,'square',.055);
    step++;
  }

  function scheduler(){
    if(!ctx||!playing||ctx.state!=='running')return;
    const bpm=Math.min(138,104+(level()-1)*4);
    const secondsPerStep=(60/bpm)/2;
    while(nextNoteTime<ctx.currentTime+.14){
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
    nextNoteTime=ctx.currentTime+.035;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(Math.max(master.gain.value,0.0001),ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(.22,ctx.currentTime+.28);
    scheduler();
    clearInterval(timer);
    timer=setInterval(scheduler,35);
    syncButton();
  }

  function stopMusic(){
    playing=false;
    clearInterval(timer);timer=null;
    if(ctx&&master){
      const t=ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(Math.max(master.gain.value,0.0001),t);
      master.gain.exponentialRampToValueAtTime(0.0001,t+.16);
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
    if(muted){
      btn.textContent='MÚSICA OFF';
      btn.setAttribute('aria-pressed','false');
      return;
    }
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

  // iPhone/Safari needs the AudioContext unlocked directly from a user gesture.
  document.addEventListener('pointerdown',e=>{
    const id=e.target?.id;
    if(id==='eggPlayer'||id==='eggLoginForm')return;
    if(id==='gameAudioToggle'||e.target?.closest?.('#eggLoginForm .login-enter'))unlockAudio();
  },true);

  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#eggLoginForm .login-enter')){
      unlockAudio().then(()=>{if(!muted)setTimeout(startMusic,60)});
      return;
    }
    const id=e.target?.id;
    if(id==='eggClose'||id==='gameExit')stopMusic();
    if(id==='gameRestart'&&!muted)setTimeout(startMusic,40);
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

  attachUI();
})();
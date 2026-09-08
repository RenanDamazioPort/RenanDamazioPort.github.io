(()=>{
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx)return;

  let ctx=null,master=null,timer=null,nextNoteTime=0,step=0,playing=false;
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
    osc.start(time);osc.stop(time+duration+.03);
  }

  function scheduleStep(time){
    const lv=level();
    const l=lead[step%lead.length]+(lv>=4&&step%8===7?12:0);
    const b=bass[step%bass.length];
    tone(l,time,.13,'square',.032,step%2?5:-5);
    tone(l-12,time,.16,'triangle',.016);
    if(b!=null)tone(b,time,.24,'triangle',.035);
    if(step%4===2)tone(81,time,.045,'square',.009);
    step++;
  }

  function scheduler(){
    if(!ctx||!playing)return;
    const bpm=Math.min(136,104+(level()-1)*4);
    const secondsPerStep=(60/bpm)/2;
    while(nextNoteTime<ctx.currentTime+.12){
      scheduleStep(nextNoteTime);
      nextNoteTime+=secondsPerStep;
    }
  }

  async function startMusic(){
    if(muted)return;
    ensureAudio();
    try{await ctx.resume()}catch(_){ }
    if(playing)return;
    playing=true;step=0;nextNoteTime=ctx.currentTime+.04;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(Math.max(master.gain.value,0.0001),ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(.085,ctx.currentTime+.45);
    scheduler();
    timer=setInterval(scheduler,40);
    syncButton();
  }

  function stopMusic(){
    playing=false;
    clearInterval(timer);timer=null;
    if(ctx&&master){
      const t=ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(Math.max(master.gain.value,0.0001),t);
      master.gain.exponentialRampToValueAtTime(0.0001,t+.18);
    }
    syncButton();
  }

  function toggleMusic(){
    muted=!muted;
    localStorage.setItem('rd-game-music-muted',muted?'1':'0');
    if(muted)stopMusic();else startMusic();
    syncButton();
  }

  function syncButton(){
    const btn=document.getElementById('gameAudioToggle');
    if(!btn)return;
    btn.textContent=muted?'MÚSICA OFF':'MÚSICA ON';
    btn.setAttribute('aria-pressed',muted?'false':'true');
  }

  function attachUI(){
    const help=document.querySelector('#easterOverlay .game-help');
    if(!help||document.getElementById('gameAudioToggle'))return;
    const btn=document.createElement('button');
    btn.id='gameAudioToggle';
    btn.className='game-audio-toggle';
    btn.type='button';
    btn.onclick=toggleMusic;
    help.appendChild(btn);
    syncButton();
  }

  document.addEventListener('submit',e=>{
    if(e.target?.id!=='eggLoginForm')return;
    startMusic();
  },true);

  document.addEventListener('click',e=>{
    const id=e.target?.id;
    if(id==='eggClose'||id==='gameExit')stopMusic();
  },true);

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&document.getElementById('easterOverlay')?.classList.contains('open'))stopMusic();
  },true);

  const observer=new MutationObserver(()=>attachUI());
  observer.observe(document.body,{childList:true,subtree:true});
  attachUI();
})();
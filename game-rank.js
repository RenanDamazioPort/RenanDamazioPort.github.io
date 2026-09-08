(()=>{
  const ENDPOINT='https://ncmvcrvyexocadvjpyyx.supabase.co/functions/v1/game-leaderboard';
  const CACHE_KEY='rd_cow_abduction_rank_cache_v1';
  let roundSaved=false;
  let globalRank=[];
  let loading=false;

  function normalizeName(name){
    return (name||'PLAYER 01').trim().toUpperCase().replace(/[^A-Z0-9 _-]/g,'').slice(0,18)||'PLAYER 01';
  }

  function escapeHtml(str){
    return String(str).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function cacheSave(list){
    try{localStorage.setItem(CACHE_KEY,JSON.stringify(list.slice(0,20)))}catch(_){ }
  }

  function cacheLoad(){
    try{
      const d=JSON.parse(localStorage.getItem(CACHE_KEY)||'[]');
      return Array.isArray(d)?d:[];
    }catch(_){return[]}
  }

  async function api(method='GET',body){
    const res=await fetch(ENDPOINT,{
      method,
      headers:body?{'Content-Type':'application/json'}:undefined,
      body:body?JSON.stringify(body):undefined
    });
    if(!res.ok)throw new Error(`Leaderboard ${res.status}`);
    return await res.json();
  }

  async function loadGlobalRank(){
    if(loading)return globalRank;
    loading=true;
    try{
      const data=await api('GET');
      globalRank=(Array.isArray(data)?data:[]).map(x=>({name:normalizeName(x.player_name),score:Number(x.score)||0,updated_at:x.updated_at||null}));
      cacheSave(globalRank);
    }catch(_){
      if(!globalRank.length)globalRank=cacheLoad();
    }finally{loading=false}
    return globalRank;
  }

  async function submitGlobalScore(name,score){
    const n=normalizeName(name);
    const s=Math.max(0,Math.min(500000,Math.floor((Number(score)||0)/100)*100));
    if(!s)return;
    const data=await api('POST',{name:n,score:s});
    globalRank=(Array.isArray(data)?data:[]).map(x=>({name:normalizeName(x.player_name),score:Number(x.score)||0,updated_at:x.updated_at||null}));
    cacheSave(globalRank);
  }

  function setup(){
    const overlay=document.getElementById('easterOverlay');
    if(!overlay||overlay.dataset.rankReady)return;
    overlay.dataset.rankReady='1';

    const shell=overlay.querySelector('.game-shell');
    const hud=overlay.querySelector('.game-hud');
    const scoreEl=overlay.querySelector('#gameScore');
    const playerEl=overlay.querySelector('#gamePlayer');
    const message=overlay.querySelector('#gameMessage');
    const restart=overlay.querySelector('#gameRestart');
    const loginForm=overlay.querySelector('#eggLoginForm');
    if(!shell||!hud||!scoreEl||!playerEl||!message)return;

    shell.classList.add('has-rank');
    const panel=document.createElement('div');
    panel.className='game-rank';
    panel.innerHTML='<div class="game-rank-title">RANK GLOBAL · 100 PTS / VACA</div><div class="game-rank-list" id="gameRankList"><div class="game-rank-empty">CARREGANDO RANK...</div></div>';
    hud.insertAdjacentElement('afterend',panel);
    const listEl=panel.querySelector('#gameRankList');

    function currentScore(){return Number(String(scoreEl.textContent||'0').replace(/\D/g,''))||0}
    function currentName(){return normalizeName(playerEl.textContent)}

    function previewList(){
      const name=currentName(),score=currentScore(),list=globalRank.map(x=>({...x}));
      const idx=list.findIndex(x=>x.name===name);
      if(idx>=0)list[idx].score=Math.max(list[idx].score,score);
      else if(score>0)list.push({name,score});
      list.sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
      return list.slice(0,10);
    }

    function render(){
      const name=currentName(),top=previewList();
      if(!top.length){listEl.innerHTML='<div class="game-rank-empty">SEJA O PRIMEIRO DO RANK GLOBAL.</div>';return}
      const limit=innerWidth<821?3:5;
      listEl.innerHTML=top.slice(0,limit).map((entry,i)=>`<div class="game-rank-entry${entry.name===name?' current':''}"><span class="game-rank-pos">#${String(i+1).padStart(2,'0')}</span><span class="game-rank-name">${escapeHtml(entry.name)}</span><span class="game-rank-score">${String(entry.score).padStart(6,'0')}</span></div>`).join('');
    }

    async function refresh(){await loadGlobalRank();render()}
    async function saveRound(){
      if(roundSaved)return;roundSaved=true;
      try{await submitGlobalScore(currentName(),currentScore())}catch(_){ }
      render();
    }

    new MutationObserver(render).observe(scoreEl,{childList:true,characterData:true,subtree:true});
    new MutationObserver(render).observe(playerEl,{childList:true,characterData:true,subtree:true});
    new MutationObserver(()=>{if(message.classList.contains('show'))saveRound()}).observe(message,{attributes:true,attributeFilter:['class']});
    restart?.addEventListener('click',()=>{roundSaved=false;setTimeout(render,0)});
    loginForm?.addEventListener('submit',()=>{roundSaved=false;setTimeout(()=>{render();refresh()},750)});
    window.addEventListener('focus',refresh);
    refresh();
  }

  const observer=new MutationObserver(()=>setup());
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
  else setup();
})();
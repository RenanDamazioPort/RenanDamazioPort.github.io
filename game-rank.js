(()=>{
  const STORAGE_KEY='rd_starship_rank_v1';
  let roundSaved=false;

  function safeLoad(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      const data=raw?JSON.parse(raw):[];
      return Array.isArray(data)?data.filter(x=>x&&typeof x.name==='string'&&Number.isFinite(Number(x.score))):[];
    }catch(_){return[]}
  }

  function safeSave(list){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(list))}catch(_){ }
  }

  function normalizeName(name){
    return (name||'PLAYER 01').trim().toUpperCase().slice(0,18)||'PLAYER 01';
  }

  function mergeScore(name,score){
    const n=normalizeName(name);
    const s=Math.max(0,Number(score)||0);
    const list=safeLoad();
    const idx=list.findIndex(x=>normalizeName(x.name)===n);
    if(idx>=0){
      if(s>Number(list[idx].score||0))list[idx]={name:n,score:s,ts:Date.now()};
    }else if(s>0){
      list.push({name:n,score:s,ts:Date.now()});
    }
    list.sort((a,b)=>Number(b.score)-Number(a.score)||Number(a.ts||0)-Number(b.ts||0));
    const trimmed=list.slice(0,20);
    safeSave(trimmed);
    return trimmed;
  }

  function buildPreview(name,score){
    const n=normalizeName(name);
    const s=Math.max(0,Number(score)||0);
    const list=safeLoad().map(x=>({name:normalizeName(x.name),score:Number(x.score)||0,stored:true}));
    const idx=list.findIndex(x=>x.name===n);
    if(idx>=0)list[idx].score=Math.max(list[idx].score,s);
    else list.push({name:n,score:s,stored:false});
    list.sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
    return list;
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
    panel.innerHTML='<div class="game-rank-title">RANK · 100 PTS / ASTEROIDE</div><div class="game-rank-list" id="gameRankList"></div>';
    hud.insertAdjacentElement('afterend',panel);
    const listEl=panel.querySelector('#gameRankList');

    function currentScore(){return Number(String(scoreEl.textContent||'0').replace(/\D/g,''))||0}
    function currentName(){return normalizeName(playerEl.textContent)}

    function render(){
      const name=currentName();
      const score=currentScore();
      const list=buildPreview(name,score);
      const top=list.slice(0,5);
      if(!top.length){
        listEl.innerHTML='<div class="game-rank-empty">SEJA O PRIMEIRO NO RANK.</div>';
        return;
      }
      listEl.innerHTML=top.map((entry,i)=>{
        const isCurrent=entry.name===name;
        return `<div class="game-rank-entry${isCurrent?' current':''}"><span class="game-rank-pos">#${String(i+1).padStart(2,'0')}</span><span class="game-rank-name">${escapeHtml(entry.name)}</span><span class="game-rank-score">${String(entry.score).padStart(6,'0')}</span></div>`;
      }).join('');
    }

    function escapeHtml(str){
      return String(str).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
    }

    function saveRound(){
      if(roundSaved)return;
      roundSaved=true;
      mergeScore(currentName(),currentScore());
      render();
    }

    new MutationObserver(render).observe(scoreEl,{childList:true,characterData:true,subtree:true});
    new MutationObserver(render).observe(playerEl,{childList:true,characterData:true,subtree:true});
    new MutationObserver(()=>{
      if(message.classList.contains('show'))saveRound();
    }).observe(message,{attributes:true,attributeFilter:['class']});

    restart?.addEventListener('click',()=>{roundSaved=false;setTimeout(render,0)});
    loginForm?.addEventListener('submit',()=>{roundSaved=false;setTimeout(render,750)});

    render();
  }

  const observer=new MutationObserver(()=>setup());
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
  else setup();
})();
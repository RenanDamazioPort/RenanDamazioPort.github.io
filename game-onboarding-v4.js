(()=>{
  function setup(){
    const overlay=document.getElementById('easterOverlay');
    if(!overlay||overlay.dataset.onboardingV4)return;
    overlay.dataset.onboardingV4='1';

    const loginCard=overlay.querySelector('.login-card');
    const form=overlay.querySelector('#eggLoginForm');
    const intro=loginCard?.querySelector('p');
    if(loginCard&&form){
      if(intro)intro.textContent='Você controla uma nave alien. Posicione-se sobre a vaca e mantenha o FEIXE pressionado até ela entrar na nave.';
      const controls=document.createElement('div');
      controls.className='preplay-controls';
      controls.innerHTML=`
        <div class="preplay-title"><span>COMO JOGAR</span><span>+100 PTS / VACA</span></div>
        <div class="preplay-grid">
          <div class="preplay-control">
            <strong>MOVER A NAVE</strong>
            <div class="preplay-keys"><span class="keycap">A</span><span class="keycap">D</span><span class="preplay-or">OU</span><span class="keycap">←</span><span class="keycap">→</span></div>
          </div>
          <div class="preplay-control">
            <strong>ATIVAR O FEIXE</strong>
            <div class="preplay-keys"><span class="keycap beam">SPACE</span><span class="preplay-or">OU</span><span class="keycap">W</span><span class="keycap">↑</span></div>
          </div>
        </div>
        <div class="preplay-mission"><b>ABDUÇÃO:</b> alinhe a nave sobre uma vaca → <em>SEGURE O FEIXE</em> → ela começa a subir → mantenha pressionado até entrar completamente na nave. Cuidado: o fazendeiro pode aparecer e atirar. A cada 500 pontos a dificuldade aumenta.</div>`;
      form.parentNode.insertBefore(controls,form);
    }

    const help=overlay.querySelector('.game-help .desktop-help');
    if(help)help.innerHTML='<span class="beam-instruction"><i></i>SEGURE SPACE / W / ↑ PARA ABDUZIR</span>';
  }

  const observer=new MutationObserver(setup);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
  else setup();
})();
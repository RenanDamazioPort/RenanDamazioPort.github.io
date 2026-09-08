(()=>{
  const layer=document.querySelector('.hero-emoji-layer');
  if(!layer)return;
  const allItems=[...layer.querySelectorAll('.hero-emoji')];
  if(allItems.length<4)return;

  let activated=false;
  let checkTimer=null;

  const visibleItems=()=>allItems.filter(el=>getComputedStyle(el).display!=='none'&&el.getBoundingClientRect().width>0);

  function geometry(items){
    const lr=layer.getBoundingClientRect();
    const pts=items.map(el=>{const r=el.getBoundingClientRect();return{el,x:r.left-lr.left+r.width/2,y:r.top-lr.top+r.height/2}});
    const cx=pts.reduce((s,p)=>s+p.x,0)/pts.length;
    const cy=pts.reduce((s,p)=>s+p.y,0)/pts.length;
    pts.forEach(p=>{p.radius=Math.hypot(p.x-cx,p.y-cy);p.angle=Math.atan2(p.y-cy,p.x-cx)});
    const meanR=pts.reduce((s,p)=>s+p.radius,0)/pts.length;
    const variance=pts.reduce((s,p)=>s+Math.pow(p.radius-meanR,2),0)/pts.length;
    const sd=Math.sqrt(variance);
    const angles=pts.map(p=>(p.angle+Math.PI*2)%(Math.PI*2)).sort((a,b)=>a-b);
    const gaps=angles.map((a,i)=>{const b=i===angles.length-1?angles[0]+Math.PI*2:angles[i+1];return b-a});
    const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);
    const bw=Math.max(...xs)-Math.min(...xs),bh=Math.max(...ys)-Math.min(...ys);
    return{lr,pts,cx,cy,meanR,cv:meanR?sd/meanR:9,minGap:Math.min(...gaps),maxGap:Math.max(...gaps),aspect:bh?bw/bh:9};
  }

  function looksLikeCircle(){
    if(activated)return false;
    const items=visibleItems();
    if(items.length<4)return false;
    const manuallyPlaced=items.filter(el=>/px$/.test(el.style.left||'')).length;
    if(manuallyPlaced<Math.max(3,items.length-1))return false;
    const g=geometry(items);
    const minRadius=innerWidth<821?72:120;
    const maxRadius=Math.min(g.lr.width,g.lr.height)*.46;
    return g.meanR>minRadius&&g.meanR<maxRadius&&g.cv<.30&&g.minGap>.30&&g.maxGap<1.60&&g.aspect>.62&&g.aspect<1.55;
  }

  function scheduleCheck(){
    clearTimeout(checkTimer);
    checkTimer=setTimeout(()=>{
      if(looksLikeCircle())triggerPortal();
    },180);
  }

  document.addEventListener('mouseup',scheduleCheck,true);
  document.addEventListener('pointerup',scheduleCheck,true);

  function ease(t){return 1-Math.pow(1-t,3)}

  function triggerPortal(){
    if(activated)return;
    activated=true;
    const items=visibleItems();
    const g=geometry(items);
    layer.classList.add('egg-armed','egg-triggered');
    const starts=g.pts.map(p=>({el:p.el,a:p.angle}));
    const duration=1450;
    const start=performance.now();
    const spins=2.25*Math.PI*2;
    const baseR=Math.max(74,g.meanR);

    function frame(now){
      const t=Math.min(1,(now-start)/duration);
      const e=ease(t);
      const r=baseR*(1-.26*e);
      starts.forEach((p,i)=>{
        const a=p.a+spins*e;
        const el=p.el;
        const x=g.cx+Math.cos(a)*r-el.offsetWidth/2;
        const y=g.cy+Math.sin(a)*r-el.offsetHeight/2;
        el.style.setProperty('left',x+'px','important');
        el.style.setProperty('top',y+'px','important');
        el.style.setProperty('right','auto','important');
        el.style.setProperty('bottom','auto','important');
        el.style.setProperty('animation','none','important');
        el.style.setProperty('transform',`rotate(${720*e+i*12}deg) scale(${1+.16*Math.sin(Math.PI*t)})`,'important');
      });
      if(t<1)requestAnimationFrame(frame);else openPortal();
    }
    requestAnimationFrame(frame);
  }

  function openPortal(){
    const flash=document.createElement('div');
    flash.className='egg-portal-flash go';
    document.body.appendChild(flash);
    ensureOverlay();
    setTimeout(()=>{
      document.getElementById('easterOverlay')?.classList.add('open');
      document.body.style.overflow='hidden';
      document.getElementById('eggPlayer')?.focus();
    },420);
    setTimeout(()=>flash.remove(),1400);
  }

  let game=null;
  function ensureOverlay(){
    if(document.getElementById('easterOverlay'))return;
    const overlay=document.createElement('div');
    overlay.id='easterOverlay';
    overlay.className='easter-overlay';
    overlay.innerHTML=`
      <button class="easter-close" id="eggClose">FECHAR ×</button>
      <section class="egg-login" id="eggLogin">
        <div class="login-card">
          <div class="login-top"><span><i class="login-dot"></i>EASTER.EXE</span><span>CÍRCULO VALIDADO / 07</span></div>
          <h2>ACESSO<br>LIBERADO.</h2>
          <p>Você encontrou uma área escondida do portfólio. Identifique o jogador para iniciar o protocolo.</p>
          <form class="login-form" id="eggLoginForm">
            <label for="eggPlayer">USUÁRIO</label>
            <input id="eggPlayer" maxlength="18" autocomplete="off" placeholder="PLAYER 01" value="PLAYER 01">
            <button class="login-enter" type="submit">ENTRAR NO SISTEMA ↗</button>
          </form>
          <div class="login-status" id="eggLoginStatus">NODE ONLINE · AGUARDANDO LOGIN</div>
        </div>
      </section>
      <section class="egg-game" id="eggGame" hidden>
        <div class="game-shell">
          <div class="game-hud"><span>PLAYER · <strong id="gamePlayer">PLAYER 01</strong></span><span>SCORE · <strong id="gameScore">000000</strong></span><span>VIDAS · <strong id="gameLives">3</strong></span></div>
          <div class="game-canvas-wrap">
            <canvas class="game-canvas" id="gameCanvas"></canvas>
            <div class="game-message" id="gameMessage"><div class="game-message-card"><h3>GAME OVER</h3><p id="gameFinal">SCORE 000000</p><div class="game-actions"><button class="primary" id="gameRestart">JOGAR DE NOVO</button><button id="gameExit">VOLTAR AO PORTFÓLIO</button></div></div></div>
          </div>
          <div class="game-help"><span class="desktop-help">WASD / SETAS · MOVER &nbsp; SPACE · ATIRAR &nbsp; ESC · SAIR</span><span>RD://STARSHIP_01</span><div class="touch-game-controls"><button data-touch="left">←</button><button data-touch="right">→</button><button class="fire" data-touch="fire">FIRE</button></div></div>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    const close=()=>closeOverlay();
    document.getElementById('eggClose').onclick=close;
    document.getElementById('gameExit').onclick=close;
    document.getElementById('eggLoginForm').addEventListener('submit',e=>{
      e.preventDefault();
      const input=document.getElementById('eggPlayer');
      const name=(input.value.trim()||'PLAYER 01').toUpperCase();
      document.getElementById('eggLoginStatus').textContent='ACCESS GRANTED · INICIALIZANDO STARSHIP...';
      setTimeout(()=>launchGame(name),650);
    });
    document.getElementById('gameRestart').onclick=()=>game?.restart();
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&overlay.classList.contains('open'))closeOverlay();
    });
  }

  function closeOverlay(){
    const overlay=document.getElementById('easterOverlay');
    if(!overlay)return;
    game?.stop();
    overlay.classList.remove('open');
    document.body.style.overflow='';
    document.getElementById('eggGame').hidden=true;
    document.getElementById('eggLogin').hidden=false;
    const status=document.getElementById('eggLoginStatus');
    if(status)status.textContent='NODE ONLINE · AGUARDANDO LOGIN';
  }

  function launchGame(name){
    document.getElementById('eggLogin').hidden=true;
    document.getElementById('eggGame').hidden=false;
    document.getElementById('gamePlayer').textContent=name;
    if(!game)game=createGame();
    game.start();
  }

  function createGame(){
    const canvas=document.getElementById('gameCanvas');
    const ctx=canvas.getContext('2d');
    const scoreEl=document.getElementById('gameScore');
    const livesEl=document.getElementById('gameLives');
    const message=document.getElementById('gameMessage');
    const final=document.getElementById('gameFinal');
    const keys=new Set();
    let raf=0,running=false,last=0,spawnClock=0,shootClock=0,score=0,lives=3;
    let W=800,H=500,dpr=1;
    let ship={x:400,y:430,r:16,speed:310};
    let bullets=[],enemies=[],particles=[],stars=[];

    function resize(){
      const r=canvas.getBoundingClientRect();
      dpr=Math.min(devicePixelRatio||1,2);
      W=Math.max(320,r.width);H=Math.max(260,r.height);
      canvas.width=Math.floor(W*dpr);canvas.height=Math.floor(H*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ship.x=Math.min(W-28,Math.max(28,ship.x));ship.y=Math.min(H-28,Math.max(28,ship.y));
      if(!stars.length)stars=Array.from({length:85},()=>({x:Math.random()*W,y:Math.random()*H,s:.5+Math.random()*1.7,v:12+Math.random()*40}));
    }
    const ro=new ResizeObserver(resize);ro.observe(canvas);

    function reset(){
      score=0;lives=3;bullets=[];enemies=[];particles=[];spawnClock=0;shootClock=0;
      ship={x:W/2,y:H-58,r:16,speed:310};
      scoreEl.textContent='000000';livesEl.textContent='3';message.classList.remove('show');
    }

    function spawnEnemy(){
      const r=13+Math.random()*12;
      enemies.push({x:24+Math.random()*(W-48),y:-30,r,v:72+Math.random()*92,phase:Math.random()*6.28,w:20+Math.random()*45});
    }
    function shoot(){
      if(shootClock>0||!running)return;
      bullets.push({x:ship.x,y:ship.y-20,v:560});shootClock=.18;
    }
    function burst(x,y,color='#35f3ff'){
      for(let i=0;i<10;i++){const a=Math.random()*Math.PI*2,s=45+Math.random()*150;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.45+Math.random()*.35,color})}
    }
    function hit(a,b){return Math.hypot(a.x-b.x,a.y-b.y)<a.r+b.r}

    function update(dt){
      shootClock=Math.max(0,shootClock-dt);spawnClock-=dt;
      if(spawnClock<=0){spawnEnemy();spawnClock=Math.max(.34,.92-score/18000)}
      let dx=0,dy=0;
      if(keys.has('ArrowLeft')||keys.has('a')||keys.has('A'))dx--;
      if(keys.has('ArrowRight')||keys.has('d')||keys.has('D'))dx++;
      if(keys.has('ArrowUp')||keys.has('w')||keys.has('W'))dy--;
      if(keys.has('ArrowDown')||keys.has('s')||keys.has('S'))dy++;
      if(dx||dy){const n=Math.hypot(dx,dy)||1;ship.x+=dx/n*ship.speed*dt;ship.y+=dy/n*ship.speed*dt}
      ship.x=Math.max(22,Math.min(W-22,ship.x));ship.y=Math.max(32,Math.min(H-26,ship.y));
      if(keys.has(' '))shoot();
      bullets.forEach(b=>b.y-=b.v*dt);bullets=bullets.filter(b=>b.y>-30);
      enemies.forEach(e=>{e.y+=e.v*dt;e.x+=Math.sin(e.y*.018+e.phase)*e.w*dt});
      particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.98;p.vy*=.98;p.life-=dt});particles=particles.filter(p=>p.life>0);
      stars.forEach(s=>{s.y+=s.v*dt;if(s.y>H){s.y=0;s.x=Math.random()*W}});

      for(let i=enemies.length-1;i>=0;i--){
        const e=enemies[i];
        let destroyed=false;
        for(let j=bullets.length-1;j>=0;j--){
          const b=bullets[j];
          if(Math.hypot(e.x-b.x,e.y-b.y)<e.r+5){bullets.splice(j,1);enemies.splice(i,1);score+=100;scoreEl.textContent=String(score).padStart(6,'0');burst(e.x,e.y);destroyed=true;break}
        }
        if(destroyed)continue;
        if(hit({x:ship.x,y:ship.y,r:ship.r},e)){enemies.splice(i,1);lives--;livesEl.textContent=String(lives);burst(ship.x,ship.y,'#d7ff3f');if(lives<=0){endGame();return}}
        else if(e.y>H+40){enemies.splice(i,1)}
      }
    }

    function draw(){
      ctx.clearRect(0,0,W,H);
      const grd=ctx.createLinearGradient(0,0,0,H);grd.addColorStop(0,'#030408');grd.addColorStop(1,'#090512');ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
      stars.forEach(s=>{ctx.globalAlpha=.35+s.s*.2;ctx.fillStyle='#c8f8ff';ctx.fillRect(s.x,s.y,s.s,s.s*2)});ctx.globalAlpha=1;
      ctx.strokeStyle='rgba(53,243,255,.08)';ctx.lineWidth=1;for(let y=H%70;y<H;y+=70){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}

      bullets.forEach(b=>{ctx.shadowBlur=16;ctx.shadowColor='#d7ff3f';ctx.fillStyle='#d7ff3f';ctx.fillRect(b.x-2,b.y-12,4,15)});ctx.shadowBlur=0;
      enemies.forEach(e=>{ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.y*.012);ctx.strokeStyle='#ff6ee7';ctx.fillStyle='rgba(138,5,190,.22)';ctx.lineWidth=2;ctx.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;const x=Math.cos(a)*e.r,y=Math.sin(a)*e.r;k?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()});
      particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life*1.6);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3)});ctx.globalAlpha=1;

      ctx.save();ctx.translate(ship.x,ship.y);ctx.shadowBlur=22;ctx.shadowColor='#35f3ff';ctx.fillStyle='#f5f2e9';ctx.strokeStyle='#35f3ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(15,15);ctx.lineTo(0,9);ctx.lineTo(-15,15);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#8A05BE';ctx.fillRect(-4,10,8,10);ctx.restore();ctx.shadowBlur=0;
    }

    function loop(t){
      if(!running)return;
      const dt=Math.min(.032,(t-last)/1000||.016);last=t;update(dt);draw();raf=requestAnimationFrame(loop)
    }
    function start(){resize();reset();running=true;last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}
    function stop(){running=false;cancelAnimationFrame(raf);keys.clear()}
    function restart(){start()}
    function endGame(){running=false;cancelAnimationFrame(raf);final.textContent='SCORE '+String(score).padStart(6,'0');message.classList.add('show')}

    window.addEventListener('keydown',e=>{if(!document.getElementById('easterOverlay')?.classList.contains('open'))return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();keys.add(e.key);if(e.key===' ')shoot()});
    window.addEventListener('keyup',e=>keys.delete(e.key));
    canvas.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')return;const r=canvas.getBoundingClientRect();ship.x=e.clientX-r.left;ship.y=e.clientY-r.top});
    canvas.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'){e.preventDefault();const r=canvas.getBoundingClientRect();ship.x=e.clientX-r.left;ship.y=e.clientY-r.top;shoot()}else shoot()});
    document.querySelectorAll('[data-touch]').forEach(btn=>{
      const action=btn.dataset.touch;
      const down=e=>{e.preventDefault();if(action==='left')keys.add('ArrowLeft');if(action==='right')keys.add('ArrowRight');if(action==='fire')shoot()};
      const up=e=>{e.preventDefault();if(action==='left')keys.delete('ArrowLeft');if(action==='right')keys.delete('ArrowRight')};
      btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);
    });
    return{start,stop,restart};
  }
})();
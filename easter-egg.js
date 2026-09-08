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
    checkTimer=setTimeout(()=>{if(looksLikeCircle())triggerPortal()},180);
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
    const duration=1450,start=performance.now(),spins=2.25*Math.PI*2,baseR=Math.max(74,g.meanR);
    function frame(now){
      const t=Math.min(1,(now-start)/duration),e=ease(t),r=baseR*(1-.26*e);
      starts.forEach((p,i)=>{
        const a=p.a+spins*e,el=p.el;
        el.style.setProperty('left',(g.cx+Math.cos(a)*r-el.offsetWidth/2)+'px','important');
        el.style.setProperty('top',(g.cy+Math.sin(a)*r-el.offsetHeight/2)+'px','important');
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
          <div class="login-top"><span><i class="login-dot"></i>ABDUCTION.EXE</span><span>CÍRCULO VALIDADO / 07</span></div>
          <h2>SINAL<br>CAPTADO.</h2>
          <p>Você abriu um protocolo escondido. Identifique o piloto e prepare o feixe de abdução.</p>
          <form class="login-form" id="eggLoginForm">
            <label for="eggPlayer">PILOTO</label>
            <input id="eggPlayer" maxlength="18" autocomplete="off" placeholder="PLAYER 01" value="PLAYER 01">
            <button class="login-enter" type="submit">INICIAR ABDUÇÃO ↗</button>
          </form>
          <div class="login-status" id="eggLoginStatus">UFO ONLINE · AGUARDANDO PILOTO</div>
        </div>
      </section>
      <section class="egg-game" id="eggGame" hidden>
        <div class="game-shell">
          <div class="game-hud">
            <span>PILOTO · <strong id="gamePlayer">PLAYER 01</strong></span>
            <span>SCORE · <strong id="gameScore">000000</strong></span>
            <span>NÍVEL · <strong id="gameLevel">1</strong></span>
            <span>VIDAS · <strong id="gameLives">3</strong></span>
          </div>
          <div class="game-canvas-wrap">
            <canvas class="game-canvas" id="gameCanvas"></canvas>
            <div class="game-message" id="gameMessage"><div class="game-message-card"><h3>MISSÃO ENCERRADA</h3><p id="gameFinal">SCORE 000000</p><div class="game-actions"><button class="primary" id="gameRestart">ABDUZIR DE NOVO</button><button id="gameExit">VOLTAR AO PORTFÓLIO</button></div></div></div>
          </div>
          <div class="game-help"><span class="desktop-help">A/D OU ←/→ · MOVER &nbsp; W / ↑ / SPACE · FEIXE &nbsp; ESC · SAIR</span><span>RD://COW_ABDUCTION</span><div class="touch-game-controls"><button data-touch="left">←</button><button data-touch="right">→</button><button class="fire" data-touch="beam">FEIXE</button></div></div>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    document.getElementById('eggClose').onclick=closeOverlay;
    document.getElementById('gameExit').onclick=closeOverlay;
    document.getElementById('eggLoginForm').addEventListener('submit',e=>{
      e.preventDefault();
      const name=(document.getElementById('eggPlayer').value.trim()||'PLAYER 01').toUpperCase();
      document.getElementById('eggLoginStatus').textContent='ACCESS GRANTED · LIGANDO FEIXE...';
      setTimeout(()=>launchGame(name),650);
    });
    document.getElementById('gameRestart').onclick=()=>game?.restart();
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('open'))closeOverlay()});
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
    if(status)status.textContent='UFO ONLINE · AGUARDANDO PILOTO';
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
    const levelEl=document.getElementById('gameLevel');
    const message=document.getElementById('gameMessage');
    const final=document.getElementById('gameFinal');
    const keys=new Set();
    const touch={left:false,right:false,beam:false};

    let raf=0,running=false,last=0,score=0,lives=3,level=1;
    let W=900,H=560,dpr=1,groundY=0,farmerClock=0,spawnClock=0,flicker=0;
    let ship={x:450,y:95,w:74,h:30,speed:330};
    let cows=[],farmers=[],shots=[],particles=[],stars=[],codeRain=[];

    function resize(){
      const r=canvas.getBoundingClientRect();
      dpr=Math.min(devicePixelRatio||1,2);
      W=Math.max(320,r.width);H=Math.max(300,r.height);groundY=H-72;
      canvas.width=Math.floor(W*dpr);canvas.height=Math.floor(H*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.imageSmoothingEnabled=false;
      ship.x=Math.max(42,Math.min(W-42,ship.x));
      if(!stars.length)stars=Array.from({length:70},()=>({x:Math.random()*W,y:Math.random()*(groundY-20),s:1+Math.random()*2,a:.08+Math.random()*.18}));
      if(!codeRain.length)codeRain=Array.from({length:18},(_,i)=>({x:18+Math.random()*(W-36),y:20+Math.random()*H,text:['01001','SYS_ERR','0x0F','NULL','RD://','10110','VOID'][i%7],v:2+Math.random()*5,a:.018+Math.random()*.025}));
    }
    const ro=new ResizeObserver(resize);ro.observe(canvas);

    function reset(){
      score=0;lives=3;level=1;farmerClock=3.2;spawnClock=0;shots=[];farmers=[];particles=[];cows=[];
      ship={x:W/2,y:Math.max(70,H*.16),w:74,h:30,speed:330};
      for(let i=0;i<4;i++)spawnCow(true);
      syncHud();message.classList.remove('show');
    }

    function syncHud(){
      scoreEl.textContent=String(score).padStart(6,'0');
      livesEl.textContent=String(lives);
      level=1+Math.floor(score/500);
      levelEl.textContent=String(level);
    }

    function spawnCow(initial=false){
      const dir=Math.random()<.5?-1:1;
      const baseSpeed=18+level*3+Math.random()*16;
      cows.push({x:initial?60+Math.random()*(W-120):(dir>0?-36:W+36),y:groundY-18,vx:dir*baseSpeed,w:38,h:25,abduct:0,wobble:Math.random()*6.28,captured:false});
    }

    function spawnFarmer(){
      const side=Math.random()<.5?'left':'right';
      farmers.push({x:side==='left'?30:W-30,y:groundY-34,life:3.6+Math.random()*1.2,shot:.55+Math.random()*.7,side});
    }

    function shootFrom(f){
      const dx=ship.x-f.x,dy=ship.y-f.y,n=Math.hypot(dx,dy)||1;
      const speed=205+level*22;
      shots.push({x:f.x,y:f.y-16,vx:dx/n*speed,vy:dy/n*speed,r:4});
    }

    function burst(x,y,color='#d7ff3f',count=12){
      for(let i=0;i<count;i++){
        const a=Math.random()*Math.PI*2,s=30+Math.random()*120;
        particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.45+Math.random()*.45,color});
      }
    }

    function isBeamOn(){return keys.has(' ')||keys.has('ArrowUp')||keys.has('w')||keys.has('W')||touch.beam}

    function update(dt){
      const oldLevel=level;
      level=1+Math.floor(score/500);
      if(level!==oldLevel){syncHud();burst(ship.x,ship.y,'#35f3ff',22)}
      flicker=Math.random()<.018?.025+Math.random()*.035:Math.max(0,flicker-dt*.25);

      let dx=0;
      if(keys.has('ArrowLeft')||keys.has('a')||keys.has('A')||touch.left)dx--;
      if(keys.has('ArrowRight')||keys.has('d')||keys.has('D')||touch.right)dx++;
      ship.x+=dx*ship.speed*dt;
      ship.x=Math.max(45,Math.min(W-45,ship.x));

      const beam=isBeamOn();
      const beamHalf=Math.max(42,72-level*1.8);
      const beamBottom=groundY+10;

      spawnClock-=dt;
      if(spawnClock<=0&&cows.length<Math.min(7,4+Math.floor(level/2))){spawnCow(false);spawnClock=.45+Math.random()*.9}

      cows.forEach(c=>{
        if(c.captured)return;
        c.wobble+=dt*2.4;c.x+=c.vx*dt;
        if(c.x<-55)c.x=W+50;if(c.x>W+55)c.x=-50;
        const underBeam=Math.abs(c.x-ship.x)<beamHalf&&c.y>ship.y+18&&c.y<beamBottom;
        if(beam&&underBeam){
          c.abduct=Math.min(1,c.abduct+dt*(.65+level*.035));
          c.y-=dt*(105+level*7+c.abduct*85);
          c.x+=(ship.x-c.x)*dt*(1.8+c.abduct*2.4);
          c.vx*=.985;
          if(c.y<ship.y+20){c.captured=true;score+=100;syncHud();burst(c.x,c.y,'#d7ff3f',16)}
        }else{
          c.abduct=Math.max(0,c.abduct-dt*.7);
          c.y+=(groundY-18-c.y)*Math.min(1,dt*5);
        }
      });
      cows=cows.filter(c=>!c.captured);

      farmerClock-=dt;
      const farmerInterval=Math.max(.85,4.1-level*.32);
      if(farmerClock<=0){spawnFarmer();farmerClock=farmerInterval*(.7+Math.random()*.7)}
      farmers.forEach(f=>{f.life-=dt;f.shot-=dt;if(f.shot<=0){shootFrom(f);f.shot=Math.max(.42,1.25-level*.07)+Math.random()*.45}});
      farmers=farmers.filter(f=>f.life>0);

      shots.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt});
      for(let i=shots.length-1;i>=0;i--){
        const s=shots[i];
        if(s.x<-20||s.x>W+20||s.y<-20||s.y>H+20){shots.splice(i,1);continue}
        if(Math.abs(s.x-ship.x)<ship.w*.42&&Math.abs(s.y-ship.y)<ship.h*.7){
          shots.splice(i,1);lives--;syncHud();burst(ship.x,ship.y,'#ff6e6e',22);
          if(lives<=0){endGame();return}
        }
      }

      particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.985;p.vy*=.985;p.life-=dt});
      particles=particles.filter(p=>p.life>0);
      codeRain.forEach(c=>{c.y+=c.v*dt;if(c.y>H+20){c.y=-20;c.x=10+Math.random()*(W-20)}});
    }

    function drawCow(c){
      ctx.save();ctx.translate(Math.round(c.x),Math.round(c.y+Math.sin(c.wobble)*1.5));
      const lift=Math.min(1,c.abduct);ctx.globalAlpha=.92;
      ctx.fillStyle='#f1eee5';ctx.fillRect(-18,-11,29,18);ctx.fillRect(9,-8,11,12);
      ctx.fillStyle='#22262b';ctx.fillRect(-12,-7,8,7);ctx.fillRect(0,-11,8,8);ctx.fillRect(10,-5,5,5);
      ctx.fillStyle='#f3b5b5';ctx.fillRect(14,-2,8,5);
      ctx.fillStyle='#f1eee5';ctx.fillRect(-14,7,5,9);ctx.fillRect(4,7,5,9);
      ctx.fillStyle='#15181c';ctx.fillRect(-14,14,5,3);ctx.fillRect(4,14,5,3);
      ctx.fillStyle='#d8d4ca';ctx.fillRect(15,-13,2,6);ctx.fillRect(19,-12,2,5);
      if(lift>0){ctx.strokeStyle=`rgba(215,255,63,${.18+lift*.35})`;ctx.strokeRect(-22,-15,46,35)}
      ctx.restore();ctx.globalAlpha=1;
    }

    function drawFarmer(f){
      ctx.save();ctx.translate(Math.round(f.x),Math.round(f.y));
      ctx.fillStyle='#d8b38b';ctx.fillRect(-6,-24,12,10);
      ctx.fillStyle='#b8b2a7';ctx.fillRect(-9,-14,18,17);
      ctx.fillStyle='#4f545b';ctx.fillRect(-9,3,7,13);ctx.fillRect(2,3,7,13);
      ctx.fillStyle='#8b6848';ctx.fillRect(-10,-28,20,4);ctx.fillRect(-6,-33,12,6);
      ctx.strokeStyle='#e6e2d8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(f.side==='left'?7:-7,-12);ctx.lineTo(f.side==='left'?17:-17,-18);ctx.stroke();
      ctx.restore();
    }

    function drawShip(beam){
      if(beam){
        const topY=ship.y+15,bottomY=groundY+8,half=70;
        const grd=ctx.createLinearGradient(0,topY,0,bottomY);grd.addColorStop(0,'rgba(53,243,255,.26)');grd.addColorStop(.75,'rgba(53,243,255,.09)');grd.addColorStop(1,'rgba(215,255,63,.06)');
        ctx.fillStyle=grd;ctx.beginPath();ctx.moveTo(ship.x-18,topY);ctx.lineTo(ship.x+18,topY);ctx.lineTo(ship.x+half,bottomY);ctx.lineTo(ship.x-half,bottomY);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(53,243,255,.18)';ctx.stroke();
      }
      ctx.save();ctx.translate(Math.round(ship.x),Math.round(ship.y));ctx.shadowBlur=18;ctx.shadowColor='#35f3ff';
      ctx.fillStyle='#ced6db';ctx.beginPath();ctx.ellipse(0,3,38,13,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#7cff68';ctx.beginPath();ctx.ellipse(0,-8,19,13,0,Math.PI,Math.PI*2);ctx.fill();
      ctx.fillStyle='#090d12';ctx.fillRect(-14,-8,28,7);ctx.fillStyle='#8A05BE';[-23,0,23].forEach(x=>ctx.fillRect(x-3,3,6,5));
      ctx.strokeStyle='#35f3ff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,3,39,14,0,0,Math.PI*2);ctx.stroke();ctx.restore();ctx.shadowBlur=0;
    }

    function draw(){
      ctx.clearRect(0,0,W,H);ctx.fillStyle='#090b12';ctx.fillRect(0,0,W,H);
      const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'rgba(16,18,31,.98)');sky.addColorStop(1,'rgba(23,24,38,.98)');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
      stars.forEach(s=>{ctx.globalAlpha=s.a;ctx.fillStyle='#d4d7df';ctx.fillRect(s.x,s.y,s.s,s.s)});ctx.globalAlpha=1;
      ctx.font='10px "Courier New",monospace';codeRain.forEach(c=>{ctx.globalAlpha=c.a;ctx.fillStyle='#b9bdc7';ctx.fillText(c.text,c.x,c.y)});ctx.globalAlpha=1;
      if(flicker>0){ctx.fillStyle=`rgba(210,214,222,${flicker})`;ctx.fillRect(0,0,W,H)}
      ctx.fillStyle='#272b34';ctx.fillRect(0,groundY,W,H-groundY);ctx.fillStyle='#313641';for(let x=0;x<W;x+=34){ctx.fillRect(x,groundY-4+(x%68?2:0),24,5)}
      const beam=isBeamOn();drawShip(beam);cows.forEach(drawCow);farmers.forEach(drawFarmer);
      shots.forEach(s=>{ctx.shadowBlur=10;ctx.shadowColor='#ff8b6e';ctx.fillStyle='#ffb09b';ctx.fillRect(s.x-3,s.y-3,6,6)});ctx.shadowBlur=0;
      particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life*1.5);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3)});ctx.globalAlpha=1;
      ctx.fillStyle='rgba(245,242,233,.48)';ctx.font='10px "Courier New",monospace';ctx.fillText(`DIFICULDADE ${level} · +1 A CADA 500 PTS`,14,20);
    }

    function loop(t){if(!running)return;const dt=Math.min(.035,(t-last)/1000||.016);last=t;update(dt);draw();raf=requestAnimationFrame(loop)}
    function endGame(){running=false;cancelAnimationFrame(raf);draw();final.textContent=`SCORE ${String(score).padStart(6,'0')} · NÍVEL ${level}`;message.classList.add('show')}
    function start(){resize();reset();running=true;last=performance.now();raf=requestAnimationFrame(loop)}
    function restart(){cancelAnimationFrame(raf);reset();running=true;last=performance.now();raf=requestAnimationFrame(loop)}
    function stop(){running=false;cancelAnimationFrame(raf);keys.clear();touch.left=touch.right=touch.beam=false}

    function keydown(e){
      if(document.getElementById('eggGame')?.hidden)return;
      if(['ArrowLeft','ArrowRight','ArrowUp',' ','a','A','d','D','w','W'].includes(e.key)){e.preventDefault();keys.add(e.key)}
    }
    function keyup(e){keys.delete(e.key)}
    document.addEventListener('keydown',keydown,{passive:false});document.addEventListener('keyup',keyup);

    document.querySelectorAll('[data-touch]').forEach(btn=>{
      const k=btn.dataset.touch;
      const on=e=>{e.preventDefault();touch[k]=true};
      const off=e=>{e.preventDefault();touch[k]=false};
      btn.addEventListener('pointerdown',on,{passive:false});btn.addEventListener('pointerup',off,{passive:false});btn.addEventListener('pointercancel',off,{passive:false});btn.addEventListener('pointerleave',off,{passive:false});
    });

    canvas.addEventListener('pointermove',e=>{
      if(!running||e.pointerType==='mouse')return;
      const r=canvas.getBoundingClientRect();ship.x=Math.max(45,Math.min(W-45,(e.clientX-r.left)/r.width*W));
    });

    return{start,restart,stop};
  }
})();
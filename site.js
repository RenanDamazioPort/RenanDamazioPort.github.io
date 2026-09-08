async function hydrate(){for(const el of document.querySelectorAll('[data-b64]')){try{el.src='data:image/webp;base64,'+(await fetch(el.dataset.b64).then(r=>r.text())).trim()}catch(e){}}}hydrate();function setupReveals(scope=document){const els=[...scope.querySelectorAll('.reveal')];if(matchMedia('(prefers-reduced-motion: reduce)').matches){els.forEach(e=>e.classList.add('is-visible'));return}const o=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('is-visible');o.unobserve(x.target)}}),{threshold:.12});els.forEach(e=>o.observe(e))}document.querySelectorAll('.section-head,.project,.about-grid,.contact-body,.hero-copy,.hero-cta').forEach(e=>e.classList.add('reveal'));setupReveals();const projects={verao:{n:'02',type:'verao'},gulf:{n:'03',t:'Gulf 30L',c:'Gulf',y:'2025',r:'Visual Principal · Campanha',d:'Visual principal promocional com foco em leitura imediata, presença de marca e adaptação para diferentes formatos.'},keune:{n:'04',type:'keune'}};const modal=document.getElementById('modal'),mc=document.getElementById('modalContent'),mn=document.getElementById('modalNum');document.querySelectorAll('button.project').forEach(b=>b.onclick=()=>{const p=projects[b.dataset.id];mn.textContent='PROJETO / '+p.n;if(p.type==='verao'){mc.innerHTML=`<h2>Verão Premiado</h2><div class="modal-meta"><span>CLIENTE — FEBRAFAR</span><span>ANO — 2026</span><span>FUNÇÃO — DIREÇÃO DE ARTE</span></div><figure class="case-hero"><img src="assets/verao-premiado/Proposta%20de%20KV.png" alt="Verão Premiado"></figure><div class="case-copy"><div class="credits"><div><strong>Cliente:</strong> Febrafar</div><div><strong>Redação:</strong> David Douglas</div><div><strong>Direção de Arte:</strong> Renan Damazio</div></div><p>Finalizei o rebranding completo do Verão Premiado 2026, um projeto de alcance nacional que esteve no ar entre novembro e janeiro. Mais do que uma nova identidade, reconstruí toda a comunicação da campanha com um foco claro: ser puramente varejista e próximo de quem faz o negócio acontecer no balcão da farmácia.</p><p>A partir de uma pesquisa de público, criei o mascote Zé da Sorte para dar rosto e voz à promoção. Para ganhar escala e profundidade visual, integrei inteligência artificial em todo o processo — Gemini, ChatGPT, Freepik e Adobe Firefly foram fundamentais para dar vida ao personagem e aos cenários.</p><p>O resultado é uma campanha com alma promocional, que fala a língua do balconista e quebra recordes históricos da campanha:</p><div class="stats"><strong>54</strong> redes e <strong>2.009</strong> lojas engajadas.<br><strong>7.724</strong> balconistas inscritos.<br><strong>+R$ 900 mil</strong> em prêmios.</div><p>Abaixo você consegue ver um pouco da entrega e da reformulação.</p></div><div class="case-label">ANTES E DEPOIS</div><div class="compare-grid"><figure class="compare-item"><span class="compare-tag">ANTES</span><img src="assets/verao-premiado/01-1.png" alt="Antes"></figure><figure class="compare-item"><span class="compare-tag">DEPOIS</span><img src="assets/verao-premiado/01.gif" alt="Depois"></figure></div><div class="case-label">CAMPANHA E DESDOBRAMENTOS</div><div class="case-grid"><img src="assets/verao-premiado/01-2.png"><img src="assets/verao-premiado/02.png"><img src="assets/verao-premiado/03.png"><img src="assets/verao-premiado/04.png"><img src="assets/verao-premiado/05.png"></div>`}else if(p.type==='keune'){mc.innerHTML=`<h2>Keune Black Friday</h2><div class="modal-meta"><span>CLIENTE — KEUNE</span><span>ANO — 2024</span><span>FUNÇÃO — DIREÇÃO DE ARTE · VISUAL PRINCIPAL</span></div><div class="case-copy"><p>Direção visual para Black Friday com linguagem premium e arquitetura preparada para diferentes formatos e pontos de contato da campanha.</p></div><div class="case-label">PEÇAS E DESDOBRAMENTOS</div><div class="case-grid"><img src="assets/Keune/3%5BKEUNE%5D%20PE%C3%87A%20PARA%20SAL%C3%83O.jpg"><img src="assets/Keune/KV%20NOVO2.0%20-%20KEUNE.jpg"><img src="assets/Keune/Feed%201080%20x%201080.jpg"><img src="assets/Keune/op02.jpg"><img src="assets/Keune/op03.jpg"><img src="assets/Keune/op6.jpg"><img class="wide" src="assets/Keune/Captura%20de%20Tela%202024-08-06%20a%CC%80s%2016.21.18.png"></div>`}else{mc.innerHTML=`<h2>${p.t}</h2><div class="modal-meta"><span>CLIENTE — ${p.c}</span><span>ANO — ${p.y}</span><span>FUNÇÃO — ${p.r}</span></div><div class="case-copy"><p>${p.d}</p></div>`}mc.querySelectorAll('.modal-meta,.case-hero,.case-copy,.case-label,.case-grid img,.compare-item').forEach(e=>e.classList.add('reveal'));setupReveals(mc);modal.classList.add('open');document.body.style.overflow='hidden'});document.getElementById('close').onclick=()=>{modal.classList.remove('open');document.body.style.overflow=''};document.addEventListener('keydown',e=>{if(e.key==='Escape')document.getElementById('close').click()});const ws=[...document.querySelectorAll('.hero-word')];let wi=0;if(!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(()=>{ws[wi].classList.remove('is-active');wi=(wi+1)%ws.length;ws[wi].classList.add('is-active')},2400);addEventListener('load',()=>setTimeout(()=>document.getElementById('boot').classList.add('off'),800));

(function(){
  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='/emoji-drag.css?v=2';
  document.head.appendChild(css);

  function initEmojiDrag(){
    const layer=document.querySelector('.hero-emoji-layer');
    if(!layer)return;
    const emojis=[...layer.querySelectorAll('.hero-emoji')];

    function clampEmoji(el){
      if(!el.dataset.dragged)return;
      const lr=layer.getBoundingClientRect();
      const r=el.getBoundingClientRect();
      const maxX=Math.max(8,lr.width-r.width-8);
      const maxY=Math.max(8,lr.height-r.height-8);
      const x=Math.max(8,Math.min(maxX,parseFloat(el.style.left)||8));
      const y=Math.max(8,Math.min(maxY,parseFloat(el.style.top)||8));
      el.style.left=x+'px';
      el.style.top=y+'px';
    }

    emojis.forEach(el=>{
      let drag=null;

      function freezeVisualPosition(){
        const lr=layer.getBoundingClientRect();
        const r=el.getBoundingClientRect();
        el.style.left=(r.left-lr.left)+'px';
        el.style.top=(r.top-lr.top)+'px';
        el.style.right='auto';
        el.style.bottom='auto';
      }

      el.addEventListener('pointerdown',e=>{
        if(e.pointerType==='mouse'&&e.button!==0)return;
        e.preventDefault();
        freezeVisualPosition();
        el.dataset.dragged='1';
        el.classList.add('dragging');
        el.setPointerCapture(e.pointerId);
        const r=el.getBoundingClientRect();
        drag={id:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top};
      });

      el.addEventListener('pointermove',e=>{
        if(!drag||drag.id!==e.pointerId)return;
        e.preventDefault();
        const lr=layer.getBoundingClientRect();
        const w=el.offsetWidth,h=el.offsetHeight;
        const x=Math.max(8,Math.min(lr.width-w-8,e.clientX-lr.left-drag.dx));
        const y=Math.max(8,Math.min(lr.height-h-8,e.clientY-lr.top-drag.dy));
        el.style.left=x+'px';
        el.style.top=y+'px';
      });

      function finish(e){
        if(!drag||(e.pointerId!==undefined&&drag.id!==e.pointerId))return;
        el.classList.remove('dragging');
        drag=null;
      }
      el.addEventListener('pointerup',finish);
      el.addEventListener('pointercancel',finish);
      el.addEventListener('lostpointercapture',finish);

      el.addEventListener('dblclick',()=>{
        el.removeAttribute('style');
        delete el.dataset.dragged;
      });
    });

    let resizeTimer;
    addEventListener('resize',()=>{
      clearTimeout(resizeTimer);
      resizeTimer=setTimeout(()=>emojis.forEach(clampEmoji),100);
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initEmojiDrag,{once:true});
  else initEmojiDrag();
})();
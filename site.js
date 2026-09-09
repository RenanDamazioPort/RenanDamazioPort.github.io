async function hydrate(){
  for(const el of document.querySelectorAll('[data-b64]')){
    try{
      const raw=(await fetch(el.dataset.b64,{cache:'no-store'}).then(r=>{
        if(!r.ok)throw new Error(`asset ${r.status}`);
        return r.text();
      })).trim().replace(/\s+/g,'');
      const mime=raw.startsWith('UklGR')?'image/webp':raw.startsWith('iVBOR')?'image/png':raw.startsWith('/9j/')?'image/jpeg':'image/webp';
      const binary=atob(raw);
      const bytes=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
      const url=URL.createObjectURL(new Blob([bytes],{type:mime}));
      el.addEventListener('load',()=>URL.revokeObjectURL(url),{once:true});
      el.src=url;
    }catch(e){
      console.warn('Falha ao carregar imagem',el.dataset.b64,e);
    }
  }
}
hydrate();

function setupReveals(scope=document){
  const els=[...scope.querySelectorAll('.reveal')];
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    els.forEach(e=>e.classList.add('is-visible'));
    return;
  }
  const o=new IntersectionObserver(es=>es.forEach(x=>{
    if(x.isIntersecting){
      x.target.classList.add('is-visible');
      o.unobserve(x.target);
    }
  }),{threshold:.12});
  els.forEach(e=>o.observe(e));
}

document.querySelectorAll('.section-head,.project,.about-grid,.contact-body,.hero-copy,.hero-cta').forEach(e=>e.classList.add('reveal'));
setupReveals();

const projects={
  verao:{n:'02',type:'verao'},
  keune:{n:'04',type:'keune'}
};

const modal=document.getElementById('modal');
const mc=document.getElementById('modalContent');
const mn=document.getElementById('modalNum');

document.querySelectorAll('button.project').forEach(b=>b.onclick=()=>{
  if(b.classList.contains('project-coming'))return;
  const p=projects[b.dataset.id];
  if(!p)return;

  mn.textContent='PROJETO / '+p.n;

  if(p.type==='verao'){
    mc.innerHTML=`<h2>Verão Premiado</h2><div class="modal-meta"><span>CLIENTE — FEBRAFAR</span><span>ANO — 2026</span><span>FUNÇÃO — DIREÇÃO DE ARTE</span></div><figure class="case-hero"><img src="assets/verao-premiado/Proposta%20de%20KV.png" alt="Verão Premiado"></figure><div class="case-copy"><div class="credits"><div><strong>Cliente:</strong> Febrafar</div><div><strong>Redação:</strong> David Douglas</div><div><strong>Direção de Arte:</strong> Renan Damazio</div></div><p>Finalizei o rebranding completo do Verão Premiado 2026, um projeto de alcance nacional que esteve no ar entre novembro e janeiro. Mais do que uma nova identidade, reconstruí toda a comunicação da campanha com um foco claro: ser puramente varejista e próximo de quem faz o negócio acontecer no balcão da farmácia.</p><p>A partir de uma pesquisa de público, criei o mascote Zé da Sorte para dar rosto e voz à promoção. Para ganhar escala e profundidade visual, integrei inteligência artificial em todo o processo — Gemini, ChatGPT, Freepik e Adobe Firefly foram fundamentais para dar vida ao personagem e aos cenários.</p><p>O resultado é uma campanha com alma promocional, que fala a língua do balconista e quebra recordes históricos da campanha:</p><div class="stats"><strong>54</strong> redes e <strong>2.009</strong> lojas engajadas.<br><strong>7.724</strong> balconistas inscritos.<br><strong>+R$ 900 mil</strong> em prêmios.</div><p>Abaixo você consegue ver um pouco da entrega e da reformulação.</p></div><div class="case-label">ANTES E DEPOIS</div><div class="compare-grid"><figure class="compare-item"><span class="compare-tag">ANTES</span><img src="assets/verao-premiado/01-1.png" alt="Antes"></figure><figure class="compare-item"><span class="compare-tag">DEPOIS</span><img src="assets/verao-premiado/01.gif" alt="Depois"></figure></div><div class="case-label">CAMPANHA E DESDOBRAMENTOS</div><div class="case-grid"><img src="assets/verao-premiado/01-2.png"><img src="assets/verao-premiado/02.png"><img src="assets/verao-premiado/03.png"><img src="assets/verao-premiado/04.png"><img src="assets/verao-premiado/05.png"></div>`;
  }else if(p.type==='keune'){
    mc.innerHTML=`<h2>Keune Black Friday</h2><div class="modal-meta"><span>CLIENTE — KEUNE</span><span>ANO — 2024</span><span>FUNÇÃO — DIREÇÃO DE ARTE · VISUAL PRINCIPAL</span></div><div class="case-copy keune-intro"><p>Direção visual para Black Friday com linguagem premium e arquitetura preparada para diferentes formatos e pontos de contato da campanha.</p></div><div class="case-label">SISTEMA VISUAL E DESDOBRAMENTOS</div><div class="keune-case"><figure class="keune-piece keune-kv reveal"><figcaption class="keune-piece-label"><span>01 / KEY VISUAL</span><span>BLACK FRIDAY</span></figcaption><img src="assets/Keune/KV%20NOVO2.0%20-%20KEUNE.jpg" alt="Key visual Keune Black Friday"></figure><div class="keune-duo"><figure class="keune-piece reveal"><figcaption class="keune-piece-label"><span>02 / PEÇA PARA SALÃO</span><span>PDV</span></figcaption><img src="assets/Keune/3%5BKEUNE%5D%20PE%C3%87A%20PARA%20SAL%C3%83O.jpg" alt="Peça para salão Keune"></figure><figure class="keune-piece reveal"><figcaption class="keune-piece-label"><span>03 / SOCIAL</span><span>FEED</span></figcaption><img src="assets/Keune/Feed%201080%20x%201080.jpg" alt="Peça de feed Keune"></figure></div><div class="case-label">EXPLORAÇÕES VISUAIS</div><div class="keune-mosaic"><figure class="keune-piece reveal"><figcaption class="keune-piece-label"><span>04 / ESTUDO</span><span>A</span></figcaption><img src="assets/Keune/op02.jpg" alt="Estudo visual Keune 01"></figure><figure class="keune-piece reveal"><figcaption class="keune-piece-label"><span>05 / ESTUDO</span><span>B</span></figcaption><img src="assets/Keune/op03.jpg" alt="Estudo visual Keune 02"></figure><figure class="keune-piece reveal"><figcaption class="keune-piece-label"><span>06 / ESTUDO</span><span>C</span></figcaption><img src="assets/Keune/op6.jpg" alt="Estudo visual Keune 03"></figure></div><figure class="keune-piece keune-wide reveal"><figcaption class="keune-piece-label"><span>07 / APLICAÇÃO</span><span>DESDOBRAMENTO</span></figcaption><img src="assets/Keune/Captura%20de%20Tela%202024-08-06%20a%CC%80s%2016.21.18.png" alt="Aplicação da campanha Keune"></figure></div>`;
  }

  mc.querySelectorAll('.modal-meta,.case-hero,.case-copy,.case-label,.case-grid img,.compare-item').forEach(e=>e.classList.add('reveal'));
  setupReveals(mc);
  modal.classList.add('open');
  document.body.style.overflow='hidden';
});

document.getElementById('close').onclick=()=>{
  modal.classList.remove('open');
  document.body.style.overflow='';
};

document.addEventListener('keydown',e=>{
  if(e.key==='Escape')document.getElementById('close').click();
});

const ws=[...document.querySelectorAll('.hero-word')];
let wi=0;
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  setInterval(()=>{
    ws[wi].classList.remove('is-active');
    wi=(wi+1)%ws.length;
    ws[wi].classList.add('is-active');
  },2400);
}

addEventListener('load',()=>setTimeout(()=>document.getElementById('boot').classList.add('off'),800));
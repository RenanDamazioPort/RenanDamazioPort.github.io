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
    mc.innerHTML=`<h2>Verão Premiado</h2><div class="modal-meta"><span>CLIENTE — FEBRAFAR</span><span>ANO — 2026</span><span>FUNÇÃO — DIREÇÃO DE ARTE</span></div><figure class="case-hero"><img src="assets/verao-premiado/Proposta%20de%20KV.png" alt="Verão Premiado"></figure><div class="case-copy"><div class="credits"><div><strong>Cliente:</strong> Febrafar</div><div><strong>Redação:</strong> David Douglas</div><div><strong>Direção de Arte:</strong> Renan Damazio</div></div><p>Finalizei o rebranding completo do Verão Premiado 2026, um projeto de alcance nacional que esteve no ar entre novembro e janeiro. Mais do que uma nova identidade, reconstruí toda a comunicação da campanha com um foco claro: ser puramente varejista e próximo de quem faz o negócio acontecer no balcão da farmácia.</p><p>A partir de uma pesquisa de público, criei o mascote Zé da Sorte para dar rosto e voz à promoção. Para ganhar escala e profundidade visual, integrei inteligência artificial em todo o processo — Gemini, ChatGPT, Freepik e Adobe Firefly foram fundamentais para dar vida ao personagem e aos cenários.</p><p>O resultado é uma campanha com alma promocional, que fala a língua do balconista e quebra recordes históricos da campanha:</p><div class="stats"><strong>54</strong> redes e <strong>2.009</strong> lojas engajadas.<br><strong>7.724</strong> balconistas inscritos.<br><strong>+R$ 900 mil</strong> em prêmios.</div><p>Abaixo você consegue ver um pouco da entrega e da reformulação.</p></div><div class="case-label">ANTES E DEPOIS</div><div class="compare-grid"><figure class="compare-item"><span class="compare-tag">ANTES</span><img src="assets/verao-premiado/01-1.png" alt="Antes"></figure><figure class="compare-item"><span class="compare-tag">DEPOIS</span><img src="assets/verao-premiado/01.gif" alt="Depois"></figure></div><div class="case-label">CAMPANHA E DESDOBRAMENTOS</div><div class="case-grid"><img src="assets/verao-premiado/01-2.png"><img src="assets/verao-premiado/02.png"><img src="assets/verao-premiado/03.png"><img src="assets/verao-premiado/04.png"></div><section class="ze-section"><div class="case-label">O ZÉ DA SORTE</div><div class="ze-head"><h3>Quem vende<br>precisava<br>se ver na<br>campanha.</h3><div class="ze-why"><p>O Verão Premiado roda desde 2023, mas nunca tinha tido um rosto. A comunicação falava de prêmios e pontos — e quem faz a promoção acontecer, o balconista, não se enxergava nela.</p><p>O Zé nasceu de uma pesquisa de público e foi desenhado à imagem desse balconista: jaleco, sorriso fácil, cerca de 30 anos, o tipo de pessoa que resolve o problema do cliente e ainda traz boa notícia. Os óculos escuros fazem a ponte com o verão.</p><p>Ele foi desenvolvido inteiramente com IA — Gemini, ChatGPT, Freepik e Adobe Firefly — com um cuidado central: manter o personagem idêntico em qualquer cena, pose ou formato.</p></div></div><ul class="ze-pillars"><li><span>01</span><strong>Identificação</strong>Inspirado no balconista de farmácia, quem está na linha de frente do cuidado com o cliente.</li><li><span>02</span><strong>Proximidade</strong>Fala simples e direta, como um colega de balcão — não como uma marca.</li><li><span>03</span><strong>Consistência</strong>Mesmo rosto, jaleco e alto astral em todas as peças, do KV às lives.</li></ul><div class="ze-poses"><figure class="ze-pose"><div class="ze-pose-img"><img src="assets/verao-premiado/case/pose-coracao.webp" alt="Zé da Sorte — Coração" loading="lazy"></div><figcaption>Coração</figcaption></figure><figure class="ze-pose"><div class="ze-pose-img"><img src="assets/verao-premiado/case/pose-cracha.webp" alt="Zé da Sorte — Crachá" loading="lazy"></div><figcaption>Crachá</figcaption></figure><figure class="ze-pose"><div class="ze-pose-img"><img src="assets/verao-premiado/case/pose-torneira.webp" alt="Zé da Sorte — Chuva de prêmios" loading="lazy"></div><figcaption>Chuva de prêmios</figcaption></figure><figure class="ze-pose"><div class="ze-pose-img"><img src="assets/verao-premiado/case/pose-notebook.webp" alt="Zé da Sorte — Acompanhando os resultados" loading="lazy"></div><figcaption>Acompanhando os resultados</figcaption></figure><figure class="ze-pose"><div class="ze-pose-img"><img src="assets/verao-premiado/case/pose-inverno.webp" alt="Zé da Sorte — Versão inverno" loading="lazy"></div><figcaption>Versão inverno</figcaption></figure></div><div class="ze-result"><p class="ze-result-lead">Com o Zé como porta-voz, a campanha virou conversa de balcão — e bateu recordes históricos:</p><div class="ze-stats"><div><strong>7.724</strong><span>balconistas inscritos</span></div><div><strong>2.009</strong><span>lojas engajadas</span></div><div><strong>54</strong><span>redes participantes</span></div><div><strong>+R$ 900 mil</strong><span>em prêmios</span></div></div><p class="ze-result-note">Primeiro mascote da história da promoção, o Zé se tornou a cara do Verão Premiado: estrelou lives, comunicados e peças das indústrias parceiras — e ganhou até roupa de frio quando reformulei também o Inverno Premiado.</p></div><div class="vp-wide"><figure class="vp-piece" style="flex:1.7778 1 0"><img src="assets/verao-premiado/case/mascote-proposta.jpg" alt="Proposta de mascote Zé da Sorte" loading="lazy"></figure></div><div class="case-label">O ZÉ EM CENA</div></section><div class="vp-row"><figure class="vp-piece" style="flex:1.0000 1 0"><img src="assets/verao-premiado/case/feed-mergulhar-surf.jpg" alt="Zé surfando — Prontos para mergulhar nesse mar de prêmios?" loading="lazy"></figure><figure class="vp-piece" style="flex:1.0000 1 0"><img src="assets/verao-premiado/case/feed-mergulhar-praia.jpg" alt="Zé na toalha de praia — anúncio da campanha" loading="lazy"></figure><figure class="vp-piece" style="flex:1.0000 1 0"><img src="assets/verao-premiado/case/feed-pe-na-areia.jpg" alt="Inscrições abertas — Coloque o pé na areia" loading="lazy"></figure></div><div class="vp-row"><figure class="vp-piece" style="flex:1.0000 1 0"><img src="assets/verao-premiado/case/feed-aperte-os-cintos.jpg" alt="Zé no avião — Aperte os cintos" loading="lazy"></figure><figure class="vp-piece" style="flex:1.0000 1 0"><img src="assets/verao-premiado/case/feed-sede-de-premios.jpg" alt="Zé e a torneira de moedas — Está com sede de prêmios?" loading="lazy"></figure><figure class="vp-piece" style="flex:1.0000 1 0"><img src="assets/verao-premiado/case/feed-ultimos-dias.jpg" alt="Zé deitado na areia de moedas — Últimos dias" loading="lazy"></figure></div><div class="vp-row"><figure class="vp-piece" style="flex:0.8668 1 0"><img src="assets/verao-premiado/case/feed-bau-do-tesouro.jpg" alt="Zé cavando o baú do tesouro — Seu projeto verão" loading="lazy"></figure><figure class="vp-piece" style="flex:1.0000 1 0"><img src="assets/verao-premiado/case/feed-conte-sua-experiencia.jpg" alt="Zé convidando a gravar vídeo — Conte sua experiência" loading="lazy"></figure></div><div class="case-label">LIVES E COMUNICADOS PARA AS REDES</div><p class="vp-note">Toda a jornada da promoção — lançamento, lives de treinamento, painéis de acompanhamento e reta final — ganhou peças próprias, mantendo o mascote e o sistema visual em cada ponto de contato.</p><div class="vp-row"><figure class="vp-piece" style="flex:1.0000 1 0"><img src="assets/verao-premiado/case/live-termometro.jpg" alt="Live de lançamento — O termômetro da sorte" loading="lazy"></figure><figure class="vp-piece" style="flex:1.0000 1 0"><img src="assets/verao-premiado/case/live-sorte-a-vista.jpg" alt="Live — Sorte à vista" loading="lazy"></figure><figure class="vp-piece" style="flex:1.0000 1 0"><img src="assets/verao-premiado/case/live-farmes.jpg" alt="Live exclusiva Rede Farmes" loading="lazy"></figure></div><div class="vp-row"><figure class="vp-piece" style="flex:1.0000 1 0"><img src="assets/verao-premiado/case/live-acervo.jpg" alt="Acervo de lives no Orion" loading="lazy"></figure><figure class="vp-piece" style="flex:0.8169 1 0"><img src="assets/verao-premiado/case/feed-power-bi.jpg" alt="Painéis de acompanhamento no Power BI" loading="lazy"></figure></div><div class="case-label">MARCAS PARTICIPANTES</div><p class="vp-note">Peças para a indústria parceira: cada marca ganhou uma chamada temática de verão, com os produtos no cenário de praia e as moedas como assinatura da premiação.</p><div class="vp-row"><figure class="vp-piece" style="flex:1.0000 1 0"><img src="assets/verao-premiado/case/marca-legrand.jpg" alt="Legrand — Equilíbrio interno para curtir o verão" loading="lazy"></figure><figure class="vp-piece" style="flex:1.0000 1 0"><img src="assets/verao-premiado/case/marca-farmax.jpg" alt="Farmax — Onda de hidratação e proteção máxima" loading="lazy"></figure><figure class="vp-piece" style="flex:1.0000 1 0"><img src="assets/verao-premiado/case/marca-principia.jpg" alt="Principia — A saúde de férias das preocupações" loading="lazy"></figure><figure class="vp-piece" style="flex:1.0000 1 0"><img src="assets/verao-premiado/case/marca-kenvue.jpg" alt="Kenvue — Pele protegida, sem sombra de dúvidas" loading="lazy"></figure></div><div class="case-label">WALLPAPER</div><div class="vp-wide"><figure class="vp-piece"><img src="assets/verao-premiado/case/wallpaper.jpg" alt="Wallpaper Verão Premiado com o Zé da Sorte na praia" loading="lazy"></figure></div><div class="vp-talk reveal"><h3>Quer ver o próximo?</h3><nav class="vp-talk-links"><a class="is-main" href="https://wa.me/5511994064761" target="_blank" rel="noopener">WHATSAPP ↗</a><a href="https://www.linkedin.com/in/reenandamazio/" target="_blank" rel="noopener">LINKEDIN ↗</a><a href="https://www.instagram.com/nan.damazio/" target="_blank" rel="noopener">INSTAGRAM ↗</a></nav></div><div class="vp-next"><span>RENAN DAMAZIO · DIRETOR DE ARTE</span><button type="button" onclick="document.getElementById('close').click();document.getElementById('work').scrollIntoView()">VER TODOS OS PROJETOS →</button></div>`;
  }else if(p.type==='keune'){
    mc.innerHTML=`<h2>Keune Black Friday</h2><div class="modal-meta"><span>CLIENTE — KEUNE</span><span>ANO — 2024</span><span>FUNÇÃO — DIREÇÃO DE ARTE · VISUAL PRINCIPAL</span></div><div class="case-copy keune-intro"><p>Direção visual para Black Friday com linguagem premium e arquitetura preparada para diferentes formatos e pontos de contato da campanha.</p></div><div class="case-label">SISTEMA VISUAL E DESDOBRAMENTOS</div><div class="keune-case"><figure class="keune-piece keune-kv reveal"><figcaption class="keune-piece-label"><span>01 / KEY VISUAL</span><span>BLACK FRIDAY</span></figcaption><img src="assets/Keune/KV%20NOVO2.0%20-%20KEUNE.jpg" alt="Key visual Keune Black Friday"></figure><div class="keune-duo"><figure class="keune-piece reveal"><figcaption class="keune-piece-label"><span>02 / PEÇA PARA SALÃO</span><span>PDV</span></figcaption><img src="assets/Keune/3%5BKEUNE%5D%20PE%C3%87A%20PARA%20SAL%C3%83O.jpg" alt="Peça para salão Keune"></figure><figure class="keune-piece reveal"><figcaption class="keune-piece-label"><span>03 / SOCIAL</span><span>FEED</span></figcaption><img src="assets/Keune/Feed%201080%20x%201080.jpg" alt="Peça de feed Keune"></figure></div><div class="case-label">EXPLORAÇÕES VISUAIS</div><div class="keune-mosaic"><figure class="keune-piece reveal"><figcaption class="keune-piece-label"><span>04 / ESTUDO</span><span>A</span></figcaption><img src="assets/Keune/op02.jpg" alt="Estudo visual Keune 01"></figure><figure class="keune-piece reveal"><figcaption class="keune-piece-label"><span>05 / ESTUDO</span><span>B</span></figcaption><img src="assets/Keune/op03.jpg" alt="Estudo visual Keune 02"></figure><figure class="keune-piece reveal"><figcaption class="keune-piece-label"><span>06 / ESTUDO</span><span>C</span></figcaption><img src="assets/Keune/op6.jpg" alt="Estudo visual Keune 03"></figure></div><figure class="keune-piece keune-wide reveal"><figcaption class="keune-piece-label"><span>07 / APLICAÇÃO</span><span>DESDOBRAMENTO</span></figcaption><img src="assets/Keune/Captura%20de%20Tela%202024-08-06%20a%CC%80s%2016.21.18.png" alt="Aplicação da campanha Keune"></figure></div>`;
  }

  mc.querySelectorAll('.modal-meta,.case-hero,.case-copy,.case-label,.case-grid img,.compare-item,.vp-piece,.vp-note,.ze-head,.ze-pillars li,.ze-pose,.ze-result').forEach(e=>e.classList.add('reveal'));
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
(function(){
  var root=document.querySelector('.home-glitch-bg');
  if(!root||matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var layer=document.createElement('div'); layer.className='gw-layer'; root.appendChild(layer);
  var lines=[
    'const kv = render("campanha", { formato: "16:9" });',
    'brand.system.load("identidade_visual");',
    'if (ideia.boa) { execucao.start(); }',
    'import { tipografia, grid, paleta } from "./direcao-de-arte";',
    'campanha.push(new KeyVisual("verao_premiado"));',
    'await ia.generate({ prompt: briefing.conceito });',
    'layout.align("center").compose(pecas);',
    'export default function Portfolio() { return <Cases /> }',
    'storytelling.map(cena => roteiro.add(cena));',
    '// TODO: aprovar KV_final_v3 com o cliente',
    'moodboard.filter(ref => ref.match(conceito));',
    'pdv.deploy({ loja: "sp", pecas: 12 });',
    'while (!aprovado) { alteracao++; }',
    'git commit -m "arte final (final mesmo)"',
    'renan.damazio --role diretor_de_arte --city sp',
    'motion.timeline().from(logo, { opacity: 0 });',
    'export(kv, { png: true, cmyk: false });',
    'const conceito = briefing.insight + marca.voz;'
  ];
  var blocks=[
    ['> init director_of_art --user "renan.damazio"','  loading modules ............ <span class="k">OK</span>','  > branding.sys               [<span class="k">OK</span>]','  > key_visuals.pkg            [<span class="k">OK</span>]'],
    ['> compiling cases ....','  > juros_jitsu.png','  > verao_premiado.png','  > off_the_map.gif','  rendering ......... <span class="k">READY</span>'],
    ['> ia_generativa.run()','  model: nano_banana / gemini','  seed: 0x7F3A  steps: 40','  output -> kv_rascunho_04.png'],
    ['> npm run campanha','  build: 12 pecas / 3 formatos','  feed .... <span class="k">OK</span>   stories .... <span class="k">OK</span>','  done in 2.4s'],
    ['<span class="c">/* direcao_de_arte.css */</span>','.kv { grid: 12col; }','.titulo { font: 900 96px/0.9; }','.cta { color: var(--marca); }']
  ];
  function r(a,b){return a+Math.random()*(b-a)}
  function esc(t){return t.replace(/&/g,'&amp;').replace(/</g,'&lt;')}
  function booting(){var b=document.getElementById('boot');return !!(b&&!b.classList.contains('off'))}
  function blocked(x,y){
    if(booting()) return true;
    var el=document.elementFromPoint(x,y);
    return !!(el&&el.closest&&el.closest('img,video,picture,.visual,.project-title,.hero-name,.case-hero,.compare-item,a,button,p,h1,h2,h3'));
  }
  function place(e,extraUp){
    var w=e.offsetWidth,h=e.offsetHeight+(extraUp||0);
    for(var i=0;i<14;i++){
      var x=r(8,Math.max(10,innerWidth-w-8)),y=r(80,Math.max(90,innerHeight-h-10));
      var ok=true;
      for(var a=0;a<=5&&ok;a++)for(var c=0;c<=4;c++){if(blocked(x+4+(w-8)*a/5,y-26+(h+52)*c/4)){ok=false;break}}
      if(ok){e.style.left=x+'px';e.style.top=(y+(extraUp||0))+'px';return true}
    }
    return false;
  }
  function typeLine(){
    if(document.hidden) return;
    var txt=lines[Math.floor(Math.random()*lines.length)];
    var e=document.createElement('div'); e.className='gw-line'; e.style.visibility='hidden';
    e.textContent=txt; layer.appendChild(e);
    if(!place(e)){e.remove();return}
    e.innerHTML=''; e.style.visibility='';
    var i=0,isC=txt.indexOf('//')===0;
    (function step(){
      i+=1+Math.floor(Math.random()*2);
      var t=esc(txt.slice(0,i));
      e.innerHTML=(isC?'<span class="c">'+t+'</span>':t)+'<span class="cur"></span>';
      if(i<txt.length) setTimeout(step,r(18,45));
      else setTimeout(function(){e.classList.add('out');e.addEventListener('animationend',function(){e.remove()},{once:true})},r(700,1400));
    })();
  }
  function riseBlock(){
    if(document.hidden) return;
    var b=blocks[Math.floor(Math.random()*blocks.length)];
    var e=document.createElement('div'); e.className='gw-block'; e.style.visibility='hidden';
    e.innerHTML=b.join('\n'); e.style.animation='none'; layer.appendChild(e);
    if(!place(e,70)){e.remove();return}
    e.style.visibility=''; e.style.animation=''; e.style.setProperty('--life',r(3.5,5.5).toFixed(1)+'s');
    e.addEventListener('animationend',function(){e.remove()},{once:true});
  }
  (function loopL(){setTimeout(function(){typeLine();loopL()},r(1300,2800))})();
  (function loopB(){setTimeout(function(){riseBlock();loopB()},r(3500,7000))})();
  setTimeout(riseBlock,3000);
})();

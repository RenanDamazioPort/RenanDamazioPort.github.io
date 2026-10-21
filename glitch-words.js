(function(){
  var root=document.querySelector('.home-glitch-bg');
  if(!root||matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var layer=document.createElement('div'); layer.className='gw-layer'; root.appendChild(layer);
  var words=['DIREÇÃO DE ARTE','KEY VISUAL','BRANDING','CONCEITO','CAMPANHA','IDENTIDADE VISUAL','TIPOGRAFIA','LAYOUT',
    'STORYTELLING','BRIEFING','MOODBOARD','GRID','PALETA','COMPOSIÇÃO','CRIAÇÃO','IA GENERATIVA','PDV','MOTION','RENDER','ROTEIRO',
    'BOAS IDEIAS PRIMEIRO','EXECUÇÃO LOGO DEPOIS','KV_FINAL_v3','ARTE_APROVADA','ALTERAÇÃO_FINAL_FINAL'];
  function r(a,b){return a+Math.random()*(b-a)}
  function blocked(x,y){
    var el=document.elementFromPoint(x,y);
    return !!(el&&el.closest&&el.closest('img,video,picture,canvas:not(.tech-network),.visual,.project-title,.hero-name,.case-hero,.compare-item,a,button,p,h1,h2,h3'));
  }
  function place(e,mob){
    var w=e.offsetWidth,h=e.offsetHeight;
    for(var i=0;i<14;i++){
      var x=r(8,Math.max(10,innerWidth-w-8)),y=r(70,Math.max(80,innerHeight-h-10));
      var pts=[[x+4,y+h/2],[x+w/2,y+h/2],[x+w-4,y+h/2],[x+w/4,y+4],[x+w*.75,y+h-4]],ok=true;
      for(var j=0;j<pts.length;j++){if(blocked(pts[j][0],pts[j][1])){ok=false;break}}
      if(ok){e.style.left=x+'px';e.style.top=y+'px';return true}
    }
    return false;
  }
  function spawn(){
    if(document.hidden) return;
    var e=document.createElement('div'), mob=innerWidth<620, big=Math.random()<.35;
    e.className='gw'+(big?' big':'');
    e.textContent=words[Math.floor(Math.random()*words.length)];
    var size=big?r(mob?28:44,mob?44:92):r(mob?11:13,mob?15:20);
    e.style.fontSize=size+'px';
    e.style.visibility='hidden';
    e.style.setProperty('--life',r(.55,1.05).toFixed(2)+'s');
    e.style.setProperty('--gw-o',big?r(.10,.2).toFixed(2):r(.5,.8).toFixed(2));
    if(Math.random()<.3) e.style.setProperty('--gw-c','#f5f2e9');
    layer.appendChild(e);
    if(!place(e,mob)){e.remove();return;}
    e.style.visibility='';
    e.addEventListener('animationend',function(){e.remove()},{once:true});
  }
  (function loop(){setTimeout(function(){spawn();if(Math.random()<.3)setTimeout(spawn,140);loop()},r(900,2400))})();
})();

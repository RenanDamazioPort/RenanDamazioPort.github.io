(function(){
  var intro=document.getElementById('intro'); if(!intro) return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){intro.remove();return;}
  var lines=[
    '> init director_of_art --user "renan.damazio"',
    '  loading modules ............ <span class="hl">OK</span>',
    '  > campanhas_publicitarias.kv  [nubank, febrafar]',
    '  > key_visuals.pkg             [<span class="hl">OK</span>]',
    '  > branding.sys                [<span class="hl">OK</span>]',
    '  > varejo_pdv.dll              [<span class="hl">OK</span>]',
    '  > ia_generativa.ai            [nano_banana, gemini]',
    '  compiling cases ....',
    '  > juros_jitsu.png  > verao_premiado.png  > vans.jpg',
    '  rendering portfolio ......... <span class="hl">READY</span>'
  ];
  var log=document.getElementById('intro-log'),fill=document.getElementById('intro-fill'),pct=document.getElementById('intro-pct');
  var DUR=3200,t0=null,shown=0,finished=false;
  function frame(t){
    if(finished) return;
    if(!t0) t0=t;
    var p=Math.min((t-t0)/DUR,1);
    var n=Math.floor(p*lines.length+.4);
    if(n!==shown){shown=n;log.innerHTML=lines.slice(0,n).join('\n')+'\n<span class="cur"></span>';}
    var v=Math.floor(p*100);
    fill.style.width='calc('+v+'% - 4px)';
    pct.textContent=v+'%';
    if(v>33) document.getElementById('intro-sq2').classList.add('on');
    if(v>66) document.getElementById('intro-sq3').classList.add('on');
    if(p<1) requestAnimationFrame(frame); else reveal();
  }
  function reveal(){
    if(finished) return; finished=true;
    pct.textContent='100%';
    intro.classList.add('show');
    setTimeout(close,1300);
  }
  function close(){
    intro.classList.add('done');
    setTimeout(function(){intro.remove();document.documentElement.style.overflow='';},750);
  }
  document.documentElement.style.overflow='hidden';
  document.getElementById('intro-skip').onclick=function(){finished=true;close();};
  setTimeout(function(){requestAnimationFrame(frame);},500);
})();

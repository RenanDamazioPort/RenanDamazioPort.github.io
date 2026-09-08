(()=>{
  const layer=document.querySelector('.hero-emoji-layer');
  if(!layer)return;
  const items=[...layer.querySelectorAll('.hero-emoji')];
  if(!items.length)return;

  let active=null;

  function freeze(el){
    const lr=layer.getBoundingClientRect();
    const r=el.getBoundingClientRect();
    el.style.setProperty('left',(r.left-lr.left)+'px','important');
    el.style.setProperty('top',(r.top-lr.top)+'px','important');
    el.style.setProperty('right','auto','important');
    el.style.setProperty('bottom','auto','important');
  }

  function start(e){
    const el=e.target.closest('.hero-emoji');
    if(!el||!layer.contains(el))return;
    if(e.pointerType==='mouse'&&e.button!==0)return;
    e.preventDefault();
    e.stopPropagation();
    freeze(el);
    const lr=layer.getBoundingClientRect();
    const r=el.getBoundingClientRect();
    active={
      el,
      pointerId:e.pointerId,
      offsetX:e.clientX-r.left,
      offsetY:e.clientY-r.top,
      layerRect:lr
    };
    el.classList.add('dragging');
    el.style.setProperty('animation','none','important');
    el.style.setProperty('transition','box-shadow .18s ease, border-color .18s ease, background .18s ease, transform .08s ease','important');
    document.documentElement.classList.add('emoji-drag-active');
    try{el.setPointerCapture(e.pointerId)}catch(_){ }
  }

  function move(e){
    if(!active||e.pointerId!==active.pointerId)return;
    e.preventDefault();
    const {el,layerRect,offsetX,offsetY}=active;
    const w=el.offsetWidth,h=el.offsetHeight;
    const pad=8;
    let x=e.clientX-layerRect.left-offsetX;
    let y=e.clientY-layerRect.top-offsetY;
    x=Math.max(pad,Math.min(x,layerRect.width-w-pad));
    y=Math.max(pad,Math.min(y,layerRect.height-h-pad));
    el.style.setProperty('left',x+'px','important');
    el.style.setProperty('top',y+'px','important');
    el.style.setProperty('right','auto','important');
    el.style.setProperty('bottom','auto','important');
    el.style.setProperty('transform','scale(1.08) rotate(0deg)','important');
  }

  function end(e){
    if(!active||e.pointerId!==active.pointerId)return;
    const el=active.el;
    try{el.releasePointerCapture(e.pointerId)}catch(_){ }
    el.classList.remove('dragging');
    el.style.setProperty('transform','none','important');
    el.style.setProperty('animation','none','important');
    document.documentElement.classList.remove('emoji-drag-active');
    active=null;
  }

  layer.style.pointerEvents='none';
  items.forEach(el=>{
    el.style.pointerEvents='auto';
    el.style.touchAction='none';
    el.style.userSelect='none';
    el.style.webkitUserSelect='none';
    el.setAttribute('draggable','false');
  });

  layer.addEventListener('pointerdown',start,true);
  document.addEventListener('pointermove',move,{capture:true,passive:false});
  document.addEventListener('pointerup',end,true);
  document.addEventListener('pointercancel',end,true);

  items.forEach(el=>el.addEventListener('dblclick',()=>{
    el.removeAttribute('style');
    el.style.pointerEvents='auto';
    el.style.touchAction='none';
    el.style.userSelect='none';
    el.style.webkitUserSelect='none';
  }));
})();
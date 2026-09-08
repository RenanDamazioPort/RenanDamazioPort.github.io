(()=>{
  const layer=document.querySelector('.hero-emoji-layer');
  if(!layer)return;
  const items=[...layer.querySelectorAll('.hero-emoji')];
  if(!items.length)return;

  let active=null;

  function clamp(v,min,max){return Math.max(min,Math.min(v,max));}

  function freeze(el){
    const lr=layer.getBoundingClientRect();
    const r=el.getBoundingClientRect();
    el.style.setProperty('position','absolute','important');
    el.style.setProperty('left',(r.left-lr.left)+'px','important');
    el.style.setProperty('top',(r.top-lr.top)+'px','important');
    el.style.setProperty('right','auto','important');
    el.style.setProperty('bottom','auto','important');
    el.style.setProperty('margin','0','important');
    el.style.setProperty('animation','none','important');
  }

  function begin(el,clientX,clientY,mode,id=null){
    freeze(el);
    const lr=layer.getBoundingClientRect();
    const r=el.getBoundingClientRect();
    active={
      el,
      mode,
      id,
      offsetX:clientX-r.left,
      offsetY:clientY-r.top,
      layerRect:lr
    };
    el.classList.add('dragging');
    el.style.setProperty('transform','scale(1.08) rotate(0deg)','important');
    el.style.setProperty('transition','box-shadow .18s ease,border-color .18s ease,background .18s ease,transform .08s ease','important');
    document.documentElement.classList.add('emoji-drag-active');
    document.body.style.setProperty('cursor','grabbing','important');
    document.body.style.setProperty('user-select','none','important');
    document.body.style.setProperty('-webkit-user-select','none','important');
  }

  function move(clientX,clientY){
    if(!active)return;
    const {el,layerRect,offsetX,offsetY}=active;
    const w=el.offsetWidth;
    const h=el.offsetHeight;
    const pad=8;
    const x=clamp(clientX-layerRect.left-offsetX,pad,layerRect.width-w-pad);
    const y=clamp(clientY-layerRect.top-offsetY,pad,layerRect.height-h-pad);
    el.style.setProperty('left',x+'px','important');
    el.style.setProperty('top',y+'px','important');
    el.style.setProperty('right','auto','important');
    el.style.setProperty('bottom','auto','important');
    el.style.setProperty('transform','scale(1.08) rotate(0deg)','important');
  }

  function finish(){
    if(!active)return;
    const el=active.el;
    el.classList.remove('dragging');
    el.style.setProperty('transform','none','important');
    el.style.setProperty('animation','none','important');
    document.documentElement.classList.remove('emoji-drag-active');
    document.body.style.removeProperty('cursor');
    document.body.style.removeProperty('user-select');
    document.body.style.removeProperty('-webkit-user-select');
    active=null;
  }

  function onMouseDown(e){
    if(e.button!==0)return;
    const el=e.currentTarget;
    e.preventDefault();
    e.stopPropagation();
    begin(el,e.clientX,e.clientY,'mouse');
  }

  function onMouseMove(e){
    if(!active||active.mode!=='mouse')return;
    e.preventDefault();
    move(e.clientX,e.clientY);
  }

  function onMouseUp(e){
    if(!active||active.mode!=='mouse')return;
    e.preventDefault();
    finish();
  }

  function onPointerDown(e){
    if(e.pointerType==='mouse')return;
    const el=e.currentTarget;
    e.preventDefault();
    e.stopPropagation();
    begin(el,e.clientX,e.clientY,'pointer',e.pointerId);
    try{el.setPointerCapture(e.pointerId)}catch(_){ }
  }

  function onPointerMove(e){
    if(!active||active.mode!=='pointer'||e.pointerId!==active.id)return;
    e.preventDefault();
    move(e.clientX,e.clientY);
  }

  function onPointerEnd(e){
    if(!active||active.mode!=='pointer'||e.pointerId!==active.id)return;
    try{active.el.releasePointerCapture(e.pointerId)}catch(_){ }
    finish();
  }

  items.forEach(el=>{
    el.style.setProperty('pointer-events','auto','important');
    el.style.setProperty('touch-action','none','important');
    el.style.setProperty('user-select','none','important');
    el.style.setProperty('-webkit-user-select','none','important');
    el.style.setProperty('-webkit-user-drag','none','important');
    el.setAttribute('draggable','false');

    el.addEventListener('mousedown',onMouseDown,{capture:true});
    el.addEventListener('pointerdown',onPointerDown,{capture:true,passive:false});
    el.addEventListener('dragstart',e=>e.preventDefault());
    el.addEventListener('selectstart',e=>e.preventDefault());

    el.addEventListener('dblclick',()=>{
      el.removeAttribute('style');
      el.style.pointerEvents='auto';
      el.style.touchAction='none';
      el.style.userSelect='none';
      el.style.webkitUserSelect='none';
      el.style.webkitUserDrag='none';
    });
  });

  window.addEventListener('mousemove',onMouseMove,{capture:true,passive:false});
  window.addEventListener('mouseup',onMouseUp,{capture:true,passive:false});
  window.addEventListener('blur',finish);

  window.addEventListener('pointermove',onPointerMove,{capture:true,passive:false});
  window.addEventListener('pointerup',onPointerEnd,{capture:true,passive:false});
  window.addEventListener('pointercancel',onPointerEnd,{capture:true,passive:false});

  document.addEventListener('selectstart',e=>{if(active)e.preventDefault();},{capture:true});
  document.addEventListener('dragstart',e=>{if(active)e.preventDefault();},{capture:true});
})();
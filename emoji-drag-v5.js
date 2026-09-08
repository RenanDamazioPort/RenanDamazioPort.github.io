(()=>{
  const layer=document.querySelector('.hero-emoji-layer');
  if(!layer)return;
  const items=[...layer.querySelectorAll('.hero-emoji')];
  if(!items.length)return;

  let active=null;
  const clamp=(v,min,max)=>Math.max(min,Math.min(v,max));

  function prepare(el){
    const lr=layer.getBoundingClientRect();
    const r=el.getBoundingClientRect();
    el.style.setProperty('position','absolute','important');
    el.style.setProperty('left',(r.left-lr.left)+'px','important');
    el.style.setProperty('top',(r.top-lr.top)+'px','important');
    el.style.setProperty('right','auto','important');
    el.style.setProperty('bottom','auto','important');
    el.style.setProperty('margin','0','important');
    el.style.setProperty('animation','none','important');
    el.style.setProperty('transition','none','important');
  }

  function moveActive(clientX,clientY){
    if(!active)return;
    const lr=layer.getBoundingClientRect();
    const {el,dx,dy}=active;
    const w=el.offsetWidth;
    const h=el.offsetHeight;
    const x=clamp(clientX-lr.left-dx,8,Math.max(8,lr.width-w-8));
    const y=clamp(clientY-lr.top-dy,8,Math.max(8,lr.height-h-8));
    el.style.setProperty('left',x+'px','important');
    el.style.setProperty('top',y+'px','important');
    el.style.setProperty('right','auto','important');
    el.style.setProperty('bottom','auto','important');
    el.style.setProperty('transform','scale(1.07)','important');
  }

  function endActive(){
    if(!active)return;
    const el=active.el;
    el.classList.remove('dragging');
    el.style.setProperty('transform','none','important');
    document.body.style.removeProperty('cursor');
    document.body.style.removeProperty('user-select');
    document.body.style.removeProperty('-webkit-user-select');
    active=null;
  }

  function resetEmoji(el){
    if(active&&active.el===el)endActive();
    el.classList.remove('dragging');
    ['position','left','top','right','bottom','margin','animation','transition','transform'].forEach(prop=>el.style.removeProperty(prop));
  }

  function startMouse(e){
    if(e.button!==0)return;
    const el=e.currentTarget;
    e.preventDefault();
    e.stopPropagation();
    prepare(el);
    const r=el.getBoundingClientRect();
    active={type:'mouse',el,dx:e.clientX-r.left,dy:e.clientY-r.top};
    el.classList.add('dragging');
    document.body.style.setProperty('cursor','grabbing','important');
    document.body.style.setProperty('user-select','none','important');
    document.body.style.setProperty('-webkit-user-select','none','important');
  }

  function moveMouse(e){
    if(!active||active.type!=='mouse')return;
    e.preventDefault();
    moveActive(e.clientX,e.clientY);
  }

  function endMouse(e){
    if(!active||active.type!=='mouse')return;
    if(e)e.preventDefault();
    endActive();
  }

  function startTouch(e){
    if(e.pointerType==='mouse')return;
    const el=e.currentTarget;
    e.preventDefault();
    e.stopPropagation();
    prepare(el);
    const r=el.getBoundingClientRect();
    active={type:'touch',el,id:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top};
    el.classList.add('dragging');
    try{el.setPointerCapture(e.pointerId)}catch(_){ }
  }

  function moveTouch(e){
    if(!active||active.type!=='touch'||active.id!==e.pointerId)return;
    e.preventDefault();
    moveActive(e.clientX,e.clientY);
  }

  function endTouch(e){
    if(!active||active.type!=='touch'||active.id!==e.pointerId)return;
    try{active.el.releasePointerCapture(e.pointerId)}catch(_){ }
    endActive();
  }

  items.forEach(el=>{
    el.style.setProperty('pointer-events','auto','important');
    el.style.setProperty('touch-action','none','important');
    el.style.setProperty('user-select','none','important');
    el.style.setProperty('-webkit-user-select','none','important');
    el.style.setProperty('-webkit-user-drag','none','important');
    el.setAttribute('draggable','false');

    el.addEventListener('mousedown',startMouse,false);
    el.addEventListener('pointerdown',startTouch,{passive:false});
    el.addEventListener('dragstart',e=>e.preventDefault());
    el.addEventListener('dblclick',e=>{
      e.preventDefault();
      e.stopPropagation();
      resetEmoji(el);
    });
  });

  document.addEventListener('mousemove',moveMouse,{capture:true,passive:false});
  document.addEventListener('mouseup',endMouse,{capture:true,passive:false});
  window.addEventListener('blur',endActive);
  document.addEventListener('pointermove',moveTouch,{capture:true,passive:false});
  document.addEventListener('pointerup',endTouch,{capture:true});
  document.addEventListener('pointercancel',endTouch,{capture:true});
})();

(()=>{
  if(!(window.matchMedia('(pointer:coarse)').matches||window.innerWidth<=900))return;
  if(document.querySelector('script[data-easter-mobile-fix]'))return;
  const s=document.createElement('script');
  s.src='/easter-mobile-fix.js?v=1';
  s.dataset.easterMobileFix='1';
  document.head.appendChild(s);
})();
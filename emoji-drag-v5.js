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

  function startMouse(e){
    if(e.button!==0)return;
    const el=e.currentTarget;
    e.preventDefault();
    e.stopPropagation();
    prepare(el);
    const r=el.getBoundingClientRect();
    active={
      type:'mouse',
      el,
      dx:e.clientX-r.left,
      dy:e.clientY-r.top
    };
    el.classList.add('dragging');
    document.body.style.setProperty('cursor','grabbing','important');
    document.body.style.setProperty('user-select','none','important');
  }

  function moveMouse(e){
    if(!active||active.type!=='mouse')return;
    e.preventDefault();
    const lr=layer.getBoundingClientRect();
    const {el,dx,dy}=active;
    const w=el.offsetWidth;
    const h=el.offsetHeight;
    const x=clamp(e.clientX-lr.left-dx,8,lr.width-w-8);
    const y=clamp(e.clientY-lr.top-dy,8,lr.height-h-8);
    el.style.setProperty('left',x+'px','important');
    el.style.setProperty('top',y+'px','important');
    el.style.setProperty('transform','scale(1.08)','important');
  }

  function endMouse(){
    if(!active||active.type!=='mouse')return;
    const el=active.el;
    el.classList.remove('dragging');
    el.style.setProperty('transform','none','important');
    document.body.style.removeProperty('cursor');
    document.body.style.removeProperty('user-select');
    active=null;
  }

  function startTouch(e){
    if(e.pointerType==='mouse')return;
    const el=e.currentTarget;
    e.preventDefault();
    prepare(el);
    const r=el.getBoundingClientRect();
    active={type:'touch',el,id:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top};
    el.classList.add('dragging');
    try{el.setPointerCapture(e.pointerId)}catch(_){ }
  }

  function moveTouch(e){
    if(!active||active.type!=='touch'||active.id!==e.pointerId)return;
    e.preventDefault();
    const lr=layer.getBoundingClientRect();
    const {el,dx,dy}=active;
    const w=el.offsetWidth;
    const h=el.offsetHeight;
    const x=clamp(e.clientX-lr.left-dx,8,lr.width-w-8);
    const y=clamp(e.clientY-lr.top-dy,8,lr.height-h-8);
    el.style.setProperty('left',x+'px','important');
    el.style.setProperty('top',y+'px','important');
  }

  function endTouch(e){
    if(!active||active.type!=='touch'||active.id!==e.pointerId)return;
    const el=active.el;
    try{el.releasePointerCapture(e.pointerId)}catch(_){ }
    el.classList.remove('dragging');
    active=null;
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
  });

  document.addEventListener('mousemove',moveMouse,{capture:true,passive:false});
  document.addEventListener('mouseup',endMouse,{capture:true});
  window.addEventListener('blur',endMouse);

  document.addEventListener('pointermove',moveTouch,{capture:true,passive:false});
  document.addEventListener('pointerup',endTouch,{capture:true});
  document.addEventListener('pointercancel',endTouch,{capture:true});

  items.forEach(el=>el.addEventListener('dblclick',()=>location.reload()));
})();
(()=>{
  const isMobile=window.matchMedia('(pointer:coarse)').matches||window.innerWidth<=900;
  if(!isMobile)return;
  const layer=document.querySelector('.hero-emoji-layer');
  if(!layer)return;

  let lock=false;
  const visible=()=>[...layer.querySelectorAll('.hero-emoji')].filter(el=>{
    const s=getComputedStyle(el),r=el.getBoundingClientRect();
    return s.display!=='none'&&r.width>0&&r.height>0;
  });

  function roughCircle(){
    const items=visible();
    if(items.length<4)return false;
    const lr=layer.getBoundingClientRect();
    const pts=items.map(el=>{
      const r=el.getBoundingClientRect();
      return{el,x:r.left-lr.left+r.width/2,y:r.top-lr.top+r.height/2};
    });
    const moved=items.filter(el=>/px$/.test(el.style.left||'')).length;
    if(moved<3)return false;

    const cx=pts.reduce((s,p)=>s+p.x,0)/pts.length;
    const cy=pts.reduce((s,p)=>s+p.y,0)/pts.length;
    const rs=pts.map(p=>Math.hypot(p.x-cx,p.y-cy));
    const mean=rs.reduce((a,b)=>a+b,0)/rs.length;
    const sd=Math.sqrt(rs.reduce((s,r)=>s+(r-mean)*(r-mean),0)/rs.length);
    const cv=mean?sd/mean:9;
    const angles=pts.map(p=>(Math.atan2(p.y-cy,p.x-cx)+Math.PI*2)%(Math.PI*2)).sort((a,b)=>a-b);
    const gaps=angles.map((a,i)=>((i===angles.length-1?angles[0]+Math.PI*2:angles[i+1])-a));
    const maxGap=Math.max(...gaps),minGap=Math.min(...gaps);
    const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);
    const bw=Math.max(...xs)-Math.min(...xs),bh=Math.max(...ys)-Math.min(...ys);
    const aspect=bh?bw/bh:9;

    return mean>58&&mean<Math.min(lr.width,lr.height)*.48&&cv<.48&&minGap>.12&&maxGap<2.45&&aspect>.42&&aspect<2.35;
  }

  function snapAndTrigger(){
    if(lock||document.getElementById('easterOverlay')?.classList.contains('open'))return;
    if(!roughCircle())return;
    lock=true;
    const items=visible();
    const lr=layer.getBoundingClientRect();
    const centers=items.map(el=>{
      const r=el.getBoundingClientRect();
      return{x:r.left-lr.left+r.width/2,y:r.top-lr.top+r.height/2,el};
    });
    const cx=Math.min(lr.width-90,Math.max(90,centers.reduce((s,p)=>s+p.x,0)/centers.length));
    const cy=Math.min(lr.height-90,Math.max(90,centers.reduce((s,p)=>s+p.y,0)/centers.length));
    const maxR=Math.min(lr.width,lr.height)*.40;
    const radius=Math.max(82,Math.min(118,maxR));
    const sorted=centers.sort((a,b)=>Math.atan2(a.y-cy,a.x-cx)-Math.atan2(b.y-cy,b.x-cx));
    const start=-Math.PI/2;

    sorted.forEach((p,i)=>{
      const a=start+(Math.PI*2*i/sorted.length);
      const el=p.el;
      const x=cx+Math.cos(a)*radius-el.offsetWidth/2;
      const y=cy+Math.sin(a)*radius-el.offsetHeight/2;
      el.style.setProperty('left',x+'px','important');
      el.style.setProperty('top',y+'px','important');
      el.style.setProperty('right','auto','important');
      el.style.setProperty('bottom','auto','important');
      el.style.setProperty('animation','none','important');
      el.style.setProperty('transition','left .22s ease,top .22s ease','important');
    });

    setTimeout(()=>{
      document.dispatchEvent(new MouseEvent('mouseup',{bubbles:true,cancelable:true,view:window}));
      setTimeout(()=>{lock=false},1200);
    },260);
  }

  document.addEventListener('pointerup',()=>setTimeout(snapAndTrigger,90),true);
  document.addEventListener('touchend',()=>setTimeout(snapAndTrigger,90),{capture:true,passive:true});
})();
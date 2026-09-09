(()=>{
  const card=document.querySelector('.project-coming');
  if(!card)return;

  const cover=card.querySelector('[data-vans-cover]');
  if(cover){
    const src=cover.dataset.vansCover;
    fetch(src,{cache:'no-store'})
      .then(r=>{if(!r.ok)throw new Error(`cover ${r.status}`);return r.text()})
      .then(raw=>{
        cover.src='data:image/webp;base64,'+raw.trim().replace(/\s+/g,'');
      })
      .catch(err=>console.warn('Falha ao carregar capa VANS × RPG',err));
  }

  let timer=null;
  card.onclick=(e)=>{
    e.preventDefault();
    e.stopPropagation();
    clearTimeout(timer);
    card.classList.remove('is-coming');
    void card.offsetWidth;
    card.classList.add('is-coming');
    timer=setTimeout(()=>card.classList.remove('is-coming'),1300);
  };
})();
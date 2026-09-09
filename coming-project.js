(()=>{
  const card=document.querySelector('.project-coming');
  if(!card)return;
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
(() => {
  const RANDOM_CHARS = '_!X$0-+*#';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const TARGETS = [
    'header .brand small',
    '.nav a',
    '.hero-top > span',
    '.hero-cta',
    '.section-head > span',
    '.project-title',
    '.project-meta',
    '.skills span',
    '.contact-links a',
    'footer span',
    '.modal-top > span',
    '.modal-top .close',
    '.modal-content .eyebrow',
    '.modal-content .meta',
    '.modal-content .stat span'
  ].join(',');

  const prepared = new WeakSet();
  const animated = new WeakSet();
  function randomChar(previous=''){let c=previous;while(c===previous)c=RANDOM_CHARS[Math.floor(Math.random()*RANDOM_CHARS.length)];return c}
  function scrambleChar(source,prev=''){return /\s/.test(source)?source:randomChar(prev)}
  function speedFor(el,len){const size=parseFloat(getComputedStyle(el).fontSize)||16;let speed=size>=22?16:22;if(len>30)speed=Math.min(speed,15);return speed}
  function durationFor(speed,length){return Math.max(360,Math.min(980,length*speed*2.75))}

  function animateChunk(chunk){
    if(!chunk||animated.has(chunk))return; animated.add(chunk);
    const text=chunk.dataset.specialText||''; if(!text.trim())return;
    const speed=speedFor(chunk,text.length),duration=durationFor(speed,text.length),phaseOneEnd=.34,start=performance.now();let lastPaint=0;
    chunk.classList.add('special-text-running');
    function render(now){
      if(now-lastPaint<speed){requestAnimationFrame(render);return} lastPaint=now;
      const progress=Math.min(1,(now-start)/duration),chars=new Array(text.length);
      if(progress<phaseOneEnd){
        const local=progress/phaseOneEnd,activeLength=Math.max(1,Math.ceil(text.length*local));let prev='';
        for(let i=0;i<text.length;i++){if(i<activeLength){chars[i]=scrambleChar(text[i],prev);prev=chars[i]}else chars[i]=/\s/.test(text[i])?text[i]:'\u00A0'}
      }else{
        const local=(progress-phaseOneEnd)/(1-phaseOneEnd),revealed=Math.floor(text.length*local);let prev='';
        for(let i=0;i<text.length;i++){if(i<revealed){chars[i]=text[i];prev=chars[i]}else if(i===revealed&&!/\s/.test(text[i]||'')){chars[i]=Math.floor(local*text.length*2)%2===0?'_':randomChar(prev);prev=chars[i]}else{chars[i]=scrambleChar(text[i],prev);prev=chars[i]}}
      }
      chunk.textContent=chars.join('');
      if(progress<1)requestAnimationFrame(render);else{chunk.textContent=text;chunk.classList.remove('special-text-running');chunk.classList.add('special-text-done')}
    }
    requestAnimationFrame(render);
  }

  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;observer.unobserve(entry.target);window.setTimeout(()=>animateChunk(entry.target),Number(entry.target.dataset.specialDelay||0))}),{rootMargin:'0px 0px -8% 0px',threshold:.12});

  function wrapTextNode(node,index){
    const text=node.nodeValue||'';if(!text.trim())return null;
    const parentElement=node.parentElement;if(!parentElement)return null;
    const fontSize=parseFloat(getComputedStyle(parentElement).fontSize)||16;
    const isMobile=window.innerWidth<=820;
    if(fontSize>30)return null;
    if(isMobile&&fontSize>18)return null;
    const range=document.createRange();range.selectNodeContents(node);const width=range.getBoundingClientRect().width;
    const span=document.createElement('span');span.className='special-text-chunk';span.dataset.specialText=text;span.dataset.specialDelay=String((index%5)*28);span.textContent=text;
    if(!isMobile&&width>0&&text.length<=44)span.style.minWidth=`${Math.ceil(width)}px`;
    node.replaceWith(span);observer.observe(span);return span;
  }

  function prepareElement(element){
    if(!element||prepared.has(element))return;
    if(element.closest('.hero-emoji-layer,.easter-overlay,.boot'))return;
    const fontSize=parseFloat(getComputedStyle(element).fontSize)||16;
    if(fontSize>30)return;
    if(window.innerWidth<=820&&fontSize>18)return;
    prepared.add(element);
    if(!element.hasAttribute('aria-label')){const label=(element.innerText||element.textContent||'').replace(/\s+/g,' ').trim();if(label)element.setAttribute('aria-label',label)}
    const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT,{acceptNode(node){if(!node.nodeValue||!node.nodeValue.trim())return NodeFilter.FILTER_REJECT;const parent=node.parentElement;if(!parent||parent.classList.contains('special-text-chunk'))return NodeFilter.FILTER_REJECT;if(parent.closest('.hero-emoji-layer,.easter-overlay,.boot'))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT}});
    const nodes=[];let current;while((current=walker.nextNode()))nodes.push(current);nodes.forEach((node,index)=>wrapTextNode(node,index));
  }
  function scan(root=document){if(root.matches?.(TARGETS))prepareElement(root);root.querySelectorAll?.(TARGETS).forEach(prepareElement)}
  function init(){scan(document);const modal=document.getElementById('modalContent');if(modal)new MutationObserver(()=>scan(modal)).observe(modal,{childList:true,subtree:true})}
  setTimeout(init,900);
})();
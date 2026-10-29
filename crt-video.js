/* Keep CRT texture outside native and embedded video players. */
(function(){
  var root=document.documentElement,pending=false,last='',players=[];
  var selector='video,iframe[src*="youtube.com"],iframe[src*="youtube-nocookie.com"],iframe[src*="youtu.be"],iframe[src*="vimeo.com"]';
  var resize=typeof ResizeObserver==='function'?new ResizeObserver(schedule):null;
  function discover(){players=Array.from(document.querySelectorAll(selector));if(resize){resize.disconnect();resize.observe(document.body);players.forEach(function(p){resize.observe(p)})}schedule()}
  function schedule(){if(!pending){pending=true;requestAnimationFrame(update)}}
  function update(){
    pending=false;
    var w=root.clientWidth,h=window.innerHeight,holes=[];
    players.forEach(function(player){
      if(!player.getClientRects().length)return;
      if(player.checkVisibility&&!player.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))return;
      var box=player.getBoundingClientRect();
      var left=Math.max(0,box.left),top=Math.max(0,box.top),right=Math.min(w,box.right),bottom=Math.min(h,box.bottom);
      if(right<=left||bottom<=top)return;
      holes.push('<rect x="'+left.toFixed(2)+'" y="'+top.toFixed(2)+'" width="'+(right-left).toFixed(2)+'" height="'+(bottom-top).toFixed(2)+'" fill="black"/>');
    });
    var key=w+','+h+holes.join('');
    if(key===last)return;last=key;
    if(!holes.length){root.style.removeProperty('--crt-video-mask');return}
    var svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'"><defs><mask id="cut" maskUnits="userSpaceOnUse" x="0" y="0" width="'+w+'" height="'+h+'"><rect width="'+w+'" height="'+h+'" fill="white"/>'+holes.join('')+'</mask></defs><rect width="'+w+'" height="'+h+'" fill="white" mask="url(#cut)"/></svg>';
    root.style.setProperty('--crt-video-mask','url("data:image/svg+xml,'+encodeURIComponent(svg)+'")');
  }
  window.addEventListener('scroll',schedule,{passive:true,capture:true});
  window.addEventListener('resize',schedule,{passive:true});
  document.addEventListener('transitionend',schedule,true);
  document.addEventListener('fullscreenchange',schedule);
  document.addEventListener('load',schedule,true);
  new MutationObserver(function(records){if(records.some(function(r){return r.type==='childList'}))discover();else schedule()}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','src']});
  discover();
})();
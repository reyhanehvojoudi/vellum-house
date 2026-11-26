(() => {
  'use strict';
  const main=document.querySelector('main'), home=document.getElementById('home-views');
  const dialog=document.getElementById('language-dialog'), dismiss=document.getElementById('dismiss-language');
  const lang=document.documentElement.lang, fa=lang==='fa', reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const video=document.getElementById('intro-film'), toggle=document.getElementById('film-toggle');
  let loaded=document.readyState==='complete'; window.addEventListener('load',()=>{loaded=true;updateFilm();},{once:true});
  const blocked=()=>reduced.matches||navigator.connection?.saveData||['slow-2g','2g','3g'].includes(navigator.connection?.effectiveType);
  // Keep the first paint light: the poster is shown immediately and the
  // large film is fetched shortly after the interface becomes usable.
  video.setAttribute('preload','none');
  const journey=document.getElementById('journey'), routeClip=journey.querySelector('#route-clip rect');
  if(!journey.querySelector('.journey-back')){
    const back=document.createElement('a');back.className='journey-back';back.href='#intro';back.textContent=fa?'بازگشت به ابتدا':'Back to the beginning';
    journey.querySelector('.journey').prepend(back);
  }
  const mast=document.querySelector('.mast');new ResizeObserver(()=>document.documentElement.style.setProperty('--mast-height',mast.offsetHeight+'px')).observe(mast);
  const cache=new Map([['home',home]]);
  const aliases={method:'journey',approach:'journey',pathways:'journey',services:'journey',people:'founders',about:'founders',consultation:'consult',terms:'intro'};
  let view='', stage=0, bookingModule, chosen=false, switching=false, manualPause=false, canSeeFilm=false, animation;
  let filmWarmupTimer=0;
  const read=k=>{try{return sessionStorage.getItem(k);}catch(_){return null;}};
  function write(k,v){try{if(v===null)sessionStorage.removeItem(k);else sessionStorage.setItem(k,v);}catch(_){}}
  function booking(){return bookingModule ||= import('./booking.js?v=11').catch(err=>{bookingModule=null;throw err;});}
  function filmButton() {
    const label=video.paused?(fa?'پخش ویدئو':'Play film'):(fa?'توقف ویدئو':'Pause film');
    toggle.setAttribute('aria-label',label);toggle.title=label;
    toggle.dataset.playing=String(!video.paused);toggle.firstElementChild.textContent='';
  }
  function playVideo() {
    if(!loaded||blocked()||document.hidden||!canSeeFilm||document.body.classList.contains('journey-scene'))return;
    if (!video.getAttribute('src')) {
      const small=matchMedia('(max-width: 780px)').matches || navigator.connection?.saveData;
      video.src=small ? video.dataset.srcSmall : video.dataset.src;
      video.load();
    }
    video.muted=true;
    const attempt=()=>video.play().catch(filmButton);
    if(video.readyState>=2) attempt();
    else video.addEventListener('canplay',attempt,{once:true});
  }
  function updateFilm() {
    if (!loaded || blocked() || document.body.classList.contains('journey-scene') || !chosen || dialog.open || document.hidden || view!=='home' || !canSeeFilm || manualPause || reduced.matches) {video.pause();return;}
    playVideo();
  }
  toggle.addEventListener('click',()=>{
    if(video.paused){manualPause=false;playVideo();}else{manualPause=true;video.pause();}
  });
  video.addEventListener('playing',()=>video.classList.add('playing'));
  for(const event of ['play','pause','error'])video.addEventListener(event,filmButton);
  new IntersectionObserver(entries=>{canSeeFilm=entries[0].isIntersecting;updateFilm();},{threshold:.12}).observe(video);
  document.addEventListener('visibilitychange',updateFilm);
  reduced.addEventListener('change',updateFilm);
  function showStage(index) {
    const nodes=[...journey.querySelectorAll('[data-stage]')];
    if (!nodes[index]) return;
    stage=index;
    nodes.forEach((node,i)=>{node.setAttribute('aria-pressed',String(i===index));node.classList.toggle('passed',i<index);});
    journey.querySelectorAll('[data-stage-copy]').forEach((article,i)=>{article.hidden=i!==index;});
    journey.querySelectorAll('[data-delta]').forEach(btn=>{btn.disabled=!nodes[index+Number(btn.dataset.delta)];});
    cancelAnimationFrame(animation);
    const from=Number(routeClip.getAttribute('width')),to=Number(nodes[index].dataset.x);
    if(reduced.matches || from===to){routeClip.setAttribute('width',to);return;}
    const start=performance.now();
    function draw(now){
      const fraction=Math.min(1,(now-start)/420);
      routeClip.setAttribute('width',from+(to-from)*(1-(1-fraction)**3));
      if(fraction<1)animation=requestAnimationFrame(draw);
    }
    animation=requestAnimationFrame(draw);
  }
  function scrollHome(name,animate=false) {
    const y=name==='journey'?journey.getBoundingClientRect().top+scrollY-document.querySelector('.mast').offsetHeight:0;
    window.scrollTo({top:y,behavior:animate && !reduced.matches?'smooth':'instant'});
  }
  // Keep the home experience to one viewport: wheel and swipe gestures
  // transition between the introduction and the journey scene.
  let touchStart=0,gestureLocked=false;
  function sceneStep(direction){
    if(view!=='home' || !chosen || dialog.open || gestureLocked)return;
    const next=direction>0?'journey':'intro';
    if(location.hash!==`#${next}`){gestureLocked=true;history.pushState(null,'',`#${next}`);route(true,true);setTimeout(()=>gestureLocked=false,650);}
  }
  window.addEventListener('wheel',event=>{if(view!=='home'||!chosen||dialog.open||Math.abs(event.deltaY)<8)return;const active=document.querySelector(document.body.classList.contains('journey-scene')?'#journey':'#intro');if(active&&((event.deltaY>0&&active.scrollTop+active.clientHeight<active.scrollHeight-2)||(event.deltaY<0&&active.scrollTop>2)))return;event.preventDefault();sceneStep(event.deltaY);},{passive:false});
  window.addEventListener('touchstart',event=>{touchStart=event.touches[0].clientY;},{passive:true});
  window.addEventListener('touchend',event=>{const delta=touchStart-event.changedTouches[0].clientY;if(Math.abs(delta)>36){const active=home.querySelector(document.body.classList.contains('journey-scene')?'#journey':'#intro');if((delta>0&&active.scrollTop+active.clientHeight>=active.scrollHeight-2)||(delta<0&&active.scrollTop<=2))sceneStep(delta);}},{passive:true});
  function markNav(name) {
    document.querySelectorAll('.mast a[href^="#"]').forEach(a=>{
      const match=a.hash==='#'+name || (name==='calendar' && a.hash==='#consult');
      if(match)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
  }
  function route(focus=true,animate=false) {
    const [raw,key='']=location.hash.slice(1).split('/');
    const name=aliases[raw] || raw || 'intro';
    const page=['consult','calendar','founders','contact'].includes(name)?name:name==='privacy'?'consult':'home';
    if(!cache.has(page))cache.set(page,document.getElementById('view-'+page).content.firstElementChild.cloneNode(true));
    if(view!==page){view=page;main.replaceChildren(cache.get(page));main.dataset.view=page;document.body.classList.toggle('home-lock',page==='home');updateFilm();}
    document.body.classList.toggle('journey-scene',page==='home' && name==='journey');
    updateFilm();
    home.querySelector('#intro').inert=name==='journey'&&page==='home'; journey.inert=name!=='journey';
    markNav(page==='home'?'intro':page);
    if(page==='home'){
      if(focus && name==='journey')journey.focus({preventScroll:true});
      else if(focus)main.focus({preventScroll:true});
      if(name!=='journey') requestAnimationFrame(()=>{if(view==='home')scrollHome('intro',animate);});
    } else {
      if(focus)main.focus({preventScroll:true});
      window.scrollTo({top:0,behavior:'instant'});
    }
    if(page==='consult'){
      let draft;
      try{draft=JSON.parse(read('vh-language-draft'));}catch(_){}
      write('vh-language-draft',null);window.VellumEducation.hydrate(main.querySelector('form'),draft);
      if(name==='privacy')main.querySelector('details').open=true;
    }
    if(page==='calendar')booking().then(m=>{if(view==='calendar')m.openCalendar(key);}).catch(()=>{
      if(view==='calendar')document.getElementById('calendar-area').textContent=fa?'بارگیری تقویم ممکن نشد. صفحه را دوباره باز کنید.':'The calendar could not load. Please reload.';
    });
  }
  const track=new IntersectionObserver(entries=>{
    const entry=entries[0];if(view!=='home' || !chosen || dialog.open)return;
    journey.classList.toggle('in-view',entry.isIntersecting);
    if(entry.isIntersecting && entry.intersectionRatio>=.35 && location.hash!=='#journey')history.replaceState(null,'','#journey');
    else if(!entry.isIntersecting && entry.boundingClientRect.top>0 && location.hash==='#journey')history.replaceState(null,'','#intro');
  },{threshold:[0,.35,.65]});track.observe(journey);
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href="#intro"],a[href="#journey"]');
    if(!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)return;
    event.preventDefault();
    if(location.hash!==link.hash)history.pushState(null,'',link.hash);
    route(true,true);
  });
  main.addEventListener('click',event=>{
    const node=event.target.closest('button');if(!node || !journey.contains(node))return;
    if(node.hasAttribute('data-stage'))showStage(Number(node.dataset.stage));
    if(node.hasAttribute('data-delta'))showStage(stage+Number(node.dataset.delta));
  });
  journey.addEventListener('keydown',event=>{
    if(!['ArrowRight','ArrowLeft'].includes(event.key))return;
    event.preventDefault();showStage(stage+(event.key===(fa?'ArrowLeft':'ArrowRight')?1:-1));
    journey.querySelector('[data-stage="'+stage+'"]').focus({preventScroll:true});
  });
  main.addEventListener('submit',async e=>{
    if(e.target.id!=='enquiry-form')return;e.preventDefault();
    const form=e.target;
    try{await (await booking()).submitEnquiry(form);}catch(_){
      const s=form.querySelector('#enquiry-status');s.className='status error';s.textContent=fa?'ثبت درخواست تأیید نشد. دوباره تلاش کنید.':'We could not verify your enquiry. Please try again.';
    }
  });
  function reveal(){
    chosen=true;document.documentElement.classList.add('language-chosen');
    filmButton();
    clearTimeout(filmWarmupTimer);
    filmWarmupTimer=setTimeout(()=>{if(chosen && !document.hidden)updateFilm();},900);
  }
  function openChooser(first) {
    dismiss.hidden=first;dialog.classList.remove('leaving');dialog.showModal();video.pause();
    dialog.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));
    dialog.querySelector('[data-lang="'+lang+'"]').focus({preventScroll:true});
  }
  function choose(choice) {
    if(switching)return;switching=true;try{localStorage.setItem('vh-lang',choice)}catch(_){}document.cookie='vh-lang='+choice+'; Max-Age=31536000; Path=/; SameSite=Lax';dialog.classList.add('leaving');
    const finish=()=>{
      if(choice!==lang){
        const form=main.querySelector('#enquiry-form');
        if(form){const data=Object.fromEntries(new FormData(form));delete data.website;write('vh-language-draft',JSON.stringify(data));}
        const url=new URL(choice==='fa'?'index.html':'en.html',location.href);
        url.search=location.search;url.hash=location.hash;location.assign(url.href);return;
      }
      dialog.close();switching=false;const first=!chosen;reveal();
      (first?main:document.getElementById('language-control')).focus({preventScroll:true});
    };
    setTimeout(finish,reduced.matches?0:230);
  }
  dialog.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.lang)));
  dialog.addEventListener('click',e=>{if(e.target===dialog&&chosen)choose(lang);});
  dismiss.addEventListener('click',()=>choose(lang));
  dialog.addEventListener('cancel',e=>{e.preventDefault();if(chosen)choose(lang);});
  document.getElementById('language-control').addEventListener('click',()=>openChooser(false));
  document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();main.focus();});
  window.addEventListener('hashchange',()=>route());
  const previous=window.vhInitialLanguage;
  if(previous && previous!==lang && !/\/(en|index)\.html$/.test(location.pathname)){
    const url=new URL(previous==='en'?'en.html':'index.html',location.href);url.search=location.search;url.hash=location.hash;location.replace(url.href);return;
  }
  const warm=()=>{if(!blocked())booking().catch(()=>{});};document.querySelectorAll('a[href="#consult"]').forEach(a=>{a.addEventListener('pointerenter',warm,{once:true});a.addEventListener('touchstart',warm,{once:true,passive:true});});
  showStage(0);route(false);
  if(previous)reveal();else openChooser(true);
})();

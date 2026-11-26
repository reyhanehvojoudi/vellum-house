(() => {
  'use strict';
  const main=document.querySelector('main'), home=document.getElementById('home-views');
  const dialog=document.getElementById('language-dialog'), dismiss=document.getElementById('dismiss-language');
  const lang=document.documentElement.lang, fa=lang==='fa', reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const video=document.getElementById('intro-film'), toggle=document.getElementById('film-toggle');
  window.addEventListener('load',updateFilm,{once:true});
  const blocked=()=>reduced.matches||navigator.connection?.saveData||['slow-2g','2g','3g'].includes(navigator.connection?.effectiveType);
  // Keep the first paint light: the poster is shown immediately and the
  // large film is fetched shortly after the interface becomes usable.
  video.setAttribute('preload','none');
  const journey=document.getElementById('journey'); let stageMotion=0; const pathMetrics=new WeakMap();
  if(!journey.querySelector('.journey-back')){
    const back=document.createElement('a');back.className='journey-back';back.href='#intro';back.textContent=fa?'بازگشت به ابتدا':'Back to the beginning';
    journey.querySelector('.journey').prepend(back);
  }
  const mast=document.querySelector('.mast'), menu=mast.querySelector('.menu-toggle'), nav=mast.querySelector('nav'), closeButton=nav.querySelector('.menu-close');
  const shade=document.createElement('button');shade.className='menu-shade';shade.type='button';shade.hidden=true;shade.tabIndex=-1;shade.setAttribute('aria-label',fa?'بستن منو':'Close menu');mast.append(shade);
  const closeMenu=(focus=false)=>{if(!mast.classList.contains('menu-open'))return;mast.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');nav.inert=true;shade.hidden=true;main.inert=false;if(focus)menu.focus();};
  nav.inert=true;menu.addEventListener('click',()=>{if(mast.classList.contains('menu-open'))return closeMenu(true);mast.classList.add('menu-open');menu.setAttribute('aria-expanded','true');nav.inert=false;shade.hidden=false;main.inert=true;closeButton.focus();});closeButton.addEventListener('click',()=>closeMenu(true));shade.addEventListener('click',()=>closeMenu(true));nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
  document.addEventListener('keydown',e=>{if(!mast.classList.contains('menu-open'))return;if(e.key==='Escape'){e.preventDefault();closeMenu(true);}if(e.key==='Tab'){const items=[...nav.querySelectorAll('button,a[href]')];if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0].focus();}}});
  new ResizeObserver(()=>document.documentElement.style.setProperty('--mast-height',mast.offsetHeight+'px')).observe(mast);
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
  const portraitMedia=matchMedia('(max-width:700px) and (orientation:portrait)');
  function updatePoster(){video.poster=portraitMedia.matches?video.dataset.posterSmall:video.dataset.poster;}
  function ensureVideo(){const src=portraitMedia.matches?video.dataset.srcSmall:video.dataset.src;if(video.getAttribute('src')!==src){video.classList.remove('playing');video.setAttribute('src',src);video.load();}video.muted=true;}
  updatePoster();portraitMedia.addEventListener('change',()=>{updatePoster();if(video.getAttribute('src')){video.pause();video.classList.remove('playing');video.removeAttribute('src');video.load();updateFilm();}});
  function playVideo(manual=false){if(!manual&&(!chosen||blocked()||document.hidden||!canSeeFilm||view!=='home'||document.body.classList.contains('journey-scene')||manualPause||dialog.open))return;ensureVideo();video.play().catch(filmButton);}
  function updateFilm(){if(!chosen||dialog.open||document.hidden||view!=='home'||!canSeeFilm||manualPause||document.body.classList.contains('journey-scene')){video.pause();return;}if(!blocked())playVideo();}
  toggle.addEventListener('click',()=>{if(video.paused){manualPause=false;playVideo(true);}else{manualPause=true;video.pause();}});
  video.addEventListener('playing',()=>video.classList.add('playing'));
  for(const event of ['play','pause','error'])video.addEventListener(event,filmButton);
  new IntersectionObserver(entries=>{canSeeFilm=entries[0].isIntersecting;updateFilm();},{threshold:.12}).observe(video);
  document.addEventListener('visibilitychange',updateFilm);
  reduced.addEventListener('change',updateFilm);
  // The exact cubic endpoints define both the milestone coordinates and the painted segments.
  function metricsFor(p){let m=pathMetrics.get(p);if(m)return m;const svg=p.ownerSVGElement,box=svg.viewBox.baseVal,nums=p.getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number);let x=nums[0],y=nums[1];const points=[[x,y]],segments=[];for(let j=2;j<nums.length;j+=6){const seg=nums.slice(j,j+6),line=document.createElementNS('http://www.w3.org/2000/svg','path');line.setAttribute('class','route-segment');line.setAttribute('d',`M${x} ${y} C${seg.join(' ')}`);line.setAttribute('visibility','hidden');svg.insertBefore(line,svg.querySelector('.route-light'));segments.push({line,length:line.getTotalLength()});[x,y]=seg.slice(4);points.push([x,y]);}const mobile=svg.classList.contains('mobile');journey.querySelectorAll('[data-stage]').forEach((node,i)=>{node.style.setProperty(mobile?'--mx':'--x',100*(points[i][0]-box.x)/box.width+'%');node.style.setProperty(mobile?'--my':'--y',100*(points[i][1]-box.y)/box.height+'%');});m={points,segments};pathMetrics.set(p,m);return m;}
  function drawPath(fraction){for(const svg of journey.querySelectorAll('.royal-route')){if(!svg.isConnected||getComputedStyle(svg).display==='none'||!svg.getBoundingClientRect().width)continue;const p=svg.querySelector('.route-fill'),light=svg.querySelector('.route-light'),m=metricsFor(p),current=Math.min(5,Math.max(0,fraction)),lo=Math.floor(current),t=current-lo;for(const [i,{line,length}] of m.segments.entries()){if(i<lo){line.setAttribute('visibility','visible');line.style.strokeDasharray='none';line.style.strokeDashoffset='0';}else if(i===lo&&t>0){line.setAttribute('visibility','visible');line.style.strokeDasharray=`${length} ${length}`;line.style.strokeDashoffset=String(length*(1-t));}else line.setAttribute('visibility','hidden');}const pt=t>0?m.segments[lo].line.getPointAtLength(m.segments[lo].length*t):{x:m.points[lo][0],y:m.points[lo][1]};light.setAttribute('cx',pt.x);light.setAttribute('cy',pt.y);svg.classList.add('ready');}}
  function showStage(index,manual=false){const nodes=[...journey.querySelectorAll('[data-stage]')];if(!nodes[index])return;const from=stageMotion;stage=index;nodes.forEach((node,i)=>{node.setAttribute('aria-pressed',String(i===index));node.classList.toggle('passed',i<index);});journey.querySelectorAll('[data-stage-copy]').forEach((article,i)=>{article.hidden=i!==index;});journey.querySelectorAll('[data-delta]').forEach(btn=>{btn.disabled=!nodes[index+Number(btn.dataset.delta)];});cancelAnimationFrame(animation);if(reduced.matches||from===index){stageMotion=index;drawPath(index);}else{const start=performance.now();function draw(now){const fraction=Math.min(1,(now-start)/620);stageMotion=from+(index-from)*(1-(1-fraction)**3);drawPath(stageMotion);if(fraction<1)animation=requestAnimationFrame(draw);}animation=requestAnimationFrame(draw);}}
  window.addEventListener('resize',()=>{if(document.body.classList.contains('journey-scene'))drawPath(stageMotion);});reduced.addEventListener('change',()=>{cancelAnimationFrame(animation);stageMotion=stage;drawPath(stage);});
  function scrollHome(name,animate=false) {
    const y=0;
    window.scrollTo({top:y,behavior:animate && !reduced.matches?'smooth':'instant'});
  }
  // The thread is the navigation; native scrolling remains available for keyboard / zoom.
  let touchStart=null, gestureLocked=false;
  journey.addEventListener('touchstart',e=>{touchStart=[e.touches[0].clientX,e.touches[0].clientY];},{passive:true});
  journey.addEventListener('touchend',e=>{if(!touchStart)return;const dx=e.changedTouches[0].clientX-touchStart[0],dy=e.changedTouches[0].clientY-touchStart[1];touchStart=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4)showStage(stage+(dx*(fa?1:-1)>0?1:-1),true);},{passive:true});
  function sceneStep(direction){if(!chosen||dialog.open||gestureLocked)return;const next=direction>0?'journey':'intro';if(view!=='home'||location.hash===`#${next}`)return;gestureLocked=true;navigate(`#${next}`);setTimeout(()=>gestureLocked=false,850);}
  main.addEventListener('wheel',e=>{if(view!=='home'||Math.abs(e.deltaY)<18||dialog.open)return;const bottom=main.scrollTop+main.clientHeight>=main.scrollHeight-2;const top=main.scrollTop<=0;if((e.deltaY>0&&bottom&&!document.body.classList.contains('journey-scene'))||(e.deltaY<0&&top&&document.body.classList.contains('journey-scene'))){e.preventDefault();sceneStep(e.deltaY);}},{passive:false});
  let sceneTouch;main.addEventListener('touchstart',e=>{sceneTouch=[e.touches[0].clientX,e.touches[0].clientY];},{passive:true});main.addEventListener('touchend',e=>{if(!sceneTouch||view!=='home')return;const dx=e.changedTouches[0].clientX-sceneTouch[0],dy=e.changedTouches[0].clientY-sceneTouch[1];sceneTouch=null;if(Math.abs(dy)<75||Math.abs(dy)<Math.abs(dx)*1.5)return;const bottom=main.scrollTop+main.clientHeight>=main.scrollHeight-3,top=main.scrollTop<=0;if(dy<0&&bottom&&!document.body.classList.contains('journey-scene'))sceneStep(1);else if(dy>0&&top&&document.body.classList.contains('journey-scene'))sceneStep(-1);},{passive:true});
  const names=fa?['آغاز','مسیر همراهی','درباره ما','مشاوره']:['Home','Approach','About Us','Consultation'];
  const indexOf=(hash)=>{const raw=hash.replace(/^#/, '').split('/')[0];const n=aliases[raw]||raw;return n==='journey'?1:n==='founders'?2:['consult','calendar','contact','privacy'].includes(n)?3:0};
  const numeral=n=>String(n).padStart(2,'0').replace(/\d/g,d=>fa?'۰۱۲۳۴۵۶۷۸۹'[Number(d)]:d);
  let currentLeaf=0, transitionTimer, transitionEnd, moving=false;
  const sweep=document.querySelector('.thread-sweep');
  function updateSpine(){currentLeaf=indexOf(location.hash);document.body.style.setProperty('--progress',(currentLeaf+1)/4);const count=`${numeral(currentLeaf+1)} / ${numeral(4)}`;document.querySelector('.spine-index').textContent=count;document.querySelector('.footer-index').textContent=count;document.querySelector('.spine-name').textContent=names[currentLeaf];}
  function animateRoute(apply,next){clearTimeout(transitionTimer);clearTimeout(transitionEnd);main.getAnimations().forEach(a=>a.cancel());if(reduced.matches){moving=false;apply();return;}moving=true;main.animate([{opacity:1},{opacity:0}],{duration:300,easing:'ease-in-out',fill:'forwards'});transitionTimer=setTimeout(()=>{main.getAnimations().forEach(a=>a.cancel());apply();main.animate([{opacity:0},{opacity:1}],{duration:360,easing:'ease-out'});},300);transitionEnd=setTimeout(()=>{main.getAnimations().forEach(a=>a.cancel());moving=false;},680);}
  function navigate(hash){if(moving||hash===location.hash)return;animateRoute(()=>{history.pushState(null,'',hash);route(true);},indexOf(hash));}
  function setupForm(form){if(form.dataset.ready)return;form.dataset.ready='yes';const phone=form.elements.phone;function validate(){const value=phone.value.trim(),digits=value.replace(/[^0-9۰-۹٠-٩]/g,'');phone.setCustomValidity(!value||(/^\+?[0-9۰-۹٠-٩ ()\-]+$/.test(value)&&digits.length>=6&&digits.length<=18)?'':(fa?'لطفاً شمارهٔ تماس معتبری وارد کنید.':'Enter a valid phone number.'));}phone.addEventListener('input',validate);phone.addEventListener('change',validate);}
  function setupFounders(section){if(!section||section.dataset.ready)return;section.dataset.ready='yes';for(const card of section.querySelectorAll('.founder')){const frame=card.querySelector('.portrait-frame'),button=card.querySelector('.portrait-toggle'),overlay=card.querySelector('.founder-overlay'),close=overlay.querySelector('.bio-close');let pinned=false;function open(){overlay.hidden=false;button.setAttribute('aria-expanded','true');}function hide(focus=false){pinned=false;overlay.hidden=true;button.setAttribute('aria-expanded','false');if(focus)button.focus();}frame.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&!pinned)open();});frame.addEventListener('pointerleave',()=>{if(!pinned&&!overlay.contains(document.activeElement))hide();});button.addEventListener('click',()=>{if(pinned){hide(true);return;}pinned=true;open();close.focus({preventScroll:true});});close.addEventListener('click',()=>hide(true));frame.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();hide(true);}});frame.addEventListener('focusout',e=>{if(!pinned&&!frame.contains(e.relatedTarget)&&!frame.matches(':hover'))hide();});}}
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
    markNav(page==='home'?name:page);updateSpine();main.scrollTop=0;if(name==='journey'&&page==='home'){if(/^[0-5]$/.test(key))showStage(Number(key));else drawPath(stageMotion);}
    if(page==='home'){
      if(focus && name==='journey')journey.focus({preventScroll:true});
      else if(focus)main.focus({preventScroll:true});
      requestAnimationFrame(()=>{if(view==='home')scrollHome('intro',animate);});
    } else {
      if(focus)main.focus({preventScroll:true});
      window.scrollTo({top:0,behavior:'instant'});
    }
    if(page==='founders')setupFounders(main.querySelector('.founders'));
    if(page==='consult'){
      let draft;
      try{draft=JSON.parse(read('vh-language-draft'));}catch(_){}
      write('vh-language-draft',null);window.VellumEducation.hydrate(main.querySelector('form'),draft);setupForm(main.querySelector('form'));
      if(name==='privacy')main.querySelector('details').open=true;
    }
    if(page==='calendar')booking().then(m=>{if(view==='calendar')m.openCalendar(key);}).catch(()=>{
      if(view==='calendar')document.getElementById('calendar-area').textContent=fa?'بارگیری تقویم ممکن نشد. صفحه را دوباره باز کنید.':'The calendar could not load. Please reload.';
    });
  }
  document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(!link||link.classList.contains('skip')||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();closeMenu();navigate(link.hash);});
  main.addEventListener('click',event=>{
    const node=event.target.closest('button');if(!node || !journey.contains(node))return;
    if(node.hasAttribute('data-stage'))showStage(Number(node.dataset.stage),true);
    if(node.hasAttribute('data-delta'))showStage(stage+Number(node.dataset.delta),true);
  });
  journey.addEventListener('keydown',event=>{
    if(!['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();showStage(stage+((event.key==='ArrowDown'||event.key===(fa?'ArrowLeft':'ArrowRight'))?1:-1),true);
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
    chosen=true;document.documentElement.classList.remove('language-entry');document.documentElement.classList.add('language-chosen');
    filmButton();
    clearTimeout(filmWarmupTimer);
    filmWarmupTimer=setTimeout(()=>{if(chosen && !document.hidden)updateFilm();},150);
  }
  function openChooser(first) {
    closeMenu();dismiss.hidden=first;dialog.classList.remove('leaving');if(!dialog.open)dialog.showModal();video.pause();
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
        url.search=location.search;url.hash=document.body.classList.contains('journey-scene')?'#journey/'+stage:location.hash;location.assign(url.href);return;
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
  window.addEventListener('hashchange',()=>{if(moving){clearTimeout(transitionTimer);clearTimeout(transitionEnd);main.getAnimations().forEach(a=>a.cancel());moving=false;route();return;}animateRoute(()=>route(),indexOf(location.hash));});
  const previous=window.vhRequireLanguage?null:window.vhInitialLanguage;
  if(previous && previous!==lang && !/\/(en|index)\.html$/.test(location.pathname)){
    const url=new URL(previous==='en'?'en.html':'index.html',location.href);url.search=location.search;url.hash=location.hash;location.replace(url.href);return;
  }
  if(!previous)openChooser(true);
  showStage(0);route(false);
  if(previous)reveal();
})();

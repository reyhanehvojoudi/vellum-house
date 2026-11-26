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
  const mast=document.querySelector('.mast');const menu=mast.querySelector('.menu-toggle');const closeMenu=()=>{mast.classList.remove('menu-open');menu.setAttribute('aria-expanded','false')};menu.addEventListener('click',()=>{const open=mast.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open))});mast.querySelector('nav').addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});new ResizeObserver(()=>document.documentElement.style.setProperty('--mast-height',mast.offsetHeight+'px')).observe(mast);
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
      const small=matchMedia('(max-aspect-ratio: 1/1)').matches;
      video.src=small ? video.dataset.srcSmall : video.dataset.src;
      video.load();
    }
    video.muted=true;
    const attempt=()=>{if(chosen&&!dialog.open&&!document.hidden&&view==='home'&&canSeeFilm&&!manualPause&&!blocked()&&!document.body.classList.contains('journey-scene'))video.play().catch(filmButton);};
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
    stage=index;journey.querySelector('.route-canvas').style.setProperty('--journey-progress',index/3);journey.querySelector('.stage-detail').dataset.numeral=String(index+1).padStart(2,'0').replace(/\d/g,d=>fa?'۰۱۲۳۴۵۶۷۸۹'[Number(d)]:d);
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
    const y=0;
    window.scrollTo({top:y,behavior:animate && !reduced.matches?'smooth':'instant'});
  }
  // The thread is the navigation; native scrolling remains available for keyboard / zoom.
  let touchStart=null, gestureLocked=false;
  journey.addEventListener('touchstart',e=>{touchStart=[e.touches[0].clientX,e.touches[0].clientY];},{passive:true});
  journey.addEventListener('touchend',e=>{if(!touchStart)return;const dx=e.changedTouches[0].clientX-touchStart[0],dy=e.changedTouches[0].clientY-touchStart[1];touchStart=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4)showStage(stage+(dx*(fa?1:-1)>0?1:-1));},{passive:true});
  function sceneStep(direction){if(!chosen||dialog.open||gestureLocked)return;const next=direction>0?'journey':'intro';if(view!=='home'||location.hash===`#${next}`)return;gestureLocked=true;navigate(`#${next}`);setTimeout(()=>gestureLocked=false,850);}
  main.addEventListener('wheel',e=>{if(view!=='home'||Math.abs(e.deltaY)<18||dialog.open)return;const bottom=main.scrollTop+main.clientHeight>=main.scrollHeight-2;const top=main.scrollTop<=0;if((e.deltaY>0&&bottom&&!document.body.classList.contains('journey-scene'))||(e.deltaY<0&&top&&document.body.classList.contains('journey-scene'))){e.preventDefault();sceneStep(e.deltaY);}},{passive:false});
  const names=fa?['آغاز','مسیر همراهی','بنیان‌گذاران','مشاوره']:['Home','Approach','Founders','Consultation'];
  const indexOf=(hash)=>{const raw=hash.replace(/^#/, '').split('/')[0];const n=aliases[raw]||raw;return n==='journey'?1:n==='founders'?2:['consult','calendar','contact','privacy'].includes(n)?3:0};
  const numeral=n=>String(n).padStart(2,'0').replace(/\d/g,d=>fa?'۰۱۲۳۴۵۶۷۸۹'[Number(d)]:d);
  let currentLeaf=0, transitionTimer, transitionEnd, moving=false;
  const sweep=document.querySelector('.thread-sweep');
  function updateSpine(){currentLeaf=indexOf(location.hash);document.body.style.setProperty('--progress',(currentLeaf+1)/4);const count=`${numeral(currentLeaf+1)} / ${numeral(4)}`;document.querySelector('.spine-index').textContent=count;document.querySelector('.footer-index').textContent=count;document.querySelector('.spine-name').textContent=names[currentLeaf];}
  function animateRoute(apply,next){clearTimeout(transitionTimer);clearTimeout(transitionEnd);sweep.className='thread-sweep';main.classList.remove('reveal-stage');if(reduced.matches||next===currentLeaf){apply();main.classList.add('reveal-stage');return;}moving=true;sweep.classList.add(next>=currentLeaf?'forward':'reverse');void sweep.offsetWidth;sweep.classList.add('active');transitionTimer=setTimeout(()=>{apply();main.classList.add('reveal-stage');},395);transitionEnd=setTimeout(()=>{sweep.classList.remove('active');main.classList.remove('reveal-stage');moving=false;},800);}
  function navigate(hash){if(moving||hash===location.hash)return;const next=indexOf(hash);animateRoute(()=>{history.pushState(null,'',hash);route(true);},next);}
  function setupForm(form){if(form.dataset.stepped)return;form.dataset.stepped='yes';const fields=form.querySelector('.fields'), labels=[...fields.children], consent=form.querySelector('.consent'), privacy=form.querySelector('.privacy'), submit=form.querySelector('#submit-enquiry'), section=form.closest('.booking-layout');
    const groupNames=fa?['پیش از شروع','اطلاعات تماس','اطلاعات تحصیلی','هدف تحصیلی','توضیحات و تأیید']:['Before you start','Contact details','Education','Academic goals','Details and consent'];
    const groups=[[],labels.slice(0,3),labels.slice(3,6),labels.slice(6,9),labels.slice(9)];let step=0;const nav=document.createElement('div');nav.className='form-navigation';const prev=document.createElement('button'),next=document.createElement('button'),count=document.createElement('span');prev.type=next.type='button';prev.className='btn outline';next.className='btn solid';count.className='form-step-count';count.setAttribute('aria-live','polite');prev.textContent=fa?'قبلی':'Back';next.textContent=fa?'ادامه':'Continue';nav.append(prev,count,next);submit.before(nav);
    const compact=matchMedia('(max-width: 980px), (max-height: 820px)');
    function render(){const stepped=compact.matches,last=groups.length-1;section.classList.toggle('stepped-form',stepped);section.dataset.formStep=step;groups.forEach((g,i)=>g.forEach(el=>el.hidden=stepped&&i!==step));consent.hidden=privacy.hidden=stepped&&step!==last;nav.hidden=!stepped;prev.disabled=step===0;next.hidden=step===last;submit.hidden=stepped&&step!==last;count.textContent=`${numeral(step+1)} / ${numeral(groups.length)} · ${groupNames[step]}`;form.dataset.step=step;}
    function check(i){for(const label of groups[i]){const input=label.querySelector('input,select,textarea');if(input?.name==='phone' && input.value.trim()){const value=input.value.trim(),digits=value.replace(/[^0-9۰-۹٠-٩]/g,'');input.setCustomValidity(/^\+?[0-9۰-۹٠-٩ ()\-]+$/.test(value)&&digits.length>=6&&digits.length<=18?'':(fa?'لطفاً شمارهٔ تماس معتبری وارد کنید.':'Enter a valid phone number.'));input.addEventListener('input',()=>input.setCustomValidity(''),{once:true});}if(input&&!input.disabled&&!input.checkValidity()){step=i;render();input.reportValidity();return false;}}return true;}
    prev.onclick=()=>{step=Math.max(0,step-1);render();main.scrollTop=0;};next.onclick=()=>{if(check(step)){step=Math.min(groups.length-1,step+1);render();main.scrollTop=0;groups[step][0]?.querySelector('input,select,textarea')?.focus({preventScroll:true});}};
    form.addEventListener('invalid',e=>{const i=groups.findIndex(g=>g.some(el=>el.contains(e.target)));if(i>=0&&compact.matches&&step!==i){step=i;render();main.scrollTop=0;}},true);compact.addEventListener('change',render);form.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName!=='TEXTAREA'&&e.target.tagName!=='BUTTON'&&compact.matches&&step<groups.length-1){e.preventDefault();next.click();}});render();
  }
  // Very short screens cannot show the full unchanged copy at readable sizes. Offer explicit leaves, never clip text.
  const hero=home.querySelector('#intro'), heroNext=document.createElement('button');heroNext.type='button';heroNext.className='hero-leaf btn outline';hero.querySelector('.hero-foot').prepend(heroNext);let heroPage=0;
  const tightHome=matchMedia('(max-width: 380px) and (max-height: 720px), (max-height: 440px)');
  function renderHome(){hero.classList.toggle('is-paged',tightHome.matches);hero.dataset.homePage=heroPage;heroNext.hidden=!tightHome.matches;heroNext.textContent=heroPage?(fa?'بازگشت به عنوان':'Back to introduction'):(fa?'دربارهٔ ولوم هاوس':'Read our introduction');}
  heroNext.onclick=()=>{heroPage=1-heroPage;renderHome();main.scrollTop=0;};tightHome.addEventListener('change',renderHome);renderHome();
  function setupFounders(section){if(section.dataset.paged)return;section.dataset.paged='yes';const cards=[...section.querySelectorAll('.founder')], controls=document.createElement('div');controls.className='founder-leaves';const mq=matchMedia('(max-width: 600px) and (max-height: 900px), (max-height: 440px)');let selected=0;const buttons=cards.map((card,i)=>{const b=document.createElement('button');b.type='button';b.className='btn outline';b.textContent=card.querySelector('h2').textContent;b.onclick=()=>{selected=i;render();main.scrollTop=0;};controls.append(b);return b;});section.querySelector('.page-head').after(controls);function render(){controls.hidden=!mq.matches;cards.forEach((card,i)=>{card.hidden=mq.matches&&selected!==i;buttons[i].setAttribute('aria-pressed',String(selected===i));});section.classList.toggle('single-founder',mq.matches);}mq.addEventListener('change',render);render();}
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
    markNav(page==='home'?name:page);updateSpine();main.scrollTop=0;
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
  window.addEventListener('hashchange',()=>{if(moving){clearTimeout(transitionTimer);clearTimeout(transitionEnd);sweep.className='thread-sweep';moving=false;route();return;}animateRoute(()=>route(),indexOf(location.hash));});
  document.querySelector('.footer-lang').addEventListener('click',()=>openChooser(false));
  const previous=window.vhInitialLanguage;
  if(previous && previous!==lang && !/\/(en|index)\.html$/.test(location.pathname)){
    const url=new URL(previous==='en'?'en.html':'index.html',location.href);url.search=location.search;url.hash=location.hash;location.replace(url.href);return;
  }
  const warm=()=>{if(!blocked())booking().catch(()=>{});};const warmLinks=document.querySelectorAll('a[href="#consult"]');warmLinks.forEach(a=>{a.addEventListener('pointerenter',warm,{once:true});a.addEventListener('touchstart',warm,{once:true,passive:true});});if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){warm();io.unobserve(e.target);}});warmLinks.forEach(a=>io.observe(a));}
  showStage(0);route(false);
  if(previous)reveal();else openChooser(true);
})();

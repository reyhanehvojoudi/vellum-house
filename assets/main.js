'use strict';
(() => {
  const menu = document.querySelector('#menu');
  const nav = document.querySelector('#navigation');
  const top = document.querySelector('#back-to-top');
  const fa = document.documentElement.lang === 'fa';
  const t = (en, persian) => fa ? persian : en;
  function closeMenu() { if(nav){nav.hidden=true;nav.classList.remove('open')} menu?.setAttribute('aria-expanded', 'false'); }
  menu?.addEventListener('click', () => {
    const show = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(show)); if(nav){nav.hidden=!show;nav.classList.toggle('open',show)}
  });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeMenu(); });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', e => { if(nav && !nav.hidden && !nav.contains(e.target) && !menu?.contains(e.target)) closeMenu(); });
  window.addEventListener('resize', () => { if(window.innerWidth>900) closeMenu(); });
  const readMeter = document.querySelector('.page-read-meter span');
  function onScroll(){
    document.querySelector('.site-header')?.classList.toggle('is-scrolled',window.scrollY>40);
    top?.classList.toggle('visible',window.scrollY>700);
    if(readMeter){
      const scrollable = Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
      readMeter.style.transform = 'scaleX('+Math.min(1,window.scrollY/scrollable).toFixed(4)+')';
    }
  }
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  top?.addEventListener('click',()=>window.scrollTo({top:0,behavior:window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
  // Interactive journey: direct exploration, keyboard navigation, guided next/previous,
  // pointer-responsive illumination, and a visible traveler on the underlying route.
  // All motion is an optional enhancement; reduced-motion visitors get instant updates.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.atlas').forEach(atlas => {
    const stops = [...atlas.querySelectorAll('.atlas-stop')];
    const detail = atlas.querySelector('#atlas-detail-inner');
    const svgPath = atlas.querySelector('.atlas-route-progress');
    const traveler = atlas.querySelector('.atlas-traveler');
    const prev = atlas.querySelector('.atlas-prev');
    const next = atlas.querySelector('.atlas-next');
    const stepNumber = atlas.querySelector('.atlas-step-number');
    if (!stops.length || !detail) return;
    let activeIndex = 0, routePosition = 0, motionFrame = null, pointerFrame = null;
    const routeLength = svgPath?.getTotalLength?.() || 0;
    // Locate the actual SVG waypoints so the moving light arrives precisely at each node.
    // The illustration mirrors as a whole in RTL, so no separate coordinate math is required.
    const waypoints = stops.map(stop => {
      if(!routeLength || !svgPath) return 0;
      const x = parseFloat(stop.style.getPropertyValue('--x')) / 100 * 1100;
      const y = parseFloat(stop.style.getPropertyValue('--y')) / 100 * 470;
      let nearest = 0, distance = Infinity;
      for(let i=0;i<=240;i++){
        const at = routeLength*i/240, p=svgPath.getPointAtLength(at);
        const d=(p.x-x)**2+(p.y-y)**2;
        if(d<distance){distance=d;nearest=at;}
      }
      return nearest;
    });
    const moveTraveler = (position) => {
      if(!traveler || !svgPath || !routeLength) return;
      const p = svgPath.getPointAtLength(Math.min(routeLength,Math.max(0,position)));
      traveler.setAttribute('transform',`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
    };
    const select = (index, focus = false, initial = false) => {
      if(index<0 || index>=stops.length) return;
      activeIndex=index;
      stops.forEach((button,i) => {
        const chosen=i===index;
        button.classList.toggle('is-active',chosen);
        button.setAttribute('aria-pressed',String(chosen));
        button.tabIndex=chosen?0:-1;
      });
      atlas.dataset.active=String(index+1);
      const target=waypoints[index] ?? (routeLength*index/(stops.length-1));
      const fraction=routeLength?target/routeLength:0;
      atlas.style.setProperty('--progress',String((fraction*100).toFixed(2)));
      if(motionFrame) cancelAnimationFrame(motionFrame);
      if(initial || reduceMotion || !routeLength) {routePosition=target;moveTraveler(target);}
      else {
        const from=routePosition, delta=target-from, started=performance.now(), duration=680;
        const tick=(now)=>{
          const t=Math.min(1,(now-started)/duration);
          const eased=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
          routePosition=from+delta*eased;moveTraveler(routePosition);
          if(t<1)motionFrame=requestAnimationFrame(tick);else motionFrame=null;
        };
        motionFrame=requestAnimationFrame(tick);
      }
      const template = atlas.querySelector('#atlas-template-'+(index+1));
      if(template){
        detail.replaceChildren(template.content.cloneNode(true));
        detail.classList.remove('atlas-detail-enter');
        if(!reduceMotion && !initial){void detail.offsetWidth;detail.classList.add('atlas-detail-enter');}
      }
      if(prev)prev.disabled=index===0;
      if(next)next.disabled=index===stops.length-1;
      if(stepNumber)stepNumber.textContent=String(index+1).padStart(2,'0');
      if(focus)stops[index].focus({preventScroll:true});
    };
    stops.forEach((button,i)=>{
      button.addEventListener('click',()=>select(i));
      button.addEventListener('keydown',event=>{
        const forward=fa?'ArrowLeft':'ArrowRight';
        const backward=fa?'ArrowRight':'ArrowLeft';
        if(event.key===forward || event.key==='ArrowDown') {event.preventDefault();select((i+1)%stops.length,true);}
        else if(event.key===backward || event.key==='ArrowUp') {event.preventDefault();select((i+stops.length-1)%stops.length,true);}
        else if(event.key==='Home'){event.preventDefault();select(0,true);}
        else if(event.key==='End'){event.preventDefault();select(stops.length-1,true);}
      });
    });
    prev?.addEventListener('click',()=>select(activeIndex-1));
    next?.addEventListener('click',()=>select(activeIndex+1));
    // Trackpad and mouse spotlight. Never intercept native touch/scroll gestures.
    const map=atlas.querySelector('.atlas-map');
    if(map && !reduceMotion){
      map.addEventListener('pointermove',e=>{
        if(e.pointerType==='touch')return;
        if(pointerFrame)cancelAnimationFrame(pointerFrame);
        pointerFrame=requestAnimationFrame(()=>{
          const r=map.getBoundingClientRect();
          map.style.setProperty('--pointer-x',((e.clientX-r.left)/r.width*100).toFixed(2)+'%');
          map.style.setProperty('--pointer-y',((e.clientY-r.top)/r.height*100).toFixed(2)+'%');
          pointerFrame=null;
        });
      },{passive:true});
      map.addEventListener('pointerleave',()=>{
        map.style.removeProperty('--pointer-x');map.style.removeProperty('--pointer-y');
      });
    }
    select(0,false,true);
  });
  // Lightweight scroll-chapter reveals. Content stays visible without JS and with
  // reduced-motion enabled; no network, animation library, or canvas dependency.
  if(!reduceMotion && 'IntersectionObserver' in window){
    const targets=document.querySelectorAll('.v7-benefit,.v7-person,.v7-evidence-card,.v7-service-row,.v7-team-placeholders,.v7-difference-grid>div:first-child');
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){entry.target.classList.add('story-visible');observer.unobserve(entry.target);}
      });
    },{threshold:.08,rootMargin:'0px 0px 50px 0px'});
    targets.forEach(el=>{el.classList.add('story-reveal');observer.observe(el);});
    document.documentElement.classList.add('v7-story-enabled');
  }
  const form = document.querySelector('#enquiry-form');
  if(!form) return;
  // When JS is disabled, no GET URL fallback can expose family details.
  form.addEventListener('submit',e=>e.preventDefault());
  const status=document.querySelector('#form-status');
  const fallback=document.querySelector('#booking-fallback');
  const booking=document.querySelector('#booking-link');
  const submit=form.querySelector('button[type=submit]');
  const original=submit?.innerHTML;
  const conf=window.VELLUM_CONFIG||{};
  const bookingUrl = (() => {
    try {
      const url = new URL(conf.bookingUrl || 'https://cal.com/vhouse/consultation');
      if (url.protocol === 'https:' && url.hostname === 'cal.com' && url.pathname !== '/') return url.href;
    } catch (error) { console.error('Invalid booking URL:', error); }
    return 'https://cal.com/vhouse/consultation';
  })();
  if(booking) booking.href=bookingUrl;
  let isSubmitting=false,prevSignature='',requestId='';
  const report=(message,error=false)=>{
    if(!status)return;
    status.textContent=message;
    status.classList.toggle('error',error);
    status.classList.toggle('success',!error);
  };
  const VALID_ENDPOINT=/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;
  // Receipt endpoint reveals only existence of an opaque UUID; no client data is readable.
  function receipt(endpoint,id){return new Promise((resolve,reject)=>{
    const callback='vhReceipt_'+crypto.randomUUID().replaceAll('-','');
    const script=document.createElement('script');let settled=false;
    const finish=(value)=>{if(settled)return;settled=true;clearTimeout(timer);script.remove();delete window[callback];value?resolve(value):reject(new Error('unconfirmed'));};
    const timer=setTimeout(()=>finish(null),12000);
    window[callback]=finish;
    script.onerror=()=>finish(null);
    const url=new URL(endpoint);
    url.search=new URLSearchParams({requestId:id,callback,t:String(Date.now())}).toString();
    script.src=url.href;document.head.appendChild(script);
  });}
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(isSubmitting) return;
    if(!form.reportValidity())return;
    const endpoint=String(conf.formEndpoint||'').trim();
    if(!VALID_ENDPOINT.test(endpoint)){
      report(t('The enquiry system is not active yet. Please email vellumhouse.edu@gmail.com to arrange your free meeting.','سامانه ثبت درخواست هنوز فعال نشده است. برای هماهنگی جلسه مشاوره رایگان اولیه به vellumhouse.edu@gmail.com ایمیل بزنید.'),true);
      status?.focus();return;
    }
    const data=new URLSearchParams(new FormData(form));
    if((data.get('website')||'').trim())return;
    const phone=(data.get('phone')||'').trim();
    if(phone && !/^\+?[0-9۰-۹٠-٩ ()\-]{6,40}$/.test(phone)){
      report(t('Please enter a valid phone number, or leave it blank.','شماره تماس را درست وارد کنید یا آن را خالی بگذارید.'),true);
      form.querySelector('#phone')?.focus();return;
    }
    data.set('language',fa?'fa':'en');
    const campaign=new URLSearchParams(location.search).get('utm_source');
    let referringSite='website';
    if(document.referrer){try{referringSite=new URL(document.referrer).hostname||'website';}catch(_){}}
    data.set('source',(campaign||referringSite).slice(0,300));
    const current=data.toString();
    if(current!==prevSignature){prevSignature=current;requestId=crypto.randomUUID();}
    data.set('requestId',requestId);
    isSubmitting=true;submit.disabled=true;submit.textContent=t('Saving your enquiry…','در حال ثبت درخواست…');
    form.setAttribute('aria-busy','true');report(t('Saving your request securely.','در حال ثبت درخواست شما هستیم.'));
    try{
      // Google Apps Script POST returns an opaque response. Never claim success from it alone.
      fetch(endpoint,{method:'POST',mode:'no-cors',credentials:'omit',body:data,redirect:'follow'}).catch(()=>{});
      let confirmed=false;
      for(let i=0;i<5;i++){
        await new Promise(resolve=>setTimeout(resolve,i===0?2200:3300));
        try{if((await receipt(endpoint,requestId))?.saved===true){confirmed=true;break;}}catch(_){/* retry */}
      }
      if(!confirmed)throw new Error('receipt-not-confirmed');
      report(t('Your enquiry is saved. Opening the free booking calendar…','درخواست شما ثبت شد. در حال باز کردن تقویم مشاوره رایگان اولیه…'));
      if(fallback)fallback.hidden=false;
      if(submit)submit.hidden=true;
      // Direct booking navigation only after backend has confirmed the unique request exists.
      window.location.assign(bookingUrl);
    }catch(_){
      report(t('We could not confirm your request. Your details are still here. Please retry, or email vellumhouse.edu@gmail.com.','تأیید ثبت درخواست انجام نشد. اطلاعات شما باقی مانده است؛ دوباره تلاش کنید یا به vellumhouse.edu@gmail.com ایمیل بزنید.'),true);
      status?.focus();
    }finally{isSubmitting=false;submit.disabled=false;submit.innerHTML=original;form.removeAttribute('aria-busy');}
  });
})();

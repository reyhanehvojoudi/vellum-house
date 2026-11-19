'use strict';
(() => {
  const menu = document.querySelector('#menu');
  const nav = document.querySelector('#navigation');
  const top = document.querySelector('#back-to-top');
  const fa = document.documentElement.lang === 'fa';
  const t = (en, persian) => fa ? persian : en;
  function closeMenu() { nav?.classList.remove('open'); menu?.setAttribute('aria-expanded', 'false'); }
  menu?.addEventListener('click', () => {
    const show = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(show)); nav?.classList.toggle('open', show);
  });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeMenu(); });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  function onScroll(){document.querySelector('.site-header')?.classList.toggle('is-scrolled',window.scrollY>40);top?.classList.toggle('visible',window.scrollY>700)}
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  top?.addEventListener('click',()=>window.scrollTo({top:0,behavior:window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
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
    const url = new URL(conf.bookingUrl);
    if (
      url.protocol === 'https:' &&
      url.hostname === 'cal.com' &&
      url.pathname !== '/'
    ) {
      return url.href;
    }
  } catch (error) {
    console.error('Invalid booking URL:', error);
  }
  return '';
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
      report(t('The enquiry system is not active yet. Please email vellumhouse.edu@gmail.com to arrange your free meeting.','سامانه ثبت درخواست هنوز فعال نشده است. برای هماهنگی جلسه رایگان به vellumhouse.edu@gmail.com ایمیل بزنید.'),true);
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
      report(t('Your enquiry is saved. Opening the free booking calendar…','درخواست شما ثبت شد. در حال باز کردن تقویم جلسه رایگان…'));
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

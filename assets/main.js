'use strict';
const menu=document.getElementById('menu'),nav=document.getElementById('navigation');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav?.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus();}});
const form=document.getElementById('enquiry-form');
if(form){
 const fa=document.documentElement.lang==='fa',msg=(en,faText)=>fa?faText:en;
 const status=document.getElementById('form-status'),button=form.querySelector('[type=submit]'),initial=button.textContent;
 let requestId='',signature='',busy=false;
 // Read-only receipt lookup returns a boolean only; no personal data is exposed.
 function receipt(endpoint,id){return new Promise((resolve,reject)=>{
   const cb='vhReceipt_'+crypto.randomUUID().replaceAll('-',''),script=document.createElement('script');
   const timer=setTimeout(()=>finish(null),12000);
   function finish(result){clearTimeout(timer);script.remove();delete window[cb];result?resolve(result):reject(new Error('receipt unavailable'));}
   window[cb]=finish;script.onerror=()=>finish(null);
   const u=new URL(endpoint);u.search=new URLSearchParams({requestId:id,callback:cb,t:String(Date.now())});script.src=u.href;document.head.append(script);
 });}
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy||!form.reportValidity())return;
  const endpoint=window.VELLUM_CONFIG?.formEndpoint||'';
  const report=(text,error=false)=>{status.textContent=text;status.classList.toggle('error',error);};
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint)){
   report(msg('The enquiry form is temporarily unavailable. Please email reyhaneh.vojoudi@gmail.com to request your free consultation.','فرم درخواست در حال حاضر در دسترس نیست. برای درخواست مشاوره رایگان به reyhaneh.vojoudi@gmail.com ایمیل بزنید.'),true);status.focus();return;
  }
  const data=new URLSearchParams(new FormData(form));data.set('language',fa?'fa':'en');
  if(!/^\+?[0-9۰-۹٠-٩ ()\-]{6,40}$/.test(data.get('phone').trim())){report(msg('Please enter a valid phone number, including your country code.','لطفاً شماره تماس معتبر همراه با کد کشور وارد کنید.'),true);document.getElementById('phone').focus();return;}
  const current=data.toString();if(current!==signature){signature=current;requestId=crypto.randomUUID();}data.set('requestId',requestId);
  busy=true;button.disabled=true;button.textContent=msg('Sending…','در حال ارسال…');form.setAttribute('aria-busy','true');
  report(msg('Saving your enquiry. Please keep this page open.','در حال ثبت درخواست شما هستیم. لطفاً صفحه را باز نگه دارید.'));
  try{
   // An opaque POST response is never treated as proof of success.
   fetch(endpoint,{method:'POST',mode:'no-cors',credentials:'omit',body:data}).catch(()=>{});
   let saved=false;
   for(let attempt=0;attempt<5;attempt++){
    await new Promise(resolve=>setTimeout(resolve,attempt===0?2000:4000));
    try{const result=await receipt(endpoint,requestId);if(result.saved===true){saved=true;break;}}catch(_){}
   }
   if(!saved)throw new Error('unconfirmed');
   report(msg('Thank you. Your enquiry has been received. Please check your inbox and spam folder for our acknowledgement. We will email you to arrange your free initial consultation. A meeting time is confirmed separately.','سپاسگزاریم، درخواست شما ثبت شد. لطفاً برای دریافت تأییدیه، صندوق ورودی و پوشه اسپم ایمیلتان را بررسی کنید. برای هماهنگی جلسه مشاوره اولیه رایگان به شما ایمیل می‌زنیم. زمان جلسه جداگانه تأیید می‌شود.'));
   form.reset();requestId='';signature='';status.focus();
  }catch(_){report(msg('We could not confirm receipt. Your details are still here. Retry with the same details to avoid a duplicate, or email reyhaneh.vojoudi@gmail.com. If an acknowledgement has arrived, your enquiry was received.','نتوانستیم ثبت درخواست را تأیید کنیم. اطلاعات شما در فرم باقی مانده است. با همین اطلاعات دوباره تلاش کنید یا به reyhaneh.vojoudi@gmail.com ایمیل بزنید. اگر تأییدیه ایمیلی دریافت کرده‌اید، درخواست شما ثبت شده است.'),true);status.focus();}
  finally{busy=false;button.disabled=false;button.textContent=initial;form.removeAttribute('aria-busy');}
 });
}

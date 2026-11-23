import {request,dateKey,clock,longDate,button,el} from './calendar-api.js?v=10';
const labels={
  brand:['Vellum House','ولوم هاوس'],title:['Consultation dashboard','مدیریت وقت‌های مشاوره'],
  login:['Staff sign-in','ورود همکاران'],key:['Staff access key','کلید دسترسی همکاران'],signin:['Sign in','ورود'],signout:['Sign out','خروج'],
  avail:['Availability','وقت‌های آزاد'],rules:['Open a date and time range in Tehran time. Families can book 30-minute meetings from 48 hours to 14 days ahead.','یک روز و بازهٔ زمانی به وقت تهران انتخاب کنید. خانواده‌ها می‌توانند جلسه‌های ۳۰ دقیقه‌ای را از ۴۸ ساعت تا ۱۴ روز پیش از برگزاری رزرو کنند.'],
  date:['Date (Gregorian)','تاریخ (میلادی)'],from:['From','از ساعت'],until:['Until','تا ساعت'],publish:['Open these times','افزودن وقت‌های آزاد'],
  open:['Published times','وقت‌های اعلام‌شده'],meetings:['Booked meetings','جلسه‌های رزروشده'],refresh:['Refresh','به‌روزرسانی'],
  show:['Show','نمایش'],upcoming:['Upcoming','پیش رو'],past:['Past','گذشته'],all:['All meetings','همهٔ جلسه‌ها'],empty:['No meetings in this view.','جلسه‌ای در این فهرست ثبت نشده است.'],
  noOpen:['No future times are open.','وقت آزادی برای روزهای آینده ثبت نشده است.'],close:['Close slot','بستن وقت'],saving:['Updating the calendar…','در حال به‌روزرسانی تقویم…'],
  loading:['Opening the dashboard…','در حال دریافت اطلاعات…'],updated:['Calendar updated.','تقویم به‌روزرسانی شد.'],auth:['The access key was not accepted.','کلید دسترسی پذیرفته نشد.'],
  service:['The calendar could not be verified. Please try again.','اطلاعات تقویم تأیید نشد. دوباره تلاش کنید.'],range:['Choose an end time after the start time on the same date.','ساعت پایان باید بعد از ساعت شروع و در همان روز باشد.'],
  pastError:['Choose a future date and time.','تاریخ و ساعتی در آینده انتخاب کنید.'],booked:['A family has already booked this time. It is listed under meetings.','یک خانواده این وقت را رزرو کرده است. جزئیات آن در فهرست جلسه‌هاست.'],
  setup:['The booking service is awaiting setup.','راه‌اندازی سامانهٔ رزرو هنوز تکمیل نشده است.']
};
const $=s=>document.querySelector(s);
let lang='fa',secret='',data=null,working=false,generation=0;
try {if(sessionStorage.getItem('vh-lang')==='en')lang='en';}catch(_){}
const t=k=>labels[k][lang==='fa'?1:0];
function message(value='',error=false) {
  const e=$('#admin-status');e.textContent=value;e.className='status'+(error?' error':'');
}
function clocks(select,isEnd) {
  const prev=select.value, frag=document.createDocumentFragment();
  for(let half=isEnd?1:0;half<=(isEnd?48:47);half++) {
    const val=String(Math.floor(half/2)).padStart(2,'0')+':'+(half%2?'30':'00');
    const opt=el('option','',lang==='fa'?val.replace(/\d/g,v=>'۰۱۲۳۴۵۶۷۸۹'[Number(v)]):val);
    opt.value=val;frag.append(opt);
  }
  select.replaceChildren(frag);select.value=prev || (isEnd?'17:30':'17:00');
}
function translate() {
  document.documentElement.lang=lang;document.documentElement.dir=lang==='fa'?'rtl':'ltr';
  document.title=t('title')+' | '+t('brand');$('#admin-home').href=lang==='fa'?'index.html':'en.html';
  document.querySelectorAll('[data-text]').forEach(n=>{n.textContent=t(n.dataset.text);});
  $('#admin-lang').textContent=lang==='fa'?'English':'فارسی';$('#admin-lang').lang=lang==='fa'?'en':'fa';
  clocks($('[name="from"]'),false);clocks($('[name="until"]'),true);
  if(data) renderLists();
}
function renderLists() {
  const open=$('#open-times'), meets=$('#meeting-list'),filter=$('#meeting-filter').value;
  open.replaceChildren();meets.replaceChildren();
  if(!data.open.length)open.append(el('li','subtle',t('noOpen')));
  for(const start of data.open) {
    const line=el('li','slot'),text=longDate(start,lang)+' · '+clock(start,lang);
    const close=button(t('close'),'text-button',()=>run('adminAvailability',{change:'close',start}));
    close.setAttribute('aria-label',t('close')+' · '+text);line.append(el('span','',text),close);open.append(line);
  }
  let list=data.booked.filter(m=>filter==='all' || (filter==='past' ? m.start+1800000<Date.now() : m.start+1800000>=Date.now()));
  if(filter==='past')list=list.slice().reverse();
  if(!list.length)meets.append(el('li','subtle',t('empty')));
  for(const m of list) {
    const li=el('li'),when=el('strong','',longDate(m.start,lang)+' · '+clock(m.start,lang));
    const name=el('p'),details=el('p'),email=el('bdi','',m.email);email.dir='ltr';
    name.append(el('bdi','',m.name),' · ',el('bdi','',m.topic));
    details.append(email);if(m.phone){const phone=el('bdi','',m.phone);phone.dir='ltr';details.append(' · ',phone);}
    li.append(when,name,details);meets.append(li);
  }
}
function showSignedIn(enabled) {
  $('#login').hidden=enabled;$('#panels').hidden=!enabled;$('#signout').hidden=!enabled;
}
function lockScreen() {
  generation++;working=false;secret='';data=null;$('#staff-key').value='';
  $('#meeting-list').replaceChildren();$('#open-times').replaceChildren();showSignedIn(false);message();
  document.querySelectorAll('main button, main select, main input').forEach(b=>b.disabled=false);
}
async function run(action,fields={}) {
  if(working)return;
  working=true;const ticket=++generation;
  message(t(action==='adminList'?'loading':'saving'));
  document.querySelectorAll('main button, main select, main input').forEach(b=>b.disabled=true);
  try {
    const operation=action==='adminAvailability'?{operationId:crypto.randomUUID()}:{};
    const response=await request(action,{...fields,...operation,adminKey:secret});
    if(ticket!==generation)return;
    if(!response.ok) {
      if(response.code==='auth'){lockScreen();message(t('auth'),true);$('#staff-key').focus();return;}
      if(response.code==='booked') {
        const latest=await request('adminList',{adminKey:secret});
        if(ticket!==generation)return;
        if(latest.ok){data=latest;renderLists();}
      }
      throw new Error(response.code);
    }
    data=response;showSignedIn(true);renderLists();message(action==='adminList'?'':t('updated'));
    $('#staff-key').value='';
  } catch(err) {
    if(ticket===generation) message(t(({past:'pastError',range:'range',booked:'booked',setup:'setup'})[err.message]||'service'),true);
  } finally {
    if(ticket===generation){working=false;document.querySelectorAll('main button, main select, main input').forEach(b=>b.disabled=false);}
  }
}
$('#login-form').addEventListener('submit',e=>{e.preventDefault();secret=$('#staff-key').value.trim();run('adminList');});
$('#open-form').addEventListener('submit',e=>{
  e.preventDefault();const f=Object.fromEntries(new FormData(e.currentTarget));
  if(f.from>=f.until){message(t('range'),true);return;}run('adminAvailability',{change:'open',...f});
});
$('#refresh').addEventListener('click',()=>run('adminList'));
$('#meeting-filter').addEventListener('change',renderLists);
$('#signout').addEventListener('click',()=>{lockScreen();$('#staff-key').focus();});
$('#admin-lang').addEventListener('click',()=>{lang=lang==='fa'?'en':'fa';try{sessionStorage.setItem('vh-lang',lang);}catch(_){}translate();message();});
window.addEventListener('pagehide',lockScreen);
$('#staff-date').min=dateKey(Date.now());$('#staff-date').value=dateKey(Date.now()+3*86400000);
translate();

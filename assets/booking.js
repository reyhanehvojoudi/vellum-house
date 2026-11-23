import {request,formatDate,dateKey,clock,longDate,el,button} from './calendar-api.js?v=10';
const lang=document.documentElement.lang, fa=lang==='fa';
const tx=(en,faText) => fa ? faText : en;
const DAY=86400000, UUID=/^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i;
let activeKey='', lastAttempt, firstCalendar, state, selectedDay='',selectedTime=null, month=0, busy=false, pending=false, version=0;
function store(k,v) { try {sessionStorage.setItem(k,v);return true;}catch(_){return false;} }
function read(k) { try{return sessionStorage.getItem(k);}catch(_){return null;} }
async function attempt(fields) {
  const signature=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(fields))))).map(v=>v.toString(16).padStart(2,'0')).join('');
  try{lastAttempt ||= JSON.parse(read('vh-enquiry-attempt'));}catch(_){}
  if (lastAttempt?.signature!==signature) {
    lastAttempt={signature,requestId:crypto.randomUUID(),key:crypto.randomUUID()};
    store('vh-enquiry-attempt',JSON.stringify(lastAttempt));
  }
  return lastAttempt;
}
function failure(code) {
  if (code==='rate') return tx('We have already received several enquiries for this address. Use the private calendar link in your email to continue.','چند درخواست با این نشانی ثبت شده است. برای ادامه، پیوند اختصاصی تقویم را در پیام دریافتی باز کنید.');
  if (code==='invalid') return tx('Please check the contact details and required fields, then submit again.','لطفاً اطلاعات تماس و موارد ستاره‌دار را بررسی کنید و دوباره درخواست را بفرستید.');
  if (code==='busy') return tx('Another booking is being saved. Please try again in a moment.','رزرو دیگری در حال ثبت است. چند لحظهٔ دیگر دوباره تلاش کنید.');
  return tx('We could not verify the request. Please try again. You can also reach us through Contact us.','ثبت درخواست تأیید نشد. دوباره تلاش کنید یا از بخش «تماس با ما» پیام بدهید.');
}
export async function submitEnquiry(form) {
  if (pending || !form.reportValidity()) return;
  const values=Object.fromEntries(new FormData(form)), status=form.querySelector('#enquiry-status'),submit=form.querySelector('[type=submit]');
  if (values.website) return;
  const phone=form.elements.phone;
  if (phone.value.trim() && !/^\+?[0-9۰-۹٠-٩ ()\-]{6,40}$/.test(phone.value.trim())) {
    phone.setCustomValidity(tx('Enter a valid phone number or leave the field blank.','شمارهٔ تماس را اصلاح کنید یا این بخش را خالی بگذارید.'));
    phone.reportValidity();phone.addEventListener('input',()=>phone.setCustomValidity(''),{once:true});return;
  }
  pending=true;submit.disabled=true;form.setAttribute('aria-busy','true'); status.className='status';
  status.textContent=tx('Saving your enquiry…','در حال ثبت درخواست…');
  try {
    const {requestId,key} = await attempt(values);
    const source = (new URLSearchParams(location.search).get('utm_source') || 'website').slice(0,300);
    const result=await request('enquiry',{...values,enquiryId:requestId,key,language:lang,source});
    if (!result.ok || result.saved!==true || !Array.isArray(result.slots)) throw new Error(result.code || 'service');
    activeKey=key;const persisted=store('vh-calendar-key',key);firstCalendar={key,result};
    status.textContent=tx('Enquiry saved.','درخواست ثبت شد.');
    if (form.isConnected) location.hash=persisted?'calendar':'calendar/'+key;
  } catch (err) {status.textContent=failure(err.message);status.className='status error';}
  finally {pending=false;submit.disabled=false;form.removeAttribute('aria-busy');}
}
function calendarBox() {return document.getElementById('calendar-area');}
function moveFocus(selector) {calendarBox()?.querySelector(selector)?.focus({preventScroll:true});}
function copyLink(label,hash) {const a=el('a','btn outline',label);a.href=hash;return a;}
function resetHeading() {
  const section=calendarBox()?.closest('section'); if (!section) return;
  const title=section.querySelector('h1'),intro=section.querySelector('#calendar-intro');
  if (!title.dataset.original) {title.dataset.original=title.innerHTML;intro.dataset.original=intro.textContent;}
  title.innerHTML=title.dataset.original;intro.textContent=intro.dataset.original;
}
export async function openCalendar(fromLink='') {
  const id=++version,box=calendarBox();if (!box) return;
  busy=false;resetHeading();
  if (fromLink) {
    if (!UUID.test(fromLink)) {presentMissing(box);return;}
    activeKey=fromLink;
    if (store('vh-calendar-key',activeKey)) history.replaceState(history.state,'',location.pathname+location.search+'#calendar');
  } else activeKey=activeKey || read('vh-calendar-key') || '';
  if (!UUID.test(activeKey)) {presentMissing(box);return;}
  box.setAttribute('aria-busy','true');box.replaceChildren(el('p','status',tx('Loading available times…','در حال دریافت وقت‌های آزاد…')));
  try {
    let data;
    if (firstCalendar?.key===activeKey) {data=firstCalendar.result;firstCalendar=null;}
    else data=await request('calendar',{key:activeKey});
    if (id!==version || !box.isConnected) return;
    if (data.code==='missing') {presentMissing(box);return;}
    if (!data.ok || !Array.isArray(data.slots)) throw new Error(data.code);
    updateState(data); draw();
  } catch (_) {
    if (id!==version || !box.isConnected) return;
    box.replaceChildren(el('p','error',tx('The calendar could not be loaded. Your enquiry is saved.','تقویم باز نشد. درخواست شما ثبت شده است.')),
      button(tx('Try again','تلاش دوباره'),'text-button',()=>openCalendar()));
  } finally {if (id===version) box.removeAttribute('aria-busy');}
}
function presentMissing(box) {
  box.removeAttribute('aria-busy');box.replaceChildren(el('h2','',tx('Start with an enquiry','ابتدا فرم مشاوره را تکمیل کنید')),
    el('p','subtle',tx('Complete the enquiry form to choose a time, or use the private calendar link in your acknowledgement email.','برای انتخاب وقت، فرم مشاوره را تکمیل کنید یا پیوند اختصاصی تقویم را از پیام تأیید درخواست باز کنید.')),
    copyLink(tx('Open enquiry form','فرم درخواست مشاوره'),'#consult'));
}
function noon(day) {return Date.parse(day+'T12:00:00Z');}
const monthName=ms=>formatDate(ms,lang,{year:'numeric',month:'long'});
function startOfMonth(ms) {
  let day=noon(dateKey(ms)), label=monthName(day);
  while (monthName(day-DAY)===label) day-=DAY;
  return day;
}
function nextMonth(start) {
  let day=start+28*DAY;const label=monthName(start);
  while (monthName(day)===label) day+=DAY;
  return day;
}
function updateState(data) {
  state=data;
  const days=new Set(data.slots.map(dateKey));
  if (!days.has(selectedDay)) selectedDay=data.slots.length ? dateKey(data.slots[0]) : '';
  if (!data.slots.includes(selectedTime)) selectedTime=null;
  month=startOfMonth(selectedDay ? noon(selectedDay) : data.min);
}
function monthControl(label,delta,disabled) {
  const left=fa ? delta>0 : delta<0;
  const node=button('', 'arrow '+(left?'left':'right'),()=>{
    month=delta<0?startOfMonth(month-DAY):nextMonth(month);draw();moveFocus('.calendar-head h2');
  });
  node.disabled=disabled;node.setAttribute('aria-label',label);return node;
}
function makeGrid() {
  const grid=el('div','date-grid'),startWeek=fa?6:1,active=new Set(state.slots.map(dateKey));
  for(let i=0;i<7;i++){
    // 7 January 2024 is a Sunday; noon UTC stays on the same day in Tehran.
    const stamp=Date.UTC(2024,0,7+(startWeek+i)%7,12);
    const full=formatDate(stamp,lang,{weekday:'long'});
    const node=el('span','weekday',fa?['ش','ی','د','س','چ','پ','ج'][i]:formatDate(stamp,lang,{weekday:'short'}));
    node.title=full;node.setAttribute('aria-label',full);grid.append(node);
  }
  const offset=(new Date(month).getUTCDay()-startWeek+7)%7,end=nextMonth(month);
  for(let i=0;i<offset;i++)grid.append(el('span'));
  for(let d=month;d<end;d+=DAY) {
    const day=dateKey(d),node=button(formatDate(d,lang,{day:'numeric'}),'day',()=>{
      selectedDay=day;selectedTime=null;draw();moveFocus('[data-date="'+day+'"]');
    });
    node.dataset.date=day;node.disabled=!active.has(day);
    node.setAttribute('aria-label',longDate(d,lang));node.setAttribute('aria-pressed',String(selectedDay===day));
    grid.append(node);
  }
  return grid;
}
function draw(message='') {
  const box=calendarBox();if (!box) return;
  box.replaceChildren();box.removeAttribute('aria-busy');
  if (state.booking) {showConfirmation(box,state.booking);return;}
  const header=el('div','calendar-head'),h=el('h2','',monthName(month)); h.tabIndex=-1; header.append(h);
  const controls=el('div','month-controls');
  controls.append(monthControl(tx('Previous month','ماه پیشین'),-1,month<=startOfMonth(state.min)),
    monthControl(tx('Next month','ماه بعد'),1,nextMonth(month)>startOfMonth(state.max)));
  header.append(controls);box.append(header,makeGrid());
  const times=el('div','times-area');box.append(times);
  if (message) {const msg=el('p','status error',message);msg.setAttribute('role','alert');times.append(msg);}
  if (!state.slots.length) {
    times.append(el('h3','',tx('No times are open yet','در حال حاضر وقت آزادی نیست')),
      el('p','subtle',tx('Your enquiry is saved. Return using the private link in your email, or message the team to arrange a time.','درخواست شما ثبت شده است. می‌توانید بعداً با پیوند اختصاصی در ایمیل به تقویم برگردید یا برای هماهنگی وقت به تیم ما پیام بدهید.')),
      copyLink(tx('Contact the team','تماس با تیم ولوم هاوس'),'#contact'));
  } else if (selectedDay && monthName(noon(selectedDay))===monthName(month)) {
    times.append(el('h3','',longDate(noon(selectedDay),lang)));
    const list=el('div','time-list');
    for(const start of state.slots.filter(t=>dateKey(t)===selectedDay)) {
      const node=button(clock(start,lang),'time-choice',()=>{selectedTime=start;draw();moveFocus('[data-time="'+start+'"]');});
      node.dataset.time=start;node.setAttribute('aria-pressed',String(start===selectedTime));list.append(node);
    }
    times.append(list);
    const confirm=button(tx('Confirm this consultation','تأیید و رزرو جلسه'),'btn solid',confirmTime);
    confirm.id='confirm-time';confirm.disabled=selectedTime===null;times.append(confirm);
  } else times.append(el('p','subtle',tx('Select a highlighted date to see its times.','برای دیدن ساعت‌ها، یکی از روزهای مشخص‌شده را انتخاب کنید.')));
  const refresh=button(tx('Refresh availability','به‌روزرسانی وقت‌ها'),'text-button',()=>openCalendar());
  const actions=el('div','actions');actions.append(refresh);box.append(actions);
}
async function confirmTime() {
  if (busy || selectedTime===null) return;
  const ticket=++version, box=calendarBox();busy=true;
  box.querySelectorAll('button').forEach(b=>b.disabled=true);box.setAttribute('aria-busy','true');
  const sending=el('p','status',tx('Confirming your time…','در حال تأیید زمان جلسه…'));sending.setAttribute('role','status');box.append(sending);
  try {
    const result=await request('book',{key:activeKey,start:selectedTime});
    if (ticket!==version || !box.isConnected) return;
    if (result.code==='unavailable' && Array.isArray(result.slots)) {
      updateState(result);draw(tx('That time has just become unavailable. Choose another time.','این وقت دیگر آزاد نیست. لطفاً وقت دیگری انتخاب کنید.'));return;
    }
    if(!result.ok || !result.booking)throw new Error(result.code);
    updateState(result);draw();moveFocus('[data-confirmation]');
  } catch (_) {
    if(ticket===version && box.isConnected)draw(tx('We could not verify the booking. Refresh availability to check its status, or retry.','رزرو هنوز تأیید نشده است. برای بررسی وضعیت، وقت‌ها را به‌روزرسانی کنید یا دوباره تلاش کنید.'));
  } finally {if(ticket===version){busy=false;box.removeAttribute('aria-busy');}}
}
function showConfirmation(box,booking) {
  const section=box.closest('section');
  section.querySelector('h1').textContent=tx('Your consultation is booked.','جلسهٔ مشاورهٔ شما رزرو شد.');
  section.querySelector('#calendar-intro').textContent=tx('Keep this page or your private email link to view the booking again.','برای مشاهدهٔ دوبارهٔ جزئیات، این صفحه یا پیوند اختصاصی در ایمیل خود را نگه دارید.');
  const heading=el('h2','',tx('Booking confirmed','تأیید رزرو'));heading.dataset.confirmation='';heading.tabIndex=-1;
  const time=el('p','confirmation-date',longDate(booking.start,lang)+' · '+clock(booking.start,lang)+' '+tx('(Tehran)','(به وقت تهران)'));
  const code=el('bdi','',booking.ref),reference=el('p','subtle',tx('Booking reference ','شناسهٔ رزرو '));code.dir='ltr';reference.append(code);
  box.append(heading,time,reference,el('p','subtle',tx('Our team will email the joining details before the meeting.','تیم ولوم هاوس پیش از جلسه، جزئیات ورود را برایتان می‌فرستد.')));
  const actions=el('div','actions');actions.append(button(tx('Add to my calendar','افزودن به تقویم من'),'btn solid',()=>downloadEvent(booking)));box.append(actions);
}
function downloadEvent({start,ref}) {
  const stamp=n=>new Date(n).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Vellum House//Consultations//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',
    'UID:'+start+'-'+ref+'@vhouse.ir','DTSTAMP:'+stamp(Date.now()),'DTSTART:'+stamp(start),'DTEND:'+stamp(start+1800000),
    'SUMMARY:Vellum House consultation','LOCATION:Online','END:VEVENT','END:VCALENDAR',''];
  const url=URL.createObjectURL(new Blob([lines.join('\r\n')],{type:'text/calendar;charset=utf-8'})),a=el('a');
  a.href=url;a.download='Vellum-House-consultation.ics';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
}

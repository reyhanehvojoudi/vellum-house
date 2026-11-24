import {request,dateKey,clock,longDate,button,el} from './calendar-api.js?v=11';
const labels={
  title:['Consultation dashboard','مدیریت وقت‌های مشاوره'],login:['Staff sign-in','ورود همکاران'],key:['Staff access key','کلید دسترسی همکاران'],signin:['Sign in','ورود'],signout:['Sign out','خروج'],
  avail:['Availability','زمان‌های در دسترس'],rules:['Set weekly hours or change one date. All times are in Tehran.','برای روزهای هفته ساعت تعیین کنید یا برای یک تاریخ خاص برنامهٔ جداگانه بگذارید. همهٔ ساعت‌ها به وقت تهران است.'],
  weekly:['Weekly hours','برنامهٔ هفتگی'],specific:['One date','تاریخ مشخص'],weekday:['Day of the week','روز هفته'],date:['Date (Gregorian)','تاریخ (میلادی)'],
  hours:['Availability for this day','وضعیت این روز'],part:['Selected hours','بازه‌های زمانی مشخص'],full:['All day · 00:00–24:00','تمام روز · ۰۰:۰۰ تا ۲۴:۰۰'],off:['Unavailable all day','تمام روز بسته'],
  from:['From','از'],until:['Until','تا'],addRange:['+ Add another time range','+ افزودن بازهٔ زمانی دیگر'],remove:['Remove range','حذف بازه'],saveHours:['Save hours','ذخیرهٔ زمان‌ها'],revert:['Remove this rule','حذف این تنظیم'],
  settings:['Meeting settings','تنظیمات جلسه'],duration:['Meeting duration','مدت هر جلسه'],interval:['Offer a start time every','فاصلهٔ بین ساعت‌های شروع'],mins:['minutes','دقیقه'],saveSettings:['Save settings','ذخیرهٔ تنظیمات'],saved:['Published schedule','برنامهٔ ثبت‌شده'],emptySchedule:['No hours published yet.','هنوز زمانی برای رزرو ثبت نشده است.'],edit:['Edit','ویرایش'],
  meetings:['Booked meetings','جلسه‌های رزروشده'],refresh:['Refresh','به‌روزرسانی'],show:['Show','نمایش'],upcoming:['Upcoming','پیش رو'],past:['Past','گذشته'],allMeetings:['All meetings','همهٔ جلسه‌ها'],empty:['No meetings in this view.','جلسه‌ای در این فهرست ثبت نشده است.'],
  saving:['Saving…','در حال ذخیره…'],loading:['Opening the dashboard…','در حال دریافت اطلاعات…'],updated:['Changes saved.','تغییرات ذخیره شد.'],auth:['The staff key was not accepted.','کلید دسترسی همکاران پذیرفته نشد.'],
  service:['Could not verify the change. Refresh and check the saved schedule.','تغییرات تأیید نشد. صفحه را به‌روزرسانی و برنامهٔ ثبت‌شده را بررسی کنید.'],range:['Check that each range ends after it starts and that ranges do not overlap.','پایان هر بازه باید بعد از شروع آن باشد و بازه‌ها نباید هم‌پوشانی داشته باشند.'],
  pastError:['Choose today or a future date.','امروز یا یکی از روزهای آینده را انتخاب کنید.'],stale:['Another staff member changed the schedule. The latest version is shown. Review your edit before saving.','یکی از همکاران برنامه را تغییر داده است. آخرین نسخه نمایش داده می‌شود. پیش از ذخیره، ویرایش خود را بررسی کنید.'],
  setup:['Deploy the included booking service and run setup first.','ابتدا سرویس رزرو را منتشر و تابع setup را اجرا کنید.'],busy:['The calendar is busy. Try again in a moment.','تقویم در حال ثبت تغییر است. چند لحظهٔ دیگر دوباره تلاش کنید.'],
  openMeet:['Open Google Meet','ورود به گوگل میت'],Confirmed:['Confirmed','تأییدشده'],Reserved:['Waiting for Google Calendar / Meet','در انتظار تأیید گوگل کلندر یا میت'],Imported:['Existing V10 booking','رزرو نسخهٔ قبلی'],Cancelled:['Cancelled','لغوشده'],Conflict:['Needs a new time','نیازمند انتخاب وقت جدید'],legacy:['Previously published times','وقت‌های ثبت‌شده در نسخهٔ قبلی'],
  none:['No times will be offered.','هیچ وقتی برای رزرو نمایش داده نمی‌شود.'],coverage:['Possible starts before calendar conflicts','تعداد وقت‌ها پیش از بررسی تداخل با تقویم']
};
const $=s=>document.querySelector(s), daysEn=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],daysFa=['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه','شنبه'];
let lang='fa',secret='',data=null,scope='weekly',working=false,generation=0;
try{if(sessionStorage.getItem('vh-lang')==='en')lang='en';}catch(_){}
const fa=()=>lang==='fa', t=k=>labels[k][fa()?1:0], number=n=>Number(n).toLocaleString(fa()?'fa-IR':'en-US');
const weekday=n=>(fa()?daysFa:daysEn)[n];
function message(text='',error=false){$('#admin-status').textContent=text;$('#admin-status').className='status'+(error?' error':'');}
function minutesClock(v){return String(Math.floor(v/60)).padStart(2,'0')+':'+String(v%60).padStart(2,'0');}
function localizedClock(v){return minutesClock(v).replace(/\d/g,c=>number(+c));}
function toMinute(value){const [h,m]=value.split(':').map(Number);return h*60+m;}
function optionList(select,values,format,initial){const old=select.value;select.replaceChildren(...values.map(v=>new Option(format(v),v)));select.value=values.map(String).includes(old)?old:String(initial);}
function addRange(a=9*60,b=17*60){
  const row=el('div','hours-row');
  for(const [name,val] of [['from',a],['until',b]]){
    const label=el('label','',t(name)),input=el('input');
    input.type='time';input.step='60';input.dir='ltr';input.required=true;input.dataset.bound=name;
    input.value=minutesClock(val===1440?0:val);
    input.addEventListener('input',preview);label.append(input);row.append(label);
  }
  const remove=button('×','remove-range',()=>{row.remove();preview();});
  remove.setAttribute('aria-label',t('remove'));row.append(remove);$('#ranges').append(row);
}
function ranges(){
  return [...document.querySelectorAll('.hours-row')].map(row=>{
    const [start,end]=[...row.querySelectorAll('input')].map(input=>toMinute(input.value));
    return [start,end===0?1440:end];
  });
}
function valid(list){const sorted=list.slice().sort((a,b)=>a[0]-b[0]);return sorted.length>0 && sorted.every(([a,b],i)=>a<b && (!i || a>=sorted[i-1][1]));}
function currentKey(){return scope==='weekly'?'W:'+$('#weekday').value:'D:'+$('#staff-date').value;}
function preview(){
  const mode=$('#rule-mode').value,list=mode==='all'?[[0,1440]]:ranges(),policy=data?.policy || {duration:30,interval:30};
  $('#ranges-field').hidden=mode!=='hours';
  $('#ranges').querySelectorAll('input').forEach(input=>input.disabled=working || mode!=='hours');
  $('#staff-date').disabled=working || scope!=='date';$('#staff-date').required=scope==='date';
  $('#weekday').disabled=working || scope!=='weekly';
  const count=list.reduce((sum,[a,b])=>sum+Math.max(0,Math.floor((b-a-policy.duration)/policy.interval)+1),0);
  $('#rule-preview').textContent=mode==='off'?t('none'):!valid(list)?t('range'):t('coverage')+' · '+number(count);
  $('#add-range').disabled=working || list.length>=12;
  document.querySelectorAll('.remove-range').forEach(b=>b.disabled=working || list.length===1);
}
function example(){
  const d=+$('#duration').value,i=+$('#interval').value;
  const examples=[540,540+i,540+i*2].map(localizedClock).join(fa()?'، ':', ');
  $('#interval-example').textContent=fa()?'نمونهٔ ساعت‌های شروع: '+examples+' · مدت هر جلسه '+number(d)+' دقیقه.':'Example starts: '+examples+'. Each meeting lasts '+number(d)+' minutes.';
}
function loadEditor(){
  $('#week-field').hidden=scope!=='weekly';$('#date-field').hidden=scope!=='date';
  document.querySelectorAll('[data-scope]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scope===scope)));
  const rule=data?.rules.find(r=>r.key===currentKey());
  $('#rule-mode').value=rule?.mode || 'hours';$('#revert').hidden=!rule;$('#ranges').replaceChildren();
  (rule?.ranges?.length?rule.ranges:[[540,1020]]).forEach(([a,b])=>addRange(a,b));preview();
}
function keyLabel(key){return key.startsWith('W:')?weekday(+key.slice(2)):longDate(Date.parse(key.slice(2)+'T12:00:00Z'),lang);}
function editKey(key){
  scope=key.startsWith('W:')?'weekly':'date';if(scope==='weekly')$('#weekday').value=key.slice(2);else $('#staff-date').value=key.slice(2);
  loadEditor();$('#rule-form').scrollIntoView({block:'center'});$('#rule-mode').focus({preventScroll:true});
}
function renderLists(){
  const list=$('#saved-rules');list.replaceChildren();
  for(const r of data.rules){
    const item=el('li','slot'),desc=el('div');desc.append(el('strong','',keyLabel(r.key)),el('p','',r.mode==='hours'?r.ranges.map(([a,b])=>localizedClock(a)+'–'+localizedClock(b)).join(' / '):t(r.mode==='all'?'full':'off')));
    item.append(desc,button(t('edit'),'text-button',()=>editKey(r.key)));list.append(item);
  }
  for(const day of data.legacyDays || []){
    const k='D:'+day,w='W:'+new Date(day+'T12:00Z').getUTCDay();
    if(data.rules.some(r=>r.key===k || r.key===w))continue;
    const item=el('li','slot');item.append(el('span','',keyLabel(k)+' · '+t('legacy')),button(t('edit'),'text-button',()=>editKey(k)));list.append(item);
  }
  if(!list.children.length)list.append(el('li','subtle',t('emptySchedule')));
  const meets=$('#meeting-list'),filter=$('#meeting-filter').value;meets.replaceChildren();
  let matches=data.booked.filter(m=>filter==='all' || (filter==='past'?m.end<Date.now():m.end>=Date.now()));
  if(filter==='past')matches=matches.slice().reverse();
  if(!matches.length)meets.append(el('li','subtle',t('empty')));
  for(const m of matches){
    const item=el('li'),name=el('bdi','',m.name),details=el('p');details.append(el('bdi','',m.email),' · ',el('bdi','',m.phone));
    item.append(el('strong','',longDate(m.start,lang)+' · '+clock(m.start,lang)+'–'+clock(m.end,lang)),el('p','',t(m.status)),name,details,el('p','',m.topic));
    if(/^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}\/?$/.test(m.meet||'')){const a=el('a','ink-link',t('openMeet'));a.href=m.meet;a.target='_blank';a.rel='noreferrer';item.append(a);}
    meets.append(item);
  }
}
function translate(){
  document.documentElement.lang=lang;document.documentElement.dir=fa()?'rtl':'ltr';
  $('#rule-form .segmented').setAttribute('aria-label',t('avail'));
  $('#admin-home').href=fa()?'index.html':'en.html';$('#admin-lang').textContent=fa()?'English':'فارسی';
  document.querySelectorAll('[data-text]').forEach(n=>n.textContent=t(n.dataset.text));
  optionList($('#weekday'),fa()?[6,0,1,2,3,4,5]:[1,2,3,4,5,6,0],weekday,fa()?6:1);
  optionList($('#duration'),[15,20,30,45,60,90,120],n=>number(n)+' '+t('mins'),30);
  optionList($('#interval'),[5,10,15,20,30,45,60,90,120],n=>number(n)+' '+t('mins'),30);
  loadEditor();example();if(data)renderLists();
}
function show(enabled){$('#login').hidden=enabled;$('#panels').hidden=!enabled;$('#signout').hidden=!enabled;}
function lockScreen(){generation++;working=false;secret='';data=null;$('#staff-key').value='';$('#meeting-list').replaceChildren();$('#saved-rules').replaceChildren();show(false);message();setBusy(false);}
function setBusy(on){
  working=on;document.querySelectorAll('main button,main select,main input').forEach(n=>n.disabled=on);
  if(!on)preview();
}
function apply(response){data=response;$('#duration').value=data.policy.duration;$('#interval').value=data.policy.interval;loadEditor();renderLists();example();show(true);}
async function run(action,fields={}){
  if(working)return;const ticket=++generation;setBusy(true);message(t(action==='adminList'?'loading':'saving'));
  try{
    const payload=action==='adminList'?{}:{revision:data.revision,operationId:crypto.randomUUID()};
    const response=await request(action,{...fields,...payload,adminKey:secret});if(ticket!==generation)return;
    if(!response.ok){
      if(response.code==='auth'){lockScreen();message(t('auth'),true);$('#staff-key').focus();return;}
      if(response.code==='stale'){const fresh=await request('adminList',{adminKey:secret});if(ticket!==generation)return;if(fresh.ok)apply(fresh);}
      throw new Error(response.code);
    }
    apply(response);message(action==='adminList'?'':t('updated'));$('#staff-key').value='';
  }catch(err){if(ticket===generation)message(t(({past:'pastError',range:'range',busy:'busy',stale:'stale',setup:'setup'})[err.message]||'service'),true);}
  finally{if(ticket===generation)setBusy(false);}
}
$('#login-form').addEventListener('submit',e=>{e.preventDefault();secret=$('#staff-key').value.trim();run('adminList');});
document.querySelectorAll('[data-scope]').forEach(b=>b.addEventListener('click',()=>{scope=b.dataset.scope;loadEditor();}));
for(const sel of ['#staff-date','#weekday'])$(sel).addEventListener('change',loadEditor);
$('#rule-mode').addEventListener('change',preview);
$('#add-range').addEventListener('click',()=>{const last=ranges().at(-1)?.[1]||0,a=Math.min(1380,last+60);addRange(a,Math.min(1440,a+60));preview();});
$('#rule-form').addEventListener('submit',e=>{
  e.preventDefault();const mode=$('#rule-mode').value,list=mode==='hours'?ranges():[];
  if(mode==='hours' && !valid(list)){message(t('range'),true);return;}
  if(scope==='date' && !$('#staff-date').value){$('#staff-date').focus();return;}
  run('adminSchedule',{ruleKey:currentKey(),mode,ranges:JSON.stringify(list)});
});
$('#revert').addEventListener('click',()=>run('adminSchedule',{ruleKey:currentKey(),mode:'inherit'}));
$('#settings-form').addEventListener('submit',e=>{e.preventDefault();run('adminSettings',{duration:$('#duration').value,interval:$('#interval').value});});
for(const sel of ['#duration','#interval'])$(sel).addEventListener('change',example);
$('#refresh').addEventListener('click',()=>run('adminList'));$('#meeting-filter').addEventListener('change',renderLists);
$('#signout').addEventListener('click',()=>{lockScreen();$('#staff-key').focus();});
$('#admin-lang').addEventListener('click',()=>{lang=fa()?'en':'fa';try{sessionStorage.setItem('vh-lang',lang);}catch(_){}translate();});
window.addEventListener('pagehide',lockScreen);
$('#staff-date').min=dateKey(Date.now());$('#staff-date').value=dateKey(Date.now()+3*86400000);translate();

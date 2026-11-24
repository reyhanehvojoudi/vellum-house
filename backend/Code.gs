/* Sheet-bound Apps Script. Run setup in the private Enquiries spreadsheet. */
const VH = {
  leads: 'Enquiries', times: 'Consultation times', zone: 'Asia/Tehran',
  notify: 'vellumhouse.edu@gmail.com', site: 'https://vhouse.ir',
  halfHour: 30 * 60 * 1000, notice: 48 * 3600000, horizon: 14 * 86400000,
  leadHeaders: ['Received at','Request ID','Contact name','Email','Phone','Grade / level',
    'Service interest','Goals / message','Language','Lead source','Consent','Lead status',
    'Booking status','Follow-up date','Last contacted','Internal notes','Admin email',
    'Applicant email','Last delivery error','Private booking key','Birthday (ISO)','Education stage','Major / field','School / institution'],
  timeHeaders: ['Consultation starts','Availability','Enquiry ID','Booked at','Team confirmation','Family confirmation'],
  bookings:'Bookings', rules:'Availability rules',
  bookingHeaders:['Enquiry ID','Start','End','Student / contact','Student email','Phone','Status','Calendar ID','Event ID','Google Meet URL','Reserved at','Team email','Student email delivery','Sync details','Notification type','iCalendar UID'],
  ruleHeaders:['Rule key','Mode','Time ranges (minutes)','Updated at'],
  uuid: /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i
};
const TOPICS = {
  planning:['Assessment, planning & mentoring','ارزیابی، برنامه‌ریزی و منتورینگ'],
  learning:['Classes & exam preparation','کلاس‌ها و آمادگی آزمون'],
  opportunities:['Competitions, research & internships','رقابت‌ها، پژوهش و کارآموزی'],
  admission:['Admissions & scholarships','پذیرش و بورسیه'], guidance:['Help choosing a starting point','راهنمایی برای انتخاب مسیر'],
  full:['Academic planning','برنامه‌ریزی جامع تحصیلی'], talent:['Talent assessment','ارزیابی استعدادها'],
  courses:['Subject teaching and exams','کلاس‌های درسی و آمادگی آزمون'], mentoring:['Mentoring and progress reviews','مشاوره و پیگیری پیشرفت'],
  olympiads:['Competitions and Olympiads','مسابقات و المپیادها'], admissions:['University admissions','پذیرش دانشگاه'],
  konkur:['Iranian university entrance exam','آمادگی کنکور'], other:['Help choosing a service','راهنمایی برای انتخاب خدمات']
};

function properties_() { return PropertiesService.getScriptProperties(); }
function ensureTab_(book,name,headers) {
  const tab=book.getSheetByName(name) || book.insertSheet(name);
  if (tab.getMaxColumns()<headers.length) tab.insertColumnsAfter(tab.getMaxColumns(),headers.length-tab.getMaxColumns());
  const row=tab.getRange(1,1,1,headers.length), old=row.getValues()[0];
  headers.forEach((header,i)=>{
    if (old[i] && old[i]!==header) throw new Error('Review '+name+' column '+(i+1)+'. Expected '+header+'. Existing data was preserved.');
  });
  row.setValues([headers]);tab.setFrozenRows(1);return tab;
}
function setup() {
  const book=SpreadsheetApp.getActiveSpreadsheet();
  if(!book)throw new Error('Open Apps Script from the private Vellum House spreadsheet.');
  const props=properties_();
  const calendar=Calendar.Calendars.get(props.getProperty('VH_CALENDAR_ID') || 'primary');
  if (!calendar.id || !(calendar.conferenceProperties?.allowedConferenceSolutionTypes || []).includes('hangoutsMeet')) {
    throw new Error('Select a Google Calendar that supports Google Meet in VH_CALENDAR_ID.');
  }
  withLock_(()=>{
    props.setProperty('VH_SHEET_ID',book.getId());props.setProperty('VH_CALENDAR_ID',calendar.id);
    if(!props.getProperty('VH_ADMIN_KEY'))props.setProperty('VH_ADMIN_KEY',Utilities.getUuid()+Utilities.getUuid());
    const leads=ensureTab_(book,VH.leads,VH.leadHeaders);
    const times=ensureTab_(book,VH.times,VH.timeHeaders);
    const bookings=ensureTab_(book,VH.bookings,VH.bookingHeaders);
    ensureTab_(book,VH.rules,VH.ruleHeaders);
    leads.getRange('D:E').setNumberFormat('@');leads.getRange('T:X').setNumberFormat('@');
    bookings.getRange('D:J').setNumberFormat('@');
    bookings.getRange('B:C').setNumberFormat('yyyy-mm-dd hh:mm');
    importV10_({leads,times,bookings});
    if(!ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()==='retryEmails')) {
      ScriptApp.newTrigger('retryEmails').timeBased().everyMinutes(5).create();
    }
  });
  MailApp.getRemainingDailyQuota();
}
function store_() {
  const id=properties_().getProperty('VH_SHEET_ID');
  need_(id,'setup');
  const book=SpreadsheetApp.openById(id),result={};
  for(const key of ['leads','times','bookings','rules']){
    result[key]=book.getSheetByName(VH[key]);need_(result[key],'setup');
  }
  return result;
}
function records_(sheet, count) {
  const n = sheet.getLastRow() - 1;
  return n > 0 ? sheet.getRange(2,1,n,count).getValues() : [];
}
function findRow_(sheet, column, value) {
  const n = sheet.getLastRow() - 1;
  if (!value || n < 1) return 0;
  const match = sheet.getRange(2,column,n,1).createTextFinder(value).matchEntireCell(true).useRegularExpression(false).findNext();
  return match ? match.getRow() : 0;
}
function safe_(value) {
  const s = String(value || '').trim();
  return /^[=+@-]/.test(s) ? "'" + s : s;
}
function text_(value) { return String(value || '').replace(/^'(?=[=+@-])/, ''); }
function instant_(value) { return value instanceof Date ? value.getTime() : Number(value); }
function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
function reply_(p, value) {
  if (p.transport !== 'frame') return json_(value);
  const extra = PropertiesService.getScriptProperties().getProperty('VH_SITE_ORIGIN');
  const allowed = [VH.site, 'https://www.vhouse.ir','https://reyhanehvojoudi.github.io',extra].filter(Boolean);
  if (!allowed.includes(p.origin) || !VH.uuid.test(p.channel || '')) return json_({ok:false, code:'origin'});
  // Send only to the requesting site, including when Google wraps this response in its own iframe.
  const envelope = JSON.stringify({type:'vh-calendar', channel:p.channel, result:value}).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  const script = '<script>let w=window;while(w!==w.parent){w=w.parent;w.postMessage(' + envelope + ',' + JSON.stringify(p.origin) + ');}</script>';
  return HtmlService.createHtmlOutput(script).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function need_(condition, code) { if (!condition) throw new Error(code); }
function withLock_(fn) {
  const lock = LockService.getScriptLock();
  need_(lock.tryLock(12000),'busy');
  try { const result = fn(); SpreadsheetApp.flush(); return result; }
  finally { lock.releaseLock(); }
}
function admin_(key) {
  const expected = PropertiesService.getScriptProperties().getProperty('VH_ADMIN_KEY');
  need_(expected && expected.length >= 24 && typeof key === 'string' && key.length === expected.length, 'auth');
  let mismatch = 0;
  for (let i=0;i<key.length;i++) mismatch |= key.charCodeAt(i) ^ expected.charCodeAt(i);
  need_(mismatch === 0, 'auth');
}

function doPost(e) {
  const p=e?.parameter || {},action=p.action || 'legacy';
  try {
    if(action.startsWith('admin'))admin_(p.adminKey);
    const db=store_();let result;
    switch(action){
      case 'legacy': case 'enquiry': result=withLock_(()=>saveEnquiry_(db,p,action==='legacy'));break;
      case 'calendar': result=publicCalendar_(db,identity_(db,p.key).id);break;
      case 'book': result=withLock_(()=>reserve_(db,p));break;
      case 'adminList': result=management_(db);break;
      case 'adminSchedule': case 'adminSettings':
        result=withLock_(()=>editSchedule_(db,action,p));break;
      default:throw new Error('invalid');
    }
    return reply_(p,Object.assign({version:11},result));
  }catch(error){
    const known=['invalid','auth','setup','rate','busy','missing','unavailable','past','booked','range','stale','calendar'];
    return reply_(p,{version:11,ok:false,saved:false,code:known.includes(error.message)?error.message:'service'});
  }
}
function doGet(e) {
  // Older cached releases can still verify their own enquiry receipt.
  const p = e && e.parameter || {};
  if (!/^vhReceipt_[a-f0-9]{32}$/.test(p.callback || '') || !VH.uuid.test(p.requestId || '')) return json_({ok:false});
  let saved = false;
  try { saved = !!findRow_(store_().leads,2,p.requestId); } catch (_) {}
  return ContentService.createTextOutput(p.callback + '(' + JSON.stringify({saved:saved}) + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function gradeValid_(level,grade,lang) {
  const bounds=level==='elementary'?[1,6]:level==='middle'&&lang==='en'?[6,8]:level==='high'?[lang==='fa'?7:9,12]:null;
  if(bounds){const match=/^grade-(\d{1,2})$/.exec(grade);return !!match && +match[1]>=bounds[0] && +match[1]<=bounds[1];}
  if(['college','undergrad'].includes(level))return /^year-[1-6]$/.test(grade);
  return level==='grad' && ['masters','doctoral','postgrad-other'].includes(grade);
}
function validBirthday_(value) {
  if(!value)return true;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value) || value>dayKey_(Date.now()))return false;
  const d=new Date(value+'T12:00:00Z');
  return isFinite(d.getTime()) && d.toISOString().slice(0,10)===value;
}
function phoneValid_(s) {
  const digits=s.replace(/[^0-9۰-۹٠-٩]/g,'');
  return /^\+?[0-9۰-۹٠-٩ ()\-]+$/.test(s) && digits.length>=6 && digits.length<=18;
}
function saveEnquiry_(db,p,legacy) {
  const requestId = legacy ? p.requestId : p.enquiryId;
  const text = {};
  for (const [k,max] of Object.entries({fullName:120,email:200,phone:40,grade:100,message:2000,source:300,birthday:10,education:20,major:120,institution:160})) {
    text[k] = String(p[k] || '').trim();
    need_(text[k].length <= max, 'invalid');
  }
  const topic = ({classes:'courses',university:'admissions'})[p.serviceInterest] || p.serviceInterest;
  need_(VH.uuid.test(requestId || '') && (legacy || VH.uuid.test(p.key || '')), 'invalid');
  need_(p.consent === 'yes' && !p.website && ['fa','en'].includes(p.language), 'invalid');
  need_(text.fullName && /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(text.email), 'invalid');
  need_(Object.prototype.hasOwnProperty.call(TOPICS,topic),'invalid');
  if (!legacy) {
    need_(phoneValid_(text.phone) && gradeValid_(text.education,text.grade,p.language) && validBirthday_(text.birthday),'invalid');
    need_(['planning','learning','opportunities','admission','guidance'].includes(topic),'invalid');
  } else need_(!text.phone || phoneValid_(text.phone),'invalid');
  const row = findRow_(db.leads,2,requestId);
  if (row) {
    if (legacy) return {saved:true};
    need_(db.leads.getRange(row,20).getValue() === p.key, 'invalid');
  } else {
    const key = legacy ? Utilities.getUuid() : p.key;
    need_(!findRow_(db.leads,20,key),'invalid');
    const throttle = 'vh-e-' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,text.email.toLowerCase()));
    const cache = CacheService.getScriptCache(), count = Number(cache.get(throttle) || 0);
    need_(count < 3,'rate');
    const grade = text.grade.replace(/^grade-(\d+)$/,'Grade $1');
    db.leads.appendRow([new Date(),requestId,safe_(text.fullName),safe_(text.email),safe_(text.phone),
      safe_(grade),TOPICS[topic][p.language === 'fa' ? 1 : 0],safe_(text.message),p.language,safe_(text.source),
      'Yes','New','Not booked','','','','Pending','Pending','',key,text.birthday,text.education,safe_(text.major),safe_(text.institution)]);
    SpreadsheetApp.flush();
    cache.put(throttle,String(count + 1),3600);
  }
  if (legacy) return {saved:true};
  return Object.assign({saved:true},publicCalendar_(db,requestId));
}
function identity_(db,key) {
  need_(VH.uuid.test(key || ''),'missing');
  const row = findRow_(db.leads,20,key);
  need_(row > 0,'missing');
  return {row:row,id:db.leads.getRange(row,2).getValue()};
}
function syncLeadStatus_(leads,row) {
  const pair = leads.getRange(row,12,1,2).getValues()[0];
  if ((!pair[0] || ['New','Contacted'].includes(pair[0])) && pair[1] !== 'Completed' && pair[1] !== 'Cancelled') pair[0] = 'Call booked';
  if (!pair[1] || ['Not booked','Cancelled'].includes(pair[1])) pair[1] = 'Booked';
  leads.getRange(row,12,1,2).setValues([pair]);
}
function resumeUrl_(lead) {
  return VH.site + (lead[8] === 'fa' ? '/' : '/en.html') + '#calendar/' + lead[19];
}

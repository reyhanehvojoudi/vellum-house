/* Sheet-bound Apps Script. Run setup in the private Enquiries spreadsheet. */
const VH = {
  leads: 'Enquiries', times: 'Consultation times', zone: 'Asia/Tehran',
  notify: 'vellumhouse.edu@gmail.com', site: 'https://vhouse.ir',
  halfHour: 30 * 60 * 1000, notice: 48 * 3600000, horizon: 14 * 86400000,
  leadHeaders: ['Received at','Request ID','Contact name','Email','Phone','Grade / level',
    'Service interest','Goals / message','Language','Lead source','Consent','Lead status',
    'Booking status','Follow-up date','Last contacted','Internal notes','Admin email',
    'Applicant email','Last delivery error','Private booking key'],
  timeHeaders: ['Consultation starts','Availability','Enquiry ID','Booked at','Team confirmation','Family confirmation'],
  uuid: /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i
};
const TOPICS = {
  full:['Academic planning','برنامه‌ریزی جامع تحصیلی'], talent:['Talent assessment','ارزیابی استعدادها'],
  courses:['Subject teaching and exams','کلاس‌های درسی و آمادگی آزمون'], mentoring:['Mentoring and progress reviews','مشاوره و پیگیری پیشرفت'],
  olympiads:['Competitions and Olympiads','مسابقات و المپیادها'], admissions:['University admissions','پذیرش دانشگاه'],
  konkur:['Iranian university entrance exam','آمادگی کنکور'], other:['Help choosing a service','راهنمایی برای انتخاب خدمات']
};
function setup() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  if (!book) throw new Error('Open Apps Script from the private Enquiries spreadsheet.');
  const props = PropertiesService.getScriptProperties();
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    props.setProperty('VH_SHEET_ID', book.getId());
    if (!props.getProperty('VH_ADMIN_KEY')) props.setProperty('VH_ADMIN_KEY', Utilities.getUuid() + Utilities.getUuid());
    const leads = book.getSheetByName(VH.leads) || book.insertSheet(VH.leads);
    if (!leads.getLastRow()) leads.getRange(1,1,1,VH.leadHeaders.length).setValues([VH.leadHeaders]);
    const extra = leads.getRange(1,20);
    if (extra.getValue() && extra.getValue() !== VH.leadHeaders[19]) throw new Error('Column T is occupied. Move that custom column before setup.');
    extra.setValue(VH.leadHeaders[19]);
    const calendar = book.getSheetByName(VH.times) || book.insertSheet(VH.times);
    if (!calendar.getLastRow()) calendar.getRange(1,1,1,VH.timeHeaders.length).setValues([VH.timeHeaders]);
    if (calendar.getRange(1,1).getValue() !== VH.timeHeaders[0]) throw new Error('The Consultation times tab has different columns.');
    for (const tab of [leads, calendar]) tab.setFrozenRows(1);
    leads.getRange('D:E').setNumberFormat('@');
    leads.getRange('T:T').setNumberFormat('@');
    calendar.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm');
    calendar.getRange('D:D').setNumberFormat('yyyy-mm-dd hh:mm');
    // Keep the original spreadsheet time zone and the owner's existing CRM settings.
    if (!ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'retryEmails')) {
      ScriptApp.newTrigger('retryEmails').timeBased().everyMinutes(5).create();
    }
    SpreadsheetApp.flush();
    MailApp.getRemainingDailyQuota();
  } finally { lock.releaseLock(); }
}
function store_() {
  const id = PropertiesService.getScriptProperties().getProperty('VH_SHEET_ID');
  if (!id) throw new Error('setup');
  const ss = SpreadsheetApp.openById(id);
  const leads = ss.getSheetByName(VH.leads), times = ss.getSheetByName(VH.times);
  if (!leads || !times) throw new Error('setup');
  return {leads, times};
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
  const p = e && e.parameter || {}, action = p.action || 'legacy';
  try {
    if (action.startsWith('admin')) admin_(p.adminKey);
    const db = store_();
    let result;
    switch (action) {
      case 'legacy':
      case 'enquiry':
        result = withLock_(() => saveEnquiry_(db, p, action === 'legacy'));
        break;
      case 'calendar': result = calendar_(db,p.key); break;
      case 'book': result = withLock_(() => book_(db,p)); break;
      case 'adminList': result = management_(db); break;
      case 'adminAvailability': result = withLock_(() => availability_(db,p)); break;
      default: throw new Error('invalid');
    }
    return reply_(p,result);
  } catch (err) {
    const known = ['invalid','auth','setup','rate','busy','missing','unavailable','past','booked','range'];
    const code = known.includes(err.message) ? err.message : 'service';
    if (code === 'service') console.error(err.name);
    return reply_(p,{ok:false,saved:false,code:code});
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
function saveEnquiry_(db,p,legacy) {
  const requestId = legacy ? p.requestId : p.enquiryId;
  const text = {};
  for (const [k,max] of Object.entries({fullName:120,email:200,phone:40,grade:100,message:2000,source:300})) {
    text[k] = String(p[k] || '').trim();
    need_(text[k].length <= max, 'invalid');
  }
  const topic = ({classes:'courses',university:'admissions'})[p.serviceInterest] || p.serviceInterest;
  need_(VH.uuid.test(requestId || '') && (legacy || VH.uuid.test(p.key || '')), 'invalid');
  need_(p.consent === 'yes' && !p.website && ['fa','en'].includes(p.language), 'invalid');
  need_(text.fullName && /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(text.email), 'invalid');
  need_(Object.prototype.hasOwnProperty.call(TOPICS,topic) && (!text.phone || /^\+?[0-9۰-۹٠-٩ ()\-]{6,40}$/.test(text.phone)), 'invalid');
  if (!legacy && text.grade) need_(/^(?:kg|grade-(?:[1-9]|1[0-2])|graduate|university|other)$/.test(text.grade),'invalid');
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
      'Yes','New','Not booked','','','','Pending','Pending','',key]);
    SpreadsheetApp.flush();
    cache.put(throttle,String(count + 1),3600);
  }
  if (legacy) return {saved:true};
  return Object.assign({saved:true}, publicView_(schedule_(db),requestId));
}
function schedule_(db) { return records_(db.times,VH.timeHeaders.length); }
function publicView_(times,requestId) {
  const now = Date.now(), min = now + VH.notice, max = now + VH.horizon;
  const booked = times.find(r => r[1] === 'Booked' && r[2] === requestId);
  const slots = times.filter(r => r[1] === 'Open').map(r => instant_(r[0])).filter(t => t >= min && t <= max).sort((a,b) => a-b);
  return {ok:true,min:min,max:max,slots:slots,booking:booked ? {start:instant_(booked[0]),ref:requestId.slice(0,8).toUpperCase()} : null};
}
function identity_(db,key) {
  need_(VH.uuid.test(key || ''),'missing');
  const row = findRow_(db.leads,20,key);
  need_(row > 0,'missing');
  return {row:row,id:db.leads.getRange(row,2).getValue()};
}
function calendar_(db,key) { return publicView_(schedule_(db),identity_(db,key).id); }
function book_(db,p) {
  const person = identity_(db,p.key);
  const times = schedule_(db), current = publicView_(times,person.id);
  if (current.booking) return current;
  const wanted = Number(p.start);
  if (!current.slots.includes(wanted)) return Object.assign(current,{ok:false,code:'unavailable'});
  const idx = times.findIndex(r => instant_(r[0]) === wanted);
  // One row is the booking and email outbox. A retry sees this reservation before attempting a write.
  const values = ['Booked',person.id,new Date(),'Pending','Pending'];
  db.times.getRange(idx+2,2,1,5).setValues([values]);
  SpreadsheetApp.flush();
  times[idx] = [times[idx][0]].concat(values);
  syncLeadStatus_(db.leads,person.row);
  return publicView_(times,person.id);
}
function syncLeadStatus_(leads,row) {
  const pair = leads.getRange(row,12,1,2).getValues()[0];
  if ((!pair[0] || ['New','Contacted'].includes(pair[0])) && pair[1] !== 'Completed' && pair[1] !== 'Cancelled') pair[0] = 'Call booked';
  if (!pair[1] || pair[1] === 'Not booked') pair[1] = 'Booked';
  leads.getRange(row,12,1,2).setValues([pair]);
}
function management_(db) {
  const times = schedule_(db), leads = new Map(records_(db.leads,9).map(r => [r[1],r]));
  const open = [], booked = [];
  for (const row of times) {
    const start = instant_(row[0]);
    if (row[1] === 'Open' && start > Date.now()) open.push(start);
    if (row[1] !== 'Booked') continue;
    const lead = leads.get(row[2]) || [];
    booked.push({start:start,name:text_(lead[2]),email:text_(lead[3]),phone:text_(lead[4]),topic:text_(lead[6])});
  }
  return {ok:true,open:open.sort((a,b) => a-b),booked:booked.sort((a,b) => a.start-b.start)};
}
function timeOnDay_(day,clock) {
  need_(/^\d{4}-\d{2}-\d{2}$/.test(day) && /^(?:[01]\d|2[0-3]):(?:00|30)$/.test(clock),'range');
  const input = day + ' ' + clock;
  let date;
  try { date = Utilities.parseDate(input,VH.zone,'yyyy-MM-dd HH:mm'); } catch (_) { throw new Error('range'); }
  need_(Utilities.formatDate(date,VH.zone,'yyyy-MM-dd HH:mm') === input,'range');
  return date.getTime();
}
function availability_(db,p) {
  need_(VH.uuid.test(p.operationId || ''),'invalid');
  const cache = CacheService.getScriptCache(), mutation = 'vh-slot-' + p.operationId;
  if (cache.get(mutation)) return management_(db);
  const times = schedule_(db);
  if (p.change === 'close') {
    const idx = times.findIndex(r => instant_(r[0]) === Number(p.start));
    need_(idx >= 0,'range');
    need_(times[idx][1] !== 'Booked','booked');
    db.times.getRange(idx+2,2).setValue('Closed');
  } else {
    need_(p.change === 'open','invalid');
    const from = timeOnDay_(p.day,p.from);
    const end = p.until === '24:00' ? timeOnDay_(p.day,'23:30') + VH.halfHour : timeOnDay_(p.day,p.until);
    need_(from > Date.now(),'past');
    need_(from < end && end-from <= 86400000,'range');
    const byStart = new Map(times.map((r,i) => [instant_(r[0]),{row:r,index:i+2}]));
    const add = [], reopen = [];
    for (let start=from;start<end;start+=VH.halfHour) {
      const old = byStart.get(start);
      if (!old) add.push([new Date(start),'Open','','','','']);
      else if (old.row[1] === 'Closed') reopen.push('B'+old.index);
    }
    if (add.length) {
      const last = db.times.getLastRow(), capacity = db.times.getMaxRows();
      if (last + add.length > capacity) db.times.insertRowsAfter(capacity,last + add.length-capacity);
      db.times.getRange(last+1,1,add.length,6).setValues(add);
    }
    if (reopen.length) db.times.getRangeList(reopen).setValue('Open');
  }
  SpreadsheetApp.flush();
  cache.put(mutation,'1',600);
  return management_(db);
}
function resumeUrl_(lead) {
  return VH.site + (lead[8] === 'fa' ? '/' : '/en.html') + '#calendar/' + lead[19];
}
function emailFor_(lead,team,start) {
  const fa = lead[8] === 'fa', name = text_(lead[2]), email = text_(lead[3]), link = resumeUrl_(lead);
  const ref = String(lead[1]).slice(0,8).toUpperCase();
  const when = start ? Utilities.formatDate(new Date(start),VH.zone,'yyyy-MM-dd HH:mm') : '';
  let subject, body;
  if (team) {
    subject = start ? 'Vellum House | Consultation booked' : 'Vellum House | New enquiry';
    body = [start ? 'A family has booked a 30-minute consultation.' : 'New consultation enquiry.',name,email,text_(lead[4]),text_(lead[5]),text_(lead[6]),text_(lead[7]),
      start ? when + ' (Tehran time)' : '', 'Reference ' + ref, VH.site + '/admin.html'].filter(Boolean).join('\n');
  } else if (start) {
    subject = fa ? 'ولوم هاوس | تأیید وقت مشاوره' : 'Vellum House | Your consultation is booked';
    body = fa ? 'سلام '+name+'،\n\nجلسهٔ آنلاین ۳۰ دقیقه‌ای شما برای '+when+' به وقت تهران (تاریخ میلادی) ثبت شد. جزئیات ورود به جلسه را تیم ما برایتان می‌فرستد.\n\nمشاهدهٔ جزئیات جلسه\n'+link :
      'Hello '+name+',\n\nYour 30-minute online consultation is booked for '+when+' (Tehran time). Our team will send the joining details before the meeting.\n\nView your booking\n'+link;
    body += '\n\nVellum House · '+ref;
  } else {
    subject = fa ? 'ولوم هاوس | درخواست مشاوره شما' : 'Vellum House | Your consultation enquiry';
    body = fa ? 'سلام '+name+'،\n\nدرخواست مشاورهٔ شما را دریافت کردیم. از این پیوند اختصاصی می‌توانید وقت‌های آزاد یا جزئیات رزرو خود را ببینید.\n'+link+'\n\nولوم هاوس' :
      'Hello '+name+',\n\nWe received your enquiry. Use this private link to choose a time or view your confirmed booking.\n'+link+'\n\nVellum House';
  }
  return {to:team ? VH.notify : email,replyTo:team ? email : VH.notify,subject:subject,body:body,name:'Vellum House'};
}
function retryEmails() {
  // Only one mail worker runs at a time. Booking requests use the script lock independently between deliveries.
  const db = store_(), started = Date.now();
  let sent = 0;
  const leads = records_(db.leads,20), times = schedule_(db);
  const byId = new Map(leads.map((r,i) => [r[1],{lead:r,row:i+2}]));
  function deliver(sheet,row,col,lead,team,start) {
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(1500)) return false;
    try {
      const cell = sheet.getRange(row,col);
      if (cell.getValue() === 'Sent') return true;
      if (MailApp.getRemainingDailyQuota() < 1) return false;
      // Mint private resume links for undelivered legacy enquiries during the upgrade.
      if (!lead[19]) {
        const keyCell = db.leads.getRange(byId.get(lead[1]).row,20);
        lead[19] = keyCell.getValue() || Utilities.getUuid(); keyCell.setValue(lead[19]);
      }
      MailApp.sendEmail(emailFor_(lead,team,start));
      cell.setValue('Sent'); SpreadsheetApp.flush(); sent++;
      return true;
    } catch (err) { console.error('Mail delivery pending'); return false; }
    finally { lock.releaseLock(); }
  }
  // Send confirmations before unbooked-enquiry acknowledgements.
  const jobs = [];
  times.forEach((r,i) => {
    if (r[1] !== 'Booked' || !byId.has(r[2]) || (r[4] === 'Sent' && r[5] === 'Sent')) return;
    const contact = byId.get(r[2]);
    withLock_(() => syncLeadStatus_(db.leads,contact.row));
    for (let j=0;j<2;j++) if (r[4+j] !== 'Sent') jobs.push([db.times,i+2,5+j,contact.lead,j===0,instant_(r[0])]);
  });
  leads.forEach((r,i) => {
    for (let j=0;j<2;j++) if (r[16+j] !== 'Sent') jobs.push([db.leads,i+2,17+j,r,j===0,0]);
  });
  for (const job of jobs) {
    if (sent >= 20 || Date.now()-started > 25000) break;
    if (MailApp.getRemainingDailyQuota() < 1) break;
    deliver.apply(null,job);
  }
}

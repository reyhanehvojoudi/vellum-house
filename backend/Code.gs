/**
 * Vellum House — Enquiry + Lead Pipeline (Google Apps Script)
 * Bind this file to a PRIVATE Google Sheet owned by vellumhouse.edu@gmail.com.
 * Run setup() once; deploy as Web app: Execute as Me; access Anyone.
 * DO NOT publish the private spreadsheet or store credentials on GitHub.
 * The public web app URL is a submission endpoint, not an authentication secret.
 */
const VH = {
  tab: 'Enquiries',
  notify: 'vellumhouse.edu@gmail.com',
  booking: 'https://cal.com/vhouse/consultation',
  headers: [
    'Received at','Request ID','Contact name','Email','Phone','Grade / level',
    'Service interest','Goals / message','Language','Lead source','Consent',
    'Lead status','Booking status','Follow-up date','Last contacted','Internal notes',
    'Admin email','Applicant email','Last delivery error'
  ],
  emailRegex: /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/,
  uuidRegex: /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i
};
const INTERESTS = ['full','talent','courses','classes','mentoring','olympiads','admissions','university','konkur','other'];
const SERVICE_LABELS = {
  full:{fa:'مدیریت کامل مسیر تحصیلی',en:'Full academic pathway management'},
  talent:{fa:'استعدادیابی و برنامه‌ریزی (ارزیابی و گزارش نتایج)',en:'Talent discovery and planning (assessment with results)'},
  courses:{fa:'دوره‌های آموزشی و آمادگی آزمون',en:'Educational programmes and exam preparation'},
  classes:{fa:'دوره‌های آموزشی و آمادگی آزمون',en:'Educational programmes and exam preparation'},
  mentoring:{fa:'منتورینگ، مشاوره و نظارت بر مسیر پیشرفت',en:'Mentoring, counselling and progress oversight'},
  olympiads:{fa:'مسابقات و المپیادها',en:'Competitions and Olympiads'},
  admissions:{fa:'اپلای و دریافت پذیرش تحصیلی',en:'University applications and admission support'},
  university:{fa:'اپلای و دریافت پذیرش تحصیلی',en:'University applications and admission support'},
  konkur:{fa:'آمادگی کنکور',en:'Iranian university entrance exam preparation'},
  other:{fa:'برای انتخاب سرویس نیاز به راهنمایی بیشتر دارم',en:'I need guidance choosing the right service'}
};
function setup() {
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  if(!ss) throw new Error('Open this script from the target Google Sheet: Extensions > Apps Script.');
  PropertiesService.getScriptProperties().setProperty('VH_SHEET_ID', ss.getId());
  const sheet=ss.getSheetByName(VH.tab)||ss.insertSheet(VH.tab);
  if(sheet.getLastRow()===0){sheet.getRange(1,1,1,VH.headers.length).setValues([VH.headers]);}
  sheet.setFrozenRows(1);
  sheet.getRange(1,1,1,VH.headers.length).setFontWeight('bold').setBackground('#122638').setFontColor('#ffffff');
  sheet.getRange('D:E').setNumberFormat('@');
  sheet.getRange('H:H').setWrap(true);
  sheet.getRange('P:P').setWrap(true);
  const statusRule=SpreadsheetApp.newDataValidation().requireValueInList(['New','Contacted','Call booked','Qualified','Proposal sent','Won','Lost'],true).setAllowInvalid(false).build();
  const bookingRule=SpreadsheetApp.newDataValidation().requireValueInList(['Not booked','Booked','Completed','No-show','Cancelled'],true).setAllowInvalid(false).build();
  sheet.getRange('L2:L1000').setDataValidation(statusRule);
  sheet.getRange('M2:M1000').setDataValidation(bookingRule);
  if(!ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()==='retryEmails')){
    ScriptApp.newTrigger('retryEmails').timeBased().everyMinutes(5).create();
  }
  MailApp.getRemainingDailyQuota();
}
function db_(){
  const id=PropertiesService.getScriptProperties().getProperty('VH_SHEET_ID');
  if(!id)throw new Error('Run setup() and authorise before deployment.');
  const sheet=SpreadsheetApp.openById(id).getSheetByName(VH.tab);
  if(!sheet)throw new Error('Missing Enquiries tab.');
  return sheet;
}
function safe_(value){
  const s=String(value||'').trim();
  return /^[\s]*[=+\-@]/.test(s)?"'"+s:s;
}
function exact_(sheet,id){
  if(sheet.getLastRow()<2)return null;
  return sheet.getRange(2,2,sheet.getLastRow()-1,1).createTextFinder(id).matchEntireCell(true).useRegularExpression(false).findNext();
}
function json_(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
function doPost(e){
  const p=e&&e.parameter||{};
  if(!VH.uuidRegex.test(p.requestId||'')||p.website||p.consent!=='yes'||!['en','fa'].includes(p.language))return json_({saved:false});
  const fields={fullName:120,email:200,phone:40,grade:100,serviceInterest:30,message:2000,source:300};
  for(const field in fields){
    p[field]=String(p[field]||'').trim();
    if(p[field].length>fields[field])return json_({saved:false});
  }
  if(!p.fullName||!p.email||!p.serviceInterest||!VH.emailRegex.test(p.email)||!INTERESTS.includes(p.serviceInterest))return json_({saved:false});
  if(p.phone&&!/^\+?[0-9۰-۹٠-٩ ()\-]{6,40}$/.test(p.phone))return json_({saved:false});
  const lock=LockService.getScriptLock();lock.waitLock(25000);
  try{
    const sheet=db_();
    if(!exact_(sheet,p.requestId)){
      // Lightweight abuse throttle (three requests per email per hour).
      const key='vh_'+Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,p.email.toLowerCase()));
      const cache=CacheService.getScriptCache();const count=Number(cache.get(key)||0);
      if(count>=3)return json_({saved:false});
      sheet.appendRow([
        new Date(),p.requestId,safe_(p.fullName),safe_(p.email),safe_(p.phone),
        safe_(p.grade),safe_((SERVICE_LABELS[p.serviceInterest]||{})[p.language]||p.serviceInterest),safe_(p.message),p.language,safe_(p.source),
        'Yes','New','Not booked','','','', 'Pending','Pending',''
      ]);
      SpreadsheetApp.flush();cache.put(key,String(count+1),3600);
    }
  }catch(error){console.error('Enquiry save error: '+error.message);return json_({saved:false});}
  finally{lock.releaseLock();}
  try{retryEmails();}catch(error){console.error('Emails pending: '+error.message);}
  return json_({saved:true});
}
function doGet(e){
  const p=e&&e.parameter||{};
  if(!/^vhReceipt_[a-f0-9]{32}$/.test(p.callback||'')||!VH.uuidRegex.test(p.requestId||''))return json_({saved:false});
  let saved=false;try{saved=!!exact_(db_(),p.requestId);}catch(error){console.warn(error.message);}
  // UUID-scoped read-only receipt, no names/emails/messages/row numbers returned.
  return ContentService.createTextOutput(p.callback+'('+JSON.stringify({saved:saved})+');').setMimeType(ContentService.MimeType.JAVASCRIPT);
}
function retryEmails(){
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(1000))return;
  try{
    const sheet=db_(),rows=sheet.getDataRange().getValues();let count=0;const started=Date.now();
    for(let i=1;i<rows.length;i++){
      const r=rows[i];
      if(r[16]==='Sent'&&r[17]==='Sent')continue;
      const fa=r[8]==='fa';
      for(let j=0;j<2;j++){
        if(count>=20||Date.now()-started>22000||MailApp.getRemainingDailyQuota()<1)return;
        if(r[16+j]==='Sent')continue;
        const to=j===0?VH.notify:String(r[3]).replace(/^'/,'');
        const subject=j===0?'Vellum House | New website enquiry':fa?'ولوم هاوس | دریافت درخواست و رزرو جلسه':'Vellum House | Your enquiry & free meeting';
        const msg=j===0?[
          'New consultation enquiry:','', 'ID: '+r[1],'Contact: '+r[2],
          'Email: '+r[3],'Phone: '+r[4],'Study level: '+r[5],
          'Interest: '+r[6],'Message: '+r[7],'Language: '+r[8],
          'Source: '+r[9],'Lead status: New','Booking status: Not booked',
          '', 'Check the private Enquiries sheet. Booking status is updated manually unless Cal.com is integrated separately.'
        ].join('\n'):
          (fa?'درود '+r[2]+'\n\nدرخواست شما در ولوم هاوس ثبت شد. برای انتخاب زمان جلسه مشاوره رایگان اولیه ۳۰ دقیقه‌ای از لینک زیر استفاده کنید:\n'+VH.booking+'\n\nتوجه: جلسه فقط پس از انتخاب و تأیید زمان در تقویم رزرو می‌شود.\n\nشناسه درخواست: '+r[1]+'\n\nبا احترام،\nتیم ولوم هاوس':
             'Hello '+r[2]+',\n\nThank you. Your Vellum House enquiry has been recorded. Choose a free 30-minute initial consultation using this link:\n'+VH.booking+'\n\nYour meeting is not booked until you select and confirm a time in the calendar.\n\nReference: '+r[1]+'\n\nVellum House');
        try{
          MailApp.sendEmail({to,subject,body:msg,name:'Vellum House',replyTo:j===0?String(r[3]).replace(/^'/,''):VH.notify});
          r[16+j]='Sent';sheet.getRange(i+1,17+j).setValue('Sent');sheet.getRange(i+1,19).setValue('');
          SpreadsheetApp.flush();count++;
        }catch(error){sheet.getRange(i+1,19).setValue(String(error.message).slice(0,300));return;}
      }
    }
  }finally{lock.releaseLock();}
}

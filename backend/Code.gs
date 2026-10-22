/* Google Apps Script, bound to a PRIVATE Google Sheet.
   Run setup() once, then deploy as Web App: Execute as Me, access Anyone.
   No credentials belong in the public GitHub repository. */
const RECIPIENTS = ['reyhaneh.vojoudi@gmail.com','kasra01@gmail.com'];
const TAB = 'Enquiries';
const HEADERS = ['Received at','Request ID','Full name','Grade / level','City','Phone','Email','Message','Language','Consent','Reyhaneh email','Kasra email','Applicant email','Last email error'];
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
function setup(){
 const ss=SpreadsheetApp.getActiveSpreadsheet();
 if(!ss)throw new Error('Open this script from Extensions > Apps Script inside your Google Sheet.');
 PropertiesService.getScriptProperties().setProperty('SHEET_ID',ss.getId());
 let sheet=ss.getSheetByName(TAB)||ss.insertSheet(TAB);
 if(sheet.getLastRow()===0){sheet.appendRow(HEADERS);sheet.setFrozenRows(1);sheet.getRange(1,1,1,HEADERS.length).setFontWeight('bold').setBackground('#e8ede4');}
 sheet.getRange('F:G').setNumberFormat('@');sheet.getRange('H:H').setWrap(true);
 if(!ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()==='retryEmails'))ScriptApp.newTrigger('retryEmails').timeBased().everyMinutes(5).create();
 MailApp.getRemainingDailyQuota(); // Requests mail permission during setup.
}
function sheet_(){const id=PropertiesService.getScriptProperties().getProperty('SHEET_ID');if(!id)throw new Error('Run setup first.');return SpreadsheetApp.openById(id).getSheetByName(TAB);}
function safe_(v){const s=String(v||'');return /^[\s]*[=+\-@]/.test(s)?"'"+s:s;}
function find_(sheet,id){if(sheet.getLastRow()<2)return null;return sheet.getRange(2,2,sheet.getLastRow()-1,1).createTextFinder(id).matchEntireCell(true).useRegularExpression(false).findNext();}
function json_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
function doPost(e){
 const p=e&&e.parameter||{};
 if(!UUID.test(p.requestId||'')||p.website||p.consent!=='on'||!['en','fa'].includes(p.language))return json_({saved:false});
 const limits={fullName:120,grade:100,city:100,phone:40,email:200,message:3000};
 for(const k in limits){p[k]=String(p[k]||'').trim();if(!p[k]||p[k].length>limits[k])return json_({saved:false});}
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)||p.email.includes(',')||p.email.includes(';')||!/^\+?[0-9۰-۹٠-٩ ()\-]{6,40}$/.test(p.phone))return json_({saved:false});
 const lock=LockService.getScriptLock();lock.waitLock(25000);
 try{
  const sheet=sheet_();
  if(!find_(sheet,p.requestId)){
   // Per-email throttle limits repeat enquiries. This is basic spam protection, not CAPTCHA.
   const key='rate_'+Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,p.email.toLowerCase()));
   const cache=CacheService.getScriptCache();const n=Number(cache.get(key)||0);
   if(n>=3)return json_({saved:false});
   sheet.appendRow([new Date(),p.requestId,...['fullName','grade','city','phone','email','message','language'].map(k=>safe_(p[k])),'Yes','Pending','Pending','Pending','']);
   SpreadsheetApp.flush();cache.put(key,String(n+1),3600);
  }
 }finally{lock.releaseLock();}
 try{retryEmails();}catch(error){console.error('Mail delivery deferred: '+error.message);}
 return json_({saved:true});
}
function doGet(e){
 const p=e&&e.parameter||{};
 // Read-only, UUID-based receipt: never return a name, address, message or row number.
 if(!/^vhReceipt_[a-f0-9]{32}$/.test(p.callback||'')||!UUID.test(p.requestId||''))return json_({saved:false});
 let saved=false;try{saved=!!find_(sheet_(),p.requestId);}catch(_){}
 return ContentService.createTextOutput(p.callback+'('+JSON.stringify({saved:saved})+');').setMimeType(ContentService.MimeType.JAVASCRIPT);
}
function retryEmails(){
 const lock=LockService.getScriptLock();if(!lock.tryLock(1000))return;
 try{
  const sheet=sheet_(),values=sheet.getDataRange().getValues();let sent=0;const start=Date.now();
  for(let i=1;i<values.length;i++){
   const r=values[i];if(r[10]==='Sent'&&r[11]==='Sent'&&r[12]==='Sent')continue;
   for(let j=0;j<3;j++){
    if(sent>=15||Date.now()-start>20000||MailApp.getRemainingDailyQuota()<1)return;
    if(r[10+j]==='Sent')continue;
    const fa=r[8]==='fa';
    const body=j<2?['New Vellum House consultation enquiry','Reference: '+r[1],'Name: '+r[2],'Grade: '+r[3],'City: '+r[4],'Phone: '+r[5],'Email: '+r[6],'Language: '+r[8],'Message:',r[7],'','Open the private Enquiries sheet to coordinate the free initial consultation.'].join('\n'):
     (fa?'سلام '+r[2]+'\n\nدرخواست شما برای مشاوره اولیه رایگان ولوم هاوس دریافت شد. برای هماهنگی زمان جلسه آنلاین و ارسال جزئیات، از طریق همین ایمیل با شما تماس می‌گیریم. لطفاً صندوق ورودی و پوشه اسپم را بررسی کنید.\n\nزمان جلسه هنوز تأیید نشده است.\nشناسه درخواست: '+r[1]+'\n\nبا احترام\nتیم ولوم هاوس':
     'Hello '+r[2]+',\n\nThank you for contacting Vellum House. We have received your request for a free initial consultation. We will email you to arrange a suitable time and send the online meeting details. Please check your inbox and spam folder.\n\nA meeting time has not yet been confirmed.\nReference: '+r[1]+'\n\nVellum House');
    try{
     MailApp.sendEmail({to:j<2?RECIPIENTS[j]:String(r[6]).replace(/^'/,''),subject:j<2?'VH | New consultation enquiry':(fa?'ولوم هاوس | دریافت درخواست مشاوره':'Vellum House | Enquiry received'),body:body,name:'Vellum House',replyTo:j<2?String(r[6]).replace(/^'/,''):RECIPIENTS[0]});
     r[10+j]='Sent';sheet.getRange(i+1,11+j).setValue('Sent');sheet.getRange(i+1,14).setValue('');SpreadsheetApp.flush();sent++;
    }catch(error){sheet.getRange(i+1,14).setValue(String(error.message).slice(0,300));return;}
   }
  }
 }finally{lock.releaseLock();}
}

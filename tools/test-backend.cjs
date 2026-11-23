/* Offline Apps Script regression test. No live accounts, calendar entries or email are used. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const mail=[], props=new Map(), cache=new Map(), tabs=new Map(), triggers=[];
let held=false, capacity=15;
class Sheet {
  constructor() {this.rows=[];}
  getLastRow(){return this.rows.length;}
  getMaxRows(){return capacity;}
  insertRowsAfter(n,more){capacity+=more;}
  setFrozenRows(){}
  appendRow(r){this.rows.push(r.slice());}
  getRangeList(names){return {setValue:v=>names.forEach(n=>this.getRange(Number(n.slice(1)),2).setValue(v))};}
  getRange(row,col,height=1,width=1){
    if (typeof row==='string') return {setNumberFormat(){}};
    const sheet=this;
    function at(i,j){return sheet.rows[i-1]?.[j-1] ?? '';}
    function set(i,j,v){sheet.rows[i-1] ||= [];sheet.rows[i-1][j-1]=v;}
    return {getValue:()=>at(row,col),setValue:v=>set(row,col,v),getValues:()=>Array.from({length:height},(_,i)=>Array.from({length:width},(_,j)=>at(row+i,col+j))),
      setValues:values=>values.forEach((v,i)=>v.forEach((val,j)=>set(row+i,col+j,val))),
      createTextFinder:id=>({matchEntireCell(){return this;},useRegularExpression(){return this;},findNext(){for(let i=row;i<row+height;i++)if(at(i,col)===id)return {getRow:()=>i};return null;}})};
  }
}
const sheetBook={getId:()=>'test',getSheetByName:n=>tabs.get(n),insertSheet(n){const sheet=new Sheet();tabs.set(n,sheet);return sheet;}};
const propsApi={getProperty:k=>props.get(k),setProperty:(k,v)=>props.set(k,v)};
const box=t=>({content:t,setMimeType(){return this;},setXFrameOptionsMode(){return this;}});
const fmt=d=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(d);
const ctx={console,Date,PropertiesService:{getScriptProperties:()=>propsApi},ContentService:{MimeType:{JSON:1,JAVASCRIPT:2},createTextOutput:box},HtmlService:{createHtmlOutput:box,XFrameOptionsMode:{ALLOWALL:1}},
 SpreadsheetApp:{getActiveSpreadsheet:()=>sheetBook,openById:()=>sheetBook,flush(){}},
 Utilities:{getUuid:crypto.randomUUID,formatDate:date=>fmt(date),parseDate:s=>new Date(s.replace(' ','T')+':00+03:30'),DigestAlgorithm:{SHA_256:'sha256'},
 computeDigest:(_,x)=>crypto.createHash('sha256').update(x).digest(),base64EncodeWebSafe:x=>Buffer.from(x).toString('base64url')},
 LockService:{getScriptLock:()=>({tryLock(){if(held)return false;held=true;return true;},waitLock(){assert.equal(held,false);held=true;},releaseLock(){held=false;}})},
 CacheService:{getScriptCache:()=>({get:k=>cache.get(k),put:(k,v)=>cache.set(k,v)})},
 MailApp:{sendEmail:m=>mail.push(m),getRemainingDailyQuota:()=>999},
 ScriptApp:{getProjectTriggers:()=>triggers,newTrigger:f=>({timeBased(){return this;},everyMinutes(){return this;},create(){triggers.push({getHandlerFunction:()=>f});}})}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../backend/Code.gs'),'utf8'),ctx);
const post=(action,fields={})=>JSON.parse(ctx.doPost({parameter:{...fields,action}}).content);
const makePerson=(language='en')=>({key:crypto.randomUUID(),enquiryId:crypto.randomUUID(),language,consent:'yes',serviceInterest:'mentoring',grade:'grade-9',fullName:'Test parent',email:crypto.randomUUID().slice(0,8)+'@example.test',phone:'',message:'School subject selection'});
const day=offset=>new Date(Date.now()+offset*86400000).toISOString().slice(0,10);
ctx.setup();const adminKey=props.get('VH_ADMIN_KEY');ctx.setup();assert.equal(props.get('VH_ADMIN_KEY'),adminKey);assert.equal(triggers.length,1);
const leads=tabs.get('Enquiries'),times=tabs.get('Consultation times'),admin=(action,fields)=>post(action,{adminKey,...fields});
const publish=(d,from='15:00',until='16:30')=>({change:'open',operationId:crypto.randomUUID(),day:d,from,until});
assert.equal(post('adminList').code,'auth');assert.equal(post('adminAvailability',{...publish(day(4))}).code,'auth');
const lead1=makePerson(),lead2=makePerson('fa');
assert.equal(post('enquiry',{...lead1,serviceInterest:'',grade:'Grade X'}).code,'invalid');
assert.equal(post('enquiry',lead1).saved,true);assert.equal(post('enquiry',lead1).saved,true);assert.equal(leads.rows.length,2);
assert.equal(post('enquiry',{...lead1,key:crypto.randomUUID()}).code,'invalid');
assert.equal(post('calendar',{key:lead1.enquiryId}).code,'missing');
post('enquiry',lead2);
assert.equal(post('calendar',{key:lead1.key}).slots.length,0);
const range=publish(day(5));admin('adminAvailability',range);admin('adminAvailability',range);
assert.equal(times.rows.length,4);
admin('adminAvailability',publish(day(1)));admin('adminAvailability',publish(day(16)));
let state=post('calendar',{key:lead1.key});assert.equal(state.slots.length,3);
const time=state.slots[0],second=state.slots[1];
assert.equal(fmt(new Date(time)),day(5)+' 15:00');
const close={change:'close',start:second,operationId:crypto.randomUUID()};admin('adminAvailability',close);
assert(!post('calendar',{key:lead1.key}).slots.includes(second));
admin('adminAvailability',range);assert(!post('calendar',{key:lead1.key}).slots.includes(second));
admin('adminAvailability',publish(day(5)));assert(post('calendar',{key:lead1.key}).slots.includes(second));
held=true;assert.equal(post('book',{key:lead1.key,start:time}).code,'busy');held=false;
assert.equal(post('book',{key:lead1.key,start:time}).booking.start,time);
assert.equal(post('book',{key:lead2.key,start:time}).code,'unavailable');
assert.equal(post('book',{key:lead1.key,start:second}).booking.start,time);
assert.equal(admin('adminAvailability',{change:'close',operationId:crypto.randomUUID(),start:time}).code,'booked');
admin('adminAvailability',publish(day(5)));assert.equal(admin('adminList').booked.length,1);
assert.equal(admin('adminList').booked[0].email,lead1.email);
assert.equal(leads.rows[1][12],'Booked');assert.equal(leads.rows[1][11],'Call booked');
assert.equal(post('calendar',{key:lead1.key}).booking.start,time);assert(!JSON.stringify(post('calendar',{key:lead2.key})).includes(lead1.email));
const old={...makePerson(),grade:'Year 10',serviceInterest:'classes'};old.requestId=old.enquiryId;delete old.enquiryId;assert.equal(post('',old).saved,true);
assert(ctx.doGet({parameter:{requestId:old.requestId,callback:'vhReceipt_'+'0'.repeat(32)}}).content.includes('"saved":true'));
ctx.retryEmails();const count=mail.length;ctx.retryEmails();assert.equal(mail.length,count);assert.equal(count,8);
assert(mail.some(m=>m.to===lead1.email && m.body.includes('#calendar/'+lead1.key)));
assert(mail.some(m=>m.to===lead1.email && m.subject.includes('booked') && m.body.includes(day(5)+' 15:00')));
assert(!mail.some(m=>m.body.includes('cal.com')));
assert.equal(admin('adminAvailability',publish(day(5),'10:00','09:30')).code,'range');
assert.equal(admin('adminAvailability',publish(day(-2))).code,'past');
const html=ctx.doPost({parameter:{action:'calendar',key:lead1.key,transport:'frame',channel:crypto.randomUUID(),origin:'https://vhouse.ir'}}).content;
assert(html.includes('postMessage') && html.includes('"https://vhouse.ir"'));
const badOrigin=post('calendar',{key:lead1.key,transport:'frame',channel:crypto.randomUUID(),origin:'https://example.test'});assert.equal(badOrigin.code,'origin');
console.log('PASS: existing sheet migration, one trigger, staff authentication, both languages, retry identity, lead validation, grade, slot publication/withdrawal, notice and horizon, lock contention, one reservation per time/enquiry, collision recovery, CRM status and private responses, receipt, email queue, timezone and frame transport.');

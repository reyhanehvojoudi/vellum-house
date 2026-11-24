/* Run with Node. All Google services below are isolated in-memory doubles. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'../backend'),mail=[],events=new Map(),props=new Map(),cache=new Map(),tabs=new Map(),triggers=[];
let held=false,externalBusy=[],failFree=false,lateMeet=false,failAfterInsert=false,failEmail=false,invites=0,calls=0;
class Sheet {
  constructor(){this.rows=[];this.cols=26;}
  getMaxColumns(){return this.cols;} insertColumnsAfter(_,n){this.cols+=n;} setFrozenRows(){}
  getLastRow(){return this.rows.length;} appendRow(vals){this.rows.push(vals.slice());}
  getRange(row,col,height=1,width=1){
    if(typeof row==='string')return {setNumberFormat(){}};
    const get=(i,j)=>this.rows[i-1]?.[j-1] ?? '';
    const set=(i,j,v)=>{this.rows[i-1] ||= [];this.rows[i-1][j-1]=v;};
    return {getValue:()=>get(row,col),setValue:v=>set(row,col,v),getValues:()=>Array.from({length:height},(_,i)=>Array.from({length:width},(_,j)=>get(row+i,col+j))),
      setValues:values=>values.forEach((r,i)=>r.forEach((v,j)=>set(row+i,col+j,v))),
      createTextFinder:id=>({matchEntireCell(){return this;},useRegularExpression(){return this;},findNext(){for(let i=row;i<row+height;i++) if(get(i,col)===id)return {getRow:()=>i};return null;}})};
  }
}
const book={getId:()=>'sheet',getSheetByName:n=>tabs.get(n),insertSheet(n){const tab=new Sheet();tabs.set(n,tab);return tab;}};
const properties={getProperty:k=>props.get(k),setProperty:(k,v)=>props.set(k,String(v))};
const box=content=>({content,setMimeType(){return this;},setXFrameOptionsMode(){return this;}});
const fmt=(d,zone,pattern)=>new Intl.DateTimeFormat('sv-SE',Object.assign({timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'},pattern.includes('HH')?{hour:'2-digit',minute:'2-digit',hourCycle:'h23'}:{})).format(d);
const cal={
  Calendars:{get:()=>({id:'owner@example.test',conferenceProperties:{allowedConferenceSolutionTypes:['hangoutsMeet']}})},
  Freebusy:{query:({items})=>{if(failFree)throw Error('service offline');return {calendars:Object.fromEntries(items.map(({id})=>[id,{busy:externalBusy.concat([...events.values()].map(e=>[+new Date(e.start.dateTime),+new Date(e.end.dateTime)])).map(([s,e])=>({start:new Date(s).toISOString(),end:new Date(e).toISOString()}))}]))};}},
  Events:{get:(_,id)=>{if(!events.has(id))throw Error('404 Not Found');return events.get(id);},
    insert:(resource,id,opt)=>{assert.equal(id,'owner@example.test');assert.equal(opt.sendUpdates,'all');assert.equal(opt.conferenceDataVersion,1);assert(resource.attendees[0].email);assert(/^[a-v0-9]{5,1024}$/.test(resource.id));assert(resource.conferenceData.createRequest.requestId);
      if(events.has(resource.id))throw Error('409 conflict');const event=structuredClone(resource);event.iCalUID=resource.id+'@google.com';if(!lateMeet)event.hangoutLink='https://meet.google.com/abc-defg-hij';
      events.set(event.id,event);invites++;if(failAfterInsert){failAfterInsert=false;throw Error('reply lost');}return event;},
    patch:(patch,_,id)=>{const current=events.get(id);current.conferenceData=patch.conferenceData;return current;}}
};
const ctx={console:{warn(){},log(){},error(){}},Date,Intl,Calendar:cal,PropertiesService:{getScriptProperties:()=>properties},
 ContentService:{MimeType:{JSON:1,JAVASCRIPT:2},createTextOutput:box},HtmlService:{createHtmlOutput:box,XFrameOptionsMode:{ALLOWALL:1}},
 SpreadsheetApp:{getActiveSpreadsheet:()=>book,openById:()=>book,flush(){}},
 Utilities:{getUuid:crypto.randomUUID,formatDate:fmt,parseDate:s=>new Date(s.replace(' ','T')+':00+03:30'),DigestAlgorithm:{SHA_256:'sha256'},
  computeDigest:(_,x)=>crypto.createHash('sha256').update(x).digest(),base64EncodeWebSafe:x=>Buffer.from(x).toString('base64url')},
 LockService:{getScriptLock:()=>({tryLock(){if(held)return false;held=true;return true;},releaseLock(){held=false;}})},CacheService:{getScriptCache:()=>({get:k=>cache.get(k),put:(k,v)=>cache.set(k,v)})},
 MailApp:{sendEmail:m=>{if(failEmail)throw Error('quota');mail.push(m);},getRemainingDailyQuota:()=>1000},ScriptApp:{getProjectTriggers:()=>triggers,newTrigger:f=>({timeBased(){return this;},everyMinutes(){return this;},create(){triggers.push({getHandlerFunction:()=>f});}})}};
vm.createContext(ctx);for(const file of ['Code.gs','Schedule.gs','Meetings.gs'])vm.runInContext(fs.readFileSync(path.join(base,file),'utf8'),ctx,{filename:file});
const post=(action,fields={})=>{calls++;return JSON.parse(ctx.doPost({parameter:{...fields,action}}).content);};
const day=n=>fmt(new Date(Date.now()+n*86400000),'Asia/Tehran','yyyy-MM-dd');
const instant=(d,h)=>Date.parse(d+'T'+h+':00+03:30');
const make=(language='en')=>({key:crypto.randomUUID(),enquiryId:crypto.randomUUID(),language,consent:'yes',serviceInterest:'planning',education:'high',grade:'grade-10',fullName:'Test <student>',email:crypto.randomUUID().slice(0,8)+'@example.test',phone:'+98 912 345 6789',birthday:'2013-01-05',major:'Science',institution:'Test school'});
ctx.setup();const secret=props.get('VH_ADMIN_KEY');ctx.setup();assert.equal(triggers.length,1);assert.equal(props.get('VH_ADMIN_KEY'),secret);
const leads=tabs.get('Enquiries'),bookings=tabs.get('Bookings'),times=tabs.get('Consultation times');
const admin=(action,params={})=>post(action,{adminKey:secret,...params});
const mutate=(action,fields={},revision=ctx.revision_())=>admin(action,{operationId:crypto.randomUUID(),revision,...fields});
const rule=(key,mode,ranges=[])=>mutate('adminSchedule',{ruleKey:key,mode,ranges:JSON.stringify(ranges)});
const settings=(duration,interval)=>mutate('adminSettings',{duration,interval});
const a=make(),b=make('fa'),c=make(), keyA={key:a.key},keyB={key:b.key};
assert.equal(post('adminList').code,'auth');
for(const change of [{phone:''},{phone:'------'},{education:''},{grade:'grade-3'},{birthday:'2040-01-01'},{birthday:'2013-02-31'},{serviceInterest:'unknown'},{consent:''}]){
  assert.equal(post('enquiry',{...a,...change}).code,'invalid');
}
assert.equal(post('enquiry',a).saved,true);assert.equal(post('enquiry',a).saved,true);assert.equal(leads.rows.length,2);assert.equal(bookings.rows.length,1);
assert.equal(leads.rows[1][22],'Science');assert.equal(leads.rows[1][23],'Test school');assert.equal(leads.rows[1][20],'2013-01-05');
assert.equal(post('enquiry',{...a,key:crypto.randomUUID()}).code,'invalid');assert.equal(post('calendar',{key:a.enquiryId}).code,'missing');
assert(post('enquiry',b).ok);assert(post('enquiry',c).ok);assert.equal(post('calendar',keyA).slots.length,0);
const chosen=day(5),weekday=new Date(chosen+'T12:00Z').getUTCDay(),w='W:'+weekday,k='D:'+chosen;
assert(settings(45,15).ok);assert(rule(w,'hours',[[540,660],[780,840]]).ok);const nine=instant(chosen,'09:00'),readSlots=()=>post('calendar',keyA).slots;
assert(readSlots().includes(nine));assert(readSlots().includes(nine+15*60000));assert(!readSlots().includes(instant(chosen,'10:30')));
assert.equal(rule(w,'hours',[[600,700],[650,750]]).code,'range');
const rev=ctx.revision_();assert(rule(k,'off').ok);assert(!readSlots().includes(nine));assert.equal(mutate('adminSettings',{duration:30,interval:30},rev).code,'stale');
assert(rule(k,'all').ok);assert(readSlots().includes(instant(chosen,'00:00')));assert(readSlots().includes(instant(chosen,'23:15')));assert(!readSlots().includes(instant(chosen,'23:30')));
assert(rule(k,'inherit').ok);assert(readSlots().includes(nine));assert(!readSlots().includes(instant(chosen,'00:00')));
assert.equal(rule('D:'+day(-5),'all').code,'past');assert.equal(settings(0,15).code,'range');
const closeDay=day(1);assert(rule('D:'+closeDay,'all').ok);assert(readSlots().every(ms=>ms>=Date.now()+2*86400000-2000 && ms<=Date.now()+14*86400000));
externalBusy=[[nine+15*60000,nine+30*60000]];assert(!readSlots().includes(nine));assert(readSlots().includes(nine+30*60000));externalBusy=[];
failFree=true;assert(post('calendar',keyA).calendarOffline);const offline=make();assert(post('enquiry',offline).saved);assert.equal(post('book',{...keyA,start:nine}).ok,false);failFree=false;
assert.equal(post('book',{...keyA,start:nine,expectedDuration:30}).code,'unavailable');
held=true;assert.equal(post('book',{...keyA,start:nine}).code,'busy');held=false;
const ready=post('book',{...keyA,start:nine,expectedDuration:45});assert.equal(ready.booking.status,'Confirmed');assert.equal(ready.booking.end-nine,45*60000);assert(ready.booking.meet);assert(ready.booking.icalUid.endsWith('@google.com'));assert.equal(invites,1);
assert.equal(bookings.rows.length,2);assert.equal(bookings.rows[1][4],a.email);assert.equal(bookings.rows[1][0],a.enquiryId);assert.equal(leads.rows[1][12],'Booked');
assert.equal(post('book',{...keyA,start:nine}).booking.start,nine);assert.equal(invites,1);
assert.equal(post('book',{...keyB,start:nine+15*60000}).code,'unavailable');assert(!JSON.stringify(post('calendar',keyB)).includes(a.email));
const first=mail.find(m=>m.to===a.email && m.subject.includes('confirmation'));assert(first.body.includes('Google Meet'));assert(first.body.includes('Tehran time'));assert(first.body.includes('parent or guardian'));assert(first.htmlBody.includes('&lt;student&gt;'));assert(!first.body.includes('rescheduled'));
assert(settings(30,15).ok);assert.equal(post('calendar',keyA).booking.end-nine,45*60000);
const next=nine+45*60000;lateMeet=true;failAfterInsert=true;
let pending=post('book',{...keyB,start:next});assert.equal(pending.booking.status,'Reserved');assert(!pending.booking.meet);assert.equal(invites,2);
ctx.retryEmails();assert.equal(post('calendar',keyB).booking.status,'Reserved');assert(!mail.some(m=>m.to===b.email && m.subject.includes('تأیید جلسه')));
const evt=[...events.values()].find(e=>e.attendees[0].email===b.email);evt.hangoutLink='https://meet.google.com/uvw-xyza-bcd';
failEmail=true;ctx.retryEmails();assert.equal(post('calendar',keyB).booking.status,'Confirmed');failEmail=false;ctx.retryEmails();const count=mail.length;ctx.retryEmails();assert.equal(mail.length,count);assert.equal(invites,2);
assert(mail.some(m=>m.to===b.email && m.body.includes(evt.hangoutLink)&&m.htmlBody.includes('rtl')));assert(mail.some(m=>m.body.includes('#calendar/'+a.key)));
const adminBookings=admin('adminList').booked;assert.equal(adminBookings.length,2);assert.equal(adminBookings[0].end,nine+45*60000);
const old={...make(),grade:'Year 9',serviceInterest:'classes',phone:''};old.requestId=old.enquiryId;assert(post('',old).saved);
const oldStart=instant(day(4),'15:00');times.appendRow([new Date(oldStart),'Booked',old.requestId,new Date(),'Sent','Sent']);
times.appendRow([new Date(oldStart+30*60000),'Open','','','','']);ctx.setup();ctx.setup();assert.equal(bookings.rows.length,4);assert.equal(invites,2);
assert.equal(admin('adminList').booked.filter(r=>r.status==='Imported').length,1);assert(post('calendar',{key:c.key}).slots.includes(oldStart+30*60000));
assert(ctx.doGet({parameter:{requestId:old.requestId,callback:'vhReceipt_'+'0'.repeat(32)}}).content.includes('"saved":true'));
const html=ctx.doPost({parameter:{action:'calendar',key:a.key,transport:'frame',channel:crypto.randomUUID(),origin:'https://vhouse.ir'}}).content;
assert(html.includes('postMessage'));assert.equal(post('calendar',{key:a.key,transport:'frame',channel:crypto.randomUUID(),origin:'https://example.test'}).code,'origin');
const later=instant(day(7),'14:00'),sameLink=evt.hangoutLink;
evt.start.dateTime=new Date(later).toISOString();evt.end.dateTime=new Date(later+60*60000).toISOString();
ctx.retryEmails();const moved=post('calendar',keyB).booking;assert.equal(moved.start,later);assert.equal(moved.end,later+60*60000);assert.equal(moved.meet,sameLink);assert.equal(invites,2);
assert(mail.some(m=>m.to===b.email && m.subject.includes('زمان جدید') && m.body.includes(sameLink)));
const eventA=[...events.values()].find(e=>e.attendees[0].email===a.email);
eventA.start.dateTime=new Date(later+3600000).toISOString();eventA.end.dateTime=new Date(later+5400000).toISOString();
ctx.retryEmails();assert(mail.some(m=>m.to===a.email && m.body.includes('your rescheduled consultation') && m.body.includes(eventA.hangoutLink)));
const afterMove=mail.length;ctx.retryEmails();assert.equal(mail.length,afterMove);
evt.status='cancelled';ctx.retryEmails();const cancelled=post('calendar',keyB);assert.equal(cancelled.booking,null);assert.equal(cancelled.cancelled,true);assert.equal(leads.rows[2][12],'Cancelled');
console.log('PASS. '+calls+' isolated API calls. Enquiry validation and separate tabs, migration, weekly and date rules, varied durations and intervals, Tehran booking limits, Google free/busy, overlapping reservations, retry after lost event response, bilingual Meet mail, reschedule and cancellation reconciliation, staff access and duplicate prevention.');

/* A reservation reaches Confirmed after Google has returned the event's own Meet URL. */
function importV10_(db){
  const rows=allBookings_(db), seen=new Set(rows.map(r=>r[0]+'|'+instant_(r[1])));
  const leads=new Map(records_(db.leads,20).map(r=>[r[1],r]));
  for(const old of records_(db.times,VH.timeHeaders.length)) {
    const start=instant_(old[0]),id=old[2], key=id+'|'+start;
    if(old[1]!=='Booked' || !id || seen.has(key))continue;
    const lead=leads.get(id)||[];
    db.bookings.appendRow([id,new Date(start),new Date(start+30*MINUTE),safe_(text_(lead[2])),safe_(text_(lead[3])),safe_(text_(lead[4])),
      'Imported','','','',old[3] || new Date(),'Historical','Historical','V10 reservation','Imported','']);
    seen.add(key);
  }
}
function eventId_(id,start){return 'vh'+id.replace(/-/g,'').toLowerCase()+start.toString(16);}
function reserve_(db,p) {
  const person=identity_(db,p.key),wanted=Number(p.start);
  const current=slotView_(db,person.id);
  if(current.booking)return current;
  if(!current.slots.includes(wanted) || (p.expectedDuration && +p.expectedDuration!==current.duration)){
    return Object.assign(current,{ok:false,code:'unavailable'});
  }
  const lead=db.leads.getRange(person.row,1,1,VH.leadHeaders.length).getValues()[0];
  const row=[person.id,new Date(wanted),new Date(wanted+current.duration*MINUTE),safe_(text_(lead[2])),safe_(text_(lead[3])),safe_(text_(lead[4])),
    'Reserved',calendarID_(),eventId_(person.id,wanted),'',new Date(),'Pending','Pending','','Confirmation',''];
  db.bookings.appendRow(row);
  SpreadsheetApp.flush();
  const i=db.bookings.getLastRow();
  syncMeeting_(db,i,row,lead);
  if(row[6]==='Confirmed'){
    syncLeadStatus_(db.leads,person.row);
    sendBookingMail_(db,i,row,lead);
  }
  const updated=publicCalendar_(db,person.id);
  return row[6]==='Conflict'?Object.assign(updated,{ok:false,code:'unavailable'}):updated;
}
function lookupEvent_(calendar,id) {
  try{return Calendar.Events.get(calendar,id);}
  catch(error){
    if(/\b404\b|not\s*found/i.test(String(error)))return null;
    throw error;
  }
}
function meetLink_(event){
  const entry=(event.conferenceData?.entryPoints || []).find(item=>item.entryPointType==='video');
  const url=event.hangoutLink || entry?.uri || '';
  return /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}\/?$/i.test(url)?url:'';
}
function conference_(){return {createRequest:{requestId:Utilities.getUuid(),conferenceSolutionKey:{type:'hangoutsMeet'}}};}
function syncMeeting_(db,i,row,lead){
  if(row[6]!=='Reserved')return;
  try{
    const start=instant_(row[1]),end=instant_(row[2]),cal=row[7],id=row[8];
    let evt=lookupEvent_(cal,id);
    if(!evt){
      if(start<=Date.now() || overlaps_(start,end,busyRanges_(start,end))){
        row[6]='Conflict';row[13]='Time is no longer available. Choose another time.';
      }else{
        evt=Calendar.Events.insert({
          id,summary:'Vellum House | Consultation · '+text_(lead[2]),
          start:{dateTime:new Date(start).toISOString(),timeZone:VH.zone},end:{dateTime:new Date(end).toISOString(),timeZone:VH.zone},
          attendees:[{email:text_(lead[3])}],conferenceData:conference_(),guestsCanInviteOthers:false,
          description:'Vellum House Academic Management. Students under 18 attend with at least one parent or guardian.',
          extendedProperties:{private:{vellumEnquiry:String(row[0])}}
        },cal,{conferenceDataVersion:1,sendUpdates:'all'});
      }
    }
    if(evt){
      if(evt.status==='cancelled'){row[6]='Conflict';row[13]='Calendar event cancelled.';}
      else{
        need_(evt.extendedProperties?.private?.vellumEnquiry===row[0],'calendar');
        if(!evt.conferenceData || evt.conferenceData.createRequest?.status?.statusCode==='failure'){
          evt=Calendar.Events.patch({conferenceData:conference_()},cal,id,{conferenceDataVersion:1,sendUpdates:'all'});
        }
        const meet=meetLink_(evt);
        if(evt.iCalUID && /^[^\s\r\n]{1,254}$/.test(evt.iCalUID)){row[15]=evt.iCalUID;db.bookings.getRange(i,16).setValue(row[15]);}
        if(meet){row[9]=meet;row[6]='Confirmed';row[13]='';}
        else row[13]='Waiting for Google Meet.';
      }
    }
  }catch(_){row[13]='Calendar sync pending. Check permissions or quotas if this persists.';}
  db.bookings.getRange(i,7,1,4).setValues([row.slice(6,10)]);
  db.bookings.getRange(i,14).setValue(row[13]);SpreadsheetApp.flush();
}
function escapeHtml_(s){return String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);}
function parentNote_(birthday,start,fa){
  if(birthday) {
    const b=birthday instanceof Date?dayKey_(+birthday):String(birthday);
    const on=dayKey_(start);
    const age=Number(on.slice(0,4))-Number(b.slice(0,4))-(on.slice(5)<b.slice(5)?1:0);
    if(age>=18)return '';
    return fa?'لطفاً خودتان و دست‌کم یکی از والدین یا سرپرستتان در جلسه حضور داشته باشید.':'Please attend with at least one parent or guardian.';
  }
  return fa?'اگر زیر ۱۸ سال دارید، لطفاً همراه با دست‌کم یکی از والدین یا سرپرست خود در جلسه شرکت کنید.':'If you are under 18, please attend with at least one parent or guardian.';
}
function appointmentEmail_(lead,row,team){
  const fa=!team && lead[8]==='fa',name=text_(lead[2]),email=text_(lead[3]),start=instant_(row[1]);
  const meet=row[9],loc=fa?'fa-IR-u-ca-persian':'en-US';let date,time;
  try{
    date=new Intl.DateTimeFormat(loc,{timeZone:VH.zone,weekday:'long',year:'numeric',month:'long',day:'numeric'}).format(start);
    time=new Intl.DateTimeFormat(loc,{timeZone:VH.zone,hour:'numeric',minute:'2-digit',hour12:!fa}).format(start);
  }catch(_){
    date=Utilities.formatDate(new Date(start),VH.zone,fa?'yyyy-MM-dd':'EEEE, MMMM d, yyyy')+(fa?' (میلادی)':'');
    time=Utilities.formatDate(new Date(start),VH.zone,fa?'HH:mm':'h:mm a');
  }
  time+=fa?' (به وقت تهران)':' (Tehran time)';
  const ref=String(lead[1]).slice(0,8).toUpperCase(),base={to:team?VH.notify:email,replyTo:team?email:VH.notify,name:'Vellum House'};
  if(row[6]==='Cancelled'){
    base.subject=fa?'ولوم هاوس | لغو جلسهٔ مشاوره':'Vellum House | Consultation cancelled';
    base.body=(fa?'جلسهٔ مشاورهٔ شما لغو شد. برای انتخاب وقت جدید، این پیوند را باز کنید.':'The consultation has been cancelled. Use this link to choose another time.')+'\n'+date+' · '+time+'\n'+(team?VH.site+'/admin.html':resumeUrl_(lead));
    return base;
  }
  if(row[6]==='Conflict'){
    base.subject=fa?'ولوم هاوس | انتخاب وقت جدید':'Vellum House | Please choose another consultation time';
    base.body=(fa?'وقت انتخاب‌شده در دسترس نیست. لطفاً وقت دیگری انتخاب کنید.':'The selected time is no longer available. Please choose another time.')+'\n\n'+(team?VH.site+'/admin.html':resumeUrl_(lead))+'\n'+ref;
    return base;
  }
  if(team){
    base.subject=row[14]==='Rescheduled'?'Vellum House | Consultation rescheduled':'Vellum House | Consultation booked';
    base.body=[name,email,text_(lead[4]),text_(lead[6]),date,time,'Google Meet',meet,'Reference '+ref,VH.site+'/admin.html'].join('\n');
    return base;
  }
  const greet=fa?name+' عزیز،':'Dear '+name+',';
  const rescheduled=row[14]==='Rescheduled',linkChanged=row[14]==='Updated link';
  const intro=rescheduled?(fa?'زمان جدید جلسهٔ مشاورهٔ شما با ولوم هاوس تأیید شد.':'We are pleased to confirm your rescheduled consultation with Vellum House.'):
    linkChanged?(fa?'پیوند جدید جلسهٔ مشاورهٔ شما در ادامه آمده است.':'Your consultation has an updated Google Meet link.'):fa?'جلسهٔ مشاورهٔ شما با ولوم هاوس تأیید شد.':'We are pleased to confirm your consultation with Vellum House.';
  const title=fa?'جزئیات جلسه':'Meeting details', labels=fa?['تاریخ','ساعت','بستر برگزاری','پیوند جلسه']:['Date','Time','Platform','Meeting link'];
  const note=parentNote_(lead[20],start,fa);
  const closing=fa?'مشتاق گفت‌وگو دربارهٔ هدف‌های تحصیلی و مسیر پیش روی شما هستیم.':'We look forward to discussing your academic goals and pathway.';
  const sign=fa?'با احترام،':'Best regards,';
  const values=[date,time,'Google Meet',meet];
  base.subject=rescheduled?(fa?'ولوم هاوس | تأیید زمان جدید مشاوره':'Vellum House | Rescheduled consultation'):
    fa?'ولوم هاوس | تأیید جلسهٔ مشاوره':'Vellum House | Consultation confirmation';
  base.body=[greet,intro,title+'\n'+labels.map((l,i)=>l+': '+values[i]).join('\n'),note,closing,sign+'\nVellum House\nAcademic Management'].filter(Boolean).join('\n\n');
  const list=labels.map((l,i)=>'<li><b>'+escapeHtml_(l)+'</b> · '+(i===3?'<a dir="ltr" href="'+escapeHtml_(meet)+'">'+escapeHtml_(meet)+'</a>':escapeHtml_(values[i]))+'</li>').join('');
  base.htmlBody='<div dir="'+(fa?'rtl':'ltr')+'"><p>'+escapeHtml_(greet)+'</p><p>'+escapeHtml_(intro)+'</p><strong>'+title+'</strong><ul>'+list+'</ul>'+(note?'<p>'+note+'</p>':'')+'<p>'+closing+'</p><p>'+sign+'<br><b>Vellum House</b><br>Academic Management</p></div>';
  return base;
}
function enquiryEmail_(lead,team){
  const fa=lead[8]==='fa',email=text_(lead[3]),name=text_(lead[2]);
  const message={to:team?VH.notify:email,replyTo:team?email:VH.notify,name:'Vellum House'};
  if(team){
    message.subject='Vellum House | New enquiry';
    message.body=[name,email,text_(lead[4]),text_(lead[5]),text_(lead[6]),text_(lead[7]),'Open the dashboard: '+VH.site+'/admin.html'].join('\n');
  }else{
    message.subject=fa?'ولوم هاوس | دریافت درخواست مشاوره':'Vellum House | Your consultation enquiry';
    message.body=(fa?name+' عزیز،\n\nدرخواست شما ثبت شد. برای انتخاب وقت یا مشاهدهٔ جزئیات رزرو، پیوند اختصاصی زیر را باز کنید.':'Dear '+name+',\n\nWe received your enquiry. Use this private link to choose a time or view your booking.')+'\n'+resumeUrl_(lead)+'\n\nVellum House\nAcademic Management';
  }
  return message;
}
function deliver_(tab,i,col,message){
  try{
    const cell=tab.getRange(i,col);
    if(cell.getValue()==='Sent' || MailApp.getRemainingDailyQuota()<1)return;
    MailApp.sendEmail(message);cell.setValue('Sent');SpreadsheetApp.flush();
  }catch(_){console.warn('Email remains queued.');}
}
function sendBookingMail_(db,i,row,lead){
  if(!['Confirmed','Conflict','Cancelled'].includes(row[6]))return;
  if(row[6]==='Confirmed' && !row[9])return;
  for(const col of [13,12]) if(row[col-1]!=='Sent')deliver_(db.bookings,i,col,appointmentEmail_(lead,row,col===12));
}
// Read a bounded, rotating batch of upcoming appointments. Staff can move a timed
// meeting in Google Calendar and the same booking, link and email follow the edit.
function reconcileEvents_(db,byId){
  const candidates=allBookings_(db).map((r,i)=>({r,i:i+2})).filter(x=>x.r[6]==='Confirmed' && instant_(x.r[2])>=Date.now()-DAY);
  if(!candidates.length)return;
  const props=properties_(),offset=Number(props.getProperty('VH_SYNC_CURSOR') || 0)%candidates.length;
  let n=0;const deadline=Date.now()+35000;
  for(;n<Math.min(candidates.length,16) && Date.now()<deadline;n++){
    const {r:known,i}=candidates[(offset+n)%candidates.length];
    try{
      let event;
      try{event=Calendar.Events.get(known[7],known[8]);}
      catch(err){
        if(!/\b410\b|resource has been deleted/i.test(String(err)))throw err;
        event={status:'cancelled'};
      }
      if(!event)continue;
      const cancelled=event.status==='cancelled';
      if(!cancelled && event.extendedProperties?.private?.vellumEnquiry!==known[0])continue;
      const start=Date.parse(event.start?.dateTime),end=Date.parse(event.end?.dateTime),meet=meetLink_(event);
      if(!cancelled && (!isFinite(start)||!isFinite(end)||end<=start))continue;
      const moved=!cancelled && (start!==instant_(known[1]) || end!==instant_(known[2]));
      if(!cancelled && !moved && meet===known[9])continue;
      withLock_(()=>{
        const row=db.bookings.getRange(i,1,1,VH.bookingHeaders.length).getValues()[0];
        if(row[6]!=='Confirmed' || row[8]!==known[8] || instant_(row[1])!==instant_(known[1]) || instant_(row[2])!==instant_(known[2]) || row[9]!==known[9])return;
        row[6]=cancelled?'Cancelled':meet?'Confirmed':'Reserved';
        if(!cancelled){row[1]=new Date(start);row[2]=new Date(end);}
        row[9]=cancelled?'':meet;row[11]='Pending';row[12]='Pending';row[13]='';
        row[14]=cancelled?'Cancelled':moved?'Rescheduled':'Updated link';
        for(const col of [3,4,5])row[col]=safe_(text_(row[col]));
        db.bookings.getRange(i,2,1,row.length-1).setValues([row.slice(1)]);
        if(cancelled && byId.has(row[0]))db.leads.getRange(byId.get(row[0]).i,13).setValue('Cancelled');
      });
    }catch(_){console.warn('Calendar change will be checked again.');}
  }
  props.setProperty('VH_SYNC_CURSOR',String((offset+n)%candidates.length));
}
function retryEmails(){
  const db=store_(),started=Date.now(), byId=new Map(records_(db.leads,VH.leadHeaders.length).map((r,i)=>[r[1],{i:i+2,row:r}]));
  reconcileEvents_(db,byId);
  const rows=allBookings_(db);
  for(let i=0;i<rows.length && Date.now()-started<200000;i++){
    const initial=rows[i],lead=byId.get(initial[0]);if(!lead || initial[6]==='Imported')continue;
    if(initial[6]!=='Reserved' && initial[11]==='Sent' && initial[12]==='Sent')continue;
    withLock_(()=>{
      const row=db.bookings.getRange(i+2,1,1,VH.bookingHeaders.length).getValues()[0];
      if(row[6]==='Reserved')syncMeeting_(db,i+2,row,lead.row);
      if(row[6]==='Confirmed')syncLeadStatus_(db.leads,lead.i);
      sendBookingMail_(db,i+2,row,lead.row);
    });
  }
  for(const {row,i} of byId.values()){
    if(Date.now()-started>240000 || MailApp.getRemainingDailyQuota()<1)break;
    if(row[16]==='Sent' && row[17]==='Sent')continue;
    withLock_(()=>{
      if(!row[19]){
        const key=db.leads.getRange(i,20);row[19]=key.getValue() || Utilities.getUuid();key.setValue(row[19]);
      }
      if(row[17]!=='Sent')deliver_(db.leads,i,18,enquiryEmail_(row,false));
      if(row[16]!=='Sent')deliver_(db.leads,i,17,enquiryEmail_(row,true));
    });
  }
}

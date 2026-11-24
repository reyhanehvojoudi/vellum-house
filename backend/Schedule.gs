const MINUTE=60000, DAY=86400000;
const DURATIONS=[15,20,30,45,60,90,120], INTERVALS=[5,10,15,20,30,45,60,90,120];
function policy_() {
  const raw=properties_().getProperty('VH_POLICY');
  return raw ? JSON.parse(raw) : {duration:30,interval:30};
}
function revision_(){return properties_().getProperty('VH_SCHEDULE_REV') || 'initial';}
function dayKey_(ms){return Utilities.formatDate(new Date(ms),VH.zone,'yyyy-MM-dd');}
function dateKeyValid_(day){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day))return false;
  const d=new Date(day+'T12:00:00Z');return isFinite(+d) && d.toISOString().slice(0,10)===day;
}
function ruleList_(db){
  return records_(db.rules,3).filter(r=>r[0] && r[1]!=='inherit').map(r=>({key:r[0],mode:r[1],ranges:JSON.parse(r[2] || '[]')}));
}
function validateRanges_(mode,input){
  if(mode!=='hours')return [];
  let list;
  try{list=JSON.parse(input);}catch(_){throw new Error('range');}
  need_(Array.isArray(list) && list.length>=1 && list.length<=12,'range');
  for(const range of list)need_(Array.isArray(range) && range.length===2 && range.every(Number.isInteger) &&
    range[0]>=0 && range[0]<range[1] && range[1]<=1440,'range');
  list.sort((a,b)=>a[0]-b[0]);
  need_(list.every((r,i)=>!i || r[0]>=list[i-1][1]),'range');return list;
}
function editSchedule_(db,action,p) {
  need_(VH.uuid.test(p.operationId || ''),'invalid');
  const cache=CacheService.getScriptCache(),op='vh-schedule-'+p.operationId;
  if(cache.get(op))return management_(db);
  need_(p.revision===revision_(),'stale');
  if(action==='adminSettings'){
    const duration=Number(p.duration),interval=Number(p.interval);
    need_(DURATIONS.includes(duration) && INTERVALS.includes(interval),'range');
    properties_().setProperty('VH_POLICY',JSON.stringify({duration,interval}));
  }else{
    const key=String(p.ruleKey || ''),weekly=/^W:[0-6]$/.test(key),day=key.slice(2);
    need_(weekly || (key.startsWith('D:') && dateKeyValid_(day)),'range');
    need_(weekly || day>=dayKey_(Date.now()) || p.mode==='inherit','past');
    need_(['all','hours','off','inherit'].includes(p.mode),'range');
    const ranges=validateRanges_(p.mode,p.ranges),row=findRow_(db.rules,1,key);
    const values=[key,p.mode,JSON.stringify(ranges),new Date()];
    if(row)db.rules.getRange(row,1,1,4).setValues([values]);
    else if(p.mode!=='inherit')db.rules.appendRow(values);
  }
  properties_().setProperty('VH_SCHEDULE_REV',p.operationId);SpreadsheetApp.flush();cache.put(op,'1',1800);
  return management_(db);
}
function calendarID_(){const id=properties_().getProperty('VH_CALENDAR_ID');need_(id,'setup');return id;}
function busyRanges_(from,to) {
  const ids=[...new Set([calendarID_()].concat((properties_().getProperty('VH_BUSY_CALENDARS') || '').split(',').map(x=>x.trim()).filter(Boolean)))];
  try{
    const data=Calendar.Freebusy.query({timeMin:new Date(from).toISOString(),timeMax:new Date(to).toISOString(),items:ids.map(id=>({id}))});
    const busy=[];
    for(const id of ids) {
      const cal=data.calendars?.[id];need_(cal && !cal.errors?.length && Array.isArray(cal.busy),'calendar');
      for(const range of cal.busy)busy.push([Date.parse(range.start),Date.parse(range.end)]);
    }
    return busy;
  }catch(_){throw new Error('calendar');}
}
function overlaps_(a,b,ranges){return ranges.some(r=>a<r[1] && b>r[0]);}
function allBookings_(db){return records_(db.bookings,VH.bookingHeaders.length);}
function activeBooking_(row){return ['Reserved','Confirmed','Imported'].includes(row[6]);}
function ownBooking_(rows,id){return rows.find(r=>r[0]===id && activeBooking_(r));}
function slotView_(db,id) {
  const now=Date.now(), min=now+VH.notice,max=now+VH.horizon, policy=policy_();
  const rows=allBookings_(db), own=ownBooking_(rows,id);
  const view={ok:true,min,max,duration:policy.duration,interval:policy.interval,slots:[],booking:null};
  if(own){
    view.booking={start:instant_(own[1]),end:instant_(own[2]),status:own[6],meet:own[9] || '',icalUid:own[15] || '',ref:id.slice(0,8).toUpperCase()};
    return view;
  }
  const latest=rows.filter(r=>r[0]===id).pop();
  view.conflict=latest?.[6]==='Conflict';view.cancelled=latest?.[6]==='Cancelled';
  const duration=policy.duration*MINUTE;
  const rules=new Map(ruleList_(db).map(r=>[r.key,r]));
  const legacy=records_(db.times,2), byDay=new Map();
  for(const [date,state] of legacy){
    const ms=instant_(date);if(state!=='Open' || ms<min || ms>max)continue;
    const key=dayKey_(ms);if(!byDay.has(key))byDay.set(key,[]);
    byDay.get(key).push(ms);
  }
  const candidates=new Set(),first=Date.parse(dayKey_(min)+'T12:00:00Z'),last=Date.parse(dayKey_(max)+'T12:00:00Z');
  for(let x=first;x<=last;x+=DAY) {
    const key=new Date(x).toISOString().slice(0,10);
    const rule=rules.get('D:'+key) || rules.get('W:'+new Date(x).getUTCDay());
    if(!rule){
      // Each old V10 slot represents an actual 30-minute open window.
      const old=(byDay.get(key)||[]).sort((a,b)=>a-b);
      for(const start of old){
        let covered=start;for(const t of old){if(t===covered)covered+=30*MINUTE;if(covered>=start+duration)break;}
        if(covered>=start+duration)candidates.add(start);
      }
      continue;
    }
    const midnight=+Utilities.parseDate(key+' 00:00',VH.zone,'yyyy-MM-dd HH:mm');
    const ranges=rule.mode==='all'?[[0,1440]]:rule.mode==='hours'?rule.ranges:[];
    for(const [a,b] of ranges) for(let t=a;t+policy.duration<=b;t+=policy.interval){
      const ms=midnight+t*MINUTE;if(ms>=min && ms<=max)candidates.add(ms);
    }
  }
  if(!candidates.size)return view;
  const blocked=busyRanges_(min,max+duration);
  rows.filter(activeBooking_).forEach(r=>blocked.push([instant_(r[1]),instant_(r[2])]));
  view.slots=Array.from(candidates).filter(t=>!overlaps_(t,t+duration,blocked)).sort((a,b)=>a-b);
  return view;
}
function publicCalendar_(db,id){
  try{return slotView_(db,id);}
  catch(err){
    if(err.message!=='calendar')throw err;
    const now=Date.now();
    return {ok:true,min:now+VH.notice,max:now+VH.horizon,duration:policy_().duration,slots:[],booking:null,calendarOffline:true};
  }
}
function management_(db) {
  const leadMap=new Map(records_(db.leads,9).map(r=>[r[1],r]));
  const booked=allBookings_(db).map(r=>({start:instant_(r[1]),end:instant_(r[2]),name:text_(r[3]),email:text_(r[4]),phone:text_(r[5]),topic:text_((leadMap.get(r[0])||[])[6]),status:r[6],meet:r[9],sync:r[13]})).sort((a,b)=>a.start-b.start);
  const today=dayKey_(Date.now());
  const rules=ruleList_(db).filter(r=>!r.key.startsWith('D:')||r.key.slice(2)>=today).sort((a,b)=>a.key.localeCompare(b.key));
  const legacyDays=[...new Set(records_(db.times,2).filter(r=>r[1]==='Open' && instant_(r[0])>=Date.now()).map(r=>dayKey_(instant_(r[0]))))].sort();
  return {ok:true,policy:policy_(),revision:revision_(),rules,booked,legacyDays};
}

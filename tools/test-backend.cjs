/** Vellum House: Apps Script dry-run tests. No Google login, messages or sheet network writes. */
const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const code=fs.readFileSync(__dirname+'/../backend/Code.gs','utf8');
let rows=[],mails=[],props=new Map(),cache=new Map(),triggers=[];
const sheet={
  getLastRow:()=>rows.length,
  getRange:(...coords)=>({
    setValues:v=>{rows[0]=v[0];return this},
    setFontWeight:()=>({setBackground:()=>({setFontColor:()=>{}})}),
    setNumberFormat:()=>{},setWrap:()=>{},setDataValidation:()=>{},
    createTextFinder:id=>({matchEntireCell:()=>({useRegularExpression:()=>({findNext:()=>rows.slice(1).find(r=>r[1]===id)?{}:null})})}),
    setValue:v=>{if(typeof coords[0]==='number') rows[coords[0]-1][coords[1]-1]=v;}
  }),
  setFrozenRows:()=>{},
  appendRow:r=>rows.push(r),
  getDataRange:()=>({getValues:()=>rows})
};
const scripts={getProjectTriggers:()=>triggers,newTrigger:fn=>({timeBased:()=>({everyMinutes:n=>({create:()=>triggers.push({fn,n})})})})};
const scriptprops={setProperty:(k,v)=>props.set(k,v),getProperty:k=>props.get(k)};
const ctx={
  SpreadsheetApp:{getActiveSpreadsheet:()=>({getId:()=> 'private-id',getSheetByName:()=>sheet,insertSheet:()=>sheet}),openById:()=>({getSheetByName:()=>sheet}),newDataValidation:()=>({requireValueInList:()=>({setAllowInvalid:()=>({build:()=>({})})})}),flush:()=>{}},
  PropertiesService:{getScriptProperties:()=>scriptprops},ScriptApp:scripts,
  MailApp:{getRemainingDailyQuota:()=>999,sendEmail:opts=>{mails.push(opts)}},
  CacheService:{getScriptCache:()=>({get:k=>cache.get(k),put:(k,v)=>cache.set(k,v)})},
  Utilities:{DigestAlgorithm:{SHA_256:'sha256'},computeDigest:(_,x)=>Array.from(crypto.createHash('sha256').update(x).digest()),base64EncodeWebSafe:arr=>Buffer.from(arr).toString('base64url')},
  LockService:{getScriptLock:()=>({waitLock:()=>{},releaseLock:()=>{},tryLock:()=>true})},
  ContentService:{MimeType:{JSON:'json',JAVASCRIPT:'js'},createTextOutput:content=>({content,setMimeType(t){this.mime=t;return this}})},console,Date
};
vm.createContext(ctx);vm.runInContext(code,ctx);
const id='cab53ab1-23ab-4aad-8b12-67fbdea45401';
function post(p){return JSON.parse(ctx.doPost({parameter:p}).content)}
ctx.setup();assert.equal(rows.length,1);assert.equal(rows[0].length,19);assert.equal(triggers.length,1);
assert.deepEqual(post({requestId:id,consent:'yes',language:'en'}),{saved:false});
const v={requestId:id,fullName:'A Parent',email:'parent@example.com',grade:'Grade 9',phone:'',serviceInterest:'full',message:'Discuss goals',source:'instagram',language:'en',consent:'yes',website:''};
assert.equal(post({...v}).saved,true);assert.equal(rows.length,2);assert.equal(mails.length,2);
assert.equal(rows[1][11],'New');assert.equal(rows[1][12],'Not booked');
assert.equal(rows[1][16],'Sent');assert.equal(rows[1][17],'Sent');
assert(mails[1].body.includes('cal.com/vhouse/consultation'));
assert.equal(post({...v}).saved,true);assert.equal(rows.length,2);assert.equal(mails.length,2);
const x=ctx.doGet({parameter:{requestId:id,callback:'vhReceipt_0123456789abcdef0123456789abcdef'}}).content;
assert(x.includes('"saved":true')&&!x.includes('parent@example.com'));
assert.equal(post({...v,requestId:'100003b0-ffff-4aaa-bbbb-abccccccdddd',fullName:'=HYPERLINK("bad")'}).saved,true);
assert(rows[2][2].startsWith("'="));
console.log('PASS — save, validation, duplicate protection, notification, acknowledgement, receipt privacy, formula safety');

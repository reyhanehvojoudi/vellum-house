// Local behavioral tests. No Google account, live sheet or emails are used.
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
let rows=[[]],mail=[],cache=new Map(),fail=false;
const sheet={getLastRow:()=>rows.length,getRange:(row,col,n)=>({
 createTextFinder:id=>({matchEntireCell(){return this},useRegularExpression(){return this},findNext:()=>rows.slice(1).some(r=>r[1]===id)?{}:null}),
 setValue:v=>{rows[row-1][col-1]=v;return this;}}),appendRow:r=>rows.push(r),getDataRange:()=>({getValues:()=>rows.map(r=>[...r])})};
const lock={waitLock(){},releaseLock(){},tryLock:()=>true};
const ctx={console,Date,ContentService:{MimeType:{JSON:'json',JAVASCRIPT:'js'},createTextOutput:text=>({text,setMimeType(){return this}})},SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet}),flush(){}},PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'private-sheet'})},LockService:{getScriptLock:()=>lock},CacheService:{getScriptCache:()=>({get:k=>cache.get(k),put:(k,v)=>cache.set(k,v)})},Utilities:{DigestAlgorithm:{SHA_256:1},computeDigest:(a,s)=>s,base64EncodeWebSafe:s=>s},MailApp:{getRemainingDailyQuota:()=>100,sendEmail:m=>{if(fail)throw Error('Quota temporary');mail.push(m)}}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/../backend/Code.gs','utf8'),ctx);
const p={requestId:'12345678-1234-4123-8123-123456789abc',fullName:'=HYPERLINK("bad")',grade:'12',city:'Tehran',phone:'+989121234567',email:'applicant@example.com',message:'Physics planning',consent:'on',language:'en',website:''};
const post=changes=>JSON.parse(ctx.doPost({parameter:{...p,...changes}}).text);
assert.equal(post().saved,true);assert.equal(rows.length,2);assert.equal(mail.length,3);assert.equal(mail[0].to,'reyhaneh.vojoudi@gmail.com');assert.equal(mail[1].to,'kasra01@gmail.com');assert.equal(mail[2].to,p.email);assert.equal(rows[1][2][0],"'");
post();assert.equal(rows.length,2);assert.equal(mail.length,3);
for(const changes of [{consent:''},{website:'spam'},{email:'bad'},{phone:'abc'},{message:''},{fullName:'x'.repeat(121)},{requestId:'bad'},{language:'zz'}])assert.equal(post(changes).saved,false);
const receipt=ctx.doGet({parameter:{requestId:p.requestId,callback:'vhReceipt_12345678123441238123123456789abc'}}).text;
assert.match(receipt,/"saved":true/);assert(!receipt.includes('Tehran'));assert(!receipt.includes('applicant'));
assert.equal(JSON.parse(ctx.doGet({parameter:{callback:'alert(1)'}}).text).saved,false);
fail=true;assert.equal(post({requestId:'12345678-1234-4123-8123-123456789abd',email:'second@example.com'}).saved,true);assert.equal(rows[2][10],'Pending');
fail=false;ctx.retryEmails();assert.equal(mail.length,6);assert.equal(rows[2][10],'Sent');assert.equal(rows[2][12],'Sent');
console.log('PASS: persistence, three recipients, idempotency, validation, formula escaping, private receipt, deferred mail retry');

// Simple POST normally reads the JSON response. The iframe fallback also supports
// browsers that block reading Apps Script's cross-origin ContentService redirect.
export async function request(action, fields={}) {
  const endpoint = window.VELLUM_CONFIG?.formEndpoint;
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint || '')) throw new Error('service');
  const body = new URLSearchParams({...fields, action});
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 22000);
  try {
    const response = await fetch(endpoint, {method:'POST',body,credentials:'omit',referrerPolicy:'no-referrer',signal:abort.signal});
    const result = await response.json();
    if (typeof result?.ok === 'boolean') return result.version===11 ? result : {ok:false,code:'setup'};
    // A response from an older deployment cannot confirm a native booking.
    if (result && 'saved' in result) return {ok:false,code:'setup'};
  } catch (_) {
    // The first write might already have succeeded. Repeat the exact same operation.
  } finally { clearTimeout(timer); }
  return frameRequest(endpoint,body);
}
function frameRequest(endpoint,body) {
  return new Promise((resolve,reject) => {
    const channel = crypto.randomUUID(), frame = document.createElement('iframe'), form = document.createElement('form');
    frame.hidden = true; frame.name = 'vh_'+channel; frame.title = 'Calendar transport';
    form.hidden = true; form.method = 'POST'; form.action = endpoint; form.target = frame.name;
    const params = new URLSearchParams(body);
    params.set('transport','frame'); params.set('origin',location.origin); params.set('channel',channel);
    params.forEach((value,name) => {
      const field = document.createElement('input');
      field.type = 'hidden'; field.name = name; field.value = value; form.append(field);
    });
    function finish(value) {
      clearTimeout(timer); window.removeEventListener('message',receive);
      form.remove(); frame.remove();
      if (value) resolve(value); else reject(new Error('service'));
    }
    function receive(event) {
      if (!/^https:\/\/(?:script\.google\.com|(?:[a-z0-9-]+\.)?script\.googleusercontent\.com|[a-z0-9-]+-script\.googleusercontent\.com)$/.test(event.origin)) return;
      if (event.data?.type !== 'vh-calendar' || event.data.channel !== channel || typeof event.data.result?.ok !== 'boolean') return;
      let source = event.source;
      while (source && source !== frame.contentWindow && source !== source.parent) source = source.parent;
      if (source === frame.contentWindow) finish(event.data.result.version===11 ? event.data.result : {ok:false,code:'setup'});
    }
    const timer = setTimeout(() => finish(null),27000);
    window.addEventListener('message',receive);
    document.body.append(frame,form); form.submit();
  });
}
const TZ = 'Asia/Tehran';
const formats = new Map();
export function formatDate(ms,lang,options) {
  const locale = lang === 'fa' ? 'fa-IR-u-ca-persian' : 'en-GB';
  const key = locale+JSON.stringify(options);
  if (!formats.has(key)) formats.set(key,new Intl.DateTimeFormat(locale,{timeZone:TZ,...options}));
  const formatter=formats.get(key);
  if (lang==='fa' && options.month==='long' && options.year) {
    const parts=Object.fromEntries(formatter.formatToParts(ms).map(item=>[item.type,item.value]));
    const date=[parts.day,parts.month,parts.year].filter(Boolean).join(' ');
    return parts.weekday ? parts.weekday+'، '+date : date;
  }
  return formatter.format(ms);
}
const isoFormatter = new Intl.DateTimeFormat('en-CA-u-ca-gregory-nu-latn',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'});
export function dateKey(ms) {
  const parts = Object.fromEntries(isoFormatter.formatToParts(ms).map(p => [p.type,p.value]));
  return [parts.year,parts.month,parts.day].join('-');
}
export const clock = (ms,lang) => formatDate(ms,lang,{hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
export const longDate = (ms,lang) => formatDate(ms,lang,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
export function el(tag,cls,value) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (value != null) node.textContent = value;
  return node;
}
export function button(label,cls,handler) {
  const node = el('button',cls,label);
  node.type='button'; node.addEventListener('click',handler); return node;
}

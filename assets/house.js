(() => {
  'use strict';
  const lang = document.documentElement.lang, fa = lang === 'fa', main = document.querySelector('main');
  const dialog = document.getElementById('language-dialog');
  const cache = new Map([['intro',main.firstElementChild]]);
  const aliases = {method:'journey',approach:'journey',pathways:'journey',services:'journey',people:'founders',about:'founders',consultation:'consult',terms:'intro'};
  const known = ['intro','journey','founders','contact','consult','calendar','privacy'];
  let current = '', stage = 0, bookingModule;
  function read(k) { try { return sessionStorage.getItem(k); } catch (_) { return null; } }
  function write(k,v) { try { if (v===null) sessionStorage.removeItem(k); else sessionStorage.setItem(k,v); } catch (_) {} }
  function booking() { return bookingModule ||= import('./booking.js?v=10').catch(e => {bookingModule=null;throw e;}); }
  function locationInfo() {
    const [part='',key=''] = location.hash.slice(1).split('/');
    const name = aliases[part] || part;
    return {view:known.includes(name) ? name : 'intro',key};
  }
  function route(focus=true) {
    const {view,key} = locationInfo(), name = view === 'privacy' ? 'consult' : view;
    if (!cache.has(name)) cache.set(name,document.getElementById('view-'+name).content.firstElementChild.cloneNode(true));
    const changed = current !== name;
    current = name;
    if (changed) {
      main.replaceChildren(cache.get(name)); main.dataset.view=name;
      document.querySelectorAll('.mast a[href^="#"]').forEach(a => {
        if (a.hash === '#'+name || (name==='calendar' && a.hash==='#consult')) a.setAttribute('aria-current','page');
        else a.removeAttribute('aria-current');
      });
      if (focus) {main.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
    }
    if (name === 'intro') {
      const image=main.querySelector('.hero-media');
      if(image) image.replaceWith(image.content.cloneNode(true));
    }
    if (name === 'journey') showStage(stage);
    if (view === 'privacy') main.querySelector('details').open=true;
    if (name === 'consult') restoreDraft();
    if (name === 'calendar') booking().then(m => { if (current==='calendar') m.openCalendar(key); }).catch(() => {
      if (current==='calendar') document.getElementById('calendar-area').textContent=fa?'تقویم بارگیری نشد. صفحه را دوباره باز کنید.':'The calendar could not load. Please reload this page.';
    });
  }
  function showStage(value) {
    if (value<0 || value>4) return;
    stage=value;
    main.querySelectorAll('[data-stage]').forEach((b,i) => {b.setAttribute('aria-pressed',String(i===value));b.classList.toggle('passed',i<value);});
    main.querySelectorAll('[data-stage-copy]').forEach((a,i) => {a.hidden=i!==value;});
    main.querySelectorAll('[data-delta]').forEach(b => {const target=value+Number(b.dataset.delta);b.disabled=target<0 || target>4;});
    main.querySelector('#route-clip rect').setAttribute('width',String(100+value*200));
  }
  function restoreDraft() {
    const draft=read('vh-language-draft'), form=document.getElementById('enquiry-form');
    if (!draft || !form) return;
    write('vh-language-draft',null);
    try {
      for (const [key,value] of Object.entries(JSON.parse(draft))) {
        const field=form.elements.namedItem(key);
        if (!field || key==='website') continue;
        if (field.type==='checkbox') field.checked=value==='yes'; else field.value=value;
      }
    } catch (_) {}
  }
  function choose(choice) {
    write('vh-lang',choice);
    if (dialog.open) dialog.close();
    if (choice===lang) return;
    const form=document.getElementById('enquiry-form');
    if (form) { const data = Object.fromEntries(new FormData(form)); delete data.website; write('vh-language-draft',JSON.stringify(data)); }
    const url=new URL(choice==='fa'?'index.html':'en.html',location.href);
    url.search=location.search; url.hash=location.hash; location.assign(url.href);
  }
  document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();main.focus();});
  document.getElementById('language-control').addEventListener('click',() => dialog.showModal());
  dialog.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click',() => choose(b.dataset.lang)));
  document.getElementById('dismiss-language').addEventListener('click',() => choose(lang));
  dialog.addEventListener('cancel',() => write('vh-lang',lang));
  main.addEventListener('click',event => {
    const btn=event.target.closest('button'); if (!btn || current!=='journey') return;
    if (btn.hasAttribute('data-stage')) showStage(Number(btn.dataset.stage));
    if (btn.hasAttribute('data-delta')) showStage(stage+Number(btn.dataset.delta));
  });
  main.addEventListener('keydown',event => {
    if (current !== 'journey' || dialog.open || !['ArrowRight','ArrowLeft'].includes(event.key)) return;
    event.preventDefault(); showStage(stage+(event.key===(fa?'ArrowLeft':'ArrowRight')?1:-1));
  });
  main.addEventListener('submit',async event => {
    if (event.target.id!=='enquiry-form') return;
    event.preventDefault();
    const form=event.target, status=form.querySelector('#enquiry-status');
    try { const mod=await booking();await mod.submitEnquiry(form); }
    catch (_) {status.className='status error';status.textContent=fa?'ثبت درخواست تأیید نشد. دوباره تلاش کنید.':'We could not verify your enquiry. Please try again.';}
  });
  window.addEventListener('hashchange',() => route());
  route(false);
  if (!read('vh-lang')) dialog.showModal();
})();

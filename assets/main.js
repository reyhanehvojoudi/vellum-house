'use strict';
const isFa = document.documentElement.lang === 'fa';
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu() { if (!menu || !nav) return; menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); }
if (menu && nav) {
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
  window.matchMedia('(min-width:1151px)').addEventListener('change', closeMenu);
}
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
const form = document.querySelector('#inquiry-form');
if (form) {
  const result = document.querySelector('#inquiry-result');
  const summary = document.querySelector('#inquiry-summary');
  const status = document.querySelector('#copy-status');
  const send = document.querySelector('#send-inquiry');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const lines = [isFa ? 'درخواست مشاورهٔ ولوم هاوس' : 'Vellum House consultation enquiry', ''];
    for (const field of form.querySelectorAll('input:not([type=checkbox]), select, textarea')) {
      if (!field.value.trim()) continue;
      const label = form.querySelector(`label[for="${field.id}"]`).childNodes[0].textContent.trim();
      lines.push(`${label}: ${field.value.trim()}`);
    }
    summary.value = lines.join('\n');
    status.textContent = '';
    result.hidden = false;
    const config = window.VELLUM_CONFIG || {};
    const email = (config.contactEmail || '').trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      send.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(lines[0])}&body=${encodeURIComponent(summary.value)}`;
      send.textContent = isFa ? 'باز کردن پیش‌نویس ایمیل' : 'Open email draft';
      result.querySelector('p').textContent = isFa ? 'می‌توانید متن را کپی کنید یا پیش‌نویس را در برنامهٔ ایمیل باز کنید. برای ارسال، باید در برنامهٔ ایمیل دکمهٔ ارسال را بزنید.' : 'Copy the summary or open a draft in your email app. You must press Send in your email app to send the enquiry.';
    } else if (typeof config.consultationUrl === 'string' && config.consultationUrl.startsWith('https://')) {
      send.href = config.consultationUrl;
    }
    document.querySelector('#result-title').focus();
    result.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',block:'nearest'});
  });
  form.addEventListener('input', () => { result.hidden = true; status.textContent = ''; });
  document.querySelector('#copy-summary').addEventListener('click', async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(summary.value);
      status.textContent = isFa ? 'متن کپی شد. آن را در پیام خود در صفحهٔ مشاوره قرار دهید.' : 'Copied. Paste this into your message on the consultation page.';
    } catch {
      summary.focus(); summary.select(); summary.setSelectionRange(0, summary.value.length);
      status.textContent = isFa ? 'متن انتخاب شد. با گزینهٔ کپی دستگاه یا Ctrl/Cmd+C آن را کپی کنید.' : 'Text selected. Use your device’s Copy option or Ctrl/Cmd+C.';
    }
  });
}

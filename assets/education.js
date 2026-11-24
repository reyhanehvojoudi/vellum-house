/* Stable option values allow families to switch languages mid-enquiry. */
(() => {
  const fa = document.documentElement.lang === 'fa';
  const n = num => num.toLocaleString(fa ? 'fa-IR' : 'en-US');
  const choice = (en, pe) => fa ? pe : en;
  function grades(level) {
    if (['elementary','middle','high'].includes(level)) {
      const first = level === 'elementary' ? 1 : level === 'middle' ? 6 : fa ? 7 : 9;
      const last = level === 'elementary' ? 6 : level === 'middle' ? 8 : 12;
      return Array.from({length:last-first+1}, (_,i) =>
        ['grade-'+(first+i),choice('Grade ','پایهٔ ')+n(first+i)]);
    }
    if (level === 'grad') return [['masters',choice('Master’s','کارشناسی ارشد')],['doctoral',choice('Doctorate','دکتری')],['postgrad-other',choice('Other graduate programme','سایر دوره‌های تحصیلات تکمیلی')]];
    if (level === 'undergrad' || level === 'college') return [1,2,3,4,5,6].map(i=>['year-'+i,choice('Year ','سال ')+n(i)+(i===6?'+':'')]);
    return [];
  }
  function sync(form, selected='') {
    const level = form.elements.education.value, grade = form.elements.grade;
    grade.replaceChildren(new Option(level ? choice('Select grade or year','انتخاب پایه یا سال') : choice('Choose education level first','ابتدا مقطع را انتخاب کنید'),''));
    for (const [value,label] of grades(level)) grade.add(new Option(label,value));
    grade.disabled = !level;
    if (Array.from(grade.options).some(option=>option.value===selected)) grade.value=selected;
  }
  function hydrate(form,draft) {
    if (!form.dataset.bound) {
      form.dataset.bound='yes';
      form.elements.education.addEventListener('change',()=>sync(form));
      form.elements.birthday.max=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tehran'}).format(new Date());
      sync(form);
    }
    if (!draft) return;
    let level=draft.education;
    const number=Number(String(draft.grade).replace('grade-',''));
    if (fa && level==='middle') level=number===6?'elementary':'high';
    if (!fa && level==='high' && number>=7 && number<=8) level='middle';
    form.elements.education.value=level || '';
    sync(form,draft.grade);
    for(const [key,value] of Object.entries(draft)) {
      if(['education','grade','website'].includes(key)) continue;
      const field=form.elements.namedItem(key);
      if (!field) continue;
      if (field.type==='checkbox') field.checked=value==='yes'; else field.value=value;
    }
  }
  window.VellumEducation={hydrate};
})();

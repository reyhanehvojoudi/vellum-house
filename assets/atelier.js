/* Vellum House — single-screen guided experience, bilingual and keyboard accessible.
   Public site: no dependencies. Enquiries are confirmed against the existing Apps Script receipt. */
(() => {
  'use strict';
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const views=['intro','journey','method','founders','consult','contact'];
  const services=['full','talent','courses','mentoring','olympiads','admissions','konkur','other'];
  const CONTENT={
    fa:{
      brand:'ولوم هاوس',brandSub:'برای آینده‌ای که شایسته شماست',headerSignature:'مسیر اختصاصی یادگیری',choose:'انتخاب زبان',menu:'فهرست',menuTitle:'کجا می‌خواهید بروید؟',close:'بستن',prev:'قبلی',next:'بعدی',return:'بازگشت به آغاز',home:'آغاز',consultBtn:'درخواست جلسه مشاوره رایگان اولیه',foot:'مسیری اختصاصی برای هر آینده',
      viewNames:['آشنایی','مسیر شما','روش ما','بنیان‌گذاران','مشاوره اولیه','ارتباط با ما'],
      introEyebrow:'ولوم هاوس چیست؟', introTitle:'استعداد متفاوت،<br><em>مسیر متفاوت.</em>',introCopy:'ولوم هاوس مجموعه‌ای تخصصی در زمینه آموزش و راهنمایی تحصیلی است. ما با شناخت توانمندی‌ها و هدف‌های هر دانش‌پذیر، دوره‌های آموزشی، مشاوره، پرورش استعداد، مسابقات و مسیر پذیرش تحصیلی را در برنامه‌ای اختصاصی و هماهنگ کنار هم قرار می‌دهیم.',explore:'مسیر را کشف کنید',introFoot:'از شناخت توانایی‌ها تا رسیدن به هدف، کنار شما و خانواده‌تان هستیم.',
      journeyEyebrow:'از نقطه شروع تا هدف',journeyTitle:'مسیر هر دانش‌پذیر، <em>منحصر به خود اوست.</em>',journeyHint:'برای دیدن جزئیات، یکی از پنج ایستگاه را انتخاب کنید.',journeySide:'پنج گام در یک مسیر پیوسته',
      stepNames:['شناخت وضعیت امروز','کشف توانمندی‌ها','طراحی مسیر','رشد و پیشرفت','حرکت به سوی هدف'],
      stepLabels:['شناخت','استعداد','طراحی','رشد','هدف'],
      stepCopies:['ابتدا شرایط تحصیلی، علاقه‌ها، توانایی‌ها و نیازهای دانش‌پذیر را می‌شناسیم تا نقطه شروع مشخص باشد.','با ارزیابی و گفت‌وگو، استعدادها و فرصت‌های مناسب را بررسی می‌کنیم و برای هدف‌گذاری آگاهانه کمک می‌کنیم.','دوره‌های آموزشی، مشاوره، منتورینگ و فرصت‌های رشد را در برنامه‌ای اختصاصی و متناسب با هدف‌ها هماهنگ می‌کنیم.','با نظارت بر روند یادگیری، گزارش‌های پیشرفت و حضور در مسابقات و المپیادهای مناسب، مسیر را تقویت می‌کنیم.','برای رسیدن به هدف‌های مشخص، از جمله انتخاب مسیر تحصیلی و اپلای و دریافت پذیرش، برنامه را دنبال و به‌روز می‌کنیم.'],
      stepDisclaimer:'این نقشه یک الگوی انعطاف‌پذیر است؛ لازم نیست همه دانش‌پذیران از گام یک شروع کنند یا تمام خدمات را انتخاب کنند.',
      methodEyebrow:'روش ما',methodTitle:'آموزش، تنها <em>بخشی از مسیر است.</em>',methodCopy:'هر تصمیم آموزشی باید به هدفی روشن وصل باشد. ما به‌جای ارائه یک نسخه یکسان برای همه، مسیر را همراه دانش‌پذیر و خانواده طراحی می‌کنیم و تا رسیدن به هدف، آن را پیگیری می‌کنیم.',methodNames:['شناخت','طراحی مسیر','نظارت و همراهی','دستیابی به هدف'],methodDesc:['شناخت شرایط آموزشی، علاقه‌ها، توانایی‌ها و نیازهای دانش‌پذیر.','تعیین هدف و هماهنگ‌کردن دوره‌های آموزشی و خدمات مناسب.','مشاوره و منتورینگ مستمر، بررسی عملکرد و ارائه گزارش‌های منظم پیشرفت.','ارزیابی نتیجه‌ها، به‌روزرسانی برنامه و همراهی برای رسیدن به اهداف توافق‌شده.'],methodNote:'می‌توانید مدیریت کامل مسیر تحصیلی یا هر یک از خدمات را جداگانه انتخاب کنید.',
      foundersEyebrow:'بنیان‌گذاران ولوم هاوس',foundersTitle:'تجربه‌ای که <em>پشت مسیر شماست.</em>',foundersCopy:'ولوم هاوس به پشتوانه سال‌ها تجربه در آموزش، مشاوره و مدیریت آموزشی شکل گرفته است.',founderTitle:'بنیان‌گذار مجموعه',founder1Name:'ریحانه وجودی',founder1Degree:'کارشناسی ارشد فیزیک',founder1Years:'۱۱ سال',founder1YearsLabel:'سابقه در آموزش و مشاوره',founder1Students:'بیش از ۳۰۰۰',founder1StudentsLabel:'دانش‌پذیر موفق',founder1Bio:'۱۱ سال تجربه درخشان در آموزش، مشاوره و مهاجرت تحصیلی و مدیریت آموزشی تنها مدرسه انگلستان در ایران.',founder2Name:'کسری پهلوانی',founder2Degree:'کارشناسی ارشد مهندسی برق، گرایش مخابرات',founder2Years:'۱۹ سال',founder2YearsLabel:'تجربه تخصصی آموزشی',founder2Students:'بیش از ۸۰۰۰',founder2StudentsLabel:'دانش‌پذیر موفق',founder2Bio:'۱۹ سال تجربه تخصصی در آموزش، منتورینگ، نظارت آموزشی و مدیریت تنها مدرسه انگلستان در ایران.',
      consultEyebrow:'نخستین گفت‌وگو',consultTitle:'از همین‌جا <em>شروع کنیم.</em>',consultCopy:'در یک جلسه آنلاین ۳۰ دقیقه‌ای و رایگان، وضعیت فعلی و اهداف شما را بررسی می‌کنیم و درباره گام مناسب بعدی صحبت می‌کنیم.',consultParent:'برای دانش‌پذیران زیر ۱۸ سال حضور حداقل یکی از والدین یا سرپرست ضروری است.',formEyebrow:'درخواست جلسه مشاوره رایگان اولیه',formIntro:'ابتدا اطلاعات تماس و سپس موضوع مشاوره را وارد کنید. پس از ثبت درخواست، به تقویم انتخاب وقت هدایت می‌شوید.',
      first:'اطلاعات تماس',second:'موضوع مشاوره',name:'نام والد یا متقاضی',namePh:'نام و نام خانوادگی',email:'نشانی ایمیل',phone:'شماره تماس (اختیاری)',grade:'پایه یا مقطع تحصیلی (اختیاری)',gradePh:'برای مثال: پایه یازدهم',service:'موضوع درخواست',chooseService:'لطفاً یک موضوع را انتخاب کنید',message:'توضیح کوتاه (اختیاری)',messagePh:'در چند جمله از هدف یا پرسش خود بنویسید.',
      services:['مدیریت کامل مسیر تحصیلی','استعدادیابی و برنامه‌ریزی (ارزیابی و گزارش نتایج)','دوره‌های آموزشی و آمادگی آزمون','منتورینگ، مشاوره و نظارت بر مسیر پیشرفت','مسابقات و المپیادها','اپلای و دریافت پذیرش تحصیلی','آمادگی کنکور','برای انتخاب سرویس نیاز به راهنمایی بیشتر دارم'],
      continue:'مرحله بعد',back:'مرحله قبل',submit:'ثبت درخواست و انتخاب زمان',consent1:'با پیگیری این درخواست موافقم و',privacy:'حریم خصوصی',consent2:'را مطالعه کرده‌ام.',disclaimer:'زمان جلسه تنها پس از انتخاب و تأیید در تقویم رزرو می‌شود.',saving:'در حال ثبت درخواست…',success:'درخواست ثبت شد؛ در حال انتقال به تقویم رزرو…',failed:'ثبت درخواست تأیید نشد. دوباره تلاش کنید یا با ایمیل مجموعه تماس بگیرید.',invalid:'شماره تلفن معتبر نیست؛ آن را اصلاح کنید یا خالی بگذارید.',offline:'سامانه ثبت درخواست فعلاً در دسترس نیست. از طریق ایمیل با ما تماس بگیرید.',fallback:'درخواست شما ثبت شده است. اگر تقویم باز نشد:',booking:'رفتن به تقویم رزرو',
      contactEyebrow:'ارتباط با ولوم هاوس',contactTitle:'گفت‌وگو را <em>آغاز کنیم.</em>',contactCopy:'برای دریافت راهنمایی یا هماهنگی، از یکی از راه‌های زیر با ما در ارتباط باشید.',contactInquiry:'ارسال درخواست',contactInquiryDesc:'درخواست خود را ثبت کنید و برای جلسه مشاوره رایگان اولیه وقت بگیرید.',contactEmail:'ایمیل',contactEmailDesc:'برای مکاتبات و پرسش‌های شما',contactTelegram:'تلگرام',contactTelegramDesc:'ارتباط با مجموعه از طریق تلگرام',open:'ورود',
      privacyText:'اطلاعاتی که در فرم ثبت می‌کنید فقط برای پاسخ‌گویی، هماهنگی جلسه و پیگیری درخواست شما استفاده می‌شود. این اطلاعات در فایل خصوصی مجموعه ثبت می‌شود و در اختیار مسئولان پیگیری قرار می‌گیرد. برای درخواست حذف اطلاعات با ایمیل مجموعه تماس بگیرید. انتخاب وقت در سامانه Cal.com انجام می‌شود و سیاست حریم خصوصی آن سامانه نیز اعمال می‌شود.',terms:'شرایط استفاده',termsText:'جلسه مشاوره اولیه ۳۰ دقیقه‌ای رایگان است و تعهدی برای خرید خدمات ایجاد نمی‌کند. سایر خدمات پس از توافق درباره محدوده و هزینه ارائه می‌شوند. موفقیت تحصیلی، پذیرش یا دریافت بورسیه تضمین نمی‌شود. برای متقاضیان زیر ۱۸ سال همراهی والد یا سرپرست لازم است.'
    },
    en:{
      brand:'VELLUM HOUSE',brandSub:'PRIVATE ACADEMIC MANAGEMENT',headerSignature:'A PERSONAL JOURNEY',choose:'Choose language',menu:'Menu',menuTitle:'Where would you like to go?',close:'Close',prev:'Previous',next:'Next',return:'Return to the beginning',home:'Beginning',consultBtn:'Book a Free Initial Consultation',foot:'A considered path for every future',
      viewNames:['Welcome','Your journey','Our approach','Founders','Initial consultation','Contact'],
      introEyebrow:'A different approach to education',introTitle:'Different minds.<br><em>Different paths.</em>',introCopy:'Vellum House is a private academic advisory and education organisation. We help students and families turn potential into progress through personalised education, mentorship, talent development, international competitions and university admissions guidance—all within one connected plan.',explore:'Explore the journey',introFoot:'From understanding potential to pursuing ambitious goals, we guide every step.',
      journeyEyebrow:'From your starting point to your goal',journeyTitle:'Every student deserves <em>a path of their own.</em>',journeyHint:'Select any of the five destinations to explore.',journeySide:'Five chapters. One connected journey.',stepNames:['Understand today','Discover strengths','Design your path','Grow and progress','Reach toward your goals'],stepLabels:['Discover','Strengths','Design','Progress','Future'],
      stepCopies:['We begin by understanding the student’s current academic situation, interests, abilities and learning needs.','Through conversations and assessments, we identify strengths and opportunities to make thoughtful goals more achievable.','We coordinate educational programmes, mentoring, guidance and opportunities into a plan designed for the individual.','We track progress, provide regular reports and support relevant academic competitions and Olympiads.','We review results, adapt the plan and guide important next steps, including university applications and admissions.'],stepDisclaimer:'These are flexible guideposts, not five mandatory packages. Students may enter at different stages and select the services they need.',
      methodEyebrow:'Our approach',methodTitle:'Education is only <em>one part of the journey.</em>',methodCopy:'Every educational choice should serve a clear goal. Rather than applying the same template to everyone, we design and oversee each journey together with the student and family.',methodNames:['Understand','Design the path','Monitor and mentor','Work toward the goal'],methodDesc:['Understand the student’s academic situation, interests, strengths and needs.','Agree on goals and coordinate suitable educational programmes and services.','Provide continuing advice and mentoring, performance reviews and regular progress reports.','Review outcomes, refine the plan and guide progress toward agreed objectives.'],methodNote:'Choose full academic pathway management or any individual service.',
      foundersEyebrow:'The founders',foundersTitle:'Experience behind <em>your next chapter.</em>',foundersCopy:'Vellum House was founded on extensive experience in education, academic guidance and educational leadership.',founderTitle:'Founder',founder1Name:'Reyhaneh Vojoudi',founder1Degree:'MSc in Physics',founder1Years:'11 years',founder1YearsLabel:'in education and advising',founder1Students:'3,000+',founder1StudentsLabel:'successful learners',founder1Bio:'11 years of experience in education, academic and international study advising, and educational management at Iran’s only British school.',founder2Name:'Kasra Pahlavani',founder2Degree:'MSc in Electrical Engineering (Telecommunications)',founder2Years:'19 years',founder2YearsLabel:'specialist education experience',founder2Students:'8,000+',founder2StudentsLabel:'successful learners',founder2Bio:'19 years of specialist experience in teaching, mentoring, academic oversight and management at Iran’s only British school.',
      consultEyebrow:'The first conversation',consultTitle:'Your journey <em>starts with a conversation.</em>',consultCopy:'In a complimentary 30-minute online consultation, we discuss your current situation, ambitions and a useful next step.',consultParent:'For students under 18, a parent or guardian must attend.',formEyebrow:'Book a Free Initial Consultation',formIntro:'First share your contact details, then choose your area of interest. After your enquiry is saved, you’ll be taken to the booking calendar.',
      first:'Contact details',second:'Your goals',name:'Parent / applicant name',namePh:'Full name',email:'Email address',phone:'Phone (optional)',grade:'Grade or study level (optional)',gradePh:'For example, Grade 11',service:'Area of interest',chooseService:'Choose a service',message:'A little about your goal (optional)',messagePh:'A sentence or two is enough.',
      services:['Full academic pathway management','Talent discovery and planning (assessment with results)','Educational programmes and exam preparation','Mentoring, counselling and progress oversight','Competitions and Olympiads','University applications and admission support','Iranian university entrance exam preparation','I need guidance choosing the right service'],
      continue:'Continue',back:'Go back',submit:'Submit enquiry & choose a time',consent1:'I agree to be contacted about my enquiry and have read the',privacy:'privacy notice',consent2:'.',disclaimer:'Your meeting is reserved only after selecting and confirming a time in the calendar.',saving:'Saving your enquiry…',success:'Enquiry saved. Opening the booking calendar…',failed:'We could not confirm your enquiry. Please retry or contact us by email.',invalid:'Please correct the phone number or leave it blank.',offline:'The enquiry system is currently unavailable. Please email us.',fallback:'Your enquiry was saved. If the calendar did not open:',booking:'Open booking calendar',
      contactEyebrow:'Contact Vellum House',contactTitle:'Start a <em>conversation.</em>',contactCopy:'Choose the most convenient way to ask a question or arrange a consultation.',contactInquiry:'Enquiry',contactInquiryDesc:'Tell us what you need and book a complimentary initial consultation.',contactEmail:'Email',contactEmailDesc:'Write to our team with your question',contactTelegram:'Telegram',contactTelegramDesc:'Contact Vellum House on Telegram',open:'Explore',
      privacyText:'We use information submitted through the enquiry form to reply, coordinate consultations and follow up on your request. Details are stored in a private spreadsheet and accessible to authorised enquiry handlers. You may request deletion by emailing us. Appointments are booked using Cal.com, whose privacy practices also apply.',terms:'Terms of use',termsText:'The initial 30-minute online consultation is free and does not create a purchase commitment. Further services are offered after agreement on scope and fees. Academic results, admissions and scholarships are not guaranteed. A parent or guardian must attend for students under 18.'
    }
  };
  const initialHash=location.hash.slice(1);
  let lang=document.body.dataset.defaultLang==='en'?'en':'fa';
  let current=views.includes(initialHash)?initialHash:'intro';
  let stage=0,menuOpen=false,languageRequired=true,legalOpen=false;
  let priorFocus=null;
  const prefersReducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conf=window.VELLUM_CONFIG||{};
  const endpoint=String(conf.formEndpoint||'').trim();
  const bookingURL=(()=>{try{const u=new URL(conf.bookingUrl);return u.protocol==='https:'&&u.hostname==='cal.com'&&u.pathname!=='/'?u.href:'https://cal.com/vhouse/consultation'}catch(_){return 'https://cal.com/vhouse/consultation'}})();
  const t=()=>CONTENT[lang];
  const num=(n)=>lang==='fa'?String(n).replace(/[0-9]/g,d=>'۰۱۲۳۴۵۶۷۸۹'[Number(d)]):String(n);
  const arrow='<svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true"><path d="M3 15 15 3M5 3h10v10" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
  const eyebrow=(label)=>`<div class="overline"><span class="overline-line"></span>${label}</div>`;
  function intro(){const d=t();return `<section class="page intro" aria-label="${d.viewNames[0]}"><div class="intro-visual" aria-hidden="true"><div class="golden-orbit orbit-one"></div><div class="golden-orbit orbit-two"></div><div class="light-seam"></div><span class="intro-star intro-star-a">✧</span><span class="intro-star intro-star-b">✧</span></div><div class="intro-copy">${eyebrow(d.introEyebrow)}<h1>${d.introTitle}</h1><p>${d.introCopy}</p><button class="primary-btn intro-button" data-go="journey">${d.explore}${arrow}</button><span class="intro-signoff">${d.introFoot}</span></div><div class="intro-seal" aria-hidden="true"><img src="assets/vh-monogram.webp" alt=""></div></section>`;}
  const points=[{x:80,y:168},{x:290,y:98},{x:500,y:168},{x:710,y:98},{x:920,y:168}];
  const path='M 80 168 C 150 168 210 98 290 98 C 370 98 420 168 500 168 C 580 168 630 98 710 98 C 790 98 850 168 920 168';
  function journey(){const d=t();return `<section class="page journey" aria-label="${d.viewNames[1]}">
    <div class="journey-header">${eyebrow(d.journeyEyebrow)}<h1>${d.journeyTitle}</h1><p class="journey-hint">${d.journeyHint}</p></div>
    <div class="journey-map" aria-label="${d.journeySide}">
      <div class="journey-grid" aria-hidden="true"></div><div class="journey-sun" aria-hidden="true"></div>
      <svg class="journey-svg" viewBox="0 0 1000 280" preserveAspectRatio="none" aria-hidden="true"><defs>
        <linearGradient id="route-metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b58b4c"/><stop offset=".55" stop-color="#ffe8b2"/><stop offset="1" stop-color="#d4a35e"/></linearGradient>
        <filter id="soft-glow"><feGaussianBlur stdDeviation="2"/></filter>
        <clipPath id="route-clipping"><rect id="route-clip" x="0" y="0" width="${points[stage].x}" height="280"/></clipPath>
        </defs><path class="route-guide" d="${path}"/><path id="route-halo" class="route-halo" clip-path="url(#route-clipping)" d="${path}"/><path id="route-progress" class="route-progress" clip-path="url(#route-clipping)" d="${path}"/><g id="route-cursor"><circle r="16" fill="rgba(234,196,122,.12)"/><circle r="7" fill="#e4bd78"/><circle r="3" fill="#fff5d7"/></g></svg>
      ${points.map((p,i)=>`<button type="button" class="journey-node" style="--x:${p.x/10}%;--y:${p.y/2.8}%;" data-stage="${i}" aria-pressed="${i===stage}" aria-label="${num(i+1)}. ${d.stepNames[i]}"><span class="node-ring"><span>${num(i+1).padStart(2,lang==='fa'?'۰':'0')}</span></span><span class="node-caption">${d.stepLabels[i]}</span></button>`).join('')}
    </div>
    <div class="journey-detail" id="journey-detail" aria-live="polite">${stageDetail()}</div>
    <div class="journey-footer"><span>${d.stepDisclaimer}</span><button type="button" class="text-btn" data-go="consult">${d.consultBtn}${arrow}</button></div>
  </section>`;}
  function stageDetail(){const d=t();return `<div class="chapter-marker">${num(stage+1)} <span>/</span> ${num(5)}</div><div class="chapter-content"><h2>${d.stepNames[stage]}</h2><p>${d.stepCopies[stage]}</p></div><div class="chapter-controls"><button type="button" data-step-back aria-label="${d.prev}" ${stage===0?'disabled':''}>${lang==='fa'?'›':'‹'}</button><button type="button" data-step-next aria-label="${d.next}" ${stage===4?'disabled':''}>${lang==='fa'?'‹':'›'}</button></div>`;}
  function method(){const d=t();return `<section class="page method" aria-label="${d.viewNames[2]}"><div class="central-head">${eyebrow(d.methodEyebrow)}<h1>${d.methodTitle}</h1><p>${d.methodCopy}</p></div><div class="method-grid">${d.methodNames.map((name,i)=>`<button type="button" class="method-card ${i===0?'active':''}" data-method="${i}" aria-expanded="${i===0}"><span class="method-index">${num(i+1).padStart(2,lang==='fa'?'۰':'0')}</span><span class="method-title">${name}</span><span class="method-description">${d.methodDesc[i]}</span><span class="method-arrow">${arrow}</span></button>`).join('')}</div><p class="method-footer">${d.methodNote}</p></section>`;}
  function founders(){const d=t();return `<section class="page founders" aria-label="${d.viewNames[3]}"><div class="central-head">${eyebrow(d.foundersEyebrow)}<h1>${d.foundersTitle}</h1><p>${d.foundersCopy}</p></div><div class="founder-grid">${[1,2].map(i=>`<article class="founder"><div class="founder-emblem" aria-hidden="true"><span>${lang==='fa'?(i===1?'ر و':'ک پ'):(i===1?'RV':'KP')}</span></div><div class="founder-data"><span class="founder-role">${d.founderTitle}</span><h2>${d['founder'+i+'Name']}</h2><p class="founder-degree">${d['founder'+i+'Degree']}</p><p class="founder-bio">${d['founder'+i+'Bio']}</p><div class="founder-facts"><div><strong>${d['founder'+i+'Years']}</strong><small>${d['founder'+i+'YearsLabel']}</small></div><div><strong>${d['founder'+i+'Students']}</strong><small>${d['founder'+i+'StudentsLabel']}</small></div></div></div></article>`).join('')}</div></section>`;}
  function consult(){const d=t();return `<section class="page consult" aria-label="${d.viewNames[4]}"><div class="consult-side">${eyebrow(d.consultEyebrow)}<h1>${d.consultTitle}</h1><p>${d.consultCopy}</p><div class="consult-benefit"><span>✧</span><p>${d.consultParent}</p></div><div class="consult-line" aria-hidden="true"></div></div><div class="form-shell"><div class="form-header"><span>${d.formEyebrow}</span><div class="form-pips"><i class="active"></i><i></i></div></div><p class="form-intro">${d.formIntro}</p><form id="enquiry-form" novalidate data-step="1"><div class="form-fields">
    <label class="field step-one"><span>${d.name} *</span><input name="fullName" id="fullName" required autocomplete="name" maxlength="120" placeholder="${d.namePh}"></label>
    <label class="field step-one"><span>${d.email} *</span><input name="email" id="email" type="email" required autocomplete="email" maxlength="200" dir="ltr" placeholder="name@example.com"></label>
    <label class="field step-one"><span>${d.phone}</span><input name="phone" id="phone" type="tel" maxlength="40" autocomplete="tel" dir="ltr" placeholder="+98 …"></label>
    <label class="field step-one"><span>${d.grade}</span><input name="grade" id="grade" maxlength="100" placeholder="${d.gradePh}"></label>
    <label class="field step-two field-span"><span>${d.service} *</span><select name="serviceInterest" id="serviceInterest" required><option disabled selected value="">${d.chooseService}</option>${services.map((s,i)=>`<option value="${s}">${d.services[i]}</option>`).join('')}</select></label>
    <label class="field step-two field-span"><span>${d.message}</span><textarea name="message" id="message" rows="2" maxlength="2000" placeholder="${d.messagePh}"></textarea></label>
    <label class="honey" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
    <label class="check-consent step-two field-span"><input name="consent" type="checkbox" value="yes" required><span>${d.consent1} <button type="button" class="inline-action" data-legal="privacy">${d.privacy}</button> ${d.consent2}</span></label>
    <button type="button" class="primary-btn step-one field-span" data-form-next>${d.continue}${arrow}</button>
    <button type="button" class="back-form step-two" data-form-back>${lang==='fa'?'›':'‹'} ${d.back}</button>
    <button type="submit" class="primary-btn step-two" id="form-submit">${d.submit}${arrow}</button>
    <p class="form-disclaimer step-two field-span">${d.disclaimer}</p>
    </div><div class="form-status" id="form-status" aria-live="polite" role="status" tabindex="-1"></div>
    <div class="booking-fallback" id="booking-fallback" hidden><p>${d.fallback}</p><a href="${bookingURL}" target="_blank" rel="noopener noreferrer">${d.booking}</a></div></form></div></section>`;}
  function contact(){const d=t();return `<section class="page contact" aria-label="${d.viewNames[5]}"><div class="central-head">${eyebrow(d.contactEyebrow)}<h1>${d.contactTitle}</h1><p>${d.contactCopy}</p></div><div class="contact-grid">
    <button type="button" class="contact-card" data-go="consult"><span class="contact-icon">✧</span><span class="contact-category">${num(1).padStart(2,lang==='fa'?'۰':'0')}</span><strong>${d.contactInquiry}</strong><small>${d.contactInquiryDesc}</small><span class="contact-action">${d.open}${arrow}</span></button>
    <a class="contact-card" href="mailto:vellumhouse.edu@gmail.com"><span class="contact-icon">✉</span><span class="contact-category">${num(2).padStart(2,lang==='fa'?'۰':'0')}</span><strong>${d.contactEmail}</strong><small>${d.contactEmailDesc}</small><span class="contact-value" dir="ltr">vellumhouse.edu@gmail.com</span><span class="contact-action">${d.open}${arrow}</span></a>
    <a class="contact-card" href="https://t.me/VH_edu" target="_blank" rel="noopener noreferrer"><span class="contact-icon">↗</span><span class="contact-category">${num(3).padStart(2,lang==='fa'?'۰':'0')}</span><strong>${d.contactTelegram}</strong><small>${d.contactTelegramDesc}</small><span class="contact-value" dir="ltr">@VH_edu</span><span class="contact-action">${d.open}${arrow}</span></a>
  </div></section>`;}
  const templates={intro,journey,method,founders,consult,contact};
  function render(){const d=t();document.documentElement.lang=lang;document.documentElement.dir=lang==='fa'?'rtl':'ltr';document.title=lang==='fa'?'ولوم هاوس | مسیری اختصاصی برای هر آینده':'Vellum House | A Personal Path for Every Future';
    $('#brand-name').textContent=d.brand;$('#brand-sub').textContent=d.brandSub;$('#header-signature').textContent=d.headerSignature;$('#menu-text').textContent=d.menu;$('#language-control').setAttribute('aria-label',d.choose);$('#return-home').setAttribute('aria-label',d.return);
    $('#header-cta').textContent=d.consultBtn;$('#mobile-cta').textContent=d.consultBtn;$('#footer-line').textContent=d.foot;
    $('#footer-count').textContent=num(Math.max(1,views.indexOf(current)+1)).padStart(2,lang==='fa'?'۰':'0');$('#footer-total').textContent=num(views.length).padStart(2,lang==='fa'?'۰':'0');$('#footer-progress').style.width=((views.indexOf(current)+1)/views.length*100)+'%';
    $('#footer-prev').setAttribute('aria-label',d.prev);$('#footer-next').setAttribute('aria-label',d.next);$('#footer-prev').disabled=views.indexOf(current)<=0;$('#footer-next').disabled=views.indexOf(current)===views.length-1;
    const nav=$('#menu-items');nav.innerHTML=views.map((v,i)=>`<button type="button" data-go="${v}" class="menu-item ${v===current?'chosen':''}"><span>${num(i+1).padStart(2,lang==='fa'?'۰':'0')}</span><strong>${d.viewNames[i]}</strong>${arrow}</button>`).join('');
    $('#menu-heading').textContent=d.menuTitle;$('#menu-close').setAttribute('aria-label',d.close);$('#menu-privacy').textContent=d.privacy;$('#menu-terms').textContent=d.terms;
    $('#main').innerHTML=templates[current]();$('#main').dataset.view=current;
    $('#mobile-cta').hidden=current==='consult';
    if(current==='journey')initPath();
  }
  let stageEndOffsets=[];
  function initPath(){const p=$('#route-progress'),c=$('#route-cursor');if(!p)return;const len=p.getTotalLength();stageEndOffsets=points.map(pt=>{let best=0,delta=Infinity;const steps=3000;for(let i=0;i<=steps;i++){const distance=len*i/steps;const q=p.getPointAtLength(distance);const d=(q.x-pt.x)**2+(q.y-pt.y)**2;if(d<delta){delta=d;best=distance;}}return best;});
    $('#route-clip').setAttribute('width',String(points[stage].x));
    const q=p.getPointAtLength(stageEndOffsets[stage]);c.setAttribute('transform',`translate(${q.x} ${q.y})`);
    $$('.journey-node').forEach((b,i)=>{b.classList.toggle('is-current',i===stage);b.classList.toggle('is-passed',i<stage);});
  }
  let motion=null;
  function setStage(n){if(current!=='journey'||n<0||n>4||!Number.isInteger(n))return;const old=stage;stage=n;
    $$('.journey-node').forEach((b,i)=>{b.setAttribute('aria-pressed',i===stage?'true':'false');b.classList.toggle('is-current',i===stage);b.classList.toggle('is-passed',i<stage);});
    $('#journey-detail').innerHTML=stageDetail();const p=$('#route-progress'),c=$('#route-cursor'),clip=$('#route-clip');if(!p)return;const dest=stageEndOffsets[stage];
    if(motion)cancelAnimationFrame(motion);
    if(prefersReducedMotion){clip.setAttribute('width',String(points[stage].x));const q=p.getPointAtLength(dest);c.setAttribute('transform',`translate(${q.x} ${q.y})`);return;}
    const a=stageEndOffsets[old],start=performance.now(),duration=570,startX=points[old].x,endX=points[stage].x;
    const tick=time=>{const f=Math.min(1,(time-start)/duration),e=1-Math.pow(1-f,3),q=p.getPointAtLength(a+(dest-a)*e);clip.setAttribute('width',String(startX+(endX-startX)*e));c.setAttribute('transform',`translate(${q.x} ${q.y})`);if(f<1)motion=requestAnimationFrame(tick);};motion=requestAnimationFrame(tick);
  }
  function go(dest,updateURL=true){if(!views.includes(dest))return;current=dest;render();if(updateURL)history.replaceState(null,'','#'+dest);closeMenu(false);$('#main').focus({preventScroll:true});}
  function openMenu(){priorFocus=document.activeElement;menuOpen=true;$('#menu-modal').hidden=false;$('#app').inert=true;$('#menu-toggle').setAttribute('aria-expanded','true');$('#menu-items button').focus();}
  function closeMenu(restore=true){if(!menuOpen)return;menuOpen=false;$('#menu-modal').hidden=true;$('#app').inert=false;$('#menu-toggle').setAttribute('aria-expanded','false');if(restore)$('#menu-toggle').focus();}
  function openLanguage(required=false){priorFocus=document.activeElement;languageRequired=required;$('#language-modal').hidden=false;$('#app').inert=true;$('#language-dismiss').hidden=required;$('#language-modal [data-language="'+lang+'"]').focus();}
  function closeLanguage(){if(languageRequired)return;$('#language-modal').hidden=true;$('#app').inert=false;$('#language-control').focus();}
  function chooseLanguage(choice){if(!CONTENT[choice])return;lang=choice;try{sessionStorage.setItem('vh-lang',choice);}catch(_){}$('#language-modal').hidden=true;$('#app').inert=false;
    if(languageRequired)current='intro';languageRequired=false;render();try{const path=/^https?:$/.test(location.protocol)?(lang==='fa'?'/':'/en.html'):'';history.replaceState(null,'',path+'#'+current);}catch(_){}$('#main').focus({preventScroll:true});}
  function openLegal(k){const d=t();priorFocus=document.activeElement;legalOpen=true;const box=$('#legal-modal');$('#legal-heading').textContent=k==='terms'?d.terms:d.privacy;$('#legal-text').textContent=k==='terms'?d.termsText:d.privacyText;$('#legal-close').setAttribute('aria-label',d.close);box.hidden=false;$('#app').inert=true;$('#legal-close').focus();}
  function closeLegal(){legalOpen=false;$('#legal-modal').hidden=true;$('#app').inert=false;priorFocus?.focus();}
  function trapTab(e){if(e.key!=='Tab')return;let dialog=!$('#language-modal').hidden?$('#language-modal'):!$('#legal-modal').hidden?$('#legal-modal'):!$('#menu-modal').hidden?$('#menu-modal'):null;if(!dialog)return;const els=$$('button:not([hidden]):not(:disabled),a[href],input:not([hidden])',dialog).filter(x=>x.getClientRects().length);if(!els.length)return;const first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  document.addEventListener('click',e=>{const b=e.target.closest('button,a');if(!b)return;
    if(b.matches('[data-language]')){chooseLanguage(b.dataset.language);return;}
    if(b.matches('#language-dismiss')){closeLanguage();return;}
    if(b.matches('#language-control')){openLanguage(false);return;}
    if(b.matches('#menu-toggle')){openMenu();return;}
    if(b.matches('[data-menu-close]')){closeMenu();return;}
    if(b.matches('[data-legal-close]')){closeLegal();return;}
    if(b.matches('[data-legal]')){openLegal(b.dataset.legal);return;}
    if(b.matches('[data-go]')){go(b.dataset.go);return;}
    if(b.matches('[data-stage]')){setStage(Number(b.dataset.stage));return;}
    if(b.matches('[data-step-next]')){setStage(stage+1);return;}
    if(b.matches('[data-step-back]')){setStage(stage-1);return;}
    if(b.matches('[data-method]')){$$('.method-card').forEach(c=>{const chosen=c===b;c.classList.toggle('active',chosen);c.setAttribute('aria-expanded',String(chosen));});return;}
    if(b.matches('#footer-prev')){go(views[Math.max(0,views.indexOf(current)-1)]);return;}
    if(b.matches('#footer-next')){go(views[Math.min(views.length-1,views.indexOf(current)+1)]);return;}
    if(b.matches('#return-home')){go('intro');return;}
    if(b.matches('[data-form-next]')){const f=$('#enquiry-form');if(!f)return;const a=$('#fullName'),m=$('#email');if(!a.reportValidity()||!m.reportValidity())return;f.dataset.step='2';$('.form-pips i:nth-child(2)').classList.add('active');$('#serviceInterest').focus({preventScroll:true});return;}
    if(b.matches('[data-form-back]')){const f=$('#enquiry-form');if(!f)return;f.dataset.step='1';$('.form-pips i:nth-child(2)').classList.remove('active');$('#fullName').focus({preventScroll:true});return;}
  });
  document.addEventListener('keydown',e=>{trapTab(e);
    if(e.key==='Escape'){if(legalOpen)closeLegal();else if(!$('#language-modal').hidden)closeLanguage();else if(menuOpen)closeMenu();return;}
    if(!$('#language-modal').hidden||menuOpen||legalOpen||current!=='journey')return;
    if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){const fwd=lang==='fa'?'ArrowLeft':'ArrowRight';const dest=stage+(e.key===fwd?1:-1);if(dest>=0&&dest<5){e.preventDefault();setStage(dest);}}
  });
  window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(views.includes(id))go(id,false);});
  // The POST response is opaque (no-cors); verify a unique request receipt before redirecting.
  const ENDPOINT=/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;
  async function receipt(id){return new Promise((resolve,reject)=>{const cb='vhReceipt_'+crypto.randomUUID().replaceAll('-','');const script=document.createElement('script');let ended=false;const done=value=>{if(ended)return;ended=true;clearTimeout(timer);script.remove();delete window[cb];value?resolve(value):reject(new Error('unconfirmed'));};const timer=setTimeout(()=>done(null),10000);window[cb]=done;script.onerror=()=>done(null);const url=new URL(endpoint);url.search=new URLSearchParams({requestId:id,callback:cb,t:Date.now().toString()}).toString();script.src=url.href;document.head.appendChild(script);});}
  let posting=false,lastSignature='',lastId='';
  document.addEventListener('submit',async e=>{if(e.target.id!=='enquiry-form')return;e.preventDefault();if(posting)return;
    const form=e.target,d=t(),status=$('#form-status'),submit=$('#form-submit');
    if(form.dataset.step!=='2'){const a=$('#fullName'),m=$('#email');if(a.reportValidity()&&m.reportValidity())form.dataset.step='2';return;}
    if(!form.reportValidity())return;
    const report=(msg,error)=>{status.textContent=msg;status.classList.toggle('error',!!error);status.classList.toggle('ok',!error);};
    if(!ENDPOINT.test(endpoint)){report(d.offline,true);status.focus();return;}
    const data=new URLSearchParams(new FormData(form));if((data.get('website')||'').trim())return;
    const phone=(data.get('phone')||'').trim();if(phone&&!/^\+?[0-9۰-۹٠-٩ ()\-]{6,40}$/.test(phone)){report(d.invalid,true);$('#phone').focus();return;}
    data.set('language',lang);data.set('source',(new URLSearchParams(location.search).get('utm_source')||'website').slice(0,300));
    const sig=data.toString();if(sig!==lastSignature){lastSignature=sig;lastId=crypto.randomUUID();}data.set('requestId',lastId);
    posting=true;submit.disabled=true;report(d.saving,false);form.setAttribute('aria-busy','true');
    try{fetch(endpoint,{method:'POST',mode:'no-cors',credentials:'omit',body:data,redirect:'follow'}).catch(()=>{});
      let confirmed=false;for(let i=0;i<5;i++){await new Promise(r=>setTimeout(r,i===0?2200:3000));try{const result=await receipt(lastId);if(result?.saved===true){confirmed=true;break;}}catch(_){}}
      if(!confirmed)throw new Error('no-receipt');report(d.success,false);$('#booking-fallback').hidden=false;submit.hidden=true;window.location.assign(bookingURL);
    }catch(_){report(d.failed+' — vellumhouse.edu@gmail.com',true);status.focus();}finally{posting=false;submit.disabled=false;form.removeAttribute('aria-busy');}
  });
  render();let remembered=false;try{const x=sessionStorage.getItem('vh-lang');if(CONTENT[x]){lang=x;remembered=true;render();}}catch(_){}
  if(!remembered)openLanguage(true);else{const legal=new URLSearchParams(location.search).get('legal');if(['privacy','terms'].includes(legal))openLegal(legal);}
})();

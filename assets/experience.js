/* Vellum House V8 — single-screen, accessible, bilingual experience.
 * No framework, tracking pixels or external JS dependencies.
 * Google Sheets + Gmail flow is reused; booking occurs only after receipt confirmation.
 */
(() => {
  'use strict';
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  const SCREENS = ['journey','method','people','proof','consult'];
  const D = {
    fa: {
      menu:'فهرست', folio:'اطلس ولوم هاوس', return:'آغاز', bottom:'از شناخت امروز تا ساختن فردا', cta:'درخواست جلسه مشاوره رایگان اولیه',
      screenNames:['مسیر شما','روش ما','افراد ما','نتایج و تجربه‌ها','مشاوره'],
      kicker:'VELLUM HOUSE  /  A DIFFERENT WAY FORWARD',
      hero:'هر آینده‌ای،<br><em>مسیر خودش را دارد.</em>',
      heroSub:'توانمندی‌ها و هدف‌های فرزندتان را می‌شناسیم و آموزش، منتورینگ و فرصت‌های رشد او را در مسیری هماهنگ پیش می‌بریم.',
      start:'مسیر را کشف کنید', atlasHint:'روی ایستگاه‌ها بزنید و مسیر را کشف کنید', now:'امروز', future:'فردا', stageLabel:'ایستگاه', next:'بعدی', previous:'قبلی',
      stageNames:['شناخت نقطه شروع','کشف توانمندی‌ها','طراحی مسیر','رشد و تجربه','آمادگی آینده'],
      stageTexts:[
        'از وضعیت درسی، علاقه‌ها و چالش‌های دانش‌آموز شروع می‌کنیم؛ نه از یک برنامه ازپیش‌ساخته.',
        'استعدادها و انتخاب‌های پیش رو را با هم بررسی می‌کنیم تا هدف‌ها روشن‌تر شوند.',
        'کلاس‌ها، راهنمایی فردی و پیگیری پیشرفت را بر اساس نیاز واقعی کنار هم می‌چینیم.',
        'با پروژه‌ها، مسابقات و فرصت‌های علمیِ مناسب، دانش و تجربه او را گسترش می‌دهیم.',
        'برای انتخاب رشته، دانشگاه و گام‌های بعدی، تصمیم‌ها و زمان‌بندی‌ها را دقیق‌تر می‌کنیم.'
      ],
      stageTags:['شناخت و ارزیابی','استعداد و هدف','آموزش و منتورینگ','پروژه و رقابت','راهبرد دانشگاه'],
      journeyNote:'این پنج ایستگاه، یک نقشه راه‌اند؛ نه پنج بسته اجباری. مسیر از نیاز هر فرد آغاز می‌شود.',
      methodKicker:'THE VELLUM WAY / 02', methodHead:'نه چند خدمت پراکنده؛<br><em>یک مسیر پیوسته.</em>',
      methodSub:'هر تصمیم آموزشی باید به هدفی روشن وصل باشد. ما به‌جای نسخه یکسان برای همه، مسیر را همراه خانواده طراحی و پیگیری می‌کنیم.',
      methodHeading:'چگونه همراهتان هستیم', methodNames:['شناخت','طراحی','همراهی'],
      methodDesc:['از وضعیت فعلی، علایق و استعدادها شروع می‌کنیم.','آموزش، منتورینگ و تجربه‌های مناسب را هماهنگ می‌کنیم.','پیشرفت را بررسی می‌کنیم و برنامه را متناسب با تغییر نیازها به‌روز می‌کنیم.'],
      methodFoot:'می‌توانید مدیریت کامل مسیر یا فقط خدمات موردنیازتان را انتخاب کنید.', services:'خدمات قابل انتخاب',
      servicesList:['کلاس و آمادگی آزمون','منتورینگ و گزارش پیشرفت','پروژه و مسابقات علمی','راهنمای انتخاب رشته و دانشگاه'],
      peopleKicker:'THE PEOPLE / 03', peopleHead:'پشت هر مسیر،<br><em>آدم‌ها هستند.</em>',
      peopleSub:'ولوم هاوس بر گفت‌وگو، شناخت دقیق و همراهی انسانی بنا شده است.', founders:'بنیان‌گذاران',
      person1:'ریحانه وجودی',person1role:'بنیان‌گذار · مدرس و پژوهشگر فیزیک',person1detail:'کارشناسی ارشد گرانش و کیهان‌شناسی',
      person2:'کسری پهلوانی',person2role:'هم‌بنیان‌گذار',person2detail:'کارشناسی ارشد مهندسی مخابرات',
      imagePlaceholder:'جای تصویر رسمی', teamTitle:'تیم تخصصی',teamText:'فضای معرفی همکاران و متخصصان، پس از تکمیل اطلاعات و تصاویر تأییدشده.',
      proofKicker:'TRUST / 04',proofHead:'اعتماد،<br><em>با شواهد ساخته می‌شود.</em>',
      proofSub:'اینجا جای انتشار نمونه‌کارها و تجربه‌های واقعی است؛ نه اعداد و وعده‌های بدون پشتوانه.',
      resultHead:'مسیرها و دستاوردها',resultText:'نمونه‌های تأییدشده از پروژه‌ها، پیشرفت‌ها و مسیرهای آموزشی دانش‌آموزان در این بخش معرفی می‌شوند.',
      quoteHead:'صدای خانواده‌ها',quoteText:'نظرهای واقعی دانش‌آموزان و والدین، فقط با اجازه انتشار، در این بخش قرار می‌گیرند.',
      slot:'فضای محتوای تأییدشده',proofFoot:'محتوای این بخش پس از راستی‌آزمایی و دریافت رضایت منتشر می‌شود.',
      consultKicker:'THE FIRST CONVERSATION / 05',consultHead:'بیایید از<br><em>اینجا شروع کنیم.</em>',
      consultSub:'در یک جلسه آنلاین ۳۰ دقیقه‌ای و رایگان، درباره شرایط فعلی، هدف‌ها و مناسب‌ترین قدم بعدی گفت‌وگو می‌کنیم.',
      consultNote:'برای دانش‌آموزان زیر ۱۸ سال، حضور دست‌کم یکی از والدین یا سرپرست ضروری است.',
      consultFree:'۳۰ دقیقه · آنلاین · بدون هزینه', formEyebrow:'مرحله ۰۱ / ثبت درخواست',
      formIntro:'اطلاعات کوتاهی ثبت کنید؛ پس از تأیید، وارد تقویم انتخاب وقت می‌شوید.',
      name:'نام والد یا متقاضی',email:'ایمیل',phone:'تلفن (اختیاری)',grade:'پایه یا مقطع (اختیاری)',service:'چه کمکی نیاز دارید؟',message:'هدف یا پرسش شما (اختیاری)',
      namePh:'نام و نام خانوادگی',phonePh:'+98 …',gradePh:'مثلاً پایه دهم',messagePh:'در یک یا دو جمله کافی است.',
      choose:'یک گزینه انتخاب کنید', interests:['مدیریت کامل مسیر تحصیلی','کلاس و آمادگی آزمون','منتورینگ و پیگیری پیشرفت','پروژه، استعداد و مسابقه','آمادگی برای دانشگاه','هنوز مطمئن نیستم'],
      consentA:'با تماس گرفتن درباره این درخواست موافقم و',consentB:'اطلاعیه حریم خصوصی',consentC:'را خوانده‌ام.',
      submit:'ثبت درخواست و انتخاب زمان', disclaimer:'جلسه فقط بعد از انتخاب و تأیید زمان در تقویم رزرو می‌شود.',
      saving:'در حال ثبت امن درخواست…', success:'درخواست ثبت شد. در حال باز کردن تقویم…',error:'تأیید ثبت درخواست انجام نشد. دوباره تلاش کنید یا با ما ایمیل بزنید.',
      inactive:'سامانه ثبت درخواست در دسترس نیست. لطفاً به vellumhouse.edu@gmail.com ایمیل بزنید.',
      invalidPhone:'شماره تماس درست نیست؛ آن را اصلاح کنید یا خالی بگذارید.',saved:'درخواست شما ثبت شده است. اگر تقویم باز نشد، از این لینک استفاده کنید:',
      booking:'ورود به تقویم رزرو',privacyTitle:'حریم خصوصی',privacyCopy:'اطلاعات فرم برای پاسخ به درخواست شما و هماهنگی جلسه استفاده می‌شود. اطلاعات در سامانه خصوصی ولوم هاوس نگهداری و فقط در اختیار افراد مسئول پیگیری قرار می‌گیرد. برای حذف اطلاعات یا طرح پرسش، به vellumhouse.edu@gmail.com ایمیل بزنید. رزرو جلسه در Cal.com انجام می‌شود و تابع سیاست حریم خصوصی آن سرویس نیز هست.',
      legalFoot:'متن حریم خصوصی باید پیش از انتشار نهایی توسط مسئول مجموعه بازبینی شود.',termsTitle:'شرایط استفاده',termsCopy:'جلسه مشاوره اولیه ۳۰ دقیقه‌ای رایگان است و تعهدی به خرید خدمات ایجاد نمی‌کند. ارزیابی‌های تکمیلی، کلاس‌ها، منتورینگ و خدمات دیگر فقط پس از توافق جداگانه درباره محدوده و هزینه ارائه می‌شوند. نتایج آموزشی، پذیرش دانشگاه و دریافت بورسیه تضمین‌شده نیستند. برای دانش‌آموزان زیر ۱۸ سال، همراهی والد یا سرپرست ضروری است.',termsLink:'شرایط استفاده',privacyLink:'حریم خصوصی',
      menuTitle:'انتخاب یک بخش',emailNow:'ارتباط مستقیم', back:'بازگشت', formContinue:'ادامه ثبت درخواست',formBack:'بازگشت به اطلاعات تماس'
    },
    en: {
      menu:'Explore',folio:'THE VELLUM HOUSE ATLAS',return:'Beginning',bottom:'FROM WHERE YOU ARE TO WHAT COULD BE',cta:'Book a Free Initial Consultation',
      screenNames:['Your journey','Our approach','The people','Stories & proof','Consultation'],
      kicker:'VELLUM HOUSE  /  A DIFFERENT WAY FORWARD',
      hero:'Every future deserves<br><em>its own path.</em>',
      heroSub:'We understand each student’s strengths and goals, then connect teaching, mentorship and meaningful opportunities into one thoughtful journey.',
      start:'Explore the journey',atlasHint:'Select a point to discover the journey',now:'TODAY',future:'TOMORROW',stageLabel:'CHAPTER',next:'Next',previous:'Previous',
      stageNames:['Understand today','Discover direction','Design the path','Grow through experience','Prepare for what’s next'],
      stageTexts:[
        'We begin with the student’s current learning, interests and challenges—not a ready-made programme.',
        'We explore strengths, interests and possible directions to make future decisions clearer.',
        'We connect individual classes, mentorship and progress reviews around real needs.',
        'We introduce relevant projects, competitions and academic opportunities to deepen experience.',
        'We support informed subject and university choices, admissions preparation and next-step planning.'
      ],
      stageTags:['Discovery & assessment','Strengths & direction','Teaching & mentoring','Projects & challenges','University strategy'],
      journeyNote:'These are guideposts, not five fixed packages. Each journey begins where a student actually is.',
      methodKicker:'THE VELLUM WAY / 02',methodHead:'Not separate services.<br><em>One connected journey.</em>',
      methodSub:'Every educational choice should connect to a meaningful goal. We design and review each path with the student and family, instead of following a template.',
      methodHeading:'How we guide you',methodNames:['Understand','Design','Stay alongside'],
      methodDesc:['Explore the current situation, interests and abilities.','Coordinate the right teaching, mentorship and opportunities.','Review progress and adapt the plan as needs change.'],
      methodFoot:'Choose complete academic management or only the individual services you need.',services:'Ways we can help',
      servicesList:['Personal classes & exam preparation','Mentoring & progress reports','Projects & academic competitions','Subject & university strategy'],
      peopleKicker:'THE PEOPLE / 03',peopleHead:'Every meaningful path<br><em>starts with people.</em>',
      peopleSub:'Vellum House is built on attentive conversations, genuine understanding and human guidance.',founders:'THE FOUNDERS',
      person1:'Reyhaneh Vojoudi',person1role:'Founder · Physics educator and researcher',person1detail:'MSc in Gravity and Cosmology',
      person2:'Kasra Pahlavani',person2role:'Co-founder',person2detail:'MSc in Telecommunications Engineering',
      imagePlaceholder:'Portrait to be added',teamTitle:'Our specialist network',teamText:'Space for confirmed profiles and portraits of specialist colleagues.',
      proofKicker:'TRUST / 04',proofHead:'Trust is built<br><em>on evidence.</em>',
      proofSub:'This is a space for genuine experiences and verified student work—never invented outcomes or promises.',
      resultHead:'Student journeys & results',resultText:'Documented projects, achievements and learning journeys will be featured here once verified and approved.',
      quoteHead:'In families’ own words',quoteText:'Authentic student and parent feedback will appear here only with permission.',
      slot:'Reserved for verified content',proofFoot:'Stories and outcomes are shared only when verified and approved for publication.',
      consultKicker:'THE FIRST CONVERSATION / 05',consultHead:'The next chapter<br><em>starts here.</em>',
      consultSub:'A free, 30-minute online conversation about your starting point, goals and the most useful next step.',
      consultNote:'For students under 18, at least one parent or guardian must attend.',consultFree:'30 MINUTES · ONLINE · COMPLIMENTARY',
      formEyebrow:'STEP 01 / ENQUIRY',formIntro:'Share a few details. Once saved, you’ll enter the calendar to choose a time.',
      name:'Parent / applicant name',email:'Email address',phone:'Phone (optional)',grade:'Grade / study level (optional)',service:'What are you looking for?',message:'Your goal or question (optional)',
      namePh:'Full name',phonePh:'+98 …',gradePh:'e.g. Grade 10',messagePh:'A sentence or two is enough.',
      choose:'Select an area',interests:['Complete academic management','Classes & exam preparation','Mentoring & progress tracking','Talent, projects & competitions','University preparation','Not sure yet'],
      consentA:'I agree to be contacted about this enquiry and have read the',consentB:'privacy notice',consentC:'.',
      submit:'Submit enquiry & choose a time',disclaimer:'Your meeting is not booked until you select and confirm a time in the calendar.',
      saving:'Securely saving your enquiry…',success:'Enquiry saved. Opening the calendar…',error:'We could not confirm your enquiry. Please try again or email us.',
      inactive:'The enquiry system is unavailable. Please email vellumhouse.edu@gmail.com.',
      invalidPhone:'Please correct your phone number or leave it blank.',saved:'Your enquiry is saved. If the calendar did not open, use this link:',booking:'Open booking calendar',
      privacyTitle:'Privacy notice',privacyCopy:'We use your enquiry details to reply and coordinate your consultation. Information is stored in Vellum House’s private system and is accessible only to people responsible for enquiries. For deletion requests or questions, email vellumhouse.edu@gmail.com. Appointments are booked through Cal.com, which has its own privacy policy.',
      legalFoot:'This notice requires final review by the organisation before public launch.',termsTitle:'Terms of use',termsCopy:'The initial 30-minute consultation is complimentary and does not create a purchase commitment. Further assessments, classes, mentoring and other services are provided only after a separate agreement on scope and fees. Academic results, university admissions and scholarships cannot be guaranteed. Students under 18 require the participation of a parent or guardian.',termsLink:'Terms',privacyLink:'Privacy',menuTitle:'Choose a chapter',emailNow:'Direct email',back:'Back'
    }
  };
  const state = {
    lang: document.body.dataset.defaultLang === 'en' ? 'en' : 'fa',
    screen: SCREENS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'journey',
    stage: 0,
    home: !location.hash,
    menu: false,
    legal: false
  };
  const reduced = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const get = () => D[state.lang];
  const config = window.VELLUM_CONFIG || {};
  const endpoint = String(config.formEndpoint || '').trim();
  const bookingUrl = (() => { try { const u=new URL(config.bookingUrl); return u.protocol==='https:' && u.hostname==='cal.com' && u.pathname!=='/' ? u.href : 'https://cal.com/vhouse/consultation'; } catch(_) { return 'https://cal.com/vhouse/consultation'; } })();
  const iconArrow = '<span class="arrow-mark" aria-hidden="true">↗</span>';
  const sectionTop = (kicker,title,sub) => `<div class="editorial-top"><span class="eyebrow"><span class="eyebrow-rule"></span>${kicker}</span><h1>${title}</h1><p>${sub}</p></div>`;
  const stageDetail = (index) => {const t=get();return `<span class="panel-overline">${t.stageLabel} / ${String(index+1).padStart(2,'0')} <span class="split-dot">✦</span> ${t.stageTags[index]}</span><h2>${t.stageNames[index]}</h2><p>${t.stageTexts[index]}</p>`;};
  const makeJourney = () => {const t=get(); return `
  <section class="screen screen-journey" aria-label="${t.screenNames[0]}">
    <div class="editorial">${sectionTop(t.kicker,t.hero,t.heroSub)}
      <div class="editorial-action"><button class="link-arrow" type="button" data-spotlight="1">${t.start} ${iconArrow}</button><div class="editorial-folio"><span>01 — 05</span><span>${t.now} / ${t.future}</span></div></div>
    </div>
    <div class="visual-room" id="visual-room"><div class="map-engraving" aria-hidden="true"></div>
      <div class="map-corner corner-a">V / H <span>·</span> ATLAS 01</div><div class="map-corner corner-b">37° 33′  /  55° 42′</div>
      <div class="map-header"><span>AN ATLAS OF POSSIBILITIES</span><span class="map-header-right">Nº 001 — 005</span></div>
      <div class="atlas-interactive" id="atlas-interactive">
        <svg class="atlas-svg" viewBox="0 0 1000 440" preserveAspectRatio="none" aria-hidden="true">
          <defs><linearGradient id="live-gold" x1="0" x2="1"><stop offset="0" stop-color="#97734b"/><stop offset=".48" stop-color="#f2d4a0"/><stop offset="1" stop-color="#b78d5e"/></linearGradient><radialGradient id="map-pulse"><stop offset="0" stop-color="#bd9a66" stop-opacity=".19"/><stop offset="1" stop-color="#bd9a66" stop-opacity="0"/></radialGradient></defs>
          <g class="map-contours">
            <path d="M-80 110 C 70 -30 185 255 365 85 S 730 160 1070 15"/>
            <path d="M-80 135 C 70 -5 185 280 365 110 S 730 185 1070 40"/>
            <path d="M-80 160 C 70 20 185 305 365 135 S 730 210 1070 65"/>
            <path d="M-80 185 C 70 45 185 330 365 160 S 730 235 1070 90"/>
            <path d="M-80 210 C 70 70 185 355 365 185 S 730 260 1070 115"/>
            <path d="M-80 235 C 70 95 185 380 365 210 S 730 285 1070 140"/>
            <path d="M-80 260 C 70 120 185 405 365 235 S 730 310 1070 165"/>
            <path d="M-80 285 C 70 145 185 430 365 260 S 730 335 1070 190"/>
            <path d="M-80 310 C 70 170 185 455 365 285 S 730 360 1070 215"/>
            <path d="M-80 335 C 70 195 185 480 365 310 S 730 385 1070 240"/>
            <path d="M-80 360 C 70 220 185 505 365 335 S 730 410 1070 265"/>
          </g>
          <g class="map-coordinates"><path d="M50 50h900M50 130h900M50 210h900M50 290h900M50 370h900M120 20v400M320 20v400M520 20v400M720 20v400M920 20v400"/></g>
          <circle cx="568" cy="201" r="228" class="map-orbit outer"/><circle cx="568" cy="201" r="174" class="map-orbit"/><circle cx="568" cy="201" r="105" class="map-orbit inner"/>
          <ellipse cx="568" cy="201" rx="355" ry="122" class="map-ellipse" transform="rotate(-21 568 201)"/>
          <path id="route-path" class="route-base" d="M 90 322 C 190 335, 184 145, 323 180 S 465 345, 535 264 S 661 102, 725 168 S 858 165, 920 70"/>
          <path id="route-live" class="route-live" d="M 90 322 C 190 335, 184 145, 323 180 S 465 345, 535 264 S 661 102, 725 168 S 858 165, 920 70"/>
          <g id="traveler" transform="translate(90 322)"><circle class="traveler-aura" r="18"/><circle class="traveler-inner" r="7"/><circle class="traveler-core" r="2.5"/></g>
          <g class="map-sparkles"><path d="M150 60v14m-7-7h14M840 340v14m-7-7h14M480 63v10m-5-5h10M65 225v10m-5-5h10"/></g>
        </svg>
        ${[0,1,2,3,4].map(i=>`<button type="button" class="atlas-node ${i===state.stage?'selected':''}" style="--i:${i}" data-stage="${i}" aria-pressed="${i===state.stage}" aria-label="${i+1}. ${t.stageNames[i]}"><span class="node-pulse"></span><span class="node-number">0${i+1}</span><span class="node-title">${t.stageNames[i]}</span></button>`).join('')}
      </div>
      <div class="map-hint"><span>✳</span> ${t.atlasHint}</div>
      <div class="journey-info"><div id="stage-detail" aria-live="polite">${stageDetail(state.stage)}</div><div class="stage-controls"><button type="button" class="stage-nav" data-stage-prev aria-label="${t.previous}" ${state.stage===0?'disabled':''}>‹</button><span id="stage-index">0${state.stage+1}<i> / </i>05</span><button type="button" class="stage-nav" data-stage-next aria-label="${t.next}" ${state.stage===4?'disabled':''}>›</button></div></div>
    </div>
  </section>`;};
  const makeMethod = () => {const t=get();return `<section class="screen screen-method"><div class="editorial">${sectionTop(t.methodKicker,t.methodHead,t.methodSub)}<div class="editorial-action"><button type="button" class="link-arrow" data-go="consult">${t.cta} ${iconArrow}</button><div class="editorial-folio"><span>V / H</span><span>METHOD · 02</span></div></div></div>
  <div class="visual-room secondary-room"><div class="room-eyebrow">${t.methodHeading}<span>01 — 03</span></div><div class="principle-stack">${t.methodNames.map((n,i)=>`<button type="button" class="principle ${i===0?'is-current':''}" data-principle="${i}"><span>0${i+1}</span><span class="principle-title">${n}</span><span class="principle-action">↗</span><small class="principle-desc">${t.methodDesc[i]}</small></button>`).join('')}</div><div class="service-strip"><span>${t.services}</span><div>${t.servicesList.map(x=>`<span>${x}</span>`).join('')}</div></div><span class="room-fineprint">${t.methodFoot}</span></div></section>`;};
  const person = (name, role, detail, monogram, slot) => `<article class="founder-card"><div class="portrait-slot" data-slot="${slot}"><div class="portrait-geometry"><span class="portrait-arc"></span><span class="portrait-initials">${monogram}</span></div><span class="portrait-placeholder">${get().imagePlaceholder}</span></div><div class="founder-details"><span class="founder-role">${role}</span><h2>${name}</h2><span>${detail}</span></div></article>`;
  const makePeople = () => {const t=get();return `<section class="screen screen-people"><div class="editorial">${sectionTop(t.peopleKicker,t.peopleHead,t.peopleSub)}<div class="editorial-action"><button type="button" class="link-arrow" data-go="consult">${t.cta} ${iconArrow}</button><div class="editorial-folio"><span>V / H</span><span>PEOPLE · 03</span></div></div></div><div class="visual-room secondary-room people-room"><div class="room-eyebrow">${t.founders}<span>V / H · PEOPLE</span></div><div class="founder-grid">${person(t.person1,t.person1role,t.person1detail,'RV','founder-one')}${person(t.person2,t.person2role,t.person2detail,'KP','founder-two')}</div><div class="team-strip"><span class="small-seal">✦</span><strong>${t.teamTitle}</strong><p>${t.teamText}</p></div></div></section>`;};
  const makeProof = () => {const t=get();return `<section class="screen screen-proof"><div class="editorial">${sectionTop(t.proofKicker,t.proofHead,t.proofSub)}<div class="editorial-action"><button type="button" class="link-arrow" data-go="consult">${t.cta} ${iconArrow}</button><div class="editorial-folio"><span>V / H</span><span>TRUST · 04</span></div></div></div><div class="visual-room secondary-room proof-room"><div class="room-eyebrow">TRUST & EVIDENCE <span>THE ARCHIVE</span></div><div class="proof-grid"><article class="proof-card"><span class="proof-index">01 / THE WORK</span><div class="proof-symbol"><svg viewBox="0 0 160 115" aria-hidden="true"><path d="M12 98C62 95 38 35 90 47S117 7 150 13"/><circle cx="90" cy="47" r="5"/><circle cx="150" cy="13" r="5"/></svg></div><div><h2>${t.resultHead}</h2><p>${t.resultText}</p></div><span class="proof-slot">${t.slot} ↗</span></article><article class="proof-card"><span class="proof-index">02 / THE VOICES</span><div class="proof-symbol quote-symbol">“</div><div><h2>${t.quoteHead}</h2><p>${t.quoteText}</p></div><span class="proof-slot">${t.slot} ↗</span></article></div><p class="proof-note">${t.proofFoot}</p></div></section>`;};
  const makeConsult = () => {const t=get();return `<section class="screen screen-consult"><div class="editorial">${sectionTop(t.consultKicker,t.consultHead,t.consultSub)}<div class="consult-promise"><span class="promise-line"></span><strong>${t.consultFree}</strong><small>${t.consultNote}</small></div><div class="editorial-folio"><span>V / H</span><span>CONSULT · 05</span></div></div>
  <div class="visual-room form-room"><div class="room-eyebrow">${t.formEyebrow}<span>VELLUM HOUSE / ENQUIRY</span></div><p class="form-intro">${t.formIntro}</p><form id="enquiry-form" novalidate method="post" action="" data-step="1"><div class="form-grid">
    <label class="field form-step-one">${t.name}<span>*</span><input id="fullName" name="fullName" autocomplete="name" maxlength="120" required placeholder="${t.namePh}"></label>
    <label class="field form-step-one">${t.email}<span>*</span><input id="email" name="email" type="email" autocomplete="email" dir="ltr" maxlength="200" required placeholder="name@example.com"></label>
    <label class="field form-step-one">${t.phone}<input id="phone" name="phone" type="tel" autocomplete="tel" dir="ltr" maxlength="40" placeholder="${t.phonePh}"></label>
    <label class="field form-step-one">${t.grade}<input id="grade" name="grade" autocomplete="off" maxlength="100" placeholder="${t.gradePh}"></label>
    <label class="field field-wide form-step-two">${t.service}<span>*</span><select name="serviceInterest" id="serviceInterest" required><option value="" disabled selected>${t.choose}</option>${['full','classes','mentoring','talent','university','other'].map((v,i)=>`<option value="${v}">${t.interests[i]}</option>`).join('')}</select></label>
    <label class="field field-wide form-step-two">${t.message}<textarea id="message" name="message" rows="2" maxlength="2000" placeholder="${t.messagePh}"></textarea></label>
    <label class="visually-hidden" aria-hidden="true">Website<input id="website" name="website" tabindex="-1" autocomplete="off"></label>
    <label class="consent-field form-step-two"><input type="checkbox" name="consent" value="yes" required><span>${t.consentA} <button type="button" class="text-link" data-legal>${t.consentB}</button> ${t.consentC}</span></label>
    <button class="cta form-next" type="button" data-form-next>${t.formContinue} ${iconArrow}</button><button class="form-back" type="button" data-form-back>‹ &nbsp; ${t.formBack}</button><button class="cta submit-cta form-step-two" id="submit-enquiry" type="submit">${t.submit} ${iconArrow}</button>
    <span class="form-disclaimer form-step-two">${t.disclaimer}</span>
  </div><div id="form-status" class="form-status" tabindex="-1" role="status" aria-live="polite"></div><div id="booking-fallback" class="booking-fallback" hidden><p>${t.saved}</p><a id="booking-link" href="${bookingUrl}" rel="noopener noreferrer">${t.booking} ↗</a></div></form></div></section>`;};
  const makeHome = () => {const t=get();return `<section class="home-hero"><img class="hero-poster" src="assets/hero-poster.3719e3deb4.webp" width="960" height="528" fetchpriority="high" alt=""><video class="hero-video" muted loop playsinline preload="none" aria-hidden="true"></video><div class="hero-shade"></div><div class="hero-copy">${sectionTop(t.kicker,t.hero,t.heroSub)}<button class="cta hero-cta" data-explore>${t.start}</button></div></section>`;};
  function startHero(){const v=$('.hero-video');if(!v)return;const c=navigator.connection;if(reduced||c?.saveData||/^(slow-2g|2g|3g)$/.test(c?.effectiveType||''))return;const start=()=>{if(!v.isConnected||document.hidden)return;v.muted=true;v.src=innerWidth<=740?'assets/hero-mobile.9d99f673a0.mp4':'assets/hero-desktop.d5bb8063ed.mp4';v.play().catch(()=>{});};v.addEventListener('playing',()=>v.classList.add('playing'));if(document.readyState==='complete')setTimeout(start,0);else window.addEventListener('load',start,{once:true});}
  document.addEventListener('visibilitychange',()=>{const v=$('.hero-video');if(v?.src){if(document.hidden)v.pause();else v.play().catch(()=>{});}});
  const templates = {journey:makeJourney,method:makeMethod,people:makePeople,proof:makeProof,consult:makeConsult};
  function formatLang() {
    const t=get();
    document.documentElement.lang=state.lang; document.documentElement.dir=state.lang==='fa'?'rtl':'ltr';
    document.title=state.lang==='fa'?'Vellum House — هر آینده‌ای، مسیر خودش را دارد':'Vellum House — Every Future Has Its Own Path';
    $('#language-short').textContent=state.lang.toUpperCase();$('#menu-label').textContent=t.menu;
    $('#header-cta').firstChild.textContent=t.cta+' ';$('#mobile-cta').firstChild.textContent=t.cta+' ';
    $('#top-folio').textContent=t.folio;$('#bottom-tagline').textContent=t.bottom;$('#return-label').textContent=t.return;
    $('#screen-prev').setAttribute('aria-label',t.previous+' '+t.screenNames[(SCREENS.indexOf(state.screen)+4)%5]);
    $('#screen-next').setAttribute('aria-label',t.next+' '+t.screenNames[(SCREENS.indexOf(state.screen)+1)%5]);
    const menu=$('#menu-items');menu.innerHTML=SCREENS.map((v,i)=>`<button type="button" data-go="${v}" class="menu-item ${v===state.screen?'active':''}"><span class="menu-item-num">0${i+1}</span><span>${t.screenNames[i]}</span><span class="menu-item-arrow" aria-hidden="true">↗</span></button>`).join('');
    $('#menu-heading').textContent=t.menuTitle;
    const legalLinks=$('#menu-legal-links');if(legalLinks)legalLinks.innerHTML=`<button type="button" data-legal="privacy">${t.privacyLink}</button><span>·</span><button type="button" data-legal="terms">${t.termsLink}</button>`;
    $('#menu-overlay').dir=state.lang==='fa'?'rtl':'ltr';
  }
  let travelerRaf=null;
  function setupRoute(initial=true) {
    const base=$('#route-live'),traveler=$('#traveler');if(!base||!traveler)return;
    const length=base.getTotalLength(), offsets=[0,.258,.51,.755,1];
    base.style.strokeDasharray=`${length}`;
    base.style.strokeDashoffset=String(length*(1-offsets[state.stage]));
    if(travelerRaf)cancelAnimationFrame(travelerRaf);
    const point=base.getPointAtLength(length*offsets[state.stage]);traveler.setAttribute('transform',`translate(${point.x} ${point.y})`);
  }
  function setStage(next) {
    if(!Number.isInteger(next)||next<0||next>4||state.screen!=='journey')return;
    const old=state.stage;state.stage=next;
    $$('.atlas-node').forEach((el,i)=>{el.classList.toggle('selected',i===next);el.setAttribute('aria-pressed',String(i===next));});
    $('#stage-detail').innerHTML=stageDetail(next);$('#stage-index').innerHTML=`0${next+1}<i> / </i>05`;
    $('[data-stage-prev]').disabled=next===0;$('[data-stage-next]').disabled=next===4;
    const base=$('#route-live'),traveler=$('#traveler');const length=base.getTotalLength(),progress=[0,.258,.51,.755,1];
    base.style.strokeDashoffset=String(length*(1-progress[next]));
    if(travelerRaf)cancelAnimationFrame(travelerRaf);
    const started=performance.now(),duration=760;
    const a=progress[old],b=progress[next];
    if(reduced) { const p=base.getPointAtLength(length*b);traveler.setAttribute('transform',`translate(${p.x} ${p.y})`);return; }
    const animate=(now)=>{const n=Math.min(1,(now-started)/duration),e=n<.5?4*n*n*n:1-Math.pow(-2*n+2,3)/2;const p=base.getPointAtLength(length*(a+(b-a)*e));traveler.setAttribute('transform',`translate(${p.x} ${p.y})`);if(n<1)travelerRaf=requestAnimationFrame(animate);};
    travelerRaf=requestAnimationFrame(animate);
  }
  function render() {
    const t=get(); formatLang(); const pos=SCREENS.indexOf(state.screen);
    $('#screen-number').textContent=String(pos+1).padStart(2,'0');$('#screen-track-progress').style.width=`${(pos+1)*20}%`;
    $('#screen-prev').disabled=pos===0;$('#screen-next').disabled=pos===4;
    $('#back-to-top').classList.toggle('is-visible',!state.home);
    const root=$('#experience'); root.innerHTML=state.home?makeHome():templates[state.screen]();
    document.body.dataset.page=state.home?"home":state.screen; if(state.home)startHero();
    root.dataset.section=state.screen;
    if(state.screen==='journey')setupRoute();
    $$('.principle').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===0)));
  }
  function go(screen,options={}) {
    if(!SCREENS.includes(screen))return;
    state.home=!!options.home; if(state.screen!==screen)state.screen=screen;
    if(options.stage!=null)state.stage=options.stage;
    render(); history.replaceState(null,'',state.home?location.pathname+location.search:'#'+screen);
    if(state.menu)closeMenu();
    $('#experience').focus?.({preventScroll:true});
  }
  function openMenu(){state.menu=true;$('#menu-overlay').hidden=false;$('#app-shell').inert=true;$('#menu-trigger').setAttribute('aria-expanded','true');$('#menu-items button').focus();}
  function closeMenu(){state.menu=false;$('#menu-overlay').hidden=true;$('#app-shell').inert=false;$('#menu-trigger').setAttribute('aria-expanded','false');$('#menu-trigger').focus({preventScroll:true});}
  function openLanguage(force=false) {
    const dlg=$('#language-overlay');$$('[data-choose-language]',dlg).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.chooseLanguage===state.lang)));dlg.hidden=false;$('#app-shell').inert=true;
    $('#language-close').hidden=!force;
    dlg.dataset.dismissable=force?'true':'false';
    dlg.querySelector('[data-choose-language="'+state.lang+'"]').focus();
  }
  function closeLanguage(){const dlg=$('#language-overlay');if(dlg.dataset.dismissable==='true'){dlg.hidden=true;$('#app-shell').inert=false;$('.lang-btn').focus();}}
  function chooseLanguage(lang){if(!D[lang])return;const legalRequested=new URLSearchParams(location.search).get('legal');state.lang=lang;storeLanguage(lang);$('#language-overlay').hidden=true;$('#app-shell').inert=false;render();const path=lang==='fa'?'/fa.html':'/en.html';try{history.replaceState(null,'',(location.protocol==='file:'?'':path)+(state.home?'':'#'+state.screen));}catch(_){}const target=$('#experience');target.setAttribute('tabindex','-1');target.focus({preventScroll:true});if(['privacy','terms'].includes(legalRequested))openLegal(legalRequested);}
  // An actual dialog prevents keyboard focus escaping while language selection is required.
  function trapTab(event){if(event.key!=='Tab')return;const dlg=!$('#language-overlay').hidden?$('#language-overlay'):!$('#menu-overlay').hidden?$('#menu-overlay'):$('#legal-overlay');if(!dlg||dlg.hidden)return;const focusable=$$('button:not([disabled]):not([hidden]),a[href],input,select,textarea',dlg).filter(el=>el.offsetParent!==null);if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
  document.addEventListener('keydown',e=>{
    trapTab(e);
    if(e.key==='Escape'){if($('#legal-overlay') && !$('#legal-overlay').hidden)closeLegal();else if(!$('#language-overlay').hidden)closeLanguage();else if(state.menu)closeMenu();return;}
    if(!$('#language-overlay').hidden||state.menu||($('#legal-overlay') && !$('#legal-overlay').hidden)||state.screen!=='journey')return;
    const target=e.target;if(['INPUT','TEXTAREA','SELECT'].includes(target.tagName))return;
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){const forward=state.lang==='fa'?'ArrowLeft':'ArrowRight';const candidate=state.stage+(e.key===forward?1:-1);if(candidate>=0&&candidate<=4){e.preventDefault();setStage(candidate);}}
  });
  document.addEventListener('click',e=>{
    const lang=e.target.closest('[data-choose-language]');if(lang){chooseLanguage(lang.dataset.chooseLanguage);return;}
    if(e.target.closest('[data-language-open]')){openLanguage(true);return;}
    if(e.target.closest('.language-backdrop')){closeLanguage();return;}
    if(e.target.closest('[data-explore]')){go('journey');return;}
    if(e.target.closest('#back-to-top,.brand')){go('journey',{home:true});return;}
    if(e.target.closest('#language-close')){closeLanguage();return;}
    if(e.target.closest('#menu-trigger')){openMenu();return;}
    if(e.target.closest('[data-menu-close]')){closeMenu();return;}
    const legalButton=e.target.closest('[data-legal]');if(legalButton){openLegal(legalButton.dataset.legal || 'privacy');return;}
    if(e.target.closest('[data-legal-close]')){closeLegal();return;}
    const goButton=e.target.closest('[data-go]');if(goButton){go(goButton.dataset.go);return;}
    const node=e.target.closest('[data-stage]');if(node){setStage(Number(node.dataset.stage));return;}
    if(e.target.closest('[data-stage-next]')){setStage(state.stage+1);return;}
    if(e.target.closest('[data-stage-prev]')){setStage(state.stage-1);return;}
    if(e.target.closest('[data-spotlight]')){setStage(1);$('#atlas-interactive .atlas-node.selected')?.focus();return;}
    if(e.target.closest('[data-form-next]')){const f=$('#enquiry-form');if(!f)return;const name=$('#fullName'),mail=$('#email');if(!name.reportValidity()||!mail.reportValidity())return;f.dataset.step='2';f.querySelector('#serviceInterest').focus({preventScroll:true});return;}
    if(e.target.closest('[data-form-back]')){const f=$('#enquiry-form');if(!f)return;f.dataset.step='1';f.querySelector('#fullName').focus({preventScroll:true});return;}
    const principle=e.target.closest('[data-principle]');if(principle){$$('.principle').forEach(p=>{p.classList.toggle('is-current',p===principle);p.setAttribute('aria-pressed',String(p===principle));});return;}
    if(e.target.closest('#screen-prev')){go(SCREENS[Math.max(0,SCREENS.indexOf(state.screen)-1)]);return;}
    if(e.target.closest('#screen-next')){go(SCREENS[Math.min(4,SCREENS.indexOf(state.screen)+1)]);return;}
  });
  window.addEventListener('hashchange',()=>{const target=location.hash.slice(1);if(SCREENS.includes(target)&&target!==state.screen)go(target);});
  // Subtle lighting only on fine-pointer devices, with no animation library.
  if(!reduced&&window.matchMedia('(pointer:fine)').matches){document.addEventListener('pointermove',e=>{const room=e.target.closest('.visual-room');if(!room)return;const b=room.getBoundingClientRect();room.style.setProperty('--px',((e.clientX-b.left)/b.width*100).toFixed(2)+'%');room.style.setProperty('--py',((e.clientY-b.top)/b.height*100).toFixed(2)+'%');},{passive:true});}
  // In-page privacy dialog; no separate mandatory scroll page.
  let legalReturnFocus=null;
  function openLegal(kind='privacy'){const t=get();legalReturnFocus=document.activeElement;let dlg=$('#legal-overlay');if(!dlg){dlg=document.createElement('div');dlg.id='legal-overlay';dlg.className='legal-overlay';dlg.setAttribute('role','dialog');dlg.setAttribute('aria-modal','true');dlg.setAttribute('aria-labelledby','legal-title');document.body.appendChild(dlg);}dlg.dir=state.lang==='fa'?'rtl':'ltr';dlg.innerHTML=`<div class="legal-backdrop" data-legal-close></div><div class="legal-card"><div class="overlay-heading"><span>VELLUM HOUSE / PRIVACY</span><button type="button" class="close-btn" data-legal-close aria-label="Close">×</button></div><h2 id="legal-title">${kind==='terms'?t.termsTitle:t.privacyTitle}</h2><p>${kind==='terms'?t.termsCopy:t.privacyCopy}</p><small>${t.legalFoot}</small></div>`;dlg.hidden=false;$('#app-shell').inert=true;dlg.querySelector('.close-btn').focus();}
  function closeLegal(){const dlg=$('#legal-overlay');if(!dlg)return;dlg.hidden=true;$('#app-shell').inert=state.menu;legalReturnFocus?.focus();}
  // Data submissions are POSTed to the exact provided Apps Script endpoint.
  // A no-cors response is opaque; a private UUID receipt must independently confirm persistence.
  const VALID_ENDPOINT=/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;
  function receipt(id){return new Promise((resolve,reject)=>{const cb='vhReceipt_'+crypto.randomUUID().replaceAll('-','');const script=document.createElement('script');let settled=false;const done=(val)=>{if(settled)return;settled=true;clearTimeout(timer);script.remove();delete window[cb];val?resolve(val):reject(Error('receipt-unconfirmed'));};const timer=setTimeout(()=>done(null),10000);window[cb]=done;script.onerror=()=>done(null);const url=new URL(endpoint);url.search=new URLSearchParams({requestId:id,callback:cb,t:String(Date.now())}).toString();script.src=url.href;document.head.appendChild(script);});}
  let posting=false,prevSignature='',requestId='';
  document.addEventListener('submit',async e=>{
    if(e.target.id!=='enquiry-form')return;e.preventDefault();const form=e.target;
    if(posting)return;
    if(!form.reportValidity())return;
    const t=get(),status=$('#form-status'),submit=$('#submit-enquiry');
    const report=(msg,isError)=>{status.textContent=msg;status.classList.toggle('is-error',!!isError);status.classList.toggle('is-success',!isError);};
    if(!VALID_ENDPOINT.test(endpoint)){report(t.inactive,true);status.focus();return;}
    const data=new URLSearchParams(new FormData(form));if((data.get('website')||'').trim())return;
    const phone=(data.get('phone')||'').trim();if(phone&&!/^\+?[0-9۰-۹٠-٩ ()\-]{6,40}$/.test(phone)){report(t.invalidPhone,true);$('#phone').focus();return;}
    data.set('language',state.lang);const source=(new URLSearchParams(location.search).get('utm_source')||'website').slice(0,300);data.set('source',source);
    const signature=data.toString();if(signature!==prevSignature){prevSignature=signature;requestId=crypto.randomUUID();}data.set('requestId',requestId);
    posting=true;submit.disabled=true;form.setAttribute('aria-busy','true');report(t.saving,false);
    try {
      fetch(endpoint,{method:'POST',mode:'no-cors',credentials:'omit',body:data,redirect:'follow'}).catch(()=>{});
      let verified=false;
      for(let i=0;i<5;i++){
        await new Promise(r=>setTimeout(r,i===0?2200:3000));
        try{if((await receipt(requestId))?.saved===true){verified=true;break;}}catch(_){}
      }
      if(!verified)throw Error('not-confirmed');
      report(t.success,false);$('#booking-fallback').hidden=false;submit.hidden=true;
      window.location.assign(bookingUrl);
    }catch(_){report(t.error+' — vellumhouse.edu@gmail.com',true);status.focus();}
    finally{posting=false;submit.disabled=false;form.removeAttribute('aria-busy');}
  });
  function storeLanguage(lang){try{localStorage.setItem('vh-language',lang);}catch(_){}document.cookie='vh-language='+lang+'; Max-Age=31536000; Path=/; SameSite=Lax';}
  const initial=window.VH_LANGUAGE; if(initial?.lang)state.lang=initial.lang;
  if(initial?.chosen)storeLanguage(state.lang);
  render();
  if(!initial?.chosen)openLanguage(false);
  else {const legalRequested=new URLSearchParams(location.search).get('legal');if(['privacy','terms'].includes(legalRequested))openLegal(legalRequested);}
  let wheelTime=0;window.addEventListener('wheel',e=>{if(state.home&&e.deltaY>25&&$('#language-overlay').hidden&&!state.menu&&Date.now()-wheelTime>700){wheelTime=Date.now();go('journey');}},{passive:true});
})();

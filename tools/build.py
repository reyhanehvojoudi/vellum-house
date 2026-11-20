#!/usr/bin/env python3
"""Vellum House V6 — minimal bilingual static website generator.
Use: python tools/build.py. The independent Apps Script backend remains in backend/Code.gs.
"""
from pathlib import Path
from html import escape as esc
import json

ROOT = Path(__file__).resolve().parents[1]
DOMAIN = 'https://vhouse.ir/'
BOOKING = 'https://cal.com/vhouse/consultation'
FA_CTA = 'درخواست جلسه مشاوره رایگان اولیه'
EN_CTA = 'Request a free initial consultation'
PAGES = ('home','services','approach','pathways','about','journal','contact','privacy','terms')

SEO = {
 'fa': {
 'home': ('مدیریت اختصاصی مسیر تحصیلی | ولوم هاوس','ولوم هاوس استعداد و هدف هر دانش‌آموز را می‌شناسد و کلاس‌ها، منتورینگ و برنامه‌ریزی تحصیلی را در مسیری اختصاصی هماهنگ می‌کند.'),
 'services': ('خدمات تحصیلی و منتورینگ | ولوم هاوس','کلاس تخصصی، منتورینگ، پرورش استعداد، فعالیت‌های علمی و برنامه‌ریزی دانشگاه؛ به‌صورت مستقل یا در یک مسیر اختصاصی.'),
 'approach': ('روش کار و نقشه راه اختصاصی | ولوم هاوس','از شناخت وضعیت فعلی و استعدادهای دانش‌آموز تا هدف‌گذاری، طراحی برنامه و سنجش پیشرفت.'),
 'pathways': ('مسیرهای تحصیلی | ولوم هاوس','برنامه‌ریزی متناسب با دانش‌آموزان دبستان، دبیرستان، متقاضیان دانشگاه و دانشجویان.'),
 'about': ('درباره ولوم هاوس | ولوم هاوس','آشنایی با نگاه آموزشی و بنیان‌گذاران ولوم هاوس؛ رویکردی شخصی برای رشد تحصیلی و فردی.'),
 'journal': ('راهنماها و منابع | ولوم هاوس','چند راهنمای کاربردی برای خانواده‌ها و دانش‌آموزان و معرفی خدمات آموزشی ولوم هاوس.'),
 'contact': ('درخواست جلسه مشاوره رایگان اولیه | ولوم هاوس','فرم کوتاه را تکمیل کنید تا پس از ثبت موفق درخواست، زمان جلسه مشاوره رایگان اولیه ۳۰ دقیقه‌ای را انتخاب کنید.'),
 'privacy': ('حریم خصوصی | ولوم هاوس','توضیح اطلاعاتی که برای ثبت درخواست مشاوره دریافت می‌کنیم، نحوه نگهداری و حقوق مراجعه‌کنندگان.'),
 'terms': ('شرایط همکاری | ولوم هاوس','آشنایی با چارچوب جلسه رایگان اولیه و شرایط کلی خدمات اختصاصی ولوم هاوس.')
 },
 'en': {
 'home': ('Personalised Academic Guidance | Vellum House','We discover each student’s potential, then align teaching, mentoring and academic planning into one personalised, measurable journey.'),
 'services': ('Academic Services & Mentoring | Vellum House','Specialist classes, progress mentoring, talent development, academic opportunities and university planning—together or individually.'),
 'approach': ('Our Personalised Method | Vellum House','Discover the starting point, set meaningful goals, coordinate the work and track progress.'),
 'pathways': ('For Students & Families | Vellum House','Personalised academic support for primary and secondary students, university applicants and university students.'),
 'about': ('About Vellum House | Vellum House','Meet the philosophy and founders behind our personalised approach to academic growth.'),
 'journal': ('Resources | Vellum House','A concise introduction to Vellum House and practical ways to prepare for your initial consultation.'),
 'contact': ('Free Initial Consultation | Vellum House','Submit a short enquiry and, once confirmed, choose your free 30-minute online consultation.'),
 'privacy': ('Privacy Notice | Vellum House','How Vellum House collects, stores and uses information submitted through our enquiry form.'),
 'terms': ('Terms of Service | Vellum House','General terms for free introductory consultations and personalised academic services.')
 }
}

def file_for(k,l):
 if k == 'home': return 'index.html' if l=='fa' else 'en.html'
 return k+('-fa' if l=='fa' else '')+'.html'
def link(k,l,label,cls='',other=''):
 return f'<a class="{cls}" href="{file_for(k,l)}" {other}>{esc(label)}</a>'
def cta(l,cls='button button-primary'):
 return link('contact',l,FA_CTA if l=='fa' else EN_CTA,cls)
def tag(text):return '<span class="section-tag">'+esc(text)+'</span>'
def details(items):return ''.join(f'<details><summary>{esc(title)}<span aria-hidden="true">+</span></summary><p>{esc(body)}</p></details>' for title,body in items)

def head(k,l):
 title,description=SEO[l][k]
 canon = DOMAIN if k=='home' and l=='fa' else DOMAIN+file_for(k,l)
 org={'@context':'https://schema.org','@type':'EducationalOrganization','name':'Vellum House','url':DOMAIN,'email':'vellumhouse.edu@gmail.com','description':description,'availableLanguage':['Persian','English']}
 return f'''<!doctype html>
<html lang="{l}" dir="{'rtl' if l=='fa' else 'ltr'}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#101f2b"><meta name="description" content="{esc(description,quote=True)}">
<title>{esc(title)}</title>
<link rel="canonical" href="{canon}">
<link rel="alternate" hreflang="fa" href="{DOMAIN if k=='home' else DOMAIN+file_for(k,'fa')}">
<link rel="alternate" hreflang="en" href="{DOMAIN+file_for(k,'en')}">
<link rel="alternate" hreflang="x-default" href="{DOMAIN}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Vellum House">
<meta property="og:locale" content="{'fa_IR' if l=='fa' else 'en_US'}"><meta property="og:url" content="{canon}">
<meta property="og:title" content="{esc(title,quote=True)}"><meta property="og:description" content="{esc(description,quote=True)}">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="assets/style.css?v=6.2" as="style"><link rel="stylesheet" href="assets/style.css?v=6.2">
<script defer src="assets/config.js?v=6.2"></script><script defer src="assets/main.js?v=6.2"></script>
<script type="application/ld+json">{json.dumps(org,ensure_ascii=False).replace('</','<\\/')}</script>
</head>'''

def header(k,l):
 fa=l=='fa'; other='en' if fa else 'fa'
 nav=[('services','خدمات' if fa else 'Services'),('approach','روش ما' if fa else 'Our method'),('about','درباره ما' if fa else 'About')]
 links=''.join(link(n,l,s,'nav-link'+(' current' if k==n else ''), 'aria-current="page"' if k==n else '') for n,s in nav)
 language=link(k,other,'EN' if fa else 'فارسی','language-link',f'hreflang="{other}" lang="{other}" aria-label="'+('Switch to English' if fa else 'Change to Persian')+'"')
 return f'''<body class="{'is-rtl' if fa else 'is-ltr'}">
<a class="skip-link" href="#main">{'پرش به محتوا' if fa else 'Skip to content'}</a>
<header class="site-header"><div class="container header-inner">
<a class="brand" href="{file_for('home',l)}" aria-label="Vellum House — {'خانه' if fa else 'home'}"><span class="brand-emblem" aria-hidden="true">VH<span class="brand-dot">.</span></span><span class="brand-copy"><strong>VELLUM HOUSE</strong><small>{'راهبری اختصاصی تحصیل' if fa else 'PERSONALISED ACADEMIC GUIDANCE'}</small></span></a>
<nav class="desktop-links" aria-label="{'فهرست اصلی' if fa else 'Main navigation'}">{links}</nav>
<div class="header-actions">{language}{cta(l,'button button-header')}</div>
<button type="button" id="menu" class="nav-toggle" aria-label="{'باز کردن فهرست' if fa else 'Open menu'}" aria-controls="navigation" aria-expanded="false"><span></span><span></span><span></span></button>
</div>
<nav id="navigation" class="mobile-nav" aria-label="{'فهرست موبایل' if fa else 'Mobile navigation'}" hidden>{links}{language}{cta(l,'button button-primary')}</nav>
</header>'''

def footer(l):
 fa=l=='fa'
 footlinks=' · '.join([link(k,l,name) for k,name in [('services','خدمات' if fa else 'Services'),('approach','روش ما' if fa else 'Our method'),('pathways','مسیرها' if fa else 'Pathways'),('journal','راهنماها' if fa else 'Resources'),('privacy','حریم خصوصی' if fa else 'Privacy'),('terms','شرایط همکاری' if fa else 'Terms')]])
 return f'''<footer class="site-footer"><div class="container footer-top"><div><span class="footer-logo">VELLUM HOUSE<span>.</span></span><p>{'هر استعداد، مسیر خودش را دارد.' if fa else 'Every student deserves their own way forward.'}</p></div><div class="footer-contact"><a href="mailto:vellumhouse.edu@gmail.com" dir="ltr">vellumhouse.edu@gmail.com</a>{cta(l,'footer-consult')}</div></div><div class="container footer-bottom"><nav aria-label="{'پیوندهای پایین صفحه' if fa else 'Footer links'}">{footlinks}</nav><small>© 2026 Vellum House</small></div></footer>
<button id="back-to-top" type="button" aria-label="{'بازگشت به بالا' if fa else 'Back to top'}">↑</button>
</body></html>'''

def wrap(k,l,body):return head(k,l)+header(k,l)+'<main id="main">'+body+'</main>'+footer(l)
def section_intro(l,title,desc=None,kicker=None):
 return f'<div class="section-head">{tag(kicker or ("WHAT MATTERS" if l=="en" else "آنچه مهم است"))}<h2>{esc(title)}</h2>'+ (f'<p>{esc(desc)}</p>' if desc else '')+'</div>'
def lead(l,title,description,kicker=None):
 return f'<section class="page-intro"><div class="container page-intro-inner">{tag(kicker or ("VELLUM HOUSE" if l=="en" else "ولوم هاوس"))}<h1>{esc(title)}</h1><p>{esc(description)}</p></div></section>'
def closing(l):
 fa=l=='fa'
 return f'<section class="end-cta"><div class="container end-cta-inner"><div>{tag("YOUR NEXT STEP" if not fa else "گام بعدی")}<h2>{"بیایید مسیر مناسب را پیدا کنیم." if fa else "A clearer path starts here."}</h2><p>{"جلسه اول، ۳۰ دقیقه، آنلاین و بدون هزینه است." if fa else "Start with a free, 30-minute online consultation."}</p></div>{cta(l)}</div></section>'

def home(l):
 fa=l=='fa'
 if fa:
  h1='استعداد را می‌شناسیم.<br><span>مسیر را می‌سازیم.</span>'
  sub='ولوم هاوس با شناخت توانمندی‌ها و هدف‌های هر دانش‌آموز، آموزش، منتورینگ و برنامه‌ریزی تحصیلی او را در یک مسیر اختصاصی هماهنگ و پیگیری می‌کند.'
  note='برای خانواده‌هایی که رشد هدفمند می‌خواهند، نه فقط کلاس بیشتر.'
  pair=[('کجا هستیم؟','شناخت استعدادها، سطح فعلی و نیازها'),('به کجا می‌رویم؟','هدف‌گذاری و ساختن مسیر شخصی')]
  themes=[('01','آموزش هدفمند','کلاس‌هایی متناسب با نیاز واقعی.'),('02','منتورینگ و پیگیری','هدف روشن، گزارش پیشرفت، اصلاح مسیر.'),('03','پرورش استعداد','پروژه‌ها و فرصت‌های مناسب هر فرد.'),('04','آینده دانشگاهی','انتخاب مسیر و آمادگی برای پذیرش.')]
  steps=[('01','می‌شناسیم','توانمندی‌ها، علایق و نیازها'),('02','طراحی می‌کنیم','هدف و نقشه راه اختصاصی'),('03','همراهی می‌کنیم','اجرا، سنجش و اصلاح مسیر')]
 else:
  h1='See their potential.<br><span>Shape their path.</span>'
  sub='We understand each student’s strengths and goals, then bring teaching, mentoring and academic planning together in one personalised, closely guided journey.'
  note='For families who want meaningful progress—not simply more classes.'
  pair=[('POINT A','Where they are today'),('POINT B','Where they could go next')]
  themes=[('01','Purposeful learning','Teaching shaped around real needs.'),('02','Mentoring & progress','Clear goals, thoughtful follow-through.'),('03','Talent development','Projects and opportunities that fit.'),('04','University direction','Planning for informed next steps.')]
  steps=[('01','Discover','Strengths, interests and needs'),('02','Design','A personal goal and roadmap'),('03','Guide','Coordinate, track and adapt')]
 cards=''.join(f'<article class="value-card"><span>{num}</span><h3>{name}</h3><p>{txt}</p></article>' for num,name,txt in themes)
 process=''.join(f'<article class="step"><span class="step-no">{num}</span><h3>{name}</h3><p>{desc}</p></article>' for num,name,desc in steps)
 diagram=''.join(f'<div class="journey-point"><span>{esc(a)}</span><strong>{esc(b)}</strong></div>' for a,b in pair)
 return f'''<section class="hero"><div class="container hero-grid"><div class="hero-copy">{tag("PERSONALISED ACADEMIC GUIDANCE" if not fa else "مدیریت اختصاصی مسیر تحصیلی")}
<h1>{h1}</h1><p class="hero-description">{esc(sub)}</p><div class="hero-buttons">{cta(l)}{link('services',l,'آشنایی با خدمات' if fa else 'Explore our services','text-link')}</div><p class="hero-note">{esc(note)}</p></div>
<div class="hero-visual" aria-label="{'مسیر از شناخت وضعیت امروز تا ساختن آینده' if fa else 'From understanding today to shaping tomorrow'}"><div class="visual-title">{'YOUR ROADMAP' if not fa else 'نقشه راه شما'}<span>VELLUM HOUSE / 01</span></div><div class="journey-line" aria-hidden="true"><span class="line-spark"></span></div><div class="journey-points">{diagram}</div><div class="visual-foot">{'A PERSONAL JOURNEY, PURPOSEFULLY GUIDED' if not fa else 'مسیری شخصی، با همراهی هدفمند'}</div></div></div></section>
<section class="proof-strip"><div class="container proof-inner"><span>{'از شناخت تا پیشرفت' if fa else 'From insight to progress'}</span><span>{'برنامه شخصی، نه نسخه یکسان' if fa else 'Individual, never one-size-fits-all'}</span><span>{'مدیریت جامع یا خدمات مستقل' if fa else 'Complete support or individual services'}</span></div></section>
<section class="section value-section"><div class="container">{section_intro(l,'همه بخش‌های مسیر، هماهنگ با یک هدف.' if fa else 'The right pieces. One clear direction.',None,'چه کار می‌کنیم؟' if fa else 'WHAT WE DO')}<div class="values-grid">{cards}</div><div class="section-tail">{link('services',l,'مشاهده همه خدمات' if fa else 'View all services','text-link')}</div></div></section>
<section class="section journey-section"><div class="container"><div class="journey-section-grid"><div>{section_intro(l,'از نقطه شروع تا مقصد، کنار شما.' if fa else 'From where they are to what comes next.','سه گام روشن؛ متناسب با شرایط هر دانش‌آموز.' if fa else 'Three simple stages, tailored to every student.','روش ما' if fa else 'THE VELLUM METHOD')}{link('approach',l,'بیشتر درباره روش ما' if fa else 'See our approach','text-link')}</div><div class="steps">{process}</div></div></div></section>
{closing(l)}'''

def services(l):
 fa=l=='fa'; title='آنچه نیاز دارید. نه بیشتر.' if fa else 'What you need. Nothing extra.'
 sub='همراهی جامع یا یک خدمت مشخص؛ هر پیشنهاد بر اساس هدف شما تنظیم می‌شود.' if fa else 'Choose complete academic management or individual services. Every recommendation starts with your needs.'
 items=([('مدیریت اختصاصی مسیر','طراحی و هماهنگی برنامه تحصیلی، کلاس‌ها و پیگیری پیشرفت.'),('کلاس‌های تخصصی','آموزش شخصی و آمادگی آزمون، متناسب با پایه و برنامه آموزشی.'),('منتورینگ و گزارش پیشرفت','هدف‌گذاری، بررسی موانع و گزارش‌های قابل استفاده برای خانواده.'),('شناخت و پرورش استعداد','پروژه‌های علمی و فعالیت‌های متناسب با علاقه و توانمندی.'),('مسابقات و فرصت‌های علمی','شناسایی فرصت‌های مناسب و برنامه‌ریزی برای آمادگی و شرکت.'),('راهبرد پذیرش دانشگاه','انتخاب دانشگاه، برنامه‌ریزی مدارک، آزمون‌ها و مهلت‌های درخواست.')]
 if fa else [('Personal academic management','A coordinated roadmap connecting teaching, planning and follow-through.'),('Specialist classes','Personalised lessons and exam preparation for each study level.'),('Mentoring & progress reports','Goal setting, regular reviews and clear family updates.'),('Talent & project development','Meaningful academic projects matched to individual strengths.'),('Competitions & opportunities','Identify suitable academic challenges and plan preparation.'),('University admissions planning','University fit, application milestones, requirements and preparation.')])
 cards=''.join(f'<article class="service-item"><span>{i:02d}</span><div><h2>{esc(a)}</h2><p>{esc(b)}</p></div></article>' for i,(a,b) in enumerate(items,1))
 return lead(l,title,sub,'خدمات' if fa else 'OUR SERVICES')+f'<section class="section"><div class="container"><div class="services-list">{cards}</div><div class="service-note"><strong>{"دو مدل همکاری" if fa else "Two ways to work together"}</strong><p>{"مدیریت جامع مسیر یا انتخاب فقط خدمات موردنیاز؛ هزینه پس از بررسی نیازها مشخص می‌شود." if fa else "Choose a full academic plan or only the support you need. Pricing follows an agreed scope."}</p></div></div></section>'+closing(l)

def approach(l):
 fa=l=='fa'
 items=([('شناخت','بررسی علایق، استعدادها، سوابق آموزشی و چالش‌های فعلی.'),('طراحی مسیر','تعیین هدف‌های واقع‌بینانه و بلندپروازانه، اولویت‌ها و برنامه شخصی.'),('اجرا و بازبینی','هماهنگی آموزش و فعالیت‌ها، بررسی پیشرفت و به‌روزکردن برنامه.')]
 if fa else [('Understand','Explore interests, strengths, learning history and current challenges.'),('Build the plan','Agree meaningful goals, priorities and an individual roadmap.'),('Guide & adapt','Coordinate support, review progress and adjust as needed.')])
 parts=''.join(f'<article class="method-card"><span>0{i}</span><h2>{esc(a)}</h2><p>{esc(b)}</p></article>' for i,(a,b) in enumerate(items,1))
 return lead(l,'اول شناخت. بعد برنامه.' if fa else 'First, understand. Then, plan.','هر دانش‌آموز نقطه شروع و مقصد متفاوتی دارد. برنامه باید با او تغییر کند.' if fa else 'Every student begins somewhere different. A good plan moves with them.','روش کار ما' if fa else 'OUR APPROACH')+f'<section class="section"><div class="container"><div class="method-grid">{parts}</div><div class="service-note"><strong>{"خانواده چه چیزی می‌بیند؟" if fa else "What families can expect"}</strong><p>{"محدوده خدمات روشن، هدف‌های مشخص و گزارش‌های پیشرفت در بازه‌های توافق‌شده؛ بدون وعده نتیجه تضمینی." if fa else "An agreed scope, clear priorities and regular progress reviews—without promises of guaranteed results."}</p></div></div></section>'+closing(l)

def pathways(l):
 fa=l=='fa'
 items=([('دبستان و سال‌های پایه','کشف علایق، تقویت درس‌های اصلی و ساختن عادت‌های یادگیری.'),('دبیرستان و آمادگی دانشگاه','آموزش، برنامه آزمون، پروژه‌ها و تصمیم‌گیری برای آینده تحصیلی.'),('دانشگاه و ادامه تحصیل','پیدا کردن فرصت‌های علمی و برنامه‌ریزی برای گام تحصیلی بعدی.')]
 if fa else [('Primary years','Explore interests, strengthen core learning and build lasting habits.'),('Secondary school & university readiness','Teaching, exam planning, projects and confident next-step decisions.'),('University & beyond','Identify academic opportunities and plan the next stage of study.')])
 cards=''.join(f'<article class="pathway-card"><span>0{i}</span><h2>{esc(a)}</h2><p>{esc(b)}</p></article>' for i,(a,b) in enumerate(items,1))
 return lead(l,'هر مرحله، نیازهای خودش را دارد.' if fa else 'Every stage deserves its own plan.','از سال‌های پایه تا ورود به دانشگاه و پس از آن، همراهی متناسب با مرحله زندگی شما.' if fa else 'From early learning to university and beyond, support changes with the student.','برای چه کسانی؟' if fa else 'WHO WE HELP')+f'<section class="section"><div class="container pathways-grid">{cards}</div></section>'+closing(l)

def about(l):
 fa=l=='fa'
 values=[('ریحانه وجودی','کارشناسی ارشد گرانش و کیهان‌شناسی؛ مدرس و پژوهشگر فیزیک با تجربه آموزش و هدایت علمی.'),('کسری پهلوانی','کارشناسی ارشد مهندسی مخابرات؛ از بنیان‌گذاران ولوم هاوس.')]
 if not fa:values=[('Reyhaneh Vojoudi','MSc in Gravity and Cosmology; physics educator and researcher with academic teaching experience.'),('Kasra Pahlavani','MSc in Telecommunications Engineering; co-founder of Vellum House.')]
 team=''.join(f'<article class="team-card"><div class="team-initial" aria-hidden="true">{("R" if i==0 else "K")}</div><div><h2>{esc(n)}</h2><p>{esc(b)}</p></div></article>' for i,(n,b) in enumerate(values))
 return lead(l,'هر آینده‌ای، مسیر مخصوص خودش را دارد.' if fa else 'Every future deserves an individual path.','ولوم هاوس برای پیوند دادن آموزش، شناخت استعداد و تصمیم‌گیری تحصیلی شکل گرفته است.' if fa else 'Vellum House connects individual potential, purposeful teaching and informed academic decisions.','درباره ولوم هاوس' if fa else 'ABOUT US')+f'<section class="section"><div class="container about-layout"><div><span class="section-tag">{"نگاه ما" if fa else "OUR BELIEF"}</span><h2>{"دانش‌آموز، نقطه شروع هر تصمیم است." if fa else "Start with the student."}</h2><p>{"به‌جای نسخه‌های آماده، تلاش می‌کنیم آموزش، راهنمایی و فرصت‌های مناسب هر فرد را در یک برنامه منسجم کنار هم قرار دهیم." if fa else "Rather than using the same template for everyone, we connect the right teaching, guidance and opportunities in one thoughtful plan."}</p></div><div class="team-wrap"><span class="section-tag">{"بنیان‌گذاران" if fa else "FOUNDERS"}</span>{team}</div></div></section>'+closing(l)

def journal(l):
 fa=l=='fa'
 return lead(l,'راهنماهای کوتاه، تصمیم‌های روشن.' if fa else 'Less noise. Better decisions.','برای شروع، همین چند نکته کافی است.' if fa else 'A few useful starting points before we talk.','راهنماها و منابع' if fa else 'RESOURCES')+f'''<section class="section"><div class="container resource-grid"><article><span class="section-tag">01</span><h2>{"پیش از جلسه مشاوره" if fa else "Before your consultation"}</h2><p>{"سه چیز را یادداشت کنید: مهم‌ترین دغدغه، هدفی که در ذهن دارید و نزدیک‌ترین تصمیم تحصیلی." if fa else "Note three things: your main concern, what success would look like and the next decision ahead."}</p>{cta(l,'text-link')}</article><article><span class="section-tag">02</span><h2>{"آشنایی با خدمات" if fa else "Explore our services"}</h2><p>{"می‌توانید مدیریت کامل مسیر یا فقط کلاس و منتورینگ موردنیاز را انتخاب کنید." if fa else "Choose full academic management or just the classes or mentoring that fit."}</p>{link('services',l,'مشاهده خدمات' if fa else 'View services','text-link')}</article></div></section>'''+closing(l)

def contact(l):
 fa=l=='fa'; intro=lead(l,'از یک گفت‌وگوی درست شروع کنیم.' if fa else 'Start with a thoughtful conversation.','فرم کوتاه را تکمیل کنید؛ پس از ثبت موفق، به صفحه انتخاب زمان جلسه آنلاین ۳۰ دقیقه‌ای منتقل می‌شوید.' if fa else 'Tell us a little about your goals. Once your enquiry is saved, choose a time for your free 30-minute online consultation.','مشاوره رایگان اولیه' if fa else 'FREE INITIAL CONSULTATION')
 def field(fid,name,typ='text',extra='',placeholder=''):
  return f'<div class="field"><label for="{fid}">{name}</label><input id="{fid}" name="{fid}" type="{typ}" {extra} placeholder="{esc(placeholder,quote=True)}"></div>'
 fields=field('fullName','نام والد / متقاضی *' if fa else 'Parent / applicant name *','text','autocomplete="name" maxlength="120" required')+field('email','ایمیل *' if fa else 'Email address *','email','autocomplete="email" maxlength="200" dir="ltr" required')
 optional=field('phone','شماره تماس (اختیاری)' if fa else 'Phone (optional)','tel','autocomplete="tel" maxlength="40" dir="ltr"','+98 …')+field('grade','پایه یا مقطع تحصیلی (اختیاری)' if fa else 'Grade / study level (optional)','text','maxlength="100" autocomplete="off"','مثلاً پایه دهم' if fa else 'e.g. Grade 10')
 options=[('full','مدیریت جامع مسیر تحصیلی' if fa else 'Complete academic management'),('classes','کلاس و آمادگی آزمون' if fa else 'Classes & exam preparation'),('mentoring','منتورینگ و پیگیری پیشرفت' if fa else 'Mentoring & progress tracking'),('talent','استعداد، پروژه و مسابقه' if fa else 'Talent, projects & competitions'),('university','پذیرش دانشگاه' if fa else 'University admissions'),('other','هنوز مطمئن نیستم' if fa else 'Not sure yet')]
 opts=''.join(f'<option value="{code}">{name}</option>' for code,name in options)
 form=f'''<form id="enquiry-form" method="post" action="" novalidate>
<div class="form-grid">{fields}</div><div class="form-grid">{optional}</div>
<div class="field"><label for="serviceInterest">{'به چه خدماتی نیاز دارید؟ *' if fa else 'What support are you looking for? *'}</label><select id="serviceInterest" name="serviceInterest" required><option value="" disabled selected>{'انتخاب کنید' if fa else 'Choose an area'}</option>{opts}</select></div>
<div class="field"><label for="message">{'توضیح کوتاه (اختیاری)' if fa else 'Your goal or question (optional)'}</label><textarea name="message" id="message" rows="3" maxlength="2000" placeholder="{'یک یا دو جمله کافی است.' if fa else 'One or two sentences are enough.'}"></textarea></div>
<div class="honeypot" aria-hidden="true"><label for="website">Do not fill</label><input id="website" name="website" tabindex="-1" autocomplete="off"></div>
<label class="consent"><input type="checkbox" name="consent" value="yes" required><span>{'با استفاده از اطلاعاتم برای پاسخ به درخواست موافقم و ' if fa else 'I agree to be contacted about this request and have read the '}{link('privacy',l,'اطلاعیه حریم خصوصی' if fa else 'privacy notice','inline-link')}{' را خوانده‌ام.' if fa else '.'}</span></label>
<button class="button button-primary form-submit" type="submit">{'ثبت درخواست و انتخاب زمان' if fa else 'Submit enquiry & choose a time'}<span aria-hidden="true">↗</span></button>
<p class="form-disclaimer">{'جلسه تنها پس از انتخاب زمان در تقویم رزرو می‌شود.' if fa else 'Your meeting is reserved only when you select a time in the calendar.'}</p>
<div id="form-status" role="status" tabindex="-1" aria-live="polite"></div>
<div id="booking-fallback" class="booking-fallback" hidden><p>{'درخواست ثبت شد. اگر تقویم باز نشد:' if fa else 'Your enquiry is saved. If the calendar did not open:'}</p><a id="booking-link" href="{BOOKING}" class="button button-outline" rel="noopener noreferrer">{'انتخاب زمان جلسه' if fa else 'Open booking calendar'}</a></div>
<noscript><p class="form-error">{'برای ارسال امن درخواست، جاوااسکریپت باید فعال باشد. در غیر این صورت به نشانی ایمیل مجموعه پیام دهید.' if fa else 'JavaScript is required to submit this form. Alternatively, email our team.'}</p></noscript></form>'''
 faqdata=([('آیا جلسه رایگان است؟','بله، جلسه اولیه آنلاین ۳۰ دقیقه‌ای رایگان است. خدمات بعدی، در صورت نیاز، جداگانه پیشنهاد می‌شوند.'),('آیا والدین باید حاضر باشند؟','برای دانش‌آموز زیر ۱۸ سال، حضور خود دانش‌آموز و حداقل یکی از والدین یا سرپرست ضروری است.'),('هزینه خدمات چقدر است؟','پس از شناخت نیازها و مشخص شدن نوع همکاری اعلام می‌شود.')]
 if fa else [('Is the first call free?','Yes. The first online conversation is free and lasts 30 minutes.'),('Should a parent attend?','For students under 18, the student and at least one parent or guardian must attend.'),('How much does ongoing support cost?','We share fees once we understand your needs and agree the scope.')])
 return intro+f'''<section class="section consultation"><div class="container consult-grid"><div class="consult-side">{tag('FIRST, A CONVERSATION' if not fa else 'گام نخست')}<h2>{'۳۰ دقیقه برای روشن شدن گام بعدی.' if fa else '30 minutes to see the next step.'}</h2><p>{'درباره وضعیت فعلی، هدف‌ها و دغدغه‌ها گفت‌وگو می‌کنیم تا ببینیم چه نوع همراهی مناسب است.' if fa else 'We talk about where you are, where you want to go and what support might be right.'}</p><ul class="consult-points"><li>{'آنلاین و بدون هزینه' if fa else 'Free, online and 30 minutes'}</li><li>{'برای زیر ۱۸ سال: حضور دانش‌آموز و یکی از والدین یا سرپرست' if fa else 'Under 18: student and a parent/guardian attend'}</li><li>{'بدون تعهد به خرید خدمات' if fa else 'No obligation to purchase services'}</li></ul></div><div class="form-panel"><div class="form-head"><span class="section-tag">{'فرم کوتاه' if fa else 'SHORT ENQUIRY'}</span><h2>{'کمی درباره خودتان بگویید.' if fa else 'Tell us a little about you.'}</h2><p>{'فقط فیلدهای ستاره‌دار ضروری‌اند.' if fa else 'Only starred fields are required.'}</p></div>{form}</div></div></section><section class="section faq-band"><div class="container faq-layout"><h2>{'چند پاسخ کوتاه' if fa else 'A few quick answers'}</h2><div class="faq-items">{details(faqdata)}</div></div></section>'''

def policy(l,which):
 fa=l=='fa'
 if which=='privacy':
  title='حریم خصوصی، روشن و شفاف.' if fa else 'Your privacy matters.'
  summary='هنگام درخواست جلسه چه اطلاعاتی دریافت می‌کنیم؟' if fa else 'What happens to the information you send?'
  points=([('اطلاعاتی که می‌گیریم','نام و ایمیل، و در صورت تمایل شماره تماس، مقطع تحصیلی، زمینه موردنیاز و پیام شما؛ همچنین زمان و شناسه درخواست. لطفاً مدارک هویتی یا اطلاعات حساس را در فرم وارد نکنید.'),('ذخیره و پردازش','درخواست در یک Google Sheet خصوصی نگهداری می‌شود؛ اعلان به ایمیل رسمی ولوم هاوس و تأیید دریافت برای شما ارسال می‌شود. رزرو جلسه در Cal.com انجام می‌شود و Google و Cal.com مطابق شرایط خود اطلاعات مربوط را پردازش می‌کنند.'),('هدف و مدت نگهداری','اطلاعات برای پاسخ به درخواست و هماهنگی خدمات به کار می‌رود؛ ارسال فرم به معنای عضویت در پیام‌های تبلیغاتی نیست. اطلاعات تا زمان نیاز برای پیگیری یا انجام تعهدات نگهداری می‌شود.'),('دسترسی یا حذف','برای درخواست بررسی، اصلاح یا حذف اطلاعات با vellumhouse.edu@gmail.com تماس بگیرید؛ رسیدگی با رعایت تعهدات قانونی انجام می‌شود.'),('دانش‌آموزان زیر ۱۸ سال','فرم را والد یا سرپرست ارسال کند؛ در گام نخست فقط اطلاعات ضروری درخواست می‌شود.')]
  if not fa else [('What we collect','Your name and email; optionally phone, study level, support interest and message; along with submission time and a request ID. Please do not enter sensitive identification or health information.'),('Where it goes','Enquiries are stored in a private Google Sheet, the team receives an email notification and you receive an acknowledgement. Booking takes place through Cal.com; Google and Cal.com process relevant information under their policies.'),('Purpose & retention','Information is used to handle your enquiry and arrange appropriate support—not to subscribe you to marketing. Records are retained as needed for your enquiry or agreed services, subject to applicable obligations.'),('Your choices','Email vellumhouse.edu@gmail.com to request access, corrections or deletion, subject to applicable legal duties.'),('Minors','A parent or guardian should submit the form on behalf of a student under 18.')])
 else:
  title='چارچوب روشن، همکاری بهتر.' if fa else 'Clear expectations, better partnerships.'
  summary='پیش از هر همکاری، خدمات و هزینه‌ها را مشخص می‌کنیم.' if fa else 'Service scope and pricing are agreed before paid work begins.'
  points=([('جلسه مشاوره رایگان اولیه','جلسه آنلاین ۳۰ دقیقه‌ای رایگان است. ارسال فرم به‌تنهایی به معنی رزرو زمان یا شروع قرارداد نیست.'),('خدمات اختصاصی','کلاس‌ها، منتورینگ و مدیریت مسیر متناسب با نیاز دانش‌آموز تعریف و توافق می‌شوند.'),('هزینه و لغو','هزینه، پرداخت، تغییر زمان و شرایط لغو یا استرداد پیش از شروع خدمات پولی به‌صورت روشن توافق می‌شوند.'),('نتایج','نمره، پذیرش دانشگاه یا بورسیه تضمین نمی‌شود؛ تعهد مجموعه مربوط به خدمات توافق‌شده است.'),('مشارکت خانواده','برای دانش‌آموزان زیر ۱۸ سال، مشارکت و رضایت والد یا سرپرست ضروری است.')]
 if fa else [('Free initial consultation','The free online meeting lasts 30 minutes. An enquiry alone does not reserve a time or start a paid engagement.'),('Personalised services','Teaching, mentoring and academic management are scoped to the student’s needs.'),('Fees & cancellation','Payment, rescheduling, cancellation and refund terms are agreed before paid services begin.'),('Outcomes','We do not guarantee grades, admissions or scholarships. Our responsibility covers the agreed deliverables.'),('Family participation','Parent or guardian participation and consent are essential for students under 18.')])
 rows=''.join(f'<article><h2>{esc(a)}</h2><p>{esc(b)}</p></article>' for a,b in points)
 return lead(l,title,summary,'حریم خصوصی' if fa and which=='privacy' else 'شرایط همکاری' if fa else 'PRIVACY' if which=='privacy' else 'TERMS')+f'<section class="section"><div class="container policy-list">{rows}</div></section>'

BUILD={'home':home,'services':services,'approach':approach,'pathways':pathways,'about':about,'journal':journal,'contact':contact,'privacy':lambda l:policy(l,'privacy'),'terms':lambda l:policy(l,'terms')}
for lang in ('fa','en'):
 for key in PAGES:
  (ROOT/file_for(key,lang)).write_text(wrap(key,lang,BUILD[key](lang)),encoding='utf-8')
(ROOT/'fa.html').write_text((ROOT/'index.html').read_text(encoding='utf-8'),encoding='utf-8')
(ROOT/'404.html').write_text('''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | Vellum House</title><link rel="stylesheet" href="assets/style.css?v=6.2"></head><body><main class="not-found"><h1>Page not found.</h1><p>صفحه مورد نظر پیدا نشد.</p><a class="button button-primary" href="index.html">فارسی</a> <a class="button button-outline" href="en.html">English</a></main></body></html>''',encoding='utf-8')
urls=[DOMAIN if k=='home' and lang=='fa' else DOMAIN+file_for(k,lang) for lang in ('fa','en') for k in PAGES]
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('<url><loc>'+esc(url)+'</loc></url>\n' for url in urls)+'</urlset>',encoding='utf-8')
(ROOT/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: https://vhouse.ir/sitemap.xml\n',encoding='utf-8')
(ROOT/'CNAME').write_text('vhouse.ir\n',encoding='utf-8')
print('Built 20 HTML files, sitemap, robots.txt and CNAME')

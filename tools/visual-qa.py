"""Owner-run browser evidence. Start python -m http.server 8765 first.
Install playwright and browser (python -m pip install playwright; python -m playwright install chromium).
All nonlocal network requests are blocked; calendar data is a clearly labelled mocked fixture.
No real submissions or private data. Screenshots and JSON in qa-output/ (do not upload to GitHub).
"""
from pathlib import Path
import json,os,time
from playwright.sync_api import sync_playwright
BASE=os.getenv('VH_QA_URL','http://127.0.0.1:8765').rstrip('/')
OUT=Path('qa-output');OUT.mkdir(exist_ok=True)
SIZES=[(320,568),(360,640),(390,844),(430,932),(768,1024),(1024,768),(1280,720),(1440,900),(1920,1080)]
KEY='11111111-1111-4111-8111-111111111111'
results=[]
with sync_playwright() as p:
    opts={'headless':True};exe=os.getenv('VH_CHROMIUM');
    if exe:opts['executable_path']=exe
    b=p.chromium.launch(**opts)
    for lang,entry in [('fa','index.html'),('en','en.html')]:
        for w,h in SIZES:
            c=b.new_context(viewport={'width':w,'height':h},reduced_motion='reduce');pg=c.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
            def intercept(r):
                if r.request.url.startswith(BASE+'/'):r.continue_();return
                if r.request.url.startswith('https://script.google.com/macros/'):
                    now=int(time.time()*1000);slots=[now+3*86400000,now+3*86400000+3600000,now+4*86400000]
                    r.fulfill(status=200,content_type='application/json',headers={'Access-Control-Allow-Origin':'*'},body=json.dumps({'ok':True,'version':11,'slots':slots,'min':now+2*86400000,'max':now+14*86400000,'duration':45,'interval':60}));return
                r.abort()
            c.route('**/*',intercept)
            for route in ('intro','journey','founders','contact','consult','calendar/'+KEY,'intro-menu','intro-dialog'):
                name=route.split('/')[0];state=route if not route.startswith('calendar/') else 'calendar-MOCK';record={'lang':lang,'viewport':f'{w}x{h}','state':state}
                try:
                    pg.goto(BASE+'/'+entry+'#'+('intro' if route.startswith('intro-') else route),wait_until='domcontentloaded',timeout=10000);pg.evaluate('document.fonts.ready');pg.wait_for_timeout(300)
                    if route=='intro-menu':pg.locator('.menu-toggle').click()
                    if route=='intro-dialog':pg.locator('#language-control').click()
                    if route=='journey':
                        assert pg.locator('[data-stage]').count()==6
                        for stage in range(6):
                            pg.locator(f'[data-stage="{stage}"]').click();assert pg.locator(f'[data-stage-copy="{stage}"]').is_visible()
                            error=pg.evaluate("""(stage)=>{const svg=[...document.querySelectorAll('.royal-route')].find(s=>getComputedStyle(s).display!=='none'), light=svg.querySelector('.route-light'),pt=new DOMPoint(+light.getAttribute('cx'),+light.getAttribute('cy')).matrixTransform(svg.getScreenCTM()),n=document.querySelector('[data-stage="'+stage+'"] i').getBoundingClientRect();return Math.hypot(pt.x-n.x-n.width/2,pt.y-n.y-n.height/2)}""",stage)
                            assert error<=1.5,f'Milestone {stage+1}: {error:.2f}px error'
                        pg.locator('[data-stage="2"]').click()
                    if route=='founders':
                        assert pg.locator('.portrait-toggle').count()==2
                        a,b=[e.bounding_box() for e in pg.locator('.portrait-toggle').all()];assert abs(a['y']-b['y'])<2
                        pg.locator('.portrait-toggle').first.focus();pg.keyboard.press('Enter');assert pg.locator('.founder-overlay').first.is_visible();pg.keyboard.press('Escape');assert not pg.locator('.founder-overlay').first.is_visible()
                    if route=='consult':
                        form=pg.locator('#enquiry-form');assert form.is_visible();assert form.locator('[name="fullName"]').is_visible();assert form.locator('[name="serviceInterest"]').is_visible();assert form.locator('[type="submit"]').is_visible();assert not pg.locator('.form-navigation').count()
                    record.update(pg.evaluate('''()=>{const m=document.querySelector('main');return {scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,mainWidth:m?.clientWidth,mainScrollWidth:m?.scrollWidth,mainHeight:m?.clientHeight,mainScrollHeight:m?.scrollHeight,loadedFonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family)}}'''))
                    pg.screenshot(path=str(OUT/f'{lang}-{w}x{h}-{state}.png'));record['status']='measured';record['errors']=errors[:];record['mainOverflowPx']=max(0,record['mainScrollHeight']-record['mainHeight']);record['cinematicFit']=record['mainOverflowPx']<=2 if route in ('intro','journey','founders','contact') else None
                except Exception as e:record['status']='blocked/error';record['detail']=str(e).splitlines()[0]
                results.append(record)
            c.close()
    b.close()
(OUT/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2));print('Measured:',sum(r['status']=='measured' for r in results),'/',len(results));print('Calendar screenshots are MOCK data; not proof of live availability.')

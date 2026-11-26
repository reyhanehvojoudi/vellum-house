"""Run against a local static server: python -m http.server 8765
Then python tools/visual-qa.py (install playwright + its browser if necessary).
Only synthetic form inputs, no real bookings or submissions. Writes CSV and screenshots.
"""
import csv, os, json
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('VH_QA_URL','http://127.0.0.1:8765').rstrip('/')
OUT=Path('qa-output');OUT.mkdir(exist_ok=True)
SIZES=[(320,568),(360,640),(390,844),(430,932),(844,390),(640,360),(768,1024),(1024,768),(1280,720),(1366,768),(1440,900),(1920,1080),(2560,1440)]
ROUTES=['intro','journey','founders','consult','contact','calendar','privacy','dialog','menu','form-errors','404']
JS='''()=>{const root=document.documentElement,m=document.querySelector('main'),h=document.querySelector('.hero h1');return {scrollHeight:root.scrollHeight,innerHeight,scrollWidth:root.scrollWidth,innerWidth,stageHeight:m?.clientHeight,stageScrollHeight:m?.scrollHeight,hits:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&(r.right>innerWidth+1||r.left< -1)}).map(e=>e.tagName+'.'+String(e.className)).slice(0,60),fontFamily:h?getComputedStyle(h).fontFamily:'',fontColor:h?getComputedStyle(h).color:'',fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight)}}'''
results=[]
with sync_playwright() as p:
    opts={'headless':True};exe=os.getenv('VH_CHROMIUM');
    if exe:opts['executable_path']=exe
    browser=p.chromium.launch(**opts)
    for run in (1,2):
        for lang,entry in [('fa','index.html'),('en','en.html')]:
            for w,h in SIZES:
                ctx=browser.new_context(viewport={'width':w,'height':h},reduced_motion='reduce');page=ctx.new_page()
                for state in ROUTES:
                    route={'dialog':'intro','menu':'intro','form-errors':'consult'}.get(state,state)
                    record=dict(run=run,lang=lang,viewport=f'{w}x{h}',state=state)
                    try:
                        page.goto(BASE+'/'+('404.html' if state=='404' else entry+'#'+route),wait_until='domcontentloaded',timeout=8000);page.evaluate('document.fonts.ready');page.wait_for_timeout(200)
                        if state=='dialog':page.locator('.footer-lang').click()
                        if state=='menu':
                            if not page.locator('.menu-toggle').is_visible():continue
                            page.locator('.menu-toggle').click()
                        if state=='form-errors':
                            if page.locator('.form-navigation').is_visible():page.locator('.form-navigation .btn.solid').click();page.locator('.form-navigation .btn.solid').click()
                            else:page.locator('#submit-enquiry').click()
                        record.update(page.evaluate(JS));record['fit']=record['scrollHeight']<=record['innerHeight'] and record['scrollWidth']<=record['innerWidth'] and (record['stageScrollHeight'] or 0)<=(record['stageHeight'] or 0)+1;record['status']='measured'
                        page.screenshot(path=str(OUT/f'{run}-{lang}-{w}x{h}-{state}.png'))
                    except Exception as e:record['status']='blocked/error: '+str(e).splitlines()[0]
                    results.append(record)
                ctx.close()
    # Motion recordings of forward/back using native CSS animation, not reduced-motion mode.
    for lang,entry in [('fa','index.html'),('en','en.html')]:
        ctx=browser.new_context(viewport={'width':1440,'height':900},record_video_dir=str(OUT/'motion'));page=ctx.new_page()
        try:
            page.goto(BASE+'/'+entry+'#intro');page.wait_for_timeout(300);page.locator('.hero-foot .explore').click();page.wait_for_timeout(1000);page.locator('.journey-back').click();page.wait_for_timeout(1000)
        except Exception as e:print('Motion error',e)
        ctx.close()
    browser.close()
(OUT/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
keys=sorted({k for r in results for k in r});
with (OUT/'one-screen.csv').open('w',newline='',encoding='utf-8-sig') as f:
    writer=csv.DictWriter(f,fieldnames=keys);writer.writeheader();writer.writerows(results)
print('Measured rows:',sum(r.get('status')=='measured' for r in results),'Fit:',sum(r.get('fit') is True for r in results),'Total:',len(results))

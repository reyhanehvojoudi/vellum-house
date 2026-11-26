"""Run from site root with a local HTTP server and Playwright installed.
Example: python -m http.server 8765 ; python tools/visual-qa.py
No real form submission or appointment is made.
"""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json
out=Path('qa-output');out.mkdir(exist_ok=True)
sizes=[(320,568),(360,640),(390,844),(430,932),(844,390),(768,1024),(1024,768),(1280,720),(1440,900),(1920,1080),(2560,1440)]
results=[]
with sync_playwright() as p:
    browser=p.chromium.launch()
    for run in (1,2):
        for lang,entry in [('fa','index.html'),('en','en.html')]:
            for w,h in sizes:
                context=browser.new_context(viewport={'width':w,'height':h},reduced_motion='reduce')
                page=context.new_page()
                for state in ['intro','journey','founders','contact','consult','privacy','calendar','dialog','menu','form-errors','404']:
                    route={'dialog':'intro','menu':'intro','form-errors':'consult'}.get(state,state)
                    url='http://127.0.0.1:8765/'+('404.html' if state=='404' else entry+'#'+route)
                    page.goto(url,wait_until='domcontentloaded');page.evaluate('document.fonts.ready');page.wait_for_timeout(250)
                    if state=='menu':
                        if not page.locator('.menu-toggle').is_visible():continue
                        page.locator('.menu-toggle').click()
                    if state=='dialog':
                        if page.locator('.menu-toggle').is_visible():page.locator('.menu-toggle').click()
                        page.locator('#language-control').click()
                    if state=='form-errors':page.locator('#submit-enquiry').click()
                    info=page.evaluate('''()=>({pageOverflow:document.documentElement.scrollWidth-innerWidth,hits:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&(r.right>innerWidth+1||r.left< -1)}).map(e=>({tag:e.tagName,id:e.id,cls:String(e.className)})),internal:[...document.querySelectorAll('body *')].filter(e=>e.clientWidth>0&&e.scrollWidth>e.clientWidth+1).map(e=>({tag:e.tagName,id:e.id,cls:String(e.className)}))})''')
                    results.append(dict(run=run,lang=lang,width=w,height=h,state=state,**info))
                    page.screenshot(path=str(out/f'{run}-{lang}-{w}x{h}-{state}.png'),full_page=True)
                context.close()
    browser.close()
(out/'overflow.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
print('Inspect screenshots and overflow.json; distinguish intentionally clipped decorative and hidden controls from defects.')

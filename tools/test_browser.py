import asyncio
from pathlib import Path
import base64
from playwright.async_api import async_playwright
URL='about:blank'
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="assets/experience.css?v=8.0">','<style>'+ (ROOT/'assets/experience.css').read_text() +'</style>')
html=html.replace('<script defer src="assets/config.js?v=8.0"></script>','')
html=html.replace('<script defer src="assets/experience.js?v=8.0"></script>','')
html=html.replace('assets/logo-mark.svg','data:image/svg+xml;base64,'+base64.b64encode((ROOT/'assets/logo-mark.svg').read_bytes()).decode())
html=html.replace('</body>','<script>history.replaceState=function(){};</script><script>'+ (ROOT/'assets/config.js').read_text() + '</script><script>'+ (ROOT/'assets/experience.js').read_text() + '</script></body>')
OUT=ROOT/'docs'
OUT.mkdir(exist_ok=True)
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  for lang in ['fa','en']:
   for w,h in [(1440,900),(390,844),(320,640),(768,1024),(1280,720)]:
    page=await browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1)
    page.set_default_timeout(5000)
    errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
    await page.goto(URL)
    await page.set_content(html,wait_until='domcontentloaded',timeout=20000)
    await page.wait_for_timeout(200)
    shown=await page.locator('#language-overlay').is_visible()
    if lang=='fa' and w in [1440,390]:await page.screenshot(path=str(OUT / f'preview_language_{w}.png'),full_page=True)
    if not shown:raise AssertionError('missing initial language modal')
    await page.locator(f'[data-choose-language="{lang}"]').click()
    await page.wait_for_timeout(650)
    assert await page.locator('.atlas-node').count()==5
    info=await page.evaluate('''() => ({bodyScrollHeight:document.body.scrollHeight, h:innerHeight, docScrollHeight:document.documentElement.scrollHeight, viewportW:innerWidth, documentW:document.documentElement.scrollWidth, e:document.querySelector('#experience').clientHeight})''')
    print(lang,w,h,info,'errors',errors)
    if errors:raise Exception(errors)
    if info['documentW']>w+1:print('WARNING overflow',lang,w)
    if w in [1440,390]:
     await page.screenshot(path=str(OUT / f'preview_{lang}_{w}.png'),full_page=True)
    await page.locator('[data-stage="4"]').click()
    assert (await page.locator('#stage-detail').inner_text()).find('05')!=-1
    await page.locator('#menu-trigger').click()
    assert await page.locator('#menu-overlay').is_visible()
    await page.locator('.menu-item[data-go="people"]').click()
    assert await page.locator('.founder-card').count()==2
    await page.wait_for_timeout(540)
    if w in [1440,390]:await page.screenshot(path=str(OUT / f'preview_people_{lang}_{w}.png'),full_page=True)
    await page.locator('#menu-trigger').click()
    await page.locator('.menu-item[data-go="method"]').click()
    assert await page.locator('.principle').count()==3
    await page.locator('.principle[data-principle="1"]').click()
    assert 'is-current' in (await page.locator('.principle[data-principle="1"]').get_attribute('class'))
    await page.locator('#menu-trigger').click()
    await page.locator('.menu-item[data-go="proof"]').click()
    assert await page.locator('.proof-card').count()==2
    await page.wait_for_timeout(500)
    if w in [1440,390]: await page.screenshot(path=str(OUT / f'preview_proof_{lang}_{w}.png'),full_page=True)
    await page.locator('[data-go="consult"]:visible').first.click()
    assert await page.locator('#enquiry-form').count()==1
    await page.wait_for_timeout(540)
    if w in [1440,390]:await page.screenshot(path=str(OUT / f'preview_consult_{lang}_{w}.png'),full_page=True)
    if w<=740:
      await page.locator('#fullName').fill('VH Test')
      await page.locator('#email').fill('vh-test@example.com')
      await page.locator('[data-form-next]').click()
      assert await page.locator('#enquiry-form').get_attribute('data-step')=='2'
      if w in [390]:await page.screenshot(path=str(OUT / f'preview_consult_step2_{lang}_{w}.png'),full_page=True)
    # Open privacy dialog
    await page.locator('.text-link[data-legal]').click()
    assert await page.locator('#legal-overlay').is_visible()
    await page.keyboard.press('Escape')
    assert not await page.locator('#legal-overlay').is_visible()
    # Terms and privacy are accessible from the same in-page menu.
    await page.locator('#menu-trigger').click()
    await page.locator('#menu-legal-links [data-legal="terms"]').click()
    assert await page.locator('#legal-overlay').is_visible()
    await page.keyboard.press('Escape')
    await page.locator('button[data-menu-close]').click()
    await page.close()
  await browser.close()
if __name__=='__main__':asyncio.run(main())

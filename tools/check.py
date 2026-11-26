"""Check all public entry points, bilingual content, required controls and production assets."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import re,json
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.tags=[]
    def handle_starttag(self,tag,attrs):self.tags.append((tag,dict(attrs)))
def check_ref(base,ref):
    url=urlsplit(ref)
    if not url.scheme and url.path and url.path!='/':assert (base/url.path.lstrip("/")).is_file(),ref
pages=sorted(ROOT.glob('*.html'))
for p in pages:
    raw=p.read_text()
    assert re.search(r'<title>Vellum House</title>',raw),p
    parser=Page();parser.feed(raw)
    assert any(a.get('rel')=='icon' for _,a in parser.tags),p
    for _,a in parser.tags:
        for attr in ('href','src','poster','data-src','data-src-small','data-poster','data-poster-small'):
            if a.get(attr):check_ref(ROOT,a[attr])
        for ref in a.get('srcset','').split(','):
            if ref.strip():check_ref(ROOT,ref.strip().split()[0])
    if p.name not in ('index.html','en.html'):continue
    fields={a.get('name'):a for _,a in parser.tags if a.get('name')}
    assert all('required' in fields[k] for k in ['fullName','email','phone','education','grade','serviceInterest','consent'])
    assert all(k in fields for k in ['birthday','major','institution'])
    assert ('value="middle"' in raw)==(p.name=='en.html')
    assert sum('data-stage' in a for _,a in parser.tags)==6
    assert sum('data-stage-copy' in a for _,a in parser.tags)==6
    assert sum('data-delta' in a for _,a in parser.tags)==2
    # All node positions must agree with the exact cubic endpoints on both layouts.
    nodes=[a for _,a in parser.tags if 'data-stage' in a]
    bases=[a for t,a in parser.tags if t=='path' and a.get('class')=='route-base']
    for base,(w,h,xkey,ykey) in zip(bases,[(1000,230,'--x','--y'),(1000,230,'--mx','--my')]):
        nums=list(map(float,re.findall(r'-?\d+(?:\.\d+)?',base['d'])))
        points=[nums[:2]]+[nums[j+4:j+6] for j in range(2,len(nums),6)]
        assert len(points)==len(nodes)==6
        for node,(x,y) in zip(nodes,points):
            css=dict(re.findall(r'(--\w+):([\d.]+)%',node['style']))
            assert abs(float(css[xkey])-100*x/w)<1e-6
            assert abs(float(css[ykey])-100*y/h)<1e-6
    assert sum(a.get('class')=='metric-number' for _,a in parser.tags)==3
    assert sum(a.get('class')=='contact-icon' for _,a in parser.tags)==3
    assert 'همراهی اختصاصی در مسیر تحصیل' not in raw
    assert ('Your Journey Begins Here.' if p.name=='en.html' else 'مسیر شما، از اینجا آغاز می‌شود') in raw
    assert 'id="journey-pause"' not in raw and 'class="royal-route desktop"' in raw and 'class="royal-route mobile"' in raw
    assert 'assets/royal.css' in raw and 'class="explore btn gold"' in raw
    assert raw.index('class="hero-film"') < raw.index('class="explore btn gold"')
    assert 'hero-portrait-original.mp4' in raw and 'hero-portrait-poster.webp' in raw
    assert sum(a.get('class')=='portrait-toggle' for _,a in parser.tags)==2
    assert sum(a.get('class')=='founder-overlay' and 'hidden' in a for _,a in parser.tags)==2
    assert ('About Us' if p.name=='en.html' else 'درباره ما') in raw
    assert sum('linkedin.com/in/' in a.get('href','') for _,a in parser.tags)==2
    assert any(a.get('href')=='https://t.me/VH_edu' for _,a in parser.tags)
    assert any(a.get('href')=='mailto:vellumhouse.edu@gmail.com' for _,a in parser.tags)
    assert 'Vellum House' in raw and 'Academic Management' in raw and ('ولوم هاوس | مدیریت یکپارچه و اختصاصی مسیر رشد و موفقیت' if p.name=='index.html' else 'Vellum House | Personalized, Integrated Management of Your Journey to Growth and Success') in raw
    assert 'id="language-dialog"' in raw and 'id="calendar-area"' in raw and 'id="journey"' in raw
    assert not any(x in raw for x in ('atlas-','How we plan','چگونه با هم'))
    ids=[a['id'] for _,a in parser.tags if 'id' in a];assert len(ids)==len(set(ids))
style=(ROOT/'assets/house.css').read_text()+'\n'+(ROOT/'assets/royal.css').read_text()
for ref in re.findall(r'url\(([^)]+)\)',style):
    u=ref.strip('"\'')
    if not u.startswith(('data:','#')):check_ref(ROOT/'assets',u)
for p in (ROOT/'assets').glob('*.js'):
    s=p.read_text()
    for ref in re.findall(r"(?:from\s+|import\()['\"]\./([^'\"]+)['\"]",s):check_ref(p.parent,ref)
    assert 'qa-transport' not in s and 'example.test' not in s
assert all(x not in (ROOT/'assets/house.js').read_text() for x in ('scheduleJourney','autoTimer','Resume automatic journey','Pause automatic journey'))
assert not any('atlas-' in p.name for p in (ROOT/'assets/media').iterdir())
assert (ROOT/'CNAME').read_text().strip()=='vhouse.ir'
assert 'Every student is unique. Why should their educational journey be the same?' in (ROOT/'en.html').read_text()
assert json.loads((ROOT/'backend/appsscript.json').read_text())['dependencies']['enabledAdvancedServices'][0]['version']=='v3'
assert (ROOT/'assets/media/hero-desktop-original.mp4').stat().st_size>100000
assert (ROOT/'favicon.ico').read_bytes()[:4]==bytes([0,0,1,0])
print(f'PASS. {len(pages)} HTML entry points, English tab titles, bilingual profiles and navigation, six-stage path, form requirements, linked media, fonts, contact destinations and Apps Script manifest.')

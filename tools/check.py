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
    if not url.scheme and url.path and url.path!='/':assert (base/url.path).is_file(),ref
pages=sorted(ROOT.glob('*.html'))
for p in pages:
    raw=p.read_text()
    assert re.search(r'<title>Vellum House</title>',raw),p
    assert not re.search(r'دانش[\s‌-]*آموز',raw),p
    parser=Page();parser.feed(raw)
    assert any(a.get('rel')=='icon' for _,a in parser.tags),p
    for _,a in parser.tags:
        for attr in ('href','src','poster','data-src','data-src-small'):
            if a.get(attr):check_ref(ROOT,a[attr])
        for ref in a.get('srcset','').split(','):
            if ref.strip():check_ref(ROOT,ref.strip().split()[0])
    if p.name not in ('index.html','en.html'):continue
    fields={a.get('name'):a for _,a in parser.tags if a.get('name')}
    assert all('required' in fields[k] for k in ['fullName','email','phone','education','grade','serviceInterest','consent'])
    assert all(k in fields for k in ['birthday','major','institution'])
    assert ('value="middle"' in raw)==(p.name=='en.html')
    assert sum('data-stage' in a for _,a in parser.tags)==4
    assert sum('data-stage-copy' in a for _,a in parser.tags)==4
    assert sum('data-delta' in a for _,a in parser.tags)==2
    assert sum('linkedin.com/in/' in a.get('href','') for _,a in parser.tags)==2
    assert any(a.get('href')=='https://t.me/VH_edu' for _,a in parser.tags)
    assert any(a.get('href')=='mailto:vellumhouse.edu@gmail.com' for _,a in parser.tags)
    assert 'Vellume House' in raw and 'Academic Management' in raw and 'ولوم هاوس | مدیریت یکپارچه و اختصاصی مسیر رشد و موفقیت' in raw
    assert 'id="language-dialog"' in raw and 'id="calendar-area"' in raw and 'id="journey"' in raw
    assert not any(x in raw for x in ('atlas-','How we plan','چگونه با هم'))
    ids=[a['id'] for _,a in parser.tags if 'id' in a];assert len(ids)==len(set(ids))
style=(ROOT/'assets/house.css').read_text()
for ref in re.findall(r'url\(([^)]+)\)',style):
    u=ref.strip('"\'')
    if not u.startswith(('data:','#')):check_ref(ROOT/'assets',u)
for p in (ROOT/'assets').glob('*.js'):
    s=p.read_text()
    for ref in re.findall(r"(?:from\s+|import\()['\"]\./([^'\"]+)['\"]",s):check_ref(p.parent,ref)
    assert 'qa-transport' not in s and 'example.test' not in s
assert not any('atlas-' in p.name for p in (ROOT/'assets/media').iterdir())
assert (ROOT/'CNAME').read_text().strip()=='vhouse.ir'
assert 'At Vellum House, we believe exceptional futures are built through personalized guidance, not one-size-fits-all education.' in (ROOT/'en.html').read_text()
assert json.loads((ROOT/'backend/appsscript.json').read_text())['dependencies']['enabledAdvancedServices'][0]['version']=='v3'
assert (ROOT/'assets/media/introduction.mp4').stat().st_size>100000
assert (ROOT/'favicon.ico').read_bytes()[:4]==bytes([0,0,1,0])
print(f'PASS. {len(pages)} HTML entry points, English tab titles, bilingual profiles and navigation, four-stage path, form requirements, linked media, fonts, contact destinations and Apps Script manifest.')

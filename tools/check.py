"""Verify the deployable bilingual site, its calendar hand-off and local assets."""
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import urlsplit

ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.tags=[]
    def handle_starttag(self, name, attrs):
        self.tags.append((name,dict(attrs)))

def check_ref(base, ref):
    url=urlsplit(ref)
    if url.scheme or not url.path or url.path=='/': return
    assert (base/url.path).is_file(), ref

for filename in ROOT.glob('*.html'):
    parser=Page();parser.feed(filename.read_text())
    for _,tag in parser.tags:
        for attr in ('href','src'):
            if tag.get(attr):check_ref(ROOT,tag[attr])
        for entry in tag.get('srcset','').split(','):
            if entry.strip():check_ref(ROOT,entry.strip().split()[0])
    if filename.name not in ('index.html','en.html'): continue
    raw=filename.read_text()
    assert 'id="enquiry-form"' in raw and 'id="calendar-area"' in raw
    selects={attrs.get('name') for name,attrs in parser.tags if name=='select'}
    assert {'grade','serviceInterest'} <= selects
    assert sum('data-stage' in a for _,a in parser.tags)==5
    assert sum('data-delta' in a for _,a in parser.tags)==2
    assert sum('linkedin.com/in/' in a.get('href','') for _,a in parser.tags)==2
    assert 'footer' not in {n for n,_ in parser.tags}
    assert not any(x in raw for x in ['cal.com','menu-toggle','data-form-next','chapter-marker','mailto:'])
style=(ROOT/'assets/house.css').read_text()
for url in re.findall(r'url\(([^)]+)\)',style):
    if not url.startswith('"data:'):check_ref(ROOT/'assets',url.strip('"'))
for file in ['admin.html','assets/house.js','assets/admin.js','assets/booking.js','assets/calendar-api.js','backend/Code.gs','assets/config.js']:
    assert (ROOT/file).is_file()
for slug in ['admin.js','house.js','booking.js','calendar-api.js']:
    for name in re.findall(r"(?:from\s+|import\()['\"]\./([^'\"]+)['\"]",(ROOT/'assets'/slug).read_text()):
        check_ref(ROOT/'assets',name)
assert (ROOT/'CNAME').read_text().strip()=='vhouse.ir'
assert 'At Vellum House, we believe exceptional futures are built through personalized guidance, not one-size-fits-all education.' in (ROOT/'en.html').read_text()
print('PASS: local URLs, responsive image and font assets, localized forms and calendar, grade options, direct header links, two founder profiles and domain.')

from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
R=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self):super().__init__();self.refs=[];self.ids=[];self.h1=0;self.labels=[];self.fields=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='h1':self.h1+=1
  if 'id'in a:self.ids.append(a['id'])
  if tag=='label' and 'for'in a:self.labels.append(a['for'])
  if tag in ['input','textarea'] and a.get('name')!='website':self.fields.append(a)
  for k in ['src','href']:
   if k in a:self.refs.append(a[k])
parsed={}
for f in R.glob('*.html'):
 if f.name.startswith('preview-'):continue
 p=Page();p.feed(f.read_text());assert p.h1==1,(f,'h1');assert len(p.ids)==len(set(p.ids)),(f,'duplicate ids');parsed[f.name]=p
for name,p in parsed.items():
 for ref in p.refs:
  u=urlsplit(ref)
  if u.scheme or u.netloc:continue
  target=R/unquote(u.path) if u.path else R/name
  assert target.exists(),(name,ref,'broken link')
  if u.fragment and target.suffix=='.html':assert u.fragment in parsed[target.name].ids,(name,ref,'broken anchor')
for name in ['contact.html','contact-fa.html']:
 p=parsed[name];expected=['fullName','grade','city','phone','email','message','consent']
 assert [f['name'] for f in p.fields]==expected
 assert all('required' in f for f in p.fields)
 assert all(f['id'] in p.labels for f in p.fields if f['name']!='consent')
print(f'PASS: {len(parsed)} pages; local links, anchors, headings, IDs, bilingual form fields and labels')

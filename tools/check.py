#!/usr/bin/env python3
"""Checks generated static pages. No browser or third-party dependencies needed."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__(); self.refs=[];self.ids=[];self.labels=[];self.controls=[];self.images=[];self.lang='';self.direction='';self.h1=0;self.feed(text)
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if 'id' in d:self.ids.append(d['id'])
  if tag=='html':self.lang=d.get('lang');self.direction=d.get('dir')
  if tag=='h1':self.h1+=1
  for attr in ['src','href']:
   if attr in d:self.refs.append(d[attr])
  if tag=='label' and 'for' in d:self.labels.append(d['for'])
  if tag in ['input','textarea','select'] and d.get('type')!='checkbox':self.controls.append(d)
  if tag=='img':self.images.append(d)
pages={p.name:Page(p.read_text()) for p in ROOT.glob('*.html')};errors=[]
for name,p in pages.items():
 if len(p.ids)!=len(set(p.ids)): errors.append(name+': duplicate IDs')
 if p.h1!=1:errors.append(name+': expected one h1')
 if name!='404.html' and (p.lang not in ['en','fa'] or p.direction!=('rtl' if p.lang=='fa' else 'ltr')):errors.append(name+': wrong lang/direction')
 for ref in p.refs:
  u=urlsplit(ref)
  if u.scheme or u.netloc:continue
  target=unquote(u.path).lstrip('/') or name
  if not (ROOT/target).exists():errors.append(name+': missing '+target)
  if u.fragment and target in pages and u.fragment not in pages[target].ids:errors.append(name+': missing anchor '+ref)
 for d in p.images:
  if not d.get('alt'):errors.append(name+': image without alt')
 for d in p.controls:
  if d.get('id') not in p.labels and not d.get('aria-label'):errors.append(name+': unlabelled form control')
data=json.loads((ROOT/'content.json').read_text())
if set(data['en'])!=set(data['fa']):errors.append('Language key mismatch')
for lang in data:
 if len(data[lang]['fields'])!=9:errors.append('Unexpected fields count '+lang)
for asset in ['Vazirmatn-Regular.woff2','Vazirmatn-Bold.woff2','Vazirmatn-LICENSE.txt','vh-brand.webp','Vellum_House_Brochure.pdf']:
 if not (ROOT/'assets'/asset).is_file():errors.append('Missing '+asset)
if errors:raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} HTML pages; local references, anchors, unique IDs, headings, language direction, form labels, image alt text and language keys.')

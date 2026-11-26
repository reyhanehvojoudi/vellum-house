#!/usr/bin/env python3
"""Basic source and deployment integrity checks. No external dependencies."""
from pathlib import Path
from html.parser import HTMLParser
import re,sys
R=Path(__file__).resolve().parents[1]
files=sorted(R.glob('*.html'))
class Check(HTMLParser):
 def __init__(self):
  super().__init__();self.links=[];self.h1=0;self.form=False;self.method=None;self.meta={};self.canonical=False;self.ids=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if tag=='a' and d.get('href'):self.links.append(d['href'])
  if tag=='h1':self.h1+=1
  if tag=='form' and d.get('id')=='enquiry-form':self.form=True;self.method=d.get('method')
  if tag=='meta' and d.get('name')=='description':self.meta['description']=d.get('content')
  if tag=='link' and d.get('rel')=='canonical':self.canonical=True
  if d.get('id'):self.ids.append(d['id'])
errors=[];descs={}
for file in files:
 html=file.read_text(encoding='utf-8');p=Check();p.feed(html)
 if p.h1!=1:errors.append(f'{file.name}: H1 count {p.h1}')
 if len(set(p.ids))!=len(p.ids):errors.append(f'{file.name}: duplicate IDs')
 if file.name!='404.html':
  if not p.canonical:errors.append(f'{file.name}: missing canonical')
  if not p.meta.get('description'):errors.append(f'{file.name}: missing description')
  if file.name not in ('fa.html','index.html'):
   if p.meta.get('description') in descs:errors.append(f'{file.name}: repeated metadata')
   descs[p.meta.get('description')]=file.name
 for href in p.links:
  loc=href.split('#',1)[0].split('?',1)[0]
  if loc and not loc.startswith(('https:','http:','mailto:','tel:','//')) and not (R/loc).exists():errors.append(f'{file.name}: broken href {href}')
 if file.name.startswith('contact'):
  if not p.form or p.method!='post':errors.append(f'{file.name}: missing POST form')
  for key in ['fullName','email','serviceInterest','consent','website','form-status','booking-fallback']:
   if key not in html:errors.append(f'{file.name}: missing form marker {key}')
 if 'https://cal.com/vhouse/30min' in html and not file.name.startswith('contact'):errors.append(f'{file.name}: direct booking link bypasses enquiry')
for path in ['assets/style.css','assets/main.js','assets/config.js','backend/Code.gs','CNAME','robots.txt','sitemap.xml','tools/build.py']:
 if not (R/path).exists():errors.append(f'missing {path}')
if 'month=2026-11' in (R/'assets/config.js').read_text(): errors.append('booking URL pins an expired month')
if errors:
 print('FAILED:',*errors,sep='\n- ');sys.exit(1)
print(f'PASS — {len(files)} pages, local links, bilingual forms, metadata, SEO and source configuration')

#!/usr/bin/env python3
"""Set public canonical metadata and produce a sitemap. Run after build.py."""
from pathlib import Path
from urllib.parse import urlparse,urljoin
from html import escape
import sys,re
ROOT=Path(__file__).resolve().parents[1]
if len(sys.argv)!=2: raise SystemExit('Usage: python3 tools/set_domain.py https://your-real-domain-or-pages-url/')
base=sys.argv[1].rstrip('/')+'/'
u=urlparse(base)
if u.scheme!='https' or not u.netloc or u.query or u.fragment or u.username: raise SystemExit('Use a complete public HTTPS base URL, without query, credentials or fragment.')
urls=[]
for p in sorted(ROOT.glob('*.html')):
 if p.name=='404.html': continue
 s=p.read_text()
 s=re.sub(r'<link rel="canonical"[^>]*>|<meta property="og:(?:url|image)"[^>]*>','',s)
 s=re.sub(r'(<link rel="alternate" hreflang="[^"]+" href=")([^"]+)(">)',lambda m:m[1]+escape(urljoin(base,urlparse(m[2]).path.split('/')[-1]),quote=True)+m[3],s)
 address=urljoin(base,p.name)
 s=s.replace('</head>','<link rel="canonical" href="'+escape(address,quote=True)+'"><meta property="og:url" content="'+escape(address,quote=True)+'"><meta property="og:image" content="'+escape(urljoin(base,'assets/vh-brand.webp'),quote=True)+'"></head>')
 p.write_text(s)
 urls.append(address)
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+escape(x)+'</loc></url>' for x in urls)+'</urlset>')
(ROOT/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: '+urljoin(base,'sitemap.xml')+'\n')
p=ROOT/'404.html'
s=p.read_text()
s=re.sub(r'<script>.*?</script>','',s)
s=re.sub(r'(id="home" href=")[^"]*',lambda m:m[1]+escape(urljoin(base,'index.html'),quote=True),s)
s=re.sub(r'(id="fa" href=")[^"]*',lambda m:m[1]+escape(urljoin(base,'fa.html'),quote=True),s)
p.write_text(s)
print('Updated metadata and sitemap for',base)

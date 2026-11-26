"""One-time font setup on your own computer. Run from any directory.
python tools/install_fonts.py [--dana path/to/licensed-variable.woff2]
Downloads only OFL English fonts from the official Google Fonts CSS service.
Dana is never downloaded; supply a licensed variable WOFF2 file yourself.
"""
import argparse, re, urllib.request, urllib.parse, shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; FONT=ROOT/'assets/fonts'; CSS=ROOT/'assets/royal-fonts.css'
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':UA}),timeout=45) as f: return f.read()
parser=argparse.ArgumentParser();parser.add_argument('--dana',type=Path,help='Licensed variable Dana WOFF2, with 400–700 weights.');parser.add_argument('--dana-only',action='store_true');args=parser.parse_args()
FONT.mkdir(exist_ok=True)
output=[]
if not args.dana_only:
    for family,query,slug in [('Cormorant Garamond','Cormorant+Garamond:wght@300..700','cormorant-garamond'),('Inter','Inter:wght@100..900','inter')]:
        source=fetch('https://fonts.googleapis.com/css2?family='+query+'&display=swap').decode()
        latin=re.search(r'/\* latin \*/\s*(@font-face\s*\{[^}]+\})',source)
        if not latin: raise RuntimeError('Latin font face unavailable for '+family)
        block=latin.group(1);url=re.search(r'url\((https://[^)]+)\)',block).group(1)
        data=fetch(url)
        if data[:4]!=b'wOF2':raise RuntimeError('Expected WOFF2 for '+family)
        filename=slug+'.woff2';(FONT/filename).write_bytes(data)
        output.append(block.replace(url,'fonts/'+filename))
        lic=fetch(f'https://raw.githubusercontent.com/google/fonts/main/ofl/{slug.replace("-","")}/OFL.txt')
        (FONT/(slug+'-OFL.txt')).write_bytes(lic)
else:
    output.append('\n'.join(b for b in re.findall(r'@font-face\s*\{[^}]+\}',CSS.read_text()) if re.search(r"font-family\s*:\s*['\"]?(Cormorant Garamond|Inter)",b) and 'src:' in b))
if args.dana:
    if not args.dana.is_file() or args.dana.read_bytes()[:4]!=b'wOF2':raise RuntimeError('Provide a licensed variable Dana WOFF2 file.')
    dest=FONT/'dana.woff2'
    if args.dana.resolve()!=dest.resolve():shutil.copyfile(args.dana,dest)
if (FONT/'dana.woff2').is_file():output.append("@font-face{font-family:'Dana';src:url('fonts/dana.woff2') format('woff2');font-weight:100 900;font-display:swap}")
CSS.write_text('/* Locally installed font faces; preserve all font licences. */\n'+'\n'.join(output)+'\n',encoding='utf-8')
print('Font setup saved. Verify actual rendered fonts in the browser. Dana:',(FONT/'dana.woff2').is_file())

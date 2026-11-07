"""Build the online page (no html/head/body, GSAP from cdnjs), the offline folder and the slide PDF."""
import glob, shutil, os
from PIL import Image
s = open('deck.html').read()
body = s[s.index('<title>'):]
body = body.replace('</head>\n<body>\n', '\n').replace('</body></html>\n', '').replace('</body></html>', '')
body = body.replace('<script src="vendor/gsap.min.js"></script>', '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>')
body = body.replace('<title>Tôi có một ước mơ</title>', '<title>Tôi có một ước mơ</title>\n<style>:root{color-scheme:dark} body{background:#050705}</style>', 1)
assert '<body>' not in body and '</head>' not in body
open('toi_co_mot_uoc_mo.html', 'w').write(body)

off = 'Toi_co_mot_uoc_mo'
shutil.rmtree(off, ignore_errors=True)
os.makedirs(off)
for d in ['img', 'vendor', 'fonts']:
    shutil.copytree(d, f'{off}/{d}')
shutil.copy('app.js', off)
o = s.replace('<link rel="preconnect" href="https://fonts.googleapis.com">\n', '')
o = o.replace('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;0,800;1,500;1,600&family=Be+Vietnam+Pro:wght@300;400;500;600&display=swap">', '<link rel="stylesheet" href="fonts/fonts.css">')
assert 'fonts/fonts.css' in o
open(f'{off}/index.html', 'w').write(o)

fs = sorted(glob.glob('qa5/b*.png'))
ims = [Image.open(f).convert('RGB') for f in fs]
ims[0].save('Toi_co_mot_uoc_mo_slides.pdf', save_all=True, append_images=ims[1:], resolution=144, quality=88)
shutil.copy('Toi_co_mot_uoc_mo_slides.pdf', off)
shutil.make_archive('Toi_co_mot_uoc_mo_offline', 'zip', '.', off)
print('pages', len(ims))

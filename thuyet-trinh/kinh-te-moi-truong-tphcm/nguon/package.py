"""Build the online page, the offline folder (fonts bundled) and the slide PDF."""
import glob, os, re, shutil, subprocess, sys
from PIL import Image
qa = sys.argv[1]
FONTS = 'https://fonts.googleapis.com/css2?family=Anton&family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap'
s = open('deck.html').read()
body = s[s.index('<title>'):]
body = body.replace('</head>\n<body>\n', '\n').replace('</body></html>\n', '').replace('</body></html>', '')
body = body.replace('<script src="vendor/gsap.min.js"></script>', '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>')
body = body.replace('</title>', '</title>\n<style>:root{color-scheme:dark} body{background:#000}</style>', 1)
assert '<body>' not in body and '</head>' not in body
open('kinh_te_moi_truong_tphcm.html', 'w').write(body)

if not os.path.exists('fonts/fonts.css'):
    os.makedirs('fonts', exist_ok=True)
    css = subprocess.run(['curl', '-sS', '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36', FONTS], capture_output=True, text=True).stdout
    for i, u in enumerate(sorted(set(re.findall(r'https://fonts.gstatic.com[^)]*', css)))):
        subprocess.run(['curl', '-sS', '-o', f'fonts/f{i}.woff2', u], check=True); css = css.replace(u, f'f{i}.woff2')
    open('fonts/fonts.css', 'w').write(css)

off = 'Kinh_te_moi_truong_TPHCM'
shutil.rmtree(off, ignore_errors=True); os.makedirs(off)
for d in ['img', 'vendor', 'fonts']:
    shutil.copytree(d, f'{off}/{d}')
shutil.copy('app.js', off)
o = s.replace('<link rel="preconnect" href="https://fonts.googleapis.com">\n', '').replace(f'<link rel="stylesheet" href="{FONTS}">', '<link rel="stylesheet" href="fonts/fonts.css">')
assert 'fonts/fonts.css' in o
open(f'{off}/index.html', 'w').write(o)
ims = [Image.open(f).convert('RGB') for f in sorted(glob.glob(f'{qa}/b*.png'))]
ims[0].save('Kinh_te_moi_truong_TPHCM_slides.pdf', save_all=True, append_images=ims[1:], resolution=144, quality=86)
shutil.copy('Kinh_te_moi_truong_TPHCM_slides.pdf', off)
shutil.make_archive('Kinh_te_moi_truong_TPHCM_offline', 'zip', '.', off)
print('pages', len(ims), 'fonts', len(glob.glob('fonts/*.woff2')))

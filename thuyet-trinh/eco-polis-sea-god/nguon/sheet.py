import sys,glob
from PIL import Image, ImageDraw
d=sys.argv[1]; fs=sorted(glob.glob(d+'/b*.jpg'))
for k in range(0,len(fs),9):
    ims=[Image.open(f).resize((640,360)) for f in fs[k:k+9]]
    s=Image.new('RGB',(640*3,360*3),'black'); dr=ImageDraw.Draw(s)
    for i,im in enumerate(ims): s.paste(im,((i%3)*640,(i//3)*360)); dr.text(((i%3)*640+8,(i//3)*360+8),fs[k+i].split('/')[-1],fill='yellow')
    s.save(f'{d}/sheet{k//9+1}.jpg',quality=82)

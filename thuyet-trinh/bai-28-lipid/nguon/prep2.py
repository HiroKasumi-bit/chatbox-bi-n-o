from PIL import Image, ImageDraw
import shutil
exec(open('prep.py').read().split('# backgrounds')[0])  # reuse load/crop/rounded helpers
W='../web/'; T='../tpl/ppt/media/'
def lw(n):
    im=Image.open(W+n).convert('RGB'); return im
def lt(n):
    im=Image.open(T+n).convert('RGBA'); bg=Image.new('RGBA',im.size,'white'); bg.alpha_composite(im); return bg.convert('RGB')
items={'avocado':(lw('avocado.jpg'),0.5,0.5),'palm':(lw('palm1.jpg'),0.5,0.3),'sunflower':(lw('sunflower.jpg'),0.25,0.5),
 'peanutoil':(lw('peanutoil.jpg'),0.5,0.35),'fishoil':(lw('fishoil.jpg'),0.5,0.5),'soy':(lw('soy.jpg'),0.6,0.5),'peanuts':(lw('peanuts.jpg'),0.5,0.5),
 'walnut':(lw('walnut.jpg'),0.5,0.6),'almonds':(lw('almonds.jpg'),0.5,0.5),'nuts':(lw('nuts.jpg'),0.5,0.5),'cream':(lw('cream.jpg'),0.5,0.5),
 'soapbar':(lw('soapbar.jpg'),0.5,0.5),'biodiesel':(lw('biodiesel.jpg'),0.25,0.5),'chicken':(lw('friedchicken.jpg'),0.5,0.5),
 'salmon':(load('image4.jpeg').crop((0,70,240,315)),0.5,0.5),'xang':(lt('image37.png'),0.6,0.5),'dauhoa':(lt('image36.png'),0.5,0.45),'bubble':(lt('image38.png'),0.5,0.5)}
for k,(im,fx,fy) in items.items():
    rounded(crop(im,1.0,fx,fy),'c_'+k+'.png',W=500,circle=True)
    rounded(crop(im,1.36,fx,fy),'r_'+k+'.png',W=600,r=0.07)
for n,o in [('image16.png','logo_ud.png'),('image17.png','logo_lh.png'),('image18.png','bunting.png'),('image19.png','confetti.png')]:
    shutil.copy(T+n,'img/'+o)
print('ok')
rounded(crop(load('image22.jpeg'),1.0),'c_soapmix.png',W=500,circle=True)
for n,o,fy in [('image8.png','r_mo.png',0.5),('image9.png','r_bo.png',0.5),('image6.png','r_vung.png',0.6)]:
    rounded(crop(load(n),1.36,0.5,fy),o,W=600,r=0.07)
print('extra ok')

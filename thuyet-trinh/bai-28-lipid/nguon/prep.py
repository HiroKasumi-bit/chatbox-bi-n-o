from PIL import Image, ImageDraw, ImageFilter
import numpy as np, sys
M='../docx_media/word/media/'
def load(n):
    im=Image.open(M+n).convert('RGBA'); bg=Image.new('RGBA',im.size,'white'); bg.alpha_composite(im); return bg.convert('RGB')
def crop(im,aspect,fx=0.5,fy=0.5):
    w,h=im.size
    if w/h>aspect: nw=int(h*aspect); x=int((w-nw)*fx); return im.crop((x,0,x+nw,h))
    nh=int(w/aspect); y=int((h-nh)*fy); return im.crop((0,y,w,y+nh))
def rounded(im,out,W=700,r=0.05,circle=False):
    im=im.resize((W,int(W*im.size[1]/im.size[0])),Image.LANCZOS)
    s=4; mask=Image.new('L',(im.size[0]*s,im.size[1]*s),0); d=ImageDraw.Draw(mask)
    if circle: d.ellipse((0,0,mask.size[0]-1,mask.size[1]-1),fill=255)
    else: d.rounded_rectangle((0,0,mask.size[0]-1,mask.size[1]-1),radius=int(min(im.size)*r*s),fill=255)
    mask=mask.resize(im.size,Image.LANCZOS); im=im.convert('RGBA'); im.putalpha(mask); im.save('img/'+out,optimize=True)
for n,f,fy in [('image1.jpeg','f_dua',0.5),('image6.png','f_vung',0.5),('image8.png','f_mo',0.5),('image9.png','f_bo',0.5),('image4.jpeg','f_mix',0.5),('image5.png','f_dau',0.6)]:
    rounded(crop(load(n),1.6,0.5,fy),f+'.png')
for n,f in [('image5.png','s_dau'),('image8.png','s_mo'),('image9.png','s_bo'),('image1.jpeg','s_dua'),('image4.jpeg','s_mix'),('image6.png','s_vung')]:
    rounded(crop(load(n),1.0),f+'.png',W=600,circle=True)
rounded(crop(load('image17.jpeg'),1.5),'hero.png',W=800,r=0.04)
rounded(crop(load('image22.jpeg'),0.9),'soap.png',W=650,r=0.05)
rounded(crop(load('image4.jpeg'),1.25),'mix_tall.png',W=1000,r=0.05)
rounded(load('image16.jpeg'),'ph.png',W=800,r=0.04)
load('image18.jpeg').save('img/lbl_meizan.jpg',quality=90)
load('image19.png').save('img/lbl_oreo.jpg',quality=90)
# backgrounds
W,H=1920,1080
yy,xx=np.mgrid[0:H,0:W].astype(float)
def blob(cx,cy,r): return np.exp(-(((xx-cx)**2+(yy-cy)**2)/(2*r*r)))
t=(xx/W*0.6+yy/H*0.4)
c0=np.array([8,38,30]);c1=np.array([16,74,55])
img=c0[None,None,:]*(1-t[...,None])+c1[None,None,:]*t[...,None]
img+= blob(1650,150,420)[...,None]*np.array([90,60,10])*0.55
img+= blob(200,950,480)[...,None]*np.array([10,70,80])*0.5
Image.fromarray(np.clip(img,0,255).astype('uint8')).save('img/bg_dark.jpg',quality=88)
img=np.ones((H,W,3))*255
img-= blob(1900,1080,700)[...,None]*np.array([22,10,18])*0.9
img-= blob(0,0,600)[...,None]*np.array([6,4,20])*0.6
Image.fromarray(np.clip(img,0,255).astype('uint8')).save('img/bg_light.jpg',quality=88)
print('ok')

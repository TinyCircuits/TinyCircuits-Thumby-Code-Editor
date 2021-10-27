#import tetris

import machine
import os
import gc

#machine.freq(48000000)

os.chdir("/")
try:
    conf = open("thumby.cfg", "r").read().split()
except OSError:
    conf = open("thumby.cfg", "w")
    conf.write("audioenabled 1 lastgame /Games/TinyTris/TinyTris.py")
    conf.close()
    conf = open("thumby.cfg", "r").read().split()

audioEnabled = True
for k in range(len(conf)):
    if(conf[k] == "audioenabled"):
        audioEnabled = True if(conf[k+1] == "1") else False

#print(audioEnabled)

import time
from machine import Timer
import thumby

thumbySplash = (
0x0, 0x0, 0x0, 0x0, 0xf0, 0xf0, 0xf0, 0xf0, 0xf0, 0xf0, 0xf0, 0xf0, 0xf0, 0x0, 0xf0, 0xf0, 0xf0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf0, 0xf0, 0xf0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 
0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xff, 0xff, 0xff, 0x0, 0x0, 0x0, 0x0, 0xff, 0xff, 0xff, 0xf, 0xf, 0xf, 0xff, 0xff, 0xff, 0x0, 0xff, 0xff, 0xff, 0xc0, 0xc0, 0xff, 0xff, 0xff, 0x0, 0xfc, 0xfe, 0xff, 0xf, 0x7, 0xfe, 0xfe, 0xfe, 0x7, 0xf, 0xff, 0xfe, 0xfc, 0x0, 0xff, 0xff, 0xff, 0xfe, 0x8f, 0x87, 0x87, 0xcf, 0xfe, 0xfc, 0x78, 0x0, 0xff, 0xff, 0xff, 0x80, 0x80, 0xff, 0xff, 0xff, 0x0, 0x0, 0x0, 0x0, 0x0, 
0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x73, 0x73, 0x73, 0x70, 0x70, 0x70, 0x70, 0x73, 0x73, 0x73, 0x70, 0x70, 0x70, 0x73, 0x73, 0x73, 0x70, 0x73, 0x73, 0x73, 0x73, 0x73, 0x73, 0x73, 0x73, 0x70, 0x73, 0x73, 0x3, 0xf8, 0xf8, 0xfb, 0xfb, 0xfb, 0xf8, 0xf8, 0x3, 0x73, 0x73, 0x70, 0x73, 0x73, 0x73, 0x71, 0x73, 0x73, 0x73, 0x73, 0x71, 0x70, 0x70, 0x70, 0x70, 0x71, 0x73, 0x73, 0x71, 0x7f, 0x7f, 0x7f, 0x0, 0x0, 0x0, 0x0, 0x0, 
0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x4, 0xe, 0x4, 0x0, 0x0, 0x4, 0x2, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 
)

thumby.display.fill(0)

thumbyLogoHeight=0

for y in range(36):
    thumbyLogoHeight=-35+y
    thumby.display.fill(0)
    thumby.display.blit(thumbySplash, 0, thumbyLogoHeight, 72, 32)
    time.sleep_ms(12)
    try:
      thumby.display.update()
    except:
      print("??")
      
time.sleep_ms(500)

startTime=time.ticks_ms()
frameCounter=0
y=36
x=5
noButtonPress=True
moveHeight=0;

xScrollPos=0
xScrollTarget=0

os.chdir("/Games")
selpos = 0
files = os.listdir()
selected = False
scroll = 0

print(files)
for k in range(len(files)):
    if(os.stat("/Games/"+files[k])[0] != 16384):
        files[k] = ""
try:
    while(True):
        files.remove("")
except ValueError:
    pass


print(gc.mem_free())

while True:
    if(xScrollTarget!=xScrollPos):
        if(xScrollTarget>xScrollPos):
            xScrollPos += 1
            if(xScrollTarget == -8):
              xScrollPos += 1
        elif(xScrollTarget<xScrollPos):
            xScrollPos -= 1
            if(xScrollTarget == -64):
              xScrollPos -= 1
        #print(xScrollPos, xScrollTarget)
    thumby.display.fill(0)
    thumby.display.blit(thumbySplash, 0, xScrollPos+thumbyLogoHeight, 72, 32)
    thumby.display.drawText("Games", 0, xScrollPos+64)
    
    color= ((time.ticks_ms()-startTime)//500)&1 if xScrollTarget==0 else 1
    thumby.display.fillRect(72//2-8*1,xScrollPos+32-1,8*3,8+1,1-color)
    thumby.display.drawText("GO!", 72//2-8*1, xScrollPos+32,color)
    
    if(noButtonPress==0):
        color= ((time.ticks_ms()-startTime)//500)&1 if xScrollTarget==-8 else 1
        thumby.display.fillRect(72//2-8*4,xScrollPos+32+8,8*8,8,1-color)
        thumby.display.drawText("Audio On" if audioEnabled else "AudioOff", 72//2-8*4, xScrollPos+32+8,color)
    
    if(noButtonPress):
        thumby.display.drawLine(xScrollPos+x-2,y-2,xScrollPos+x,y,0)
        thumby.display.drawLine(xScrollPos+x,y,xScrollPos+x+2,y-2,0)
        if(xScrollPos == 0):
            frame=frameCounter%6
            if(frame<3):
                y+=1
            else:
                y-=1
            thumby.display.drawLine(x-2,y-2,x,y,1)
            thumby.display.drawLine(x,y,x+2,y-2,1)
    
    time.sleep_ms(10)
    if(xScrollPos == 0):
        time.sleep_ms(20)
    try:
      thumby.display.update()
    except:
      print("??")
    frameCounter+=1
    
    '''
    display.text(">GO<", 72//2-16, 32)
    display.show()
    time.sleep_ms(500)
    display.fill_rect(72//2-16,32,32,8,0)
    display.text("GO", 72//2-8, 32)
    display.show()
    time.sleep_ms(500)
    '''
    if(thumby.inputJustPressed()):
        if(noButtonPress):
            noButtonPress = False
        if(thumby.buttonD.pressed()):
            if(xScrollTarget == 0 and xScrollPos == xScrollTarget):
                xScrollTarget = -8
            elif(xScrollTarget == -8 and xScrollPos == xScrollTarget):
                xScrollTarget = -64
        if(thumby.buttonU.pressed()):
            if(xScrollTarget == -8 and xScrollPos == xScrollTarget):
                xScrollTarget = 0
            elif(xScrollTarget == -64 and xScrollPos == xScrollTarget):
                xScrollTarget = -8
        if(thumby.buttonA.pressed() or thumby.buttonB.pressed()):
            if(xScrollTarget == -8):
                audioEnabled = not audioEnabled
                thumby.audio.enabled = audioEnabled
                os.chdir("/")
                cfgfile = open("thumby.cfg", "r")
                cfg = cfgfile.read().split()
                cfgfile.close()
                for k in range(len(cfg)):
                    if(cfg[k] == "audioenabled"):
                        cfg[k+1] = "1" if(audioEnabled == True) else "0"
                cfgfile = open("thumby.cfg", "w")
                for k in range(len(cfg)):
                    cfgfile.write(cfg[k]+" ")
                cfgfile.close()
            else:
                break
    if(xScrollPos == xScrollTarget and xScrollTarget == -64):
        while(selected == False):
            thumby.display.fill(0)
            thumby.display.drawText("Games", 0, 0)
            if(selpos > 0 and len(files) > 0):
                thumby.display.drawText(files[selpos-1][:8], 4, 8+scroll)
            if(time.ticks_ms() % 1000 < 500):
                thumby.display.fillRect(4, 16, len(files[selpos][:8])*8, 8+scroll, 0)
                thumby.display.drawText(files[selpos][:8], 4, 16+scroll, 1)
            else:
                thumby.display.fillRect(4, 16, len(files[selpos][:8])*8, 8+scroll, 1)
                thumby.display.drawText(files[selpos][:8], 4, 16+scroll, 0)
            if(selpos < len(files)-1):
                thumby.display.drawText(files[selpos+1][:8], 4, 24+scroll)
            if(thumby.inputJustPressed() == True):
                if(thumby.buttonU.pressed() == True):
                    if(selpos > 0):
                        selpos -= 1
                        scroll = -8
                    else:
                        xScrollTarget = -8
                        break
                if(thumby.buttonD.pressed() == True):
                    if(selpos < len(files)-1):
                        selpos += 1
                        scroll = 8
                if(thumby.buttonB.pressed() == True):
                    os.chdir("/")
                    cfgfile = open("thumby.cfg", "r")
                    cfg = cfgfile.read().split()
                    cfgfile.close()
                    for k in range(len(cfg)):
                        if(cfg[k] == "lastgame"):
                            cfg[k+1] = "/Games/"+files[selpos]+"/"+files[selpos]+".py"
                    cfgfile = open("thumby.cfg", "w")
                    for k in range(len(cfg)):
                        cfgfile.write(cfg[k]+" ")
                    cfgfile.close()
                    os.chdir("/Games")
                    try:
                        #exec(open(files[selpos]+"/"+files[selpos]+".py").read())
                        gc.collect()
                        __import__(files[selpos]+"/"+files[selpos]+".py")
                    except ImportError:
                        print("Thumby error: Couldn't load "+files[selpos])
            if(scroll < 0):
                scroll += 1
            if(scroll > 0):
                scroll -= 1
            thumby.display.update()

time.sleep_ms(100)
#import SDCard
# Load the last ran game from conf
os.chdir("/")
cfgfile = open("thumby.cfg", "r")
cfg = cfgfile.read().split()
cfgfile.close()
for k in range(len(cfg)):
    if(cfg[k] == "lastgame"):
        try:
            gc.collect()
            if(cfg[k+1] != "none"):
                __import__(cfg[k+1])
            else:
                # Send user to the game loader
                selected == False
                while(selected == False):
                    thumby.display.fill(0)
                    thumby.display.drawText("Games", 0, 0)
                    if(selpos > 0 and len(files) > 0):
                        thumby.display.drawText(files[selpos-1][:8], 4, 8+scroll)
                    if(time.ticks_ms() % 1000 < 500):
                        thumby.display.fillRect(4, 16, len(files[selpos][:8])*8, 8+scroll, 0)
                        thumby.display.drawText(files[selpos][:8], 4, 16+scroll, 1)
                    else:
                        thumby.display.fillRect(4, 16, len(files[selpos][:8])*8, 8+scroll, 1)
                        thumby.display.drawText(files[selpos][:8], 4, 16+scroll, 0)
                    if(selpos < len(files)-1):
                        thumby.display.drawText(files[selpos+1][:8], 4, 24+scroll)
                    if(thumby.inputJustPressed() == True):
                        if(thumby.buttonU.pressed() == True):
                            if(selpos > 0):
                                selpos -= 1
                                scroll = -8
                            else:
                                xScrollTarget = -8
                                break
                        if(thumby.buttonD.pressed() == True):
                            if(selpos < len(files)-1):
                                selpos += 1
                                scroll = 8
                        if(thumby.buttonB.pressed() == True):
                            os.chdir("/")
                            cfgfile = open("thumby.cfg", "r")
                            cfg = cfgfile.read().split()
                            cfgfile.close()
                            for k in range(len(cfg)):
                                if(cfg[k] == "lastgame"):
                                    cfg[k+1] = "/Games/"+files[selpos]+"/"+files[selpos]+".py"
                            cfgfile = open("thumby.cfg", "w")
                            for k in range(len(cfg)):
                                cfgfile.write(cfg[k]+" ")
                            cfgfile.close()
                            os.chdir("/Games")
                            try:
                                #exec(open(files[selpos]+"/"+files[selpos]+".py").read())
                                gc.collect()
                                __import__(files[selpos]+"/"+files[selpos]+".py")
                            except ImportError:
                                print("Thumby error: Couldn't load "+files[selpos])
                    if(scroll < 0):
                        scroll += 1
                    if(scroll > 0):
                        scroll -= 1
                    thumby.display.update()
        except ImportError:
            print("Thumby error: Couldn't load "+cfg[k+1])
machine.reset()

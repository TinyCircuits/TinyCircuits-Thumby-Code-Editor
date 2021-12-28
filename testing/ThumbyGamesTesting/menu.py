
from machine import freq
freq(125000000)
from time import sleep_ms, ticks_ms, sleep_us, ticks_us
import os
import gc
import thumby
freq(48000000)

try:
    conf = open("thumby.cfg", "r").read().split(',')
    if(len(conf)<6):
        conf.append(',brightness,2')
except OSError:
    conf = open("thumby.cfg", "w")
    conf.write("audioenabled,1,lastgame,/Games/TinyBlocks/TinyBlocks.py,brightness,1")
    conf.close()

def getConfigSetting(key):
    cfgfile = open("thumby.cfg", "r")
    cfg = cfgfile.read().split(',')
    cfgfile.close()
    for k in range(len(cfg)):
        if(cfg[k] == key):
            return cfg[k+1]
    return False

def saveConfigSetting(key, setting):
    cfgfile = open("thumby.cfg", "r")
    cfg = cfgfile.read().split(',')
    cfgfile.close()
    for k in range(len(cfg)):
        if(cfg[k] == key):
            cfg[k+1] = setting
    cfgfile = open("thumby.cfg", "w")
    cfgfile.write(cfg[0])
    for k in range(1, len(cfg)):
        cfgfile.write(","+cfg[k])
    cfgfile.close()

audioSetting=int(getConfigSetting("audioenabled"))
brightnessSetting=int(getConfigSetting("brightness"))
audioSettings=['Audio: Off', 'Audio:  On']
brightnessSettings=['Brite: Low', 'Brite: Mid', 'Brite:  Hi']
brightnessVals=[0,28,127]
settings=[audioSettings[audioSetting], brightnessSettings[brightnessSetting]]


lines = []
lineCount = 0
lineLengths=[0,0,0,0, 0,0,0,0]
creditsScrollPosition = -1
width=(6*16 + 10)
firstLine = 0
creditsScrollOffset=-1
    

TCSplash=thumby.Sprite(72, 24, 'lib/TClogo.bin',0,0,-1)
thumbySplash=thumby.Sprite(72, 24, 'lib/thumbyLogo.bin',0,0,-1)


settingsBMonly = bytearray([81,81,85,69,69,127,65,65,85,85,93,127,125,65,65,125,127,125,65,65,125,127,93,65,65,93,127,65,65,115,103,65,65,127,65,65,93,85,69,69,127,81,81,85,69,69])
gamesBMonly =bytearray([65,65,93,85,69,69,127,67,65,117,65,67,127,65,65,115,103,115,65,65,127,65,65,85,85,93,127,81,81,85,69,69])
gamesBMonly +=bytearray([65,93,85,69,69,127,67,65,117,65,67,127,65,65,115,103,115,65,65,127,65,65,85,85,93,127,81,81,85,69,69,0xFF])

settingsHeader = thumby.Sprite(46, 7, settingsBMonly,key=-1)
gamesHeader = thumby.Sprite(32, 7, gamesBMonly,key=-1)

#thumbySplash = thumby.sprite(30, 30, 'bird.bin',0,0,-1)

thumby.display.setFPS(100)

thumbySplash.y = -37
while thumbySplash.y < 5:
    thumbySplash.y += 1
    TCSplash.y=thumbySplash.y+37
    thumby.display.fill(0)
    thumby.display.drawSprite(thumbySplash)
    thumby.display.drawSprite(TCSplash)
    thumby.display.update()
    
thumby.display.setFPS(50)

thumbyLogoHeight=thumbySplash.y



startTime=ticks_ms()
frameCounter=0
y=36
x=5
noButtonPress=True
moveHeight=0;

yScrollPos=0
yScrollTarget=0;

xScrollPos=0
xScrollTarget=0

selpos = -1
files = os.listdir("/Games")
selected = False
scroll = 0

for k in range(len(files)):
    if(os.stat("/Games/"+files[k])[0] != 16384):
        files[k] = ""
try:
    while(True):
        files.remove("")
except ValueError:
    pass
shortFiles= list(files)

for k in range(len(shortFiles)):
    if(len(shortFiles[k])>10):
        shortFiles[k]=shortFiles[k][0:8]+'..'

settingsSelpos = -1
SettingsScroll = 0

print(gc.mem_free())
print(gc.collect())
print(gc.mem_free())


def writeCenteredText(text, x, y ,color):
    textLen = min(len(text),10)
    thumby.display.drawText(text, x - ( textLen * 6) // 2 + 1, y,color)

rightArrowBA = bytearray([0b11111,0b01110,0b00100])
leftArrowBA = bytearray([0b00100,0b01110,0b11111])
rightArrowBAinv = bytearray([0b11111^0xff,0b01110^0xff,0b00100^0xff])
leftArrowBAinv = bytearray([0b00100^0xff,0b01110^0xff,0b11111^0xff])

def drawBracketsAround(text, x, y ,color):
    textLen = min(len(text),10)
    xc=x -(textLen * 6) // 2 -2
    if(color):
        thumby.display.blit(rightArrowBA, xc-1, y+1, 3, 5,-1,0,0)
    xc=x +(textLen * 6) // 2 +2
    #x=min(x,70)
    if(color):
        thumby.display.blit(leftArrowBA, xc-1, y+1, 3, 5,-1,0,0)
lastPosition=0
xOffset=0
def printList(nameList, position, x, y, longNames=None):
    offset1=0
    offset2=0
    pxWidth=0
    global lastPosition
    global xOffset
    if(longNames):
        if position is not lastPosition:
            lastPosition=position
            xOffset=0
        if(position==0 and len(longNames[0])>10):
            xOffset+=1
            pxWidth= len(longNames[0])*6
            offset1=xOffset%pxWidth
        if(position>=1 and len(longNames[position])>10):
            xOffset+=1
            pxWidth= len(longNames[position])*6 +20
            offset2=xOffset%pxWidth
    actualPosition = position
    position = max(position,1)
    if(position > 1 and len(nameList) > 0 and 0+scroll>1):
        writeCenteredText(nameList[position-2], x, y+0,1)
    if(position > 0 and len(nameList) > 0):
        if(longNames and actualPosition==0 and len(longNames[0])>10):
            writeCenteredText(longNames[position-1], x-offset1, y+8,1)
            writeCenteredText(longNames[position-1], x-offset1+pxWidth, y+8,1)
            thumby.display.drawFilledRectangle(0,y+8,8,8,0)
            thumby.display.drawFilledRectangle(72-8,y+8,8,8,0)
        else:
            writeCenteredText(nameList[position-1], x, y+8,1)
    if(position>=0):
        if(longNames and actualPosition>=1 and len(longNames[position])>10):
            writeCenteredText(longNames[position], x-offset2, y+16, 1)
            writeCenteredText(longNames[position], x-offset2+pxWidth, y+16, 1)
            thumby.display.drawFilledRectangle(0,y+16,6,8,0)
            thumby.display.drawFilledRectangle(72-6,y+16,6,8,0)
        else:
            writeCenteredText(nameList[position], x, y+16, 1)
    if(position < len(nameList)-1):
        writeCenteredText(nameList[position+1], x, y+24,1)
    if(position < len(nameList)-2):
        writeCenteredText(nameList[position+2], x, y+32,1)
    if(position < len(nameList)-3):
        writeCenteredText(nameList[position+3], x, y+40,1)

def launchGame():
    if(selpos>=0):
        gamePath="/Games/"+files[selpos]+"/"+files[selpos]+".py"
        saveConfigSetting("lastgame", gamePath)
    import machine
    #Address of watchdog timer scratch register
    WATCHDOG_BASE=0x40058000
    SCRATCH0_ADDR=WATCHDOG_BASE+0x0C
    machine.mem32[SCRATCH0_ADDR]=1
    machine.soft_reset()


while True:
    thumbySplash.setFrame(thumbySplash.currentFrame+1)
    start = ticks_us()
    if(yScrollTarget!=yScrollPos):
        if(yScrollTarget>yScrollPos):
            yScrollPos += 1
            if(abs(yScrollTarget-yScrollPos)>4):
                yScrollPos += 1
            if(abs(yScrollTarget-yScrollPos)>12):
                yScrollPos += 2
        elif(yScrollTarget<yScrollPos):
            yScrollPos -= 1
            if(abs(yScrollTarget-yScrollPos)>4):
                yScrollPos -= 1
            if(abs(yScrollTarget-yScrollPos)>12):
                yScrollPos -= 2
    if(xScrollTarget!=xScrollPos):
        if(xScrollTarget>xScrollPos):
            xScrollPos += 1
            if(abs(xScrollTarget-xScrollPos)>4):
                xScrollPos += 1
            if(abs(xScrollTarget-xScrollPos)>12):
                xScrollPos += 2
        elif(xScrollTarget<xScrollPos):
            xScrollPos -= 1
            if(abs(xScrollTarget-xScrollPos)>4):
                xScrollPos -= 1
            if(abs(xScrollTarget-xScrollPos)>12):
                xScrollPos -= 2
    thumby.display.fill(0)
    thumbySplash.x=xScrollPos-xScrollPos
    thumbySplash.y=yScrollPos+thumbyLogoHeight
    thumby.display.drawSprite(thumbySplash)
    
    color= ((ticks_ms()-startTime)//500)&1 if yScrollTarget==0 else 1
    writeCenteredText("Start", xScrollPos-xScrollPos + thumby.display.width//2, yScrollPos+32-2,1)
    drawBracketsAround("Start", xScrollPos-xScrollPos + thumby.display.width//2, yScrollPos+32-2,1-color)
    
    
    if(noButtonPress):
        thumby.display.drawLine(yScrollPos+x-2,y-2,yScrollPos+x,y,0)
        thumby.display.drawLine(yScrollPos+x,y,yScrollPos+x+2,y-2,0)
        if(yScrollPos == 0):
            frame=frameCounter%6
            if(frame<3):
                y+=1
            else:
                y-=1
            thumby.display.drawLine(x-2,y-2,x,y,1)
            thumby.display.drawLine(x,y,x+2,y-2,1)
    
    

    if(72>xScrollPos>-72):
        thumby.display.drawFilledRectangle(xScrollPos, max(0,yScrollPos+40), 72, 7,1)
        scrollDisplayed=scroll
        if(selpos<1 or (selpos==1 and scroll>0)):
            scrollDisplayed=0
        printList(shortFiles, selpos, xScrollPos + thumby.display.width//2, yScrollPos+40+scrollDisplayed, files)
        selectOffset= 16
        if(selpos<2):
            selectOffset = selpos*8+8
            
        #thumby.display.blit(gamesBM, xScrollPos + 72//2 - 32//2 +1, max(0,yScrollPos+40), 32, 7, -1,0,0)
        gamesHeader.x= xScrollPos + 72//2 - 32//2 +1
        gamesHeader.y= max(0,yScrollPos+40)
        #gamesHeader.setFrame( frameCounter%2)
        thumby.display.drawSprite(gamesHeader)
        
        if(ticks_ms() % 1000 < 500 and selpos<0 and yScrollTarget == -40 and xScrollTarget == 0):
            thumby.display.blit(rightArrowBAinv, xScrollPos + 65, yScrollPos+40 +1, 3, 5,1,0,0)
        if(ticks_ms() % 1000 < 500 and selpos>=0):
            drawBracketsAround(files[selpos], xScrollPos + thumby.display.width//2, yScrollPos+40+selectOffset+scrollDisplayed, 1)
        

    if(0>xScrollPos>-144):
        thumby.display.drawFilledRectangle(xScrollPos+72, max(0,yScrollPos+40), 72, 7,1)
        scrollDisplayed=scroll
        if(settingsSelpos<1 or (settingsSelpos==1 and scroll>0)):
            scrollDisplayed=0
        selectOffset= 16
        if(settingsSelpos<2):
            selectOffset = settingsSelpos*8+8
        printList(settings, settingsSelpos, 72+xScrollPos + thumby.display.width//2, yScrollPos+40+scrollDisplayed)
        if(ticks_ms() % 1000 < 500 and settingsSelpos>=0):
            drawBracketsAround(settings[settingsSelpos], 72+xScrollPos + thumby.display.width//2, yScrollPos+40+selectOffset+scrollDisplayed, 1)
        
        #thumby.display.blit(settingsBM, 72+xScrollPos + 72//2 - 46//2 +1, max(0,yScrollPos+40), 46, 7, -1,0,0)
        settingsHeader.x=72+xScrollPos + 72//2 - 46//2 +1
        settingsHeader.y=max(0,yScrollPos+40)
        thumby.display.drawSprite(settingsHeader)
        
        if(ticks_ms() % 1000 < 500 and settingsSelpos<0 and yScrollTarget == -40 and xScrollTarget == -72):
            thumby.display.blit(leftArrowBAinv, 72+xScrollPos + 6, yScrollPos+40 +1, 3, 5,1,0,0)
            thumby.display.blit(rightArrowBAinv, 72+xScrollPos + 65, yScrollPos+40 +1, 3, 5,1,0,0)

    if(scroll < 0):
        scroll += 1
        if(scroll < -4):
            scroll += 1
    if(scroll > 0):
        scroll -= 1
        if(scroll > 4):
            scroll -= 1
    
    
    if(-72>xScrollPos>-216 and xScrollTarget!=-72):
        thumby.display.drawText("Special", xScrollPos+144 + 72//2 - ( 7 * 6) // 2, 0 ,1)
        thumby.display.drawText("Thanks From", xScrollPos+144 + 72//2 - ( 11 * 6) // 2, 10 ,1)
        thumby.display.drawText("TinyCircuits", xScrollPos+144 + 72//2 - ( 12 * 6) // 2, 20 ,1)
        thumby.display.drawText("To...", xScrollPos+144 + 72//2 - ( 5 * 6) // 2, 30 ,1)
        if(xScrollPos==xScrollTarget):
            thumby.display.update()
            file = open('/lib/credits.txt','r')
            lines = file.readlines()
            lineCount = len(lines)
            for i in range(12):
                lines.append(" ")

            for i in range(len(lines)):
                if(len(lines[i])>16):
                    lines[i] = lines[i][0:17]

            lineLengths=[0,0,0,0, 0,0,0,0]

            creditsScrollPosition = -2
            width=(6*16 + 10)
            firstLine = (abs(creditsScrollPosition+1)//width*1) * 4
            for i in range(8):
                lineLengths[i]=len(lines[firstLine+i])
            creditsScrollOffset = (creditsScrollPosition)%(width)
            xScrollTarget = -216
            noButtonPress = True
            sleep_ms(100)
                    
    if(xScrollPos<-144 or (xScrollTarget==-72 and xScrollPos<-72)):
        if(xScrollPos==-216):
            if(thumby.buttonL.pressed()):
                if(creditsScrollPosition <-2):
                    creditsScrollPosition+=5
                else:
                    xScrollTarget=-72
            if(thumby.buttonR.pressed()):
                if(creditsScrollPosition > -((lineCount*width)//4)-100):
                    creditsScrollPosition-=5
            if(noButtonPress):
                if(creditsScrollPosition > -((lineCount*width)//4)-100):
                    creditsScrollPosition-=1
        if(thumby.buttonL.pressed() or thumby.buttonR.pressed() or noButtonPress):
            firstLine = (abs(creditsScrollPosition+1)//width*1) * 4
            for i in range(8):
                lineLengths[i]=len(lines[firstLine+i])
            creditsScrollOffset = (creditsScrollPosition)%(width)
        for i in range(4):
            thumby.display.drawText(lines[firstLine+i], xScrollPos+216 + creditsScrollOffset - 72//2 - ( lineLengths[i] * 6) // 2 -5, 0+(i)*10,1)
            thumby.display.drawText(lines[firstLine+i+4], xScrollPos+216 + creditsScrollOffset - 72//2 - ( lineLengths[i+4] * 6) // 2 -5 +width, 0+(i)*10,1)
        if(thumby.buttonB.pressed()):
            xScrollTarget=-72
        thumby.display.setPixel((creditsScrollPosition *71 // -((lineCount*width)//4))-1, 39, 1)
        thumby.display.setPixel((creditsScrollPosition *71 // -((lineCount*width)//4)), 39, 1)
        thumby.display.setPixel((creditsScrollPosition *71 // -((lineCount*width)//4))+1, 39, 1)
    
    
    thumby.display.update()
#     frameTimeRemaining = 28-(ticks_us() - start)//1000
#     if(frameTimeRemaining>0):
#         sleep_ms(frameTimeRemaining)
#         
    #print(ticks_us() - start)
    #machine.idle()
    #sleep_ms(100)
    frameCounter+=1
    
    if(thumby.inputJustPressed()):
        if(noButtonPress):
            noButtonPress = False
        if(thumby.buttonD.pressed()):
            if(yScrollTarget == 0 and yScrollPos == yScrollTarget):
                yScrollTarget = -40
            elif(yScrollTarget <= -40 and yScrollPos == yScrollTarget):
                if(xScrollTarget == 0 and selpos < len(files)-1):
                    selpos += 1
                    scroll = 8
                if(xScrollTarget == -72 and settingsSelpos < len(settings)-1):
                    settingsSelpos += 1
                    scroll = 8
        if(thumby.buttonU.pressed()):
            if(yScrollPos == yScrollTarget):
                if(xScrollTarget == 0):
                    if(selpos > 0):
                        selpos -= 1
                        scroll = -8
                    else:
                        if(selpos>-1):
                            selpos=-1
                        else:
                            yScrollTarget=0
                if(xScrollTarget == -72):
                    if(settingsSelpos > 0):
                        settingsSelpos -= 1
                        scroll = -8
                    else:
                        if(settingsSelpos>-1):
                            settingsSelpos=-1
                        else:
                            yScrollTarget=0
                            xScrollTarget=0
        if(thumby.buttonR.pressed()):
            if(yScrollPos == -40 and yScrollPos == yScrollTarget):
                if(xScrollTarget == 0 and xScrollPos == xScrollTarget and selpos==-1 and settingsSelpos==-1):
                    xScrollTarget = -72
                if(xScrollTarget == -72 and xScrollPos == xScrollTarget and selpos==-1 and settingsSelpos==-1):
                    xScrollTarget = -144
                if(xScrollTarget == -144 and xScrollPos == xScrollTarget and selpos==-1 and settingsSelpos==-1):
                    xScrollTarget = -216
        if(thumby.buttonL.pressed()):
            if(yScrollPos == -40 and yScrollPos == yScrollTarget):
                if(xScrollTarget == -72 and xScrollPos == xScrollTarget and selpos==-1 and settingsSelpos==-1):
                    xScrollTarget = 0
        if(thumby.buttonA.pressed() or thumby.buttonB.pressed()):
            if(yScrollTarget == 0 and xScrollTarget == 0):
                launchGame() #start selection
            if(yScrollTarget <= -40):
                if(xScrollTarget == 0 and selpos>=0):
                    launchGame()
                if(xScrollTarget == -72):
                    if(settingsSelpos==0):
                        audioSetting= (audioSetting+1) % 2
                        thumby.audio.setEnabled(audioSetting)
                        print(audioSetting)
                        saveConfigSetting("audioenabled", str(audioSetting))
                        thumby.audio.play(500,20)
                    if(settingsSelpos==1):
                        brightnessSetting= (brightnessSetting+1) % 3
                        thumby.display.brightness(brightnessVals[brightnessSetting])
                        saveConfigSetting("brightness", str(brightnessSetting))
                    settings=[audioSettings[audioSetting], brightnessSettings[brightnessSetting]]
        #print(ticks_us() - start)




machine.reset()

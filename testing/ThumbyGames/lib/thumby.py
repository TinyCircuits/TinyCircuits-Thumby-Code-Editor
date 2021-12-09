# Thumby module.

# Contains helpful abstractions between hardware features of Thumby and the uPython REPL.

# Written by Mason Watmough and Ben Rose for TinyCircuits.
# Last edited 12/01/2021

'''
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
'''

# Necessary things.
from time import ticks_ms, ticks_us, sleep_ms
from machine import Pin, Timer, I2C, PWM, SPI
import ssd1306
import os

__version__ = '1.0'

# Pin definitions for button inputs & buzzer.
swL = Pin(3, Pin.IN, Pin.PULL_UP) # D-pad left
swR = Pin(5, Pin.IN, Pin.PULL_UP) # D-pad right
swU = Pin(4, Pin.IN, Pin.PULL_UP) # D-pad up
swD = Pin(6, Pin.IN, Pin.PULL_UP) # D-pad down
swA = Pin(27, Pin.IN, Pin.PULL_UP) # right (A) action button
swB = Pin(24, Pin.IN, Pin.PULL_UP) # left (B) action button
swBuzzer = PWM(Pin(28))

HWID = 0
IDPin = Pin(15, Pin.IN, Pin.PULL_UP)
if(IDPin.value() == 0):
    HWID+=1
IDPin = Pin(14, Pin.IN, Pin.PULL_UP)
if(IDPin.value() == 0):
    HWID+=2
IDPin = Pin(13, Pin.IN, Pin.PULL_UP)
if(IDPin.value() == 0):
    HWID+=4
IDPin = Pin(12, Pin.IN, Pin.PULL_UP)
if(IDPin.value() == 0):
    HWID+=8
IDPin = Pin(15, Pin.IN, Pin.PULL_DOWN)
IDPin = Pin(14, Pin.IN, Pin.PULL_DOWN)
IDPin = Pin(13, Pin.IN, Pin.PULL_DOWN)
IDPin = Pin(12, Pin.IN, Pin.PULL_DOWN)

i2c = None
spi = None
if(HWID==0):
    i2c = I2C(0, sda=Pin(16), scl=Pin(17), freq=1000000)
if(HWID==1):
    spi = SPI(0, sck=Pin(18), mosi=Pin(19))#possible assignment of miso to 4 or 16?

class ButtonClass:
    def __init__(self, pin):
        self.pin = pin
        self.lastState = False
        self.latchedPress = False
    
    # Returns True if the button is currently pressed, False if not.
    @micropython.native
    def pressed(self):
        return False if self.pin.value() == 1 else True
    
    # Returns True if the button was just pressed, False if not.
    @micropython.native
    def justPressed(self):
        returnVal=False
        currentState=self.pressed()
        if(self.lastState == False and currentState==True):
            returnVal = True
        if(self.latchedPress):
            returnVal = True
            self.latchedPress = False
        self.lastState = currentState
        return returnVal
    
    # Latches a button press state to be returned later through justPressed
    @micropython.native
    def update(self):
        currentState=self.pressed()
        if(self.lastState == False and currentState==True):
            self.latchedPress = True
        self.lastState = currentState

# Audio class, from which the audio namespace is defined.
class AudioClass:
    def __init__(self, pwm):
        self.timer = Timer()
        self.pwm = pwm
        self.enabled = True
        try:
            conf = open("thumby.cfg", "r").read().split()
            for k in range(len(conf)):
                if(conf[k] == "audioenabled"):
                    self.enabled = True if(conf[k+1] == "1") else False
        except:
            pass

    # Stop audio.
    @micropython.native
    def stop(self, dummy = None): # I have no idea why it needs the second dummy argument. The timer interrupt won't work without it. Shouldn't affect functionality whatsoever.
        self.pwm.duty_u16(0)

    # Set the frequency and duty of the PWM audio if currently enabled.
    @micropython.native
    def set(self, freq, duty = 32768):
        if(self.enabled == True):
            self.pwm.freq(freq)
            self.pwm.duty_u16(duty)

    # Set the audio as enabled or disabled.
    @micropython.native
    def setEnabled(self, setting = True):
        self.enabled = setting

    # Play a given frequency for the duration with a given duty cycle for PWM audio. Returns before audio is done playing.
    @micropython.native
    def play(self, freq, duration, duty = 32768):
        if(self.enabled == True):
            self.pwm.freq(freq)
            self.pwm.duty_u16(duty)
            self.timer.init(period = duration, mode = Timer.ONE_SHOT, callback = self.stop)

    # Play a given frequency for the duration with a given duty cycle for PWM audio. Returns after audio is done playing.
    @micropython.native
    def playBlocking(self, freq, duration, duty = 32768):
        if(self.enabled == True):
            self.pwm.freq(freq)
            self.pwm.duty_u16(duty)
            t0 =ticks_ms()
            while(ticks_ms() - t0 <= duration):
                pass
            self.stop()
        else:
            while(ticks_ms() - t0 <= duration):
                pass


# Sprite class for holding pixel data 
class Sprite:
    @micropython.native
    def __init__(self, width, height, bitmapData, x = 0, y=0, key=-1, mirrorX=False, mirrorY=False):
        self.width = width
        self.height = height
        self.bitmapSource = bitmapData
        self.bitmapByteCount = width*(height//8)
        if(height%8):
            self.bitmapByteCount+=width
        self.frameCount = 1
        self.currentFrame = 0
        if type(self.bitmapSource)==str:
            self.bitmap = bytearray(self.bitmapByteCount)
            f = open(self.bitmapSource,'rb')
            f.readinto(self.bitmap)
            f.close()
            self.frameCount = os.stat(self.bitmapSource)[6] // self.bitmapByteCount
        elif type(self.bitmapSource)==bytearray:
            self.bitmap = memoryview(self.bitmapSource)[0:self.bitmapByteCount]
            self.frameCount = len(self.bitmapSource) // self.bitmapByteCount
        self.x = x
        self.y = y
        self.key = key
        self.mirrorX = mirrorX
        self.mirrorY = mirrorY

    @micropython.native
    def getFrame(self):
        return self.currentFrame

    @micropython.native
    def setFrame(self, frame):
        if(frame >= 0 and (self.currentFrame is not frame % (self.frameCount))):
            self.currentFrame = frame % (self.frameCount)
            offset=self.bitmapByteCount*self.currentFrame
            if type(self.bitmapSource)==str:
                f = open(self.bitmapSource,'rb')
                f.seek(offset)
                f.readinto(self.bitmap)
                f.close()
            elif type(self.bitmapSource)==bytearray:
                self.bitmap = memoryview(self.bitmapSource)[offset:offset+self.bitmapByteCount]


# Graphics class, from which the gfx namespace is defined.
class GraphicsClass:
    def __init__(self, display, width, height):
        self.display = display
        self.width = width
        self.height = height
        self.max_x = width-1
        self.max_y = height-1
        self.frameRate = 30
        self.lastUpdateStart = 0
        self.setFont('lib/font5x7.bin', 5, 7, 1)
        #self.setFont('lib/font8x8.bin', 8, 8, 0)

    @micropython.native
    def setFont(self, fontFile, width, height, space):
        self.textBitmapSource = fontFile
        self.textBitmapFile = open(self.textBitmapSource)
        self.textWidth = width
        self.textHeight = height
        self.textSpaceWidth = space
        self.textBitmap = bytearray(self.textWidth)
        self.textCharCount = os.stat(self.textBitmapSource)[6] // self.textWidth
        
    @micropython.native
    def setFPS(self, newFrameRate):
        self.frameRate = newFrameRate

    # Push the buffer to the hardware display.
    @micropython.native
    def update(self):
        self.display.show()
        if self.frameRate>0:
            frameTimeRemaining = round(1000/self.frameRate) - (ticks_ms()-self.lastUpdateStart)
            while(frameTimeRemaining>0):
                buttonA.update()
                buttonB.update()
                buttonU.update()
                buttonD.update()
                buttonL.update()
                buttonR.update()
                sleep_ms(1)
                frameTimeRemaining = round(1000/self.frameRate) - (ticks_ms()-self.lastUpdateStart)
        self.lastUpdateStart=ticks_ms()

    # Set display brightness, valid values 0 to 127
    @micropython.native
    def brightness(self,setting):
        if(setting>127):
            setting=127
        if(setting<0):
            setting=0
        self.display.contrast(setting)

    # Fill the buffer with a given color.
    @micropython.viper
    def fill(self, color:int):
        buf = ptr8(self.display.buffer)
        if int(color)==int(0):
            for i in range(int(len(self.display.buffer))):
                buf[int(i)]=0
        else:
            for i in range(int(len(self.display.buffer))):
                buf[i]=0xff

    @micropython.viper
    def setPixel(self, x:int, y:int, color:int):
        if not 0<=x<int(self.width):
            return
        if not 0<=y<int(self.height):
            return
        buf = ptr8(self.display.buffer)
        if(color==int(1)):
            buf[(y >> 3) * int(self.width) + x] |= 1 << (y & 0x07)
        if(color==int(0)):
            buf[(y >> 3) * int(self.width) + x] &= 0xff ^ (1 << (y & 0x07))

    
    @micropython.viper
    def getPixel(self, x:int, y:int) -> int:
        if not 0<=x<int(self.width):
            return 0
        if not 0<=y<int(self.height):
            return 0
        buf = ptr8(self.display.buffer)
        if(buf[(y >> 3) * int(self.width) + x] & 1 << (y & 0x07)):
            return 1
        return 0

    # Draw a line from (x1, y1) to (x2, y2) in a given color- taken from MicroPython FrameBuf implementation
    @micropython.viper
    def drawLine(self, x1:int, y1:int, x2:int, y2:int, color:int):
        buf = ptr8(self.display.buffer)
        dx = int(x2 - x1)
        sx = int(1)
        if (dx <= 0):
            dx = 0-dx
            sx = 0-1

        dy = int(y2 - y1)
        sy = int(1)
        if (dy <= 0):
            dy = 0-dy
            sy = 0-1

        steep = False
        if (dy > dx):
            temp = x1
            x1 = y1
            y1 = temp
            temp = dx
            dx = dy
            dy = temp
            temp = sx
            sx = sy
            sy = temp
            steep = True
        
        e = 2 * dy - dx
        for i in range(dx):
            if (steep):
                if (0 <= y1 and y1 < int(self.width) and 0 <= x1 and x1 < int(self.height)):
                    if(color==int(1)):
                        buf[(x1 >> 3) * int(self.width) + y1] |= 1 << (x1 & 0x07)
                    if(color==int(0)):
                        buf[(x1 >> 3) * int(self.width) + y1] &= 0xff ^ (1 << (x1 & 0x07))
            else:
                if (0 <= x1 and x1 < int(self.width) and 0 <= y1 and y1 < int(self.height)):
                    if(color==int(1)):
                        buf[(y1 >> 3) * int(self.width) + x1] |= 1 << (y1 & 0x07)
                    if(color==int(0)):
                        buf[(y1 >> 3) * int(self.width) + x1] &= 0xff ^ (1 << (y1 & 0x07))
            while (e >= 0) :
                y1 += sy
                e -= 2 * dx
            x1 += sx
            e += 2 * dy

        if (0 <= x2 and x2 < int(self.width) and 0 <= y2 and y2 < int(self.height)):
            if(color==int(1)):
                buf[(y2 >> 3) * int(self.width) + x2] |= 1 << (y2 & 0x07)
            if(color==int(0)):
                buf[(y2 >> 3) * int(self.width) + x2] &= 0xff ^ (1 << (y2 & 0x07))

    @micropython.viper
    def drawRectangle(self, x:int, y:int, width:int, height:int, color:int):
        self.drawLine(x, y, x+width-1, y, color)
        self.drawLine(x+width-1, y, x+width-1, y+height-1, color)
        self.drawLine(x, y, x, y+height-1, color)
        self.drawLine(x, y+height-1, x+width-1, y+height-1, color)

    # Fill a rectangle with top left corner (x, y) and size (width, height) in a given color.
    @micropython.viper
    def drawFilledRectangle(self, x:int, y:int, width:int, height:int, color:int):
        width-=1
        height-=1
        if(x+width<0 or x>71):
            return
        if(y+height<0 or y>39):
            return
        if(x<0):
            width+=x
            x=0
        if(y<0):
            height+=y
            y=0
        if(x+width>int(self.max_x)):
            width=int(self.max_x)-x
        if(y+height>int(self.max_y)):
            height=int(self.max_y)-y
        buf = ptr8(self.display.buffer)
        yMax=y+height+1
        if(color==int(0)):
            while y < yMax:
                px=x
                while px < x+width+1:
                    buf[(y >> 3) * int(self.width) + px] &= 0xff ^ (1 << (y & 0x07))
                    px+=1
                y+=1
        else:
            while y < yMax:
                px=x
                while px < x+width+1:
                    buf[(y >> 3) * int(self.width) + px] |= 1 << (y & 0x07)
                    px+=1
                y+=1

    # Draw a string with top left corner (x, y) in a given color.
    @micropython.viper
    def drawText(self, stringToPrint:ptr8, x:int, y:int, color:int):
        xPos=int(x)
        charNum=uint(0)
        charBitMap=uint(0)
        ptr = ptr8(self.display.buffer)
        sprtptr = ptr8(self.textBitmap)
        screenWidth=int(self.width)
        while(stringToPrint[charNum]):
            charBitMap=uint(stringToPrint[charNum] - 0x20)
            if uint(0) <= charBitMap <= uint(self.textCharCount):
                if xPos+int(self.textWidth)>0 and xPos<int(self.width) and y+int(self.textHeight)>0 and y<int(self.height):
                    self.textBitmapFile.seek(uint(self.textWidth)*uint(charBitMap))
                    self.textBitmapFile.readinto(self.textBitmap)
                    xStart=int(xPos)
                    yStart=int(y)
                    width=int(self.textWidth)
                    height=int(self.textHeight)
                    yFirst=0-yStart
                    if yFirst<0:
                        yFirst=0
                    if yStart+height>39:
                        height = 39-yStart
                    yb=int(yFirst)
                    xFirst=0-xStart
                    blitWidth=width
                    if xFirst<0:
                        xFirst=0
                    if xStart+width>72:
                        blitWidth = 72-xStart
                    if(int(color)==int(0)):
                        while yb < height:
                            x=xFirst
                            while x < blitWidth:
                                if(sprtptr[(yb >> 3) * width + x] & (1 << (yb & 0x07))):
                                    ptr[((yStart+yb) >> 3) * screenWidth + xStart+x] &= 0xff ^ (1 << (yStart+yb & 0x07))
                                x+=1
                            yb+=1
                    else:
                        while yb < height:
                            x=xFirst
                            while x < blitWidth:
                                if(sprtptr[(yb >> 3) * width + x] & (1 << (yb & 0x07))):
                                    ptr[((yStart+yb) >> 3) * screenWidth + xStart+x] |= 1 << ((yStart+yb) & 0x07)
                                x+=1
                            yb+=1
            charNum+=1
            xPos+=(uint(self.textWidth)+uint(self.textSpaceWidth))

    @micropython.viper
    def blit(self, sprtptr:ptr8, x:int, y:int, width:int, height:int, key:int, mirrorX:int, mirrorY:int):
        if(x+width<0 or x>int(self.max_x)):
            return
        if(y+height<0 or y>int(self.max_y)):
            return
        xStart=int(x)
        yStart=int(y)
        ptr = ptr8(self.display.buffer)
        
        yFirst=0-yStart
        blitHeight=height
        if yFirst<0:
            yFirst=0
        if yStart+height>40:
            blitHeight = 40-yStart
        
        xFirst=0-xStart
        blitWidth=width
        if xFirst<0:
            xFirst=0
        if xStart+width>72:
            blitWidth = 72-xStart
        #print(y, yFirst, blitHeight, height)
        y=yFirst
        if(key==0):
            while y < blitHeight:
                x=xFirst
                while x < blitWidth:
                    if(sprtptr[((height-1-y if mirrorY==1 else y) >> 3) * width + (width-1-x if mirrorX==1 else x)] & (1 << ((height-1-y if mirrorY==1 else y) & 0x07))):
                        ptr[((yStart+y) >> 3) * int(72) + xStart+x] |= 1 << ((yStart+y) & 0x07)
                    x+=1
                y+=1
        elif(key==1):
            while y < blitHeight:
                x=xFirst
                while x < blitWidth:
                    if(sprtptr[((height-1-y if mirrorY==1 else y) >> 3) * width + (width-1-x if mirrorX==1 else x)] & (1 << ((height-1-y if mirrorY==1 else y) & 0x07))==0):
                        ptr[((yStart+y) >> 3) * int(72) + xStart+x] &= 0xff ^ (1 << ((yStart+y) & 0x07))
                    x+=1
                y+=1
        else:
            while y < blitHeight:
                x=xFirst
                while x < blitWidth:
                    if(sprtptr[((height-1-y if mirrorY==1 else y) >> 3) * width + (width-1-x if mirrorX==1 else x)] & (1 << ((height-1-y if mirrorY==1 else y) & 0x07))):
                        ptr[((yStart+y) >> 3) * int(72) + xStart+x] |= 1 << ((yStart+y) & 0x07)
                    else:
                        ptr[((yStart+y) >> 3) * int(72) + xStart+x] &= 0xff ^ (1 << ((yStart+y) & 0x07))
                    x+=1
                y+=1

    # Draw a sprite to the screen
    @micropython.native
    def drawSprite(self, s):
        self.blit(s.bitmap, s.x, s.y, s.width, s.height, s.key, s.mirrorX, s.mirrorY)

    @micropython.viper
    def blitWithMask(self, sprtptr:ptr8, x:int, y:int, width:int, height:int, key:int, mirrorX:int, mirrorY:int, maskptr:ptr8):
        if(x+width<0 or x>int(self.max_x)):
            return
        if(y+height<0 or y>int(self.max_y)):
            return
        xStart=int(x)
        yStart=int(y)
        ptr = ptr8(self.display.buffer)
        
        yFirst=0-yStart
        blitHeight=height
        if yFirst<0:
            yFirst=0
        if yStart+height>40:
            blitHeight = 40-yStart
        
        xFirst=0-xStart
        blitWidth=width
        if xFirst<0:
            xFirst=0
        if xStart+width>72:
            blitWidth = 72-xStart
        #print(y, yFirst, blitHeight, height)
        y=yFirst
        if(key==key):#ignore key value?
            while y < blitHeight:
                x=xFirst
                while x < blitWidth:
                    if(maskptr[((height-1-y if mirrorY==1 else y) >> 3) * width + (width-1-x if mirrorX==1 else x)] & (1 << ((height-1-y if mirrorY==1 else y) & 0x07))):
                        if(sprtptr[((height-1-y if mirrorY==1 else y) >> 3) * width + (width-1-x if mirrorX==1 else x)] & (1 << ((height-1-y if mirrorY==1 else y) & 0x07))):
                            ptr[((yStart+y) >> 3) * int(72) + xStart+x] |= 1 << ((yStart+y) & 0x07)
                        else:
                            ptr[((yStart+y) >> 3) * int(72) + xStart+x] &= 0xff ^ (1 << ((yStart+y) & 0x07))
                    x+=1
                y+=1

    @micropython.native
    def drawSpriteWithMask(self, s, m):
        self.blitWithMask(s.bitmap, s.x, s.y, s.width, s.height, s.key, s.mirrorX, s.mirrorY, m.bitmap)

# Button instantiation
buttonA = ButtonClass(swA) # Left (A) button
buttonB = ButtonClass(swB) # Right (B) button
buttonU = ButtonClass(swU) # D-pad up
buttonD = ButtonClass(swD) # D-pad down
buttonL = ButtonClass(swL) # D-pad left
buttonR = ButtonClass(swR) # D-pad right

# Audio instantiation
audio = AudioClass(swBuzzer)

# Graphics instantiation
display=None
if(i2c):
    display = GraphicsClass(ssd1306.SSD1306_I2C(72, 40, i2c, res=Pin(18)), 72, 40)
if(spi):
    display = GraphicsClass(ssd1306.SSD1306_SPI(72, 40, spi, dc=Pin(17), res=Pin(20), cs=Pin(16)), 72, 40)

# Returns true if any buttons are currently pressed on the thumby.
@micropython.native
def inputPressed():
    return (buttonA.pressed() or buttonB.pressed() or buttonU.pressed() or buttonD.pressed() or buttonL.pressed() or buttonR.pressed())

# Returns true if any buttons were just pressed on the thumby.
@micropython.native
def inputJustPressed():
    return (buttonA.justPressed() or buttonB.justPressed() or buttonU.justPressed() or buttonD.justPressed() or buttonL.justPressed() or buttonR.justPressed())

# Returns true if any dpad buttons are currently pressed on the thumby.
@micropython.native
def dpadPressed():
    return (buttonU.pressed() or buttonD.pressed() or buttonL.pressed() or buttonR.pressed())

# Returns true if any dpad buttons were just pressed on the thumby.
@micropython.native
def dpadJustPressed():
    return (buttonU.justPressed() or buttonD.justPressed() or buttonL.justPressed() or buttonR.justPressed())

# Returns true if either action button is pressed on the thumby.
@micropython.native
def actionPressed():
    return (buttonA.pressed() or buttonB.pressed())

# Returns true if either action button was just pressed on the thumby.
@micropython.native
def actionJustPressed():
    return (buttonA.justPressed() or buttonB.justPressed())


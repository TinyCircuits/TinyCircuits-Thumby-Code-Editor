# thumby module.

# Contains helpful abstractions between hardware features of Thumby and the uPython REPL.

# Written by Mason Watmough for TinyCircuits.
# Last edited 09/09/2021


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
import machine
import ssd1306
import time
from framebuf import FrameBuffer, MONO_VLSB


# Hardware pins.
sda=machine.Pin(16)
scl=machine.Pin(17)
i2c = machine.I2C(0, sda=sda, scl=scl, freq=1000000)


# Pin definitions for button inputs & buzzer.
BUTTON_L = 3 # D-pad left
BUTTON_R = 5 # D-pad right
BUTTON_U = 4 # D-pad up
BUTTON_D = 6 # D-pad down
BUTTON_A = 24 # left (A) action button
BUTTON_B = 27 # right (B) action button

swL = machine.Pin(BUTTON_L, machine.Pin.IN, machine.Pin.PULL_UP)
swR = machine.Pin(BUTTON_R, machine.Pin.IN, machine.Pin.PULL_UP)
swU = machine.Pin(BUTTON_U, machine.Pin.IN, machine.Pin.PULL_UP)
swD = machine.Pin(BUTTON_D, machine.Pin.IN, machine.Pin.PULL_UP)
swA = machine.Pin(BUTTON_A, machine.Pin.IN, machine.Pin.PULL_UP)
swB = machine.Pin(BUTTON_B, machine.Pin.IN, machine.Pin.PULL_UP)

swBuzzer = machine.PWM(machine.Pin(28))


# Other constants.
DISPLAY_W = const(72)
DISPLAY_H = const(40)


# Button class, from which all thumby buttons are defined.
class ButtonClass:
    def __init__(self, pin):
        self.pin = pin
        self.lastState = False
    
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
        self.lastState = currentState
        return returnVal


# Audio class, from which the audio namespace is defined.
class AudioClass:
    def __init__(self, pwm):
        self.timer = machine.Timer()
        self.pwm = pwm
        conf = open("thumby.cfg", "r").read().split()
        self.enabled = True
        for k in range(len(conf)):
            if(conf[k] == "audioenabled"):
                self.enabled = True if(conf[k+1] == "1") else False
    
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
    def set_enabled(self, setting = True):
        self.enabled = setting
    
    # Play a given frequency for the duration with a given duty cycle for PWM audio. Returns before audio is done playing.
    @micropython.native
    def play(self, freq, duration, duty = 32768):
        if(self.enabled == True):
            self.pwm.freq(freq)
            self.pwm.duty_u16(duty)
            self.timer.init(period = duration, mode = machine.Timer.ONE_SHOT, callback = self.stop)
    
    # Play a given frequency for the duration with a given duty cycle for PWM audio. Returns after audio is done playing.
    @micropython.native
    def playBlocking(self, freq, duration, duty = 32768):
        if(self.enabled == True):
            self.pwm.freq(freq)
            self.pwm.duty_u16(duty)
            t0 = time.ticks_ms()
            while(time.ticks_ms() - t0 <= duration):
                pass
            self.stop()
        else:
            while(time.ticks_ms() - t0 <= duration):
                pass
            
            
# Fast reverse-bits-in-a-byte lookup table. Useful for graphics.
# e.g. 11110000 -> 00001111, 11010101 -> 10101011, etc
revbyte_LUT = (0, 128, 64, 192, 32, 160, 96, 224, 16, 144, 80, 208, 48, 176, 112, 240,
       8, 136, 72, 200, 40, 168, 104, 232, 24, 152, 88, 216, 56, 184, 120,
       248, 4, 132, 68, 196, 36, 164, 100, 228, 20, 148, 84, 212, 52, 180,
       116, 244, 12, 140, 76, 204, 44, 172, 108, 236, 28, 156, 92, 220, 60,
       188, 124, 252, 2, 130, 66, 194, 34, 162, 98, 226, 18, 146, 82, 210, 50,
       178, 114, 242, 10, 138, 74, 202, 42, 170, 106, 234, 26, 154, 90, 218,
       58, 186, 122, 250, 6, 134, 70, 198, 38, 166, 102, 230, 22, 150, 86, 214,
       54, 182, 118, 246, 14, 142, 78, 206, 46, 174, 110, 238, 30, 158, 94,
       222, 62, 190, 126, 254, 1, 129, 65, 193, 33, 161, 97, 225, 17, 145, 81,
       209, 49, 177, 113, 241, 9, 137, 73, 201, 41, 169, 105, 233, 25, 153, 89,
       217, 57, 185, 121, 249, 5, 133, 69, 197, 37, 165, 101, 229, 21, 149, 85,
       213, 53, 181, 117, 245, 13, 141, 77, 205, 45, 173, 109, 237, 29, 157,
       93, 221, 61, 189, 125, 253, 3, 131, 67, 195, 35, 163, 99, 227, 19, 147,
       83, 211, 51, 179, 115, 243, 11, 139, 75, 203, 43, 171, 107, 235, 27,
       155, 91, 219, 59, 187, 123, 251, 7, 135, 71, 199, 39, 167, 103, 231, 23,
       151, 87, 215, 55, 183, 119, 247, 15, 143, 79, 207, 47, 175, 111, 239,
       31, 159, 95, 223, 63, 191, 127, 255)

@micropython.viper
def reverse_order(uint8):
    return revbyte_LUT[uint8]
            
# graphics class, from which the gfx namespace is defined.
class GraphicsClass:
    def __init__(self, display, width, height):
        self.display = display
        self.width = width
        self.height = height
    
    # Push the buffer to the hardware display.
    @micropython.native
    def update(self):
        self.display.show()
    
    # Fill the buffer with a given color.
    @micropython.native
    def fill(self, color = 0):
        self.display.fill(color)
    
    # Set the pixel at (x, y) to a given color.
    @micropython.native
    def setPixel(self, x, y, color = 1):
        self.display.pixel(x, y, color)
    
    # Draw a line from (x1, y1) to (x2, y2) in a given color.
    @micropython.native
    def drawLine(self, x1, y1, x2, y2, color = 1):
        self.display.line(x1, y1, x2, y2, color)
    
    # Fill a rectangle with top left corner (x, y) and size (width, height) in a given color.
    @micropython.native
    def fillRect(self, x, y, w, h, color = 1):
        self.display.fill_rect(x, y, w, h, color)
        
    @micropython.native
    def rect(self, x, y, w, h, color = 1):
        self.display.fill_rect(x, y, w, 1, color)
        self.display.fill_rect(x, y, 1, h, color)
        self.display.fill_rect(x, y+h-1, w, 1, color)
        self.display.fill_rect(x+w-1, y, 1, h-1, color)
    
    # Draw a string with top left corner (x, y) in a given color.
    @micropython.native
    def drawText(self, string, x, y, color = 1):
        self.display.text(string, x, y, color)
    
    @micropython.native
    def blit(self, inspr, x, y, width, height, key = -1):
        self.display.blit(FrameBuffer(bytearray(inspr), width, height, MONO_VLSB), x, y, key)

    # Draw a sprite to the screen. inspr is the sprite data, tuple or not.
    @micropython.viper
    def drawSprite(self, inspr, x:int, y:int, width:int, height:int, mirrorX:bool, mirrorY:bool, key:int):
        sprite = bytearray(inspr)
        if(mirrorX):
            for dy in range(0, height >> 3):
                for dx in range(0, width >> 1):
                    temp = sprite[dy * width + dx]
                    sprite[dy * width + dx] = sprite[dy*width + (width-dx-1)]
                    sprite[dy*width+(width-dx-1)] = temp
        if(mirrorY):
            for dx in range(0, width):
                for dy in range(0, height >> 4):
                    temp = sprite[dy * width + dx]
                    sprite[dy*width+dx] = reverse_order(sprite[((height >> 3)-dy-1)*width+dx])
                    sprite[((height >> 3)-dy-1)*width+dx] = reverse_order(temp)
        self.display.blit(FrameBuffer(sprite, width, height, MONO_VLSB), x, y, key)
    
        
# Files interface class
class FilesClass:
    def __init__(self, f = None):
        self.file = f
    
    @micropython.native
    def openFile(self, filename, options = ""):
        if(self.file != None):
            self.file.close()
        self.file = open(filename, options)
    
    @micropython.native
    def closeFile(self):
        if(self.file != None):
            self.file.close()
    
    @micropython.native
    def setFile(self, f):
        self.file = f
    
    @micropython.native
    def readFile(self, l = -1):
        return self.file.read(l) if self.file != None else ""
    
    @micropython.native
    def writeFile(self, data):
        return self.file.write(data) if self.file != None else -1
    
    @micropython.native
    def changeDirectory(self, path):
        os.chdir(path)
    
    @micropython.native
    def getDirectory(self):
        return os.getcwd()
    
    @micropython.native
    def makeDirectory(self, path):
        os.mkdir(path)
    

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
display = GraphicsClass(ssd1306.SSD1306_I2C(72, 40, i2c, res=machine.Pin(18)), 72, 40)


# Files interface instantiation
files = FilesClass()
    

# Returns true if any buttons are currently pressed on the thumby.
@micropython.native
def inputPressed():
    global buttonA
    global buttonB
    global buttonU
    global buttonD
    global buttonL
    global buttonR
    return (buttonA.pressed() or buttonB.pressed() or buttonU.pressed() or buttonD.pressed() or buttonL.pressed() or buttonR.pressed())


# Returns true if any buttons were just pressed on the thumby.
@micropython.native
def inputJustPressed():
    global buttonA
    global buttonB
    global buttonU
    global buttonD
    global buttonL
    global buttonR
    return (buttonA.justPressed() or buttonB.justPressed() or buttonU.justPressed() or buttonD.justPressed() or buttonL.justPressed() or buttonR.justPressed())


# Returns true if any dpad buttons are currently pressed on the thumby.
@micropython.native
def dpadPressed():
    global buttonU
    global buttonD
    global buttonL
    global buttonR
    return (buttonU.pressed() or buttonD.pressed() or buttonL.pressed() or buttonR.pressed())


# Returns true if any dpad buttons were just pressed on the thumby.
@micropython.native
def dpadJustPressed():
    global buttonU
    global buttonD
    global buttonL
    global buttonR
    return (buttonU.justPressed() or buttonD.justPressed() or buttonL.justPressed() or buttonR.justPressed())


# Returns true if either action button is pressed on the thumby.
@micropython.native
def actionPressed():
    global buttonA
    global buttonB
    return (buttonA.pressed() or buttonB.pressed())

# Returns true if either action button was just pressed on the thumby.
@micropython.native
def actionJustPressed():
    global buttonA
    global buttonB
    return (buttonA.justPressed() or buttonB.justPressed())

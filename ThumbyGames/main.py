# Thumby main.py- quick initialization to display the TinyCircuits logo before menu.py is called

from machine import mem32, freq
#Address of watchdog timer scratch register
WATCHDOG_BASE=0x40058000
SCRATCH0_ADDR=WATCHDOG_BASE+0x0C

if(mem32[SCRATCH0_ADDR]==1):
    mem32[SCRATCH0_ADDR]=0
    gamePath=''
    conf = open("thumby.cfg", "r").read().split(',')
    for k in range(len(conf)):
        if(conf[k] == "lastgame"):
            gamePath = conf[k+1]
    freq(125000000)
    try:
        __import__(gamePath)
    except ImportError:
        print("Thumby error: Couldn't load "+gamePath)



from machine import Pin, Timer, I2C, PWM, SPI, freq, WDT
from time import sleep_ms, ticks_ms, sleep_us, ticks_us
import ssd1306


brightnessSetting=2
try:
    conf = open("thumby.cfg", "r").read().split(',')
    print(conf)
    for k in range(len(conf)):
        if(conf[k] == "brightness"):
            brightnessSetting = int(conf[k+1])
except OSError:
    pass

brightnessVals=[0,28,127]

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
display=None
if(HWID==0):
    i2c = I2C(0, sda=Pin(16), scl=Pin(17), freq=1000000)
    display = ssd1306.SSD1306_I2C(72, 40, i2c, res=Pin(18))
if(HWID==1):
    spi = SPI(0, sck=Pin(18), mosi=Pin(19))#possible assignment of miso to 4 or 16?
    display = ssd1306.SSD1306_SPI(72, 40, spi, dc=Pin(17), res=Pin(20), cs=Pin(16))

display.init_display()
display.contrast(brightnessVals[brightnessSetting])

f=open('lib/TClogo.bin')
f.readinto(display.buffer)
f.close()
display.show()



import menu

machine.reset()
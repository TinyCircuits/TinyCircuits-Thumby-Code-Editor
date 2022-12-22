# Thumby main.py- quick initialization to display the TinyCircuits logo before menu.py is called
# Last updated 22-Dec-2022

from machine import freq, mem32, reset
freq(133_000_000)

if(mem32[0x4005800C]==1): # Watchdog timer scratch register
    mem32[0x4005800C]=0
    gamePath=''
    conf = open("thumby.cfg", "r").read().split(',')
    for k in range(len(conf)):
        if(conf[k] == "lastgame"):
            gamePath = conf[k+1]
    try:
        freq(125_000_000)
        __import__(gamePath)
    except ImportError:
        print("Thumby error: Couldn't load "+gamePath)
    except Exception as e:
        from sys import print_exception
        from time import sleep_ms
        print("\nThis Thumby script crashed... :(")
        print_exception(e)
        sleep_ms(1000)
        reset()
    else:
        reset()


from machine import Pin, SPI
from ssd1306 import SSD1306_SPI

HWID = 0
IDPin = Pin(15, Pin.IN, Pin.PULL_UP)
if(IDPin.value() == 0):
    HWID+=1
IDPin.init(IDPin.PULL_DOWN)
IDPin = Pin(14, Pin.IN, Pin.PULL_UP)
if(IDPin.value() == 0):
    HWID+=2
IDPin.init(IDPin.PULL_DOWN)
# Check HWID with GPIO pins 13–12 for future revisions

if(HWID>=1):
    spi = SPI(0, sck=Pin(18), mosi=Pin(19)) # Assign miso to 4 or 16?
    display = SSD1306_SPI(72, 40, spi, dc=Pin(17), res=Pin(20), cs=Pin(16))
else:
    from machine import I2C
    from ssd1306 import SSD1306_I2C
    i2c = I2C(0, sda=Pin(16), scl=Pin(17), freq=1_000_000)
    display = SSD1306_I2C(72, 40, i2c, res=Pin(18))
display.init_display()

brightnessSetting=1
try:
    conf = open("thumby.cfg", "r").read().split(',')
    for k in range(len(conf)):
        if(conf[k] == "brightness"):
            brightnessSetting = int(conf[k+1])
except OSError:
    pass
brightnessVals=[1,28,127]
display.contrast(brightnessVals[brightnessSetting])

f=open('lib/TClogo.bin')
f.readinto(display.buffer)
f.close()
display.show()


import menu


reset()
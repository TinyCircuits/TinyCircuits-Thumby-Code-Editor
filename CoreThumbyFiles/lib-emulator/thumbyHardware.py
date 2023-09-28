# Thumby hardware base
# - Emulator edition

# Written by Mason Watmough, Jason Marcum, and Ben Rose for TinyCircuits.
# 11-Jul-2022

'''
    This file is part of the Thumby API.

    The Thumby API is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    The Thumby API is distributed in the hope that it will be useful, but
    WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with
    the Thumby API. If not, see <https://www.gnu.org/licenses/>.
'''

from machine import Pin, PWM, SPI, reset as machineReset
import emulator

# Last updated 27-Dec-2022
__version__ = '1.9'

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
IDPin.init(IDPin.PULL_DOWN)
IDPin = Pin(14, Pin.IN, Pin.PULL_UP)
if(IDPin.value() == 0):
    HWID+=2
IDPin.init(IDPin.PULL_DOWN)
IDPin = Pin(13, Pin.IN, Pin.PULL_UP)
if(IDPin.value() == 0):
    HWID+=4
IDPin.init(IDPin.PULL_DOWN)
IDPin = Pin(12, Pin.IN, Pin.PULL_UP)
if(IDPin.value() == 0):
   HWID+=8
IDPin.init(IDPin.PULL_DOWN)


if(HWID>=1):
    spi = SPI(0, sck=Pin(18), mosi=Pin(19)) # Assign miso to 4 or 16?
    i2c = None
else:
    from machine import I2C
    i2c = I2C(0, sda=Pin(16), scl=Pin(17), freq=1_000_000)
    spi = None


# Wrap machine.reset() to be accessible as thumby.reset()
def reset():
    machineReset()
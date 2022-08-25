# Thumby module.

# Contains helpful abstractions between hardware features of Thumby and the uPython REPL.

# Written by Mason Watmough, Jason Marcum, and Ben Rose for TinyCircuits.
# Last edited 7/11/2022

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

# Necessary things.
#from machine import Pin, Timer, I2C, PWM, SPI, UART
from machine import reset as machineReset, freq
#import ssd1306
#import os

# Last updated 8/25/2022 for menu reset change
__version__ = '1.8'

# Grab initial frequency
__f0 = freq()
# Speed us up so imports take less time
freq(250000000)

from thumbyHardware import swL, swR, swU, swD, swA, swB, swBuzzer, IDPin, i2c, spi, reset

from thumbySprite import Sprite

from thumbyButton import buttonA, buttonB, buttonU, buttonD, buttonL, buttonR
from thumbyButton import inputPressed, inputJustPressed, dpadPressed, dpadJustPressed, actionPressed, actionJustPressed

from thumbyAudio import audio

from thumbyLink import link

from thumbySaves import saveData

from thumbyGraphics import display

# Reset to initial frequency
freq(__f0)

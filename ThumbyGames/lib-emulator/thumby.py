# Thumby module.
# - Emulator edition

# Contains helpful abstractions between hardware features of Thumby and the uPython REPL.

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

# from machine import freq
import emulator

# Last updated 14-Dec-2022
__version__ = '1.9'

# Grab initial frequency
# __f0 = freq()
# Speed us up so imports take less time
# freq(250_000_000)

from thumbyHardware import swL, swR, swU, swD, swA, swB, swBuzzer, IDPin, i2c, spi, reset

from thumbySprite import Sprite

from thumbyButton import buttonA, buttonB, buttonU, buttonD, buttonL, buttonR
from thumbyButton import inputPressed, inputJustPressed, dpadPressed, dpadJustPressed, actionPressed, actionJustPressed

from thumbyAudio import audio

from thumbyLink import link

from thumbySaves import saveData

from thumbyGraphics import display

# Reset to initial frequency
# freq(__f0)

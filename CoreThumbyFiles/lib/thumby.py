# Thumby module.

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
import sys


__version__ = '2.0'


IS_THUMBY_LEGACY = "TinyCircuits Thumby Color" not in sys.implementation._machine and "linux" not in sys.implementation._machine and "JS with Emscripten" not in sys.implementation._machine 
IS_EMULATOR = False
try:
    import emulator
    IS_EMULATOR = True
except ImportError:
    pass

if IS_THUMBY_LEGACY:
    from machine import freq

    # Grab initial frequency
    __f0 = freq()
    # Speed us up so imports take less time
    freq(250_000_000)

if IS_THUMBY_LEGACY or IS_EMULATOR:
    from thumbyHardware import swL, swR, swU, swD, swA, swB, swBuzzer, IDPin, i2c, spi, reset
else:
    from thumbyHardware import reset

from thumbySprite import Sprite

from thumbyButton import buttonA, buttonB, buttonU, buttonD, buttonL, buttonR
from thumbyButton import inputPressed, inputJustPressed, dpadPressed, dpadJustPressed, actionPressed, actionJustPressed

from thumbyAudio import audio

from thumbyLink import link

from thumbySaves import saveData

from thumbyGraphics import display


if IS_THUMBY_LEGACY is True:
    # Reset to initial frequency
    freq(__f0)

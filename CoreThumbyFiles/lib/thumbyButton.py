# Thumby button base

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


IS_THUMBY_COLOR = "TinyCircuits Thumby Color" in sys.implementation._machine
IS_THUMBY_COLOR_LINUX = "linux" in sys.implementation._machine
IS_THUMBY_COLOR_WEB = "JS with Emscripten" in sys.implementation._machine
IS_EMULATOR = False
try:
    import emulator
    IS_EMULATOR = True
except ImportError:
    pass


if IS_THUMBY_COLOR or IS_THUMBY_COLOR_LINUX or IS_THUMBY_COLOR_WEB:
    import engine
    import engine_io
else:
    from thumbyHardware import swL, swR, swU, swD, swA, swB


class ButtonClass:
    def __init__(self, pin):
        self.pin = pin
        self.lastState = False
        self.latchedPress = False

    # Returns True if the button is currently pressed, False if not.
    if IS_THUMBY_COLOR or IS_THUMBY_COLOR_LINUX:
        @micropython.native
        def pressed(self):
            engine.tick()
            return self.pin.is_pressed 
    else:
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


# Button instantiation
if IS_THUMBY_COLOR or IS_THUMBY_COLOR_LINUX or IS_THUMBY_COLOR_WEB:
    buttonA = ButtonClass(engine_io.A)      # Left (A) button
    buttonB = ButtonClass(engine_io.B)      # Right (B) button
    buttonU = ButtonClass(engine_io.UP)     # D-pad up
    buttonD = ButtonClass(engine_io.DOWN)   # D-pad down
    buttonL = ButtonClass(engine_io.LEFT)   # D-pad left
    buttonR = ButtonClass(engine_io.RIGHT)  # D-pad right
else:
    buttonA = ButtonClass(swA) # Left (A) button
    buttonB = ButtonClass(swB) # Right (B) button
    buttonU = ButtonClass(swU) # D-pad up
    buttonD = ButtonClass(swD) # D-pad down
    buttonL = ButtonClass(swL) # D-pad left
    buttonR = ButtonClass(swR) # D-pad right


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

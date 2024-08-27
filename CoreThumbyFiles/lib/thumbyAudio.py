# Thumby audio base

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
from thumbyHardware import swBuzzer
from time import ticks_ms, ticks_diff


__version__ = '2.0'


IS_THUMBY_COLOR = "TinyCircuits Thumby Color" in sys.implementation._machine
IS_THUMBY_COLOR_LINUX = "linux" in sys.implementation._machine
IS_EMULATOR = False
try:
    import emulator
    IS_EMULATOR = True
except ImportError:
    pass

root = ""

# Create a dummy timer if on Thumby Color Linx
# since it doesn't have that in `machine``
if IS_THUMBY_COLOR_LINUX:
    import engine
    root = engine.root_dir()

    class TimerDummy():
        def __init__(self):
            pass

        def init(self, period, mode, callback):
            pass
    
    Timer = TimerDummy
else:
    from machine import Timer


# Audio class, from which the audio namespace is defined.
class AudioClass:
    def __init__(self, pwm):
        self.timer = Timer()
        self.pwm = pwm
        self.enabled = 1
        self.dutyCycle = 0xFFFF//2
        try:
            conf = open(f"{root}/thumby.cfg", "r").read().split(',')
            for k in range(len(conf)):
                if(conf[k] == "audioenabled"):
                    self.enabled = int(conf[k+1])
        except:
            pass

    # Set the audio to disabled, mid, or high output
    @micropython.native
    def setEnabled(self, setting = 1):
        self.enabled = setting
        if(self.enabled<0):
            self.enabled=0
        if(self.enabled>1):
            self.enabled=1

    # Stop audio.
    @micropython.native
    def stop(self, dummy = None): # I have no idea why it needs the second dummy argument. The timer interrupt won't work without it. Shouldn't affect functionality whatsoever.
        self.pwm.duty_u16(0)

    # Set the frequency and duty of the PWM audio if currently enabled.
    @micropython.native
    def set(self, freq):
        if(self.enabled):
            self.pwm.freq(freq)
            self.pwm.duty_u16(self.dutyCycle)

    # Play a given frequency for the duration with a given duty cycle for PWM audio. Returns before audio is done playing.
    @micropython.native
    def play(self, freq, duration):
        if(self.enabled):
            self.pwm.freq(freq)
            self.pwm.duty_u16(self.dutyCycle)
            self.timer.init(period = duration, mode = Timer.ONE_SHOT, callback = self.stop)

    # Play a given frequency for the duration with a given duty cycle for PWM audio. Returns after audio is done playing.
    @micropython.native
    def playBlocking(self, freq, duration):
        t0 = ticks_ms()
        if(self.enabled):
            self.pwm.freq(freq)
            self.pwm.duty_u16(self.dutyCycle)
            while(ticks_diff(ticks_ms(), t0) <= duration):
                pass
            self.stop()
        else:
            while(ticks_diff(ticks_ms(), t0) <= duration):
                pass
            
# Audio instantiation
audio = AudioClass(swBuzzer)
# Thumby sprite base

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

from os import stat

# Last updated 14-Dec-2022
__version__ = '1.9'

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
            self.file = open(self.bitmapSource,'rb')
            self.file.readinto(self.bitmap)
            self.frameCount = stat(self.bitmapSource)[6] // self.bitmapByteCount
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
                self.file.seek(offset)
                self.file.readinto(self.bitmap)
            elif type(self.bitmapSource)==bytearray:
                self.bitmap = memoryview(self.bitmapSource)[offset:offset+self.bitmapByteCount]
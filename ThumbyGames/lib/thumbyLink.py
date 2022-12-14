# Thumby link base

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

from machine import Pin, UART
from time import ticks_ms, ticks_diff

# Last updated 14-Dec-2022
__version__ = '1.9'

class LinkClass:
    def __init__(self):
        self.initialized = False


    @micropython.native
    def init(self):
        self.rxPin = Pin(1, Pin.IN)
        self.uart = UART(0, baudrate=115200, rx=self.rxPin, tx=Pin(0, Pin.OUT), timeout=0, txbuf=515, rxbuf=515)
        Pin(2, Pin.OUT).value(1)
        
        self.uart.read()
        self.initialized = True
        
        self.sent = False
        self.timeAtLastSend = 0
        
        self.timeout = 100
    
    
    @micropython.native
    def send(self, data):
        if self.initialized != True:
            self.init()
        
        uart = self.uart
        if self.sent == False and self.rxPin.value() == 1:
            
            dataLength = len(data)
            
            if dataLength < 0 or dataLength > 512:
                raise Exception("Link message size out of bounds: " + str(dataLength))
            
            packetLength = dataLength + 3
            checksum = 0
            
            for b in data:
                checksum ^= b
            
            anyAfter = uart.any() + packetLength
            uart.write(bytearray([(dataLength >> 8) & 0xff, dataLength & 0xff, checksum]))
            uart.write(data)
            
            # Wait to receive echo data, make sure to timeout in case of some collision
            t0 = ticks_ms()
            curAny = 0
            lastAny = 0
            while True:
                curAny = uart.any()
                
                if curAny >= anyAfter:
                    break
                elif curAny != lastAny:
                    # Reset timeout to accommodate longer strings of data
                    t0 = ticks_ms()
            
                if ticks_diff(ticks_ms(), t0) >= self.timeout:
                    break
                
                lastAny = curAny
            
            uart.read(anyAfter)
            
            self.timeAtLastSend = ticks_ms()
            self.sent = True
            return True
        
        elif self.sent == True and ticks_diff(ticks_ms(), self.timeAtLastSend) > self.timeout:
            self.sent = False
        
        return False
        
    
    @micropython.native
    def receive(self):
        if self.initialized != True:
            self.init()
        
        uart = self.uart
        
        if uart.any() >= 3:
            headerBytes = uart.read(3)
            
            receivedDataLength = (headerBytes[0] << 8) + headerBytes[1]
            
            # Wait for all data or timeout
            t0 = ticks_ms()
            curAny = 0
            lastAny = 0
            while True:
                curAny = uart.any()
                
                if curAny >= receivedDataLength:
                    break
                elif curAny != lastAny:
                    # Reset timeout to accommodate longer strings of data
                    t0 = ticks_ms()
            
                if ticks_diff(ticks_ms(), t0) >= self.timeout:
                    self.sent = False
                    return None
                
                lastAny = curAny

            receivedData = uart.read(receivedDataLength)
            receivedChecksum = headerBytes[2]
            
            if uart.any() == 0:
                self.sent = False
            
            if len(receivedData) == receivedDataLength:
                checksum = 0
                for b in receivedData:
                    checksum ^= b
    
                if checksum == receivedChecksum:
                    return receivedData
                else:
                    uart.read()
            else:
                uart.read()
        elif self.sent == True and ticks_diff(ticks_ms(), self.timeAtLastSend) > self.timeout:
            self.sent = False

# Link instantiation
link = LinkClass()
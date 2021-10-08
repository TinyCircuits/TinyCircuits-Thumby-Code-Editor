# MicroPython SSD1306 OLED driver, I2C and SPI interfaces

from micropython import const
import framebuf
import ubinascii
import sys
import time
import machine

SIO_BASE     = 0xD0000000

GPIO_OUT     = SIO_BASE + 0x010
GPIO_OUT_SET = SIO_BASE + 0x014
GPIO_OUT_CLR = SIO_BASE + 0x018
GPIO_OUT_XOR = SIO_BASE + 0x01C

GPIO_OE      = SIO_BASE + 0x020
GPIO_OE_SET  = SIO_BASE + 0x024
GPIO_OE_CLR  = SIO_BASE + 0x028
GPIO_OE_XOR  = SIO_BASE + 0x02C

handshakePin = 2
handshakePinToggle = 1 << handshakePin
machine.Pin(handshakePin, machine.Pin.OUT)

# Subclassing FrameBuffer provides support for graphics primitives
# http://docs.micropython.org/en/latest/pyboard/library/framebuf.html
class SSD1306(framebuf.FrameBuffer):
    def __init__(self, width, height, external_vcc):
        self.width = width
        self.height = height
        self.pages = self.height // 8
        self.buffer = bytearray(self.pages * self.width)
        super().__init__(self.buffer, self.width, self.height, framebuf.MONO_VLSB)
        self.printBufferAdr()
        self.init_display()

    @micropython.viper
    def printBufferAdr(self):
        print("###ADDRESS###")
        print(ptr32(self.buffer))

    def init_display(self):
        pass

    def poweroff(self):
        pass

    def poweron(self):
        pass

    def contrast(self, contrast):
        pass

    def invert(self, invert):
        pass

    @micropython.viper
    def show(self):
        machine.mem32[GPIO_OUT_XOR] = handshakePinToggle

class SSD1306_I2C(SSD1306):
    def __init__(self, width, height, i2c, res, addr=0x3C, external_vcc=False):        
        res.init(res.OUT, value=0)
        import time
        res(1)
        time.sleep_ms(1)
        res(0)
        time.sleep_ms(10)
        res(1)        
        time.sleep_ms(10)
        
        super().__init__(width, height, external_vcc)

    def write_cmd(self, cmd):
        pass

    def write_data(self, buf):
        pass
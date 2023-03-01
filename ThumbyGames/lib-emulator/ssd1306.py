# MicroPython SSD1306 OLED driver, I2C and SPI interfaces- modified for Thumby
# - Emulator edition

# Last updated 20-Dec-2022

import machine

# Needed by emulator to quickly set pin state
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

class SSD1306():
    def __init__(self, width, height, external_vcc):
        self.width = width
        self.height = height
        self.external_vcc = external_vcc
        self.pages = self.height // 8
        self.buffer = bytearray(self.pages * self.width)

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

    @micropython.native
    def show(self):
        machine.mem32[GPIO_OUT_XOR] = handshakePinToggle


class SSD1306_I2C(SSD1306):
    def __init__(self, width, height, i2c, res, addr=0x3C, external_vcc=False):
        super().__init__(width, height, external_vcc)
        pass

    def reset(self):
        pass
        
    def write_window_cmd1(self):
        pass
        
    def write_window_cmd2(self):
        pass

    def write_cmd(self, cmd):
        pass

    @micropython.native
    def write_data(self, buf):
        pass


class SSD1306_SPI(SSD1306):
    def __init__(self, width, height, spi, dc, res, cs, external_vcc=False):
        super().__init__(width, height, external_vcc)
        pass

    def reset(self):
        pass

    @micropython.native
    def write_cmd(self, cmd):
        pass
        
    @micropython.native
    def write_window_cmd(self):
        pass

    @micropython.native
    def write_data(self, buf):
        pass
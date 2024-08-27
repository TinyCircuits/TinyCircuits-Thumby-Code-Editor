# MicroPython SSD1306 OLED driver, I2C and SPI interfaces- modified for Thumby
import sys


IS_THUMBY_COLOR = "TinyCircuits Thumby Color" in sys.implementation._machine
IS_THUMBY_COLOR_LINUX = "linux" in sys.implementation._machine
IS_EMULATOR = False
try:
    import emulator
    IS_EMULATOR = True
except ImportError:
    pass


if IS_EMULATOR:
    import machine

    # Needed by rp2040js emulator to quickly set pin state
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
elif IS_THUMBY_COLOR or IS_THUMBY_COLOR_LINUX:
    # Support running on Thumby Color simulator
    import engine_main 
    import engine 
    import engine_draw
    from engine_nodes import Sprite2DNode, CameraNode
    from engine_resources import TextureResource
    from engine_math import Vector2

    engine.fps_limit(240)

    ssd1306_tex = TextureResource(72, 40)

    ssd1306_spr = Sprite2DNode()
    ssd1306_spr.texture = ssd1306_tex
    ssd1306_spr.layer = 7
    ssd1306_spr.scale = Vector2(1.75, 1.75)

    cam = CameraNode()


class SSD1306():
    def __init__(self, width, height, external_vcc):
        self.width = width
        self.height = height
        self.external_vcc = external_vcc
        self.pages = self.height // 8
        self.buffer = bytearray(self.pages * self.width)

    if IS_THUMBY_COLOR or IS_THUMBY_COLOR_LINUX or IS_EMULATOR:
        def init_display(self):
            pass
    else:
        def init_display(self):
            self.reset()
            for cmd in (0x20,0x00,0x40,0xA1,0xA8,self.height-1,0xC8,0xD3,0x00,0xDA,0x12,0xD5,0x80,0xD9,
                0x22 if self.external_vcc else 0xF1,0xDB,0x20,0x81,0x7F,0xA4,0xA6,0x8D,
                0x10 if self.external_vcc else 0x14,0xAD,0x30,0xAF
            ):
                self.write_cmd(cmd)
            self.write_window_cmd()
            self.write_data(bytearray(360))

    if IS_THUMBY_COLOR or IS_THUMBY_COLOR_LINUX or IS_EMULATOR:
        def poweroff(self):
            pass
    else:
        def poweroff(self):
            self.write_cmd(0xAE)

    if IS_THUMBY_COLOR or IS_THUMBY_COLOR_LINUX or IS_EMULATOR:
        def poweron(self):
            pass
    else:
        def poweron(self):
            self.write_cmd(0xAF)

    if IS_THUMBY_COLOR or IS_THUMBY_COLOR_LINUX or IS_EMULATOR:
        def contrast(self, contrast):
            pass
    else:
        def contrast(self, contrast):
            self.write_cmd(0x81)
            self.write_cmd(contrast)

    if IS_THUMBY_COLOR or IS_THUMBY_COLOR_LINUX or IS_EMULATOR:
        def invert(self, invert):
            pass
    else:
        def invert(self, invert):
            self.write_cmd(0xA6 | (invert & 1))

    if IS_THUMBY_COLOR or IS_THUMBY_COLOR_LINUX:
        @micropython.viper
        def show(self):
            x:int = 0
            y:int = 0
            fb = ptr8(ssd1306_tex.data)
            for b in self.buffer: 
                idx = int(((y)*72+x)*2)
                for i in range(8):
                    if(((int(b) >> i) & 1) == 1):
                        fb[idx] = (0xff)
                        fb[idx+1] = (0xff)
                    else:
                        fb[idx] = (0x00)
                        fb[idx+1] = (0x00)
                    idx += 2*72
                x += 1
                if(x >= 72):
                    x = 0
                    y += 8
            engine.tick()
            pass
    elif IS_EMULATOR:
        @micropython.native
        def show(self):
            machine.mem32[GPIO_OUT_XOR] = handshakePinToggle
    else:
        @micropython.native
        def show(self):
            self.write_window_cmd()
            self.write_data(self.buffer)


if IS_THUMBY_COLOR or IS_THUMBY_COLOR_LINUX or IS_EMULATOR:
    class SSD1306_DUMMY(SSD1306):
        def __init__(self, width, height):
            super().__init__(width, height, None)

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
else:
    class SSD1306_I2C(SSD1306):
        def __init__(self, width, height, i2c, res, addr=0x3C, external_vcc=False):
            self.i2c = i2c
            self.addr = addr
            self.res = res
            self.temp = bytearray(2)
            
            self.write_list = [b"\x40", None]  # Co=0, D/C#=1
            
            super().__init__(width, height, external_vcc)

        def reset(self):
            self.res.init(self.res.OUT, value=1)
            from time import sleep_us
            sleep_us(10)
            self.res(0)
            sleep_us(10)
            self.res(1)
            sleep_us(20)

        @micropython.native
        def write_window_cmd(self):
            self.write_cmd(0x21)
            self.write_cmd(28)
            self.write_cmd(99)
            self.write_cmd(0x22)
            self.write_cmd(0)
            self.write_cmd(4)

        @micropython.native
        def write_cmd(self, cmd):
            self.temp[0] = 0x80  # Co=1, D/C#=0
            self.temp[1] = cmd
            self.i2c.writeto(self.addr, self.temp)

        @micropython.native
        def write_data(self, buf):
            self.i2c.writeto_mem(self.addr, 0x40, buf)


    class SSD1306_SPI(SSD1306):
        def __init__(self, width, height, spi, dc, res, cs, external_vcc=False):
            self.rate = 10 * 1024 * 1024
            dc.init(dc.OUT, value=0)
            cs.init(cs.OUT, value=1)
            self.spi = spi
            self.dc = dc
            self.res = res
            self.cs = cs
            self.cmdWindow = bytearray([0x21, 28, 99, 0x22, 0 ,4])
            
            super().__init__(width, height, external_vcc)

        def reset(self):
            self.res.init(self.res.OUT, value=1)
            from time import sleep_us
            sleep_us(10)
            self.res(0)
            sleep_us(10)
            self.res(1)
            sleep_us(20)

        @micropython.native
        def write_cmd(self, cmd):
            self.spi.init(baudrate=self.rate, polarity=0, phase=0)
            self.cs(1)
            self.dc(0)
            self.cs(0)
            self.spi.write(bytearray([cmd]))
            self.cs(1)

        @micropython.native
        def write_window_cmd(self):
            self.spi.init(baudrate=self.rate, polarity=0, phase=0)
            self.cs(1)
            self.dc(0)
            self.cs(0)
            self.spi.write(self.cmdWindow)
            self.cs(1)

        @micropython.native
        def write_data(self, buf):
            self.spi.init(baudrate=self.rate, polarity=0, phase=0)
            self.cs(1)
            self.dc(1)
            self.cs(0)
            self.spi.write(buf)
            self.cs(1)
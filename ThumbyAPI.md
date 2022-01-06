# Thumby MicroPython Module API Reference (Beta, subject to change)

* API reference expects thumby imported as `import thumby`

## General
* ### Constants
    * `__version__`
        * type: string
        * values: 1.0 ~ limitless (increased for changes to library)

## Graphics
* ### Constants
    * `thumby.display.width` | number of pixels that define the screen width
        * type: int
        * value: 72
    * `thumby.display.height` | number of pixels that define the screen height
        * type: int
        * value: 40
* ### Functions
    * `thumby.display.update()` | updates screen at frames-per-second (FPS) specified by `thumby.display.setFPS(...)`. Will block to not exceed fps setting. Default framerate 0 (non-limited). Returns `None`
    * `thumby.display.setFPS(FPS)` | sets the max `FPS` used by `thumyby.display.update()`. Returns None, all parameters required.
        * `FPS`
            * type: float
            * values: 0 ~ integer max
    * `thumby.display.fill(color)` | fills entire screen with `color`. Returns None
        * `color`
            * type: int
            * values: 0 or 1
    * `thumby.display.setPixel(x, y, color)` | sets pixel to `color` at `x` and `y`. Returns None, all parameters required.
        * `x`
            * type: int
            * values: 0 (left) ~ 71 (right)
        * `y`
            * type: int
            * values: 0 (top) ~ 39 (bottom)
        * `color`
            * type: int
            * values: 0 or 1
    * `thumby.display.getPixel(x, y)` | gets value of pixel at `x` and `y`. Returns int (0 or 1), all parameters required.
        * `x`
            * type: int
            * values: 0 (left) ~ 71 (right)
        * `y`
            * type: int
            * values: 0 (top) ~ 39 (bottom)
    * `thumby.display.drawLine(x1, y1, x2, y2, color)` | draws 1px thick line in `color` from `x1` and `y1` to `x2` and `y2` (thickness not variable). Returns None, all parameters required.
        * `x1`
            * type: int
            * values: 0 (left) ~ 71 (right)
        * `y1`
            * type: int
            * values: 0 (top) ~ 39 (bottom)
        * `x2`
            * type: int
            * values: 0 (left) ~ 71 (right)
        * `y2`
            * type: int
            * values: 0 (top) ~ 39 (bottom)
        * `color`
            * type: int
            * values: 0 or 1
    * `thumby.display.drawFilledRectangle(x, y, w, h, color)` | creates filled rectangle with `color` at `x` and `y` with dimensions `w` (width) and `h` (height). Returns None, all parameters required.
        * `x`
            * type: int
            * values: 0 (left) ~ 71 (right)
        * `y`
            * type: int
            * values: 0 (top) ~ 39 (bottom)
        * `w`
            * type: int
            * values: 0 ~ 71
        * `h`
            * type: int
            * values: 0 ~ 39
        * `color`
            * type: int
            * values: 0 or 1
    * `thumby.display.drawRectangle(x, y, w, h, color)` | creates 1px thick outline rectangle with `color` at `x` and `y` with dimensions `w` (width) and `h` (height) (thickness not variable). Returns None, all parameters required.
        * `x`
            * type: int
            * values: 0 (left) ~ 71 (right)
        * `y`
            * type: int
            * values: 0 (top) ~ 39 (bottom)
        * `w`
            * type: int
            * values: 0 ~ 71
        * `h`
            * type: int
            * values: 0 ~ 39
        * `color`
            * type: int
            * values: 0 or 1
    * `thumby.display.drawText(string, x, y, color)` | draws `string` in `color` at `x` and `y` with font specified by `thumby.display.setFont(...)`. Default font is 8x7px MicroPython font. Returns None, all parameters required.
        * `string`
            * type: str
            * values: 128 ASCII characters
        * `x`
            * type: int
            * values: 0 (left) ~ 71 (right)
        * `y`
            * type: int
            * values: 0 (top) ~ 39 (bottom)
        * `color`
            * type: int
            * values: 0 or 1
    * `thumby.display.setFont(fontFilePath, width, height, space)` | sets the `fontFilePath` pointing to binary font file with character `width`, `height`, and `space` between characters for use by `thumby.display.drawText(...)`. Returns None, all parameters required.
        * `fontFilePath`
            * type: string
            * values: 128 ASCII character string up to 256 characters long ('/' separated)
        * `width`:
            * type: int
            * values: 0 ~ integer max
        * `height`:
            * type: int
            * values: 0 ~ integer max
        * `space`:
            * type: int
            * values: 0 ~ integer max
    * `thumby.display.blit(bitmapData, x, y, width, height, key, mirrorX, mirrorY)` | draws pixels defined in `bitmapData` (VLSB) array at `x` and `y` provided the bitmap's `width` and `height` with transparent pixels defined by `key` (e.g. `key = 0` means black pixels are not drawn/are transparent) with possibility of mirroring using `mirrorX` (across x-axis) and `mirrorY` (across y-axis). Returns None, all parameters required.
        * `bitmapData`
            * type: bytearray
            * values: each byte consisting of VLSB aligned data where each bit being 1 (white) or 0 (black)
        * `x`
            * type: int
            * values: 0 (left) ~ 71 (right)
        * `y`
            * type: int
            * values: 0 (top) ~ 39 (bottom)
        * `width`
            * type: int
            * values: 0 ~ 71
        * `height`
            * type: int
            * values: 0 ~ 39
        * `key`
            * type: int
            * values: 0 or 1 (default: -1, both black and white pixels drawn)
        * `mirrorX`
            * type: int
            * values: 0 (do not mirror) or 1 (do mirror)
        * `mirrorY`
            * type: int
            * values: 0 (do not mirror) or 1 (do mirror)
    * `thumby.display.blitWithMask(bitmapData, x, y, width, height, key, mirrorX, mirrorY, maskBitmapData)` | draws pixels defined in `bitmapData` array at `x` and `y` provided the bitmap's `width` and `height` with transparent pixels defined by `key` (e.g. `key = 0` means black pixels are not drawn/are transparent) with possibility of mirroring using `mirrorX` (across x-axis) and `mirrorY` (across y-axis). On conjunction with `key`, use `maskBitmapData` to specify pixels to be transparent (provides per-pixel transparency). Returns None, all parameters required.
        * `bitmapData`
            * type: bytearray
            * values: each byte consisting of VLSB aligned data where each bit being 1 (white) or 0 (black)
        * `x`
            * type: int
            * values: 0 (left) ~ 71 (right)
        * `y`
            * type: int
            * values: 0 (top) ~ 39 (bottom)
        * `width`
            * type: int
            * values: 0 ~ 71
        * `height`
            * type: int
            * values: 0 ~ 39
        * `key`
            * type: int
            * values: 0 or 1 (default: -1, both black and white pixels drawn)
        * `mirrorX`
            * type: int
            * values: 0 (do not mirror) or 1 (do mirror)
        * `mirrorY`
            * type: int
            * values: 0 (do not mirror) or 1 (do mirror)
        * `maskBitmapData`
            * type: bytearray
            * values: each byte consisting of VLSB aligned data where each bit being 1 (transparent) or 0 (not-drawn)
    * `thumby.display.drawSprite(sprite)` | draw `sprite` to screen using its internal properties (position, dimensions, etc). Returns none, all parameters required.
        * `sprite`
            * type: Sprite (`thumby.Sprite`)
    * `thumby.display.drawSpriteWithMask(sprite, maskSprite)` | draws `sprite` to screen using internal properties for position and size with per-pixel transparency provided by `maskSprite`. Returns none, all parameters required.
        * `sprite`
            * type: Sprite (`thumby.Sprite`)
        * `maskSprite`
            * type: Sprite (`thumby.Sprite`) (pixels set to 1 are transparent, while 0 pixels are not drawn)
    * `thumby.display.brightness(bightness)` | sets screen to `brightness` value. Returns None, all parameters required.
        * `brightness`
            * type: int
            * values: 0 (off) ~ 127 (max brightness)

## Sprite
* ### Functions
    * `thumby.Sprite(width, height, bitmapData, x, y, key, mirrorX, mirrorY)` | initialize sprite object with fixed frame `width` and `height` for frames in `bitmapData`, positioned at `x` and `y`, and rendered to screen mirrored depending on, `mirrorX` and `mirrorY`. Transparent pixels are defined by `key` (e.g. `key = 0` means black pixels are not drawn/are transparent). Returns Sprite.
        * `width`
            * type: int
            * values: 0 ~ integer max
        * `height`
            * type: int
            * values: 0 ~ integer max
        * `bitmapData`
            * type: list or string
            * values: bytearray of VLSB data or string (128 ASCII character at max 256 characters long) pointing to binary file location of pixel data
        * `x`
            * type: int
            * values: 0 (left) ~ 71 (right) (default: 0)
        * `y`
            * type: int
            * values: 0 (top) ~ 39 (bottom) (default: 0)
        * `key`
            * type: int
            * values: 0 or 1 (default: -1, both black and white pixels drawn)
        * `mirrorX`
            * type: int
            * values: 0 (do not mirror) or 1 (do mirror) (default: 0)
        * `mirrorY`
            * type: int
            * values: 0 (do not mirror) or 1 (do mirror) (default: 0)
    * `Sprite.getFrame()` | gets the current frame index of the sprite animation. Return int, automatically returns wrapped index if index greater than max number of frames.
    * `Sprite.setFrame(frame)` | sets the current `frame` index of the sprite animation. Needs to be used manually to progress animation, framerate handled by `thumby.display.update()`. Returns none, all parameters required.
        * `frame`
            * type: int
            * values: 0 ~ overflow (values larger than the number of frames get wrapped)

## Buttons
* ### Objects
    * `thumby.buttonA` | for accessing A button (right red button)
    * `thumby.buttonB` | for accessing B button (left red button)
    * `thumby.buttonU` | for accessing up direction on DPAD
    * `thumby.buttonD` | for accessing down direction on DPAD
    * `thumby.buttonL` | for accessing left direction on DPAD
    * `thumby.buttonR` | for accessing right direction on DPAD
* ### Functions
    * `thumby.buttonX.pressed()` | returns True if `thumby.buttonX` is currently pressed, False otherwise (replace `buttonX` by any of the above button objects)
    * `thumby.buttonX.justPressed()` | returns True if the last button pressed was `thumby.buttonX`, False otherwise (replace `buttonX` by any of the above button objects)

## Audio
* Note: audio not implemented on web IDE emulator but is unlikely to cause exceptions
* ### Functions
    * `thumby.audio.play(freq, duration, duty)` | plays audio at sound frequency `freq` and duty cycle `duty` for `duration` in milliseconds without blocking code execution. For now, try searching 'music notes to frequency chart' to relate these parameters to musical notes. Returns None
        * `freq`
            * type: int
            * values: 7 ~ 125000000 (Hz)
        * `duration`
            * type: int
            * values: 0 ~ 2147483647 (ms)
        * `duty`
            * type: uint_16
            * values: 0 (0%) ~ 65535 (100%) (default: 32768 or 50%)
    * `thumby.audio.playBlocking(freq, duration, duty)` | plays audio at sound frequency `freq` and duty cycle `duty` for `duration` in milliseconds while blocking code execution. For now, try searching 'music notes to frequency chart' to relate these parameters to musical notes. Returns None
        * `freq`
            * type: int
            * values: 7 ~ 125000000 (Hz)
        * `duration`
            * type: int
            * values: 0 ~ 2147483647 (ms)
        * `duty`
            * type: uint_16
            * values: 0 (0%) ~ 65535 (100%) (default: 32768 or 50%)
    * `thumby.audio.stop()` | stops playing any running audio started by `thumby.audio.play(...)`. Returns None
    * `thumby.audio.set_enabled(setting)` | stops buzzer from outputting sound when `thumby.audio.play()` or `thumby.audio.playBlocking()` are called using `setting` flag. `thumby.audio.playBlocking(...)` will still block subsequent code execution for the duration provided to it. Returns None
        * `setting`
            * type: bool
            * values: 1/True (audio enabled) or 0/False (audio disabled)

## Files
* This API was removed in favor of typical Python file access (e.g. `open(...)`)
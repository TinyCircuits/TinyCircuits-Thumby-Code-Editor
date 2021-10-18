# Thumby MicroPython Module API Reference (Beta, subject to change)

* API reference expects thumby imported as `import thumby`

## Graphics
* ### Constants
    * `thumby.DISPLAY_W` | number of pixels that define the screen width
        * type: int
        * value: 72
    * `thumby.DISPLAY_H` | number of pixels that define the screen height
        * type: int
        * value: 40
* ### Functions
    * `thumby.display.update()` | draws result of the below drawing functions to the screen. Call this as little often as possible and after any drawing functions (e.g. `thumby.display.rect(...)`, `thumby.display.drawText(...)`, etc.). Returns None
    * `thumby.display.fill(color)` | fills entire screen with `color`. Returns None
        * `color`
            * type: int
            * values: 0 or 1 (default: 0)
    * `thumby.display.setPixel(x, y, color)` | sets pixel to `color` at `x` and `y`. Returns None
        * `x`
            * type: int
            * values: 0 (left) ~ 72 (right)
        * `y`
            * type: int
            * values: 0 (top) ~ 40 (bottom)
        * `color`
            * type: int
            * values: 0 or 1 (default: 1)
    * `thumby.display.drawLine(x1, y1, x2, y2, color)` | draws 1px thick line in `color` from `x1` and `y1` to `x2` and `y2` (thickness not variable). Returns None
        * `x1`
            * type: int
            * values: 0 (left) ~ 72 (right)
        * `y1`
            * type: int
            * values: 0 (top) ~ 40 (bottom)
        * `x2`
            * type: int
            * values: 0 (left) ~ 72 (right)
        * `y2`
            * type: int
            * values: 0 (top) ~ 40 (bottom)
        * `color`
            * type: int
            * values: 0 or 1 (default: 1)
    * `thumby.display.fillRect(x, y, w, h, color)` | creates filled rectangle with `color` at `x` and `y` with dimensions `w` (width) and `h` (height). Returns None
        * `x`
            * type: int
            * values: 0 (left) ~ 72 (right)
        * `y`
            * type: int
            * values: 0 (top) ~ 40 (bottom)
        * `w`
            * type: int
            * values: 0 ~ 72
        * `h`
            * type: int
            * values: 0 ~ 40
        * `color`
            * type: int
            * values: 0 or 1 (default: 1)
    * `thumby.display.rect(x, y, w, h, color)` | creates 1px thick outline rectangle with `color` at `x` and `y` with dimensions `w` (width) and `h` (height) (thickness not variable). Returns None
        * `x`
            * type: int
            * values: 0 (left) ~ 72 (right)
        * `y`
            * type: int
            * values: 0 (top) ~ 40 (bottom)
        * `w`
            * type: int
            * values: 0 ~ 72
        * `h`
            * type: int
            * values: 0 ~ 40
        * `color`
            * type: int
            * values: 0 or 1 (default: 1)
    * `thumby.display.drawText(string, x, y, color)` | draws `string` in `color` at `x` and `y` in MicroPython's default 8px x 8px font. Returns None
        * `string`
            * type: str
            * values: 128 ASCII characters
        * `x`
            * type: int
            * values: 0 (left) ~ 72 (right)
        * `y`
            * type: int
            * values: 0 (top) ~ 40 (bottom)
        * `color`
            * type: int
            * values: 0 or 1 (default: 1)
    * `thumby.display.blit(inspr, x, y, width, height, key)` | draws pixels defined in bitmap `inspr` array at `x` and `y` provided the bitmap's `width` and `height` with transparent pixels defined by `key` (e.g. `key = 0` means black pixels are not drawn/are transparent). Returns None
        * `x`
            * type: int
            * values: 0 (left) ~ 72 (right)
        * `y`
            * type: int
            * values: 0 (top) ~ 40 (bottom)
        * `width`
            * type: int
            * values: 0 ~ 72
        * `height`
            * type: int
            * values: 0 ~ 40
        * `key`
            * type: int
            * values: 0 or 1 (default: -1, both black and white pixels drawn)
    * `thumby.display.drawSprite(inspr, x, y, width, height, mirrorX, mirrorY, key)` | draws pixels defined in bitmap `inspr` array at `x` and `y` provided the bitmap's `width` and `height` but with bitmap mirrorable about x and y axes using `mirrorX` and `mirrorY` flags with transparent pixels defined by `key` (e.g. `key = 0` means black pixels are not drawn/are transparent). Returns None
        * `x`
            * type: int
            * values: 0 (left) ~ 72 (right)
        * `y`
            * type: int
            * values: 0 (top) ~ 40 (bottom)
        * `width`
            * type: int
            * values: 0 ~ 72
        * `height`
            * type: int
            * values: 0 ~ 40
        * `mirrorX`
            * type: bool
            * values: 1/True (do mirror) or 0/False (do not mirror)
        * `mirrorY`
            * type: bool
            * values: 1/True (do mirror) or 0/False (do not mirror)
        * `key`
            * type: int
            * values: 0 or 1 (default: -1, both black and white pixels drawn)

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
* Caution: file creation does not work on the web IDE emulator
* ### Functions
    * `thumby.files.openFile(filename, options)` | Opens a file provided a file path in `filename` (e.g. /Games/MyGame/config.txt) with provided Python file opening `options` (https://docs.micropython.org/en/latest/esp8266/tutorial/filesystem.html). Returns None
        * `filename`
            * type: str
            * values: ASCII path with directories separated by '/'
        * `options`
            * type: str
            * values: 'w', 'r', 'wb', 'rb'
    * `thumby.files.closeFile()` | closes last file opened with `thumby.files.openFile(...)`. Returns None
    * `thumby.files.setFile(f)` | sets internally tracked file to Python file object `f` obtained from outside `thumby.files` (e.g. `f = open(..., ...)`). Returns None
    * `thumby.files.readFile(l)` | read `l` number of bytes from file opened with `thumby.files.openFile(...)`. Returns file contents or "" if no file has been opened
        * `l`
            * type: int
            * values: 0 ~ 2147483647 (default: -1, read whole file)
    * `thumby.files.writeFile(data)` | writes `data` to file opened with `thumby.files.openFile(...)`. Returns True if successful, False if not, and -1 if no file has been opened
        * `data`
            * type: str, bytes(...), bytearray(...), etc.
            * values: string or binary data depending on what options the file was opened with
    * `thumby.files.changeDirectory(path)` | change directory to `path` (e.g. currently in '/Games' pass `path` as '/Games/MyGame' now can do `f = open("MyGameConfig.txt")`). Returns None
    * `thumby.files.getDirectory()` | returns the path to the current directory as a str
    * `thumby.files.makeDirectory(path)` | makes a directory at `path`. Returns None
        * `path`
            * type: str
            * values: ASCII path with directories separated by '/'
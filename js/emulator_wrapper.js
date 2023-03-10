import { RP2040 } from '../rp2040js/dist/esm/rp2040.js';
import { USBCDC } from '../rp2040js/dist/esm/usb/cdc.js';
import { ConsoleLogger, LogLevel } from '../rp2040js/dist/esm/utils/logging.js';
import { loadUF2 } from './load-uf2.js';
import { LittleFSHelper } from './littlefs_helper.js';



export class EMULATOR{
  constructor(_container, state, _EDITORS){
    this.EDITORS = _EDITORS;
    this._container = _container;
    this._container.setState(state);

    // Used for turning strigns into bytes for writing to emulated flash through emscripten littlefs
    this.FILE_ENCODER = new TextEncoder();

    // Make sure mouse click anywhere on panel focuses the panel
    this._container.element.addEventListener('click', (event) => {
      this._container.focus();
    });
    this._container.element.addEventListener('focusin', (event) => {
      this._container.focus();
    })

    this.littlefsHelper = undefined;


    this.mcu = undefined;                                       // Main emulator object
    this.cdc = undefined;                                       // Main usb emulator object
    this.decoder = new TextDecoder('utf-8');                    // Main emulator serial output utf8 text decoder
    this.uf2Name = "emulator-firmware.uf2";                     // File name of emulator uf2 (custom compiled version)
    this.bootromName = "bootrom.bin";

    this.WIDTH = 72;
    this.HEIGHT = 40;
    this.fpst0 = 0;     // Time after calculating last frames FPS
    this.fpsAvgRobin = [];
    this.threwOutFirstFPS = false;

    this.nextLineIsAddr = false;        // Flag for parsing serial output for display buffer address
    this.displayBufferAdr = undefined;  // The actual display buffer address in ram
    this.grayscaleActive = false;  // Whether grayscale is active

    // Simple div to take up all emulator panel space so as to not rely on _container div settings that change
    this.EMULATOR_PANEL_DIV = document.createElement("div");
    this.EMULATOR_PANEL_DIV.classList = "emulator_panel";
    this._container.element.appendChild(this.EMULATOR_PANEL_DIV);

    // Where the SVGs actually should live
    this.EMULATOR_BODY_DIV = document.createElement("div");
    this.EMULATOR_BODY_DIV.classList = "emulator_body";
    this.EMULATOR_PANEL_DIV.appendChild(this.EMULATOR_BODY_DIV);

    this.EMULATOR_THUMBY = document.createElement("div");
    this.EMULATOR_THUMBY.classList = "emulator_thumby";
    this.EMULATOR_BODY_DIV.appendChild(this.EMULATOR_THUMBY);
    
    this.EMULATOR_CANVAS = document.createElement("canvas");
    this.EMULATOR_CANVAS.setAttribute("width", this.WIDTH);
    this.EMULATOR_CANVAS.setAttribute("height", this.HEIGHT);
    this.EMULATOR_CANVAS.classList.add("emulator_canvas");
    this.EMULATOR_THUMBY.appendChild(this.EMULATOR_CANVAS);
    this.EMULATOR_CANVAS.width = this.WIDTH;
    this.EMULATOR_CANVAS.height = this.HEIGHT;


    this.EMULATOR_DPAD_UP_BTN = document.createElement("button");
    this.EMULATOR_DPAD_UP_BTN.classList.add("emulator_dpad_up_btn");
    this.EMULATOR_DPAD_UP_BTN.onmousedown = () => {this.handleKeyDown({key: 'w'})};
    this.EMULATOR_DPAD_UP_BTN.onmouseup = () => {this.handleKeyUp({key: 'w'})};
    this.EMULATOR_DPAD_UP_BTN.title = "Key: W";
    this.EMULATOR_THUMBY.appendChild(this.EMULATOR_DPAD_UP_BTN);

    this.EMULATOR_DPAD_LEFT_BTN = document.createElement("button");
    this.EMULATOR_DPAD_LEFT_BTN.classList.add("emulator_dpad_left_btn");
    this.EMULATOR_DPAD_LEFT_BTN.onmousedown = () => {this.handleKeyDown({key: 'a'})};
    this.EMULATOR_DPAD_LEFT_BTN.onmouseup = () => {this.handleKeyUp({key: 'a'})};
    this.EMULATOR_DPAD_LEFT_BTN.title = "Key: A";
    this.EMULATOR_THUMBY.appendChild(this.EMULATOR_DPAD_LEFT_BTN);

    this.EMULATOR_DPAD_DOWN_BTN = document.createElement("button");
    this.EMULATOR_DPAD_DOWN_BTN.classList.add("emulator_dpad_down_btn");
    this.EMULATOR_DPAD_DOWN_BTN.onmousedown = () => {this.handleKeyDown({key: 's'})};
    this.EMULATOR_DPAD_DOWN_BTN.onmouseup = () => {this.handleKeyUp({key: 's'})};
    this.EMULATOR_DPAD_DOWN_BTN.title = "Key: S";
    this.EMULATOR_THUMBY.appendChild(this.EMULATOR_DPAD_DOWN_BTN);

    this.EMULATOR_DPAD_RIGHT_BTN = document.createElement("button");
    this.EMULATOR_DPAD_RIGHT_BTN.classList.add("emulator_dpad_right_btn");
    this.EMULATOR_DPAD_RIGHT_BTN.onmousedown = () => {this.handleKeyDown({key: 'd'})};
    this.EMULATOR_DPAD_RIGHT_BTN.onmouseup = () => {this.handleKeyUp({key: 'd'})};
    this.EMULATOR_DPAD_RIGHT_BTN.title = "Key: D";
    this.EMULATOR_THUMBY.appendChild(this.EMULATOR_DPAD_RIGHT_BTN);

    this.EMULATOR_B_BTN = document.createElement("button");
    this.EMULATOR_B_BTN.classList.add("emulator_b_btn");
    this.EMULATOR_B_BTN.onmousedown = () => {this.handleKeyDown({key: ','})};
    this.EMULATOR_B_BTN.onmouseup = () => {this.handleKeyUp({key: ','})};
    this.EMULATOR_B_BTN.title = "B Key: , (comma)";
    this.EMULATOR_THUMBY.appendChild(this.EMULATOR_B_BTN);

    this.EMULATOR_A_BTN = document.createElement("button");
    this.EMULATOR_A_BTN.classList.add("emulator_a_btn");
    this.EMULATOR_A_BTN.onmousedown = () => {this.handleKeyDown({key: '.'})};
    this.EMULATOR_A_BTN.onmouseup = () => {this.handleKeyUp({key: '.'})};
    this.EMULATOR_A_BTN.title = "A Key: . (period)";
    this.EMULATOR_THUMBY.appendChild(this.EMULATOR_A_BTN);


    this.EMULATOR_FOOTER_DIV = document.createElement("div");
    this.EMULATOR_FOOTER_DIV.classList = "emulator_footer uk-button-group";
    this.EMULATOR_PANEL_DIV.appendChild(this.EMULATOR_FOOTER_DIV);

    this.EMULATOR_STOP_BTN = document.createElement("button");
    this.EMULATOR_STOP_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
    this.EMULATOR_STOP_BTN.title = "Stop the emulator (esc)";
    this.EMULATOR_STOP_BTN.textContent = "Stop";
    this.EMULATOR_STOP_BTN.onclick = () => {this.stopEmulator()};
    this.EMULATOR_FOOTER_DIV.appendChild(this.EMULATOR_STOP_BTN);

    this.EMULATOR_START_BTN = document.createElement("button");
    this.EMULATOR_START_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
    this.EMULATOR_START_BTN.title = "Start the emulator using code from checked editors.\nStops the running script and uploads the latest of the checked files.\nFlash/storage is persistent\nKeybind: ctrl-q";
    this.EMULATOR_START_BTN.textContent = "Start";
    this.EMULATOR_START_BTN.onclick = () => {
      this.adjustCanvas();
      this.startEmulator();
    };
    this.EMULATOR_FOOTER_DIV.appendChild(this.EMULATOR_START_BTN);


    this.EMULATOR_RESTART_BTN = document.createElement("button");
    this.EMULATOR_RESTART_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
    this.EMULATOR_RESTART_BTN.title = "Completely resets and restarts the emulator. All files/flash and ram get erased.";
    this.EMULATOR_RESTART_BTN.textContent = "Restart";
    this.EMULATOR_RESTART_BTN.onclick = () => {
      this.adjustCanvas();
      this.restartEmulator();
    };
    this.EMULATOR_FOOTER_DIV.appendChild(this.EMULATOR_RESTART_BTN);


    // Resize events happen when page is zoomed in, always try to keep the same Thumby image and canvas size
    window.addEventListener('resize', (event) => {
      this.adjustSize();
    });


    this.EMULATOR_SCALE = localStorage.getItem("EmulatorScale");
    if(this.EMULATOR_SCALE == null){
      this.EMULATOR_SCALE = 1;
    }else{
      this.EMULATOR_SCALE = parseInt(this.EMULATOR_SCALE);
      document.addEventListener("DOMContentLoaded", () => {
        this.EMULATOR_THUMBY.style.width = (this.EMULATOR_THUMBY.clientWidth * this.EMULATOR_SCALE) + "px";
        this.EMULATOR_CANVAS.style.width = (this.EMULATOR_CANVAS.clientWidth * this.EMULATOR_SCALE) + "px";
        this.EMULATOR_CANVAS.style.height = (this.EMULATOR_CANVAS.clientHeight * this.EMULATOR_SCALE) + "px";
        this.adjustCanvas();
      });
    }

    this.EMULATOR_ZOOM_IN_BTN = document.createElement("button");
    this.EMULATOR_ZOOM_IN_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
    this.EMULATOR_ZOOM_IN_BTN.title = "Zoom emulator into next biggest size";
    this.EMULATOR_ZOOM_IN_BTN.setAttribute("uk-icon", "plus-circle");
    this.EMULATOR_ZOOM_IN_BTN.onclick = () => {
      if(this.EMULATOR_SCALE * 2 <= 64){
        this.EMULATOR_THUMBY.style.width = (this.EMULATOR_THUMBY.clientWidth * 2) + "px";

        this.EMULATOR_SCALE = this.EMULATOR_SCALE * 2;
        this.adjustCanvas();

        localStorage.setItem("EmulatorScale", this.EMULATOR_SCALE);
      }
    };
    this.EMULATOR_FOOTER_DIV.appendChild(this.EMULATOR_ZOOM_IN_BTN);


    this.EMULATOR_ZOOM_OUT_BTN = document.createElement("button");
    this.EMULATOR_ZOOM_OUT_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
    this.EMULATOR_ZOOM_OUT_BTN.title = "Zoom emulator into next smallest size";
    this.EMULATOR_ZOOM_OUT_BTN.setAttribute("uk-icon", "minus-circle");
    this.EMULATOR_ZOOM_OUT_BTN.onclick = () => {
      if(this.EMULATOR_SCALE > 1){
        this.EMULATOR_THUMBY.style.width = (this.EMULATOR_THUMBY.clientWidth / 2) + "px";

        this.EMULATOR_SCALE = this.EMULATOR_SCALE / 2;
        this.adjustCanvas();

        localStorage.setItem("EmulatorScale", this.EMULATOR_SCALE);
      }
    };
    this.EMULATOR_FOOTER_DIV.appendChild(this.EMULATOR_ZOOM_OUT_BTN);


    this.EMULATOR_ROTATION = localStorage.getItem("EmulatorRotation");
    if(this.EMULATOR_ROTATION == null){
      this.EMULATOR_ROTATION = 0;
    }else{
      this.EMULATOR_ROTATION = parseInt(this.EMULATOR_ROTATION);
      document.addEventListener("DOMContentLoaded", () => {
        this.EMULATOR_THUMBY.style.transform = "rotate(" + this.EMULATOR_ROTATION + "deg)" + " scale(" + 1/window.devicePixelRatio + ")";
        this.EMULATOR_CANVAS.style.transform = "rotate(" + -this.EMULATOR_ROTATION + "deg)";
      });
    }

    this.EMULATOR_ROTATE_BTN = document.createElement("button");
    this.EMULATOR_ROTATE_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
    this.EMULATOR_ROTATE_BTN.title = "Rotate Thumby 90 degrees clockwise";
    this.EMULATOR_ROTATE_BTN.textContent = "\u21bb";
    this.EMULATOR_ROTATE_BTN.onclick = () => {
      this.EMULATOR_ROTATION = this.EMULATOR_ROTATION + 90;

      if(this.EMULATOR_ROTATION >= 360){
        this.EMULATOR_ROTATION = 0;
      }
      this.remapButtons();

      this.EMULATOR_THUMBY.style.transform = "rotate(" + this.EMULATOR_ROTATION + "deg)" + " scale(" + 1/window.devicePixelRatio + ")";
      this.EMULATOR_CANVAS.style.transform = "rotate(" + -this.EMULATOR_ROTATION + "deg)";
      this.adjustCanvas();

      localStorage.setItem("EmulatorRotation", this.EMULATOR_ROTATION);
    };
    this.EMULATOR_FOOTER_DIV.appendChild(this.EMULATOR_ROTATE_BTN);


    this.EMULATOR_MUTE_BTN = document.createElement("button");
    this.EMULATOR_MUTE_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
    this.EMULATOR_MUTE_BTN.innerText= "Mute";
    this.EMULATOR_MUTE_BTN.title = "Mute or unmute emulator audio";
    this.EMULATOR_MUTE_BTN.onclick = () => {
      if(this.EMULATOR_MUTED == undefined || this.EMULATOR_MUTED == false){
        this.EMULATOR_MUTED = true;
        this.EMULATOR_MUTE_BTN.innerHTML = "UNMUTE";
        if (this.AUDIO_VOLUME != undefined) this.AUDIO_VOLUME.gain.value = 0.0;
      }else{
        this.EMULATOR_MUTED = false;
        this.EMULATOR_MUTE_BTN.innerHTML = "MUTE";
        if (this.AUDIO_VOLUME != undefined) this.AUDIO_VOLUME.gain.value = 0.25;
      }
    };
    this.EMULATOR_FOOTER_DIV.appendChild(this.EMULATOR_MUTE_BTN);


    this.EMULATOR_FS_DIV = document.createElement("div");
    this.EMULATOR_FS_DIV.classList = "emulator_fs_slide_div";
    this.EMULATOR_BODY_DIV.appendChild(this.EMULATOR_FS_DIV);
    this.EMULATOR_FS_DIV.onmouseenter = () => {
      this.EMULATOR_FS_DIV.style.display = "flex";
    }
    this.EMULATOR_FS_DIV.onmouseleave = () => {
      this.EMULATOR_FS_DIV.style.display = "none";
    }

    this.EMULATOR_FS_TOGGLE_BTN = document.createElement("button");
    this.EMULATOR_FS_TOGGLE_BTN.classList = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
    this.EMULATOR_FS_TOGGLE_BTN.textContent = "FILES";
    this.EMULATOR_FS_TOGGLE_BTN.onclick = () => {
      if(this.EMULATOR_FS_DIV.style.display == "none" || this.EMULATOR_FS_DIV.style.display == ""){
        this.EMULATOR_FS_DIV.style.display = "flex";
        this.refreshFileList();
      }else{
        this.EMULATOR_FS_DIV.style.display = "none";
      }
    }
    this.EMULATOR_FS_TOGGLE_BTN.onmouseleave = () => {
      this.EMULATOR_FS_DIV.style.display = "none";
    }
    this.EMULATOR_FOOTER_DIV.appendChild(this.EMULATOR_FS_TOGGLE_BTN);


    this.EMULATOR_SCREENSHOT_BTN = document.createElement("button");
    this.EMULATOR_SCREENSHOT_BTN.className = "uk-button uk-button-primary uk-button-small emulator_screenshot_btn";
    this.EMULATOR_SCREENSHOT_BTN.title = "Take screenshot of emulator and download as a .png";
    this.EMULATOR_SCREENSHOT_BTN.setAttribute("uk-icon", "camera");
    this.EMULATOR_SCREENSHOT_BTN.onclick = () => {
      console.log("Taking screenshot!");
      var link = document.createElement('a');
      link.download = 'thumby_emulator_screenshot.png';
      link.href = this.EMULATOR_CANVAS.toDataURL();
      link.click();
    };
    this.EMULATOR_BODY_DIV.appendChild(this.EMULATOR_SCREENSHOT_BTN);


    this.RECORDING = false;

    this.EMULATOR_TOGGLE_RECORD_BTN = document.createElement("button");
    this.EMULATOR_TOGGLE_RECORD_BTN.className = "uk-button uk-button-primary uk-button-small emulator_record_toggle_btn";
    this.EMULATOR_TOGGLE_RECORD_BTN.title = "Toggle recording of emulator to .webm file";
    this.EMULATOR_TOGGLE_RECORD_BTN.setAttribute("uk-icon", "video-camera");
    this.EMULATOR_TOGGLE_RECORD_BTN.onclick = () => {this.toggleRecording()};
    this.EMULATOR_BODY_DIV.appendChild(this.EMULATOR_TOGGLE_RECORD_BTN);


    // <button title="Opens link in new tab" onclick="window.open('https://tinycircuits.com/blogs/thumby/building-a-game-with-the-thumby-ide', '_blank');" class="uk-button-default uk-link-text uk-width-1-1 uk-height-1-1">Tutorial</button>
    this.EMULATOR_SCALE_DISPLAY = document.createElement("button");
    this.EMULATOR_SCALE_DISPLAY.className = "uk-button uk-button-default uk-button-small emulator_resolution_display";
    this.EMULATOR_SCALE_DISPLAY.title = "Current scale of emulator (canvas resolution: 72x40px)";
    this.EMULATOR_SCALE_DISPLAY.style.cursor = "initial";
    this.EMULATOR_SCALE_DISPLAY.textContent = "1x";
    this.EMULATOR_BODY_DIV.appendChild(this.EMULATOR_SCALE_DISPLAY);


    this.EMULATOR_FPS_DISPLAY = document.createElement("p");
    this.EMULATOR_FPS_DISPLAY.classList = "emulator_fps_display";
    this.EMULATOR_FPS_DISPLAY.title = "Current frames per second that the canvas is being painted at\nAveraged over the last 5 frames times";
    this.EMULATOR_FPS_DISPLAY.style.cursor = "initial";
    this.EMULATOR_FPS_DISPLAY.innerText = "0FPS";
    this.EMULATOR_BODY_DIV.appendChild(this.EMULATOR_FPS_DISPLAY);


    this.EMULATOR_DPAD_SVG = document.createElement("img");
    this.EMULATOR_DPAD_SVG.classList = "emulator_dpad_img";
    this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_NORMAL.svg";
    this.EMULATOR_DPAD_SVG.title = "Keys: WASD";
    this.EMULATOR_THUMBY.appendChild(this.EMULATOR_DPAD_SVG);

    this.EMULATOR_B_SVG = document.createElement("img");
    this.EMULATOR_B_SVG.classList = "emulator_b_img";
    this.EMULATOR_B_SVG.src = "css/svgs/emulator/Emulator-BTN_NORMAL.svg";
    this.EMULATOR_THUMBY.appendChild(this.EMULATOR_B_SVG);

    this.EMULATOR_A_SVG = document.createElement("img");
    this.EMULATOR_A_SVG.classList = "emulator_a_img";
    this.EMULATOR_A_SVG.src = "css/svgs/emulator/Emulator-BTN_NORMAL.svg";
    this.EMULATOR_THUMBY.appendChild(this.EMULATOR_A_SVG);

    this.context = this.EMULATOR_CANVAS.getContext('2d', { alpha: false });
    this.context.imageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.oImageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;


    this.PIXELS = new Uint8ClampedArray(new ArrayBuffer(this.WIDTH * this.HEIGHT * 4));   // * 4 for RGBA (no monochrome format option)


    this.BUTTONS = {
      'w': {pressed: false,
            pin: 4,
            press: () => {this.mcu.gpio[this.BUTTONS['w'].pin].setInputValue(false)},
            depress: () => {this.mcu.gpio[this.BUTTONS['w'].pin].setInputValue(true)},
            animatePressed: () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_U_PRESSED.svg";},
            animateDepressed: () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_NORMAL.svg";}},

      'a': {pressed: false,
            pin: 3,
            press: () => {this.mcu.gpio[this.BUTTONS['a'].pin].setInputValue(false)},
            depress: () => {this.mcu.gpio[this.BUTTONS['a'].pin].setInputValue(true)},
            animatePressed: () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_L_PRESSED.svg";},
            animateDepressed: () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_NORMAL.svg";}},

      's': {pressed: false,
            pin: 6,
            press: () => {this.mcu.gpio[this.BUTTONS['s'].pin].setInputValue(false)},
            depress: () => {this.mcu.gpio[this.BUTTONS['s'].pin].setInputValue(true)},
            animatePressed: () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_D_PRESSED.svg";},
            animateDepressed: () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_NORMAL.svg";}},

      'd': {pressed: false,
            pin: 5,
            press: () => {this.mcu.gpio[this.BUTTONS['d'].pin].setInputValue(false)},
            depress: () => {this.mcu.gpio[this.BUTTONS['d'].pin].setInputValue(true)},
            animatePressed: () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_R_PRESSED.svg";},
            animateDepressed: () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_NORMAL.svg";}},

      ',': {pressed: false,
            pin: 24,
            press: () => {this.mcu.gpio[this.BUTTONS[','].pin].setInputValue(false)},
            depress: () => {this.mcu.gpio[this.BUTTONS[','].pin].setInputValue(true)},
            animatePressed: () => {this.EMULATOR_B_SVG.src = "css/svgs/emulator/Emulator-BTN_PRESSED.svg";},
            animateDepressed: () => {this.EMULATOR_B_SVG.src = "css/svgs/emulator/Emulator-BTN_NORMAL.svg";}},

      '.': {pressed: false,
            pin: 27,
            press: () => {this.mcu.gpio[this.BUTTONS['.'].pin].setInputValue(false)},
            depress: () => {this.mcu.gpio[this.BUTTONS['.'].pin].setInputValue(true)},
            animatePressed: () => {this.EMULATOR_A_SVG.src = "css/svgs/emulator/Emulator-BTN_PRESSED.svg";},
            animateDepressed: () => {this.EMULATOR_A_SVG.src = "css/svgs/emulator/Emulator-BTN_NORMAL.svg";}},
    }

    // Make sure to remap buttons to saved rotation
    this.remapButtons();

    this.LAST_FILE_CONTENTS = "";
    this.LAST_KEY = "";
    this.onData = undefined;

    
    // Adjust the size and rotation of the canvas after everything loads on the page, start the media recorder
    this.EMULATOR_RECORD_STREAM = this.EMULATOR_CANVAS.captureStream();
    this.EMULATOR_RECORDED_CHUNKS = [];
    var options = {};
    this.EMULATOR_MEDIA_RECORDER = new MediaRecorder(this.EMULATOR_RECORD_STREAM, options);

    this.EMULATOR_MEDIA_RECORDER.ondataavailable = (event) => {

      this.EMULATOR_RECORDED_CHUNKS.push(event.data);

      // after stop `dataavilable` event run one more time to push last chunk
      if (this.EMULATOR_MEDIA_RECORDER.state === 'recording') {
        this.EMULATOR_MEDIA_RECORDER.stop();
      }
    }

    this.EMULATOR_MEDIA_RECORDER.onstop = (event) => {
      var blob = new Blob(this.EMULATOR_RECORDED_CHUNKS, {type: "video/webm" });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.download = 'emulator_video.webm';
      link.href = url;
      link.click();
      window.URL.revokeObjectURL(url);
    }

    // Main file to start emulation, set in startEmulate() and used in cdc start
    this.MAIN_FILE = "";

    // "brightness" of emulator pixels as set by MicroPython (127 is max)
    this.setBrightness(127);

    // Setup key press and un-press on first emulator start (maybe these should only work when the emulator has focus?)
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);

    // Init audio
    this.AUDIO_CONTEXT = new(window.AudioContext || window.webkitAudioContext)();
    this.AUDIO_VOLUME = this.AUDIO_CONTEXT.createGain();
    this.AUDIO_VOLUME.connect(this.AUDIO_CONTEXT.destination);
    this.AUDIO_VOLUME.gain.value = 0.25;
    this.AUDIO_BUZZER = this.AUDIO_CONTEXT.createOscillator();
    this.AUDIO_BUZZER.frequency.value = 0;
    this.AUDIO_BUZZER.type = "triangle";
    this.AUDIO_BUZZER.start();
    this.AUDIO_BUZZER.connect(this.AUDIO_VOLUME);
  }


  // Takes value from 0 to 127 and scales this.BRIGHTNESS from 0 to 255
  setBrightness(brightness){
    this.BRIGHTNESS = Math.floor((brightness / 127) * 255);
  }


  refreshFileList(){
    // Remove all child div nodes
    while(this.EMULATOR_FS_DIV.children.length > 0){
      this.EMULATOR_FS_DIV.removeChild(this.EMULATOR_FS_DIV.children[0]);
    }
    
    for (const [editorID, editorWrapper] of Object.entries(this.EDITORS)) {
      if(editorWrapper.NORMAL_EMU_CHECKBOX.checked || editorWrapper.MAIN_EMU_CHECKBOX.checked){
        // var currentName = editorWrapper.EDITOR_PATH.substring(editorWrapper.EDITOR_PATH.lastIndexOf('/')+1);
        
        var newChild = document.createElement("div");
        newChild.classList = "emulator_file_row";
        newChild.innerHTML = editorWrapper.compiledPath();
        this.EMULATOR_FS_DIV.appendChild(newChild);
      }
    }
  }


  // Emulator canvas manually sized, rotated, and scaled so recording can be done as it happens (not css transforms)
  adjustCanvas(){
    // Before modifying and erasing the canvas, grab a frame to restore afterwards (avoids black screen for static screens)
    const imageData = this.context.getImageData(0, 0, this.EMULATOR_CANVAS.width, this.EMULATOR_CANVAS.height);
    if(this.EMULATOR_ROTATION == 90 || this.EMULATOR_ROTATION == 270){
      this.EMULATOR_CANVAS.width = this.HEIGHT * this.EMULATOR_SCALE;
      this.EMULATOR_CANVAS.height = this.WIDTH * this.EMULATOR_SCALE;
      this.context.translate((this.HEIGHT*this.EMULATOR_SCALE)/2, (this.WIDTH*this.EMULATOR_SCALE)/2);
      this.EMULATOR_CANVAS.style.marginTop = "9.5%";
    }else{
      this.EMULATOR_CANVAS.width = this.WIDTH * this.EMULATOR_SCALE;
      this.EMULATOR_CANVAS.height = this.HEIGHT * this.EMULATOR_SCALE;
      this.context.translate((this.WIDTH*this.EMULATOR_SCALE)/2, (this.HEIGHT*this.EMULATOR_SCALE)/2);
      this.EMULATOR_CANVAS.style.marginTop = "16.5%";
    }

    this.EMULATOR_SCALE_DISPLAY.textContent = this.EMULATOR_SCALE + "x";
    this.EMULATOR_SCALE_DISPLAY.title = "Current scale of emulator (canvas resolution: " + this.WIDTH * this.EMULATOR_SCALE + "x" + this.HEIGHT * this.EMULATOR_SCALE + "px)";

    this.EMULATOR_CANVAS.style.width = this.EMULATOR_CANVAS.width + "px";
    this.EMULATOR_CANVAS.style.height = this.EMULATOR_CANVAS.height + "px";

    
    this.context.rotate(this.EMULATOR_ROTATION * Math.PI / 180);
    this.context.scale(this.EMULATOR_SCALE, this.EMULATOR_SCALE);
    
    // Restore the frame from before modifying the canvas
    createImageBitmap(imageData).then((imgBitmap) => {
      this.context.drawImage(imgBitmap, -this.WIDTH/2, -this.HEIGHT/2, this.WIDTH, this.HEIGHT);
    });

    this.context.imageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.oImageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
  }


  stopRecording(){
    this.EMULATOR_TOGGLE_RECORD_BTN.style.backgroundColor = "#222";
    this.RECORDING = false;
    this.EMULATOR_MEDIA_RECORDER.stop();
    console.log("Stopped Recording...");
  }


  startRecording(){
    this.EMULATOR_TOGGLE_RECORD_BTN.style.backgroundColor = "red";
    this.RECORDING = true;
    this.EMULATOR_RECORDED_CHUNKS = [];
    this.EMULATOR_MEDIA_RECORDER.start();
    console.log("Started Recording...");
  }


  toggleRecording(){
    if(this.RECORDING){
      this.stopRecording();
    }else{
      this.startRecording();
    }
  }


  // Used to remap buttons when the emulator is rotated
  remapButtons(){
    if(this.EMULATOR_ROTATION == 0 || this.EMULATOR_ROTATION == 360){
      // console.log("0");
      this.BUTTONS['w'].pin = 4;
      this.EMULATOR_DPAD_UP_BTN.title = "Key: W";
      this.BUTTONS['w'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_U_PRESSED.svg";};

      this.BUTTONS['a'].pin = 3;
      this.EMULATOR_DPAD_LEFT_BTN.title = "Key: A";
      this.BUTTONS['a'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_L_PRESSED.svg";};

      this.BUTTONS['s'].pin = 6;
      this.EMULATOR_DPAD_DOWN_BTN.title = "Key: S";
      this.BUTTONS['s'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_D_PRESSED.svg";};

      this.BUTTONS['d'].pin = 5;
      this.EMULATOR_DPAD_RIGHT_BTN.title = "Key: D";
      this.BUTTONS['d'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_R_PRESSED.svg";};
    }else if(this.EMULATOR_ROTATION == 90){
      // console.log("90");
      this.BUTTONS['w'].pin = 3;
      this.EMULATOR_DPAD_LEFT_BTN.title = "Key: W";
      this.BUTTONS['w'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_L_PRESSED.svg";};

      this.BUTTONS['a'].pin = 6;
      this.EMULATOR_DPAD_DOWN_BTN.title = "Key: A";
      this.BUTTONS['a'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_D_PRESSED.svg";};

      this.BUTTONS['s'].pin = 5;
      this.EMULATOR_DPAD_RIGHT_BTN.title = "Key: S";
      this.BUTTONS['s'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_R_PRESSED.svg";};

      this.BUTTONS['d'].pin = 4;
      this.EMULATOR_DPAD_UP_BTN.title = "Key: D";
      this.BUTTONS['d'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_U_PRESSED.svg";};
    }else if(this.EMULATOR_ROTATION == 180){
      // console.log("180");
      this.BUTTONS['w'].pin = 6;
      this.EMULATOR_DPAD_DOWN_BTN.title = "Key: W";
      this.BUTTONS['w'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_D_PRESSED.svg";};

      this.BUTTONS['a'].pin = 5;
      this.EMULATOR_DPAD_RIGHT_BTN.title = "Key: A";
      this.BUTTONS['a'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_R_PRESSED.svg";};

      this.BUTTONS['s'].pin = 4;
      this.EMULATOR_DPAD_UP_BTN.title = "Key: S";
      this.BUTTONS['s'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_U_PRESSED.svg";};

      this.BUTTONS['d'].pin = 3;
      this.EMULATOR_DPAD_LEFT_BTN.title = "Key: D"
      this.BUTTONS['d'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_L_PRESSED.svg";};
    }else if(this.EMULATOR_ROTATION == 270){
      // console.log("270");
      this.BUTTONS['w'].pin = 5;
      this.EMULATOR_DPAD_RIGHT_BTN.title = "Key: W";
      this.BUTTONS['w'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_R_PRESSED.svg";};

      this.BUTTONS['a'].pin = 4;
      this.EMULATOR_DPAD_UP_BTN.title = "Key: A";
      this.BUTTONS['a'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_U_PRESSED.svg";};

      this.BUTTONS['s'].pin = 3;
      this.EMULATOR_DPAD_LEFT_BTN.title = "Key: S";
      this.BUTTONS['s'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_L_PRESSED.svg";};

      this.BUTTONS['d'].pin = 6;
      this.EMULATOR_DPAD_DOWN_BTN.title = "Key: D";
      this.BUTTONS['d'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_D_PRESSED.svg";};
    }
  }


  // Used to make Thumby resistent to page zoom
  adjustSize(){
    this.EMULATOR_THUMBY.style.transform = "rotate(" + this.EMULATOR_ROTATION + "deg)" + " scale(" + 1/window.devicePixelRatio + ")";
  }


  // If two directions on DPAD are clicked, use that, otherwise use a single direction
  // Always animate A + B buttons separate from DPAD since can be pressed at same time
  animatePressedButtons(){
    if(this.BUTTONS['w'].pressed && this.BUTTONS['a'].pressed){
      this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_UL_PRESSED.svg";
    }else if(this.BUTTONS['a'].pressed && this.BUTTONS['s'].pressed){
      this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_LD_PRESSED.svg";
    }else if(this.BUTTONS['s'].pressed && this.BUTTONS['d'].pressed){
      this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_DR_PRESSED.svg";
    }else if(this.BUTTONS['d'].pressed && this.BUTTONS['w'].pressed){
      this.EMULATOR_DPAD_SVG.src = "css/svgs/emulator/Emulator-DPAD_UR_PRESSED.svg";
    }else{
      if(this.BUTTONS['w'].pressed){
        this.BUTTONS['w'].animatePressed();
      }
      if(this.BUTTONS['a'].pressed){
        this.BUTTONS['a'].animatePressed();
      }
      if(this.BUTTONS['s'].pressed){
        this.BUTTONS['s'].animatePressed();
      }
      if(this.BUTTONS['d'].pressed){
        this.BUTTONS['d'].animatePressed();
      }
    }
    if(this.BUTTONS['.'].pressed){
      this.BUTTONS['.'].animatePressed();
    }
    if(this.BUTTONS[','].pressed){
      this.BUTTONS[','].animatePressed();
    }
  }


  // Handle special key presses (esc) and normal ones
  handleKeyDown = (event) => {
    if(this.BUTTONS[event.key] && this.BUTTONS[event.key].pressed == false){
      this.BUTTONS[event.key].pressed = true
      this.BUTTONS[event.key].press();
      this.animatePressedButtons();
    }else if(event.key == "Escape"){
      this.stopEmulator();
    }else if(event.key == 'q' && event.ctrlKey == true){
      this.startEmulator();
    }
  }


  // Handle keys that stopped being pressed. If two DPAD directions are pressed run and
  // one becomes depressed, run animate again to catch that other button
  handleKeyUp = (event) => {
    if(this.BUTTONS[event.key]){
      this.BUTTONS[event.key].pressed = false
      this.BUTTONS[event.key].depress();
      this.BUTTONS[event.key].animateDepressed();
      this.animatePressedButtons();
    }
  }


  updateFPS(){
    // Calculate the FPS using the time since the last frame
    const fps = ((1 / (performance.now() - this.fpst0)) * 1000);

    // Either fill or add the just calculated fps
    if(this.fpsAvgRobin.length == 5){
      // Remove the first element and add a new sample to the end
      this.fpsAvgRobin.shift();
      this.fpsAvgRobin.push(fps);

      // Throw the first FPS sample out since that includes the time since pressing start
      if(!this.threwOutFirstFPS){
        this.threwOutFirstFPS = true;
        return;
      }

      let fpsTotal = 0;
      for(let ifx=0; ifx<this.fpsAvgRobin.length; ifx++){
        fpsTotal += this.fpsAvgRobin[ifx];
      }
      // Display the FPS
      this.EMULATOR_FPS_DISPLAY.innerText = (fpsTotal/5).toFixed() + "FPS";
    }else{
      // Just fill the avg array
      this.fpsAvgRobin.push(fps);
    }

    // Track a time to be used for the next frame
    this.fpst0 = performance.now();
  }


  resetFPS(){
    this.fpst0 = performance.now();
    this.fpsAvgRobin = [];
    this.threwOutFirstFPS = false;
    this.EMULATOR_FPS_DISPLAY.innerText = "0FPS";
  }


  bufferToImageData(buffer){
    var ib = 0;
    for(var row=0; row < this.HEIGHT; row+=8){
      for(var col=0; col < this.WIDTH; col++){
        var curByte = buffer[ib];
  
        for(var i=0; i<8; i++){
          const x = col;
          const y = row + i;
          const bit = ((curByte & (1 << i)) === 0 ? 0 : 1) * this.BRIGHTNESS;
          const p = (y * this.WIDTH + x) * 4;
          this.PIXELS[p] = bit;
          this.PIXELS[p+1] = bit;
          this.PIXELS[p+2] = bit;
          this.PIXELS[p+3] = 255;
        }
  
        ib += 1;
      }
    }
    
    return new ImageData(this.PIXELS, this.WIDTH, this.HEIGHT);
  }

  bufferGrayscaleToImageData(buffer){
    var ib = 0;
    for(var row=0; row < this.HEIGHT; row+=8){
      for(var col=0; col < this.WIDTH; col++){
        var curByte = buffer[ib];
        var curShad = buffer[ib+360];

        for(var i=0; i<8; i++){
          const x = col;
          const y = row + i;
          const lit = ((curByte & (1 << i)) === 0 ? 0 : 1);
          const shad = ((curShad & (1 << i)) === 0 ? 0 : 1);
          const bit = (lit ? (shad ? 0.67 : 1) : (shad ? 0.33 : 0)) * this.BRIGHTNESS;
          const p = (y * this.WIDTH + x) * 4;
          this.PIXELS[p] = bit;
          this.PIXELS[p+1] = bit;
          this.PIXELS[p+2] = bit;
          this.PIXELS[p+3] = 255;
        }

        ib += 1;
      }
    }

    return new ImageData(this.PIXELS, this.WIDTH, this.HEIGHT);
  }

  // Use address from emulator module breakpoint listening
  async drawDisplayBuffer(){
    if (this.grayscaleActive) {
      const buffer = this.mcu.sram.subarray(this.displayBufferAdr, this.displayBufferAdr+360*2);

      await createImageBitmap(this.bufferGrayscaleToImageData(buffer)).then(async (imgBitmap) => {
        this.context.drawImage(imgBitmap, -this.WIDTH/2, -this.HEIGHT/2);
        this.updateFPS();
      });
      return;
    }

    
    const buffer = this.mcu.sram.subarray(this.displayBufferAdr, this.displayBufferAdr+360);

    // Maybe change this to putImage(): https://themadcreator.github.io/gifler/docs.html#animator::createBufferCanvas()
    // this.context.putImageData(this.bufferToImageData(buffer), 0, 0);
    await createImageBitmap(this.bufferToImageData(buffer)).then(async (imgBitmap) => {
      this.context.drawImage(imgBitmap, -this.WIDTH/2, -this.HEIGHT/2);
      this.updateFPS();
    });
  }


  // Loads file contents from server into littlefs.wasm (library files typically, uf2 is a separate function)
  async loadServerFile(serverFilePath, serverFileName){
    console.log("Server file loading");

    // Get server file contents and check if OK
    let response = await fetch(serverFilePath);
    if(response.status != 200) {
      throw new Error("Server Error");
    }
        
    // Read response stream as text and use load-file.js + load-file-gen.js to make littlefs entries
    let text_data = new Uint8Array(await response.arrayBuffer());
    this.littlefsHelper.write(text_data, serverFileName);
    console.log("Server file loaded");
  }


  // Sends a string to the MicroPython normal prompt
  sendStringToNormal(str){
    for (const byte of str) {
      this.cdc.sendSerialByte(byte.charCodeAt(0));
    }
    
    this.cdc.sendSerialByte('\r'.charCodeAt(0));
  }

  
  async getMainEditorFilePath(){
    for (const [editorID, editorWrapper] of Object.entries(this.EDITORS)) {
      if(!editorWrapper.EDITOR_PATH){continue}
      if(editorWrapper.MAIN_EMU_CHECKBOX.checked){
        return editorWrapper.compiledPath();;
      }
    }
    return false;
  }


  async uploadEditorFiles(){
    // Loop through all editors and get file names + content
    for (const [editorID, editorWrapper] of Object.entries(this.EDITORS)) {
      if(!editorWrapper.EDITOR_PATH){continue}

      // Check that the first character is a forward slash, otherwise, add it
      // (Emulator will not load file without it!)
      if(editorWrapper.EDITOR_PATH[0] != "/"){
        editorWrapper.EDITOR_PATH = "/" + editorWrapper.EDITOR_PATH;
      }

      if(editorWrapper.NORMAL_EMU_CHECKBOX.checked || editorWrapper.MAIN_EMU_CHECKBOX.checked){

        // Make sure not to re-encode binary data retrieved from editor, also, get it the right way
        if(editorWrapper.isEditorBinary()){
          await editorWrapper.getDBFile((typedFileData) => {
            this.littlefsHelper.write(typedFileData, editorWrapper.EDITOR_PATH);
          })
        }else{
          this.littlefsHelper.write(this.FILE_ENCODER.encode(editorWrapper.getValue()), editorWrapper.compiledPath());
        }
      }
    }
  }


  // This seems to cause the rp2040js emulator to print an out of bounds read error
  // but that might be because it the next instructions were initiated from a callback
  // on an object that does not exist anymore
  stopEmulator(){
    if(this.mcu != undefined){
      console.log("Emulator stopped");
    
      this.mcu.stop();
      this.mcu.reset();

      this.mcu = undefined;
      this.cdc = undefined;
      this.littlefsHelper = undefined;

      if (this.AUDIO_BUZZER != undefined) this.AUDIO_BUZZER.stop();

      this.EMULATOR_CANVAS.style.display = "none";
    }
  }


  restartEmulator(){
    this.stopEmulator();
    this.startEmulator();
  }


  // Use this to start emulator and to restart it (just call it again)
  async startEmulator(){
    if(window.setPercent) window.setPercent(1, "Starting emulator...");

    const mainFile = await this.getMainEditorFilePath();

    if(!mainFile){
      console.log("No main file found...");
      if(window.resetPercentDelay) window.resetPercentDelay();
      alert("No editor designated as main (red checkbox), stopping");
      return;
    }else if(this.MAIN_FILE != mainFile){
      // If the last main file loaded doesn't equal the one now, restart the emulator so that the new
      // file starts from a clean REPL
      if(this.MAIN_FILE != "" ){
        console.log("Resetting emulator, new main file...");
        this.onData("\nRestarting emulator, new main file...\n");
      }
      this.MAIN_FILE = mainFile;
      this.restartEmulator();
      return;
    }

    // Reset these so FPS is calculated correctly next time
    this.resetFPS();

    if(this.mcu == undefined){
      // These all need reset or subsequent runs will start at the wrong places
      this.displayBufferAdr = undefined;
      this.grayscaleActive = false;
      this.nextLineIsAddr = false;

      if(window.setPercent) window.setPercent(10);

      // Make the emulator MCU and cdc objects
      this.mcu = new RP2040();
      this.cdc = new USBCDC(this.mcu.usbCtrl);

      // Setup common callbacks
      this.mcu.onScreenAddr = (addr) => {
        // Treat 0 and 1 as special grayscale status flags,
        // which presumes the display buffer is never at those addresses.
        if (addr == 0) this.grayscaleActive = false;
        else if (addr == 1) this.grayscaleActive = true;
        else {
          this.grayscaleActive = false
          this.displayBufferAdr = addr - 0x20000000
        }
      }
      this.mcu.onAudioFreq = (freq) => {
        freq = freq + 0.0001;
        this.AUDIO_BUZZER.frequency.exponentialRampToValueAtTime(freq, this.AUDIO_CONTEXT.currentTime + 0.03);
      }
      this.mcu.onBrightness = (brightness) => {
        this.setBrightness(brightness);
      }
      // Display updates based off MicroPython flipping a gpio pin in the ssd1306 library (special emulator
      // version that also provides the display buffer address that is then used here for canvas drawing)
      this.mcu.gpio[2].addListener(() => {
        this.drawDisplayBuffer();
      });
      this.cdc.onDeviceConnected = () => {
        // We send a newline so the user sees the MicroPython prompt
        this.cdc.sendSerialByte('\r'.charCodeAt(0));
        this.cdc.sendSerialByte('\n'.charCodeAt(0));
        
        // Set default button gpio pin states
        this.mcu.gpio[24].setInputValue(true);
        this.mcu.gpio[27].setInputValue(true);
        this.mcu.gpio[4].setInputValue(true);
        this.mcu.gpio[3].setInputValue(true);
        this.mcu.gpio[6].setInputValue(true);
        this.mcu.gpio[5].setInputValue(true);
        
        // Start the program the user chose to emulate
        if(this.MAIN_FILE.indexOf(".py") != -1){
          this.sendStringToNormal("execfile('" + this.MAIN_FILE.split('.')[0] + ".py')");
        }else{
          this.sendStringToNormal("execfile('" + this.MAIN_FILE + ".py')");
        }
        if(window.setPercent) window.setPercent(100);
        if(window.resetPercentDelay) window.resetPercentDelay();
      };
      this.cdc.onSerialData = (value) => {
        this.onData(this.decoder.decode(value));  // Ends up being output to shell on page (same as the hardware)
      };

      this.mcu.loadBootrom(new Uint32Array(await (await fetch(this.bootromName)).arrayBuffer()));
      this.mcu.logger = new ConsoleLogger(LogLevel.Error);

      if(window.setPercent) window.setPercent(20);

      // Load UF2 then custom emulator MP library files + the user file(s)
      await loadUF2(this.uf2Name, this.mcu);

      // Setup the little FS virtual JS filesystem
      this.littlefsHelper = new LittleFSHelper();
      await this.littlefsHelper.init(this.mcu.flash); // Setup virtual filesystem with flash that already has the bootrom and MP

      await this.uploadEditorFiles();

      if(window.setPercent) window.setPercent(50);

      await this.loadServerFile("ThumbyGames/lib-emulator/thumby.py", '/lib/thumby.py');
      await this.loadServerFile("ThumbyGames/lib-emulator/ssd1306.py", '/lib/ssd1306.py');

      await this.loadServerFile("ThumbyGames/lib-emulator/thumbyAudio.py", "/lib/thumbyAudio.py");
      await this.loadServerFile("ThumbyGames/lib-emulator/thumbyButton.py", "/lib/thumbyButton.py");
      await this.loadServerFile("ThumbyGames/lib-emulator/thumbyGraphics.py", "/lib/thumbyGraphics.py");
      await this.loadServerFile("ThumbyGames/lib-emulator/thumbyHardware.py", "/lib/thumbyHardware.py");
      await this.loadServerFile("ThumbyGames/lib-emulator/thumbyLink.py", "/lib/thumbyLink.py");
      await this.loadServerFile("ThumbyGames/lib-emulator/thumbySaves.py", "/lib/thumbySaves.py");
      await this.loadServerFile("ThumbyGames/lib-emulator/thumbySprite.py", "/lib/thumbySprite.py");

      await this.loadServerFile("ThumbyGames/lib-emulator/font3x5.bin", '/lib/font3x5.bin');
      await this.loadServerFile("ThumbyGames/lib-emulator/font5x7.bin", '/lib/font5x7.bin');
      await this.loadServerFile("ThumbyGames/lib-emulator/font8x8.bin", '/lib/font8x8.bin');
      await this.loadServerFile("ThumbyGames/lib-emulator/TClogo.bin", '/lib/TClogo.bin');
      await this.loadServerFile("ThumbyGames/lib-emulator/thumbyLogo.bin", '/lib/thumbyLogo.bin');
      
      if(window.setPercent) window.setPercent(75);

      // Start the emulator
      this.mcu.PC = 0x10000000;

      this.littlefsHelper.unmount();
      this.mcu.start();
    }else{
      if(this.cdc) this.cdc.sendSerialByte('\x03'.charCodeAt(0));
      this.mcu.stop();  // Pause the emulator

      if(window.setPercent) window.setPercent(10);

      this.littlefsHelper.mount();
      await this.uploadEditorFiles();
      this.littlefsHelper.unmount();

      this.mcu.start(); // Start it again

      // Start the program the user chose to emulate
      if(this.MAIN_FILE.indexOf(".py") != -1){
        this.sendStringToNormal("execfile('" + this.MAIN_FILE.split('.')[0] + ".py')");
      }else{
        this.sendStringToNormal("execfile('" + this.MAIN_FILE + ".py')");
      }
      if(window.setPercent) window.setPercent(100);
      if(window.resetPercentDelay) window.resetPercentDelay();
    }

    // Show the emulator (un-hide)
    this.EMULATOR_CANVAS.style.display = "block";
  }
}

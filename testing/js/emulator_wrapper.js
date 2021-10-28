import { RP2040 } from '../rp2040js/dist/esm/rp2040.js';
import { USBCDC } from '../rp2040js/dist/esm/usb/cdc.js';
import { RPI2C } from '../rp2040js/dist/esm/peripherals/i2c.js';
import { ConsoleLogger, LogLevel } from '../rp2040js/dist/esm/utils/logging.js';
import { bootromB1 } from './bootrom.js';
import { loadUF2 } from './load-uf2.js';


export class EMULATOR{
  constructor(_container, state){
    this._container = _container;
    this._container.setState(state);


    // Make sure mouse click anywhere on panel focuses the panel
    this._container.element.addEventListener('click', (event) => {
      this._container.focus();
    });
    this._container.element.addEventListener('focusin', (event) => {
      this._container.focus();
    })


    this.mcu = undefined;                                       // Main emulator object
    this.cdc = undefined;                                       // Main usb emulator object
    this.decoder = new TextDecoder('utf-8');                    // Main emulator serial output utf8 text decoder
    this.uf2Name = "rp2-pico-20210902-v1.17-freq-custom.uf2";   // File name of emulator uf2 (custom compiled version)
    this.collectedData = "";

    this.WIDTH = 72;
    this.HEIGHT = 40;

    this.nextLineIsAddr = false;        // Flag for parsing serial output for display buffer address
    this.displayBufferAdr = undefined;  // The actual display buffer address in ram

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

    this.EMULATOR_RESTART_BTN = document.createElement("button");
    this.EMULATOR_RESTART_BTN.classList = "uk-button uk-button-default";
    this.EMULATOR_RESTART_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
    this.EMULATOR_RESTART_BTN.title = "Restarts the emulator using the file it was started with";
    this.EMULATOR_RESTART_BTN.textContent = "RESTART";
    this.EMULATOR_RESTART_BTN.onclick = () => {this.startEmulator(this.LAST_FILE_CONTENTS)};
    this.EMULATOR_FOOTER_DIV.appendChild(this.EMULATOR_RESTART_BTN);

    this.EMULATOR_STOP_BTN = document.createElement("button");
    this.EMULATOR_STOP_BTN.classList = "uk-button uk-button-default";
    this.EMULATOR_STOP_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
    this.EMULATOR_STOP_BTN.title = "Stop the emulator (esc)";
    this.EMULATOR_STOP_BTN.textContent = "Stop";
    this.EMULATOR_STOP_BTN.onclick = () => {this.stopEmulator()};
    this.EMULATOR_FOOTER_DIV.appendChild(this.EMULATOR_STOP_BTN);


    // Resize events happen when page is zoomed in, always try to keep the same Thumby image and canvas size
    window.addEventListener('resize', (event) => {
      this.adjustSize();
    });
    document.addEventListener("DOMContentLoaded", () => {
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
      });
    }

    this.EMULATOR_ZOOM_IN_BTN = document.createElement("button");
    this.EMULATOR_ZOOM_IN_BTN.classList = "uk-button uk-button-default";
    this.EMULATOR_ZOOM_IN_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
    this.EMULATOR_ZOOM_IN_BTN.title = "Zoom emulator into next biggest size";
    this.EMULATOR_ZOOM_IN_BTN.setAttribute("uk-icon", "plus-circle");
    this.EMULATOR_ZOOM_IN_BTN.onclick = () => {
      this.EMULATOR_THUMBY.style.width = (this.EMULATOR_THUMBY.clientWidth * 2) + "px";

      this.EMULATOR_CANVAS.style.width = (this.EMULATOR_CANVAS.clientWidth * 2) + "px";
      this.EMULATOR_CANVAS.style.height = (this.EMULATOR_CANVAS.clientHeight * 2) + "px";
      this.EMULATOR_SCALE = this.EMULATOR_SCALE * 2;
      localStorage.setItem("EmulatorScale", this.EMULATOR_SCALE);
    };
    this.EMULATOR_FOOTER_DIV.appendChild(this.EMULATOR_ZOOM_IN_BTN);


    this.EMULATOR_ZOOM_OUT_BTN = document.createElement("button");
    this.EMULATOR_ZOOM_OUT_BTN.classList = "uk-button uk-button-default";
    this.EMULATOR_ZOOM_OUT_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
    this.EMULATOR_ZOOM_OUT_BTN.title = "Zoom emulator into next smallest size";
    this.EMULATOR_ZOOM_OUT_BTN.setAttribute("uk-icon", "minus-circle");
    this.EMULATOR_ZOOM_OUT_BTN.onclick = () => {
      if(this.EMULATOR_SCALE > 1){
        this.EMULATOR_THUMBY.style.width = (this.EMULATOR_THUMBY.clientWidth / 2) + "px";

        this.EMULATOR_CANVAS.style.width = (this.EMULATOR_CANVAS.clientWidth / 2) + "px";
        this.EMULATOR_CANVAS.style.height = (this.EMULATOR_CANVAS.clientHeight / 2) + "px";
        this.EMULATOR_SCALE = this.EMULATOR_SCALE / 2;
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
      });
    }

    this.EMULATOR_ROTATE_BTN = document.createElement("button");
    this.EMULATOR_ROTATE_BTN.classList = "uk-button uk-button-default";
    this.EMULATOR_ROTATE_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
    this.EMULATOR_ROTATE_BTN.title = "Rotate Thumby 90 degrees clockwise";
    this.EMULATOR_ROTATE_BTN.textContent = "\u21bb";
    this.EMULATOR_ROTATE_BTN.onclick = () => {
      this.EMULATOR_ROTATION = this.EMULATOR_ROTATION + 90;

      if(this.EMULATOR_ROTATION >= 360){
        this.EMULATOR_ROTATION = 0;
      }
      this.remapButtons();
      this.EMULATOR_THUMBY.style.transform = "rotate(" + this.EMULATOR_ROTATION + "deg)";
      localStorage.setItem("EmulatorRotation", this.EMULATOR_ROTATION);
    };
    this.EMULATOR_FOOTER_DIV.appendChild(this.EMULATOR_ROTATE_BTN);


    this.EMULATOR_SCREENSHOT_BTN = document.createElement("button");
    this.EMULATOR_SCREENSHOT_BTN.className = "uk-button uk-button-primary uk-button-small emulator_screenshot_btn";
    this.EMULATOR_SCREENSHOT_BTN.title = "Save current from the emulator to a .png (native size, 72x40)";
    this.EMULATOR_SCREENSHOT_BTN.setAttribute("uk-icon", "camera");
    this.EMULATOR_SCREENSHOT_BTN.onclick = () => {
      console.log("Taking screenshot!");
      var link = document.createElement('a');
      link.download = 'thumby_emulator_screenshot.png';

      // Have to make a new canvas since get nothing if use current canvas
      // Don't save the canvas, brute-force method remake a new one every time
      var screenshotCanvas = document.createElement("canvas");
      var screenshotContext = screenshotCanvas.getContext('2d', { alpha: false });
      if(this.EMULATOR_ROTATION == 90 || this.EMULATOR_ROTATION == 270){
        screenshotCanvas.width = this.HEIGHT * this.SCREENSHOT_SCALE;
        screenshotCanvas.height = this.WIDTH * this.SCREENSHOT_SCALE;
        screenshotContext.translate((this.EMULATOR_CANVAS.height*this.SCREENSHOT_SCALE)/2, (this.EMULATOR_CANVAS.width*this.SCREENSHOT_SCALE)/2);
      }else{
        screenshotCanvas.width = this.WIDTH * this.SCREENSHOT_SCALE;
        screenshotCanvas.height = this.HEIGHT * this.SCREENSHOT_SCALE;
        screenshotContext.translate((this.EMULATOR_CANVAS.width*this.SCREENSHOT_SCALE)/2, (this.EMULATOR_CANVAS.height*this.SCREENSHOT_SCALE)/2);
      }
      
      screenshotContext.rotate(this.EMULATOR_ROTATION * Math.PI / 180);
      screenshotCanvas.classList.add("emulator_canvas");
      screenshotContext.imageSmoothingEnabled = false;
      screenshotContext.mozImageSmoothingEnabled = false;
      screenshotContext.oImageSmoothingEnabled = false;
      screenshotContext.webkitImageSmoothingEnabled = false;
      screenshotContext.msImageSmoothingEnabled = false;

      screenshotContext.scale(this.SCREENSHOT_SCALE, this.SCREENSHOT_SCALE);
      screenshotContext.drawImage(this.EMULATOR_CANVAS, -(this.EMULATOR_CANVAS.width)/2, -(this.EMULATOR_CANVAS.height)/2);
      link.href = screenshotCanvas.toDataURL();

      link.click();

      // Let garbage collector take these
      screenshotCanvas = null;
      screenshotContext = null;
    };
    this.EMULATOR_BODY_DIV.appendChild(this.EMULATOR_SCREENSHOT_BTN);

    
    // Recover last scale if exists and setup screenshot button
    this.SCREENSHOT_SCALE = localStorage.getItem("EmulatorScreenshotScale");
    if(this.SCREENSHOT_SCALE == null){
      this.SCREENSHOT_SCALE = 1;
    }else{
      this.SCREENSHOT_SCALE = parseInt(this.SCREENSHOT_SCALE);
    }

    this.EMULATOR_SCREENSHOT_SCALE_BTN = document.createElement("button");
    this.EMULATOR_SCREENSHOT_SCALE_BTN.className = "uk-button uk-button-primary uk-button-small emulator_screenshot_scale_btn";
    this.EMULATOR_SCREENSHOT_SCALE_BTN.title = "Screenshot scale from 1x to 16x (current resolution: 72x40px)";
    this.EMULATOR_SCREENSHOT_SCALE_BTN.textContent = "1x";
    this.EMULATOR_SCREENSHOT_SCALE_BTN.onclick = () => {
      this.SCREENSHOT_SCALE = this.SCREENSHOT_SCALE * 2;
      if(this.SCREENSHOT_SCALE > 16){
        this.SCREENSHOT_SCALE = 1;
      }
      this.updateScreenshotScale();
    }
    this.EMULATOR_BODY_DIV.appendChild(this.EMULATOR_SCREENSHOT_SCALE_BTN);
    this.updateScreenshotScale();


    this.EMULATOR_DPAD_SVG = document.createElement("img");
    this.EMULATOR_DPAD_SVG.classList = "emulator_dpad_img";
    this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_NORMAL.svg";
    this.EMULATOR_DPAD_SVG.title = "Keys: WASD";
    this.EMULATOR_THUMBY.appendChild(this.EMULATOR_DPAD_SVG);

    this.EMULATOR_B_SVG = document.createElement("img");
    this.EMULATOR_B_SVG.classList = "emulator_b_img";
    this.EMULATOR_B_SVG.src = "Emulator-BTN_NORMAL.svg";
    this.EMULATOR_THUMBY.appendChild(this.EMULATOR_B_SVG);

    this.EMULATOR_A_SVG = document.createElement("img");
    this.EMULATOR_A_SVG.classList = "emulator_a_img";
    this.EMULATOR_A_SVG.src = "Emulator-BTN_NORMAL.svg";
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
            animatePressed: () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_U_PRESSED.svg";},
            animateDepressed: () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_NORMAL.svg";}},

      'a': {pressed: false,
            pin: 3,
            press: () => {this.mcu.gpio[this.BUTTONS['a'].pin].setInputValue(false)},
            depress: () => {this.mcu.gpio[this.BUTTONS['a'].pin].setInputValue(true)},
            animatePressed: () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_L_PRESSED.svg";},
            animateDepressed: () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_NORMAL.svg";}},

      's': {pressed: false,
            pin: 6,
            press: () => {this.mcu.gpio[this.BUTTONS['s'].pin].setInputValue(false)},
            depress: () => {this.mcu.gpio[this.BUTTONS['s'].pin].setInputValue(true)},
            animatePressed: () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_D_PRESSED.svg";},
            animateDepressed: () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_NORMAL.svg";}},

      'd': {pressed: false,
            pin: 5,
            press: () => {this.mcu.gpio[this.BUTTONS['d'].pin].setInputValue(false)},
            depress: () => {this.mcu.gpio[this.BUTTONS['d'].pin].setInputValue(true)},
            animatePressed: () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_R_PRESSED.svg";},
            animateDepressed: () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_NORMAL.svg";}},

      ',': {pressed: false,
            pin: 27,
            press: () => {this.mcu.gpio[this.BUTTONS[','].pin].setInputValue(false)},
            depress: () => {this.mcu.gpio[this.BUTTONS[','].pin].setInputValue(true)},
            animatePressed: () => {this.EMULATOR_B_SVG.src = "Emulator-BTN_PRESSED.svg";},
            animateDepressed: () => {this.EMULATOR_B_SVG.src = "Emulator-BTN_NORMAL.svg";}},

      '.': {pressed: false,
            pin: 24,
            press: () => {this.mcu.gpio[this.BUTTONS['.'].pin].setInputValue(false)},
            depress: () => {this.mcu.gpio[this.BUTTONS['.'].pin].setInputValue(true)},
            animatePressed: () => {this.EMULATOR_A_SVG.src = "Emulator-BTN_PRESSED.svg";},
            animateDepressed: () => {this.EMULATOR_A_SVG.src = "Emulator-BTN_NORMAL.svg";}},
    }

    // Make sure to remap buttons to saved rotation
    this.remapButtons();

    this.LAST_FILE_CONTENTS = "";
    this.LAST_KEY = "";

    this.onData = undefined;
  }


  updateScreenshotScale(){
    this.EMULATOR_SCREENSHOT_SCALE_BTN.textContent = this.SCREENSHOT_SCALE + "x";
    this.EMULATOR_SCREENSHOT_SCALE_BTN.title = "Screenshot scale from 1x to 16x (current resolution: " + 72*this.SCREENSHOT_SCALE + "x" + 40*this.SCREENSHOT_SCALE + "px)";
    localStorage.setItem("EmulatorScreenshotScale", this.SCREENSHOT_SCALE);
  }


  // Used to remap buttons when the emulator is rotated
  remapButtons(){
    if(this.EMULATOR_ROTATION == 0 || this.EMULATOR_ROTATION == 360){
      // console.log("0");
      this.BUTTONS['w'].pin = 4;
      this.EMULATOR_DPAD_UP_BTN.title = "Key: W";
      this.BUTTONS['w'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_U_PRESSED.svg";};

      this.BUTTONS['a'].pin = 3;
      this.EMULATOR_DPAD_LEFT_BTN.title = "Key: A";
      this.BUTTONS['a'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_L_PRESSED.svg";};

      this.BUTTONS['s'].pin = 6;
      this.EMULATOR_DPAD_DOWN_BTN.title = "Key: S";
      this.BUTTONS['s'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_D_PRESSED.svg";};

      this.BUTTONS['d'].pin = 5;
      this.EMULATOR_DPAD_RIGHT_BTN.title = "Key: D";
      this.BUTTONS['d'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_R_PRESSED.svg";};
    }else if(this.EMULATOR_ROTATION == 90){
      // console.log("90");
      this.BUTTONS['w'].pin = 3;
      this.EMULATOR_DPAD_LEFT_BTN.title = "Key: W";
      this.BUTTONS['w'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_L_PRESSED.svg";};

      this.BUTTONS['a'].pin = 6;
      this.EMULATOR_DPAD_DOWN_BTN.title = "Key: A";
      this.BUTTONS['a'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_D_PRESSED.svg";};

      this.BUTTONS['s'].pin = 5;
      this.EMULATOR_DPAD_RIGHT_BTN.title = "Key: S";
      this.BUTTONS['s'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_R_PRESSED.svg";};

      this.BUTTONS['d'].pin = 4;
      this.EMULATOR_DPAD_UP_BTN.title = "Key: D";
      this.BUTTONS['d'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_U_PRESSED.svg";};
    }else if(this.EMULATOR_ROTATION == 180){
      // console.log("180");
      this.BUTTONS['w'].pin = 6;
      this.EMULATOR_DPAD_DOWN_BTN.title = "Key: W";
      this.BUTTONS['w'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_D_PRESSED.svg";};

      this.BUTTONS['a'].pin = 5;
      this.EMULATOR_DPAD_RIGHT_BTN.title = "Key: A";
      this.BUTTONS['a'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_R_PRESSED.svg";};

      this.BUTTONS['s'].pin = 4;
      this.EMULATOR_DPAD_UP_BTN.title = "Key: S";
      this.BUTTONS['s'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_U_PRESSED.svg";};

      this.BUTTONS['d'].pin = 3;
      this.EMULATOR_DPAD_LEFT_BTN.title = "Key: D"
      this.BUTTONS['d'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_L_PRESSED.svg";};
    }else if(this.EMULATOR_ROTATION == 270){
      // console.log("270");
      this.BUTTONS['w'].pin = 5;
      this.EMULATOR_DPAD_RIGHT_BTN.title = "Key: W";
      this.BUTTONS['w'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_R_PRESSED.svg";};

      this.BUTTONS['a'].pin = 4;
      this.EMULATOR_DPAD_UP_BTN.title = "Key: A";
      this.BUTTONS['a'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_U_PRESSED.svg";};

      this.BUTTONS['s'].pin = 3;
      this.EMULATOR_DPAD_LEFT_BTN.title = "Key: S";
      this.BUTTONS['s'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_L_PRESSED.svg";};

      this.BUTTONS['d'].pin = 6;
      this.EMULATOR_DPAD_DOWN_BTN.title = "Key: D";
      this.BUTTONS['d'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_D_PRESSED.svg";};
    }
  }


  adjustSize(){
    this.EMULATOR_THUMBY.style.transform = "rotate(" + this.EMULATOR_ROTATION + "deg)" + " scale(" + 1/window.devicePixelRatio + ")";
    // this.EMULATOR_CANVAS.style.transform = "scale(" + window.devicePixelRatio + ")";
  }


  stopEmulator(){
    console.log("Emulator stopped");
    // this.EMULATOR_MAIN_DIV.style.display = "none";
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
    
    setTimeout(() => {
      this.context.clearRect(0, 0, this.WIDTH, this.HEIGHT);
      this.context.fillStyle = "black";
      this.context.fillRect(0, 0, this.WIDTH, this.HEIGHT);}, 250);

    this.mcu.stop();
    this.mcu.reset();
  }


  // If two directions on DPAD are clicked, use that, otherwise use a single direction
  // Always animate A + B buttons separate from DPAD since can be pressed at same time
  animatePressedButtons(){
    if(this.BUTTONS['w'].pressed && this.BUTTONS['a'].pressed){
      this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_UL_PRESSED.svg";
    }else if(this.BUTTONS['a'].pressed && this.BUTTONS['s'].pressed){
      this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_LD_PRESSED.svg";
    }else if(this.BUTTONS['s'].pressed && this.BUTTONS['d'].pressed){
      this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_DR_PRESSED.svg";
    }else if(this.BUTTONS['d'].pressed && this.BUTTONS['w'].pressed){
      this.EMULATOR_DPAD_SVG.src = "Emulator-DPAD_UR_PRESSED.svg";
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


  // Handle special key presses (esc) and normal onces
  handleKeyDown = (event) => {
    if(this.BUTTONS[event.key] && this.BUTTONS[event.key].pressed == false){
      this.BUTTONS[event.key].pressed = true
      this.BUTTONS[event.key].press();
      this.animatePressedButtons();
    }else if(event.key == "Escape"){
      this.stopEmulator();
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


  // Use address fed through serial from emulator to display the contents of MicroPython's Thumby framebuffer
  drawDisplayBuffer(address){
      var ib = 0;
    
      const buffer = new Uint8Array(this.mcu.sramView.buffer.slice(this.displayBufferAdr, this.displayBufferAdr+360));

      for(var row=0; row < this.HEIGHT; row+=8){
        for(var col=0; col < this.WIDTH; col++){
          var curByte = buffer[ib];
    
          for(var i=0; i<8; i++){
            const x = col;
            const y = row + i;
            const bit = ((curByte & (1 << i)) === 0 ? 0 : 1) * 255;
            const p = (y * this.WIDTH + x) * 4;
            this.PIXELS[p] = bit;
            this.PIXELS[p+1] = bit;
            this.PIXELS[p+2] = bit;
            this.PIXELS[p+3] = 255;
          }
    
          ib += 1;
        }
      }
      
      const imageData = new ImageData(this.PIXELS, this.WIDTH, this.HEIGHT);

      // Maybe change this to putImage(): https://themadcreator.github.io/gifler/docs.html#animator::createBufferCanvas()
      this.context.putImageData(imageData, 0, 0);
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
    let text_data = await response.text();
    await window.loadFileData(text_data, serverFileName);
    console.log("Server file loaded");
  }


  // Sends a string to the MicroPython normal prompt
  sendStringToNormal(str){
    for (const byte of str) {
        this.cdc.sendSerialByte(byte.charCodeAt(0));
    }
    
    this.cdc.sendSerialByte('\r'.charCodeAt(0));
    this.cdc.sendSerialByte('\n'.charCodeAt(0));
  }


  // Use this to start emulator and to restart it (just call it again)
  async startEmulator(fileContents){
    this.LAST_FILE_CONTENTS = fileContents;

    // These all need reset or subsequent runs will start at the wrong places
    this.collectedData = "";
    this.displayBufferAdr = undefined;
    this.nextLineIsAddr = false;

    // Reset the littlefs module state (js/load-file.js)
    await window.startLittleFS();

    // Make sure emulator is stopped if starting a new one
    if(this.mcu != undefined){
        this.mcu.stop();
        this.mcu.reset();
    }

    // I guess reassigning everything works, idk, JS
    this.mcu = new RP2040();
    this.mcu.loadBootrom(bootromB1);
    this.mcu.logger = new ConsoleLogger(LogLevel.Error);


    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);


    this.cdc = new USBCDC(this.mcu.usbCtrl);

    this.cdc.onDeviceConnected = () => {
        // We send a newline so the user sees the MicroPython prompt
        this.cdc.sendSerialByte('\r'.charCodeAt(0));
        this.cdc.sendSerialByte('\n'.charCodeAt(0));

        // this.sendStringToNormal("import os");
        // this.sendStringToNormal("print(os.listdir('/'))");
        
        // Set default button gpio pin states
        this.mcu.gpio[24].setInputValue(true);
        this.mcu.gpio[27].setInputValue(true);
        this.mcu.gpio[4].setInputValue(true);
        this.mcu.gpio[3].setInputValue(true);
        this.mcu.gpio[6].setInputValue(true);
        this.mcu.gpio[5].setInputValue(true);
        
        // Start the program the user choose to emulate
        this.sendStringToNormal("import main");
    };
    this.cdc.onSerialData = (value) => {
        this.collectedData += this.decoder.decode(value);
        this.onData(this.decoder.decode(value));
        var lines = this.collectedData.split("\n");
        
        while(lines.length > 1){
            var line = lines.shift();
            console.log(line);
        
            // Check if this is a special line signifying the location of the display buffer address in emulated ram
            if(this.nextLineIsAddr == true){
                this.displayBufferAdr = parseInt(line.replace(/(\r\n|\n|\r)/gm, "")) - 0x20000000;
                this.nextLineIsAddr = false;
            }else if(line.replace(/(\r\n|\n|\r)/gm, "") == "###ADDRESS###"){
                this.nextLineIsAddr = true;
            }
        }
        this.collectedData = lines[0];
    };

    // Load UF2 then custom emulator MP library files + the user file(s)
    loadUF2(this.uf2Name, this.mcu).then(async () => {

        await window.loadFileData(fileContents, 'main.py');
        await this.loadServerFile("ThumbyGames/lib-emulator/thumby.py", 'thumby.py');
        await this.loadServerFile("ThumbyGames/lib-emulator/ssd1306.py", 'ssd1306.py');
        await window.copyFSToFlash(this.mcu);
        
        // Start the emulator
        this.mcu.PC = 0x10000000;
        this.mcu.start();
    }).catch(console.error);

    // Display updates based off MicroPython flipping a gpio pin in the ssd1306 library (special emulator
    // version that also prints out the display buffer address that is then used here for canvas drawing)
    this.mcu.gpio[2].addListener(() => {
        this.drawDisplayBuffer();
    });

    // Show the emulator (un-hide)
    // this.EMULATOR_MAIN_DIV.style.display = "flex";
  }
}
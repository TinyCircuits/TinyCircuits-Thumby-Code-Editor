import { RP2040 } from '../rp2040js/dist/esm/rp2040.js';
import { USBCDC } from '../rp2040js/dist/esm/usb/cdc.js';
import { RPI2C } from '../rp2040js/dist/esm/peripherals/i2c.js';
import { ConsoleLogger, LogLevel } from '../rp2040js/dist/esm/utils/logging.js';
import { bootromB1 } from './bootrom.js';
import { loadUF2 } from './load-uf2.js';


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


    this.mcu = undefined;                                       // Main emulator object
    this.cdc = undefined;                                       // Main usb emulator object
    this.decoder = new TextDecoder('utf-8');                    // Main emulator serial output utf8 text decoder
    this.uf2Name = "rp2-pico-freq-custom-faster.uf2";           // File name of emulator uf2 (custom compiled version)
    this.bootromName = "bootrom.bin";
    this.bootromData = undefined;                               // Store bootrom data so only need to fetch once

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

    this.EMULATOR_STOP_BTN = document.createElement("button");
    this.EMULATOR_STOP_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
    this.EMULATOR_STOP_BTN.title = "Stop the emulator (esc)";
    this.EMULATOR_STOP_BTN.textContent = "Stop";
    this.EMULATOR_STOP_BTN.onclick = () => {this.stopEmulator()};
    this.EMULATOR_FOOTER_DIV.appendChild(this.EMULATOR_STOP_BTN);

    this.EMULATOR_START_BTN = document.createElement("button");
    this.EMULATOR_START_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
    this.EMULATOR_START_BTN.title = "Start the emulator using code from checked editors";
    this.EMULATOR_START_BTN.textContent = "Start";
    this.EMULATOR_START_BTN.onclick = () => {
      this.adjustCanvas();
      this.startEmulator();
    };
    this.EMULATOR_FOOTER_DIV.appendChild(this.EMULATOR_START_BTN);


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
    this.EMULATOR_ZOOM_IN_BTN.classList = "uk-button uk-button-default";
    this.EMULATOR_ZOOM_IN_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
    this.EMULATOR_ZOOM_IN_BTN.title = "Zoom emulator into next biggest size";
    this.EMULATOR_ZOOM_IN_BTN.setAttribute("uk-icon", "plus-circle");
    this.EMULATOR_ZOOM_IN_BTN.onclick = () => {
      this.EMULATOR_THUMBY.style.width = (this.EMULATOR_THUMBY.clientWidth * 2) + "px";

      this.EMULATOR_SCALE = this.EMULATOR_SCALE * 2;
      this.adjustCanvas();

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

      this.EMULATOR_THUMBY.style.transform = "rotate(" + this.EMULATOR_ROTATION + "deg)" + " scale(" + 1/window.devicePixelRatio + ")";
      this.EMULATOR_CANVAS.style.transform = "rotate(" + -this.EMULATOR_ROTATION + "deg)";
      this.adjustCanvas();

      localStorage.setItem("EmulatorRotation", this.EMULATOR_ROTATION);
    };
    this.EMULATOR_FOOTER_DIV.appendChild(this.EMULATOR_ROTATE_BTN);

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


    // // https://stackoverflow.com/questions/54980799/webrtc-datachannel-with-manual-signaling-example-please/54985729#54985729
    // this.MULTIPLAYER_CONFIG = {iceServers: [{urls: "stun:stun.1.google.com:19302"}]};
    // this.MULTIPLAYER_PEER_CONNECTION = undefined;
    // this.MULTIPLAYER_DATA_CHANNEL = undefined;

    // this.EMULATOR_MULTIPLAYER_PARENT_DIV = document.createElement("div");
    // this.EMULATOR_MULTIPLAYER_PARENT_DIV.classList = "emulator_multiplayer_parent";
    // this.EMULATOR_PANEL_DIV.appendChild(this.EMULATOR_MULTIPLAYER_PARENT_DIV);

    // this.EMULATOR_MULTIPLAYER_TITLE_DIV = document.createElement("div");
    // this.EMULATOR_MULTIPLAYER_TITLE_DIV.classList = "emulator_multiplayer_title uk-text-center uk-text-large";
    // this.EMULATOR_MULTIPLAYER_TITLE_DIV.innerText = "MULTIPLAYER SETUP";
    // this.EMULATOR_MULTIPLAYER_PARENT_DIV.appendChild(this.EMULATOR_MULTIPLAYER_TITLE_DIV);

    // this.EMULATOR_MULTIPLAYER_COMM_DIV = document.createElement("div");
    // this.EMULATOR_MULTIPLAYER_COMM_DIV.classList = "emulator_multiplayer_title uk-text-center uk-text-large";
    // this.EMULATOR_MULTIPLAYER_COMM_DIV.innerText = "STOP CODE COPIED!";
    // this.EMULATOR_MULTIPLAYER_COMM_DIV.style.display = "none";
    // this.EMULATOR_MULTIPLAYER_PARENT_DIV.appendChild(this.EMULATOR_MULTIPLAYER_COMM_DIV);

    // this.EMULATOR_MULTIPLAYER_START_CODE_INPUT = document.createElement("input");
    // this.EMULATOR_MULTIPLAYER_START_CODE_INPUT.classList = "uk-input";
    // this.EMULATOR_MULTIPLAYER_START_CODE_INPUT.type = "text";
    // this.EMULATOR_MULTIPLAYER_START_CODE_INPUT.placeholder = "SETUP CODE";
    // this.EMULATOR_MULTIPLAYER_START_CODE_INPUT.style.width = "80%";
    // this.EMULATOR_MULTIPLAYER_START_CODE_INPUT.onkeydown = async (event) => {
    //   if(event.key == "Enter"){
    //     await this.MULTIPLAYER_PEER_CONNECTION.setRemoteDescription({type: "offer", sdp: atob(this.EMULATOR_MULTIPLAYER_START_CODE_INPUT.value)});
    //     await this.MULTIPLAYER_PEER_CONNECTION.setLocalDescription(await this.MULTIPLAYER_PEER_CONNECTION.createAnswer());
    //     this.MULTIPLAYER_PEER_CONNECTION.onicecandidate = ({candidate}) => {
    //       if (candidate) return;
    //       navigator.clipboard.writeText(btoa(this.MULTIPLAYER_PEER_CONNECTION.localDescription.sdp));
    //       console.log("Copied stop code to clipboard");
    //       this.EMULATOR_MULTIPLAYER_START_CODE_INPUT.style.display = "none";
    //       this.EMULATOR_MULTIPLAYER_COPY_CODE_BTN.style.display = "none";
    //       this.EMULATOR_MULTIPLAYER_COMM_DIV.innerText = "STOP CODE COPIED!";
    //       this.EMULATOR_MULTIPLAYER_COMM_DIV.style.display = "block";
    //     };
    //   }
    // }
    // this.EMULATOR_MULTIPLAYER_PARENT_DIV.appendChild(this.EMULATOR_MULTIPLAYER_START_CODE_INPUT);

    // this.EMULATOR_MULTIPLAYER_STOP_CODE_INPUT = document.createElement("input");
    // this.EMULATOR_MULTIPLAYER_STOP_CODE_INPUT.classList = "uk-input";
    // this.EMULATOR_MULTIPLAYER_STOP_CODE_INPUT.type = "text";
    // this.EMULATOR_MULTIPLAYER_STOP_CODE_INPUT.placeholder = "STOP CODE";
    // this.EMULATOR_MULTIPLAYER_STOP_CODE_INPUT.style.width = "80%";
    // this.EMULATOR_MULTIPLAYER_STOP_CODE_INPUT.style.display = "none";
    // this.EMULATOR_MULTIPLAYER_STOP_CODE_INPUT.onkeydown = async (event) => {
    //   if(event.key == "Enter"){
    //     this.MULTIPLAYER_PEER_CONNECTION.setRemoteDescription({type: "answer", sdp: atob(this.EMULATOR_MULTIPLAYER_STOP_CODE_INPUT.value)});
    //   }
    // }
    // this.EMULATOR_MULTIPLAYER_PARENT_DIV.appendChild(this.EMULATOR_MULTIPLAYER_STOP_CODE_INPUT);

    // this.EMULATOR_MULTIPLAYER_COPY_CODE_BTN = document.createElement("button");
    // this.EMULATOR_MULTIPLAYER_COPY_CODE_BTN.classList = "uk-button uk-button-primary uk-text-medium uk-text-nowrap uk-text-truncate";
    // this.EMULATOR_MULTIPLAYER_COPY_CODE_BTN.textContent = "COPY SETUP CODE";
    // this.EMULATOR_MULTIPLAYER_COPY_CODE_BTN.style.width = "40%";
    // this.EMULATOR_MULTIPLAYER_COPY_CODE_BTN.onclick = (event) => {
    //   navigator.clipboard.writeText(btoa(this.MULTIPLAYER_PEER_CONNECTION.localDescription.sdp));
    //   console.log("Copied code to clipboard");
    //   this.EMULATOR_MULTIPLAYER_START_CODE_INPUT.style.display = "none";
    //   this.EMULATOR_MULTIPLAYER_STOP_CODE_INPUT.style.display = "flex";
    //   this.EMULATOR_MULTIPLAYER_COPY_CODE_BTN.style.display = "none";
    // }
    // this.EMULATOR_MULTIPLAYER_PARENT_DIV.appendChild(this.EMULATOR_MULTIPLAYER_COPY_CODE_BTN);

    // this.EMULATOR_MULTIPLAYER_EXIT_BTN = document.createElement("button");
    // this.EMULATOR_MULTIPLAYER_EXIT_BTN.className = "emulator_multiplayer_exit_btn";
    // this.EMULATOR_MULTIPLAYER_EXIT_BTN.setAttribute("uk-icon", "icon: close");
    // this.EMULATOR_MULTIPLAYER_EXIT_BTN.onclick = async () => {
    //   this.EMULATOR_MULTIPLAYER_PARENT_DIV.style.display = "none";
    // };
    // this.EMULATOR_MULTIPLAYER_PARENT_DIV.appendChild(this.EMULATOR_MULTIPLAYER_EXIT_BTN);

    // this.EMULATOR_MULTIPLAYER_BTN = document.createElement("button");
    // this.EMULATOR_MULTIPLAYER_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
    // this.EMULATOR_MULTIPLAYER_BTN.title = "Connect two emulators in separate web browsers";
    // this.EMULATOR_MULTIPLAYER_BTN.textContent = "MultiPlayer";
    // this.EMULATOR_MULTIPLAYER_BTN.onclick = async () => {
    //   this.EMULATOR_MULTIPLAYER_START_CODE_INPUT.style.display = "block";
    //   this.EMULATOR_MULTIPLAYER_COPY_CODE_BTN.style.display = "block";
    //   this.EMULATOR_MULTIPLAYER_PARENT_DIV.style.display = "flex";

    //   this.EMULATOR_MULTIPLAYER_COMM_DIV.style.color = "white";

    //   if(this.MULTIPLAYER_PEER_CONNECTION != undefined && this.MULTIPLAYER_DATA_CHANNEL != undefined){
    //     await this.MULTIPLAYER_PEER_CONNECTION.close();
    //     await this.MULTIPLAYER_DATA_CHANNEL.close();
    //   }

    //   this.MULTIPLAYER_PEER_CONNECTION = new RTCPeerConnection(this.MULTIPLAYER_CONFIG);
    //   this.MULTIPLAYER_DATA_CHANNEL = this.MULTIPLAYER_PEER_CONNECTION.createDataChannel("chat", {negotiated: true, id: 0});

    //   this.MULTIPLAYER_DATA_CHANNEL.onopen = async () => {
    //     this.EMULATOR_MULTIPLAYER_START_CODE_INPUT.style.display = "none";
    //     this.EMULATOR_MULTIPLAYER_STOP_CODE_INPUT.style.display = "none";
    //     this.EMULATOR_MULTIPLAYER_COPY_CODE_BTN.style.display = "none";

    //     this.EMULATOR_MULTIPLAYER_START_CODE_INPUT.value = "";
    //     this.EMULATOR_MULTIPLAYER_STOP_CODE_INPUT.value = "";
  
    //     this.EMULATOR_MULTIPLAYER_COMM_DIV.style.display = "block";
    //     this.EMULATOR_MULTIPLAYER_COMM_DIV.style.color = "yellowgreen";
    //     this.EMULATOR_MULTIPLAYER_COMM_DIV.innerText = "CONNECTED!";
  
    //     await setTimeout(() => {
    //       this.EMULATOR_MULTIPLAYER_COMM_DIV.style.display = "none";
    //       this.EMULATOR_MULTIPLAYER_PARENT_DIV.style.display = "none";
    //     }, 1000);

    //     this.MULTIPLAYER_DATA_CHANNEL.onmessage = (event) => {
    //       console.log(event.data);
    //       if(parseInt(event.data) > 0){
    //         this.mcu.gpio[1].setInputValue(true);
    //       }else if(parseInt(event.data) == 0){
    //         this.mcu.gpio[1].setInputValue(false);
    //       }
    //     }

    //     this.mcu.gpio[1].addListener(() => {
    //       this.MULTIPLAYER_DATA_CHANNEL.send(this.mcu.gpio[1].value);
    //     });
    //   }

    //   await this.MULTIPLAYER_PEER_CONNECTION.setLocalDescription(await this.MULTIPLAYER_PEER_CONNECTION.createOffer());
    //   this.MULTIPLAYER_PEER_CONNECTION.onicecandidate = ({candidate}) => {
    //     if (candidate) return;
    //   };
    // };
    // this.EMULATOR_FOOTER_DIV.appendChild(this.EMULATOR_MULTIPLAYER_BTN);


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


    this.EMULATOR_DPAD_SVG = document.createElement("img");
    this.EMULATOR_DPAD_SVG.classList = "emulator_dpad_img";
    this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_NORMAL.svg";
    this.EMULATOR_DPAD_SVG.title = "Keys: WASD";
    this.EMULATOR_THUMBY.appendChild(this.EMULATOR_DPAD_SVG);

    this.EMULATOR_B_SVG = document.createElement("img");
    this.EMULATOR_B_SVG.classList = "emulator_b_img";
    this.EMULATOR_B_SVG.src = "/css/svgs/emulator/Emulator-BTN_NORMAL.svg";
    this.EMULATOR_THUMBY.appendChild(this.EMULATOR_B_SVG);

    this.EMULATOR_A_SVG = document.createElement("img");
    this.EMULATOR_A_SVG.classList = "emulator_a_img";
    this.EMULATOR_A_SVG.src = "/css/svgs/emulator/Emulator-BTN_NORMAL.svg";
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
            animatePressed: () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_U_PRESSED.svg";},
            animateDepressed: () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_NORMAL.svg";}},

      'a': {pressed: false,
            pin: 3,
            press: () => {this.mcu.gpio[this.BUTTONS['a'].pin].setInputValue(false)},
            depress: () => {this.mcu.gpio[this.BUTTONS['a'].pin].setInputValue(true)},
            animatePressed: () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_L_PRESSED.svg";},
            animateDepressed: () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_NORMAL.svg";}},

      's': {pressed: false,
            pin: 6,
            press: () => {this.mcu.gpio[this.BUTTONS['s'].pin].setInputValue(false)},
            depress: () => {this.mcu.gpio[this.BUTTONS['s'].pin].setInputValue(true)},
            animatePressed: () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_D_PRESSED.svg";},
            animateDepressed: () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_NORMAL.svg";}},

      'd': {pressed: false,
            pin: 5,
            press: () => {this.mcu.gpio[this.BUTTONS['d'].pin].setInputValue(false)},
            depress: () => {this.mcu.gpio[this.BUTTONS['d'].pin].setInputValue(true)},
            animatePressed: () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_R_PRESSED.svg";},
            animateDepressed: () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_NORMAL.svg";}},

      ',': {pressed: false,
            pin: 24,
            press: () => {this.mcu.gpio[this.BUTTONS[','].pin].setInputValue(false)},
            depress: () => {this.mcu.gpio[this.BUTTONS[','].pin].setInputValue(true)},
            animatePressed: () => {this.EMULATOR_B_SVG.src = "/css/svgs/emulator/Emulator-BTN_PRESSED.svg";},
            animateDepressed: () => {this.EMULATOR_B_SVG.src = "/css/svgs/emulator/Emulator-BTN_NORMAL.svg";}},

      '.': {pressed: false,
            pin: 27,
            press: () => {this.mcu.gpio[this.BUTTONS['.'].pin].setInputValue(false)},
            depress: () => {this.mcu.gpio[this.BUTTONS['.'].pin].setInputValue(true)},
            animatePressed: () => {this.EMULATOR_A_SVG.src = "/css/svgs/emulator/Emulator-BTN_PRESSED.svg";},
            animateDepressed: () => {this.EMULATOR_A_SVG.src = "/css/svgs/emulator/Emulator-BTN_NORMAL.svg";}},
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
        newChild.innerHTML = editorWrapper.EDITOR_PATH;
        this.EMULATOR_FS_DIV.appendChild(newChild);
      }
    }
  }


  // Emulator canvas manually sized, rotated, and scaled so recording can be done as it happens (not css transforms)
  adjustCanvas(){
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

    this.context.imageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.oImageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
  }


  async stopRecording(){
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
      this.BUTTONS['w'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_U_PRESSED.svg";};

      this.BUTTONS['a'].pin = 3;
      this.EMULATOR_DPAD_LEFT_BTN.title = "Key: A";
      this.BUTTONS['a'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_L_PRESSED.svg";};

      this.BUTTONS['s'].pin = 6;
      this.EMULATOR_DPAD_DOWN_BTN.title = "Key: S";
      this.BUTTONS['s'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_D_PRESSED.svg";};

      this.BUTTONS['d'].pin = 5;
      this.EMULATOR_DPAD_RIGHT_BTN.title = "Key: D";
      this.BUTTONS['d'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_R_PRESSED.svg";};
    }else if(this.EMULATOR_ROTATION == 90){
      // console.log("90");
      this.BUTTONS['w'].pin = 3;
      this.EMULATOR_DPAD_LEFT_BTN.title = "Key: W";
      this.BUTTONS['w'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_L_PRESSED.svg";};

      this.BUTTONS['a'].pin = 6;
      this.EMULATOR_DPAD_DOWN_BTN.title = "Key: A";
      this.BUTTONS['a'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_D_PRESSED.svg";};

      this.BUTTONS['s'].pin = 5;
      this.EMULATOR_DPAD_RIGHT_BTN.title = "Key: S";
      this.BUTTONS['s'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_R_PRESSED.svg";};

      this.BUTTONS['d'].pin = 4;
      this.EMULATOR_DPAD_UP_BTN.title = "Key: D";
      this.BUTTONS['d'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_U_PRESSED.svg";};
    }else if(this.EMULATOR_ROTATION == 180){
      // console.log("180");
      this.BUTTONS['w'].pin = 6;
      this.EMULATOR_DPAD_DOWN_BTN.title = "Key: W";
      this.BUTTONS['w'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_D_PRESSED.svg";};

      this.BUTTONS['a'].pin = 5;
      this.EMULATOR_DPAD_RIGHT_BTN.title = "Key: A";
      this.BUTTONS['a'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_R_PRESSED.svg";};

      this.BUTTONS['s'].pin = 4;
      this.EMULATOR_DPAD_UP_BTN.title = "Key: S";
      this.BUTTONS['s'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_U_PRESSED.svg";};

      this.BUTTONS['d'].pin = 3;
      this.EMULATOR_DPAD_LEFT_BTN.title = "Key: D"
      this.BUTTONS['d'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_L_PRESSED.svg";};
    }else if(this.EMULATOR_ROTATION == 270){
      // console.log("270");
      this.BUTTONS['w'].pin = 5;
      this.EMULATOR_DPAD_RIGHT_BTN.title = "Key: W";
      this.BUTTONS['w'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_R_PRESSED.svg";};

      this.BUTTONS['a'].pin = 4;
      this.EMULATOR_DPAD_UP_BTN.title = "Key: A";
      this.BUTTONS['a'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_U_PRESSED.svg";};

      this.BUTTONS['s'].pin = 3;
      this.EMULATOR_DPAD_LEFT_BTN.title = "Key: S";
      this.BUTTONS['s'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_L_PRESSED.svg";};

      this.BUTTONS['d'].pin = 6;
      this.EMULATOR_DPAD_DOWN_BTN.title = "Key: D";
      this.BUTTONS['d'].animatePressed = () => {this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_D_PRESSED.svg";};
    }
  }


  // Used to make Thumby resistent to page zoom
  adjustSize(){
    this.EMULATOR_THUMBY.style.transform = "rotate(" + this.EMULATOR_ROTATION + "deg)" + " scale(" + 1/window.devicePixelRatio + ")";
  }


  stopEmulator(){
    console.log("Emulator stopped");
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
  
    this.mcu.stop();
    this.mcu.reset();

    this.EMULATOR_CANVAS.style.display = "none";
  }



  // If two directions on DPAD are clicked, use that, otherwise use a single direction
  // Always animate A + B buttons separate from DPAD since can be pressed at same time
  animatePressedButtons(){
    if(this.BUTTONS['w'].pressed && this.BUTTONS['a'].pressed){
      this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_UL_PRESSED.svg";
    }else if(this.BUTTONS['a'].pressed && this.BUTTONS['s'].pressed){
      this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_LD_PRESSED.svg";
    }else if(this.BUTTONS['s'].pressed && this.BUTTONS['d'].pressed){
      this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_DR_PRESSED.svg";
    }else if(this.BUTTONS['d'].pressed && this.BUTTONS['w'].pressed){
      this.EMULATOR_DPAD_SVG.src = "/css/svgs/emulator/Emulator-DPAD_UR_PRESSED.svg";
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


  bufferToImageData(buffer){
    var ib = 0;
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
    
    return new ImageData(this.PIXELS, this.WIDTH, this.HEIGHT);
  }


  // Use address fed through serial from emulator to display the contents of MicroPython's Thumby framebuffer
  async drawDisplayBuffer(address){
    const buffer = new Uint8Array(this.mcu.sramView.buffer.slice(this.displayBufferAdr, this.displayBufferAdr+360));
    // if(this.RECORDING) this.RECORDED_BUFFER_FRAMES.push(buffer);

    // Maybe change this to putImage(): https://themadcreator.github.io/gifler/docs.html#animator::createBufferCanvas()
    // this.context.putImageData(this.bufferToImageData(buffer), 0, 0);
    await createImageBitmap(this.bufferToImageData(buffer)).then(async (imgBitmap) => {
      this.context.drawImage(imgBitmap, -this.WIDTH/2, -this.HEIGHT/2);
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
  async startEmulator(){
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

    // Only fetch bootrom data once
    if(this.bootromData == undefined){
      const res = await fetch(this.bootromName);
      const buffer = await res.arrayBuffer();
      this.bootromData = new Uint32Array(buffer);
    }
    this.mcu.loadBootrom(this.bootromData);
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
      // this.sendStringToNormal("print(open('"+ "/lib/thumby.py" +"', 'r').read())");
      
      // Set default button gpio pin states
      this.mcu.gpio[24].setInputValue(true);
      this.mcu.gpio[27].setInputValue(true);
      this.mcu.gpio[4].setInputValue(true);
      this.mcu.gpio[3].setInputValue(true);
      this.mcu.gpio[6].setInputValue(true);
      this.mcu.gpio[5].setInputValue(true);
      
      // Start the program the user chose to emulate
      // this.sendStringToNormal("exec(open('" + this.MAIN_FILE + "').read())");
      if(this.MAIN_FILE.indexOf(".py") != -1){
        this.sendStringToNormal("__import__('" + this.MAIN_FILE.split('.')[0] + "')");
      }else{
        this.sendStringToNormal("__import__('" + this.MAIN_FILE + "')");
      }
    };


    this.cdc.onSerialData = (value) => {
      this.collectedData += this.decoder.decode(value);
      // if(this.displayBufferAdr != undefined) this.onData(this.decoder.decode(value));
      this.onData(this.decoder.decode(value));
      var lines = this.collectedData.split("\n");
      
      while(lines.length > 1){
          var line = lines.shift();
      
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
    await loadUF2(this.uf2Name, this.mcu).then(async () => {

      // Loop through all editors and get file names + content
      this.MAIN_FILE = undefined;
      for (const [editorID, editorWrapper] of Object.entries(this.EDITORS)) {
        if(editorWrapper.NORMAL_EMU_CHECKBOX.checked || editorWrapper.MAIN_EMU_CHECKBOX.checked){

          // Make sure not to re-encode binary data retrieved from editor, also, get it the right way
          if(editorWrapper.isEditorBinary()){
            await editorWrapper.getDBFile(async (typedFileData) => {
              await window.loadFileData(typedFileData, editorWrapper.EDITOR_PATH);
            })
          }else{
            await window.loadFileData(this.FILE_ENCODER.encode(editorWrapper.getValue()), editorWrapper.EDITOR_PATH);
          }

          if(editorWrapper.MAIN_EMU_CHECKBOX.checked){
            this.MAIN_FILE = editorWrapper.EDITOR_PATH;
          }
        }
      }
      if(this.MAIN_FILE == undefined){
        console.log("No main file found...");
        alert("No editor designated as main (red checkbox), stopping");
        return;
      }

      await this.loadServerFile("ThumbyGames/lib-emulator/thumby.py", '/lib/thumby.py');
      await this.loadServerFile("ThumbyGames/lib-emulator/ssd1306.py", '/lib/ssd1306.py');
      await this.loadServerFile("ThumbyGames/lib-emulator/font5x7.bin", '/lib/font5x7.bin');
      await this.loadServerFile("ThumbyGames/lib-emulator/font8x8.bin", '/lib/font8x8.bin');
      await this.loadServerFile("ThumbyGames/lib-emulator/TClogo.bin", '/lib/TClogo.bin');
      await this.loadServerFile("ThumbyGames/lib-emulator/thumbyLogo.bin", '/lib/thumbyLogo.bin');

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
    this.EMULATOR_CANVAS.style.display = "block";
  }
}
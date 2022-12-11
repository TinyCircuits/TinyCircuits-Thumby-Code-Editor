import { EMULATOR } from "./emulator_wrapper.js";

const info = document.getElementById("infoBar");
const loading = document.getElementById("loading");
const buyme = document.getElementById("buyme");

// React stub container mocking GoldernLayout for compatibility
class Container {
  setState(state) { this.state = state; }
  setTitle(title) {}
  focus() {}
}
const conta = new Container();
conta.element = document.body;
const hidden = document.createElement("div");
hidden.style.display = 'none';
conta._layoutManager = hidden;
conta._layoutManager.on = (a, b) => {};

// Start warming up the emulator
var EDITORS = {};
const emu = await new EMULATOR(conta, {}, EDITORS);
emu.onData = (data) => {
    console.log(data);
    if (data == "_") { loading.style.display = "none" }
};

// Setup up delaying audio until after unmute
const muter = () => {
  if(emu.EMULATOR_MUTED == undefined || emu.EMULATOR_MUTED == false){
    emu.EMULATOR_MUTED = true;
    emu.EMULATOR_MUTE_BTN.innerHTML = "UNMUTE";
    if (emu.AUDIO_VOLUME != undefined) emu.AUDIO_VOLUME.gain.value = 0.0;
  }else{
    emu.AUDIO_CONTEXT = new(window.AudioContext || window.webkitAudioContext)();

    emu.AUDIO_VOLUME = emu.AUDIO_CONTEXT.createGain();
    emu.AUDIO_VOLUME.connect(emu.AUDIO_CONTEXT.destination);

    emu.AUDIO_BUZZER = emu.AUDIO_CONTEXT.createOscillator();
    emu.AUDIO_BUZZER.frequency.value = 0;
    emu.AUDIO_BUZZER.type = "triangle";
    emu.AUDIO_BUZZER.start();
    emu.AUDIO_BUZZER.connect(emu.AUDIO_VOLUME);

    emu.AUDIO_VOLUME.gain.value = 0.25;

    emu.EMULATOR_MUTED = false;
    emu.EMULATOR_MUTE_BTN.innerHTML = "MUTE";
    if (emu.AUDIO_VOLUME != undefined) emu.AUDIO_VOLUME.gain.value = 0.25;
  }
};
muter();
emu.EMULATOR_MUTE_BTN.onclick = muter;

// Hide unused elements
emu.EMULATOR_ZOOM_IN_BTN.style.display = 'none';
emu.EMULATOR_ZOOM_OUT_BTN.style.display = 'none';
emu.EMULATOR_SCALE_DISPLAY.style.display = 'none';
emu.EMULATOR_ROTATE_BTN.style.display = 'none';
emu.EMULATOR_FS_TOGGLE_BTN.style.display = 'none';
emu.EMULATOR_SCALE_DISPLAY.style.display = 'none';

// Layout
const sizer = () => {
    emu.EMULATOR_THUMBY.style.height = "75%";
    emu.EMULATOR_THUMBY.style.width = "auto";
    emu.EMULATOR_THUMBY.style.left = `${(emu.EMULATOR_BODY_DIV.clientWidth-emu.EMULATOR_THUMBY.clientWidth)/2}px`;
    emu.EMULATOR_CANVAS.style.width = "100%";
    emu.EMULATOR_CANVAS.style.height = "100%";
    const scale = emu.EMULATOR_BODY_DIV.clientHeight/emu.HEIGHT/6.8;
    emu.EMULATOR_CANVAS.width = emu.WIDTH * scale;
    emu.EMULATOR_CANVAS.height = emu.HEIGHT * scale;
    emu.context.translate(emu.WIDTH*scale/2, emu.HEIGHT*scale/2);
    emu.EMULATOR_CANVAS.style.marginTop = '15.6%';
    emu.EMULATOR_CANVAS.style.width = emu.EMULATOR_CANVAS.width + "px";
    emu.EMULATOR_CANVAS.style.height = emu.EMULATOR_CANVAS.height + "px";
    emu.context.scale(scale, scale);
    emu.context.imageSmoothingEnabled = false;
    emu.context.mozImageSmoothingEnabled = false;
    emu.context.oImageSmoothingEnabled = false;
    emu.context.webkitImageSmoothingEnabled = false;
    emu.context.msImageSmoothingEnabled = false;
};
document.addEventListener("DOMContentLoaded", sizer);
emu.adjustSize = sizer;
emu.adjustCanvas = sizer;
sizer();
emu.EMULATOR_START_BTN.onclick = () => {
    emu.startEmulator();
    sizer();
};

// Touch screen controls
window.addEventListener("touchstart", (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        switch(e.changedTouches[i].target){
            case buyme:
                buyme.triggerHandler("click");
                break;
            case emu.EMULATOR_STOP_BTN:
                emu.EMULATOR_STOP_BTN.triggerHandler("click");
                break;
            case emu.EMULATOR_START_BTN:
                emu.EMULATOR_START_BTN.triggerHandler("click");
                break;
            case emu.EMULATOR_MUTE_BTN:
                emu.EMULATOR_MUTE_BTN.triggerHandler("click");
                break;
            case emu.EMULATOR_A_BTN:
                emu.handleKeyDown({key:'.'});
                break;
            case emu.EMULATOR_B_BTN:
                emu.handleKeyDown({key:','});
                break;
            case emu.EMULATOR_DPAD_UP_BTN:
                emu.handleKeyDown({key:'w'});
                break;
            case emu.EMULATOR_DPAD_DOWN_BTN:
                emu.handleKeyDown({key:'s'});
                break;
            case emu.EMULATOR_DPAD_LEFT_BTN:
                emu.handleKeyDown({key:'a'});
                break;
            case emu.EMULATOR_DPAD_RIGHT_BTN:
                emu.handleKeyDown({key:'d'});
                break;
        }
    }
    e.preventDefault();
},{passive: false});
window.addEventListener("touchend", (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        switch(e.changedTouches[i].target){
            case emu.EMULATOR_A_BTN:
                emu.handleKeyUp({key:'.'});
                break;
            case emu.EMULATOR_B_BTN:
                emu.handleKeyUp({key:','});
                break;
            case emu.EMULATOR_DPAD_UP_BTN:
                emu.handleKeyUp({key:'w'});
                break;
            case emu.EMULATOR_DPAD_DOWN_BTN:
                emu.handleKeyUp({key:'s'});
                break;
            case emu.EMULATOR_DPAD_LEFT_BTN:
                emu.handleKeyUp({key:'a'});
                break;
            case emu.EMULATOR_DPAD_RIGHT_BTN:
                emu.handleKeyUp({key:'d'});
                break;
        }
    }
});

// Find which game to load
const game = new URLSearchParams(window.location.search).get("game");

if (game) {
    // Download the game
    conta.element = hidden;
    const openGame = async (arcadeGameFileURLS, gameName) => {
        // Loop through each URL for this open
        for(let i=0; i<arcadeGameFileURLS.length; i++){
            // Make URL and path from root
            var thumbyPathAndURL = "/Games/" + arcadeGameFileURLS[i].split('/').slice(6).join('/');

            // Get the file contents
            await fetch(arcadeGameFileURLS[i]).then(async (response) => {
                // Pass the file contents to the new editor using the state
                var state = {};
                state.value = Array.from(new Uint8Array(await response.arrayBuffer()));
                state.path = thumbyPathAndURL;

                // Ensure no collisions with normal editors or cached data
                state.id = `PlayerEditor${i}`;
                (new EditorWrapper(conta, state, EDITORS)).clearStorage();

                // When games are opened, check the boxes so emulation can happen right away
                if(thumbyPathAndURL.indexOf(gameName + ".py") != -1){
                    state.mainChecked = true;
                }else{
                    state.normalChecked = true;
                }

                const emu = new EditorWrapper(conta, state, EDITORS);
            });
        }
    }
    var ARCADE = new Arcade();
    ARCADE.hide();
    await ARCADE.fillUserAndRepoNameList();
    var files = {};
    ARCADE.GAME_URL_CONTAINERS.forEach((c) => {
        if(c.GAME_NAME != game) return;
        files = c.GAME_FILE_URLS;
    });
    await openGame(files, game);

    // Load the emulator (delay for chonky files to settle e.g: Fireplace)
    setTimeout(() => {emu.startEmulator()}, 2000);
}

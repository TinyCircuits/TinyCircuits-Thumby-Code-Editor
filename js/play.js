import { EMULATOR } from "./emulator_wrapper.js";

const info = document.getElementById("infoBar");
const loading = document.getElementById("loading");
const buyme = document.getElementById("buyme");

// Find which game to load, if any
const game = new URLSearchParams(window.location.search).get("game");

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
var EDITORS = [];
var MAIN_EDITOR = null;
var GAME_EDITOR = null;
const emu = await new EMULATOR(conta, {}, EDITORS);
const starter = () => {
    loading.style.display = "initial"
    if (MAIN_EDITOR && GAME_EDITOR) {
        GAME_EDITOR.state.mainChecked = false;
        GAME_EDITOR.MAIN_EMU_CHECKBOX.checked = false;
        MAIN_EDITOR.state.mainChecked = true;
        MAIN_EDITOR.MAIN_EMU_CHECKBOX.checked = true;
    }
    emu.startEmulator();
    // Correct the MUTE state
    emu.AUDIO_VOLUME.gain.value = emu.EMULATOR_MUTE_BTN.innerHTML == "MUTE" ? 0.25 : 0.0;
};
emu.EMULATOR_START_BTN.onclick = starter
emu.onData = async (data) => {
    console.log(data);
    // Load message closing
    if (data == "_") { loading.style.display = "none" }
    // Game was selected
    if (MAIN_EDITOR && data.startsWith("HEYTHUMBY!LOAD:")) {
        emu.stopEmulator();
        const game = data.substring(15) || localStorage.getItem("PlayerLastGame") || "TinyBlocks";
        console.log(`Playing: ${game}!`);
        localStorage.setItem("PlayerLastGame", game);
        MAIN_EDITOR.state.mainChecked = false;
        MAIN_EDITOR.MAIN_EMU_CHECKBOX.checked = false;
        await openGame(game);
        emu.startEmulator();
        emu.AUDIO_VOLUME.gain.value = emu.EMULATOR_MUTE_BTN.innerHTML == "MUTE" ? 0.25 : 0.0;
    }
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

    emu.EMULATOR_MUTED = false;
    emu.EMULATOR_MUTE_BTN.innerHTML = "MUTE";
    emu.AUDIO_VOLUME.gain.value = 0.25;
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

// Load the game or menu
const openGame = async (gameName) => {
    var arcadeGameFileURLS = {}
    ARCADE.GAME_URL_CONTAINERS.forEach((c) => {
        if(c.GAME_NAME != gameName) return;
        arcadeGameFileURLS = c.GAME_FILE_URLS;
    });
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

            const edi = new EditorWrapper(conta, state, EDITORS);
            if (state.mainChecked) {GAME_EDITOR = edi}
        });
    }
}
conta.element = hidden;
var ARCADE = new Arcade();
ARCADE.hide();
await ARCADE.fillUserAndRepoNameList();
if (game) {
    await openGame(game);
    // Load the emulator (delay for chonky files to settle e.g: Fireplace)
    setTimeout(() => {starter()}, 2000);
}
else {
    // Get the game list
    const games = [];
    ARCADE.GAME_URL_CONTAINERS.forEach((c) => {games.push(c.GAME_NAME)});
    games.sort();

    // Load the menu
    await fetch("ThumbyGames/main.py").then(async (response) => {
        (new EditorWrapper(conta, {"id": "PlayerEditorMain"}, EDITORS)).clearStorage();
        MAIN_EDITOR = new EditorWrapper(conta, {
            "id": "PlayerEditorMain",
            "path": "/menuLauncher.py",
            "value": Array.from(new Uint8Array(await response.arrayBuffer())),
            "mainChecked": true
        }, EDITORS);
    });
    await fetch("ThumbyGames/menu.py").then(async (response) => {
        (new EditorWrapper(conta, {"id": "PlayerEditorMenu"}, EDITORS)).clearStorage();
        var data = new TextDecoder("utf-8").decode(new Uint8Array(await response.arrayBuffer()));
        // Patch the menu to work in the emulator
        data = data.replace(
            'files = listdir("/Games")',
            `files = """${games.join("\n")}""".split("\\n")`)
        data = data.replace(
            'stat("/Games/"+files[k])[0] != 16384',
            'False');
        data = data.replace(
            'mem32[0x4005800C]=1',
            'print(f"HEYTHUMBY!LOAD:{files[selpos] if selpos >=0 else ""}")')
        new EditorWrapper(conta, {
            "id": "PlayerEditorMenu",
            "path": "/menu.py",
            "value": Array.from(new TextEncoder("utf-8").encode(data)),
            "normalChecked": true
        }, EDITORS);
    });
    await fetch("ThumbyGames/lib/credits.txt").then(async (response) => {
        (new EditorWrapper(conta, {"id": "PlayerEditorCredits"}, EDITORS)).clearStorage();
        new EditorWrapper(conta, {
            "id": "PlayerEditorCredits",
            "path": "/lib/credits.txt",
            "value": Array.from(new Uint8Array(await response.arrayBuffer())),
            "normalChecked": true
        }, EDITORS);
    });
    starter();
}

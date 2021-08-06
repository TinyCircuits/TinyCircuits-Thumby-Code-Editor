// ##### MAIN.js #####
// Main source of webpage where objects/functions called from HTML
// elements live.


// Setup code editor
var EDITOR = new EditorWrapper();

// Setup xterm terminal. Hooks onto element named 'terminal'
// in constuctor
var ATERM = new ActiveTerminal();

// Setup RP2040 command class so html can call its 
// member functions. Also fires events indicating
// when serial data can be read/displayed to terminal
var RP2040 = new RP2040REPL();

// Setup filesystem explorer
var FS = null;

// Setup bitmap creator utility with 8 x 8 pixel sprite sheet/grid
var BITMAPPER = new BITMAP_BUILDER(8, 8);



async function initPage(port){
    var isConnected = await RP2040.connectSerial(port);
        
    if(isConnected){
        document.getElementById("uploadexecutebtn").disabled = false;
        document.getElementById("uploadbtn").disabled = false;
        document.getElementById("executebtn").disabled = false;

        // Tell the user some information
        ATERM.writeln('\x1b[1;32m' + "Done connecting! Starting on-board Python shell...");
        ATERM.writeln("SERIAL DEVICE INFO:");
        ATERM.writeln("\tPRODUCT_ID=" + RP2040.getProductID().toString() + " VECNDOR_ID=" + RP2040.getVendorID().toString() + '\x1b[1;37m');
        
        // Go through process of setting up on-board python shell.
        // Start the output watcher that tells terminal when to output
        // serial data and when user can type commands
        if(await RP2040.startPythonShell()){
            ATERM.setStatePython();
            ATERM.prompt();

            FS = new FILESYSTEM();      // Create the filesystem
            RP2040.getOnBoardFSTree();  // Tell RP2040 module to get and store serial related to on-board filesystem structure
        }
    }else{
        ATERM.writeln('\x1b[1;31m' + "Something went wrong while connecting, is the device still plugged in?" + '\x1b[1;37m');
    }    
}


async function connect(){
    initPage(port);
    document.getElementById("uploadexecutebtn").disabled = false;
    document.getElementById("uploadbtn").disabled = false;
    document.getElementById("executebtn").disabled = false;
    FS.setFileEnableState(true);    // Enabled files/folders
    console.log("CONNECT");
}


async function disconnect(){
    RP2040.disconnectSerial();
    document.getElementById("uploadexecutebtn").disabled = true;
    document.getElementById("uploadbtn").disabled = true;
    document.getElementById("executebtn").disabled = true;
    FS.setFileEnableState(false);   // Disable files/folders
    console.log("DISCONNECT");
}


navigator.serial.addEventListener('connect', (e) => {
    navigator.serial.getPorts().then((ports) => {
        ports.forEach(port => {
            var info = port.getInfo();
            if(info.usbProductId == 5 && info.usbVendorId == 11914){
                connect();
            }
        });
    });
});
  
navigator.serial.addEventListener('disconnect', (e) => {
    disconnect();
});

navigator.serial.getPorts().then((ports) => {
    ports.forEach(port => {
        var info = port.getInfo();
        if(info.usbProductId == 5 && info.usbVendorId == 11914){
            initPage(port);
        }
    });
});



// Page is now setup, check for serial and tell user through terminal about state
ATERM.writeln("##### Welcome to The TinyCircuits Thumby Web Tool! #####");

if ("serial" in navigator) {
    ATERM.writeln('\x1b[1;32m' + "Serial supported in your browser!" + '\x1b[1;37m');
} else {
    ATERM.writeln('\x1b[1;32m' + "Serial NOT supported in your browser!" + '\x1b[1;37m');
    while(true){}
}

ATERM.writeln("Waiting for port to be selected...");


// Handle outputting to terminal when there are lines ready
// from the RP2040 module
function RP2040ModuleOutput(event){
    while(RP2040.OUTPUT_LINES[0] != null){
        ATERM.writeln(RP2040.OUTPUT_LINES.shift());
    }
}
window.addEventListener('outputlineready', RP2040ModuleOutput, false);


// Handle executing commands when event is fired from terminal wrapper module on return press
function executeTerminalCommands(event){
    ATERM.setStateOutput();
    var commandList = ATERM.getReadyCommands();
    commandList.forEach(cmd => {
        if(cmd == '\u0003' && RP2040.isCommandRunning() == false){
            ATERM.setStatePython();
        }else{
            RP2040.executeCustomCommand(cmd, true);
        }
    });
}
window.addEventListener('commandready', executeTerminalCommands, false);


// When RP2040 module finds \u0004\u0004> string then
// program/command finished and user can enter commands
// or run more programs
function commandDone(event){
    ATERM.setStatePython();
    if(event.detail == "normal"){
        ATERM.prompt();         // With newline before
    }else if(event.detail == "special"){
        ATERM.promptSpecial();  // Without newline before
    }

    document.getElementById("choosethumbybtn").disabled = false;
    document.getElementById("uploadexecutebtn").disabled = false;
    document.getElementById("uploadbtn").disabled = false;
    document.getElementById("executebtn").disabled = false;
    FS.setFileEnableState(true);    // Enabled files/folders
}
window.addEventListener('cmddone', commandDone, false);


// Fired from RP2040 module when get chunks from RP2040 (not fool proof?)
function commandStarted(event){
    document.getElementById("choosethumbybtn").disabled = true;
    document.getElementById("uploadexecutebtn").disabled = true;
    document.getElementById("uploadbtn").disabled = true;
    document.getElementById("executebtn").disabled = true;
    FS.setFileEnableState(false);   // Disable files/folders
}
window.addEventListener('cmdstarted', commandStarted, false);


// After calling getOnBoardFSTree() in RP2040 module, json string will
// be ready to be used after all serial received, handle that here
function fsTreeUpdated(event){
    // At this point, FS object was inited when serial device was picked out
    FS.updateTree(RP2040.CURRENT_FS_TREE);
}
window.addEventListener('fstreeready', fsTreeUpdated, false);


// Called when a node in the filesystem wrapper is clicked.
// Detail holds path to file that should be opened in webpage.
// Tries to get contents of file and then open a new tab with it
async function openOnBoardFile(event){
    var fileContents = await RP2040.openCustomFile(event.detail.location);
    if(fileContents != undefined){
        EDITOR.addTab(fileContents, event.detail.fileName);
    }else{
        console.log("Error while opening file, stopped");
    }
}
window.addEventListener('openonboardfile', openOnBoardFile, false);


// All buttons call below function so terminal can be written to from this scope and not RP2040 scope
async function buttonClickHandler(button){
    if(button.textContent == "Choose Thumby"){
        // Connects to serial port, checks if connected (TODO: check if user picked correct port),
        // starts process to execute command to put RP2040 into command/REPL mode. Internal checks
        // done to ensure command(s) successful
        initPage();
    }else if(button.textContent == "Download Firmware"){
        // Download firmware to user's Download folder or browser will propmt them for location
        // this is same location Thonny gets the firmware: https://github.com/thonny/thonny/blob/78fa1a3faf9045598eb4a1b40f96ff1b255e5ebf/data/rpi-pico-firmware.json#L10
        var link = document.createElement("a");
        link.href = "https://micropython.org/resources/firmware/rp2-pico-20210418-v1.15.uf2";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        delete link;
    }else if(button.textContent == "Arcade"){
        document.getElementById("overlay").style.display = "grid";
    }else if(button.textContent == "-"){
        document.getElementById("overlay").style.display = "none";
    }
}


// Buttons in tabs are handled seperately from all other buttons here
async function tabButtonClickHandler(button){
    if(button.id == "A"){
        // Pass new file default code, undefiend name so name auto gened, undefined since no file handler
        // and true for allow fast delete so tab can be closed in one click (unless edits are made)
        EDITOR.addTab("# Hi", undefined, undefined, true);
    }else if(button.id[0] == "C"){
        EDITOR.removeTab(button.parentElement.id);
    }else if(button.id[0] == "M"){
        EDITOR.switchToTabSession(button.parentElement.id); // Dont send the button id, send the tab/parent of the button id
    }
}


// Handles the editor tab file handling hamburger symbol drop down menu (showing and not showing)
async function hamburgerDropdownVisibility(on_off){
    if(on_off == "0"){    // Mouse on menu drop down
        document.getElementById("tabhamburgerhoverareadropdown").style.display = "flex";
    }else{              // Mouse off menu drop down
        document.getElementById("tabhamburgerhoverareadropdown").style.display = "none";
    }
}


// Handle the buttons in the editor drop down when pressed by the user
async function handleHamburgerFileButtons(button, buttonIndex){
    if(buttonIndex == "0"){         // Open File
        EDITOR.openFile();
    }else if(buttonIndex == "1"){   // Save File
        EDITOR.saveFile();
    }else if(buttonIndex == "2"){   // Save File As
        EDITOR.saveFileAs();
    }
}


// When a button is clicked, filesystem wrapper js module functions are
// called to modify fiels on the RP2040 filesystem
async function handleFileMenuButtons(button, buttonIndex){
    if(buttonIndex == "0"){         // Rename File
        RP2040.renameFile(FS.getSelectedNodePath(), prompt("Choose a new name for the on-board file", ".py"));
    }
    // else if(buttonIndex == "1"){   // Copy File
    //     FS.startCopy();
    // }else if(buttonIndex == "2"){   // Cut File
        
    // }else if(buttonIndex == "3"){   // Paste File
    //     FS.endCopy();
    // }
    else if(buttonIndex == "4"){   // New Folder
        RP2040.addNewFolder(FS.getSelectedDir() + prompt("Type a name for the new folder", "NewFolder"));
    }else if(buttonIndex == "5"){   // Open File
        var fileContents = await RP2040.openCustomFile(FS.getSelectedNodePath());
        if(fileContents != undefined){
            EDITOR.addTab(fileContents, FS.getSelectedNodeName());
        }else{
            console.log("Error while opening file, stopped");
        }
    }else if(buttonIndex == "6"){   // Delete File
        RP2040.deleteFileOrDir(FS.getSelectedNodePath(), FS.getSelectedNodeFileOrDir());
    }

    // Need to unselect (setSelected(false)) all nodes, otherwise
    // right-clicks will not grab the new right-clicked node (index 0)
    FS.unselectAllNodes();
    FS.closeMenu();
}


// Visibility starts in filesystem wrapper module and is handled here
// Made visible in file wrapper module on right click, and made not
// visible here or when a button on menu is pressed (above)
async function fileMenuVisibility(on_off){
    if(on_off == "0"){    // Mouse on menu down
        document.getElementById("fsrcmenuparent").style.display = "flex";
    }else{
        document.getElementById("fsrcmenuparent").style.display = "none";
    }
}


// Handle button presses from bitmap builder
function handleBitmapBuilderClicks(buttonID){
    switch(buttonID){
        case 0:     // Apply Size
            BITMAPPER.setGridSize(document.getElementById("bitmapperheight").value, document.getElementById("bitmapperwidth").value);
            BITMAPPER.renderGrid();
        break;
        case 1:     // Z+
            BITMAPPER.zoomIn();
        break;
        case 2:     // Z-
            BITMAPPER.zoomOut();
        break;
        case 3:     // Invert
            BITMAPPER.invertGrid();
            BITMAPPER.renderGrid();
        break;
        case 4:     // Clear
            BITMAPPER.clearGrid();
            BITMAPPER.renderGrid();
        break;
        case 5:     // Import (from editor selected lines)
            BITMAPPER.importBitmap(EDITOR.getSelectedText());
            BITMAPPER.renderGrid();
        break;
        case 6:     // Export (to editor)
            EDITOR.insert(BITMAPPER.exportBitmap(EDITOR.getSelectedText()));
        break;
    }
    
}


// When buttons like Upload & execute, Upload, etc are pressed, actions are handled here
function handleEditorToolbarButtons(buttonID){
    switch(buttonID){
        case 0:     // Upload & Execute
            // Takes what's current in the editor and uploads contents to main.py on RP2040
            RP2040.uploadExecuteCustomFile(EDITOR.getActiveTabName(), EDITOR.getValue());
        break;
        case 1:     // Upload, trigger cmddone event
            RP2040.uploadCustomFile(EDITOR.getActiveTabName(), EDITOR.getValue(), true);
        break;
        case 2:     // Execute
            RP2040.executeCustomFile(EDITOR.getActiveTabName());
        break;
        case 3:     // Z+
            EDITOR.increaseFontSize();
        break;
        case 4:     // Z-
            EDITOR.decreaseFontSize();
        break;
    }
}


// Used to turn ASCII unto hex string that is typical for Python
// https://stackoverflow.com/questions/33920230/how-to-convert-string-from-ascii-to-hexadecimal-in-javascript-or-jquery/33920309#33920309
// can use delim = '\\x' for Python like hex/byte string (fails for unicode characters)
String.prototype.convertToHex = function (delim) {
    return this.split("").map(function(c) {
        return ("0" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(delim || "");
};
import { ComponentContainer, ComponentItemConfig, GoldenLayout, ItemType, LayoutManager, LayoutConfig } from "../golden-layout/bundle/esm/golden-layout.js";
import { EMULATOR } from "./emulator_wrapper.js";

console.log("Beta 2");

// https://github.com/golden-layout/golden-layout#building-single-file-bundles (commands to build bundle from source need to be done on Windows)
// https://codepen.io/pbklink/pen/dyWJNNm
// https://replit.com/@koenigmm/GoldenLayout-dynamic-component-creation-example

const layoutSaveKey = "layout";

var myLayout = new GoldenLayout(document.getElementById("IDLayoutContainer"));

var DIR = new DIRCHOOSER();
var EMU = new EMULATOR();


var progressBarElem = document.getElementById("IDProgressBar");
var lastMessage = undefined;
window.setPercent = (percent, message) => {
    progressBarElem.style.width = percent + "%";

    if(message != undefined){
        progressBarElem.innerText = message + " " + percent + "%";
        lastMessage = message;
    }else{
        progressBarElem.innerText = lastMessage + " " + Math.round(percent) + "%";
    }
}
window.resetPercentDelay = () =>{
    setTimeout(() => {
        progressBarElem.style.width = "0%";
        progressBarElem.innerText = "";
    }, 100);
}

var defaultConfig = {
    header:{
        popout: false,
        showCloseIcon: false
    },
    dimensions: {
        borderWidth: 5,
        minItemHeight: 10,
        minItemWidth: 10,
        headerHeight: 20,
        dragProxyWidth: 300,
        dragProxyHeight: 200
    },
    labels: {
        close: 'close',
        maximise: 'maximise',
        minimise: 'minimise',
        popout: 'open in new window'
    },


    content: [{
        type: 'column',
        id: 'rootcolumn',
        content: [{
            type: 'row',
            isClosable: false,
            id: 'rootrow',
            content:[{
                type: 'column',
                width: 20,
                id: 'BitmapPlusFS',
                content:[{
                    type: 'component',
                    componentName: 'Bitmap Builder',
                    componentState: { label: 'Bitmap Builder' },
                    // isClosable: false,
                    close: false,
                    title: 'Bitmap Builder',
                    id: "aBitmapBuilder"
                },{
                    type: 'component',
                    componentName: 'Filesystem',
                    componentState: { label: 'Filesystem' },
                    // isClosable: false,
                    title: 'Filesystem',
                    id: "aFilesystem"
                }]
            },{
                type: 'column',
                id: "Editor",
                content:[{
                    type: 'component',
                    componentName: 'Editor',
                    componentState: { label: 'Editor', editor: undefined},
                    // isClosable: true,
                    title: 'Editor',
                    id: "aEditor"
                }]
            },{
                type: 'column',
                content:[{
                    type: 'component',
                    componentName: 'Shell',
                    componentState: { label: 'Shell' },
                    // isClosable: false,
                    title: 'Shell',
                    id: "aShell"
                }]
            }]
        }]
    }]
};


function invertPageTheme(){
    // https://stackoverflow.com/questions/2024486/is-there-an-easy-way-to-reload-css-without-reloading-the-page/43161591#43161591
    var links = document.getElementsByTagName("link");
    for (var cl in links){
        var link = links[cl];
        if (link.rel === "stylesheet"){
            var href = link.href.substring(link.href.lastIndexOf("/") + 1);

            if(href == "main-dark.css"){
                link.href = "css/light/main-light.css";
                document.getElementById("logo").src = "css/thumby_logo-dark.png";
                for (const [id, editor] of Object.entries(EDITORS)) {
                    editor.setThemeLight();
                }
                localStorage.setItem("lastTheme", "light");
                window.theme = "light";
            }else if(href == "main-light.css"){
                link.href = "css/dark/main-dark.css";
                document.getElementById("logo").src = "css/thumby_logo-light.png";
                for (const [id, editor] of Object.entries(EDITORS)) {
                    editor.setThemeDark();
                }
                localStorage.setItem("lastTheme", "dark");
                window.theme = "dark";
            }

            if(href == "editor-dark.css"){
                link.href = "css/light/editor-light.css";
            }else if(href == "editor-light.css"){
                link.href = "css/dark/editor-dark.css";
            }

            if(href == "uikit-dark.css"){
                link.href = "uikit-3.7.3/css/uikit-light.css";
            }else if(href == "uikit-light.css"){
                link.href = "uikit-3.7.3/css/uikit-dark.css";
            }

            if(href == "shell-dark.css"){
                link.href = "css/light/shell-light.css";
                ATERM.setLightTheme();
            }else if(href == "shell-light.css"){
                link.href = "css/dark/shell-dark.css";
                ATERM.setDarkTheme();
            }

            if(href == "fs-dark.css"){
                link.href = "css/light/fs-light.css";
            }else if(href == "fs-light.css"){
                link.href = "css/dark/fs-dark.css";
            }

            if(href == "bitmap_builder-dark.css"){
                link.href = "css/light/bitmap_builder-light.css";
            }else if(href == "bitmap_builder-light.css"){
                link.href = "css/dark/bitmap_builder-dark.css";
            }

            if(href == "dir_chooser-dark.css"){
                link.href = "css/light/dir_chooser-light.css";
                ATERM.setLightTheme();
            }else if(href == "dir_chooser-light.css"){
                link.href = "css/dark/dir_chooser-dark.css";
                ATERM.setDarkTheme();
            }

            if(href == "goldenlayout-dark-theme.css"){
                link.href = "golden-layout/css/themes/goldenlayout-light-theme.css";
            }else if(href == "goldenlayout-light-theme.css"){
                link.href = "golden-layout/css/themes/goldenlayout-dark-theme.css";
            }
        }
    }
}


document.getElementById("IDInvertThemeBTN").onclick = (event) => {
    invertPageTheme();
}


document.getElementById("IDNewGameBTN").onclick = async (event) => {
    var fileName = prompt("Enter a name for the new project's main Python file:", "NewProject.py");
    if(fileName != null && fileName != "" && fileName != undefined){
        var filePath = undefined;

        // Want to use file name as project name, see if it has an extension .py
        var extensionIndex = fileName.indexOf(".py");
        if(extensionIndex != -1){
            filePath = "Games/" + fileName.substring(0, extensionIndex) + "/" + fileName;
        }else{
            filePath = "Games/" + fileName + "/" + fileName;
        }

        // Make sure no editors with this file path already exist
        for (const [id, editor] of Object.entries(EDITORS)) {
            if(editor.EDITOR_PATH == filePath){
                editor._container.parent.focus();
                alert("This file is already open in Editor" + id + "! Please close it first");
                return;
            }
        }

        // Find editor with smallest ID, focus it, then add new editor with file contents
        var currentId = Infinity;
        for (const [id, editor] of Object.entries(EDITORS)) {
            if(id < currentId){
                currentId = id;
            }
        }
        if(currentId != Infinity){
            EDITORS[currentId]._container.parent.focus();
        }

        // Pass the file contents to the new editor using the state
        var state = {};
        state.value = "";
        state.path = filePath;
        myLayout.addComponent('Editor', state, 'Editor');
        await REPL.uploadFile(filePath, "", true);
        await REPL.getOnBoardFSTree();
        window.setPercent(100);
        window.resetPercentDelay();
    }
}


document.getElementById("IDDisconnectThumbyBTN").onclick = (event) =>{
    REPL.disconnect();
}


// Reset page by clearing storage and refreshing
document.getElementById("IDHardResetBTN").onclick = (event) =>{
    console.log("PAGE: Hard reset page");
    localStorage.clear();
    location.reload();
}

// Add editor panel to layout
document.getElementById("IDAddEditorBTN").onclick = (event) =>{
    console.log("PAGE: +Editor");
    myLayout.addComponent('Editor', undefined, 'Editor');
}

// Add bitmap builder panel to layout
document.getElementById("IDAddBitmapBuilder").onclick = (event) =>{
    if(recursiveFindTitle(myLayout.saveLayout().root.content, "Bitmap Builder: 8 x 8") == false){
        console.log("PAGE: +BitmapBuilder");
        myLayout.addComponent('Bitmap Builder', undefined, 'Bitmap Builder');
    }else{
        alert("Only one bitmap builder can be open");
    }
}

// Add FS panel to layout
document.getElementById("IDAddFS").onclick = (event) =>{
    if(recursiveFindTitle(myLayout.saveLayout().root.content, "Filesystem") == false){
        console.log("PAGE: +Filesystem");
        myLayout.addComponent('Filesystem', undefined, 'Filesystem');
        // REPL.tryAutoConnect();
    }else{
        alert("Only one filesystem can be open");
    }
}

// Add shell panel to layout
document.getElementById("IDAddShell").onclick = (event) =>{
    if(recursiveFindTitle(myLayout.saveLayout().root.content, "Shell") == false){
        console.log("PAGE: +Shell");
        myLayout.addComponent('Shell', undefined, 'Shell');
        // REPL.tryAutoConnect();
    }else{
        alert("Only one shell can be open");
    }
}


// Return true if a panel with this title exists, false otherwise
function recursiveFindTitle(content, title){
    for(var i=0; i < content.length; i++){
        if(content[i].title != undefined && content[i].title == title){
            return true;
        }
        if(content[i].content != undefined){
            if(recursiveFindTitle(content[i].content, title) == true){
                return true;
            }
        }
    }
    return false;
}


// Fill 'editors' with editor panel from every panel with 'editor' in name
function recursiveFindEditors(content, editors){
    for(var i=0; i < content.length; i++){
        if(content[i].title != undefined && content[i].title.indexOf("Editor") != -1){
            editors.push(content[i]);
        }
        if(content[i].content != undefined){
            recursiveFindEditors(content[i].content, editors);
        }
    }
}


// Does a soft reset that repositions all page elements
document.getElementById("IDResetLayoutBTN").onclick = (event) =>{
    console.log("PAGE: reset layout");

    // See if saved layout that may contain open editors exists
    var savedLayout = localStorage.getItem(layoutSaveKey);

    if(savedLayout != null){
        console.log("Restored layout from modified previous state")

        // Convert saved layout to typically config and then get all editor configs
        var savedConfig = LayoutConfig.fromResolved(JSON.parse(savedLayout));
        var rootContent = savedConfig.root.content;
        var allEditors = [];
        recursiveFindEditors(rootContent, allEditors);

        // As long as there are editors open use them in the default config, else use default
        if(allEditors.length > 0){

            // Stop the terminal from resizing and throw an error and add stack for editor tabs
            ATERM.stopAutoResizing();
            var modifiedDefaultConfig = defaultConfig;
            modifiedDefaultConfig.content[0].content[0].content[1].content = [];
            modifiedDefaultConfig.content[0].content[0].content[1].content.push({type: 'stack', id: 'aEditor', content: []});

            // Organize all editors from lowest ID to largest ID and place in stack
            var lastSmallestID = -1;
            var lastSmallestIDedEditor = undefined;
            for(var i=0; i<allEditors.length; i++){
                var currentSmallestId = Infinity;
                for(var j=0; j<allEditors.length; j++){
                    if((allEditors[j].componentState.id > lastSmallestID && allEditors[j].componentState.id < currentSmallestId)){
                        currentSmallestId = allEditors[j].componentState.id;
                        lastSmallestIDedEditor = allEditors[j];
                    }
                }
                lastSmallestID = currentSmallestId;
                modifiedDefaultConfig.content[0].content[0].content[1].content[0].content.push(lastSmallestIDedEditor);
            }

            // Load the new config which will rerun all constructors, and allow the terminal to auto resize again
            myLayout.loadLayout(modifiedDefaultConfig);
            localStorage.setItem(layoutSaveKey, JSON.stringify( myLayout.saveLayout() ));
            ATERM.startAutoResizing();
        }else{
            // No open editors, use default layout
            console.log("Restored layout to default state");
            myLayout.loadLayout(defaultConfig);
        }
    }else{
        // No saved layout, use default layout
        console.log("Restored layout to default state");
        myLayout.loadLayout(defaultConfig);
    }
    location.reload();
}


// Setup REPL module
var REPL = new ReplJS();
window.REPL = REPL;


// Filesystem module
var FS = undefined;
function registerFilesystem(_container, state){
    FS = new FILESYSTEM(_container, state);

    DIR.onRename = (path) => REPL.renameFile(path, prompt("Type a new name:", path.substring(path.lastIndexOf("/")+1)));
    DIR.onNewFolder = async (fileOrDir, path) => {
        var newFolderName = prompt("Enter the new folder name:", "NewFolder");
        if(newFolderName != null){
            if(fileOrDir == 1){ // Dir
                await REPL.buildPath(path + "/" + newFolderName);
            }else{              // File
                await REPL.buildPath(path.substring(0, path.lastIndexOf("/")) + "/" + newFolderName);
            }
            await REPL.getOnBoardFSTree();
        }
    }

    FS.onDelete = (path) => REPL.deleteFileOrDir(path);
    FS.onRename = (path) => REPL.renameFile(path, prompt("Type a new name:", path.substring(path.lastIndexOf("/")+1)));
    FS.onFormat = () => REPL.format();
    FS.onOpen = async (filePath) => {
        // Make sure no editors with this file path already exist
        for (const [id, editor] of Object.entries(EDITORS)) {
            if(editor.EDITOR_PATH == filePath){
                editor._container.parent.focus();
                alert("This file is already open in Editor" + id + "! Please close it first");
                return;
            }
        }

        var fileContents = await REPL.getFileContents(filePath);
        if(fileContents == undefined){
            return; // RP2040 was busy
        }

        // Find editor with smallest ID, focus it, then add new editor with file contents
        var currentId = Infinity;
        for (const [id, editor] of Object.entries(EDITORS)) {
            if(id < currentId && id != this.ID){
                currentId = id;
            }
        }
        if(currentId != Infinity){
            EDITORS[currentId]._container.parent.focus();
        }

        // Pass the file contents to the new editor using the state
        var state = {};
        state.value = fileContents;
        state.path = filePath;
        myLayout.addComponent('Editor', state, 'Editor');
    }
    FS.onNewFolder = async (fileOrDir, path) => {
        var newFolderName = prompt("Enter the new folder name:", "NewFolder");
        if(newFolderName != null){
            if(fileOrDir == 1){ // Dir
                await REPL.buildPath(path + "/" + newFolderName);
            }else{              // File
                await REPL.buildPath(path.substring(0, path.lastIndexOf("/")) + "/" + newFolderName);
            }
            await REPL.getOnBoardFSTree();
        }
    }
}


// Terminal module
var ATERM = undefined;
function registerShell(_container, state){
    ATERM = new ActiveTerminal(_container, state);
    ATERM.onType = (data) => {
        console.log(data);
        // When the RP2040 is busy with any utility operations where BUSY is set, only allow interrupt key through
        // Allow certain characters through so thumby can pick them up
        if(REPL.BUSY == true && data != '' && data != 'w' && data != 'a' && data != 's' && data != 'd' && data != ',' && data != '.'){
           return;
        } 
        
        REPL.writeToDevice(data);
    }

    REPL.onData = (data) => ATERM.write(data);
    REPL.onDisconnect = () => {
        ATERM.writeln('\n\r\x1b[1;31m' + "Disconnected" + '\x1b[1;0m');
        ATERM.writeln("Waiting for connection... (click 'Connect Thumby')");
        FS.clearToWaiting();
    }
    REPL.onConnect = () => {
        ATERM.writeln('\x1b[1;32m' + "\n\rConnected" + '\x1b[1;0m');
    }
    REPL.onFSData = (jsonStrData) => {
        FS.updateTree(jsonStrData);
        DIR.updateTree(jsonStrData);
    };
}


// Editor module
var EDITORS = {};
var LAST_ACTIVE_EDITOR = undefined; // Each editor will set this to themselves on focus, bitmap builder uses this
function registerEditor(_container, state){
    var editor = new EditorWrapper(_container, state, EDITORS);
    editor.onFocus = () => {LAST_ACTIVE_EDITOR = editor};
    editor.onSaveToThumby = async () => {
        if(editor.EDITOR_PATH == undefined || editor.EDITOR_PATH == ""){
            console.log('Pick a folder');
            var path = await DIR.getPathFromUser(editor._container.element);
            if(path != undefined){
                // Make sure no editors with this file path already exist
                for (const [id, editor] of Object.entries(EDITORS)) {
                    if(editor.EDITOR_PATH == path){
                        editor._container.parent.focus();
                        alert("This file is already open in Editor" + id + "! Please close it first");
                        return;
                    }
                }

                editor.setPath(path);
                editor.setSaved();
                editor.updateTitleSaved();
                editor.onSaveToThumby();
            }
        }else{
            console.log('Saved');
            editor.SAVED_TO_THUMBY = true;
            editor.updateTitleSaved();
            var busy = await REPL.uploadFile(editor.EDITOR_PATH, editor.getValue(), true);
            if(busy != true){
                await REPL.getOnBoardFSTree();
                window.setPercent(100);
                window.resetPercentDelay();
            }
        }
    }
    editor.onSaveAsToThumby = async () => {
        console.log('Pick a folder');
        var path = await DIR.getPathFromUser(editor._container.element);
        if(path != undefined){
            editor.setPath(path);
            editor.setSaved();
            editor.updateTitleSaved();
            editor.onSaveToThumby();
        }
    }
    editor.onFastExecute = async (lines) =>{
        REPL.executeLines(lines);
    }
    editor.onEmulate = async (lines) =>{
        await EMU.startEmulator(lines);
    }
    EDITORS[editor.ID] = editor;
}


// Setup Bitmap builder module
var BITMAPPER = undefined;
function registerBitmapBuilder(_container, state){
    BITMAPPER = new BITMAP_BUILDER(_container, state);
    BITMAPPER.onExport = (lines) => {
        if(LAST_ACTIVE_EDITOR != undefined){
            LAST_ACTIVE_EDITOR.insert(lines)
        }
    }
    BITMAPPER.onImport = () => {
        if(LAST_ACTIVE_EDITOR != undefined){
            return LAST_ACTIVE_EDITOR.getSelectedText();
        }
    }
}


// Register Golden layout panels
myLayout.registerComponentConstructor("Bitmap Builder", registerBitmapBuilder);
myLayout.registerComponentConstructor("Filesystem", registerFilesystem);
myLayout.registerComponentConstructor("Editor", registerEditor);
myLayout.registerComponentConstructor("Shell", registerShell);


// Restore from previous layout if it exists, otherwise default
var savedLayout = localStorage.getItem(layoutSaveKey);
if(savedLayout != null){
    console.log("Restored layout from previous state")
    myLayout.loadLayout(LayoutConfig.fromResolved(JSON.parse( savedLayout )));
}else{
    console.log("Restored layout to default state");
    myLayout.loadLayout(defaultConfig);
}

// Invert theme if last theme was light since dark is default
var lastTheme = localStorage.getItem("lastTheme");
if(lastTheme != undefined && lastTheme != null && lastTheme == "light"){
    invertPageTheme();
}


// Resize layout on browser window resize
window.addEventListener('resize', () => {
    console.log("Window and layout resized");
    myLayout.updateSize(window.width, window.height);
    localStorage.setItem(layoutSaveKey, JSON.stringify( myLayout.saveLayout() )); // Save layout to browser every time size/layout changes
});


// Save layout when a component is moved to a new position or one is closed
myLayout.on('stateChanged', function(stack){
    localStorage.setItem(layoutSaveKey, JSON.stringify( myLayout.saveLayout() )); // Save layout to browser every time size/layout changes
});


// Run through all editors and focus them since overflow text wrap will happen and make everything ugly.
// Editors should be the only panels with long enough names to cause this problem
for (const [id, editor] of Object.entries(EDITORS)) {
    editor._container.focus();
}


// Used to turn ASCII unto hex string that is typical for Python
// https://stackoverflow.com/questions/33920230/how-to-convert-string-from-ascii-to-hexadecimal-in-javascript-or-jquery/33920309#33920309
// can use delim = '\\x' for Python like hex/byte string (fails for unicode characters)
String.prototype.convertToHex = function (delim) {
    return this.split("").map(function(c) {
        return ("0" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(delim || "");
};


async function downloadFile(filePath) {
    let response = await fetch(filePath);
        
    if(response.status != 200) {
        throw new Error("Server Error");
    }
        
    // read response stream as text
    let text_data = await response.text();

    return text_data;
}

window.downloadFile = downloadFile;
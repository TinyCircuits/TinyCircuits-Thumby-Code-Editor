// import { DockManager } from "../src/lib/js/DockManager.js";
// import { PanelContainer } from "../src/lib/js/PanelContainer.js";
import { PanelType } from "../src/lib/js/enums/PanelType.js";


// Used to turn ASCII unto hex string that is typical for Python
// https://stackoverflow.com/questions/33920230/how-to-convert-string-from-ascii-to-hexadecimal-in-javascript-or-jquery/33920309#33920309
// can use delim = '\\x' for Python like hex/byte string (fails for unicode characters)
String.prototype.convertToHex = function (delim) {
    return this.split("").map(function(c) {
        return ("0" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(delim || "");
};


const REPL = new ReplJS();
function connectREPL(){
    REPL.connect();
}
window.connectREPL = connectREPL;


// Dictionary of live ACE editors, edits removed and added in main.js withdiv IDs as keys
var Editors = {};

// Setup Thumby filesystem explorer
var FS = null;

// Setup bitmap creator utility with 8 x 8 pixel sprite sheet/grid
var LAST_ACTIVE_PANELS = [];
var BITMAPPER = new BITMAP_BUILDER(8, 8, "IDBitMapBuilder");

function handleExportBitmapLines(){
    var editorID = LAST_ACTIVE_PANELS[0].elementContent.id;

    if(editorID.indexOf("Editor") != -1){
        var selectedLines = Editors[editorID].getSelectedText();
        Editors[editorID].insert(BITMAPPER.exportBitmap(selectedLines));
    }
}
BITMAPPER.setExportLinesCallback(handleExportBitmapLines);

function handleImportBitmapLines(){
    var editorID = LAST_ACTIVE_PANELS[0].elementContent.id;

    if(editorID.indexOf("Editor") != -1){
        var selectedLines = Editors[editorID].getSelectedText();
        BITMAPPER.importBitmap(selectedLines);
    }
}
BITMAPPER.setImportLinesCallback(handleImportBitmapLines);

// Project name that sets proejct folder name for files uplaoded to Thumby to live under
// Project name restored in window.onload
var CURRENT_PROJECT_NAME = "New Project";


function setProjectName(){
    var newProejctName = prompt("Please enter a new project name:", "New Project");
    if(newProejctName != null){
        CURRENT_PROJECT_NAME = newProejctName;
    }
    document.getElementById("IDprojectName").textContent = "Project: " + CURRENT_PROJECT_NAME;
    localStorage.setItem("ProjectName", CURRENT_PROJECT_NAME);
}
window.setProjectName = setProjectName;


async function uploadProject(){

    if(!REPL.CONNECTED){
        alert("Thumby is not connected, not uploading");
        return;
    }

    var allPanels = dockManager.getPanels();
    for(var i=0; i<allPanels.length; i++){
        var currentID = allPanels[i].elementContent.id;
        if(currentID.indexOf("Editor") != -1){
            var contents = Editors[allPanels[i].elementContent.id].getValue();
            var fileName = Editors[allPanels[i].elementContent.id].CURRENT_FILE_NAME;

            if(fileName == ""){
                alert("Cannot upload contents of '" + allPanels[i].elementContent.id.substring(2) + "', it has no file name. Please use File->Rename in the editor to give the editor contents a name");
            }

            await REPL.uploadFileToGamesFolder(fileName, contents, CURRENT_PROJECT_NAME);
        }
    }

    await REPL.getOnBoardFSTree();
}
window.uploadProject = uploadProject;


// loops through all existing panels and finds editors then sets Thumby buttons to disabled or not
function setEditorsThumbyButtonStates(disabledorNot){
    var allPanels = dockManager.getPanels();
    for(var i=0; i<allPanels.length; i++){
        var currentID = allPanels[i].elementContent.id;
        if(currentID.indexOf("Editor") != -1){
            document.getElementById(allPanels[i].elementContent.id + "thumbyFastExecuteBtn").disabled = disabledorNot;
            // document.getElementById(allPanels[i].elementContent.id + "thumbyUploadToBtn").disabled = disabledorNot;
            // document.getElementById(allPanels[i].elementContent.id + "executeBtn").disabled = disabledorNot;
        }
    }
}


// Called when REPL module does action where anotion action being sent would break link
var elementsDisabled = false;
function handleDontInterruptPageElements(){
    if(elementsDisabled){
        // Enable elements since RP2040 not busy anymore
        document.getElementById("IDconnectThumbyBtn").disabled = false;
        document.getElementById("IDuploadProjectBtn").disabled = false;
        setEditorsThumbyButtonStates(false);

        // Only enabled file system if actuall conencted to RP2040
        if(FS != null && REPL.CONNECTED){
            FS.setFileEnableState(true);
        }
        elementsDisabled = false;
    }else{
        // Disable elements while RP2040 busy with operation
        document.getElementById("IDconnectThumbyBtn").disabled = true;
        document.getElementById("IDuploadProjectBtn").disabled = true;
        setEditorsThumbyButtonStates(true);
        if(FS != null){
            FS.setFileEnableState(false);
        }
        elementsDisabled = true;

        // The inner HTML will be cleared by the above, reset to default message
        if(!REPL.CONNECTED){
            document.getElementById("IDFileSystem").innerHTML = "<br><br>Waiting On Thumby Connection...<br><br>Left-click \"Connect Thumby\"";
        }
    }
}
REPL.callbackSetDontInterruptToggle(handleDontInterruptPageElements);


// Called when REPL updates/sends contents of filesystem structure back
function handleThumbyFSUpdate(rawFSJsonStr){
    FS.updateTree(JSON.parse(rawFSJsonStr));
}
REPL.callbackSetFSupdate(handleThumbyFSUpdate);


// Called when a Thumby connects to the page
async function handleThumbyConnect(){
    ATERM.writeln("");
    ATERM.writeln('\x1b[1;32m' + "Connected" + '\x1b[1;0m');
    ATERM.setStatePython();

    FS = new FILESYSTEM("IDFileSystem");      // Create the filesystem

    // Set fs tree callback for deleting files on RP2040
    function FSDeleteFileOrDir(path, fileOrDir){
        REPL.deleteFileOrDir(path, fileOrDir);
    }
    FS.setCallbackDelete(FSDeleteFileOrDir);

    // Set fs tree callback for renaming files on the RP2040
    function FSRename(oldPath, newFileName){
        REPL.renameFile(oldPath, newFileName);
    }
    FS.setCallbackRename(FSRename);

    // Open selected file on RP2040 and place it in a new editor on webpage
    async function FSOpen(path, fileName){
        var contents = await REPL.getOnBoardFileContents(path);
        addEditor(contents, fileName);
    }
    FS.setCallbackOpen(FSOpen);
}
REPL.callbackSetConnected(handleThumbyConnect);


// Called when a thumby disconencts from the page
function handleThumbyDisconnect(){
    ATERM.setStateOutput();
    ATERM.prompt();
    ATERM.writeln('\x1b[1;31m' + "Disconnected" + '\x1b[1;0m');
    ATERM.writeln("Waiting for port to be selected...");
    console.log("Disconnect");

    document.getElementById("IDFileSystem").innerHTML = "<br><br>Waiting On Thumby Connection...<br><br>Left-click \"Connect Thumby\"";
}
REPL.callbackSetDisconnected(handleThumbyDisconnect);

function handleThumbyPrint(formattedLine){
    ATERM.writeln(formattedLine);
}
REPL.callbackSetPrint(handleThumbyPrint);


// Called when REPL module detects a prompt
async function handlePrompt(prompt, filterState){
    if(filterState == false){
        ATERM.prompt(prompt);
    }
}
REPL.callbackSetPrompt(handlePrompt);


// Start terminal and setup callback that is called when RP2040 has something to display
var ATERM = new ActiveTerminal('IDTerminal');
function handleTerminalCmdWrite(cmd){
    REPL.writeToDeviceInNormal(cmd);
}
ATERM.callbackSetWriteCMD(handleTerminalCmdWrite);


// Handle showing or hiding dropdown for project settings
function handleProjectSettingsDropdown(event, downOrUp){
    var DIV_ELEM = document.getElementById("IDProjectSettings");
    var MENU_ELM = document.getElementById("IDProjectSettingsMenu");
    if(downOrUp == 0){
        // Show menu for renaming, moving, deleting files and move to cursor.
        MENU_ELM.style.display = "flex";
        MENU_ELM.style.left = (DIV_ELEM.offsetLeft) + 'px';
        MENU_ELM.style.top  = (DIV_ELEM.offsetTop + DIV_ELEM.clientHeight - 1) + 'px';
    }else{
        MENU_ELM.style.display = "none";
    }
}
window.handleProjectSettingsDropdown = handleProjectSettingsDropdown;


// Handle showing or hiding dropdown for other links div
function handleOtherLinksDropdown(event, downOrUp){
    var DIV_ELEM = document.getElementById("IDOtherLinks");
    var MENU_ELM = document.getElementById("IDOtherLinksMenu");
    if(downOrUp == 0){
        // Show menu for renaming, moving, deleting files and move to cursor.
        MENU_ELM.style.display = "flex";
        MENU_ELM.style.left = (DIV_ELEM.offsetLeft) + 'px';
        MENU_ELM.style.top  = (DIV_ELEM.offsetTop + DIV_ELEM.clientHeight - 1) + 'px';
    }else{
        MENU_ELM.style.display = "none";
    }
}
window.handleOtherLinksDropdown = handleOtherLinksDropdown;


// Handle showing or hiding dropdown for utilities div
function handleUtilitesDropdown(event, downOrUp){
    var DIV_ELEM = document.getElementById("IDUtilites");
    var MENU_ELM = document.getElementById("IDUtilitesMenu");
    if(downOrUp == 0){
        // Show menu for renaming, moving, deleting files and move to cursor.
        MENU_ELM.style.display = "flex";
        MENU_ELM.style.left = (DIV_ELEM.offsetLeft) + 'px';
        MENU_ELM.style.top  = (DIV_ELEM.offsetTop + DIV_ELEM.clientHeight - 1) + 'px';
    }else{
        MENU_ELM.style.display = "none";
    }
}
window.handleUtilitesDropdown = handleUtilitesDropdown;



let storeKey = "lastState";
let divDockContainer;
let divDockManager;
let dockManager;


function searchArrayForPanelTitle(title, panelArray){
    for(var i=0; i<panelArray.length; i++){
        if(panelArray[i].title == title){
            return panelArray[i];
        }
    }
}

function searchArrayForPanelID(ID, panelArray){
    for(var i=0; i<panelArray.length; i++){
        if(panelArray[i].elementContent.id == ID){
            return panelArray[i];
        }
    }
}


function invertTheme(){
    // https://stackoverflow.com/questions/2024486/is-there-an-easy-way-to-reload-css-without-reloading-the-page/43161591#43161591
    var links = document.getElementsByTagName("link");
    for (var cl in links){
        var link = links[cl];
        if (link.rel === "stylesheet"){
            var href = link.href.substring(link.href.lastIndexOf("/") + 1);


            if(href == "dock-manager-style-dark.css"){
                link.href = "src/lib/css/dock-manager-style-light.css";
            }else if(href == "dock-manager-style-light.css"){
                link.href = "src/lib/css/dock-manager-style-dark.css";
            }


            if(href == "main-light.css"){
                link.href = "src/main-dark.css";
                ATERM.setDarkTheme();
                document.getElementById("logo").src = "thumby_logo-light.png";
                
                for (const [editorKey, editor] of Object.entries(Editors)) {
                    editor.setThemeDark();
                }
                localStorage.setItem("lastTheme", "dark");
            }else if(href == "main-dark.css"){
                link.href = "src/main-light.css";
                ATERM.setLightTheme();
                document.getElementById("logo").src = "thumby_logo-dark.png";

                for (const [editorKey, editor] of Object.entries(Editors)) {
                    editor.setThemeLight();
                }
                localStorage.setItem("lastTheme", "light");
            }
        }
    }
}
window.invertTheme = invertTheme;


function resetLayout(){
    // Close all panels so redocking can occur from start/clean slate
    var allPanels = dockManager.getPanels();
    for(var i=0; i<allPanels.length; i++){
        var currentID = allPanels[i].elementContent.id;
        if(currentID.indexOf("Editor") != -1){
            Editors[allPanels[i].elementContent.id].isResetFlag = true; // Set this so dock spawn close event does not delete value from storage
        }
        allPanels[i].close();
    }
    
    // Search for panels since storing on creation doesn't work if laoded from LocalStorage
    let nodeDocument = dockManager.context.model.documentManagerNode;
    let nodeBitmapBuilder = dockManager.dockLeft(nodeDocument, searchArrayForPanelID("IDBitMapBuilder", allPanels), 0.152);
    let nodeFilesystem = dockManager.dockDown(nodeBitmapBuilder, searchArrayForPanelTitle("Thumby FileSystem", allPanels));


    // If any panels exist, collect them in ascending id order
    var orderedPanels = [];
    for(var IID=0; IID <= 10; IID++){
        for(var j=0; j<allPanels.length; j++){
            var currentID = allPanels[j].elementContent.id;
            if(currentID.indexOf("Editor") != -1){
                var IDNumber = parseInt(currentID.substring(8));
                if(IID == IDNumber){
                    orderedPanels.push(allPanels[j]);
                }
            }
        }
    }

    // If any order panels collected, add the first one and
    // dock the rest to the first, else create a new one
    if(orderedPanels.length > 0){
        for(var i=0; i<orderedPanels.length; i++){
            dockManager.dockFill(nodeDocument, orderedPanels[i], 0.25);
        }
    }else{
        addEditor();
    }

    // Add terminal and save reset layout
    let nodeTerminal = dockManager.dockRight(nodeDocument, searchArrayForPanelTitle("Terminal", allPanels), 0.424);
    localStorage.setItem(storeKey, dockManager.saveState());
}
window.resetLayout = resetLayout;


function hardResetLayout(){
    localStorage.clear();
    location.reload();
}
window.hardResetLayout = hardResetLayout;



// Returns number between 0 and 5 of first index of editor that is missing
// from all panel pool. Returns -1 if finds index 5 is already occupied
// Uses DIV id and not title
function findMissingEditorID(){
    var allPanels = dockManager.getPanels();
    for(var IID = 0; IID <= 10; IID++){
        var IDDoesNotExist = false;

        // Check if current number exists on some editor panel already
        for(var i=0; i<allPanels.length; i++){
            var currentID = allPanels[i].elementContent.id;
            if(currentID.indexOf("Editor") != -1){
                var IDNumber = parseInt(currentID.substring(8));
                if(IID == IDNumber){
                    IDDoesNotExist = true;
                    break;
                }
            }
        }
        // Found the first missing index in pool, return a number
        if(IDDoesNotExist == false){
            return IID;
        }
    }
    // No IDs were missing, return -1
    return -1;
}


function assignEditor(panelDivID, panel, contents, fileName){
    var panelDiv = document.getElementById(panelDivID); // All parts of an editor window are first contained under this

    // https://github.com/node-projects/dock-spawn-ts/issues/8#issuecomment-645678600
    const checkExist = setInterval(() => {  
        var panelDiv = document.getElementById(panelDivID);  
        
        if (panelDiv) {
            clearInterval(checkExist);  
            // Assign editor to cusom div under panel but place in dict under main panel div for quick reference later
            if(document.getElementById(panelDivID + "Main") == undefined){
                addEditorHTMLToPanel(panelDiv, panelDivID);
            }
            Editors[panelDivID] = new EditorWrapper(panelDivID + "Main", panel);
            if(contents != undefined){
                Editors[panelDivID].setValue(contents, 1);
            }
            if(fileName != undefined){
                Editors[panelDivID].setFileName(fileName);
            }
        }
          /* wait 100ms before we check again */
      }, 100);
}


function getPos(elID) {
    var rect=document.getElementById(elID).getBoundingClientRect();
    return {x:rect.left,y:rect.top};
}


var lastClickedFileDropdownID = undefined;
function handleEditorFileDropdownClick(event){
    lastClickedFileDropdownID = event.srcElement.id;
    document.getElementById("IDEditorFile").style.display = "flex";
    document.getElementById("IDEditorFile").style.left = (getPos(lastClickedFileDropdownID).x) + 'px';
    document.getElementById("IDEditorFile").style.top  = (getPos(lastClickedFileDropdownID).y + document.getElementById(lastClickedFileDropdownID).clientHeight) + 'px';
}
window.handleEditorFileDropdownClick = handleEditorFileDropdownClick;


function handleEditorFileDropdown(event, downOrUp){
    var DIV_ELEM = document.getElementById(lastClickedFileDropdownID);
    var MENU_ELM = document.getElementById("IDEditorFile");
    if((downOrUp == 0 || downOrUp == undefined) && DIV_ELEM != null){
        // Show menu for renaming, moving, deleting files and move to cursor.
        MENU_ELM.style.display = "flex";
        MENU_ELM.style.left = (getPos(lastClickedFileDropdownID).x) + 'px';
        MENU_ELM.style.top  = (getPos(lastClickedFileDropdownID).y + DIV_ELEM.clientHeight) + 'px';
    }else{
        MENU_ELM.style.display = "none";
    }
}
window.handleEditorFileDropdown = handleEditorFileDropdown;


function handleEditorRename(){
    var editorID = document.getElementById(lastClickedFileDropdownID).parentElement.parentElement.id;
    var newName =  prompt("Please enter a new file name", "NewFile.py");
    if(newName == null){
        return;
    }

    for (const [editorID, editor] of Object.entries(Editors)) {
        if(newName == editor.CURRENT_FILE_NAME){
            alert("Cannot use that name, already exists");
            return;
        }
    }

    Editors[editorID].setFileName(newName);
    localStorage.setItem(storeKey, dockManager.saveState());
}
window.handleEditorRename = handleEditorRename;


async function handleEditorOpenFile(){
    var editorID = document.getElementById(lastClickedFileDropdownID).parentElement.parentElement.id;
    var newName = await Editors[editorID].openFile();

    if(newName == null){
        return;
    }

    Editors[editorID].CURRENT_FILE_NAME = newName;

    var allPanels = dockManager.getPanels();
    for(var i=0; i<allPanels.length; i++){
        var currentID = allPanels[i].elementContent.id;
        if(currentID.indexOf("Editor") != -1 && allPanels[i].elementContent.id == editorID){
            allPanels[i].setTitle(editorID.substring(2) + " - " + newName);
            localStorage.setItem(storeKey, dockManager.saveState());
            return;
        }
    }
}
window.handleEditorOpenFile = handleEditorOpenFile;


async function handleEditorSaveFile(){
    var editorID = document.getElementById(lastClickedFileDropdownID).parentElement.parentElement.id;
    await Editors[editorID].saveFileAs();
}
window.handleEditorSaveFile = handleEditorSaveFile;



var lastClickedViewDropdownID = undefined;
function handleEditorViewDropdownClick(event){
    lastClickedViewDropdownID = event.srcElement.id;
    document.getElementById("IDEditorView").style.display = "flex";
    document.getElementById("IDEditorView").style.left = (getPos(lastClickedViewDropdownID).x) + 'px';
    document.getElementById("IDEditorView").style.top  = (getPos(lastClickedViewDropdownID).y + document.getElementById(lastClickedViewDropdownID).clientHeight) + 'px';
}
window.handleEditorViewDropdownClick = handleEditorViewDropdownClick;


function handleEditorViewDropdown(event, downOrUp){
    var DIV_ELEM = document.getElementById(lastClickedViewDropdownID);
    var MENU_ELM = document.getElementById("IDEditorView");
    if((downOrUp == 0 || downOrUp == undefined) && DIV_ELEM != null){
        // Show menu for renaming, moving, deleting files and move to cursor.
        MENU_ELM.style.display = "flex";
        MENU_ELM.style.left = (getPos(lastClickedViewDropdownID).x) + 'px';
        MENU_ELM.style.top  = (getPos(lastClickedViewDropdownID).y + DIV_ELEM.clientHeight) + 'px';
    }else{
        MENU_ELM.style.display = "none";
    }
}
window.handleEditorViewDropdown = handleEditorViewDropdown;


function handleEditorIncraseFontSize(){
    var editorID = document.getElementById(lastClickedViewDropdownID).parentElement.parentElement.id;
    Editors[editorID].increaseFontSize();
}
window.handleEditorIncraseFontSize = handleEditorIncraseFontSize;


function handleEditorDecraseFontSize(){
    var editorID = document.getElementById(lastClickedViewDropdownID).parentElement.parentElement.id;
    Editors[editorID].decreaseFontSize();
}
window.handleEditorDecraseFontSize = handleEditorDecraseFontSize;


function handleFastExecuteClick(event){
    var editorID = document.getElementById(event.srcElement.id).parentElement.parentElement.id;
    REPL.executeLines(Editors[editorID].getValue());
}


function addEditorHTMLToPanel(editorPanelDiv, IDBase){
    var header = document.createElement("div");
    header.id = IDBase + "Header";
    header.classList.add("editor_header_toolbar");
    editorPanelDiv.appendChild(header);

    // \u25BE
    var fileBtn = document.createElement("button");
    fileBtn.id = IDBase + "thumbyFileBtn";
    fileBtn.classList.add("editor_header_toolbar_btn");
    fileBtn.textContent = "File";
    fileBtn.onclick = handleEditorFileDropdownClick;
    header.appendChild(fileBtn);

    var viewBtn = document.createElement("button");
    viewBtn.id = IDBase + "thumbyViewBtn";
    viewBtn.classList.add("editor_header_toolbar_btn");
    viewBtn.textContent = "View";
    viewBtn.onclick = handleEditorViewDropdownClick;
    header.appendChild(viewBtn);

    var fastExecuteBtn = document.createElement("button");
    fastExecuteBtn.id = IDBase + "thumbyFastExecuteBtn";
    fastExecuteBtn.classList.add("editor_header_toolbar_btn");
    fastExecuteBtn.textContent = "\u21bb Fast Execute";
    fastExecuteBtn.title = "Executes script contained in editor on Thumby without uploading script to Thumby filesystem"
    fastExecuteBtn.onclick = handleFastExecuteClick;
    header.appendChild(fastExecuteBtn);


    var editorDiv = document.createElement("div");      // Only Ace is placed under this so custom css can be applied
    editorDiv.id = IDBase + "Main";
    editorDiv.classList.add("editor");
    editorPanelDiv.appendChild(editorDiv);

    // var footer = document.createElement("div");
    // footer.id = IDBase + "Footer";
    // footer.classList.add("editor_footer_toolbar");
    // editorPanelDiv.appendChild(footer);

    // var uploadBtn = document.createElement("button");
    // uploadBtn.id = IDBase + "thumbyUploadToBtn";
    // uploadBtn.classList.add("editor_footer_toolbar_btn");
    // uploadBtn.textContent = "\u27B2 Upload Script To Thumby";
    // footer.appendChild(uploadBtn);

    // var executeBtn = document.createElement("button");
    // executeBtn.id = IDBase + "executeBtn";
    // executeBtn.classList.add("editor_footer_toolbar_btn");
    // executeBtn.textContent = "\u21bb Fast Execute Script On Thumby";
    // footer.appendChild(executeBtn);
}


function addEditor(contents, fileName){
    // Search all panels for first missing or if there are too mnay already
    var missingID = findMissingEditorID();
    if(missingID != -1){

        // Looked through all panels, found missing one, try to see if its div exists, if not (exited at some point), make div
        var editorPanelDiv = document.getElementById("IDEditor" + missingID.toString())
        if(editorPanelDiv == null){
            editorPanelDiv = document.createElement("div");
            editorPanelDiv.style.backgroundColor = "rgb(46, 46, 46)";
            editorPanelDiv.id = "IDEditor" + missingID.toString();
            divDockContainer.appendChild(editorPanelDiv);

            addEditorHTMLToPanel(editorPanelDiv, "IDEditor" + missingID.toString());
        }

        // Get documnet node, add editor panel through dock manager, set editor panel title
        let nodeDocument = dockManager.context.model.documentManagerNode;
        let panelEditor = new DockSpawnTS.PanelContainer(editorPanelDiv, dockManager, null, PanelType.document, false);
        let nodeEdior = dockManager.dockFill(nodeDocument, panelEditor);
        panelEditor.setTitle("Editor" + missingID.toString());

        // Attach ace editor to panel
        assignEditor(editorPanelDiv.id, panelEditor, contents, fileName);
    }else{
        console.log("Too many editors already!");
        alert("Too many editors open already, please close one");
    }
}
window.addEditor = addEditor;


function resizeAllEditors(){
    for (const [panelDivID, editor] of Object.entries(Editors)) {
        editor.resize();
    }
}


function windowResizedManager(){
    dockManager.resize(divDockContainer.clientWidth, divDockContainer.clientHeight);
    setTimeout(function(){ ATERM.autoFit(); console.log("Terminal resized") }, 150);
    setTimeout(function(){ resizeAllEditors(); console.log("Editors resized") }, 150);
}


window.onload = () => {

    var projectName = localStorage.getItem("ProjectName");
    if(projectName != null){
        CURRENT_PROJECT_NAME = projectName;
        document.getElementById("IDprojectName").textContent = "Project: " + CURRENT_PROJECT_NAME;
    }

    divDockContainer = document.getElementById('dock_div');
    divDockManager = document.getElementById('my_dock_manager');
    dockManager = new DockSpawnTS.DockManager(divDockManager);
    window.dockManager = dockManager;
    dockManager.initialize();
    

    let lastState = localStorage.getItem(storeKey);
    if (lastState && lastState.length > 0) {
        dockManager.loadState(lastState);
        BITMAPPER.autoSetPanel(dockManager);
    }


    window.onresize = () => windowResizedManager();
    window.onresize(null);


    dockManager.addLayoutListener({
        onDock: (dockManager, dockNode) => {
            localStorage.setItem(storeKey, dockManager.saveState());
            if(dockNode.container.title == "Terminal"){
                setTimeout(function(){ ATERM.autoFit(); console.log("Terminal resized") }, 150);
            }
            setTimeout(function(){ resizeAllEditors(); console.log("Editors resized") }, 150);
        },
        onUndock: (dockManager, dockNode) => {
            localStorage.setItem(storeKey, dockManager.saveState());
            if(dockNode.container.title == "Terminal"){
                setTimeout(function(){ ATERM.autoFit(); console.log("Terminal resized") }, 150);
            }
            setTimeout(function(){ resizeAllEditors(); console.log("Editors resized") }, 150);
        },
        onCreateDialog: (dockManager, dialog) => {
            localStorage.setItem(storeKey, dockManager.saveState());
            // setTimeout(function(){ resizeAllEditors(); console.log("Editors resized") }, 150);
        },
        onChangeDialogPosition: (dockManager, dialog, x, y) => {
            localStorage.setItem(storeKey, dockManager.saveState());
            // setTimeout(function(){ resizeAllEditors(); console.log("Editors resized") }, 150);
        },
        onResumeLayout: (dockManager, panel) => {
            localStorage.setItem(storeKey, dockManager.saveState());
            if(panel.title == "Terminal"){
                setTimeout(function(){ ATERM.autoFit(); console.log("Terminal resized") }, 150);
            }
            setTimeout(function(){ resizeAllEditors(); console.log("Editors resized") }, 150);
        },
        onClosePanel: (dockManager, panel) => {
            localStorage.setItem(storeKey, dockManager.saveState());

            // Remove editor value from localstorage when an editor is closed
            if(panel.elementContent.id.indexOf("Editor") != -1){
                // Only delete when reset layout button was not pressed (meaning the actual
                // close button was pressed and ace editor value should be deleted form storage)
                if(Editors[panel.elementContent.id].isResetFlag == false){
                    // console.log(panel.elementContent.id);
                    localStorage.removeItem(panel.elementContent.id + "Main");
                    // Editors[panel.elementContent.id] = undefined;
                    Editors[panel.elementContent.id].clearStorage();
                    delete Editors[panel.elementContent.id];
                }else{
                    // Set back to false since was true since reset button was pressed and not close button
                    Editors[panel.elementContent.id].isResetFlag = false;
                }
            }
            // setTimeout(function(){ resizeAllEditors(); console.log("Editors resized") }, 150);
        },
        onHideDialog: (dockManager, dialog) => {
            localStorage.setItem(storeKey, dockManager.saveState());
            // setTimeout(function(){ resizeAllEditors(); console.log("Editors resized") }, 150);
        },
        onShowDialog: (dockManager, dialog) => {
            localStorage.setItem(storeKey, dockManager.saveState());
            // setTimeout(function(){ resizeAllEditors(); console.log("Editors resized") }, 150);
        },
        onTabsReorder: (dockManager, dialog) => {
            localStorage.setItem(storeKey, dockManager.saveState());
            // setTimeout(function(){ resizeAllEditors(); console.log("Editors resized") }, 150);
        },
        onActivePanelChange: (dockManger, panel, previousPanel) => {
            localStorage.setItem(storeKey, dockManager.saveState());
            // setTimeout(function(){ resizeAllEditors(); console.log("Editors resized") }, 150);
            // Store so bitmapper knows which panel to look at to find editor to export to
            if(LAST_ACTIVE_PANELS.length > 1){
                LAST_ACTIVE_PANELS.shift();
                LAST_ACTIVE_PANELS.push(panel);
            }else{
                LAST_ACTIVE_PANELS.push(panel);
            }
        },
    });


    if(lastState == null){
        let panelBitmapBuilder = new DockSpawnTS.PanelContainer(document.getElementById("IDBitMapBuilder"), dockManager, null, PanelType.document, true);
        BITMAPPER.setPanel(panelBitmapBuilder);
        
        let panelFileSystem = new DockSpawnTS.PanelContainer(document.getElementById("IDFileSystem"), dockManager, null, PanelType.document, true);
        let panelEditor = new DockSpawnTS.PanelContainer(document.getElementById("IDEditor0"), dockManager, null, PanelType.document, false);
        let panelTerminal = new DockSpawnTS.PanelContainer(document.getElementById("IDTerminal"), dockManager, null, PanelType.document, true);

        let nodeDocument = dockManager.context.model.documentManagerNode;
        let nodeBitmapBuilder = dockManager.dockLeft(nodeDocument, panelBitmapBuilder, 0.152);

        let nodeFilesystem = dockManager.dockDown(nodeBitmapBuilder, panelFileSystem);
        addEditor();
        let nodeTerminal = dockManager.dockRight(nodeDocument, panelTerminal, 0.424);

        localStorage.setItem(storeKey, dockManager.saveState());
    }

    ATERM.autoFit();
    ATERM.writeln("##### Welcome to The TinyCircuits Thumby Web Tool! #####");
    ATERM.writeln("Waiting for port to be selected...");

    // Place ace editor on each editor panel that exists
    var allPanels = dockManager.getPanels();
    for(var i=0; i<allPanels.length; i++){
        if(allPanels[i].elementContent.id.indexOf("Editor") != -1){
            assignEditor(allPanels[i].elementContent.id, allPanels[i]);
        }
    }

    var lastTheme = localStorage.getItem("lastTheme");
    if(lastTheme != null){
        if(lastTheme == "light"){
            invertTheme();
        }
    }
};
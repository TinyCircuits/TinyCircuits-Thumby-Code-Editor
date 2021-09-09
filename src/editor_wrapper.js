// ##### EDITOR_WRAPPER.js #####
// For managing multiple sessions/tabs of ace editors
// from one object exposed in main.js. Also exposes
// common operations provided by the ace editor

class EditorWrapper{
    constructor(editorElemID, panel){
        this.ELEM_ID = editorElemID;
        this.ACE_EDITOR = ace.edit(this.ELEM_ID);
        this.ACE_EDITOR.setTheme("ace/theme/twilight");
        this.ACE_EDITOR.session.setMode("ace/mode/python");

        this.PANEL = panel;

        this.CURRENT_FILE_NAME = "";

        this.FONT_SIZE = 10;
        this.ACE_EDITOR.setOptions({
            fontSize: this.FONT_SIZE.toString() + "pt",
        });

        var defaultCode =   "from machine import Pin\n" +
                            "import utime\n\n" +
        
                            "# Let pin 18 be an output and set it LOW\n" +
                            "led = Pin(18, Pin.OUT)\n" +
                            "led.low()\n\n" +
        
                            "# Toggle onboard LED on and off forever\n" +
                            "i = 0\n" +
                            "while True:\n" +
                            "   led.toggle()\n" +
                            "   utime.sleep(0.5)\n" +
                            "   print(i)\n" +
                            "   i = i + 1\n" +
                            "   if i > 10:\n" +
                            "       break";

        this.isResetFlag = false;   // When a reset hapens in main.js, set this true so value not deleted from storage

        // File picker options for saving and opening python & text files
        // https://wicg.github.io/file-system-access/#api-filepickeroptions
        this.fileOptions = {
            types: [
            {
                description: 'Text Files',
                accept: {
                    'text/python': ['.py'],
                    'text/plain': ['.txt', '.text']
                }
            }
            ],
            suggestedName: ".py",
        };

        // On page load, add a default tab, provide "allowfalsedelete"
        // flag as true so tab can be clsoed right away (unless edits are made)
        // this.addTab(defaultCode, "HelloWorld.py", undefined, true);

        // When the editor has focus capture ctrl-o and do open file function
        // this.ACE_EDITOR.commands.addCommand({
        //     name: 'OpenFile',
        //     bindKey: {win: 'Ctrl-O',  mac: 'Command-O'},
        //     exec: function(editor) {
        //         EDITOR.openFile();          // Use global scope to access this
        //     },
        //     readOnly: true
        // });

        // // When the editor has focus capture ctrl-s and do save file function
        // this.ACE_EDITOR.commands.addCommand({
        //     name: 'SaveCurrentTab',
        //     bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
        //     exec: function(editor) {
        //         EDITOR.saveFile();          // Use global scaope to access this
        //     },
        //     readOnly: true
        // });

        // // When the editor has focus capture ctrl-r and do rename file function
        // this.ACE_EDITOR.commands.addCommand({
        //     name: 'SaveAsCurrentTab',
        //     bindKey: {win: 'Ctrl-Alt-S',  mac: 'Command-Alt-S'},
        //     exec: function(editor) {
        //         EDITOR.saveFileAs();        // Use global scaope to access this
        //     },
        //     readOnly: true
        // });


        // Save editor state everytime a change is made, EVERYTHING about it
        this.ACE_EDITOR.session.on('change', () => {
            localStorage.setItem(this.ELEM_ID, this.ACE_EDITOR.getValue());
        });

        // Restore editor value, panel title, and font size
        var lastEditorValue = localStorage.getItem(this.ELEM_ID);
        var lastEditorFileName = localStorage.getItem(this.ELEM_ID + "Name");
        var lastEditorFontSize = localStorage.getItem(this.ELEM_ID + "FontSize");
        if(lastEditorValue != null){
            this.ACE_EDITOR.setValue(lastEditorValue, 1);
        }
        if(lastEditorFileName != null){
            this.CURRENT_FILE_NAME = lastEditorFileName;
            if(this.CURRENT_FILE_NAME != ""){
                this.PANEL.setTitle(this.PANEL.elementContent.id.substring(2)+ " - " + this.CURRENT_FILE_NAME);
            }
        }
        if(lastEditorFontSize != null){
            this.FONT_SIZE = lastEditorFontSize;
            this.ACE_EDITOR.setOptions({
                fontSize: this.FONT_SIZE.toString() + "pt",
            });
        }

        this.resize();
    }


    setFileName(newFileName){
        this.CURRENT_FILE_NAME = newFileName;
        this.PANEL.setTitle(this.PANEL.elementContent.id.substring(2)+ " - " + this.CURRENT_FILE_NAME);
        localStorage.setItem(this.ELEM_ID + "Name", this.CURRENT_FILE_NAME);
    }


    // Needs to be called when editor closed otherwise edits that are spawned again will take on the stored data
    clearStorage(){
        localStorage.removeItem(this.ELEM_ID);
        localStorage.removeItem(this.ELEM_ID + "Name");
        localStorage.removeItem(this.ELEM_ID + "FontSize");
    }


    getElemID(){
        return this.ELEM_ID;
    }


    resize(){
        this.ACE_EDITOR.resize();
    }


    increaseFontSize(){
        this.FONT_SIZE++;
        this.ACE_EDITOR.setOptions({
            fontSize: this.FONT_SIZE.toString() + "pt",
        });
        localStorage.setItem(this.ELEM_ID + "FontSize", this.FONT_SIZE);
    }
    decreaseFontSize(){
        if(this.FONT_SIZE-1 > 0){
            this.FONT_SIZE--;
            this.ACE_EDITOR.setOptions({
                fontSize: this.FONT_SIZE.toString() + "pt",
            });
            localStorage.setItem(this.ELEM_ID + "FontSize", this.FONT_SIZE);
        }
    }


    // Adds '*' to start of tab name indicating unsaved. Init of firing event happens when adding tab
    changeTabToUnsaved(){
        if(this.SESSIONS[this.LAST_SELECTED_TAB_ID]["savestate"] == undefined || this.SESSIONS[this.LAST_SELECTED_TAB_ID]["savestate"] == true){
            this.SESSIONS[this.LAST_SELECTED_TAB_ID]["savestate"] = false;
            document.getElementById(this.LAST_SELECTED_TAB_ID).firstChild.textContent =
            "*" + document.getElementById(this.LAST_SELECTED_TAB_ID).firstChild.textContent;
        }

        // When a tab is generated (HellowWorld.py or NewFileX.py), then it has "allowfastdelete"
        // flag set as true, not that an edit has been made, set that false so it asks the user if
        // sure
        if(this.SESSIONS[this.LAST_SELECTED_TAB_ID]["allowfastdelete"]){
            this.SESSIONS[this.LAST_SELECTED_TAB_ID]["allowfastdelete"] = false;
        }
    }


    // Opens a new tab with contents of local file from PC
    async openFile(){
        let fileHandle;
        try{
            [fileHandle] = await window.showOpenFilePicker(this.fileOptions);
        }catch(err){
            return;
        }

        const file = await fileHandle.getFile();
        var code = await file.text();

        this.ACE_EDITOR.setValue(code, 1);

        this.CURRENT_FILE_NAME = file.name;
        console.log(this.ELEM_ID + "Name");
        localStorage.setItem(this.ELEM_ID + "Name", this.CURRENT_FILE_NAME);

        return file.name;
    }


    // Uses file stream to create writer and then saves the data in the active tab to user's PC
    async saveActiveTabData(){
        try{
            var writeStream = await this.SESSIONS[this.LAST_SELECTED_TAB_ID]["filehandler"].createWritable();   // For writing to the file
        }catch(e){
            return;                                                                                             // If the user doesn't allow tab to save to opened file, don't edit file
        }

        var file = await this.SESSIONS[this.LAST_SELECTED_TAB_ID]["filehandler"].getFile();     // Get file from promise so that the name can be retrieved
        this.changeActiveTabName(file.name);                                                    // No matter what, change name to one user may have selected (show in tab)

        var data = await this.SESSIONS[this.LAST_SELECTED_TAB_ID]["session"].getValue();        // Get tab contents
        await writeStream.write(data);                                                          // Write dataif using an HTTPS connection
        writeStream.close();                                                                    // Save the data to the file now
        this.SESSIONS[this.LAST_SELECTED_TAB_ID]["savestate"] = true;                           // Record the tab as saved now
    }


    // Shows the file dialog and suggests current name but will
    // switch to new tab name if user chooses new one
    async saveFileAs(){
        var fileHandle = undefined;
        try{
            if(this.CURRENT_FILE_NAME  == ""){
                this.fileOptions.suggestedName = "NewFile.py";
            }else{
                this.fileOptions.suggestedName = this.CURRENT_FILE_NAME;
            }
            fileHandle = await window.showSaveFilePicker(this.fileOptions);             // Let the user pick location to save with dialog
        }catch(err){                                                                      // If the user aborts, stop function execuation, leave unsaved
            this.fileOptions.suggestedName = ".py";                                     // Reset this before stopping function
            console.log(err);
            return;                                                                     // Stop function
        }

        try{
            var writeStream = await fileHandle.createWritable();                        // For writing to the file
        }catch(err){
            console.log(err);
            return;                                                                     // If the user doesn't allow tab to save to opened file, don't edit file
        }

        var file = fileHandle.getFile();                                                // Get file from promise so that the name can be retrieved
        var data = await this.ACE_EDITOR.getValue();                                    // Get tab contents
        await writeStream.write(data);                                                  // Write dataif using an HTTPS connection
        writeStream.close();                                                            // Save the data to the file now
    }


    // Saves a file using existing file handler (from when file was opened)
    async saveFile(){
        // First, check if file needs to be saved
        if(this.SESSIONS[this.LAST_SELECTED_TAB_ID]["savestate"] != undefined && this.SESSIONS[this.LAST_SELECTED_TAB_ID]["savestate"] == false){
            // Second, check if there is already a file handler for this session,
            // if there isn't one, ask user to pick location (what happens if they
            // choose a new name in the dialog? Should it change the name in the editor?)
            if(this.SESSIONS[this.LAST_SELECTED_TAB_ID]["filehandler"] != undefined){
                // Third, tab/session does have a handler already, just save the file using that
                this.saveActiveTabData();
            }else{
                // Third, tab/session does not have a handler already (which means it wasn't open
                // from the PC, this is a new tab that needs a file handler), use save as process
                this.saveFileAs();
            }

            // If the fiel was auto generated but then saved, even though
            // maybe no edits, don't allow the tab to be close din one click
            if(this.SESSIONS[this.LAST_SELECTED_TAB_ID]["allowfastdelete"]){
                this.SESSIONS[this.LAST_SELECTED_TAB_ID]["allowfastdelete"] = false;
            }
        }
    }


    // Expose common Ace editor operation
    getValue(){
        return this.ACE_EDITOR.getValue();
    }

    // Expose common Ace editor operation
    setValue(value, index){
        return this.ACE_EDITOR.setValue(value, index);
    }


    // Gets the name of the active (green) tab from the first button of the tab that holds the name
    getActiveTabName(){
        if(this.SESSIONS[this.LAST_SELECTED_TAB_ID]["savestate"] == true){
            return document.getElementById(this.LAST_SELECTED_TAB_ID).firstChild.textContent;
        }else{
            return document.getElementById(this.LAST_SELECTED_TAB_ID).firstChild.textContent.substring(1);
        }
    }


    // This is called when file is saved as a different name or when rename function is done.
    changeActiveTabName(newName){
        document.getElementById(this.LAST_SELECTED_TAB_ID).firstChild.textContent = newName;
    }


    // Adds a tab to tab parent element if name=undefined (passed that way),
    // function creates a new file and a unqiue name
    // If allowFastDelete is provided & true, this tab can be closed in one click
    // unless edits were (then page asks if user is sure)
    async addTab(code, name, fileHandler, allowFastDelete){
        this.TAB_COUNT += 1;        // For tracking current number of tabs
        this.MAX_TAB_COUNT += 1;    // For naming files something unqiue

        // Make the tab that fits in the tab space and contains buttons
        // choosing tabs, closing them, and maybe adding tabs
        var tab = document.createElement('div');
        var tabID = "T" + this.MAX_TAB_COUNT.toString();
        tab.setAttribute("id", tabID);
        tab.setAttribute("class", "tab");

        // Start a dict at this tab ID so that Ace session and file handler (if exists),
        // can both be stored for later use (switching sessions and saving file)
        this.SESSIONS[tabID] = {};

        // Build the main tab button that allows the user to select this tab
        var mainTabButton = document.createElement('button');
        var mainBtnID = "M" + this.MAX_TAB_COUNT.toString();
        mainTabButton.setAttribute("id", mainBtnID);
        mainTabButton.setAttribute("class", "tab-main-btn");
        mainTabButton.setAttribute("onclick", "tabButtonClickHandler(this)");
        if(name != undefined){
            mainTabButton.textContent = name;
        }else if(fileHandler != undefined){
            // If the name was undefined and the file handler isn't, don't create a newname, use file's
            // https://web.dev/file-system-access/#ask-the-user-to-pick-a-file-to-read
            const file = await fileHandler.getFile();
            code = await file.text();
            mainTabButton.textContent = file.name;
            this.SESSIONS[tabID]["filehandler"] = fileHandler;
        }else{
            mainTabButton.textContent = "NewFile" + this.MAX_TAB_COUNT.toString() + ".py";
        }

        // Build the close tab button to allow the user to remove a tab from the editor tab space (id: T#)
        var closeTabButton = document.createElement('button');
        closeTabButton.setAttribute("id", "C" + this.MAX_TAB_COUNT.toString());
        closeTabButton.setAttribute("class", "tab-exit-btn");
        closeTabButton.setAttribute("onclick", "tabButtonClickHandler(this)");
        closeTabButton.textContent = "X";

        // Add these buttons to the tab
        tab.appendChild(mainTabButton);
        tab.appendChild(closeTabButton);

        
        var addTabButton = document.createElement('button');
        addTabButton.setAttribute("id", "A");
        addTabButton.setAttribute("class", "tab-add-btn");
        addTabButton.setAttribute("onclick", "tabButtonClickHandler(this)");
        addTabButton.textContent = "+";
        tab.appendChild(addTabButton);

        // Make sure to delete the last tab that had an add button so that there is only ever one add button on the last tab
        if(this.TAB_COUNT > 1){
            this.TABS_ELEMENT.lastChild.lastChild.remove();
        }

        // Add the finished tab to the webpage (still needs color change most likely)
        this.TABS_ELEMENT.appendChild(tab);

        // Change tab colors after child parent relation finished
        this.changeTabColor(tabID, "gray");
        if(this.LAST_SELECTED_TAB_ID != ""){
            this.changeTabColor(this.LAST_SELECTED_TAB_ID, "gray");
        }

        // Tab created for webpage/HTML, now make a new ACE session and load/display it (making sure to save all other tabs first!)
        this.SESSIONS[tabID]["session"] = ace.createEditSession(code, "ace/mode/python");
        this.ACE_EDITOR.setSession(this.SESSIONS[tabID]["session"]);

        this.LAST_SELECTED_TAB_ID = tabID;  // Track this so when new tab selected style can be reset

        // When the user types in editor emit global event that is handled
        // in this main.js for placing an '*' before the name of the file.
        // This has to be re-init for each new tab (could use this.SESSIONS)
        this.ACE_EDITOR.session.on("change", function(delta){
            EDITOR.changeTabToUnsaved();    // USe global scope to access this
        });

        // New tabs are not saved, change tab to unsaved state.
        // Don't state opened tabs as unsaved, just loaded from disk!
        if(fileHandler == undefined){
            this.changeTabToUnsaved();
        }else{
            // Open files are already saved, make not of that or 
            // the first char will be cut off when uploading to RP2040
            this.SESSIONS[this.LAST_SELECTED_TAB_ID]["savestate"] = true;
        }

        // Check if this tab can be closed in one click (unless edits were made of course)
        // This is typically for generated tabs (HelloWorld.py and NewFileX.py), gets switched
        // to false when an edit is made (make sure after calling changeTabToUnsaved())
        if(allowFastDelete == true){
            this.SESSIONS[tabID]["allowfastdelete"] = true;
        }

        this.ACE_EDITOR.focus();
    }


    // Removes tab with provided id and decreases the tab count (but not the max tab count)
    // Will only remove if there exists at least 1 tab
    removeTab(id){
        if(this.TAB_COUNT > 1){

            // Get this so can get the tab name if needed
            var childToRemove = document.getElementById(id);

            // Before anything else, ask the user if they are sure if tab is not saved
            // as long as this is not a generated tab (HelloWorld.py or NewFileX.py)
            // without edits (if generated is edited, will ask user if sure)
            if(this.SESSIONS[id]["savestate"] == false && !this.SESSIONS[id]["allowfastdelete"]){
                if(!confirm("Unsaved file '" + childToRemove.firstChild.textContent.substring(1)  + "', are you sure you want to close it?")){
                    return;
                }
            }

            this.TAB_COUNT -= 1;
            
            // Find tab index before this one being deleted so it can be switched to
            for(var i=0; i<this.TABS_ELEMENT.children.length; i++){
                if(this.TABS_ELEMENT.children[i].id == id){
                    // If deleting any tab, switch to the next tab if not at end,
                    // otherwise switch to the tab just before this one being removed
                    if(i+1 < this.TABS_ELEMENT.children.length){
                        this.switchToTabSession(this.TABS_ELEMENT.children[i+1].id);
                        this.LAST_SELECTED_TAB_ID = this.TABS_ELEMENT.children[i+1].id;
                    }else{
                        this.switchToTabSession(this.TABS_ELEMENT.children[i-1].id);
                        this.LAST_SELECTED_TAB_ID = this.TABS_ELEMENT.children[i-1].id;
                    }
                    break;
                }
            }
            
            // Remove the child tab from the tab space and add an 'add' button to last tab
            childToRemove.remove();
            this.SESSIONS[id] = null;
            if(this.TABS_ELEMENT.lastChild.lastChild.id != "A"){
                var addTabButton = document.createElement('button');
                addTabButton.setAttribute("id", "A");
                addTabButton.setAttribute("class", "tab-add-btn");
                addTabButton.setAttribute("onclick", "tabButtonClickHandler(this)");
                addTabButton.textContent = "+";
                addTabButton.style.backgroundColor = "gray";
                this.TABS_ELEMENT.lastChild.appendChild(addTabButton);
            }
        }
        this.ACE_EDITOR.focus();    // Bring new tab into focus
    }


    // Given the id of the main tab button, this will switch the editor to that ACE tab/session
    switchToTabSession(tabID){
        if(tabID != this.LAST_SELECTED_TAB_ID){
            this.changeTabColor(document.getElementById(this.LAST_SELECTED_TAB_ID).id, "gray");
            this.ACE_EDITOR.setSession(this.SESSIONS[tabID]["session"]);
            this.LAST_SELECTED_TAB_ID = tabID;
            this.changeTabColor(tabID, "gray");
            this.ACE_EDITOR.focus();
        }
    }


    // Given a tab/element with id T#, change it and its child elements to a given color
    changeTabColor(tabID, color){
        var tab = document.getElementById(tabID);
        var children = tab.children;

        tab.style.backgroundColor = color;
        for(var i=0; i<children.length; i++){
            children[i].style.backgroundColor = color;
        }
    }


    // Wrapper for the ACE editor insert function, used for exporting custom bitmaps to editor
    insert(str){
        this.ACE_EDITOR.insert(str);
    }


    // Wrapper for ACE editor getSelectedText function, used for getting custom bitmaps from editor
    getSelectedText(){
        return this.ACE_EDITOR.getSelectedText();
    }
}
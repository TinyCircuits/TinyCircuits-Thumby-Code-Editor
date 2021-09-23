// ##### EDITOR_WRAPPER.js #####
// For managing multiple sessions/tabs of ace editors
// from one object exposed in main.js. Also exposes
// common operations provided by the ace editor

class EditorWrapper{
    constructor(_container, state, EDITORS){

        this._container = _container;

        // New editor, find a unique ID for it. At this point, a new editor can only
        // spawn on first page creation or button click, all or no editors should exist
        // by now
        this.ID = 0;
        if(state.id == -1 || state.id == undefined){
            while(this.ID in EDITORS){
                this.ID = this.ID + 1;
            }
        }else{
            this.ID = state.id;
        }

        EDITORS[this.ID] = this;

        this.HEADER_TOOLBAR_DIV = document.createElement("div");
        this.HEADER_TOOLBAR_DIV.classList.add("editor_header_toolbar");
        this._container.element.appendChild(this.HEADER_TOOLBAR_DIV);

        this.FILE_BUTTON = document.createElement("button");
        this.FILE_BUTTON.classList.add("editor_header_toolbar_btn");
        this.FILE_BUTTON.textContent = "File\u25BE";
        // this.FILE_BUTTON.onclick = handleEditorFileDropdownClick;
        this.HEADER_TOOLBAR_DIV.appendChild(this.FILE_BUTTON);

        this.VIEW_BUTTON = document.createElement("button");
        this.VIEW_BUTTON.classList.add("editor_header_toolbar_btn");
        this.VIEW_BUTTON.textContent = "View\u25BE";
        // this.FILE_BUTTON.onclick = handleEditorFileDropdownClick;
        this.HEADER_TOOLBAR_DIV.appendChild(this.VIEW_BUTTON);

        this.FAST_EXECUTE_BUTTON = document.createElement("button");
        this.FAST_EXECUTE_BUTTON.classList.add("editor_header_toolbar_btn");
        this.FAST_EXECUTE_BUTTON.textContent = "\u21bb Fast Execute";
        // this.FILE_BUTTON.onclick = handleEditorFileDropdownClick;
        this.HEADER_TOOLBAR_DIV.appendChild(this.FAST_EXECUTE_BUTTON);

        this.EDITOR_DIV = document.createElement("div");
        this.EDITOR_DIV.id = "IDEditorDiv" + this.ID;
        this.EDITOR_DIV.classList.add("editor");
        this._container.element.appendChild(this.EDITOR_DIV);


        // // Listen for window resize event and re-fit terminal
        window.addEventListener('resize', this.resize.bind(this));

        // Listen for layout resize event and re-fit terminal
        this._container._layoutManager.on('stateChanged', () => {
            this.resize();
        });


        // When an item is destroyed (clicked closed), wait 750ms and then delete relevant information
        // Need to wait so closing of browser can't cause a delete of the information
        this._container._layoutManager.on('itemDestroyed', (event) => {
            if(this._container.title == event._target._title){
                setTimeout(() =>{
                    delete EDITORS[this.ID];
                    this.clearStorage();
                    console.log("Cleared info for Editor: " + this._container.title);
                }, 750)
            }
        });


        // Make sure mouse click anywhere on panel focuses the panel
        this._container.element.addEventListener('click', (event) => {
            this._container.focus();
        });
        this._container.element.addEventListener('focusin', (event) => {
            this._container.focus();
        });


        var defaultCode =   "import time\n" +
                            "import thumby\n" +
                            "import math\n\n" +
                            
                            "# BITMAP: width: 32, height: 32\n" +
                            "bitmap0 = (0,0,0,0,0,0,0,0,248,8,232,40,40,40,40,40,40,40,40,40,40,232,8,248,0,0,0,0,0,0,0,0,\n" +
                            "           0,0,0,0,0,0,0,0,255,0,63,32,32,32,32,32,32,32,32,32,32,63,0,255,0,0,0,0,0,0,0,0,\n" +
                            "           0,0,0,0,0,0,0,0,255,0,12,12,63,63,12,12,0,0,24,24,3,3,0,255,0,0,0,0,0,0,0,0,\n" +
                            "           0,0,0,0,0,0,0,0,31,16,16,16,16,20,18,16,20,18,16,16,16,16,16,31,0,0,0,0,0,0,0,0)\n\n" +
                            
                            "while(1):\n" +
                            "    t0 = time.ticks_ms()   # Get time (ms)\n" +
                            "    thumby.display.fill(0) # Fill canvas to black\n\n" +
                            
                            "    bobRate = 250 # Set arbitrary bob rate (higher is slower)\n" +
                            "    bobRange = 5  # How many pixels to move the sprite up/down (-5px ~ 5px)\n\n" +
                            
                            "    # Calculate number of pixels to offset sprite for bob animation\n" +
                            "    bobOffset = math.sin(t0 / bobRate) * bobRange\n\n" +
                            
                            "    # Center the sprite using screen and bitmap dimensions and apply bob offset\n" +
                            "    spriteX = int((thumby.DISPLAY_W/2) - (32/2))\n" +
                            "    spriteY = int(round((thumby.DISPLAY_H/2) - (32/2) + bobOffset))\n\n" +
                            
                            "    # Display the bitmap using bitmap data, position, and bitmap dimensions\n" +
                            "    thumby.display.blit(bitmap0, spriteX, spriteY, 32, 32)\n" +
                            "    thumby.display.update()\n";


        this.ACE_EDITOR = ace.edit(this.EDITOR_DIV);
        this.ACE_EDITOR.session.setMode("ace/mode/python");
        this.ACE_EDITOR.setTheme("ace/theme/terminal");
        this.resize();

        this.CURRENT_FILE_NAME = "";

        // ### RESTORE ###
        this.FONT_SIZE = 10;
        this.ACE_EDITOR.setOptions({
            fontSize: this.FONT_SIZE.toString() + "pt",
        });

        // Save value when changes made
        this.ACE_EDITOR.session.on('change', () => {
            localStorage.setItem("EditorValue" + this.ID, this.ACE_EDITOR.getValue());
        });

        // Restore editor value, panel title, and font size
        var lastEditorValue = localStorage.getItem("EditorValue" + this.ID);
        var lastEditorTitle = localStorage.getItem("EditorTitle" + this.ID);
        // var lastEditorFontSize = localStorage.getItem(this.ELEM_ID + "FontSize");

        // this._container.setTitle("Editor" + this.ID);

        if(lastEditorValue != null){
            this.ACE_EDITOR.setValue(lastEditorValue, 1);
        }else if(state['value'] != undefined){
            this.ACE_EDITOR.setValue(state['value'], 1);
        }else{
            this.ACE_EDITOR.setValue(defaultCode, 1);
        }

        if(lastEditorTitle != null){
            this.setTitle(lastEditorTitle);
        }else if(state['path'] != undefined){
            this.setTitle('Editor' + this.ID + ' - ' + state['path']);
        }else{
            this.setTitle('Editor' + this.ID);
        }


        state = {};
        state.id = this.ID;
        this._container.setState(state);

        // if(lastEditorFileName != null){
        //     this.CURRENT_FILE_NAME = lastEditorFileName;
        //     if(this.CURRENT_FILE_NAME != ""){
        //         this.PANEL.setTitle(this.PANEL.elementContent.id.substring(2)+ " - " + this.CURRENT_FILE_NAME);
        //     }
        // }
        // if(lastEditorFontSize != null){
        //     this.FONT_SIZE = lastEditorFontSize;
        //     this.ACE_EDITOR.setOptions({
        //         fontSize: this.FONT_SIZE.toString() + "pt",
        //     });
        // }


        // // File picker options for saving and opening python & text files
        // // https://wicg.github.io/file-system-access/#api-filepickeroptions
        // this.fileOptions = {
        //     types: [
        //     {
        //         description: 'Text Files',
        //         accept: {
        //             'text/python': ['.py'],
        //             'text/plain': ['.txt', '.text']
        //         }
        //     }
        //     ],
        //     suggestedName: ".py",
        // };

        // // On page load, add a default tab, provide "allowfalsedelete"
        // // flag as true so tab can be clsoed right away (unless edits are made)
        // // this.addTab(defaultCode, "HelloWorld.py", undefined, true);

        // // When the editor has focus capture ctrl-o and do open file function
        // // this.ACE_EDITOR.commands.addCommand({
        // //     name: 'OpenFile',
        // //     bindKey: {win: 'Ctrl-O',  mac: 'Command-O'},
        // //     exec: function(editor) {
        // //         EDITOR.openFile();          // Use global scope to access this
        // //     },
        // //     readOnly: true
        // // });

        // // // When the editor has focus capture ctrl-s and do save file function
        // // this.ACE_EDITOR.commands.addCommand({
        // //     name: 'SaveCurrentTab',
        // //     bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
        // //     exec: function(editor) {
        // //         EDITOR.saveFile();          // Use global scaope to access this
        // //     },
        // //     readOnly: true
        // // });

        // // // When the editor has focus capture ctrl-r and do rename file function
        // // this.ACE_EDITOR.commands.addCommand({
        // //     name: 'SaveAsCurrentTab',
        // //     bindKey: {win: 'Ctrl-Alt-S',  mac: 'Command-Alt-S'},
        // //     exec: function(editor) {
        // //         EDITOR.saveFileAs();        // Use global scaope to access this
        // //     },
        // //     readOnly: true
        // // });


        // this.resize();
        
        // var lastTheme = localStorage.getItem(this.ELEM_ID + "Theme");
        // if(lastTheme != null){
        //     if(lastTheme == "dark"){
        //         this.setThemeDark();
        //     }else{
        //         this.setThemeLight();
        //     }
        // }else{
        //     // Default: dark mode
        //     this.setThemeDark();
        // }
    }


    setThemeLight(){
        this.ACE_EDITOR.setTheme("ace/theme/chrome");
        localStorage.setItem(this.ELEM_ID + "Theme", "light");
    }

    setThemeDark(){
        this.ACE_EDITOR.setTheme("ace/theme/terminal");
        localStorage.setItem(this.ELEM_ID + "Theme", "dark");
    }


    setFileName(newFileName){
        this.CURRENT_FILE_NAME = newFileName;
        this.PANEL.setTitle(this.PANEL.elementContent.id.substring(2)+ " - " + this.CURRENT_FILE_NAME);
        localStorage.setItem(this.ELEM_ID + "Name", this.CURRENT_FILE_NAME);
    }


    setTitle(title){
        this._container.setTitle(title);
        this.editorTitle = title;
        localStorage.setItem("EditorTitle" + this.ID, title);
    }


    // Needs to be called when editor closed otherwise edits that are spawned again will take on the stored data
    clearStorage(){
        localStorage.removeItem("EditorValue" + this.ID);
        localStorage.removeItem("EditorTitle" + this.ID);
        // localStorage.removeItem(this.ELEM_ID);
        // 
        // localStorage.removeItem(this.ELEM_ID + "FontSize");
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

    // Wrapper for the ACE editor insert function, used for exporting custom bitmaps to editor
    insert(str){
        this.ACE_EDITOR.insert(str);
    }

    // Wrapper for ACE editor getSelectedText function, used for getting custom bitmaps from editor
    getSelectedText(){
        return this.ACE_EDITOR.getSelectedText();
    }
}
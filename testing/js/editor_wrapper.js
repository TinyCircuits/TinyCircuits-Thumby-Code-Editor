// ##### EDITOR_WRAPPER.js #####
// For managing multiple sessions/tabs of ace editors
// from one object exposed in main.js. Also exposes
// common operations provided by the ace editor

class EditorWrapper{
    constructor(_container, state, EDITORS){

        this.EDITORS = EDITORS;
        this._container = _container;

        // New editor, find a unique ID for it. At this point, a new editor can only
        // spawn on first page creation or button click, all or no editors should exist
        // by now
        this.ID = 0;
        if(state.id == -1 || state.id == undefined){
            while(this.ID in this.EDITORS){
                this.ID = this.ID + 1;
            }
        }else{
            this.ID = state.id;
        }

        this.EDITORS[this.ID] = this;


        this.HEADER_TOOLBAR_DIV = document.createElement("div");
        this.HEADER_TOOLBAR_DIV.classList.add("editor_header_toolbar");
        this._container.element.appendChild(this.HEADER_TOOLBAR_DIV);



        this.FILE_BUTTON = document.createElement("button");
        this.FILE_BUTTON.classList = "uk-button uk-button-primary uk-height-1-1 uk-text-small uk-text-nowrap";
        this.FILE_BUTTON.textContent = "File\u25BE";
        this.FILE_BUTTON.title = "File operations for PC and Thumby";
        this.HEADER_TOOLBAR_DIV.appendChild(this.FILE_BUTTON);

        this.FILE_DROPDOWN = document.createElement("div");
        this.FILE_DROPDOWN.setAttribute("uk-dropdown", "mode: click; offset: 0; delay-hide: 200");
        this.HEADER_TOOLBAR_DIV.appendChild(this.FILE_DROPDOWN);

        this.FILE_DROPDOWN_UL = document.createElement("div");
        this.FILE_DROPDOWN_UL.classList = "uk-nav uk-dropdown-nav";
        this.FILE_DROPDOWN.appendChild(this.FILE_DROPDOWN_UL);

        var listElem = document.createElement("li");
        this.FILE_EXPORT_BUTTON = document.createElement("button");
        this.FILE_EXPORT_BUTTON.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.FILE_EXPORT_BUTTON.textContent = "Export to PC";
        this.FILE_EXPORT_BUTTON.title = "Export editor contents to file on PC";
        this.FILE_EXPORT_BUTTON.onclick = () => {this.exportFileAs()}
        listElem.appendChild(this.FILE_EXPORT_BUTTON);
        this.FILE_DROPDOWN_UL.appendChild(listElem);

        listElem = document.createElement("li");
        this.FILE_IMPORT_BUTTON = document.createElement("button");
        this.FILE_IMPORT_BUTTON.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.FILE_IMPORT_BUTTON.textContent = "Import from PC";
        this.FILE_IMPORT_BUTTON.title = "Import editor contents from file on PC";
        this.FILE_IMPORT_BUTTON.onclick = () => {this.openFile()}
        listElem.appendChild(this.FILE_IMPORT_BUTTON);
        this.FILE_DROPDOWN_UL.appendChild(listElem);

        listElem = document.createElement("li");
        this.FILE_SAVE_BUTTON = document.createElement("button");
        this.FILE_SAVE_BUTTON.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.FILE_SAVE_BUTTON.textContent = "Save to Thumby";
        this.FILE_SAVE_BUTTON.title = "Save editor contents to file on Thumby (ctrl-s)";
        this.FILE_SAVE_BUTTON.onclick = () => {this.onSaveToThumby()};
        listElem.appendChild(this.FILE_SAVE_BUTTON);
        this.FILE_DROPDOWN_UL.appendChild(listElem);

        listElem = document.createElement("li");
        this.FILE_SAVEAS_BUTTON = document.createElement("button");
        this.FILE_SAVEAS_BUTTON.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.FILE_SAVEAS_BUTTON.textContent = "Save As to Thumby";
        this.FILE_SAVEAS_BUTTON.title = "Save editor contents to file on Thumby under a specific path";
        this.FILE_SAVEAS_BUTTON.onclick = () => {this.onSaveAsToThumby()};
        listElem.appendChild(this.FILE_SAVEAS_BUTTON);
        this.FILE_DROPDOWN_UL.appendChild(listElem);

        listElem = document.createElement("li");
        this.FILE_SET_PATH_BUTTON = document.createElement("button");
        this.FILE_SET_PATH_BUTTON.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.FILE_SET_PATH_BUTTON.textContent = "Set Path";
        this.FILE_SET_PATH_BUTTON.title = "Set file path of editor (for Thumby saving and emulation)";
        this.FILE_SET_PATH_BUTTON.onclick = () => {
            var path = prompt("Please enter path for editor in absolute form (e.g. /Games/MyGame/MyGame.py)", this.EDITOR_PATH);
            if(path != null ** path != ""){
                if(path[0] != '/'){
                    path = "/" + path;
                }

                if(this.checkAllEditorsForPath(path) == false){
                    this.setPath(path);
                    this.setTitle("Editor" + this.ID + ' - ' + this.EDITOR_PATH);
                }else{
                    alert("Cannot use path, editor already open with path");
                }
            }
        }
        listElem.appendChild(this.FILE_SET_PATH_BUTTON);
        this.FILE_DROPDOWN_UL.appendChild(listElem);
        
        listElem = document.createElement("li");
        listElem.classList = "uk-nav-divider";
        this.FILE_DROPDOWN_UL.appendChild(listElem);

        listElem = document.createElement("li");
        this.FILE_EXAMPLES_BUTTON = document.createElement("button");
        this.FILE_EXAMPLES_BUTTON.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.FILE_EXAMPLES_BUTTON.textContent = "Examples\u25BE";
        this.FILE_EXAMPLES_BUTTON.title = "Various MicroPython examples";
        listElem.appendChild(this.FILE_EXAMPLES_BUTTON);
        this.FILE_DROPDOWN_UL.appendChild(listElem);


        this.EXAMPLES_DROPDOWN_DIV = document.createElement("div");
        this.EXAMPLES_DROPDOWN_DIV.setAttribute("uk-dropdown", "offset: 0; mode: click");
        this.FILE_DROPDOWN_UL.appendChild(this.EXAMPLES_DROPDOWN_DIV);

        this.EXAMPLES_DROPDOWN_UL = document.createElement("ul");
        this.EXAMPLES_DROPDOWN_UL.classList = "uk-nav uk-dropdown-nav";
        this.EXAMPLES_DROPDOWN_DIV.appendChild(this.EXAMPLES_DROPDOWN_UL);


        listElem = document.createElement("li");
        this.THUMBYPY_EXAMPLE_BTN = document.createElement("button");
        this.THUMBYPY_EXAMPLE_BTN.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.THUMBYPY_EXAMPLE_BTN.textContent = "thumby.py";
        this.THUMBYPY_EXAMPLE_BTN.onclick = async () => {this.openFileContents(await window.downloadFile("/ThumbyGames/lib/thumby.py"))};
        listElem.appendChild(this.THUMBYPY_EXAMPLE_BTN);
        this.EXAMPLES_DROPDOWN_UL.appendChild(listElem);


        this.VIEW_BUTTON = document.createElement("button");
        this.VIEW_BUTTON.classList = "uk-button uk-button-primary uk-height-1-1 uk-text-small uk-text-nowrap";
        this.VIEW_BUTTON.textContent = "View\u25BE";
        this.VIEW_BUTTON.title = "View settings";
        this.HEADER_TOOLBAR_DIV.appendChild(this.VIEW_BUTTON);

        this.VIEW_DROPDOWN = document.createElement("div");
        this.VIEW_DROPDOWN.setAttribute("uk-dropdown", "mode: click; offset: 0; delay-hide: 200");
        this.HEADER_TOOLBAR_DIV.appendChild(this.VIEW_DROPDOWN);

        this.VIEW_DROPDOWN_UL = document.createElement("div");
        this.VIEW_DROPDOWN_UL.classList = "uk-nav uk-dropdown-nav";
        this.VIEW_DROPDOWN.appendChild(this.VIEW_DROPDOWN_UL);

        listElem = document.createElement("li");
        this.VIEW_INC_FONT_BUTTON = document.createElement("button");
        this.VIEW_INC_FONT_BUTTON.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.VIEW_INC_FONT_BUTTON.textContent = "Increase Font";
        this.VIEW_INC_FONT_BUTTON.title = "Increase editor font size";
        this.VIEW_INC_FONT_BUTTON.onclick = () => {this.increaseFontSize()};
        listElem.appendChild(this.VIEW_INC_FONT_BUTTON);
        this.VIEW_DROPDOWN_UL.appendChild(listElem);

        listElem = document.createElement("li");
        this.VIEW_DEC_FONT_BUTTON = document.createElement("button");
        this.VIEW_DEC_FONT_BUTTON.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.VIEW_DEC_FONT_BUTTON.textContent = "Decrease Font";
        this.VIEW_DEC_FONT_BUTTON.title = "Decrease editor font size";
        this.VIEW_DEC_FONT_BUTTON.onclick = () => {this.decreaseFontSize()};
        listElem.appendChild(this.VIEW_DEC_FONT_BUTTON);
        this.VIEW_DROPDOWN_UL.appendChild(listElem);

        listElem = document.createElement("li");
        this.VIEW_RESET_FONT_BUTTON = document.createElement("button");
        this.VIEW_RESET_FONT_BUTTON.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.VIEW_RESET_FONT_BUTTON.textContent = "Reset Font Size";
        this.VIEW_RESET_FONT_BUTTON.title = "Reset font to default";
        this.VIEW_RESET_FONT_BUTTON.onclick = () => {this.resetFontSize()};
        listElem.appendChild(this.VIEW_RESET_FONT_BUTTON);
        this.VIEW_DROPDOWN_UL.appendChild(listElem);

        listElem = document.createElement("li");
        this.VIEW_AUTOCOMPLETE_BUTTON = document.createElement("button");
        this.VIEW_AUTOCOMPLETE_BUTTON.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.VIEW_AUTOCOMPLETE_BUTTON.textContent = "Turn live autocomplete ...";
        this.VIEW_AUTOCOMPLETE_BUTTON.title = "When turned off, basic autocomplete can be accessed using left-ctrl + space. Affects all editors";
        this.VIEW_AUTOCOMPLETE_BUTTON.onclick = () => {this.toggleAutocompleteStateForAll()};
        listElem.appendChild(this.VIEW_AUTOCOMPLETE_BUTTON);
        this.VIEW_DROPDOWN_UL.appendChild(listElem);

        
        this.FAST_EXECUTE_BUTTON = document.createElement("button");
        this.FAST_EXECUTE_BUTTON.classList = "uk-button uk-button-primary uk-height-1-1 uk-text-small uk-text-nowrap";
        this.FAST_EXECUTE_BUTTON.textContent = "\u21bb Fast Execute";
        this.FAST_EXECUTE_BUTTON.title = "Execute editor contents at root '/' of Thumby";
        this.FAST_EXECUTE_BUTTON.onclick = () => {this.onFastExecute(this.getValue())};
        this.HEADER_TOOLBAR_DIV.appendChild(this.FAST_EXECUTE_BUTTON);



        this.EMULATION_ZONE = document.createElement("div");
        this.EMULATION_ZONE.classList = "editor_emulation_zone";
        this.HEADER_TOOLBAR_DIV.appendChild(this.EMULATION_ZONE);

        this.EMULATION_ZONE_NAME = document.createElement("div");
        this.EMULATION_ZONE_NAME.classList = "editor_emulation_zone_name";
        this.EMULATION_ZONE_NAME.innerText = "EMULATION:"
        this.EMULATION_ZONE.appendChild(this.EMULATION_ZONE_NAME);

        this.EMULATION_ZONE_CHECKBOX_PARENT = document.createElement("div");
        this.EMULATION_ZONE_CHECKBOX_PARENT.classList = "editor_emulation_zone_checkbox_parent";
        this.EMULATION_ZONE.appendChild(this.EMULATION_ZONE_CHECKBOX_PARENT);

        this.NORMAL_EMU_CHECKBOX = document.createElement("input");
        this.NORMAL_EMU_CHECKBOX.classList = "uk-checkbox editor_emulate_checkbox";
        this.NORMAL_EMU_CHECKBOX.type = "checkbox";
        this.NORMAL_EMU_CHECKBOX.title = "Designate as file to be emulated";
        this.NORMAL_EMU_CHECKBOX.onchange = (event) => {
            //  Check that the editor has some kind of path set
            if(this.EDITOR_PATH == undefined || this.EDITOR_PATH == ""){
                alert("Please give this editor a path (FILE -> SET PATH)");
                this.NORMAL_EMU_CHECKBOX.checked = false;
                return;
            }

            if(this.NORMAL_EMU_CHECKBOX.checked){
                this.MAIN_EMU_CHECKBOX.checked = false;
                localStorage.setItem("EditorEMUCheck" + this.ID, 0);
            }else{
                this.MAIN_EMU_CHECKBOX.checked = false;
                localStorage.removeItem("EditorEMUCheck" + this.ID)
            }
        }
        this.EMULATION_ZONE_CHECKBOX_PARENT.appendChild(this.NORMAL_EMU_CHECKBOX);

        this.MAIN_EMU_CHECKBOX = document.createElement("input");
        this.MAIN_EMU_CHECKBOX.classList = "uk-checkbox editor_emulate_checkbox";
        this.MAIN_EMU_CHECKBOX.style.borderColor = "red";
        this.MAIN_EMU_CHECKBOX.type = "checkbox";
        this.MAIN_EMU_CHECKBOX.title = "Designate as main file to be emulated (everything will start from this script)";
        this.MAIN_EMU_CHECKBOX.onchange = (event) => {
            //  Check that the editor has some kind of path set
            if(this.EDITOR_PATH == undefined || this.EDITOR_PATH == ""){
                alert("Please give this editor a path (FILE -> SET PATH)");
                this.MAIN_EMU_CHECKBOX.checked = false;
                return;
            }

            if(this.MAIN_EMU_CHECKBOX.checked){
                this.NORMAL_EMU_CHECKBOX.checked = true;

                // Go through all other editors and turn off their main check since this one is checked now, switch them to normal
                for (const [editorID, editorWrapper] of Object.entries(this.EDITORS)) {
                    if(editorID != this.ID){
                        // If this editor was checked as main, switch to normal
                        if(editorWrapper.MAIN_EMU_CHECKBOX.checked){
                            editorWrapper.NORMAL_EMU_CHECKBOX.checked = true;
                            localStorage.setItem("EditorEMUCheck" + editorWrapper.ID, 0);   // Check changed, set
                        }else if(editorWrapper.NORMAL_EMU_CHECKBOX.checked == false){
                            localStorage.removeItem("EditorEMUCheck" + editorWrapper.ID);   // Neither are checked now, remove
                        }
                        editorWrapper.MAIN_EMU_CHECKBOX.checked = false;
                    }
                }

                localStorage.setItem("EditorEMUCheck" + this.ID, 1);
            }else{
                localStorage.removeItem("EditorEMUCheck" + this.ID)
            }
        }
        this.EMULATION_ZONE_CHECKBOX_PARENT.appendChild(this.MAIN_EMU_CHECKBOX);

        var check = localStorage.getItem("EditorEMUCheck" + this.ID);
        if(check != null){
            if(check == '1'){
                this.MAIN_EMU_CHECKBOX.checked = true;
                this.NORMAL_EMU_CHECKBOX.checked = true;
            }else if(check == '0'){
                this.NORMAL_EMU_CHECKBOX.checked = true;
            }
        }


        // this.EMULATE_BUTTON = document.createElement("div");
        // this.EMULATE_BUTTON.classList = "uk-button uk-height-1-1 uk-text-small uk-text-nowrap";
        // this.EMULATE_BUTTON.textContent = "EMULATION";
        // this.EMULATE_BUTTON.title = "Run editor contents in emulator";
        // this.EMULATE_BUTTON.onclick = () => {this.onEmulate(this.getValue())};
        // this.HEADER_TOOLBAR_DIV.appendChild(this.EMULATE_BUTTON);



        this.EDITOR_DIV = document.createElement("div");
        this.EDITOR_DIV.id = "IDEditorDiv" + this.ID;
        this.EDITOR_DIV.classList.add("editor");
        this._container.element.appendChild(this.EDITOR_DIV);


        // Make the dropdowns disappear if the mouse leaves (mode click doesn't do that)
        this.FILE_DROPDOWN.addEventListener("mouseleave", () => {
            UIkit.dropdown(this.FILE_DROPDOWN).hide();
        })

        this.VIEW_DROPDOWN.addEventListener("mouseleave", () => {
            UIkit.dropdown(this.VIEW_DROPDOWN).hide();
        })


        // Listen for window resize event and re-fit terminal
        window.addEventListener('resize', this.resize.bind(this));

        // Listen for layout resize event and re-fit terminal
        this._container._layoutManager.on('stateChanged', () => {
            this.resize();

            // https://github.com/golden-layout/golden-layout/issues/324
            // Remove editor close button functionality and override it
            var oldElem = this._container._tab._closeElement;
            if(oldElem != null && oldElem.parentNode != null){
                var newElem = oldElem.cloneNode(true);
                oldElem.parentNode.replaceChild(newElem, oldElem);

                newElem.onclick = () => {

                    if(this.SAVED_TO_THUMBY == false && !confirm('You have unsaved changes, are you sure you want to close this editor?')) {
                        return;
                    }

                    delete EDITORS[this.ID];
                    this.clearStorage();
                    console.log("Cleared info for Editor: " + this._container.title);
                    this._container.close();
                }
            }
        });

        // Used for setting the active editor outside this module, typically for bit map builder
        this.onFocus = undefined;
        this.onSaveToThumby = undefined;
        this.onSaveAsToThumby = undefined;
        this.onFastExecute = undefined;
        this.onEmulate = undefined;
        this.onClose = undefined;
        this.onOpen = undefined;

        // Make sure mouse click anywhere on panel focuses the panel
        this._container.element.addEventListener('click', (event) => {
            this._container.focus();
            this.onFocus();
        });
        this._container.element.addEventListener('focusin', (event) => {
            this._container.focus();
            this.onFocus();
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

        this.INSERT_RESTORE = false;

        // Save value when changes made
        this.ACE_EDITOR.session.on('change', (event) => {
            localStorage.setItem("EditorValue" + this.ID, this.ACE_EDITOR.getValue());
            
            // The first change is always an insert, don't change saved  to thumby flag for first change
            if(this.INSERT_RESTORE == true){
                if(this.SAVED_TO_THUMBY == true || this.SAVED_TO_THUMBY == undefined){
                    if(this.EDITOR_PATH != undefined){
                        this.setTitle("Editor" + this.ID + ' - *' + this.EDITOR_PATH);
                    }else{
                        this.setTitle("*Editor" + this.ID);
                    }
                    this.SAVED_TO_THUMBY = false;
                    localStorage.setItem("EditorSavedToThumby" + this.ID, this.SAVED_TO_THUMBY);
                }
            }else{
                this.INSERT_RESTORE = true;
            }
        });


        // Restore editor value, panel title, and font size
        var lastEditorValue = localStorage.getItem("EditorValue" + this.ID);
        var lastEditorTitle = localStorage.getItem("EditorTitle" + this.ID);
        var lastEditorPath = localStorage.getItem("EditorPath" + this.ID);
        var lastEditorFontSize = localStorage.getItem("EditorFontSize" + this.ID);
        var lastEditorSavedToThumby = localStorage.getItem("EditorSavedToThumby" + this.ID);


        if(lastEditorValue != null){
            this.ACE_EDITOR.setValue(lastEditorValue, 1);
        }else if(state['value'] != undefined){
            this.ACE_EDITOR.setValue(state['value'], 1);
        }else{
            this.ACE_EDITOR.setValue(defaultCode, 1);

            // When adding default editors, give them a path but make each unique by looking at all other open editors
            if(this.checkAllEditorsForPath("/Games/HelloWorld/HelloWorld.py") == true){
                var helloWorldNum = 1;
                while(this.checkAllEditorsForPath("/Games/HelloWorld/HelloWorld" + helloWorldNum + ".py")){
                    helloWorldNum = helloWorldNum + 1;
                }
                this.setPath("/Games/HelloWorld/HelloWorld" + helloWorldNum + ".py");
            }else{
                this.setPath("/Games/HelloWorld/HelloWorld.py");
            }
        }

        if(lastEditorTitle != null){
            this.setTitle(lastEditorTitle);
        }else if(state['path'] != undefined){
            this.setTitle('Editor' + this.ID + ' - ' + state['path']);
            this.SAVED_TO_THUMBY = true;         // Just opened from thumby, so saved to it
        }else{
            this.setTitle("Editor" + this.ID + ' - ' + this.EDITOR_PATH);
            this.SAVED_TO_THUMBY = undefined;    // For sure not saved to Thumby but also new, keep undefined so can be closed without alert
        }

        if(lastEditorPath != null){
            this.EDITOR_PATH = lastEditorPath;
        }else if(state['path'] != undefined){
            this.EDITOR_PATH = state['path'];
            localStorage.setItem("EditorPath" + this.ID, this.EDITOR_PATH);
        }

        this.FONT_SIZE = 10;
        if(lastEditorFontSize != null){
            this.FONT_SIZE = lastEditorFontSize;
        }

        // Get live autocomplete state, true if 'true' or undefined, affects all editors
        var langTools = ace.require("ace/ext/language_tools");
        this.AUTOCOMPLETE_STATE = (localStorage.getItem("EditorAutocompleteState") === 'true' || localStorage.getItem("EditorAutocompleteState") == undefined);
        this.setAutocompleteButtonText();

        this.ACE_EDITOR.setOptions({
            fontSize: this.FONT_SIZE.toString() + "pt",
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: this.AUTOCOMPLETE_STATE
        });

        if(lastEditorSavedToThumby != null){
            this.SAVED_TO_THUMBY = (lastEditorSavedToThumby === 'true');
        }


        this.state = {};
        this.state.id = this.ID;
        this._container.setState(this.state);


        // File picker options for saving and opening python & text files
        // https://wicg.github.io/file-system-access/#api-filepickeroptions
        this.FILE_OPTIONS = {
            types: [
            {
                description: 'Text Files',
                accept: {
                    'text/python': ['.py'],
                    'text/plain': ['.txt', '.text', '.cfg']
                }
            }
            ],
            suggestedName: ".py",
        };

        // When the editor has focus capture ctrl-s and do save file function
        this.ACE_EDITOR.commands.addCommand({
            name: 'SaveCurrentTab',
            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
            exec: () => {
                this.onSaveToThumby();
            },
            readOnly: true
        });

        // Set to light theme if window is set to light because theme was toggled
        if(window.theme == "light"){
            this.setThemeLight();
        }
    }


    checkAllEditorsForPath(path){
        for(const [editorID, editorWrapper] of Object.entries(this.EDITORS)){
            if(editorWrapper.EDITOR_PATH == path && editorWrapper.ID != this.ID){
                return true;
            }
        }
        return false;
    }


    // Need special function for this since constructor would come before onOpen def
    useOnOpen(){
        this.onOpen(this);
    }

    setAutocompleteButtonText(){
        if(this.AUTOCOMPLETE_STATE){
            this.VIEW_AUTOCOMPLETE_BUTTON.textContent = "Turn live autocomplete OFF";
        }else{
            this.VIEW_AUTOCOMPLETE_BUTTON.textContent = "Turn live autocomplete ON";
        }
    }


    setAutocompleteState(state){
        this.ACE_EDITOR.setOptions({
            enableLiveAutocompletion: state
        });
        this.AUTOCOMPLETE_STATE = state;
        this.setAutocompleteButtonText();
    }


    toggleAutocompleteStateForAll(){
        if(this.AUTOCOMPLETE_STATE){
            this.AUTOCOMPLETE_STATE = false;
        }else{
            this.AUTOCOMPLETE_STATE = true;
        }

        localStorage.setItem("EditorAutocompleteState", this.AUTOCOMPLETE_STATE);

        // Apply to all editors, even this one
        for (const [id, editor] of Object.entries(this.EDITORS)) {
            editor.setAutocompleteState(this.AUTOCOMPLETE_STATE);
        }
    }


    setPath(path){
        this.EDITOR_PATH = path;
        localStorage.setItem("EditorPath" + this.ID, this.EDITOR_PATH);
    }

    setSaved(){
        this.SAVED_TO_THUMBY = true;
        localStorage.setItem("EditorSavedToThumby" + this.ID, this.SAVED_TO_THUMBY);
    }


    updateTitleSaved(){
        if(this.SAVED_TO_THUMBY == true){
            if(this.EDITOR_PATH != undefined){
                this.setTitle("Editor" + this.ID + ' - ' + this.EDITOR_PATH);
            }else{
                this.setTitle("Editor" + this.ID);
            }
            localStorage.setItem("EditorSavedToThumby" + this.ID, this.SAVED_TO_THUMBY);
        }
    }


    setThemeLight(){
        this.ACE_EDITOR.setTheme("ace/theme/chrome");
        localStorage.setItem(this.ELEM_ID + "Theme", "light");
    }

    setThemeDark(){
        this.ACE_EDITOR.setTheme("ace/theme/terminal");
        localStorage.setItem(this.ELEM_ID + "Theme", "dark");
    }


    setTitle(title){
        this._container.setTitle(title);
        this.EDITOR_TITLE = title;
        localStorage.setItem("EditorTitle" + this.ID, title);
    }


    // Needs to be called when editor closed otherwise edits that are spawned again will take on the stored data
    clearStorage(){
        console.log("Removed editor local storage");
        localStorage.removeItem("EditorEMUCheck" + this.ID);
        localStorage.removeItem("EditorValue" + this.ID);
        localStorage.removeItem("EditorTitle" + this.ID);
        localStorage.removeItem("EditorPath" + this.ID);
        localStorage.removeItem("EditorFontSize" + this.ID);
        localStorage.removeItem("EditorSavedToThumby" + this.ID);
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
        localStorage.setItem("EditorFontSize" + this.ID, this.FONT_SIZE);
    }
    decreaseFontSize(){
        if(this.FONT_SIZE - 1 > 0){
            this.FONT_SIZE--;
            this.ACE_EDITOR.setOptions({
                fontSize: this.FONT_SIZE.toString() + "pt",
            });
            localStorage.setItem("EditorFontSize" + this.ID, this.FONT_SIZE);
        }
    }
    resetFontSize(){
        this.FONT_SIZE = 10;
        this.ACE_EDITOR.setOptions({
            fontSize: this.FONT_SIZE.toString() + "pt",
        });
        localStorage.setItem("EditorFontSize" + this.ID, this.FONT_SIZE);
    }


    async openFileContents(contents){
        if(this.SAVED_TO_THUMBY == false && !confirm('You have unsaved changes, are you sure you want to overwrite this editor?')) {
            return;
        }
        this.ACE_EDITOR.setValue(contents, 1);
    }


    // Opens a new tab with contents of local file from PC
    async openFile(){
        if(this.SAVED_TO_THUMBY == false && !confirm('You have unsaved changes, are you sure you want to overwrite this editor?')) {
            return;
        }

        let fileHandle;
        try{
            [fileHandle] = await window.showOpenFilePicker(this.FILE_OPTIONS);
        }catch(err){
            return;
        }

        const file = await fileHandle.getFile();
        var code = await file.text();

        this.CURRENT_FILE_NAME = file.name;

        // See this.FILE_OPTIONS 'text/python': ['.py'], 'text/plain': ['.txt', '.text', '.cfg']
        if(file.name.indexOf(".py") == -1 && file.name.indexOf(".txt") == -1 && file.name.indexOf(".text") == -1 && file.name.indexOf(".cfg") == -1){
            if(!confirm("Unrecognized file extension, are you sure you want to import this?\n\nTry using the filesystem upload button instead")){
                return;
            }
        }

        this.ACE_EDITOR.setValue(code, 1);

        console.log(this.ELEM_ID + "Name");
        localStorage.setItem(this.ELEM_ID + "Name", this.CURRENT_FILE_NAME);

        return file.name;
    }


    // Shows the file dialog and suggests current name
    async exportFileAs(){
        var fileHandle = undefined;
        try{
            if(this.CURRENT_FILE_NAME  == ""){
                this.FILE_OPTIONS.suggestedName = "NewFile.py";
            }else{
                this.FILE_OPTIONS.suggestedName = this.CURRENT_FILE_NAME;
            }
            fileHandle = await window.showSaveFilePicker(this.FILE_OPTIONS);            // Let the user pick location to save with dialog
        }catch(err){                                                                    // If the user aborts, stop function execution, leave unsaved
            this.FILE_OPTIONS.suggestedName = ".py";                                    // Reset this before stopping function
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
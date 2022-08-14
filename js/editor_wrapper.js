// ##### EDITOR_WRAPPER.js #####
// For managing multiple sessions/tabs of ace editors
// from one object exposed in main.js. Also exposes
// common operations provided by the ace editor

class EditorWrapper{
    constructor(_container, state, EDITORS){

        // indexDB used for storing binary data of binary files for persistance
        this.BINARY_DATABASE_VERSION = 1;
        this.DB = undefined;

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
        this.state = state;

        this.EDITORS[this.ID] = this;

        // Toolbar and editor div always exist, child elements are added or removed from them
        this.HEADER_TOOLBAR_DIV = document.createElement("div");
        this.HEADER_TOOLBAR_DIV.classList.add("editor_header_toolbar");
        this._container.element.appendChild(this.HEADER_TOOLBAR_DIV);

        this.EDITOR_DIV = document.createElement("div");
        this.EDITOR_DIV.id = "IDEditorDiv" + this.ID;
        this.EDITOR_DIV.classList.add("editor");
        this._container.element.appendChild(this.EDITOR_DIV);

        this.defaultCode =   "import time\n" +
                            "import thumby\n" +
                            "import math\n\n" +
                            
                            "# BITMAP: width: 32, height: 32\n" +
                            "bitmap0 = bytearray([0,0,0,0,0,0,0,0,248,8,232,40,40,40,40,40,40,40,40,40,40,232,8,248,0,0,0,0,0,0,0,\n" +
                            "                     0,0,0,0,0,0,0,0,0,255,0,63,32,32,32,32,32,32,32,32,32,32,63,0,255,0,0,0,0,0,0,0,\n" +
                            "                     0,0,0,0,0,0,0,0,0,255,0,12,12,63,63,12,12,0,0,24,24,3,3,0,255,0,0,0,0,0,0,0,0,0,\n" +
                            "                     0,0,0,0,0,0,0,31,16,16,16,16,20,18,16,20,18,16,16,16,16,16,31,0,0,0,0,0,0,0,0])\n\n" +
                            
                            "# Make a sprite object using bytearray (a path to binary file from 'IMPORT SPRITE' is also valid)\n" +
                            "thumbySprite = thumby.Sprite(32, 32, bitmap0)\n\n" +

                            "# Set the FPS (without this call, the default fps is 30)\n" +
                            "thumby.display.setFPS(60)\n\n" +

                            "while(1):\n" +
                            "    t0 = time.ticks_ms()   # Get time (ms)\n" +
                            "    thumby.display.fill(0) # Fill canvas to black\n\n" +
                            
                            "    bobRate = 250 # Set arbitrary bob rate (higher is slower)\n" +
                            "    bobRange = 5  # How many pixels to move the sprite up/down (-5px ~ 5px)\n\n" +
                            
                            "    # Calculate number of pixels to offset sprite for bob animation\n" +
                            "    bobOffset = math.sin(t0 / bobRate) * bobRange\n\n" +
                            
                            "    # Center the sprite using screen and bitmap dimensions and apply bob offset\n" +
                            "    thumbySprite.x = int((thumby.display.width/2) - (32/2))\n" +
                            "    thumbySprite.y = int(round((thumby.display.height/2) - (32/2) + bobOffset))\n\n" +
                            
                            "    # Display the bitmap using bitmap data, position, and bitmap dimensions\n" +
                            "    thumby.display.drawSprite(thumbySprite)\n" +
                            "    thumby.display.update()\n";

        this.initEditorPanelUI(state["value"]);

        // Listen for layout changes and re-fit the editor, also override the default exit button
        this._container._layoutManager.on('stateChanged', () => {
            this.resize();

            // https://github.com/golden-layout/golden-layout/issues/324
            // Remove editor close button functionality and override it
            var oldElem = this._container._tab._closeElement;
            
            this._container._tab._element.title = this.EDITOR_TITLE.split(" - ")[1];

            if(oldElem != null && oldElem.parentNode != null){
                var newElem = oldElem.cloneNode(true);
                oldElem.parentNode.replaceChild(newElem, oldElem);

                newElem.onclick = () => {
                    if(Object.keys(this.EDITORS).length > 1){
                        if(this.SAVED_TO_THUMBY == false && !confirm('You have unsaved changes, are you sure you want to close this editor?')) {
                            return;
                        }

                        // Remove this since only needed for editor
                        window.removeEventListener("resize", this.windowResizeListener);

                        delete EDITORS[this.ID];
                        this.clearStorage();

                        // Clear the binary file from database that this editor had a reference to
                        if(this.isEditorBinary()) this.deleteDBFile();

                        console.log("Cleared info for Editor: " + this._container.title);
                        this._container.close();
                    }
                }
            }
        });

        // Used for setting the active editor outside this module, typically for bit map builder
        this.onFocus = undefined;
        this.onSaveToThumby = undefined;
        this.onSaveAsToThumby = undefined;
        this.onFastExecute = undefined;
        this.onEmulate = undefined;
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

        // Used to suggest a name for certain operations
        this.FILE_OPTIONS = {
            suggestedName: ".py",
        };


        // Figure out if editor should take on the last saved title, passed title, or default title
        var lastEditorTitle = localStorage.getItem("EditorTitle" + this.ID);
        if(lastEditorTitle != null){
            this.setTitle(lastEditorTitle);
        }else if(state['path'] != undefined){
            this.setTitle('Editor' + this.ID + ' - ' + state['path']);
            this.SAVED_TO_THUMBY = true;         // Just opened from thumby, so saved to it
        }else{
            this.setTitle("Editor" + this.ID + ' - ' + this.EDITOR_PATH);
            this.SAVED_TO_THUMBY = undefined;    // For sure not saved to Thumby but also new, keep undefined so can be closed without alert
        }


        // Figure out editor should set the path from last saved, or passed
        var lastEditorPath = localStorage.getItem("EditorPath" + this.ID);
        if(lastEditorPath != null){
            this.EDITOR_PATH = lastEditorPath;
        }else if(state['path'] != undefined){
            this.EDITOR_PATH = state['path'];
            localStorage.setItem("EditorPath" + this.ID, this.EDITOR_PATH);
        }


        // Figure out if editor was saved last time or not
        var lastEditorSavedToThumby = localStorage.getItem("EditorSavedToThumby" + this.ID);
        if(lastEditorSavedToThumby != null){
            this.SAVED_TO_THUMBY = (lastEditorSavedToThumby === 'true');
        }

        this.state = {};
        this.state.id = this.ID;
        this._container.setState(this.state);

        // Database used for getting files
        this.DB = undefined;
    }


    isEditorBinary(){
        var isBinary = localStorage.getItem("isBinary" + this.ID);
        if(isBinary != null){
            if(isBinary == "true"){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }


    initDB(successCallback){
        // Open database for files and handle any errors
        const request = indexedDB.open('BINARY_FILES', this.BINARY_DATABASE_VERSION);
        request.onerror = (event) => {
            console.error(`Database error: ${event.target.errorCode}`);
        };

        // Can only create object stores (buckets) and search terms (index) when new DB opened or version changes
        request.onupgradeneeded = (event) => {
            this.DB = event.target.result;
            let store = this.DB.createObjectStore('BINARY_FILES_STORE', {
                autoIncrement: true
            });
       
            // Create an index (search term)
            let index = store.createIndex('editorID', 'editorID', {
                unique: false
            });
        };

        request.onsuccess = (event) => {
            this.DB = event.target.result;
            console.log("Database accessed");
            successCallback();
        };
    }

    addDBFile(dataBuffer){
        this.initDB(() => {
            // Create a transaction with binary store in read only mode
            const txn = this.DB.transaction('BINARY_FILES_STORE', 'readwrite');

            // Get the store/bucket
            const store = txn.objectStore('BINARY_FILES_STORE');

            // Get the index/search term from the store/bucket
            const index = store.index('editorID');

            let query = index.getKey(this.ID);

            var fileEntry = {editorID: this.ID,
                             fileData: dataBuffer};

            // Return the result object on success
            query.onsuccess = (event) => {
                console.log("Added file to DB");
                store.put(fileEntry, query.result);
            };

            // Handle the error case
            query.onerror = (event) => {
                console.log("Added file to DB");
                store.put(fileEntry);
            }

            // Close the database connection
            txn.oncomplete = () => {
                this.DB.close();
            };
        });
    }



    getDBFile(successCallback){
        this.initDB(() => {
            // Create a transaction with binary store in read only mode
            const txn = this.DB.transaction('BINARY_FILES_STORE', 'readonly');

            // Get the store/bucket
            const store = txn.objectStore('BINARY_FILES_STORE');

            // Get the index/search term from the store/bucket
            const index = store.index('editorID');

            // Use store to start a search/query for the entry with the current editor ID
            let query = index.get(this.ID);

            // Return the result object on success
            query.onsuccess = (event) => {
                console.log("File data retrieved from DB");
                successCallback(new Uint8Array(query.result.fileData));
            };

            // Handle the error case
            query.onerror = (event) => {
                console.log(event.target.error);
            }

            // Close the database connection
            txn.oncomplete = () => {
                this.DB.close();
            };
        });
    }



    deleteDBFile(successCallback){
        this.initDB(() => {
            // Create a transaction with binary store in read only mode
            const txn = this.DB.transaction('BINARY_FILES_STORE', 'readwrite');

            // Get the store/bucket
            const store = txn.objectStore('BINARY_FILES_STORE');

            // Get the index/search term from the store/bucket
            const index = store.index('editorID');

            let query = index.getKey(this.ID);

            // Return the result object on success
            query.onsuccess = (event) => {
                store.delete(query.result);
                console.log("File deleted from DB");
                if(successCallback != undefined) successCallback();
            };

            // Handle the error case
            query.onerror = (event) => {
                console.log(event.target.error);
            }

            // Close the database connection
            txn.oncomplete = () => {
                this.DB.close();
            };
        });
    }



    initEditorPanelUI(data){
        // Remove all buttons from header toolbar, if they exist
        while(this.HEADER_TOOLBAR_DIV.children.length > 0){
            this.HEADER_TOOLBAR_DIV.removeChild(this.HEADER_TOOLBAR_DIV.children[0]);
        }

        // Remove all buttons from editor div, if they exist
        while(this.EDITOR_DIV.children.length > 0){
            this.EDITOR_DIV.removeChild(this.EDITOR_DIV.children[0]);
        }

        // Remove the editor now since it will need to be reassigned a new parent div
        if(this.ACE_EDITOR) this.ACE_EDITOR.destroy();

        // Binary and code viewer always have file button and dropdown
        this.FILE_BUTTON = document.createElement("button");
        this.FILE_BUTTON.classList = "uk-button uk-button-primary uk-height-1-1 uk-text-small uk-text-nowrap";
        this.FILE_BUTTON.textContent = "File\u25BE";
        this.FILE_BUTTON.title = "File operations for PC and Thumby";
        this.HEADER_TOOLBAR_DIV.appendChild(this.FILE_BUTTON);

        this.FILE_DROPDOWN = document.createElement("div");
        this.FILE_DROPDOWN.setAttribute("uk-dropdown", "mode: click; offset: 0; delay-hide: 200");
        this.HEADER_TOOLBAR_DIV.appendChild(this.FILE_DROPDOWN);
        this.FILE_DROPDOWN.addEventListener("mouseleave", () => {
            UIkit.dropdown(this.FILE_DROPDOWN).hide();
        })

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
            if(path != null && path != ""){
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

        var isBinary = localStorage.getItem("isBinary" + this.ID);

        if(data == undefined && isBinary != null && isBinary == "true"){                                                        // If was binary viewer last time, should still be
            console.log("INIT BINARY VIEWER");
            localStorage.setItem("isBinary" + this.ID, true);
            this.turnIntoBinaryViewer();
        }else if((data == undefined && isBinary == null) || (data == undefined && isBinary != null && isBinary == "false")){    // No data and not binary, new editor with default code
            console.log("INIT CODE VIEWER");
            localStorage.setItem("isBinary" + this.ID, false);
            this.turnIntoCodeViewer(data);
        }else if(data != undefined){

            // Check if the decoded data contains binary replacement letters (could also check that most characters only equal ascii chars)
            var decodedData = new TextDecoder().decode(new Uint8Array(data));
            if(decodedData.indexOf("�") == -1 && decodedData.indexOf("") == -1 && decodedData.indexOf("") == -1 && decodedData.indexOf("") == -1){
                console.log("INIT CODE VIEWER");
                localStorage.setItem("isBinary" + this.ID, false);
                this.turnIntoCodeViewer(decodedData);
            }else{
                console.log("INIT BINARY VIEWER");
                localStorage.setItem("isBinary" + this.ID, true);
                this.turnIntoBinaryViewer(data);
            }
        }



        // Every editor has an emulation zone for emulate checkboxes
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


        // Games opened from the arcade get pre-checked for emulation
        if(this.state.mainChecked != undefined && this.state.mainChecked == true){
            this.MAIN_EMU_CHECKBOX.checked = true;
            this.NORMAL_EMU_CHECKBOX.checked = true;
            localStorage.setItem("EditorEMUCheck" + this.ID, 1);
        }else if(this.state.normalChecked != undefined && this.state.normalChecked == true){
            this.MAIN_EMU_CHECKBOX.checked = false;
            this.NORMAL_EMU_CHECKBOX.checked = true;
            localStorage.setItem("EditorEMUCheck" + this.ID, 0);
        }


        var check = localStorage.getItem("EditorEMUCheck" + this.ID);
        if(check != null){
            if(check == '1'){
                this.MAIN_EMU_CHECKBOX.checked = true;
                this.NORMAL_EMU_CHECKBOX.checked = true;
            }else if(check == '0'){
                this.NORMAL_EMU_CHECKBOX.checked = true;
            }
        }
    }



    turnIntoCodeViewer(data){
        var listElem = document.createElement("li");
        listElem.classList = "uk-nav-divider";

        this.VIEW_BUTTON = document.createElement("button");
        this.VIEW_BUTTON.classList = "uk-button uk-button-primary uk-height-1-1 uk-text-small uk-text-nowrap";
        this.VIEW_BUTTON.textContent = "View\u25BE";
        this.VIEW_BUTTON.title = "View settings";
        this.HEADER_TOOLBAR_DIV.appendChild(this.VIEW_BUTTON);

        this.VIEW_DROPDOWN = document.createElement("div");
        this.VIEW_DROPDOWN.setAttribute("uk-dropdown", "mode: click; offset: 0; delay-hide: 200");
        this.HEADER_TOOLBAR_DIV.appendChild(this.VIEW_DROPDOWN);
        this.VIEW_DROPDOWN.addEventListener("mouseleave", () => {
            UIkit.dropdown(this.VIEW_DROPDOWN).hide();
        })

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

        // Listen for window resize event and re-fit terminal
        this.windowResizeListener = window.addEventListener('resize', this.resize.bind(this));


        // Init the ace editor
        this.ACE_EDITOR = ace.edit(this.EDITOR_DIV);
        this.ACE_EDITOR.session.setMode("ace/mode/python");

        var lastTheme = localStorage.getItem("lastTheme");
        const darkEditorTheme = localStorage.getItem("darkEditorTheme")
        const lightEditorTheme = localStorage.getItem("lightEditorTheme")
        if(lastTheme != undefined && lastTheme != null && lastTheme == "light"){
            if (!lightEditorTheme) {
                this.setThemeLight();
            } else {
                this.setTheme(lightEditorTheme);
            }
        }else{
            if (!darkEditorTheme){
                this.setThemeDark();
            } else {
                this.setTheme(darkEditorTheme);
            }
        }

        this.resize();


        this.INSERT_RESTORE = false;

        // Save value when changes made and edit the title
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


        // Figure out if the editor should take on stored code, passed, code, or use default code
        var lastEditorValue = localStorage.getItem("EditorValue" + this.ID);
        if(data != undefined){
            this.ACE_EDITOR.setValue(data, 1);
        }else if(lastEditorValue != null){
            this.ACE_EDITOR.setValue(lastEditorValue, 1);
        }else{
            this.ACE_EDITOR.setValue(this.defaultCode, 1);

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


        // Set the font size based on what's saved, if it exists
        var lastEditorFontSize = localStorage.getItem("EditorFontSize" + this.ID);
        this.FONT_SIZE = 10;
        if(lastEditorFontSize != null){
            this.FONT_SIZE = lastEditorFontSize;
        }

        // Get live autocomplete state, true if 'true' or undefined, affects all editors
        var langTools = ace.require("ace/ext/language_tools");
        this.AUTOCOMPLETE_STATE = (localStorage.getItem("EditorAutocompleteState") === 'true' || localStorage.getItem("EditorAutocompleteState") == undefined);
        this.setAutocompleteButtonText();

        // Set the options that were restored
        this.ACE_EDITOR.setOptions({
            fontSize: this.FONT_SIZE.toString() + "pt",
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: this.AUTOCOMPLETE_STATE
        });

        // When the editor has focus capture ctrl-s and do save file function
        this.ACE_EDITOR.commands.addCommand({
            name: 'SaveCurrentTab',
            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
            exec: () => {
                this.onSaveToThumby();
            },
            readOnly: true
        });
    }



    turnIntoBinaryViewer(data){
        if(this.ACE_EDITOR) this.ACE_EDITOR.destroy();

        // Set some persistent values for this editor
        localStorage.removeItem("EditorValue" + this.ID);

        // Remove this since only needed for editor
        window.removeEventListener("resize", this.windowResizeListener);

        // Make the editor look different
        this.EDITOR_DIV.innerHTML = "Binary File";
        this.EDITOR_DIV.style.display = "flex";
        this.EDITOR_DIV.style.justifyContent = "center";
        this.EDITOR_DIV.style.alignItems = "center";
        this.EDITOR_DIV.style.backgroundColor = "#121212";
        this.EDITOR_DIV.style.color = "white";
        this.EDITOR_DIV.style.fontFamily = "Monaco, Menlo, \"Ubuntu Mono\", Consolas, source-code-pro, monospace";
        this.EDITOR_DIV.style.fontSize = "15px";

        // Save any passed data to DB (if undefined, then this.ID correlates to data saved in DB already)
        if(data != undefined){
            this.addDBFile(data);
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
    }

    setThemeDark(){
        this.ACE_EDITOR.setTheme("ace/theme/tomorrow_night_bright");
    }

    setTheme(theme){
        this.ACE_EDITOR.setTheme(`ace/theme/${theme}`);
    }


    setTitle(title){
        this._container.setTitle(title.split('/').at(-1));

        // Make the tab title show the full path
        if(this._container._tab != undefined){
            this._container._tab._element.title = this.EDITOR_TITLE.split(" - ")[1];
        }

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
        localStorage.removeItem("isBinary" + this.ID);
    }


    resize(){
        if(this.ACE_EDITOR != undefined) this.ACE_EDITOR.resize();
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
        var data = await file.arrayBuffer();

        this.CURRENT_FILE_NAME = file.name;
        this.initEditorPanelUI(data);
        

        // Make the editor take on the name of the file but use root since no other context for full path
        this.setPath("/" + this.CURRENT_FILE_NAME);
        this.setTitle("Editor" + this.ID + ' - ' + this.EDITOR_PATH);

        return file.name;
    }


    addFileToDB(data){
        // Need to save the binary data, if defined
        if(data != undefined){
            // const request = indexedDB.open('BINARY_FILES', this.BINARY_DATABASE_VERSION);

            // // Print error to console if it happens
            // request.onerror = (event) => {
            //     console.error(`Database error: ${event.target.errorCode}`);
            // };

            // // Print success to console if it happens
            // request.onsuccess = (event) => {
            //     console.log("DB successfully accessed");
            //     this.DB = event.target.result

            //     // Create a new transaction based on the files database
            //     const transaction = this.DB.transaction('BINARY_FILES_DB', 'readwrite');

            //     // Get the binary files object store
            //     const store = transaction.objectStore('BINARY_FILES_DB');

            //     var fileEntry = {editorID: this.ID,
            //                      fileData: data};

            //     let query = store.put(fileEntry);

            //     // Handle success case
            //     query.onsuccess = function (event) {
            //         console.log("File saved to database");
            //     };

            //     // Handle the error case
            //     query.onerror = function (event) {
            //         console.log(event.target.errorCode);
            //     }

            //     // close the database once the transaction completes
            //     transaction.oncomplete = () => {
            //         this.DB.close();
            //     };





            // };

            // // Create the object store (bucket) and indexes (search term/key) on first database creation or higher version
            // request.onupgradeneeded = (event) => {
            //     this.DB = event.target.result;

            //     // Create the object store (bucket) with auto-increment id (key)
            //     let store = this.DB.createObjectStore('BINARY_FILES_DB', {
            //         autoIncrement: true
            //     });

            //     // Create an index (search term) based on the editor ID property (unique str)
            //     let index = store.createIndex('editorID', 'editorID', {
            //         unique: true
            //     });
            // };
        }
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
        var data = undefined;
        if(!this.isEditorBinary()){
            data = await this.ACE_EDITOR.getValue();
            await writeStream.write(data);                                              // Write data if using an HTTPS connection
            writeStream.close();                                                        // Save the data to the file now
        }else{
            this.getDBFile(async (fileDataBuffer) => {
                await writeStream.write(fileDataBuffer);                                // Write data if using an HTTPS connection
                writeStream.close();                                                    // Save the data to the file now
            })
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
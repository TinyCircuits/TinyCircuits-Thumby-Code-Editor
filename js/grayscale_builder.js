// http://jsfiddle.net/42dj7jy8/3/


class GRAYSCALE_BUILDER{
    constructor(_container, state){

        this._container = _container;
        const title = this._container.title;


        // Contains all bitmap builder elements
        this.INNER_PARENT_DIV = document.createElement("div");
        this.INNER_PARENT_DIV.classList.add("bitmap_builder_inner_parent");
        this._container.element.appendChild(this.INNER_PARENT_DIV);        


        // Make sure mouse click anywhere on panel focuses the panel
        this._container.element.addEventListener('click', (event) => {
            this._container.focus();
        });
        this._container.element.addEventListener('focusin', (event) => {
            this._container.focus();
        });

        this.dragging = false;

        // Added to golden layout around lines 5224
        addEventListener("splitterDragStop", () => {
            this.dragging = false;
        })

        addEventListener("splitterDragStart", () => {
            this.dragging = true;
        })


        this.BITMAP_WIDTH_LIMIT = 72 * 2;
        this.BITMAP_HEIGHT_LIMIT = 40 * 2;


        // The starting size of the bitmap
        this.ROW_COUNT = 8;
        this.COLUMN_COUNT = 8;

        // The size of each cell/bitmap pixel (square) in pixels
        this.GRID_SIZE_PX = 225;

        // How many pixels to scale cell size by on zoom event
        this.ZOOM_STEP_PX = 5.0;

        // Used to track number of times bitmaps exported, used to give each variable unique, 'enough', name
        this.BITMAP_EXPORT_COUNT = 0;

        // Don't show context menu on right click grid
        this.INNER_PARENT_DIV.addEventListener("contextmenu", e => e. preventDefault());


        // Contains all elements for the bitmap grid
        this.GRID_AREA_DIV = document.createElement("div");
        this.GRID_AREA_DIV.addEventListener('wheel', this.scrollZoom.bind(this));
        this.GRID_AREA_DIV.onmousemove = function(event){event.preventDefault()}    // Don't stop user from drawing if out of grid area
        this.GRID_AREA_DIV.classList.add("bitmap_builder_grid_area");
        this.INNER_PARENT_DIV.appendChild(this.GRID_AREA_DIV);

        this.GRID_DIV = document.createElement("div");
        this.GRID_DIV.classList.add("bitmap_builder_grid");
        this.GRID_DIV.title = "Controls: \u000d 1. Draw with selected color by left-clicking \u000d 2. Draw with an alternative color by right-clicking \u000d 3. Zoom in/out using left ctrl + scrollwheel";
        this.GRID_AREA_DIV.appendChild(this.GRID_DIV);


        // Contains all bitmap builder button elements
        this.BUTTON_AREA_DIV = document.createElement("div");
        this.BUTTON_AREA_DIV.classList.add("bitmap_builder_button_area");
        this.INNER_PARENT_DIV.appendChild(this.BUTTON_AREA_DIV);


        this.SET_SIZE_BTN = document.createElement("button");
        this.SET_SIZE_BTN.textContent = "Size";
        this.SET_SIZE_BTN.onclick = this.setSize.bind(this);
        this.SET_SIZE_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
        this.SET_SIZE_BTN.title = "Opens dialogs for setting the bitmap width adn height (erases bitmap)";
        this.BUTTON_AREA_DIV.appendChild(this.SET_SIZE_BTN);

        this.COLOR_PICKER = document.createElement("div");
        this.COLOR_PICKER.classList.add("bitmap_builder_button_area");
        this.BUTTON_AREA_DIV.appendChild(this.COLOR_PICKER);
        // BLACK
        this.BLACK_PICK = document.createElement("div");
        this.BLACK_PICK.onclick = this.pickBlack.bind(this);
        this.BLACK_PICK.oncontextmenu = this.pickEraseBlack.bind(this);
        this.BLACK_PICK.className = "bitmap_color";
        this.BLACK_PICK.style.backgroundColor = "black"
        this.COLOR_PICKER.appendChild(this.BLACK_PICK);
        // WHITE
        this.WHITE_PICK = document.createElement("div");
        this.WHITE_PICK.onclick = this.pickWhite.bind(this);
        this.WHITE_PICK.oncontextmenu = this.pickEraseWhite.bind(this);
        this.WHITE_PICK.className = "bitmap_color";
        this.WHITE_PICK.style.backgroundColor = "white"
        this.COLOR_PICKER.appendChild(this.WHITE_PICK);
        // DARKGRAY
        this.DARKGRAY_PICK = document.createElement("div");
        this.DARKGRAY_PICK.onclick = this.pickDarkGray.bind(this);
        this.DARKGRAY_PICK.oncontextmenu = this.pickEraseDarkGray.bind(this);
        this.DARKGRAY_PICK.className = "bitmap_color";
        this.DARKGRAY_PICK.style.backgroundColor = "darkgray"
        this.COLOR_PICKER.appendChild(this.DARKGRAY_PICK);
        // LIGHTGRAY
        this.LIGHTGRAY_PICK = document.createElement("div");
        this.LIGHTGRAY_PICK.onclick = this.pickLightGray.bind(this);
        this.LIGHTGRAY_PICK.oncontextmenu = this.pickEraseLightGray.bind(this);
        this.LIGHTGRAY_PICK.className = "bitmap_color";
        this.LIGHTGRAY_PICK.style.backgroundColor = "lightgray"
        this.COLOR_PICKER.appendChild(this.LIGHTGRAY_PICK);

        this.ZOOM_DIV = document.createElement("div");
        this.ZOOM_DIV.classList.add("bitmap_builder_dual_button_area");
        this.BUTTON_AREA_DIV.appendChild(this.ZOOM_DIV);
        // ZOOM IN
        this.ZOOM_IN_BTN = document.createElement("button");
        this.ZOOM_IN_BTN.setAttribute("uk-icon", "plus-circle");
        this.ZOOM_IN_BTN.onclick = this.zoomIn.bind(this);
        this.ZOOM_IN_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
        this.ZOOM_IN_BTN.title = "Zoom in on the bitmap (left ctrl + scroll wheel forward/up)";
        this.ZOOM_DIV.appendChild(this.ZOOM_IN_BTN);
        // ZOOM OUT
        this.ZOOM_OUT_BTN = document.createElement("button");
        this.ZOOM_OUT_BTN.setAttribute("uk-icon", "minus-circle");
        this.ZOOM_OUT_BTN.onclick = this.zoomOut.bind(this);
        this.ZOOM_OUT_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
        this.ZOOM_OUT_BTN.title = "Zoom out on the bitmap (left ctrl + scroll wheel backwards/down)";
        this.ZOOM_DIV.appendChild(this.ZOOM_OUT_BTN);

        this.IMPORT_LINES_CALLBACK = undefined;
        this.IMPORT_LINES_BTN = document.createElement("button");
        this.IMPORT_LINES_BTN.textContent = "Import";
        this.IMPORT_LINES_BTN.onclick = () => {this.importBitmap(this.onImport())}
        this.IMPORT_LINES_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
        this.IMPORT_LINES_BTN.title = "Import selected lines containing bitmap array and comment from an editor";
        this.BUTTON_AREA_DIV.appendChild(this.IMPORT_LINES_BTN);

        this.IMPORT_IMAGE_BTN = document.createElement("button");
        this.IMPORT_IMAGE_BTN.textContent = "Image";
        this.IMPORT_IMAGE_BTN.onclick = this.importImage.bind(this);
        this.IMPORT_IMAGE_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
        this.IMPORT_IMAGE_BTN.title = "Import image from computer and auto apply threshold to convert to monochrome (most image types work: .png, .jpg, etc.)";
        this.BUTTON_AREA_DIV.appendChild(this.IMPORT_IMAGE_BTN);

        this.INVERT_BTN = document.createElement("button");
        this.INVERT_BTN.textContent = "Invert";
        this.INVERT_BTN.onclick = this.invertCells.bind(this);
        this.INVERT_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
        this.INVERT_BTN.title = "Inverts all pixels";
        this.BUTTON_AREA_DIV.appendChild(this.INVERT_BTN);

        this.CLEAR_BTN = document.createElement("button");
        this.CLEAR_BTN.textContent = "Clear";
        this.CLEAR_BTN.onclick = this.clearCells.bind(this);
        this.CLEAR_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
        this.CLEAR_BTN.title = "Clears all pixels to white";
        this.BUTTON_AREA_DIV.appendChild(this.CLEAR_BTN);

        this.EXPORT_LINES_CALLBACK = undefined;
        this.EXPORT_LINES_BTN = document.createElement("button");
        this.EXPORT_LINES_BTN.textContent = "Export";
        this.EXPORT_LINES_BTN.onclick = () => {this.onExport(this.exportBitmap(this.onImport()))}
        this.EXPORT_LINES_BTN.className = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
        this.EXPORT_LINES_BTN.title = "Exports bitmap to line selected in an editor as an array with accompany comment";
        this.BUTTON_AREA_DIV.appendChild(this.EXPORT_LINES_BTN);

        // Render grid for the first time
        this.renderGrid();

        this.updatePanelTitle();

        this.penColor = "black"
        this.eraseColor = "white"

        this.restoreFromLocally();

        this.LAST_IMPORTED_IMAGE = undefined;

        this.OFFSCREEN_CANVAS = document.createElement('canvas');
        this.OFFSCREEN_CANVAS_CONTEXT = undefined;
    }



    async importImage(){
        let fileHandle;
        try{
            [fileHandle] = await window.showOpenFilePicker(this.FILE_OPTIONS);
        }catch(err){
            return;
        }
        const file = await fileHandle.getFile();

        this.LAST_IMPORTED_IMAGE = new Image();
        this.LAST_IMPORTED_IMAGE.onload = () => {
            if(this.LAST_IMPORTED_IMAGE.width > this.BITMAP_WIDTH_LIMIT){
                console.log("Image width is greater than" + this.BITMAP_WIDTH_LIMIT + "px at " + this.LAST_IMPORTED_IMAGE.width + "px, import canceled");
                alert("Image width is greater than" + this.BITMAP_WIDTH_LIMIT + "px at " + this.LAST_IMPORTED_IMAGE.width + "px, import canceled");
                return;
            }else if(this.LAST_IMPORTED_IMAGE.height > this.BITMAP_HEIGHT_LIMIT){
                console.log("Image height is greater than" + this.BITMAP_HEIGHT_LIMIT + "px at " + this.LAST_IMPORTED_IMAGE.height + "px, import canceled");
                alert("Image height is greater than" + this.BITMAP_HEIGHT_LIMIT + "px at " + this.LAST_IMPORTED_IMAGE.height + "px, import canceled");
                return;
            }else{
                this.OFFSCREEN_CANVAS.width = this.LAST_IMPORTED_IMAGE.width;
                this.OFFSCREEN_CANVAS.height = this.LAST_IMPORTED_IMAGE.height;
                this.OFFSCREEN_CANVAS_CONTEXT = this.OFFSCREEN_CANVAS.getContext('2d');
                this.OFFSCREEN_CANVAS_CONTEXT.drawImage(this.LAST_IMPORTED_IMAGE, 0, 0, this.LAST_IMPORTED_IMAGE.width, this.LAST_IMPORTED_IMAGE.height);
                
                this.COLUMN_COUNT = this.LAST_IMPORTED_IMAGE.width;
                this.ROW_COUNT = this.LAST_IMPORTED_IMAGE.height;
                this.updatePanelTitle();
                this.renderGrid();
                this.saveLocally();
                this.applyGridSize();

                var pixelData = this.OFFSCREEN_CANVAS_CONTEXT.getImageData(0, 0, this.LAST_IMPORTED_IMAGE.width, this.LAST_IMPORTED_IMAGE.height).data;
                var cells = this.GRID_DIV.children;
                var cellIndex = 0;
                for (var i = 0, n = pixelData.length; i < n; i += 4) {
                    // i+3 is alpha (the fourth element)
                    var pixAvg = (pixelData[i] + pixelData[i+1] + pixelData[i+2]) / 3;
                    if(pixAvg >= 192){   // White
                        cells[cellIndex].style.backgroundColor = "white";
                    }else if(pixAvg >= 128){   // White
                        cells[cellIndex].style.backgroundColor = "lightgray";
                    }else if(pixAvg >= 64){   // White
                        cells[cellIndex].style.backgroundColor = "darkgray";
                    }else{              // Black
                        cells[cellIndex].style.backgroundColor = "black";
                    }
                    cellIndex = cellIndex + 1;
                }

                // https://stackoverflow.com/a/6776055
                URL.revokeObjectURL(this.LAST_IMPORTED_IMAGE.src);
                console.log("Image import successful");
                this.saveLocally();
            }
        }
        this.LAST_IMPORTED_IMAGE.src = URL.createObjectURL(file);
    }



    restoreFromLocally(){
        var rowCount = localStorage.getItem("GS_ROW_COUNT");
        var colCount = localStorage.getItem("GS_COL_COUNT");
        var cellValues = localStorage.getItem("GS_CELL_VALUES");
        var cellPxSize = localStorage.getItem("GS_GRID_SIZE_PX");

        if(rowCount != null && colCount != null && cellValues != null && cellPxSize != null){
            this.ROW_COUNT = parseInt(rowCount);
            this.COLUMN_COUNT = parseInt(colCount);
            this.GRID_SIZE_PX = parseInt(cellPxSize);
            this.renderGrid();

            cellValues = cellValues.split(',');

            var cells = this.GRID_DIV.children;
            for (var i = 0; i < cells.length; i++) {
                var cell = cells[i];
                if(cellValues[i] == "1"){
                    cell.style.backgroundColor = "white";
                }else if(cellValues[i] == "0"){
                    cell.style.backgroundColor = "black";
                }else if(cellValues[i] == "3"){
                    cell.style.backgroundColor = "lightgray";
                }else if(cellValues[i] == "2"){
                    cell.style.backgroundColor = "darkgray";
                }
            }
        }
        this.applyGridSize();
    }


    saveLocally(){
        localStorage.setItem("GS_ROW_COUNT", this.ROW_COUNT);
        localStorage.setItem("GS_COL_COUNT", this.COLUMN_COUNT);
        localStorage.setItem("GS_GRID_SIZE_PX", this.GRID_SIZE_PX);

        var cellValues = [];

        var cells = this.GRID_DIV.children;
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            if(cell.style.backgroundColor == "white"){
                cellValues.push(1);
            }else if(cell.style.backgroundColor == "lightgray"){
                cellValues.push(3);
            }else if(cell.style.backgroundColor == "darkgray"){
                cellValues.push(2);
            }else{
                cellValues.push(0);
            }
        }
        localStorage.setItem("GS_CELL_VALUES", cellValues);
    }


    // This callback calls function in main that grabs selected lines
    setExportLinesCallback(callback){
        this.EXPORT_LINES_CALLBACK = callback;
        this.EXPORT_LINES_BTN.onclick = this.EXPORT_LINES_CALLBACK.bind(this);
    }

    setImportLinesCallback(callback){
        this.IMPORT_LINES_CALLBACK = callback;
        this.IMPORT_LINES_BTN.onclick = this.IMPORT_LINES_CALLBACK.bind(this);
    }


    pickBlack() {this.penColor = "black"}
    pickWhite() {this.penColor = "white"}
    pickLightGray() {this.penColor = "lightgray"}
    pickDarkGray() {this.penColor = "darkgray"}
    pickEraseBlack() {this.eraseColor = "black"}
    pickEraseWhite() {this.eraseColor = "white"}
    pickEraseLightGray() {this.eraseColor = "lightgray"}
    pickEraseDarkGray() {this.eraseColor = "darkgray"}

    // Clears grid back to white
    clearCells(){
        var cells = this.GRID_DIV.children;
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            cell.style.backgroundColor = "white";
        }
        this.saveLocally();
    }


    invertCells(){
        var cells = this.GRID_DIV.children;
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            if(cell.style.backgroundColor == "black"){
                cell.style.backgroundColor = "white";
            }else if(cell.style.backgroundColor == "lightgray"){
                cell.style.backgroundColor = "darkgray";
            }else if(cell.style.backgroundColor == "darkgray"){
                cell.style.backgroundColor = "lightgray";
            }else{
                cell.style.backgroundColor = "black";
            }
        }
        this.saveLocally();
    }


    setSize(){
        if(this.setWidth()){
            this.setHeight();
        }
    }


    // Asks user for number, makes sure valid, updates grid and title
    setWidth(){
        var newWidth = prompt("Enter a new bitmap width (limit: "+ this.BITMAP_WIDTH_LIMIT +"): ", 8);
        if(newWidth != null){
            newWidth = parseInt(newWidth);
            if(newWidth != NaN){
                if(newWidth >= 1 && newWidth <= this.BITMAP_WIDTH_LIMIT){
                    this.COLUMN_COUNT = newWidth;
                    this.updatePanelTitle();
                    this.renderGrid();
                    this.saveLocally();
                    this.applyGridSize();
                    return true;
                }else{
                    alert("That width is too large or small (min: 1, max: " + this.BITMAP_WIDTH_LIMIT + ")");
                    return false;
                }
            }
        }
        return false;
    }


     // Asks user for number, makes sure valid, updates grid and title
     setHeight(){
        var newHeight = prompt("Enter a new bitmap height (limit: " + this.BITMAP_HEIGHT_LIMIT + "): ", 8);
        if(newHeight != null){
            newHeight = parseInt(newHeight);
            if(newHeight != NaN){
                if(newHeight >= 1 && newHeight <= this.BITMAP_HEIGHT_LIMIT){
                    this.ROW_COUNT = newHeight;
                    this.updatePanelTitle();
                    this.renderGrid();
                    this.saveLocally();
                    this.applyGridSize();
                    return true;
                }else{
                    alert("That height is too large (min: 1, max: " + this.BITMAP_HEIGHT_LIMIT + ")")
                    return false;
                }
            }
        }
        return false;
    }


    updatePanelTitle(){
        this._container.setTitle("Grayscale Builder");
    }


    // Provided a panel drom dock-spawn-ts, set the panel and update the title
    setPanel(panel){
        this.PANEL = panel;
        this.updatePanelTitle();
    }


    cellLeftClickCallback(cell){
        if(this.dragging == false){
            cell.style.backgroundColor = this.penColor;
            this.saveLocally();
        }
    }

    cellRightClickCallback(cell){
        if(this.dragging == false){
            cell.style.backgroundColor = this.eraseColor;
            this.saveLocally();
        }
    }


    cellHoverCallback(cell, event){
        event.preventDefault();
        if(this.dragging == false){
            if(event.buttons == 1){
                cell.style.backgroundColor = this.penColor;
                this.saveLocally();
            }else if(event.buttons == 2){
                cell.style.backgroundColor = this.eraseColor;
                this.saveLocally();
            }
        }
    }


    applyGridSize(){
        this.GRID_DIV.style.aspectRatio = this.COLUMN_COUNT + "/" + this.ROW_COUNT;
        this.GRID_DIV.style.width = (this.COLUMN_COUNT / this.ROW_COUNT) * this.GRID_SIZE_PX + "px";
        this.GRID_DIV.style.height = this.GRID_SIZE_PX + "px";
    }



    // Use shift + scroll wheel to zoom in and out
    scrollZoom(event){
        event.preventDefault();
        if(event.ctrlKey == true){
            if(event.wheelDelta < 0){
                this.zoomOut();
            }else{
                this.zoomIn();
            }
        }
    }


    // Make each grid pixel larger and re-render grid
    zoomIn(){
        this.GRID_SIZE_PX = this.GRID_SIZE_PX + this.ZOOM_STEP_PX;
        this.applyGridSize();
        this.saveLocally();
    }


    // Make each grid pixel smaller and re-render grid
    zoomOut(){
        if(this.GRID_SIZE_PX - this.ZOOM_STEP_PX < 1){
            this.GRID_SIZE_PX = 1;
        }else{
            this.GRID_SIZE_PX = this.GRID_SIZE_PX - this.ZOOM_STEP_PX;
        }
        this.applyGridSize();
        this.saveLocally();
    }


    // Delete/clear grid and then re-build using GRID_DATA
    renderGrid(){
        // Remove all child elements of previous grid
        while (this.GRID_DIV.firstChild) {
            var child = this.GRID_DIV.firstChild;
            this.GRID_DIV.removeChild(child);
            child.remove();
        }

        // https://developer.mozilla.org/en-US/docs/Glossary/Grid_Cell
        this.GRID_DIV.style.gridTemplateColumns = "repeat(" + this.COLUMN_COUNT + ", 1fr)";
        for(var i=0; i < this.ROW_COUNT * this.COLUMN_COUNT; i++){
            if(document.getElementById(`gsc${i}`) == undefined){
                var cell = document.createElement("div");
                cell.id = `gsc${i}`;
                cell.className = "bitmap_grid_cell";

                cell.style.backgroundColor = "white";

                cell.onclick = this.cellLeftClickCallback.bind(this, cell);
                cell.oncontextmenu = this.cellRightClickCallback.bind(this, cell);
                cell.onmousemove = this.cellHoverCallback.bind(this, cell);

                this.GRID_DIV.appendChild(cell);
            }
        }
    }


    // Builds bytes from bitmap data to build buffer using editor wrapper.
    // Allow selected lines to be passed so that highlighted code can be used
    // to find a variable name (this way not always needing to re-type)
    exportBitmap(selectedLines){
        
        // This is the default, will try to look at selected lines and 
        // see if var name that can be used. If one can be used, will
        // overwrite and not output framebuffer line
        var varName = "bitmap";
        var foundName = false;  // Used to set true so framebuffer line not output if name found

        // String that holds all export information for editor
        var str = "";

        // If selected lines doesn't equal any of the below, and there is only one equals sign 
        // (meaning just the array selected) then use existing name from editor (splits into 2 elements)
        // Also ensure no newlines before the equals because that means user has selected line before name
        // and now don't know where start of name is otherwise
        if( selectedLines != undefined && selectedLines != "" && 
            selectedLines != " " && selectedLines != "\n" && 
            selectedLines.indexOf('=') != -1 && selectedLines.split("=").length <= 4 && 
            (selectedLines.indexOf('\n') == -1 || selectedLines.indexOf('\n') > selectedLines.indexOf('='))){

            // Do one more check, th
            var startExtractNameIndex = 0;
            var endExtractNameIndex = selectedLines.indexOf('=') - 1;   // Get rid of the space at the end, it will be re-added
            varName = selectedLines.substring(startExtractNameIndex, endExtractNameIndex);
            foundName = true;
        }else{
            // just use the default generated name since no names were found
            varName = varName + this.BITMAP_EXPORT_COUNT.toString();    // Add index to make name unique when a name was NOT found

            // Add dimensions of bitmap to a comment above the buffer (if selected on import, will use these instead of asking user), only on not finding name
            str = str + "# BITMAP: width: " + this.COLUMN_COUNT.toString() + ", height: " + this.ROW_COUNT.toString() + "\n";
        }

        // Start the actual array
        str = str + varName + " = bytearray([";

        // Track number of spaces needed to offset (EX spaces needed = len('bitmap33 = (')))
        var spaceIndentCount = (varName + " = [").length;

        // Loop through grid data in pages COLUMN_COUNT long but 8 thick (each column of 8 is a byte for buffer)
        for(var scanRow=0; scanRow<this.ROW_COUNT; scanRow+=8){
            for(var column=0; column<this.COLUMN_COUNT; column++){

                // Byte for column where each bit will be set from grid data
                var byte = 0;

                // Make the byte
                for(var i=0; i<8 && scanRow+i < this.ROW_COUNT; i++){
                    var value = document.getElementById(`gsc${((scanRow+i) * this.COLUMN_COUNT) + column}`).style.backgroundColor;
                    if(value == "white" || value == "lightgray"){
                        value = 1;
                    }else{
                        value = 0;
                    }

                    byte = byte | value<<i;
                }

                // Add the byte to Python array string
                str = str + byte.toString();

                // As long not at last position in array to print, add a comma after each entry
                if(column != this.COLUMN_COUNT-1 || scanRow+8 < this.ROW_COUNT){
                    str = str + ",";
                }
            }

            // At the end of a page, before and formatting next add newline when not on last line of array
            if(scanRow+8 < this.ROW_COUNT){
                str = str + "\n";

                // Indent next lines to be even with the top-most line
                for(var indent=0; indent<spaceIndentCount; indent++){
                    str = str + " ";
                }
            }
        }

        // Finish up the array Python syntax and setup the framebuffer for the user to use
        str = str + "])\n";

        // ---------------------------
        // Now start the shading array
        str = str + varName + "SHD = bytearray([";

        // Track number of spaces needed to offset (EX spaces needed = len('bitmap33 = (')))
        spaceIndentCount = (varName + " = [").length;

        // Loop through grid data in pages COLUMN_COUNT long but 8 thick (each column of 8 is a byte for buffer)
        for(var scanRow=0; scanRow<this.ROW_COUNT; scanRow+=8){
            for(var column=0; column<this.COLUMN_COUNT; column++){

                // Byte for column where each bit will be set from grid data
                var byte = 0;
                
                // Make the byte
                for(var i=0; i<8 && scanRow+i < this.ROW_COUNT; i++){
                    var value = document.getElementById(`gsc${((scanRow+i) * this.COLUMN_COUNT) + column}`).style.backgroundColor;
                    if(value == "darkgray" || value == "lightgray"){
                        value = 1;
                    }else{
                        value = 0;
                    }

                    byte = byte | value<<i;
                }

                // Add the byte to Python array string
                str = str + byte.toString();

                // As long not at last position in array to print, add a comma after each entry
                if(column != this.COLUMN_COUNT-1 || scanRow+8 < this.ROW_COUNT){
                    str = str + ",";
                }
            }

            // At the end of a page, before and formatting next add newline when not on last line of array
            if(scanRow+8 < this.ROW_COUNT){
                str = str + "\n";

                // Indent next lines to be even with the top-most line
                for(var indent=0; indent<spaceIndentCount; indent++){
                    str = str + " ";
                }
            }
        }

        // Finish up the array Python syntax and setup the framebuffer for the user to use
        str = str + "])";

        // Only output framebuffer if name was NOT found (don't want to do it twice++)
        if(!foundName){
            // str = str + "\n"  + varName + "FBuffer = FrameBuffer(bytearray(" + varName + "), " + this.COLUMN_COUNT.toString() + ", " + this.ROW_COUNT.toString() + ", MONO_VLSB)";
            // Keep track of the number of times bitmaps exported, used in name (but only when name was not found)
            this.BITMAP_EXPORT_COUNT++;
        }

        return str;
    }


    // Provided text (from the editor), search for '(' and ')' and extract text between them.
    // Once text extracted, split into array based on ',' and, turn each element into byte,
    // extract each bit and apply reverse algorithm than exporting to grid data. If fails at
    // any point returns 0, else 1
    importBitmap(selectedLines){
        // Check for Blockly error selection flags
        if(selectedLines == "NO BLOCK"){
            alert("Please select a [load sprite] block.");
            return 0;
        }
        // Check that lines exist, are not completely empty of characters
        if(selectedLines != undefined && selectedLines != ""){
            let arrayStartIndex = selectedLines.indexOf('[');
            let arrayEndIndex = selectedLines.indexOf(']');

            if(arrayStartIndex == -1 || arrayEndIndex == -1){
                alert("Could not find array start or end, please select the array including '(' or '[' and ')' or ']");
                return 0;   // Could not find either start or end of an array in selected
            }

            // Get everything between the start and end off the array
            var arrayContent = selectedLines.substring(arrayStartIndex+1, arrayEndIndex);

            // Split content of array by ',' or ', ' so each element is by itself
            var splitArrayContent = arrayContent.split(/,|, /);

            // Loop through and convert each element in array to int/byte
            var convertedArrayContent = [];
            for(var i=0; i<splitArrayContent.length; i++){
                convertedArrayContent[i] = parseInt(splitArrayContent[i], 10);
            }

            // Now try and find the shading array content, if any
            var convertedShadingContent = [];
            if (arrayEndIndex+2 < selectedLines.length) {
                var shadingText = selectedLines.substring(arrayEndIndex+1, selectedLines.length);
                let shadingStartIndex = shadingText.indexOf('[');
                let shadingEndIndex = shadingText.indexOf(']');
                if(shadingStartIndex != -1 && shadingEndIndex != -1){
                    var shadingContent = shadingText.substring(shadingStartIndex+1, shadingEndIndex);
                    var splitShadingContent = shadingContent.split(/,|, /);
                    for(var i=0; i<splitShadingContent.length; i++){
                        convertedShadingContent[i] = parseInt(splitShadingContent[i], 10);
                    }
                }
            }
            // Check the shading array is compatible, otherwise ignore
            if (convertedShadingContent.length && convertedArrayContent.length != convertedShadingContent.length) {
              alert("Ignoring detected shading data of incorrect length");
              convertedShadingContent = [];
            }

            // Before asking user for width,height, try to see if comment included with embedded information
            var bitmapWidth = 8;
            var bitmapHeight = 8;
            if(selectedLines.indexOf("# BITMAP: width: ") != -1 && selectedLines.indexOf(", height: ") != -1 && selectedLines.indexOf("\n") != -1){
                var widthEndHeightStartIndex = selectedLines.indexOf(", height: ");
                bitmapWidth = parseInt(selectedLines.substring(17, widthEndHeightStartIndex), 10);
                bitmapHeight = parseInt(selectedLines.substring(widthEndHeightStartIndex+10, selectedLines.indexOf("\n")), 10);
            }else{
                // Ask the user for the dimensions of the bitmap to import since that could be
                // else where in the code by now. If user cancels, stop import but dont anything
                bitmapWidth = prompt("Enter WIDTH of importing bitmap: ", 8);
                if(bitmapWidth == null){
                    return 0;   // User canceled
                }

                bitmapHeight = prompt("Enter HEIGHT of importing bitmap: ", 8);
                if(bitmapHeight == null){
                    return 0;   // User canceled
                }
                bitmapWidth = parseInt(bitmapWidth, 10);
                bitmapHeight = parseInt(bitmapHeight, 10);
            }

            // Don't set the row and column count yet or the grid data,
            // the user could have entered the wrong dimensions and this
            // fails
            var tempRowCount = bitmapHeight;
            var tempColumnCount = bitmapWidth;

            // Make sure entered dimensions are not too big, if so let user know and stop
            if(tempRowCount > this.BITMAP_HEIGHT_LIMIT || tempColumnCount > this.BITMAP_WIDTH_LIMIT){
                alert("Entered dimensions are too large, try again (WIDTH limit <= " + this.BITMAP_WIDTH_LIMIT + ", HEIGHT limit <=" + this.BITMAP_HEIGHT_LIMIT + ")");
                return 0;
            }

            // Make temp grid data array since dimensions could be wrong and data placement fails (saves user drawings already in grid, just in case)
            var tempGridData = new Array(tempRowCount).fill(this.BACKGROUND_VALUE).map(() => new Array(tempColumnCount).fill(this.BACKGROUND_VALUE));

            // Ask user if they are OK with going forward if some of the data in the array will not be accessed
            if((Math.ceil(tempRowCount/8)-1) * tempColumnCount + (tempColumnCount-1) < convertedArrayContent.length-1){
                if(!confirm("The entered/collected dimensions will not use all the data in the selected array, are you sure you want to continue? (if using comment to import width and height, review dimensions in comment)")){
                    return;
                }
            }

            // Loop through data from lines and vertically expand each byte to bits and place in webpage grid
            for(var dataRow=0,gridRow=0; dataRow<Math.ceil(tempRowCount/8); dataRow++, gridRow+=8){
                for(var column=0; column<tempColumnCount; column++){
                    // Get the 1D element using 2D loop values
                    var i = dataRow * tempColumnCount + column;

                    // Check to make sure index still in bounds of 1D array, otherwise error
                    if(i >= convertedArrayContent.length){
                        alert("Something went wrong, the input dimensions were most likely too long or the selected lines were not a valid array, try again");
                        return 0;
                    }

                    // Access the byte where each bit will come from
                    var byte = convertedArrayContent[i];
                    var shad = convertedShadingContent.length ? convertedShadingContent[i] : 0;

                    
                    for(var i=0; i<8 && gridRow+i < tempRowCount; i++){
                        var obyte = (byte & (1 << i)) === 0
                        var oshad = (shad & (1 << i)) === 0
                        tempGridData[gridRow+i][column] = ((obyte ? (oshad ? 0 : 2) : (oshad ? 1 : 3)));
                    }
                }
            }

            // Made it through setting that up, set internal values
            this.ROW_COUNT = tempRowCount;
            this.COLUMN_COUNT = tempColumnCount;

            // Update grid to grid size
            this.renderGrid();
            this.updatePanelTitle();

            for(var row=0; row<this.ROW_COUNT; row++){
                for(var col=0; col<this.COLUMN_COUNT; col++){
                    if(tempGridData[row][col] == 1){
                        document.getElementById(`gsc${(row * this.COLUMN_COUNT) + col}`).style.backgroundColor = "white";
                    }else if(tempGridData[row][col] == 3){
                        document.getElementById(`gsc${(row * this.COLUMN_COUNT) + col}`).style.backgroundColor = "lightgray";
                    }else if(tempGridData[row][col] == 2){
                        document.getElementById(`gsc${(row * this.COLUMN_COUNT) + col}`).style.backgroundColor = "darkgray";
                    }else{
                        document.getElementById(`gsc${(row * this.COLUMN_COUNT) + col}`).style.backgroundColor = "black";
                    }
                }
            }

        }else{
            alert("Either no lines were selected to import or too many lines were detected. Please only select one array and an optional width & height comment line");
            return 0;   // no line selected, lines empty
        }
    }
}

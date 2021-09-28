// Inspired by ~ http://jsfiddle.net/42dj7jy8/3/


class BITMAP_BUILDER{
    constructor(rowCount, columnCount, panelDivElemID){
        this.PANEL_DIV_ELEM_ID = panelDivElemID;

        // The starting size of the bitmap
        this.ROW_COUNT = rowCount;
        this.COLUMN_COUNT = columnCount;

        // The size of each cell/bitmap pixel (square) in pixels
        this.CELL_SIZE_PX = 28;

        // How many pixels to scale cell size by, on zoom event
        this.ZOOM_STEP_PX = 1.5;

        // Used to track number of times bitmaps exported, used to give each variable unique, 'enough', name
        this.BITMAP_EXPORT_COUNT = 0;

        // Set by setPanel() and used for setting title
        this.PANEL = undefined;

        // Don't show context menu on right click grid
        document.getElementById(this.PANEL_DIV_ELEM_ID).addEventListener("contextmenu", e => e. preventDefault());



        // Build bitmap build html
        this.PANEL_DIV = document.getElementById(this.PANEL_DIV_ELEM_ID);

        // Contains all bitmap builder elements
        this.INNER_PARENT_DIV = document.createElement("div");
        this.INNER_PARENT_DIV.classList.add("bitmap_builder_inner_parent");
        this.PANEL_DIV.appendChild(this.INNER_PARENT_DIV);


        // Contains all elements for the bitmap grid
        this.GRID_AREA_DIV = document.createElement("div");
        this.GRID_AREA_DIV.addEventListener('wheel', this.scrollZoom.bind(this));
        this.GRID_AREA_DIV.onmousemove = function(event){event.preventDefault()}    // Don't stop user from drawing if out of grid area
        this.GRID_AREA_DIV.classList.add("bitmap_builder_grid_area");
        this.INNER_PARENT_DIV.appendChild(this.GRID_AREA_DIV);

        this.GRID_DIV = document.createElement("div");
        this.GRID_DIV.classList.add("bitmap_builder_grid");
        this.GRID_DIV.title = "Draw with black by left-clicking cells and with white by right-clicking. Zoom in/out using left ctrl + scrollwheel"
        this.GRID_AREA_DIV.appendChild(this.GRID_DIV);


        // Contains all bitmap builder button elements
        this.BUTTON_AREA_DIV = document.createElement("div");
        this.BUTTON_AREA_DIV.classList.add("bitmap_builder_button_area");
        this.INNER_PARENT_DIV.appendChild(this.BUTTON_AREA_DIV);

        this.SET_WIDTH_BTN = document.createElement("button");
        this.SET_WIDTH_BTN.textContent = "Set Width";
        this.SET_WIDTH_BTN.onclick = this.setWidth.bind(this);
        this.SET_WIDTH_BTN.classList.add("bitmap_builder_button");
        this.BUTTON_AREA_DIV.appendChild(this.SET_WIDTH_BTN);

        this.ZOOM_IN_BTN = document.createElement("button");
        this.ZOOM_IN_BTN.textContent = "Z+";
        this.ZOOM_IN_BTN.onclick = this.zoomIn.bind(this);
        this.ZOOM_IN_BTN.classList.add("bitmap_builder_button");
        this.ZOOM_IN_BTN.title = "Zoom in on the bitmap (left ctrl + scroll wheel forward/up)"
        this.BUTTON_AREA_DIV.appendChild(this.ZOOM_IN_BTN);

        this.ZOOM_OUT_BTN = document.createElement("button");
        this.ZOOM_OUT_BTN.textContent = "Z-";
        this.ZOOM_OUT_BTN.onclick = this.zoomOut.bind(this);
        this.ZOOM_OUT_BTN.classList.add("bitmap_builder_button");
        this.ZOOM_OUT_BTN.title = "Zoom out on the bitmap (left ctrl + scroll wheel backwards/down)"
        this.BUTTON_AREA_DIV.appendChild(this.ZOOM_OUT_BTN);

        this.IMPORT_LINES_CALLBACK = undefined;
        this.IMPORT_LINES_BTN = document.createElement("button");
        this.IMPORT_LINES_BTN.textContent = "Import Lines";
        this.IMPORT_LINES_BTN.classList.add("bitmap_builder_button");
        this.BUTTON_AREA_DIV.appendChild(this.IMPORT_LINES_BTN);

        this.SET_HEIGHT_BTN = document.createElement("button");
        this.SET_HEIGHT_BTN.textContent = "Set Height";
        this.SET_HEIGHT_BTN.onclick = this.setHeight.bind(this);
        this.SET_HEIGHT_BTN.classList.add("bitmap_builder_button");
        this.BUTTON_AREA_DIV.appendChild(this.SET_HEIGHT_BTN);

        this.INVERT_BTN = document.createElement("button");
        this.INVERT_BTN.textContent = "Invert";
        this.INVERT_BTN.onclick = this.invertCells.bind(this);
        this.INVERT_BTN.classList.add("bitmap_builder_button");
        this.BUTTON_AREA_DIV.appendChild(this.INVERT_BTN);

        this.CLEAR_BTN = document.createElement("button");
        this.CLEAR_BTN.textContent = "Clear";
        this.CLEAR_BTN.onclick = this.clearCells.bind(this);
        this.CLEAR_BTN.classList.add("bitmap_builder_button");
        this.BUTTON_AREA_DIV.appendChild(this.CLEAR_BTN);

        this.EXPORT_LINES_CALLBACK = undefined;
        this.EXPORT_LINES_BTN = document.createElement("button");
        this.EXPORT_LINES_BTN.textContent = "Export Lines";
        this.EXPORT_LINES_BTN.classList.add("bitmap_builder_button");
        this.BUTTON_AREA_DIV.appendChild(this.EXPORT_LINES_BTN);

        // Render grid for the first time
        this.renderGrid();

        this.restoreFromLocally();
    }


    restoreFromLocally(){
        var rowCount = localStorage.getItem("ROW_COUNT");
        var colCount = localStorage.getItem("COL_COUNT");
        var cellValues = localStorage.getItem("CELL_VALUES");
        var cellPxSize = localStorage.getItem("CELL_SIZE_PX");

        if(rowCount != null && colCount != null && cellValues != null && cellPxSize != null){
            this.ROW_COUNT = parseInt(rowCount);
            this.COLUMN_COUNT = parseInt(colCount);
            this.CELL_SIZE_PX = parseInt(cellPxSize);
            this.renderGrid();

            cellValues = cellValues.split(',');

            var cells = this.GRID_DIV.children;
            for (var i = 0; i < cells.length; i++) {
                var cell = cells[i];
                if(cellValues[i] == "1"){
                    cell.style.backgroundColor = "white";
                }else if(cellValues[i] == "0"){
                    cell.style.backgroundColor = "black";
                }
            }
        }
    }


    saveLocally(){
        localStorage.setItem("ROW_COUNT", this.ROW_COUNT);
        localStorage.setItem("COL_COUNT", this.COLUMN_COUNT);
        localStorage.setItem("CELL_SIZE_PX", this.CELL_SIZE_PX);

        var cellValues = [];

        var cells = this.GRID_DIV.children;
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            if(cell.style.backgroundColor == "white"){
                cellValues.push(1);
            }else{
                cellValues.push(0);
            }
        }
        localStorage.setItem("CELL_VALUES", cellValues);
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


    // Clears grid back to white
    clearCells(){
        var cells = this.GRID_DIV.children;
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            cell.style.backgroundColor = "white";
        }
    }


    invertCells(){
        var cells = this.GRID_DIV.children;
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            if(cell.style.backgroundColor == "black"){
                cell.style.backgroundColor = "white";
            }else{
                cell.style.backgroundColor = "black";
            }
        }
    }


    // Asks user for number, makes sure valid, updates grid and title
    setWidth(){
        var newWidth = prompt("Enter a new bitmap width: ", 8);
        if(newWidth != null){
            newWidth = parseInt(newWidth);
            if(newWidth != NaN){
                if(newWidth >= 1 && newWidth <= 72){
                    this.COLUMN_COUNT = newWidth;
                    this.updatePanelTitle();
                    this.renderGrid();
                    this.saveLocally();
                }else{
                    alert("That seems wrong! Width can be from 1 to 72.")
                }
            }
        }
    }

     // Asks user for number, makes sure valid, updates grid and title
     setHeight(){
        var newHeight = prompt("Enter a new bitmap height: ", 8);
        if(newHeight != null){
            newHeight = parseInt(newHeight);
            if(newHeight != NaN){
                if(newHeight >= 1 && newHeight <= 40){
                    this.ROW_COUNT = newHeight;
                    this.updatePanelTitle();
                    this.renderGrid();
                    this.saveLocally();
                }else{
                    alert("That seems wrong! Height can be from 1 to 40.")
                }
            }
        }
    }


    updatePanelTitle(){
        if(this.PANEL){
            this.PANEL.setTitle("Bitmap Builder: " + this.COLUMN_COUNT + " x " + this.ROW_COUNT);
        }else{
            console.log("No panel");
        }
    }


    // Provided the main dock manager from dock-spawn-ts, find bitmap panel and set it in this module
    autoSetPanel(dockManager){
        var allPanels = dockManager.getPanels();
        for(var i=0; i<allPanels.length; i++){
            if(allPanels[i].elementContent.id == this.PANEL_DIV_ELEM_ID){
                this.setPanel(allPanels[i]);
            }
        }
    }


    // Provided a panel drom dock-spawn-ts, set the panel and update the title
    setPanel(panel){
        this.PANEL = panel;
        this.updatePanelTitle();
    }


    cellLeftClickCallback(cell){
        cell.style.backgroundColor = "black";
        this.saveLocally();
    }

    cellRightClickCallback(cell){
        cell.style.backgroundColor = "white";
        this.saveLocally();
    }


    cellHoverCallback(cell, event){
        event.preventDefault();
        if(event.buttons == 1){
            cell.style.backgroundColor = "black";
            this.saveLocally();
        }else if(event.buttons == 2){
            cell.style.backgroundColor = "white";
            this.saveLocally();
        }
    }


    updateCellSizes(){
        var cells = this.GRID_DIV.children;
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            cell.style.width = this.CELL_SIZE_PX.toString() + "px";
            cell.style.height = this.CELL_SIZE_PX.toString() + "px";
            cell.style.minWidth = this.CELL_SIZE_PX.toString() + "px";
            cell.style.minHeight = this.CELL_SIZE_PX.toString() + "px";
        }
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
        this.CELL_SIZE_PX = this.CELL_SIZE_PX + this.ZOOM_STEP_PX;
        this.updateCellSizes();
        this.saveLocally();
    }


    // Make each grid pixel smaller and re-render grid
    zoomOut(){
        if(this.CELL_SIZE_PX - this.ZOOM_STEP_PX < 1){
            this.CELL_SIZE_PX = 1;
        }else{
            this.CELL_SIZE_PX = this.CELL_SIZE_PX - this.ZOOM_STEP_PX;
        }
        this.updateCellSizes();
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
            if(document.getElementById(i.toString()) == undefined){
                var cell = document.createElement("div");
                cell.id = i.toString();
                cell.className = "bitmap_grid_cell";

                cell.style.backgroundColor = "white";

                cell.style.width = this.CELL_SIZE_PX.toString() + "px";
                cell.style.height = this.CELL_SIZE_PX.toString() + "px";
                cell.style.minWidth = this.CELL_SIZE_PX.toString() + "px";
                cell.style.minHeight = this.CELL_SIZE_PX.toString() + "px";

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
        // (meaning just the array selected) then use existing name from editor (splits into 2 elements).
        // Also ensure no newlines before the equals because that means user has selected line before name
        // and now don't know where start of name is otherwise
        if( selectedLines != undefined && selectedLines != "" && 
            selectedLines != " " && selectedLines != "\n" && 
            selectedLines.indexOf('=') != -1 && selectedLines.split("=").length == 2 && 
            (selectedLines.indexOf('\n') == -1 || selectedLines.indexOf('\n') > selectedLines.indexOf('='))){

            // Do one more check, th
            var startExtractNameIndex = 0;
            var endExtractNameIndex = selectedLines.indexOf('=') - 1;   // Get rid of the space at the end, it will be readded
            varName = selectedLines.substring(startExtractNameIndex, endExtractNameIndex);
            foundName = true;
        }else{
            // just use the default generated name since no names were found
            varName = varName + this.BITMAP_EXPORT_COUNT.toString();    // Add index to make name unqiue when a name was NOT found

            // Add dimensions of bitmap to a comment above the buffer (if selected on import, will use these instead of asking user), only on not finding name
            str = str + "# BITMAP: width: " + this.COLUMN_COUNT.toString() + ", height: " + this.ROW_COUNT.toString() + "\n";
        }

        // Start the actual array
        str = str + varName + " = (";

        // Track number of spaces needed to offset (EX spaces needed = len('bitmap33 = (')))
        var spaceIndentCount = (varName + " = (").length;

        // Loop through grid data in pages COLUMN_COUNT long but 8 thick (each column of 8 is a byte for buffer)
        for(var scanRow=0; scanRow<this.ROW_COUNT; scanRow+=8){
            for(var column=0; column<this.COLUMN_COUNT; column++){

                // Byte for column where each bit will be set from grid data
                var byte = 0;
                
                // Make the byte
                for(var i=0; i<8 && scanRow+i < this.ROW_COUNT; i++){
                    var value = document.getElementById( ((scanRow+i) * this.COLUMN_COUNT) + column).style.backgroundColor;
                    if(value == "white"){
                        value = 1;
                    }else{
                        value = 0;
                    }

                    byte = byte | value<<i;
                }

                // Add the byte to Python array string
                str = str + byte.toString();

                // As long not at last postion in array to print, add a comma after each entry
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
        str = str + ")";

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
        // Check that lines exist, are not completly empty of characters
        if(selectedLines != undefined && selectedLines != "" && selectedLines.split("=").length == 2){
            // Get what should be start and end of array
            var arrayStartIndex = selectedLines.indexOf('(');
            var arrayEndIndex = selectedLines.indexOf(')');

            if(arrayStartIndex == -1 || arrayEndIndex == -1){
                alert("Could not find array start or end, please select the array including '(' and ')'");
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
            if(tempRowCount > 40 || tempColumnCount > 72){
                alert("Entered dimensions are too large, try again (WIDTH limit <= 72, HEIGHT limit <= 40)");
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
                    // Get the 1D element usign 2D loop values
                    var i = dataRow * tempColumnCount + column;

                    // Check to make sure index still in bounds of 1D array, otherwise error
                    if(i >= convertedArrayContent.length){
                        alert("Something went wrong, the input dimensions were most likely too long or the selected lines were not a valid array, try again");
                        return 0;
                    }

                    // Access the byte where each bit will come from
                    var byte = convertedArrayContent[i];
                    
                    for(var i=0; i<8 && gridRow+i < tempRowCount; i++){
                        tempGridData[gridRow+i][column] = (((byte & (1 << i)) === 0 ? 0 : 1));
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
                        document.getElementById( (row * this.COLUMN_COUNT) + col).style.backgroundColor = "white";
                    }else{
                        document.getElementById( (row * this.COLUMN_COUNT) + col).style.backgroundColor = "black";
                    }
                }
            }

        }else{
            alert("Either no lines were selected to import or too many lines were detected. Please only select one array and an optional width & height comment line");
            return 0;   // no line sselected, lines empty
        }
    }
}

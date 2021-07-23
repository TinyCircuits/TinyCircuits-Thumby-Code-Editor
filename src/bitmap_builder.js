// http://jsfiddle.net/42dj7jy8/3/


class BITMAP_BUILDER{
    constructor(rowCount, columnCount){
        // The size of each cell/bitmap pixel (square) in pixels
        this.CELL_SIZE_PX = 28;

        // HOw many pixels to scale cell size by on zoom event
        this.ZOOM_STEP_PX = 5;

        // Used to track number of times bitmaps exported, used to give each variable unqiue, 'enough', name
        this.BITMAP_EXPORT_COUNT = 0;

        // Make grid data object (2D)
        this.GRID_DATA = undefined;

        // The value that fiils the background is 1 by default, changes when user inverts
        this.BACKGROUND_VALUE = 1;

        // Number of rows and columns to start out with
        this.setGridSize(rowCount, columnCount);

        // Render grid for the first time
        this.renderGrid();

        // Don't show context menu on right click grid
        document.getElementById("bitmapbuildergrid").addEventListener("contextmenu", e => e. preventDefault());

        this.CURRENT_BUTTON = 0;
        this.HAS_HOVER_CHANGED = false;
    }


    // Set the number of rows and columns the grid should have when it renders
    setGridSize(rowCount, columnCount){
        // Keep track of old sizes so old array can be copied to new
        var oldRowCount = this.ROW_COUNT;
        var oldColumnCount = this.COLUMN_COUNT;

        // Assign the new dimensions to underlying objects
        this.ROW_COUNT = parseInt(rowCount, 10);
        this.COLUMN_COUNT = parseInt(columnCount, 10);

        // Before copying, make sure new sizes are not smaller than old,
        // if true, use new sizes and copy only part of old grid to new
        if(this.ROW_COUNT < oldRowCount){
            oldRowCount = this.ROW_COUNT;
        }
        if(this.COLUMN_COUNT < oldColumnCount){
            oldColumnCount = this.COLUMN_COUNT;
        }
        
        // Make new blank grid of new size (blank = 0 or 1)
        var newGrid = new Array(this.ROW_COUNT).fill(this.BACKGROUND_VALUE).map(() => new Array(this.COLUMN_COUNT).fill(this.BACKGROUND_VALUE));

        // Copy old array to new at 0,0 to old,old (or to new,new if new < old)
        for(var row=0; row<oldRowCount; row++){
            for(var column=0; column<oldColumnCount; column++){
                newGrid[row][column] = this.GRID_DATA[row][column];
            }
        }
        this.GRID_DATA = newGrid;
    }


    clearGrid(){
        this.GRID_DATA = new Array(this.ROW_COUNT).fill(this.BACKGROUND_VALUE).map(() => new Array(this.COLUMN_COUNT).fill(this.BACKGROUND_VALUE));
    }


    // Toggle each 'bit' of the grid
    invertGrid(){
        for(var row=0; row<this.ROW_COUNT; row++){
            for(var column=0; column<this.COLUMN_COUNT; column++){
                if(this.GRID_DATA[row][column] == 0){
                    this.GRID_DATA[row][column] = 1;
                }else{
                    this.GRID_DATA[row][column] = 0;
                }
            }
        }

        // Also invert current background color value (used for re-sizing grid)
        if(this.BACKGROUND_VALUE == 0){
            this.BACKGROUND_VALUE = 1;
        }else{
            this.BACKGROUND_VALUE = 0;
        }
    }


    // Delete/clear grid and then re-build using GRID_DATA
    renderGrid(){
        // Delete/clear grid (NOTE, this element has onmouseout function that refers to this
        // module to make cursor stop drawing when exits grid!)
        document.getElementById('bitmapbuildergrid').innerHTML = "";

        var rows = [];
        var colStr = null;
        for(var row = 0; row < this.ROW_COUNT; row++) {
            colStr = "";
            for (var column = 0; column < this.COLUMN_COUNT; column++){

                // Set color of cell in grid depending on underlying value of data at cell position
                var cellColor = " style=\"background-color:white;";
                if(this.GRID_DATA[row][column] == 0){
                    cellColor = " style=\"background-color:black;";
                }

                var cellPxSizeStr = this.CELL_SIZE_PX.toString();
                var cellSize =  "width:" + cellPxSizeStr + "px;" +
                                "height:" + cellPxSizeStr + "px;" +
                                "min-width:" + cellPxSizeStr + "px;" +
                                "min-height:" + cellPxSizeStr + "px;\"";

                // Each cell refers to global class object in main.js for button clicks
                var cellRowColumn = row.toString() + ',' + column.toString();
                var cell =  '<td onmouseover=\"BITMAPPER.handleHover(event, this, 0, ' + cellRowColumn + ')\" onmouseout=\"BITMAPPER.handleHover(event, this, 1, ' + cellRowColumn + ')\" onmousedown=\"BITMAPPER.handleCellClick(event, '+ cellRowColumn +')\" onmouseup=BITMAPPER.handleClickDone(event)' + cellColor + cellSize + '>' + '</td>';

                colStr += cell;
            };
            rows.push('<tr>' + colStr + '</tr>');
        }

        document.getElementById('bitmapbuildergrid').innerHTML += rows.join("");
    }


    // Each button calls this from main.js with their row and column numbers (nor strs)
    handleCellClick(event, row, column){

        if(event.buttons == 1){
            this.GRID_DATA[row][column] = 0;
            this.CURRENT_BUTTON = 1;
        }else if(event.buttons == 2){
            this.GRID_DATA[row][column] = 1;
            this.CURRENT_BUTTON = 2;
        }
        this.renderGrid();
    }


    // For when mouse buttons are let go
    handleClickDone(event){
        this.CURRENT_BUTTON = 0;
    }


    // onmouseout doesn't work for the grid since it fires when moves
    // is moves to cells, calculate and check manually
    checkCursorInside(event, element, gridID){
        element = document.getElementById(gridID);
        var rect = element.getBoundingClientRect();

        // Check if outside, if true, stop drawing until a new click happens
        if (event.clientX < rect.left || event.clientX > rect.right &&
            event.clientY < rect.top || event.clientY > rect.bottom) {
            this.CURRENT_BUTTON = 0;
            this.renderGrid();
        }
    }


    // Handle color change of cells since modifying style removes hover from css
    handleHover(event, element, on_out, row, column){
        event.preventDefault();

        // Set the cell's color on hover
        if(element.style.backgroundColor == "white"){
            element.style.backgroundColor = "rgb(200, 200, 200)";
        }else if(element.style.backgroundColor == "rgb(200, 200, 200)"){
            element.style.backgroundColor = "white";
        }

        if(element.style.backgroundColor == "black"){
            element.style.backgroundColor = "rgb(55, 55, 55)";
        }else if(element.style.backgroundColor == "rgb(55, 55, 55)"){
            element.style.backgroundColor = "black";
        }

        // If left click down and cursor just started to hover cell, user
        // is drawing, overwrite bits
        if(on_out == 0){

            // Only do stuff on hover if a button is pressed
            if(this.CURRENT_BUTTON != 0){
                if(this.CURRENT_BUTTON == 1){
                    this.GRID_DATA[row][column] = 0;
                }else if(this.CURRENT_BUTTON == 2){
                    this.GRID_DATA[row][column] = 1;
                }

                // Only render again when cursor moves from cell to cell
                if(this.HAS_HOVER_CHANGED){
                    this.HAS_HOVER_CHANGED = false;
                    this.renderGrid();
                }
            }
        }else{
            // This function was called from either onhover or hoverout, if
            // it was not onhover, then that means the cursor moved from cell
            // to cell
            this.HAS_HOVER_CHANGED = true;
        }
    }


    // Make each grid pixel larger and re-render grid
    zoomIn(){
        this.CELL_SIZE_PX = this.CELL_SIZE_PX + this.ZOOM_STEP_PX;
        this.renderGrid();
    }


    // Make each grid pixel smaller and re-render grid
    zoomOut(){
        if(this.CELL_SIZE_PX - this.ZOOM_STEP_PX < 1){
            this.CELL_SIZE_PX = 1;
        }else{
            this.CELL_SIZE_PX = this.CELL_SIZE_PX - this.ZOOM_STEP_PX;
        }
        this.renderGrid();
    }


    // Builds bytes from bitmap data to build buffer using editor wrapper.
    // Allow selected lines to be passed so that highlited code can be used
    // to find a variable name (this way not always needing to re-type)
    exportBitmap(selectedLines){
        
        // This is the default, will try to look at selected lines and 
        // see if var name that can be used. If one can be used, will
        // overwrite and not output framebuffer line
        var varName = "bitmap";
        var foundName = false;  // Used to set true so framebuffer line not output if name found

        // String that holds all export information for editor
        var str = "";

        // If selected lines dones't equal any of the below, and there is only one equals sign 
        // (meaning just the array selected) then use existing name from editor (splits into 2 elements)
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
        console.log(varName);

        // Loop through grid data in pages COLUMN_COUNT long but 8 thick (each column of 8 is a byte for buffer)
        for(var scanRow=0; scanRow<this.ROW_COUNT; scanRow+=8){
            for(var column=0; column<this.COLUMN_COUNT; column++){

                // Byte for column where each bit will be set from grid data
                var byte = 0;
                
                // Make the byte
                for(var i=0; i<8 && scanRow+i < this.ROW_COUNT; i++){
                    byte = byte | this.GRID_DATA[scanRow+i][column]<<i;
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
            str = str + "\n"  + varName + "FBuffer = FrameBuffer(bytearray(" + varName + "), " + this.COLUMN_COUNT.toString() + ", " + this.ROW_COUNT.toString() + ", MONO_VLSB)";
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
            this.GRID_DATA = tempGridData;
        }else{
            alert("Either no lines were selected to import or too many lines were detected. Please only select one array (0~255 elements) and an optional width & height comment line");
            return 0;   // no line sselected, lines empty
        }
    }
}
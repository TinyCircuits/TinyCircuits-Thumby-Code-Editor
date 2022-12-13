// Constructor
class Importer{
    constructor(openBtn, onExportToEditor){
        // Reference for functions that are defined outside this module (likely main.js)
        this.onExportToEditor = onExportToEditor;

        this.openBtn = openBtn;
        this.inited = false;
        this.initOpenClose();
    }


    // Function used to init module (called by show()), only init once per page load
    init(){
        if(this.inited == false){
            console.log("Sprite importer opened for the first time!");
            this.inited = true;
            this.initUI();
            this.initScroll();
        }
    }


    initUI(){

        // Overlay to hide teh IDE a bit
        this.PAGE_OVERLAY_DIV = document.createElement("div");
        this.PAGE_OVERLAY_DIV.classList = "page_sprite_overlay";
        document.body.appendChild(this.PAGE_OVERLAY_DIV);

        // Main background overlay
        this.OVERLAY_DIV = document.createElement("div");
        this.OVERLAY_DIV.classList = "sprite_overlay";
        document.body.appendChild(this.OVERLAY_DIV);

        this.EXIT_BTN = document.createElement("button");
        this.EXIT_BTN.classList = "uk-button uk-button-primary uk-text-small sprite_exit_button";
        this.EXIT_BTN.textContent = "CLOSE";
        this.EXIT_BTN.onclick = (event) => {this.hide();};
        this.OVERLAY_DIV.appendChild(this.EXIT_BTN);

        // Main window for sprite sheet
        this.SHEET_PARENT_DIV = document.createElement("div");
        this.SHEET_PARENT_DIV.classList = "sheet_parent";
        this.OVERLAY_DIV.appendChild(this.SHEET_PARENT_DIV);

        this.IMAGE_SIZE_DIV = document.createElement("div");
        this.IMAGE_SIZE_DIV.classList = "sprite_image_size";
        this.SHEET_PARENT_DIV.appendChild(this.IMAGE_SIZE_DIV);

        this.SPRITE_SHEET_CANVAS_PARENT = document.createElement("div");
        this.SPRITE_SHEET_CANVAS_PARENT.classList = "sprite_sheet_canvas_parent";
        this.SHEET_PARENT_DIV.appendChild(this.SPRITE_SHEET_CANVAS_PARENT);

        // Canvas and context for showing sprite sheet
        this.SPRITE_SHEET_CANVAS = document.createElement("canvas");
        this.SPRITE_SHEET_CANVAS.classList = "sprite_sheet_canvas";
        this.SPRITE_SHEET_CANVAS_PARENT.appendChild(this.SPRITE_SHEET_CANVAS);
        this.SPRITE_SHEET_CANVAS_CONTEXT = this.SPRITE_SHEET_CANVAS.getContext('2d');

        // Window for showing individual sprite sheet frames
        this.SHEET_SCROLL_PARENT_DIV = document.createElement("div");
        this.SHEET_SCROLL_PARENT_DIV.classList = "sheet_scroll_parent";
        this.OVERLAY_DIV.appendChild(this.SHEET_SCROLL_PARENT_DIV);

        // Window for containing all buttons and dropdown elements
        this.BUTTON_OVERALL_PARENT_DIV = document.createElement("div");
        this.BUTTON_OVERALL_PARENT_DIV.classList = "button_overall_parent";
        this.OVERLAY_DIV.appendChild(this.BUTTON_OVERALL_PARENT_DIV);

        
        // Method to reduce code size
        function addInputRowTo(to, text, input){
            var row = document.createElement("div");
            row.classList = "sheet_input_row";
            to.appendChild(row);

            var label = document.createElement("div");
            label.classList = "sheet_label";
            label.textContent = text;
            row.appendChild(label);
            row.appendChild(input);
        }

        function addRangeRowTo(to, text, input){
            var row = document.createElement("div");
            row.classList = "sheet_input_range_row_column";
            to.appendChild(row);

            var label = document.createElement("div");
            label.classList = "sheet_range_label";
            label.textContent = text;
            row.appendChild(label);

            var rowRange = document.createElement("div");
            rowRange.classList = "sheet_input_range_row";
            row.appendChild(rowRange);

            var bubble = document.createElement("div");
            bubble.classList = "sheet_range_input_bubble";
            bubble.textContent = "NULL";

            rowRange.appendChild(input);
            rowRange.appendChild(bubble);

            return bubble;
        }


        var FRAME_GROUP = document.createElement("div");
        FRAME_GROUP.classList = "input_group_common";
        FRAME_GROUP.style.gridColumn = "1 / 1";
        this.BUTTON_OVERALL_PARENT_DIV.appendChild(FRAME_GROUP);

        this.FRAME_WIDTH_INPUT = document.createElement("input");
        this.FRAME_WIDTH_INPUT.classList = "uk-input sheet_input";
        this.FRAME_WIDTH_INPUT.type = "number";
        this.FRAME_WIDTH_INPUT.value = 8;
        this.FRAME_WIDTH_INPUT.title = "Set the width (pixels) for each frame on the sprite sheet";
        this.FRAME_WIDTH_INPUT.oninput = (event) => {this.onInputUpdate(event, this.FRAME_WIDTH_INPUT, 0);};
        addInputRowTo(FRAME_GROUP, "Frame width (px):", this.FRAME_WIDTH_INPUT);

        this.FRAME_HEIGHT_INPUT = document.createElement("input");
        this.FRAME_HEIGHT_INPUT.classList = "uk-input sheet_input";
        this.FRAME_HEIGHT_INPUT.type = "number";
        this.FRAME_HEIGHT_INPUT.value = 8;
        this.FRAME_HEIGHT_INPUT.title = "Set the height (pixels) for each frame on the sprite sheet";
        this.FRAME_HEIGHT_INPUT.oninput = (event) => {this.onInputUpdate(event, this.FRAME_HEIGHT_INPUT, 0);};
        addInputRowTo(FRAME_GROUP, "Frame height (px):", this.FRAME_HEIGHT_INPUT);

        this.FRAME_COUNT_X_INPUT = document.createElement("input");
        this.FRAME_COUNT_X_INPUT.classList = "uk-input sheet_input";
        this.FRAME_COUNT_X_INPUT.type = "number";
        this.FRAME_COUNT_X_INPUT.value = 4;
        this.FRAME_COUNT_X_INPUT.title = "Set the number of frames on the sprite sheet in the X direction (left to right)";
        this.FRAME_COUNT_X_INPUT.oninput = (event) => {this.onInputUpdate(event, this.FRAME_COUNT_X_INPUT, 0);};
        addInputRowTo(FRAME_GROUP, "X frame count:", this.FRAME_COUNT_X_INPUT);

        this.FRAME_COUNT_Y_INPUT = document.createElement("input");
        this.FRAME_COUNT_Y_INPUT.classList = "uk-input sheet_input";
        this.FRAME_COUNT_Y_INPUT.type = "number";
        this.FRAME_COUNT_Y_INPUT.value = 4;
        this.FRAME_COUNT_Y_INPUT.title = "Set the number of frames on the sprite sheet in the Y direction (top to bottom)";
        this.FRAME_COUNT_Y_INPUT.oninput = (event) => {this.onInputUpdate(event, this.FRAME_COUNT_Y_INPUT, 0);};
        addInputRowTo(FRAME_GROUP, "Y frame count:", this.FRAME_COUNT_Y_INPUT);


        var GRID_GROUP = document.createElement("div");
        GRID_GROUP.classList = "input_group_common";
        GRID_GROUP.style.gridColumn = "2 / 2";
        this.BUTTON_OVERALL_PARENT_DIV.appendChild(GRID_GROUP);

        this.GRID_OFFSET_X_INPUT = document.createElement("input");
        this.GRID_OFFSET_X_INPUT.classList = "uk-input sheet_input";
        this.GRID_OFFSET_X_INPUT.type = "number";
        this.GRID_OFFSET_X_INPUT.value = 0;
        this.GRID_OFFSET_X_INPUT.title = "Set the offset (pixels) from the left for the entire frame grid";
        this.GRID_OFFSET_X_INPUT.oninput = (event) => {this.updateCanvas();};
        addInputRowTo(GRID_GROUP, "X grid offset (px):", this.GRID_OFFSET_X_INPUT);

        this.GRID_OFFSET_Y_INPUT = document.createElement("input");
        this.GRID_OFFSET_Y_INPUT.classList = "uk-input sheet_input";
        this.GRID_OFFSET_Y_INPUT.type = "number";
        this.GRID_OFFSET_Y_INPUT.value = 0;
        this.GRID_OFFSET_Y_INPUT.title = "Set the offset (pixels) from the top for the entire frame grid";
        this.GRID_OFFSET_Y_INPUT.oninput = (event) => {this.updateCanvas();};
        addInputRowTo(GRID_GROUP, "Y grid offset (px):", this.GRID_OFFSET_Y_INPUT);

        this.GRID_COL_GAP_INPUT = document.createElement("input");
        this.GRID_COL_GAP_INPUT.classList = "uk-input sheet_input";
        this.GRID_COL_GAP_INPUT.type = "number";
        this.GRID_COL_GAP_INPUT.value = 0;
        this.GRID_COL_GAP_INPUT.title = "Set the gap (pixels) between frames in the X direction (left to right)";
        this.GRID_COL_GAP_INPUT.oninput = (event) => {this.updateCanvas();};
        addInputRowTo(GRID_GROUP, "X grid gap (px):", this.GRID_COL_GAP_INPUT);

        this.GRID_ROW_GAP_INPUT = document.createElement("input");
        this.GRID_ROW_GAP_INPUT.classList = "uk-input sheet_input";
        this.GRID_ROW_GAP_INPUT.type = "number";
        this.GRID_ROW_GAP_INPUT.value = 0;
        this.GRID_ROW_GAP_INPUT.title = "Set the gap (pixels) between frames in the Y direction (top to bottom)";
        this.GRID_ROW_GAP_INPUT.oninput = (event) => {this.updateCanvas();};
        addInputRowTo(GRID_GROUP, "Y grid gap (px):", this.GRID_ROW_GAP_INPUT);


        var BUTTON_GROUP = document.createElement("div");
        BUTTON_GROUP.classList = "input_group_common";
        BUTTON_GROUP.style.gridColumn = "3 / 3";
        this.BUTTON_OVERALL_PARENT_DIV.appendChild(BUTTON_GROUP);

        this.OPEN_SHEET_IMAGE_BTN = document.createElement("button");
        this.OPEN_SHEET_IMAGE_BTN.className = "uk-button uk-button-primary uk-button-small uk-text-small sheet_button";
        this.OPEN_SHEET_IMAGE_BTN.textContent = "OPEN SHEET IMAGE";
        this.OPEN_SHEET_IMAGE_BTN.title = "Open an image file (.png, .jpg, etc.) containing sprites on a grid (a sprite sheet)";
        this.OPEN_SHEET_IMAGE_BTN.onclick = (event) => {this.openSheetImage();}
        BUTTON_GROUP.appendChild(this.OPEN_SHEET_IMAGE_BTN);

        // this.SAVE_SHEET_IMAGE_BTN = document.createElement("button");
        // this.SAVE_SHEET_IMAGE_BTN.className = "uk-button uk-button-primary uk-button-small uk-text-small sheet_button";
        // this.SAVE_SHEET_IMAGE_BTN.textContent = "SAVE SHEET IMAGE";
        // this.SAVE_SHEET_IMAGE_BTN.title = "Save an image file (.png, .jpg, etc.) of the currently displayed sprite sheet";
        // BUTTON_GROUP.appendChild(this.SAVE_SHEET_IMAGE_BTN);




        // this.IMPORT_DROPDOWN_TOGGLE = document.createElement("button");
        // this.IMPORT_DROPDOWN_TOGGLE.className = "uk-button uk-button-primary uk-button-small uk-text-small sheet_button";
        // this.IMPORT_DROPDOWN_TOGGLE.innerHTML = "IMPORT DATA &larr;";
        // BUTTON_GROUP.appendChild(this.IMPORT_DROPDOWN_TOGGLE);

        // this.IMPORT_DROPDOWN = document.createElement("div");
        // this.IMPORT_DROPDOWN.setAttribute("uk-dropdown", "mode: click; offset: 0; delay-hide: 200");
        // BUTTON_GROUP.appendChild(this.IMPORT_DROPDOWN);

        // this.IMPORT_DROPDOWN_UL = document.createElement("div");
        // this.IMPORT_DROPDOWN_UL.classList = "uk-nav uk-dropdown-nav";
        // this.IMPORT_DROPDOWN.appendChild(this.IMPORT_DROPDOWN_UL);

        // var listElem = document.createElement("li");
        // this.IMPORT_FROM_CLIPBOARD_BTN = document.createElement("button");
        // this.IMPORT_FROM_CLIPBOARD_BTN.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap sprite_export_btn";
        // this.IMPORT_FROM_CLIPBOARD_BTN.textContent = "From Clipboard";
        // this.IMPORT_FROM_CLIPBOARD_BTN.title = "Import sprite sheet data from clipboard from a MicroPython bytearray (copy lines and paste here)";
        // this.IMPORT_FROM_CLIPBOARD_BTN.onclick = (event) => {
        //     this.importFromClipboard();
        // }
        // listElem.appendChild(this.IMPORT_FROM_CLIPBOARD_BTN);
        // this.IMPORT_DROPDOWN_UL.appendChild(listElem);



        this.EXPORT_DROPDOWN_TOGGLE = document.createElement("button");
        this.EXPORT_DROPDOWN_TOGGLE.className = "uk-button uk-button-primary uk-button-small uk-text-small sheet_button";
        this.EXPORT_DROPDOWN_TOGGLE.innerHTML = "EXPORT DATA &rarr;";
        BUTTON_GROUP.appendChild(this.EXPORT_DROPDOWN_TOGGLE);

        this.EXPORT_DROPDOWN = document.createElement("div");
        this.EXPORT_DROPDOWN.setAttribute("uk-dropdown", "mode: click; offset: 0; delay-hide: 200");
        BUTTON_GROUP.appendChild(this.EXPORT_DROPDOWN);

        this.EXPORT_DROPDOWN_UL = document.createElement("div");
        this.EXPORT_DROPDOWN_UL.classList = "uk-nav uk-dropdown-nav";
        this.EXPORT_DROPDOWN.appendChild(this.EXPORT_DROPDOWN_UL);

        var listElem = document.createElement("li");
        this.EXPORT_TO_CLIPBOARD_BTN = document.createElement("button");
        this.EXPORT_TO_CLIPBOARD_BTN.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap sprite_export_btn";
        this.EXPORT_TO_CLIPBOARD_BTN.textContent = "To Clipboard";
        this.EXPORT_TO_CLIPBOARD_BTN.title = "Export sprite sheet data to clipboard as a MicroPython bytearray";
        this.EXPORT_TO_CLIPBOARD_BTN.onclick = (event) => {
            this.exportToClipboard();
        }
        listElem.appendChild(this.EXPORT_TO_CLIPBOARD_BTN);
        this.EXPORT_DROPDOWN_UL.appendChild(listElem);

        var listElem = document.createElement("li");
        this.EXPORT_TO_EDITOR_BTN = document.createElement("button");
        this.EXPORT_TO_EDITOR_BTN.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap sprite_export_btn";
        this.EXPORT_TO_EDITOR_BTN.textContent = "To Editor";
        this.EXPORT_TO_EDITOR_BTN.title = "Export sprite sheet data to editor as binary file";
        this.EXPORT_TO_EDITOR_BTN.onclick = (event) => {
            this.exportToEditor();
        }
        listElem.appendChild(this.EXPORT_TO_EDITOR_BTN);
        this.EXPORT_DROPDOWN_UL.appendChild(listElem);



        var SLIDER_GROUP = document.createElement("div");
        SLIDER_GROUP.classList = "input_group_common";
        SLIDER_GROUP.style.gridColumn = "4 / 4";
        this.BUTTON_OVERALL_PARENT_DIV.appendChild(SLIDER_GROUP);

        this.ZOOM_INPUT = document.createElement("input");
        this.ZOOM_INPUT.classList = "uk-range sheet_range_input";
        this.ZOOM_INPUT.type = "range";
        this.ZOOM_INPUT.min = 0.25;
        this.ZOOM_INPUT.max = 16;
        this.ZOOM_INPUT.step = 0.25;
        this.ZOOM_INPUT.value = 1;
        this.ZOOM_INPUT_BUBBLE = addRangeRowTo(SLIDER_GROUP, "ZOOM", this.ZOOM_INPUT);
        this.ZOOM_INPUT_BUBBLE.textContent = 1;
        this.ZOOM_INPUT.oninput = (event) => {this.applyZoom(); this.ZOOM_INPUT_BUBBLE.textContent = this.ZOOM_INPUT.value};

        this.OPACITY_INPUT = document.createElement("input");
        this.OPACITY_INPUT.classList = "uk-range sheet_range_input";
        this.OPACITY_INPUT.type = "range";
        this.OPACITY_INPUT.min = 0;
        this.OPACITY_INPUT.max = 0.95;
        this.OPACITY_INPUT.step = 0.05;
        this.OPACITY_INPUT.value = 0.35;
        this.OPACITY_INPUT_BUBBLE = addRangeRowTo(SLIDER_GROUP, "Frame Limits Opacity", this.OPACITY_INPUT);
        this.OPACITY_INPUT_BUBBLE.textContent = this.OPACITY_INPUT.value;
        this.OPACITY_INPUT.oninput = (event) => {this.updateCanvas(); this.OPACITY_INPUT_BUBBLE.textContent = this.OPACITY_INPUT.value};

        this.THRESHOLD_INPUT = document.createElement("input");
        this.THRESHOLD_INPUT.classList = "uk-range sheet_range_input";
        this.THRESHOLD_INPUT.type = "range";
        this.THRESHOLD_INPUT.min = 0;
        this.THRESHOLD_INPUT.max = 255;
        this.THRESHOLD_INPUT.step = 1;
        this.THRESHOLD_INPUT.value = 127;
        this.THRESHOLD_INPUT_BUBBLE = addRangeRowTo(SLIDER_GROUP, "Black/White Threshold", this.THRESHOLD_INPUT);
        this.THRESHOLD_INPUT_BUBBLE.textContent = this.THRESHOLD_INPUT.value;
        this.THRESHOLD_INPUT.oninput = (event) => {this.updateCanvas(); this.THRESHOLD_INPUT_BUBBLE.textContent = this.THRESHOLD_INPUT.value};


        // When a file is opened it is stored here
        this.CURRENT_SHEET_IMAGE = undefined;
    }


    getSheetBinaryData(){
        // Grab the data needed for positioning each frame rect
        var frameWidths = parseInt(this.FRAME_WIDTH_INPUT.value);   if(isNaN(frameWidths)){frameWidths = 0};
        var frameHeights = parseInt(this.FRAME_HEIGHT_INPUT.value); if(isNaN(frameHeights)){frameHeights = 0};

        var frameCountX = parseInt(this.FRAME_COUNT_X_INPUT.value); if(isNaN(frameCountX)){frameCountX = 0};
        var frameCountY = parseInt(this.FRAME_COUNT_Y_INPUT.value); if(isNaN(frameCountY)){frameCountY = 0};

        var gridOffsetX = parseInt(this.GRID_OFFSET_X_INPUT.value); if(isNaN(gridOffsetX)){gridOffsetX = 0};
        var gridOffsetY = parseInt(this.GRID_OFFSET_Y_INPUT.value); if(isNaN(gridOffsetY)){gridOffsetY = 0};

        var gridColumnGap = parseInt(this.GRID_COL_GAP_INPUT.value); if(isNaN(gridColumnGap)){gridColumnGap = 0};
        var gridRowGap = parseInt(this.GRID_ROW_GAP_INPUT.value);    if(isNaN(gridRowGap)){gridRowGap = 0};

        // Threshold set by user for when a pixel should turn white
        var threshold = parseInt(this.THRESHOLD_INPUT.value);

        var bytes = [];

        for(var y=0; y<frameCountY; y++){
            for(var x=0; x<frameCountX; x++){
                var xPixStart = x*frameWidths+gridOffsetX+(x*gridColumnGap);
                var yPixStart = y*frameHeights+gridOffsetY+(y*gridRowGap);
                var xPixEnd = xPixStart+frameWidths;
                var yPixEnd = yPixStart+frameHeights;

                for(var vy=yPixStart; vy<yPixEnd; vy+=8){
                    for(var hx=xPixStart; hx<xPixEnd; hx++){
                        var byte = 0b00000000;

                        for(var i=0; i<8 && vy+i < yPixEnd && vy+i < this.CURRENT_SHEET_IMAGE.height; i++){
                            var pixelComponents = this.SPRITE_SHEET_CANVAS_CONTEXT.getImageData(hx, vy+i, 1, 1).data;
                            var pixAvg = (pixelComponents[0] + pixelComponents[1] + pixelComponents[2]) / 3;

                            var value = 0;

                            if(pixAvg > threshold){     // White
                                value = 1;
                            }else{                      // Black
                                value = 0;
                            }

                            byte = byte | value<<i;
                        }

                        bytes.push(byte);
                    }
                }
            }
        }
        return bytes;
    }


    importFromClipboard(){
        var clipboardContents = prompt("Paste bytearray lines here (can include comment)");

        // Make sure the user did not cancel the import
        if(clipboardContents != null){
            clipboardContents = clipboardContents.split('\n');

            // If two elements, most likely comment and byte array. If 1 element, most likely just bytearray, otherwise, error
            if(clipboardContents.length == 2){

            }else if(clipboardContents.length == 1){

            }else{
                alert("Wrong number of lines pasted, please only copy line with bytearray, or bytearray + comment");
            }
        }
    }
    

    exportToEditor(){
        // Update the canvas without redrawing the grid (otherwise grid would be included in export)
        this.updateCanvas(false);

        // Get the binary data in a typed array
        var bytes = this.getSheetBinaryData();
        this.onExportToEditor(bytes);
        this.hide();

        // Show the grid again
        this.updateCanvas();
    }


    exportToClipboard(){
        // Update the canvas without redrawing the grid (otherwise grid would be included in export)
        this.updateCanvas(false);

        // Get the binary data in a typed array
        var bytes = this.getSheetBinaryData();

        // Show the grid again
        this.updateCanvas();

        var frameWidths = parseInt(this.FRAME_WIDTH_INPUT.value);   if(isNaN(frameWidths)){frameWidths = 0};
        var frameHeights = parseInt(this.FRAME_HEIGHT_INPUT.value); if(isNaN(frameHeights)){frameHeights = 0};

        var frameCountX = parseInt(this.FRAME_COUNT_X_INPUT.value); if(isNaN(frameCountX)){frameCountX = 0};
        var frameCountY = parseInt(this.FRAME_COUNT_Y_INPUT.value); if(isNaN(frameCountY)){frameCountY = 0};

        var lines = "# " + frameWidths + "x" + frameHeights + " for "  + frameCountX*frameCountY + " frames\n" +
                    "spriteFrames = bytearray([" + bytes.toString() + "])";

        navigator.clipboard.writeText(lines);
    }


    // Simple method to limit min value of an input element
    onInputUpdate(event, inputElem, min){
        this.updateCanvas();
        if(min != undefined && parseInt(inputElem.value)<min){
            inputElem.value=min
        }
    }


    drawGridOnCanvas(){
        var frameWidths = parseInt(this.FRAME_WIDTH_INPUT.value);   if(isNaN(frameWidths)){frameWidths = 0};
        var frameHeights = parseInt(this.FRAME_HEIGHT_INPUT.value); if(isNaN(frameHeights)){frameHeights = 0};

        var frameCountX = parseInt(this.FRAME_COUNT_X_INPUT.value); if(isNaN(frameCountX)){frameCountX = 0};
        var frameCountY = parseInt(this.FRAME_COUNT_Y_INPUT.value); if(isNaN(frameCountY)){frameCountY = 0};

        var gridOffsetX = parseInt(this.GRID_OFFSET_X_INPUT.value); if(isNaN(gridOffsetX)){gridOffsetX = 0};
        var gridOffsetY = parseInt(this.GRID_OFFSET_Y_INPUT.value); if(isNaN(gridOffsetY)){gridOffsetY = 0};

        var gridColumnGap = parseInt(this.GRID_COL_GAP_INPUT.value); if(isNaN(gridColumnGap)){gridColumnGap = 0};
        var gridRowGap = parseInt(this.GRID_ROW_GAP_INPUT.value);    if(isNaN(gridRowGap)){gridRowGap = 0};


        // Remove and add elements that canvas snapshots can be rendered too
        var totalFrameCount = frameCountX * frameCountY;
        while(this.SHEET_SCROLL_PARENT_DIV.children.length > totalFrameCount){
            this.SHEET_SCROLL_PARENT_DIV.removeChild(this.SHEET_SCROLL_PARENT_DIV.children[0]);
        }
        while(this.SHEET_SCROLL_PARENT_DIV.children.length < totalFrameCount){
            var SHEET_SCROLL_ITEM = document.createElement("img");
            SHEET_SCROLL_ITEM.classList = "sheet_scroll_item sheet_scroll_offscreen_canvas";
            this.SHEET_SCROLL_PARENT_DIV.appendChild(SHEET_SCROLL_ITEM);
        }


        var offScreenCanvas = document.createElement('canvas');
        offScreenCanvas.classList = "sheet_scroll_offscreen_canvas";
        offScreenCanvas.width = frameWidths;
        offScreenCanvas.height = frameHeights;
        var offScreenCanvasContext = offScreenCanvas.getContext('2d');

        var x = 0;
        var y = 0;
        var currentScrollItemIndex = 0;
        clearInterval(this.intervalID);
        this.intervalID = setInterval(() => {

            for(var i=0; i<15; i++){
                if(x%2 == 0){
                    if(y%2 == 0){
                        this.SPRITE_SHEET_CANVAS_CONTEXT.fillStyle = "rgb(0, 255, 0, " + this.OPACITY_INPUT.value + ")";
                    }else{
                        this.SPRITE_SHEET_CANVAS_CONTEXT.fillStyle = "rgb(0, 0, 255, " + this.OPACITY_INPUT.value + ")";
                    }
                }else{
                    if(y%2 == 0){
                        this.SPRITE_SHEET_CANVAS_CONTEXT.fillStyle = "rgb(0, 0, 255, " + this.OPACITY_INPUT.value + ")";
                    }else{
                        this.SPRITE_SHEET_CANVAS_CONTEXT.fillStyle = "rgb(0, 255, 0, " + this.OPACITY_INPUT.value + ")";
                    }
                }
                var rectX = x*frameWidths+gridOffsetX+(x*gridColumnGap);
                var rectY = y*frameHeights+gridOffsetY+(y*gridRowGap);

                // Copy rect of canvas to image (do before the rect is added to the area)
                var imageData = this.SPRITE_SHEET_CANVAS_CONTEXT.getImageData(rectX, rectY, frameWidths, frameHeights);
                offScreenCanvasContext.putImageData(imageData, 0, 0);
                this.SHEET_SCROLL_PARENT_DIV.children[currentScrollItemIndex].src = offScreenCanvas.toDataURL();
                // this.SHEET_SCROLL_PARENT_DIV.children[currentScrollItemIndex].style.aspectRatio = "1 / " + frameWidths/frameHeights;
                this.SPRITE_SHEET_CANVAS_CONTEXT.fillRect(rectX, rectY, frameWidths, frameHeights);

                currentScrollItemIndex = currentScrollItemIndex + 1;

                x = x + 1;
                if(x >= frameCountX){
                    x = 0;
                    y = y + 1;
                    if(y >= frameCountY){
                        y = 0;
                        clearInterval(this.intervalID);
                        break;
                    }
                }
            }
        }, 1);
    }


    applyZoom(){
        this.SPRITE_SHEET_CANVAS_PARENT.style.width = this.CURRENT_SHEET_IMAGE.width*parseFloat(this.ZOOM_INPUT.value) + "px";
        this.SPRITE_SHEET_CANVAS_PARENT.style.height = this.CURRENT_SHEET_IMAGE.height*parseFloat(this.ZOOM_INPUT.value) + "px";
    }


    updateCanvas(drawGrid){
        // Check that an image is loaded to be rendered beforehand
        if(this.CURRENT_SHEET_IMAGE == undefined){
            return;
        }

        // Always set the canvas size based on the current image and scale
        this.applyZoom();
        this.SPRITE_SHEET_CANVAS.width = this.CURRENT_SHEET_IMAGE.width;
        this.SPRITE_SHEET_CANVAS.height = this.CURRENT_SHEET_IMAGE.height;

        // Always clear and draw the raw image
        this.SPRITE_SHEET_CANVAS_CONTEXT.clearRect(0, 0, this.SPRITE_SHEET_CANVAS.width, this.SPRITE_SHEET_CANVAS.height);
        this.SPRITE_SHEET_CANVAS_CONTEXT.drawImage(this.CURRENT_SHEET_IMAGE, 0, 0, this.CURRENT_SHEET_IMAGE.width, this.CURRENT_SHEET_IMAGE.height);
        
        // Threshold set by user for when a pixel should turn white
        var threshold = parseInt(this.THRESHOLD_INPUT.value);

        // Always do port-processing and redraw the image pixel by pixel with threshold applied
        var pixelData = this.SPRITE_SHEET_CANVAS_CONTEXT.getImageData(0, 0, this.CURRENT_SHEET_IMAGE.width, this.CURRENT_SHEET_IMAGE.height).data;
        for (var i = 0, n = pixelData.length; i < n; i += 4) {
            // i+3 is alpha (the fourth element)
            var pixAvg = (pixelData[i] + pixelData[i+1] + pixelData[i+2]) / 3;
            if(pixAvg > threshold){     // White
                pixelData[i] = 255;
                pixelData[i+1] = 255;
                pixelData[i+2] = 255;
                pixelData[i+3] = 255;
            }else{                      // Black
                pixelData[i] = 0;
                pixelData[i+1] = 0;
                pixelData[i+2] = 0;
                pixelData[i+3] = 255;
            }
        }

        // Throw the post processed data on the canvas
        this.SPRITE_SHEET_CANVAS_CONTEXT.putImageData(new ImageData(pixelData, this.CURRENT_SHEET_IMAGE.width, this.CURRENT_SHEET_IMAGE.height), 0, 0);

        if(drawGrid == undefined || drawGrid == true){
            this.drawGridOnCanvas();
        }
    }


    async openSheetImage(){
        // Get the file
        let fileHandle;
        try{
            [fileHandle] = await window.showOpenFilePicker({});
        }catch(err){
            return;
        }
        const file = await fileHandle.getFile();

        // Define object and events to take on file data open the file
        this.CURRENT_SHEET_IMAGE = new Image();
        this.CURRENT_SHEET_IMAGE.onload = () => {
            this.IMAGE_SIZE_DIV.textContent = this.CURRENT_SHEET_IMAGE.width + " x " + this.CURRENT_SHEET_IMAGE.height;
            this.updateCanvas();
            URL.revokeObjectURL(this.CURRENT_SHEET_IMAGE.src);
        }
        this.CURRENT_SHEET_IMAGE.src = URL.createObjectURL(file);
    }


    // Assigns event and function to scroll wheel
    initScroll(){
        this.scrollListener = this.SHEET_PARENT_DIV.addEventListener('wheel', (event) => {
            if(event.ctrlKey == true){
                event.preventDefault();
                if(event.ctrlKey == true){
                    var scale = parseFloat(this.ZOOM_INPUT.value);
                    var max = parseFloat(this.ZOOM_INPUT.max);
                    var min = parseFloat(this.ZOOM_INPUT.min);
                    var step = parseFloat(this.ZOOM_INPUT.step);
                    if(event.wheelDelta < 0){
                        if(scale >= min){
                            this.ZOOM_INPUT.value = scale - step;
                            this.applyZoom();
                        }
                    }else{
                        if(scale < max){
                            this.ZOOM_INPUT.value = scale + step;
                            this.applyZoom();
                        }
                    }
                    this.ZOOM_INPUT_BUBBLE.textContent = this.ZOOM_INPUT.value;
                }
            }
        });
    }


    // Assigns event and function for opening and closing importer UI
    initOpenClose(){
        // Open
        this.openBtn.onclick = () => {
            this.show();
        }

        // Close (closeListener removed when hide() called)
        this.closeListener = window.addEventListener("keydown", (event) => {
            if(event.key == "Escape"){
                this.hide();
            }
        })
    }


    // Show importer UI (usually attached to button click event)
    show(){
        this.init();
        this.OVERLAY_DIV.style.display = "grid";
        this.PAGE_OVERLAY_DIV.style.display = "flex";
    }


    // Hide importer UI (usually attached to button click event)
    hide(){
        if(this.OVERLAY_DIV != undefined){
            this.OVERLAY_DIV.style.display = "none";
            this.PAGE_OVERLAY_DIV.style.display = "none";
            window.removeEventListener("keydown", this.closeListener);
            this.SHEET_PARENT_DIV.removeEventListener("wheel", this.scrollListener);
        }
    }
}
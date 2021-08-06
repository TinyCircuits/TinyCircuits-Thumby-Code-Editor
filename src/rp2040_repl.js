// ##### RP2040_REPL.js #####
// Provides class for interacting with RP2040
// through WebSerial. Commands and files can
// be uploaded and executed on-board RP2040
// from the browser. Based on Thonny source.


class RP2040REPL{
    
    // Define common objects used within this class right on object init
    constructor(){
        this.PORT = null;                                               // The serial port that the user chooses
        this.WRITER = null;                                             // The serial writer (send data to RP2040) from the port
        this.READER = null;                                             // The serial reader (read data from RP2040) from the port
        this.ENCODER = new TextEncoder();                               // For turning chars to utf8 bytes
        this.DECODER = new TextDecoder();                               // for turning utf8 bytes to chars
        this.OUTPUT_LINE_READY_EVENT = new Event('outputlineready');    // Synthetic event fired to browser when line from serial ready to be read
        this.OUTPUT_LINES = [];                                         // Each line of serial data that should be output to terminal is stored here until fetched
        this.CHUNKS = "";                                               // Where all serial data is stored until a newline is found
        this.SERIAL_READ_TIMEOUT =  100;                                // How long to wait until (ms)
        this.DID_SERIAL_READ_TIMEOUT = false;                           // Class global flag indicating if serial has been waiting for data for SERIAL_READ_TIMEOUT ms
        this.TIMER = null;                                              // Reference to setTimeout() timer

        this.THUMBY_SEND_BLOCK_SIZE = 516;                              // How many bytes to send to Thumby at a time when uploading a file to it

        this.CURRENT_FS_TREE = "";                                      // Key-value array/list consisting of the on-board RP2040 filesystem last time function called
        this.FS_TREE_READY_EVENT = new Event('fstreeready');            // Event fired in output capture indicating on-board file system structure has been received

        // https://github.com/thonny/thonny/blob/7a51ad6011a4c88e89e0e9e78ebb379f8a494533/thonny/plugins/micropython/bare_metal_backend.py#L56
        this.CMD_RAW_MODE = "\x01";
        this.CMD_NORMAL_MODE = "\x02";
        this.CMD_INTERRUPT_MODE = "\x03";
        this.CMD_SOFT_MODE = "\x04";

        // When true, means function loop to read serial, store in OUTPUT_LINES
        // and fire OUTPUT_LINE_READY_EVENT is running and terminal can grabs
        // lines when available
        this.READING = false;

        // When certain commands are passed, the output, or some of it,
        // needs to be truncated so user sees only what they need
        this.OUTPUT_FILTERS = {
            FILTER_OUTPUT: 0,           // Output everything (probably stuff from a command or running program)
            FILTER_EXECUTING_FILE: 1,   // Filter output when executing on-board Python file
            FITLER_NORMAL_MODE: 2,      // Filter output when executing keypress to plae RP2040 in normal mode
            FILTER_FS: 3,               // Filter for capturing and storing output when trying to get filesystem details
            FILTER_OPEN_ONBOARD: 4,     // Filter for capturing and storing output when trying to open on-board file
            FILTER_RENAME_FILE: 5,      // Filter for renaming files, error is printed when a file exists, catch that
            FILTER_DELETE_FILE: 6,      // Filter for surpressing output when deleting files on RP2040
            FILTER_FLUSH_MODE: 7,       // Filter for surpressing output, typically when there is a KeyboardInterrupt
        }
        this.OUTPUT_FILTER = this.OUTPUT_FILTERS.FILTER_OUTPUT;

        // Flag set true when on-board Python file executed, false when program is done running
        this.EXECUTED_FILE = false;

        this.JUST_EXECUTED_COMMAND = false;                             // When command passed to RP2040 module, this is set true and then false when handled
        this.JUST_EXECUTED_TERMINAL_COMMAND = false;                    // Set by executeCustomCommand when command comes from terminal (for catching special repeat problem)
        this.CMD_DONE_EVENT = new Event('cmddone');                     // Synthetic event fired to browser when can interact with on-board shell again (detail holes 'normal' for files/normal commands, or 'special' for things like 'import os')
        this.CMD_STARTED_EVENT = new Event('cmdstarted');               // Syncthetic event that tells main.js to disabled common features while commands/files are executing, fired when program is executing

        this.CURRENT_ONBOARD_FILE_CONTENTS = "";                        // Contents of file being opened from onboard RP2040 (resets after all data collected), related to FILTER_OPEN_ONBOARD

        this.ANY_COMMAND_EXECUTED = false;                              // Flag set true when executeCustomCommand called and set false when CHUNKS equals any EOT
    }


    // Returns all lines stored from serial up to this point.
    // Has to make copy of internal array, erase internal, and
    // then return copy
    getSerialLines(){
        var tempArray = [...this.OUTPUT_LINES];
        this.OUTPUT_LINES = [];
        return tempArray;
    }


    // Brings up the port chooser, user chooses one, opens port,
    // displays port info, stores writer, starts outputer
    async connectSerial(port){
        var connected = false;

        // Get port once user picks it through browser menu
        if(port == undefined){
            await navigator.serial.requestPort( {  } ).then((port) => {
                this.PORT = port;
                connected = true;
            }).catch((e) => {
                console.log("ERROR: could not choose that port! " + e);
                connected = false;
                return false;
            });
        }else{
            this.PORT = port;
            connected = true;
        }

        if(connected){
            await this. PORT.open({ baudRate: 115200 });
            var info = this.PORT.getInfo();
            
            this.WRITER = this.PORT.writable.getWriter();

            // Get the reader object for reading from serial stream
            this.READER = this.PORT.readable.getReader();
            return true;
        }
        return false;
    }


    async disconnectSerial(){
        if(this.PORT != undefined){
            await this.PORT.close();
            this.PORT = undefined;
            this.WRITER = undefined;
            this.READER = undefined;
            return true;
        }
    }


    // Creates empty element, makes it a link, adds link to document, 
    // auto clicks link to start download, removes from document,
    // deletes link object
    async downloadMicropython(){
        var link = document.createElement("a");
        link.href = "https://micropython.org/resources/firmware/rp2-pico-20210418-v1.15.uf2";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        link = null;
    }


    // If a port has been connected, returns its product ID as int, otherwise null
    getProductID(){
        if(this.PORT != null){
            return this.PORT.getInfo().usbProductId;
        }
        return null;
    }


    // If a port has been connected, returns its vendor ID as int, otherwise null
    getVendorID(){
        if(this.PORT != null){
            return this.PORT.getInfo().usbVendorId;
        }
        return null;
    }


    // Only returns string containing data active/found in serial at that moment.
    // Combine strings until newline to have complete strings where messages are
    // not cutoff!
    async readSerial(timeout, messageOnOff) {
        let timeoutId;
        let timeoutPromise;

        if(messageOnOff == true){
            timeoutPromise = new Promise(
                (resolve, reject) =>
                    this.timeoutId = setTimeout(
                        () => reject(console.log("%cSERIAL TIMEOUT!!!!", "color: yellow")),
                        timeout
                    )
            );
        }else{
            timeoutPromise = new Promise(
                (resolve, reject) =>
                    this.timeoutId = setTimeout(
                        () => reject(),
                        timeout
                    )
            );
        }

        if(!this.readPromise) {
            this.readPromise = this.READER.read();
        }
        const result = await Promise.race([this.readPromise, timeoutPromise]);
        this.readPromise = null;
        clearTimeout(this.timeoutId);
        return this.DECODER.decode(result.value);
    }


    // Returns true when could find string in serial output (by combining data),
    // and false when timeout runs out meaning no data found
    async readUntil(compareString, timeout, messageOnOff){
        while(this.CHUNKS.includes(compareString) == false){
            try{
            this.CHUNKS += await this.readSerial(timeout, messageOnOff);
            // console.log(this.CHUNKS);
            } catch(err) {
                return false;
            }
            var lines = this.CHUNKS.split("\n");
            if(lines.length > 1){
                this.CHUNKS = lines.pop();
            }
        }
        return true;
    }


    async readSerialNoTimeout() {
        if(!this.readPromise) {
            this.readPromise = this.READER.read();
        }
        const result = await Promise.race([this.readPromise]);
        this.readPromise = null;
        return this.DECODER.decode(result.value);
    }


    async startReading(){
        this.READING = true;
        while(this.READING == true){

            try{
                this.CHUNKS += await this.readSerialNoTimeout();
                // console.log(this.CHUNKS);
            } catch(err) {
                return false;
            }

            // Split combined string from serial into lines based on end (newline)
            var lines = this.CHUNKS.split('\r\n');

            // If there are lines that are done, go to shift operation
            if(lines.length > 1){

                var tempPrintedInterruptFirst = false;

                // If a command was just executed that generated first serial chunk,
                // strip the confirmation portion from the string to be dispalyed 
                // (this is always in the first line after a command was sent)
                if(this.JUST_EXECUTED_COMMAND){
                    var confirmationIndex = lines[0].indexOf('K')+1;                // Find index end of confirmation
                    lines[0] = lines[0].substring(lines[0].lastIndexOf('K')+1);     // Strip confirmation
                    if(this.OUTPUT_FILTER != this.OUTPUT_FILTERS.FILTER_FS && 
                        this.OUTPUT_FILTER != this.OUTPUT_FILTERS.FILTER_OPEN_ONBOARD &&
                        this.OUTPUT_FILTER != this.OUTPUT_FILTERS.FILTER_RENAME_FILE &&
                        this.OUTPUT_FILTER != this.OUTPUT_FILTERS.FILTER_DELETE_FILE){
                        
                        if(this.JUST_EXECUTED_TERMINAL_COMMAND == false){
                            this.OUTPUT_LINES.push("");
                            this.OUTPUT_LINES.push(lines[0]);
                        }else if(lines[0] == "Traceback (most recent call last):"){    // handle when keyboard interrupt and terminal used (ctrl-c)
                            this.OUTPUT_LINES.push("");
                            this.OUTPUT_LINES.push(lines[0]);
                            this.JUST_EXECUTED_TERMINAL_COMMAND = false;
                            tempPrintedInterruptFirst = true;               // if this line was already pushed here, don't do again later
                        }else{
                            this.JUST_EXECUTED_TERMINAL_COMMAND = false;
                        }
                    }
                    this.JUST_EXECUTED_COMMAND = false;                             // Handled
                }

                // Shift out all lines except the last since that may not be a finished lines
                // Use script global filters to control what data goes where.
                while(lines.length != 1){
                    switch(this.OUTPUT_FILTER){
                        case this.OUTPUT_FILTERS.FILTER_OUTPUT:
                            var line = lines.shift();
                            if(line == "KeyboardInterrupt: " || line == "MPY: soft reboot"){  // If there is a keyboard interrupt, change output filter to flush since user doesn't need to see that
                                this.OUTPUT_FILTER = this.OUTPUT_FILTERS.FITLER_FLUSH_MODE;
                            }
                            if(tempPrintedInterruptFirst == false){
                                this.OUTPUT_LINES.push(line);
                            }else{
                                tempPrintedInterruptFirst = false;
                            }
                        break;
                        case this.OUTPUT_FILTERS.FILTER_EXECUTING_FILE: // Throw away the first line
                            lines.shift();
                            this.OUTPUT_FILTER = this.OUTPUT_FILTERS.FILTER_OUTPUT;
                        break;
                        case this.OUTPUT_FILTERS.FITLER_FLUSH_MODE:
                            lines.shift();
                        break;
                        case this.OUTPUT_FILTERS.FILTER_FS:
                            this.CURRENT_FS_TREE += lines.shift();
                        break;
                        case this.OUTPUT_FILTERS.FILTER_OPEN_ONBOARD:
                            this.CURRENT_ONBOARD_FILE_CONTENTS += lines.shift() + "\n";
                        break;
                        case this.OUTPUT_FILTERS.FILTER_RENAME_FILE:
                            var response = lines.shift();  // Store to see if there was an error or not
                            
                            if(response == "rename_error"){
                                alert("ERROR: File name already exists in directory, rename canceled.");
                            }else if(response != "no_rename_error"){
                                console.log(response);
                            }
                        break;
                        case this.OUTPUT_FILTERS.FILTER_DELETE_FILE:
                            var response = lines.shift();  // Store to see if there was an error or not

                            if(response == "rm_failed"){
                                alert("ERROR: Could not delete file for some reason...");
                            }else if(response != "rm_worked"){
                                console.log(response);
                            }
                        break;
                    }
                }
                
                // All lines that can be displayed have been shifted into buffer,
                // let external modules/programs (terminal) know this module has data
                // (Has to stay here, otherwise delay before first line shown in terminal)
                window.dispatchEvent(this.OUTPUT_LINE_READY_EVENT);

                // Store the last element so it can be built on next time serial chunk received
                this.CHUNKS = lines[0];
            }


            // Check if last string is active shell, if so, command/program ended
            // and the terminal shell propmt can be dispalyed again (this is always on
            // its own line). For some reason, errors only have one unicode character at end.
            // Also, do not place under condition of more than one line, ending string can be
            // its own line. '>>> ' happens when programs end
            // "OK\u0004\u0004>" happens for commands like 'import os' or 'help' for some reason (special command)
            if(this.CHUNKS == "\u0004\u0004>" || this.CHUNKS == "\u0004>"){

                // Handle end of getting the on-baord file system (all chunks received at this point)
                if(this.OUTPUT_FILTER == this.OUTPUT_FILTERS.FILTER_FS){
                    this.OUTPUT_FILTER = this.OUTPUT_FILTERS.FILTER_OUTPUT;

                    // For whatever reason, [object Object] gets placed at start after
                    // subsequent runs of finding FS tree, remove that portion
                    if(this.CURRENT_FS_TREE[0] == '['){
                        this.CURRENT_FS_TREE = this.CURRENT_FS_TREE.substring(15);
                    }

                    try{
                        this.CURRENT_FS_TREE = JSON.parse(this.CURRENT_FS_TREE);

                        // Let main.js know the FS tree can be fetched from this module
                        // and displayed on the webpage
                        window.dispatchEvent(this.FS_TREE_READY_EVENT);
                    }catch(e){
                        console.log("On-baord filesystem parse error: this should never happen");
                        console.error(e);
                        this.CHUNKS = "";
                        this.ANY_COMMAND_EXECUTED = false;  // Reset to false after CHUNKS equals an EOT
                    }
                }else if(this.OUTPUT_FILTER == this.OUTPUT_FILTERS.FILTER_OPEN_ONBOARD){
                    // After on-board file read, reset filter. Open onboard file function
                    // calls function to reset file contents variable, prune last 2 newlines 
                    // (where do they BOTH come from... probably upload/download)
                    this.CMD_DONE_EVENT.detail = "none";
                    window.dispatchEvent(this.CMD_DONE_EVENT);
                    this.CURRENT_ONBOARD_FILE_CONTENTS = this.CURRENT_ONBOARD_FILE_CONTENTS.slice(0, -2);
                    this.OUTPUT_FILTER = this.OUTPUT_FILTERS.FILTER_OUTPUT;
                }else if(this.OUTPUT_FILTER == this.OUTPUT_FILTERS.FILTER_RENAME_FILE){
                    this.CMD_DONE_EVENT.detail = "none";
                    window.dispatchEvent(this.CMD_DONE_EVENT);
                    this.OUTPUT_FILTER = this.OUTPUT_FILTERS.FILTER_OUTPUT;
                    await this.getOnBoardFSTree();
                }else if(this.OUTPUT_FILTER == this.OUTPUT_FILTERS.FILTER_DELETE_FILE){
                    this.CMD_DONE_EVENT.detail = "none";
                    window.dispatchEvent(this.CMD_DONE_EVENT);
                    this.OUTPUT_FILTER = this.OUTPUT_FILTERS.FILTER_OUTPUT;
                    await this.getOnBoardFSTree();
                }else{
                    await this.getOnBoardFSTree();                    // Go through process of updating filesystem tree after each command/program run/upload
                    this.CMD_DONE_EVENT.detail = "normal";
                    window.dispatchEvent(this.CMD_DONE_EVENT);
                }
                this.CHUNKS = "";
                this.ANY_COMMAND_EXECUTED = false;  // Reset to false after CHUNKS equals an EOT
            }else if(this.CHUNKS == "OK\u0004\u0004>" && this.JUST_EXECUTED_TERMINAL_COMMAND == true){  // When a command like "import os" executed, special handling is needed since only get OK>>> back
                this.JUST_EXECUTED_TERMINAL_COMMAND = false;
                this.OUTPUT_FILTER = this.OUTPUT_FILTERS.FILTER_OUTPUT;
                await this.getOnBoardFSTree();
                this.CMD_DONE_EVENT.detail = "special";
                window.dispatchEvent(this.CMD_DONE_EVENT);
                this.CHUNKS = "";
                this.ANY_COMMAND_EXECUTED = false;  // Reset to false after CHUNKS equals an EOT
            }else if((this.CHUNKS == ">" && this.EXECUTED_FILE == true) || (this.CHUNKS == ">" && this.OUTPUT_FILTER == this.OUTPUT_FILTERS.FITLER_FLUSH_MODE)){ // Handle keyboard interrupt EOT & Soft reset
                this.OUTPUT_FILTER = this.OUTPUT_FILTERS.FILTER_OUTPUT;
                await this.getOnBoardFSTree();
                this.waitForFilteredOutput(undefined);
                this.CMD_DONE_EVENT.detail = "normal";
                window.dispatchEvent(this.CMD_DONE_EVENT);
                this.CHUNKS = "";
                this.ANY_COMMAND_EXECUTED = false;  // Reset to false after CHUNKS equals an EOT
                this.EXECUTED_FILE = false;
            }else if((this.CHUNKS == "OK>" && this.EXECUTED_FILE == true)){   // Handle programs/commands that do not print anything
                this.OUTPUT_FILTER = this.OUTPUT_FILTERS.FILTER_OUTPUT;
                await this.getOnBoardFSTree();
                this.waitForFilteredOutput(undefined);
                this.CMD_DONE_EVENT.detail = "none";
                window.dispatchEvent(this.CMD_DONE_EVENT);
                this.CHUNKS = "";
                this.ANY_COMMAND_EXECUTED = false; 
                this.EXECUTED_FILE = false;
            }
        }
        return true;
    }


    // If returns true then a program/command is running, if false, then nothing running right now
    isCommandRunning(){
        return this.ANY_COMMAND_EXECUTED;
    }


    // Makes sure that any onboard program is stopped. Even if no
    // running program, this can be sent just in case
    async stopRunningPrograms(){
        await this.WRITER.write(this.ENCODER.encode("\x03\x03"));
    }


    // Reads serial looking for sequnce that will not occur
    async flushSerial(){
        await this.readUntil("><><><", 100, false);
    }


    // https://github.com/thonny/thonny/blob/7a51ad6011a4c88e89e0e9e78ebb379f8a494533/thonny/plugins/micropython/bare_metal_backend.py#L534
    async ensureNormalMode(){
        await this.WRITER.write(this.ENCODER.encode(this.CMD_NORMAL_MODE));
        if(await this.readUntil(">", 100, true) == true){
            console.log("%cIn normal mode!", "color: lime");
            return true;
        }else{
            console.log("%cERROR: could not get to normal mode...", "color: red");
            return false;
        }
    }


    // https://github.com/thonny/thonny/blob/7a51ad6011a4c88e89e0e9e78ebb379f8a494533/thonny/plugins/micropython/bare_metal_backend.py#L506
    async ensureRawMode(){
        // assuming we are currently on a normal prompt (call ensureNormalMode before calling this!!!)
        await this.WRITER.write(this.ENCODER.encode(this.CMD_RAW_MODE));
        if(await this.readUntil(">", 100, true) == true){
            console.log("%cIn raw mode!", "color: lime");
            return true;
        }else{
            console.log("%cERROR: could not get to raw mode...", "color: red");
            return false;
        }
    }


    // Do software reboot/refresh of the board
    async softReboot(){
        await this.WRITER.write(this.ENCODER.encode(this.CMD_SOFT_MODE));
        if(await this.readUntil("MPY:", 100, true) == true){
            console.log("Soft rebooted!");
            return true;
        }else{
            console.log("%cERROR: could not soft reboot...", "color: red");
            return false;
        }
    }


    // Sends Python print statement with hellow world to be
    // executed and checked for successful execution
    async testCommand(){
        await this.WRITER.write(this.ENCODER.encode("print(\"Hello World!\")" + "\x04"));
        if(await this.readUntil("OK", 100, true) == true){
            console.log("%cTest command worked!", "color: lime");
            return true;
        }else{
            console.log("%cERROR: could not do test command", "color: red");
            return false;
        }
    }


    // Sends a custom command (typically typed and entered by the user)
    // to be executed on the RP2040
    async executeCustomCommand(cmd, usedTerminal){
        if(usedTerminal != undefined){
            this.JUST_EXECUTED_TERMINAL_COMMAND = true;
        }

        if(cmd != ""){
            this.ANY_COMMAND_EXECUTED = true;
            this.JUST_EXECUTED_COMMAND = true;  // Set this true so 'OK' can be pruned
            await this.WRITER.write(this.ENCODER.encode(cmd + "\x04"));
            if(await this.readUntil("OK", 100, true) == true){
                console.log("%cCustom command was executed!", "color: lime");
                return true;
            }else{
                console.log("%cERROR: could not execute custom command", "color: red");
                return false;
            }
        }
    }


    // Waits for '>>>' to be sent back from RP2040. This means that
    // whatever command had been sent, is not done and executed.
    // Use this to stop script progression (i.e. wait until command
    // completes). Has to complete in < 5 seconds, otherwise, timeouts.
    // Timeout is so that don't spend too long trying to figure out why
    // page stalls if something goes wrong...
    async waitForDone5Sec(){
        var start_time = new Date().getTime()
    
        // Keep starting promise every 100 msec to check if condition changed.
        // Condition is that this.JUST_EXECUTED_COMMAND != false
        while (true) {

            // Check the condition (this.JUST_EXECUTED_COMMAND == false)
            if (this.JUST_EXECUTED_COMMAND == false) {
                return;
            }

            // If condition hasn't changed for 3 seconds, problem, stop waiting
            if (new Date() > start_time + 3000) {
                console.log("Command never stopped");
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }


    // Uploads <contents> to RP2040 under file named <name>
    async uploadCustomFile(name, contents, trigger){
        window.dispatchEvent(this.CMD_STARTED_EVENT);

        // First, split string for \n, \r, and \r\n (lineseps)
        contents = contents.split(/\r\n|\n|\r/);

        // Recombine everything with correct newlines
        var combined = "";
        for(var row=0; row<contents.length; row++){
            combined = combined + contents[row] + "\n";
        }
        combined = "\\x" + combined.convertToHex('\\x');

        // Send the whole file to Thumby, as Thonny does, in chunks
        await this.executeCustomCommand("onboard_file = open('" + name + "','wb')");

        // Do the actual sending of file data now that the file is open, use .slice over
        // .substr or .substring since those modify the original string and take WAY longer
        for(var b=0; b<Math.ceil(combined.length/this.THUMBY_SEND_BLOCK_SIZE); b++){
            await this.executeCustomCommand("onboard_file.write(b\"" + combined.slice(b*this.THUMBY_SEND_BLOCK_SIZE, (b+1)*this.THUMBY_SEND_BLOCK_SIZE) + "\")");
        }

        // Close the file on Thumby, this is when the data is actuall saved to the file
        await this.executeCustomCommand("onboard_file.close()");
        
        // Get the filesystem tree first and wait for filter
        // to change indicating webpage recevied FS info.
        // Fixes blank/epmty files not being shown in filesystem view
        // File operations are fast enough that it may not be a problem
        // doing this right away
        await this.getOnBoardFSTree();
        await this.waitForFilteredOutput(this.OUTPUT_FILTERS.FILTER_FS);

        if(trigger){
            // Let main.js know that cmd done and buttons can be relit
            this.CMD_DONE_EVENT.detail = "none";
            window.dispatchEvent(this.CMD_DONE_EVENT);
        }

        return;
    }


    // Uploads and executes file
    async uploadExecuteCustomFile(name, contents){
        window.dispatchEvent(this.CMD_STARTED_EVENT);

        await this.uploadCustomFile(name, contents);

        this.OUTPUT_FILTER = this.OUTPUT_FILTERS.FILTER_EXECUTING_FILE;
        this.EXECUTED_FILE = true;
        await this.executeCustomCommand("exec(open('" + name + "').read())");
    }

    // Executes file under given name
    async executeCustomFile(name){
        window.dispatchEvent(this.CMD_STARTED_EVENT);

        this.OUTPUT_FILTER = this.OUTPUT_FILTERS.FILTER_EXECUTING_FILE;
        this.EXECUTED_FILE = true;
        await this.executeCustomCommand("exec(open('" + name + "').read())");
    }


    // Timesout after 5 seconds if filter doesn't change, but waits for
    // filter to change and then returns data corresponding to that filter
    async waitForFilteredOutput(filter) {
        var start_time = new Date().getTime()
    
        // Keep starting promise every 100 msec to check if condition changed
        // condition is that this.OUTPUT_FILTER != this.OUTPUT_FILTERS.FILTER_OUTPUT
        // right now
        while (true) {

            // Check the condition
            if (this.OUTPUT_FILTER == this.OUTPUT_FILTERS.FILTER_OUTPUT) {
                // Find out what to return (correlates to logic in startReading)
                switch(filter){
                    case this.OUTPUT_FILTERS.FILTER_OPEN_ONBOARD:
                        // Reset and return
                        var copy = this.CURRENT_ONBOARD_FILE_CONTENTS;
                        this.CURRENT_ONBOARD_FILE_CONTENTS = "";
                        return copy;
                    break;
                    default:
                        return;
                }
                return undefined;
            }

            // If condition hasn't changed for 5 seconds, problem, stop waiting
            if (new Date() > start_time + 5000) {
                console.log("Could not open file for some reason, stopped");
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }


    // Provided a file location from root (not including \) on the
    // RP2040, opens it and prints contents to REPL terminal, and
    // returns the contents
    async openCustomFile(path){
        window.dispatchEvent(this.CMD_STARTED_EVENT);
        this.OUTPUT_FILTER = this.OUTPUT_FILTERS.FILTER_OPEN_ONBOARD;

        // Make the path hex so that string combination is less likely to mess up
        path = "\\x" + path.convertToHex('\\x');

        var cmd =   "onboard_file = open(\"\"\"" + path + "\"\"\", 'r')\n" +
                    "contents = onboard_file.read()\n" +
                    "onboard_file.close()\n" +
                    "print(contents)\n";

        await this.executeCustomCommand(cmd);
        return await this.waitForFilteredOutput(this.OUTPUT_FILTERS.FILTER_OPEN_ONBOARD);
    }


    // Sends commands to RP2040 to rename file at given path to provided new name
    async renameFile(oldPath, newName){
        window.dispatchEvent(this.CMD_STARTED_EVENT);
        this.OUTPUT_FILTER = this.OUTPUT_FILTERS.FILTER_RENAME_FILE;
        if(oldPath != undefined && newName != undefined){
            var newPath = oldPath.substring(0, oldPath.lastIndexOf("\\")+1) + newName;
            var cmd =   "import uos\n" +
                        "exists = 1\n" +
                        "try:\n" +
                        "   f = open('" + newPath + "', 'r')\n" +
                        "   exists = 1\n" +
                        "   f.close()\n" +
                        "except  OSError:\n" +
                        "   exists = 0\n" +
                        "if exists == 0:\n" +
                        "   uos.rename('" + oldPath + "', '" + newPath +"')\n" +
                        "   print('no_rename_error')\n" +
                        "else:\n" +
                        "   print('rename_error')";
            await this.executeCustomCommand(cmd);
        }
    }


    // Given a path, delete it provided the path
    // is designated as a file or dir
    async deleteFileOrDir(path, fileOrDir){
        window.dispatchEvent(this.CMD_STARTED_EVENT);
        this.OUTPUT_FILTER = this.OUTPUT_FILTERS.FILTER_DELETE_FILE;

        var remover = "";
        if(fileOrDir == 0){
            remover = "uos.remove('" + path + "')\n";
        }else{
            remover = "shutil.rmtree('" + path + "', True)\n";
        }

        var cmd =   "import os\n" +

                    "def rm(d):  # Remove file or tree\n" +
                    "   try:\n" +
                    "       if os.stat(d)[0] & 0x4000:  # Dir\n" +
                    "           for f in os.ilistdir(d):\n" +
                    "               if f[0] not in ('.', '..'):\n" +
                    "                   rm('/'.join((d, f[0])))  # File or Dir\n" +
                    "           os.rmdir(d)\n" +
                    "       else:  # File\n" +
                    "           os.remove(d)\n" +
                    "       print('rm_worked')\n" +
                    "   except:\n" +
                    "       print('rm_failed')\n" +
                    "rm('" + path + "')";

        await this.executeCustomCommand(cmd);
    }


    // Provided a complete path of the dir, add the folder to the RP2040
    // EX: root\child\newfolder 
    async addNewFolder(completePath){
        var cmd = "import uos\n" +
                  "uos.mkdir('" + completePath + "')\n";
                  console.log(cmd);
        await this.executeCustomCommand(cmd);

        // File operations are fast enough that it may
        // not be a problem doing this right away
        await this.getOnBoardFSTree();
    }


    // Goes through whole process of starting ob-board Python shell
    // so user can input commands and have them executed RIGHT away
    async startPythonShell(){
        await this.stopRunningPrograms();
        await this.flushSerial();
        await this.ensureNormalMode();
        await this.ensureRawMode();
        if(await this.testCommand()){
            await this.flushSerial();
            this.startReading();      // Start output watcher
            return true;
        }
        return false;
    }


    // Gets the RP2040 filesystem hierarchy for display on the webpage typically
    // Start at root folder, put out list with folder currently in and other files
    // and/or directories inside in same location. Do the same for the other folders
    // in the current folder
    // RP2040 returns Python dict as Json string that is then captured in this modules
    // output reader
    async getOnBoardFSTree(){
        console.log("%cOn-board filesystem structure analyzed!", "color: lime");
        this.OUTPUT_FILTER = this.OUTPUT_FILTERS.FILTER_FS;

        // This has to be reset, otherwise get bug that
        // somehow builds up multiple fs tree responses
        this.CURRENT_FS_TREE = "";

        var cmd = "import os\n" +
        "import ujson\n" +
        
        "def walk(top, structure, dir):\n" +
        
        "    extend = \"\";\n" +
        "    if top != \"\":\n" + 
        "        extend = extend + \"/\"\n" +
                
        "    item_index = 0\n" +
        "    structure[dir] = {}\n" +
            
        "    # Loop through and create stucture of on-board FS\n" +
        "    for dirent in os.listdir(top):\n" +
        "        if(os.stat(top + extend + dirent)[0] == 32768):\n" +
        "            structure[dir][item_index] = {\"F\": dirent}\n" +
        "            item_index = item_index + 1\n" +
        "        elif(os.stat(top + extend + dirent)[0] == 16384):\n" +
        "            structure[dir][item_index] = {\"D\": dirent}\n" +
        "            item_index = item_index + 1\n" +
        "            walk(top + extend + dirent, structure[dir], dirent)\n" +
        "    return structure\n" +
        "struct = {}\n" +
        "print(ujson.dumps(walk(\"\", struct, \"\")))";

        await this.executeCustomCommand(cmd);
    }
}
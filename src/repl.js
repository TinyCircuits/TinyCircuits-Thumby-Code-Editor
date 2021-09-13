class ReplJS{
    constructor(){
        this.PORT = undefined;      // Reference to serial port
        this.READER = undefined;    // Reference to serial port reader, only one can be locked at a time
        this.WRITER = undefined;    // Reference to serial port writer, only one can be locked at a time

        this.TEXT_ENCODER = new TextEncoder();  // Used to write text to MicroPython
        this.TEXT_DECODER = new TextDecoder();  // Used to read text from MicroPython

        this.USB_VENDOR_ID = 11914; // For filtering ports during auto or manual selection
        this.USB_PRODUCT_ID = 5;    // For filtering ports during auto or manual selection

        this.THUMBY_SEND_BLOCK_SIZE = 2048;  // How many bytes to send to Thumby at a time when uploading a file to it

        // Set true so most terminal output gets passed to javascript terminal
        this.DEBUG_CONSOLE_ON = false;

        // Check if browser can use WebSerial
        if ("serial" in navigator) {
            if(this.DEBUG_CONSOLE_ON) console.log("Serial supported in this browser!");
        } else {
            alert("Serial NOT supported in your browser! Use Microsoft Edge or Google Chrome");
            setTimeout(() => {
                this.CALLBACK_DONT_INTERRUPT();
            }, 350);
            return;
        }

        // Set true when connected (.openPort) and false when disconnected (event or start)
        this.CONNECTED = false;
        
        // Attempt auto-connect when page validated device plugged in, do not start manual selection menu
        navigator.serial.addEventListener('connect', (e) => {
            this.CONNECTED = true;

            // If not manually connecting already, try to auto connect
            if(this.MANUALLY_CONNECTING == false){
                this.connect();
            }
        });

        // Probably set flags/states when page validated device removed
        navigator.serial.addEventListener('disconnect', (e) => {
            this.CONNECTED = false;

            var disconnectedPort = e.target;
            if(this.checkPortMatching(disconnectedPort)){
                if(this.DEBUG_CONSOLE_ON) console.log("%cDisconnected MicroPython! Clearing EOTs", "color: yellow");
                this.clearEOTs();
                this.CALLBACK_DISCONNECTED();
            }
        });


        // ### Connecting Serial ###
        // Variables related to connecting to serial, do not touch
        this.MANUALLY_CONNECTING = false;   // When requestPorts() is called this flag is set so auto connect does not choose a device and get an unintended device


        // ### MicroPython Control Commands ###
        // DOCS: https://docs.micropython.org/en/latest/esp8266/tutorial/repl.html#other-control-commands
        // UNICODE CTRL CHARS COMBOS: https://unicodelookup.com/#ctrl
        this.CTRL_CMD_RAWMODE = "\x01";     // ctrl-A (use for wating to get file information, upload files, run custom python tool, etc)
        this.CTRL_CMD_NORMALMODE = "\x02";  // ctrl-B (user friendly terminal, needs '\r\n' to register a line)
        this.CTRL_CMD_KINTERRUPT = "\x03";  // ctrl-C (stops a running program) (DO NOT SPAM INTERRUPTS, MAY BREAK EOT FLAG BY CLEARING EARLY)
        this.CTRL_CMD_SOFTRESET = "\x04";   // ctrl-D (soft reset the board, required after a command is entered!)
        this.CTRL_CMD_PASTEMODE = "\x05";


        // ### Variables Related to Serial Reading & Chunks ###
        // Do not touch these except in functions strictly related to formatting output from MicroPython device
        this._CHUNKS = "";                          // for concat serial fragments, split and formatted on '\r\n'
        this._LINE_STORE = [];                      // All formatted lines are placed here until a call to getLines is done
        this._FILTER_STATE = false;                 // When _FILTER_STATE is on formatted lines are not placed in _LINE_STORE, use .setFilter(filterOrNot)
        this._INVERT_FILTER_ON_STR = "";            // When this STR occurs in lineFormatter, inverts _FILTER_STATE (useful for commands where don't want to wait for timeout in case never generates a str/prompt)
        this._INVERT_FILTER_ON_STR_FLAG = false;    // Flag that corresponds to _INVERT_FILTER_ON_STR since "" can't be default, taht could and will occur
        this._REMOVING_RAW_OK_FLAG = false;         // When set true, formatter will remove first two chaters of next line (for 'OK' after raw command)

        // ### EOT (End of Transmission) Strings ###
        // When specific control (ctrl) commands are done, a certain EOT should be expected for when the command completes
        // Typically used so that the last line is is made ready for output as soon as possible, otherwise would ahve to wait for more input
        this.EOT_RAW_PROMPT = ">";                  // Once the raw command propmt is given, the last line is '>' after line 'raw REPL; CTRL-B to exit'
        this.EOT_CMD_END_RAW_PROMPT = ">";        // Once a command ends after being done in raw mode, this propmt is printed
        this.EOT_NORMAL_PROMPT = ">>> ";            // When in Normal mode this prompt is printed after entering '\r\n'
        this.EOT_RUNNING_FROM_KINTERRUPT = ">";    // When a program is running from raw mode and gets keyboard interrupted
        // this.EOT_CONTINUATION = "...     ";         // https://docs.micropython.org/en/latest/esp8266/tutorial/repl.html#line-continuation-and-auto-indent
        // this.EOT_CONTINUATION2 = "...         ";
        // this.EOT_CONTINUATION3 = "...             ";
        // this.EOT_CONTINUATION_END = "... ";
        this.EOT_SET_FLAG = false;
        this.EOTs = undefined;

        // ### CALLBACKS ###
        // Function variables that are called when REPL does certain standard operations (connects, prints, disconnects, etc)
        this.CALLBACK_CONNECTED = undefined;
        this.CALLBACK_DISCONNECTED = undefined;
        this.CALLBACK_PRINT = undefined;
        this.CALLBACK_PROMPT = undefined;
        this.CALLBACK_FS_UPDATE = undefined;
        this.CALLBACK_DONT_INTERRUPT = undefined;   // Set this to functin that will disable page elments during important RP2040 interactions

        // When FILTER_STATE true, collectlines here, set to "" when filter FILTER_STATE set true in setFilter()
        this.COLLECTED_FILTERED_LINES = "";

        this.LAST_CONTINUATION_EOTS = [];
    }


    callbackSetDontInterruptToggle(callback){
        this.CALLBACK_DONT_INTERRUPT = callback;
    }


    callbackSetFSupdate(callback){
        this.CALLBACK_FS_UPDATE = callback;
    }


    // Function for setting callback for when REPL is connected
    callbackSetConnected(callback){
        this.CALLBACK_CONNECTED = callback;
    }


    // Function for setting callback for when REPL is disconnected
    callbackSetDisconnected(callback){
        this.CALLBACK_DISCONNECTED = callback;
    }


    // Function for setting callback for when REPL prints
    callbackSetPrint(callback){
        this.CALLBACK_PRINT = callback;
    }


    // Function for setting callback for when REPL finds a prompt in a line
    callbackSetPrompt(callback){
        this.CALLBACK_PROMPT = callback;
    }


    // Returns tru if product and vendor ID match for MicroPython, otherwise false #
    checkPortMatching(port){
        var info = port.getInfo();
        if(info.usbProductId == this.USB_PRODUCT_ID && info.usbVendorId == this.USB_VENDOR_ID){
            return true;
        }
        return false;
    }


    setEOTs(EOTs){
        this.EOT_SET_FLAG = true;
        this.EOTs = EOTs;
    }


    clearEOTs(){
        this.EOT_SET_FLAG = false;
        this.EOTs = undefined;
    }


    async waitForSetEOT(noTimout, timeoutAmount = 5000){
        var startTime = new Date().getTime();   // Used for timing out

        // Start JS timouts every 75ms, track actual timeout every 75ms
        while (true) {

            // Check if line formatter checker found the set EOT yet
            if (this.EOT_SET_FLAG == false) {
                return true;
            }

            // As long as noTimout is undefiend or false, stop this function after 5s, return false
            if (new Date() > startTime + timeoutAmount && noTimout != true) {
                if(timeoutAmount == 5000){  // Only output if default, if value provided then it intended that it may timeout
                    console.error("%cTimed out waiting for EOTs! Clearing it: " + this.EOTs, "color: red");
                }else{
                    if(this.DEBUG_CONSOLE_ON) console.log("%cTimed out waiting for EOT! As maybe intended: " + this.EOTs, "color: orange");
                }
                this.clearEOTs();
                return false;
            }
            await new Promise(resolve => setTimeout(resolve, 75));
        }
    }


    async writeToDevice(stringToWrite){
        // Write the stringToWrite that is supposed to generate EOT
        await this.WRITER.write(this.TEXT_ENCODER.encode(stringToWrite));
    }


    // Pass true to restrict lines from entering _LINE_STORE during readLoop, and false to allow line to enter _LINE_STORE
    setFilter(filterOrNot){
        this._FILTER_STATE = filterOrNot;

        // Set collected lines string to smpty when filter enabled so functions can take advantage after setting false
        if(filterOrNot == true){
            this.COLLECTED_FILTERED_LINES = "";
        }
    }


    // Pass string that lineFormatter should look for to be able to invert this._FILTER_STATE,
    // useful for when need to write a command that may not generate a string or prompt when
    // in some initial state (like being in raw mode or maybe a running program and then trying to keyboard interrupt)
    // this._INVERT_FILTER_ON_STR reset when found to ""
    setFilterInvertStr(invertStr){
        this._INVERT_FILTER_ON_STR = invertStr;
        this._INVERT_FILTER_ON_STR_FLAG = true;
    }


    async writeToDeviceInNormal(cmd){
        // Only allow keyboard interrupts from user if EOT(s) set and a program is running (not when at idle terminal)
        // otherwise just send whatever the user sent
        if(cmd == '\u0003' && this.EOT_SET_FLAG == false){
            return;
        }

        // Don't allow any input while program is running (EOTs set) except for interrupt
        if(cmd != '\u0003' && this.EOT_SET_FLAG == true){
            return;
        }

        this.CALLBACK_DONT_INTERRUPT(); // Tell main.js not to allow user to send more connect/file operations/ etc
        this.setEOTs([this.EOT_NORMAL_PROMPT, this.EOT_CONTINUATION_END, this.EOT_RUNNING_FROM_KINTERRUPT, this.EOT_CMD_END_RAW_PROMPT]);
        await this.writeToDevice(cmd);      // Make sure commands passed to this (that are not ctrl cmd) have + "\r\n"
        await this.waitForSetEOT(false);
        this.CALLBACK_DONT_INTERRUPT(); // Tell main.js to allow user to send more connect/file operations/ etc
    }


    async interruptToNormal(){
        this.clearEOTs();    // Make sure any waiters are stopped if connect clicked again
        this.setFilter(true);

        // Can't wait on this, if in raw or normal mode, won't get prompt back, timeout too long,
        // only works if a program is running (returns to raw or (normal mode)?, not sure about 
        // forever program started from normal mode)
        this.setEOTs([this.EOT_NORMAL_PROMPT, this.EOT_RUNNING_FROM_KINTERRUPT]);
        await this.writeToDevice(this.CTRL_CMD_KINTERRUPT);     // Send interrupt to either normal propmt, raw prompt, or running program (DO NOT SPAM INTERRUPTS, MAY BREAK EOT FLAG BY CLEARING EARLY)
        await this.waitForSetEOT(false, 300);                   // If a program is running or it is in normal propmt, response is quick, otherwise wait 1/4s and timeout since was in raw and no response was given
        this.setFilter(false);

        // ***On first line, set EOT and start wait for EOT
        // this.setFilterInvertStr("MicroPython v1.15 on 2021-04-18; Raspberry Pi Pico with RP2040");  // Invert filter from true to false when finds string
        this.setEOTs([this.EOT_NORMAL_PROMPT]);
        await this.writeToDevice(this.CTRL_CMD_NORMALMODE + "\r");                                         // Place into normal mode to give user propmt, wait until prompt shows up
        await this.waitForSetEOT(false);
    }


    async interruptToRaw(){
        this.clearEOTs();    // Make sure any waiters are stopped if connect clicked again
        this.setFilter(true);

        // Can't wait on this, if in raw or normal mode, won't get prompt back, timeout too long,
        // only works if a program is running (returns to raw or (normal mode)?, not sure about 
        // forever program started from normal mode)
        this.setEOTs([this.EOT_NORMAL_PROMPT, this.EOT_RUNNING_FROM_KINTERRUPT]);
        await this.writeToDevice(this.CTRL_CMD_KINTERRUPT);     // Send interrupt to either normal propmt, raw prompt, or running program (DO NOT SPAM INTERRUPTS, MAY BREAK EOT FLAG BY CLEARING EARLY)
        await this.waitForSetEOT(false, 300);                   // If a program is running or it is in normal propmt, response is quick, otherwise wait 1/4s and timeout since was in raw and no response was given

        this.setEOTs([this.EOT_RAW_PROMPT]);
        await this.writeToDevice(this.CTRL_CMD_RAWMODE);
        await this.waitForSetEOT(false);
        this.setFilter(false);
    }


    async ensureNormalMode(){
        await this.interruptToNormal();

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

        var cmd2 = "import utime\n" +
        "i = 0\n" +
        "while(i < 50):\n" +
        "    print('A')\n" +
        "    utime.sleep_ms(250)\n" +
        "    i = i + 1";

        // this.setEOTs([this.EOT_NORMAL_PROMPT]);
        // await this.writeToDevice("help()" + "\r\n");
        // await this.waitForSetEOT(false);

        // this.setEOTs([this.EOT_RAW_PROMPT]);
        // await this.writeToDevice(this.CTRL_CMD_RAWMODE);
        // await this.waitForSetEOT(false);    // Should not take more than 5s, timeout if it does
        // this._REMOVING_RAW_OK_FLAG = true;

        // // this.setFilter(true);
        // this.setEOTs([this.EOT_CMD_END_RAW_PROMPT]);
        // await this.writeToDevice(cmd2 + "\x04");
        // await this.waitForSetEOT(true);     // Could take more than 5s to inf, do not timeout
        // this.setFilter(false);
    }


    // Provided a line, returns 1 if EOT, 0 otherwise
    checkForEOTs(line){
        for(var i=0; i<this.EOTs.length; i++){
            if(line == this.EOTs[i]){
                this.clearEOTs();    // Found EOT, clear it so if anything is waiting it will stop now
                return true;
            }
        }
        return false;
    }


    // This should be called for each line and last line to check if there is an EOT
    // or other special string that that should set flags or fire an event.
    // This should be used on lines regardless of _FILTER_STATE's state
    specialFormattedLineChecker(line){
        // If the invert filter str is equal to line, and the invert filter flag is set, invert the filter
        if(line == this._INVERT_FILTER_ON_STR && this._INVERT_FILTER_ON_STR_FLAG == true){
            if(this._FILTER_STATE == true){
                this._FILTER_STATE = false;
            }else{
                this._FILTER_STATE = true;
            }
            this._INVERT_FILTER_ON_STR = "";
            this._INVERT_FILTER_ON_STR_FLAG = false;
        }

        return this.checkForEOTs(line);      // Return 1 if EOT, 0 otherwise, allows inverting on EOT
    }


    // Tracks chunks and formats them into complete lines using '\r\n' as line end.
    // Expected input is UTF8 decoded string (meaning an ASCII string in UTF8 format)
    readLoopChunkFormatter(newChunk){
        this._CHUNKS += newChunk;                // Add fragment/chunk to current chunk selection
        var lines = this._CHUNKS.split('\r\n');  // Split the chunks up by newlines

        // Upon split of the combined chunk data, there could be an incomplete chunk at the end, for example:
        // 'Hello World 1\r\nHello World 2\r\nHello Wor'
        // After all but the last line (part of it at least), the last bit is reassigned to this._CHUNKS.
        // NOTE: if we had: 'Hello World 1\r\nHello World 2\r\n' it would split into ['Hello World 1', 'Hello World 2', ''] and thus _CHUNKS would = ''
        
        var handledEOT = false;
        var line = undefined;

        // Handle every line but the last
        while(lines.length > 1){
            // Remove 'OK' from first line (this flag is set after setting in raw and finding raw propmt)
            if(this._REMOVING_RAW_OK_FLAG == true){
                lines[0] = lines[0].substring(2);
                this._REMOVING_RAW_OK_FLAG = false;
            }

            // Get the next line from the split chunks
            line = lines.shift();
            var wasEOT = this.specialFormattedLineChecker(line);

            if(this._FILTER_STATE == false){
                if(this.DEBUG_CONSOLE_ON) console.log(line);
                if(wasEOT == false){
                    this.CALLBACK_PRINT(line);
                }
            }else if(wasEOT == false){
                // Collecte lines that were filtered from being printed/output
                this.COLLECTED_FILTERED_LINES += line;
            }
            if(wasEOT){
                if(this.DEBUG_CONSOLE_ON) console.log("%cEND! filter: " + this._FILTER_STATE.toString(), "color: orange");
                this.CALLBACK_PROMPT(line, this._FILTER_STATE);
                handledEOT = true;
            }
        }

        // If there was a split a bit is left over, reassign
        // If there was not a split, the first element contains the non split string, reassign
        this._CHUNKS = lines[0];

        // If we are at the last data, see if its an EOT and should be output right away, also see if any of the other special strings
        if(this.specialFormattedLineChecker(this._CHUNKS) && handledEOT == false){
            if(this._FILTER_STATE == false){
                if(this.DEBUG_CONSOLE_ON) console.log(this._CHUNKS);
                // this.CALLBACK_PRINT(this._CHUNKS);
            }
            if(this.DEBUG_CONSOLE_ON) console.log("%cEND! filter: " + this._FILTER_STATE.toString(), "color: orange");
            this.CALLBACK_PROMPT(this._CHUNKS, this._FILTER_STATE);
            this._CHUNKS = "";  // Since the last line data being dispaly/output was handled in the case of EOT, erase any existing data, all handled
        }
    }


    // Reads chunks and handles reader fail, serial being disconnected. Feeds chunks to function to format into clean lines
    async readLoop(){
        // Everytime the readloop is started means a device was connect/reconnected, reset variables states in case of reconnect
        this._CHUNKS = "";

        while (this.PORT.readable) {
            // Check if reader locked (can be locked if try to connect again and port was already open but reader wasn't released)
            if(!this.PORT.readable.locked){
                this.READER = this.PORT.readable.getReader();
            }
            
            try {
                while (true) {
                    // https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultReader/read
                    const { value, done } = await this.READER.read();
                    if (done) {
                        // Allow the serial port to be closed later.
                        this.READER.releaseLock();
                        break;
                    }
                    if (value) {
                        // Reading from serial is done in chunks of a inconsistent/unguaranteed size,
                        // a line is finished when a newline is found. However, more than one newline
                        // could ocur in a read, handle that
                        this.readLoopChunkFormatter(this.TEXT_DECODER.decode(value));
                    }
                }
            } catch (err) {
                // TODO: Handle non-fatal read error.
                if(err.name == "NetworkError"){
                    if(this.DEBUG_CONSOLE_ON) console.log("%cDevice most likely unplugged, handled", "color: yellow");
                }
            }
        }
        if(this.DEBUG_CONSOLE_ON) console.log("%cCurrent read loop ended!", "color: yellow");
    }


    // If this.PORT is not undefined, and this is called, open the port
    async openPort(){
        if(this.PORT != undefined){
            try{
                await this.PORT.open({ baudRate: 115200 });             // If throws at this point (like port already being opened, will not do rest)
                this.WRITER = await this.PORT.writable.getWriter();     // Make a writer since this is the first time port opened
                this.readLoop();                                        // Start read loop

                this.CALLBACK_CONNECTED();
                this.CONNECTED = true;
                await this.ensureNormalMode();
                await this.getOnBoardFSTree();
                // await this.writeToDevice('\r');
            }catch(err){
                if(err.name == "InvalidStateError"){
                    if(this.DEBUG_CONSOLE_ON) console.log("%cPort already open, everything good to go!", "color: lime");
                    
                    // Port already open so a writer already exists, readLoop must already be active too, just configure device
                    this.CALLBACK_CONNECTED();
                    this.CONNECTED = true;
                    await this.ensureNormalMode();
                    await this.getOnBoardFSTree();
                    // await this.writeToDevice('\r');
                }else if(err.name == "NetworkError"){
                    if(this.DEBUG_CONSOLE_ON) console.log("%cOpening port failed, is another application accessing this device/port?", "color: red");
                }
            }
        }else{
            console.error("Port undefined!");
        }
    }


    // Tries to auto connect to serial if finds port with matching information, returns true if works, false otherwise
    async tryAutoConnect(){
        if(this.DEBUG_CONSOLE_ON) console.log("%cTrying auto connect...", "color: yellow");
        var ports = await navigator.serial.getPorts();
        if(Array.isArray(ports)){
            for(var ip=0; ip<ports.length; ports++){
                if(this.checkPortMatching(ports[ip])){
                    this.PORT = ports[ip];
                    if(this.DEBUG_CONSOLE_ON) console.log("%cAuto connected!", "color: lime");
                    await this.openPort();
                    return true;
                }
            }
        }else{
            if(this.checkPortmatching(ports)){
                this.PORT = ports[ip];
                if(this.DEBUG_CONSOLE_ON) console.log("%cAuto connected!", "color: lime");
                await this.openPort();
                return true;
            }
        }
        if(this.DEBUG_CONSOLE_ON) console.log("%cNot Auto connected...", "color: yellow");
        return false;
    }

    
    // Connect serial automatically if there is a paired matching port already, otherwise ask user to pick port from filtered selection
    async connect(){
        this.CALLBACK_DONT_INTERRUPT(); // Tell main.JS not to allow user to send more connect/file operations/ etc

        this.clearEOTs();
        if(!await this.tryAutoConnect()){
            const usbVendorId = this.USB_VENDOR_ID;
            const usbProductId = this.USB_PRODUCT_ID;

            // If user doesn't select a port, do not error page (what happens if there is an error whiel connecting though?),
            // don't need to check if port matches since filtered anyway
            if(this.DEBUG_CONSOLE_ON) console.log("%cTrying manual connect..", "color: yellow");
            this.MANUALLY_CONNECTING = true;        // Set this so connect event listener does not get an unintended device
            await navigator.serial.requestPort({filters: [{ usbVendorId, usbProductId }]}).then(async (port) => {
                this.PORT = port;
                if(this.DEBUG_CONSOLE_ON) console.log("%cManually connected!", "color: lime");
                this.MANUALLY_CONNECTING = false;   // Reset so auto connect can have its chance again
                await this.openPort();
            }).catch((err) => {
                if(this.DEBUG_CONSOLE_ON) console.log("%cNot manually connected...", "color: yellow");
                // if(this.DEBUG_CONSOLE_ON) console.log(err);
                this.MANUALLY_CONNECTING = false;   // Reset so auto connect can have its chance again
            });
            this.MANUALLY_CONNECTING = false;       // Reset so auto connect can have its chance again (this one may never be reached, not sure how promises work here)
        }

        this.CALLBACK_DONT_INTERRUPT(); // Tell main.JS to allow user to send more connect/file operations/ etc
    }


    async getOnBoardFSTree(){
        await this.interruptToRaw();

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
        "        if(os.stat(top + extend + dirent)[0] == 32768):\n" +   // File
        "            structure[dir][item_index] = {\"F\": dirent}\n" +
        "            item_index = item_index + 1\n" +
        "        elif(os.stat(top + extend + dirent)[0] == 16384):\n" + // Dir
        "            structure[dir][item_index] = {\"D\": dirent}\n" +
        "            item_index = item_index + 1\n" +
        "            walk(top + extend + dirent, structure[dir], dirent)\n" +
        "    return structure\n" +
        "struct = {}\n" +
        "print(ujson.dumps(walk(\"\", struct, \"\")))";

        // Get into raw mode
        this.setFilter(true);
        this.setEOTs([this.EOT_RAW_PROMPT]);
        await this.writeToDevice(this.CTRL_CMD_RAWMODE);
        await this.waitForSetEOT(false);    // Should not take more than 5s, timeout if it does
        this._REMOVING_RAW_OK_FLAG = true;

        // Execute FS get command
        this.setFilter(true);
        this.setEOTs([this.EOT_CMD_END_RAW_PROMPT]);
        await this.writeToDevice(cmd + "\x04");
        await this.waitForSetEOT(false);     // Should not take more than 5s, timeout if it does
        this.CALLBACK_FS_UPDATE(this.COLLECTED_FILTERED_LINES);

        // Get back into normal mode
        this.setEOTs([this.EOT_NORMAL_PROMPT]);
        await this.writeToDevice(this.CTRL_CMD_NORMALMODE);
        await this.waitForSetEOT(false);    // Should not take more than 5s, timeout if it does
        this.setFilter(false);
    }


    // Given a path, delete it provided the path
    // is designated as a file or dir
    async deleteFileOrDir(path, fileOrDir){
        this.CALLBACK_DONT_INTERRUPT();
        await this.interruptToRaw();

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

        // Get into raw mode
        this.setFilter(true);
        this.setEOTs([this.EOT_RAW_PROMPT]);
        await this.writeToDevice(this.CTRL_CMD_RAWMODE);
        await this.waitForSetEOT(false);    // Should not take more than 5s, timeout if it does
        this._REMOVING_RAW_OK_FLAG = true;

        // Execute delete command
        this.setFilter(true);
        this.setEOTs([this.EOT_CMD_END_RAW_PROMPT]);
        await this.writeToDevice(cmd + "\x04");
        await this.waitForSetEOT(false);     // Should not take more than 5s, timeout if it does

        // Get back into normal mode
        this.setEOTs([this.EOT_NORMAL_PROMPT]);
        await this.writeToDevice(this.CTRL_CMD_NORMALMODE);
        await this.waitForSetEOT(false);    // Should not take more than 5s, timeout if it does
        this.setFilter(false);

        // Update the FS tree
        await this.getOnBoardFSTree();
        this.CALLBACK_DONT_INTERRUPT();
    }


    async getOnBoardFileContents(fullPath){
        this.CALLBACK_DONT_INTERRUPT();
        // Make the path hex so that string combination is less likely to mess up
        fullPath = "\\x" + fullPath.convertToHex('\\x');

        var cmd =   "onboard_file = open(\"\"\"" + fullPath + "\"\"\", 'r')\n" +
                    "contents = onboard_file.read()\n" +
                    "onboard_file.close()\n" +
                    "print(contents)\n";

        // Get into raw mode
        this.setFilter(true);
        this.setEOTs([this.EOT_RAW_PROMPT]);
        await this.writeToDevice(this.CTRL_CMD_RAWMODE);
        await this.waitForSetEOT(false);    // Should not take more than 5s, timeout if it does
        this._REMOVING_RAW_OK_FLAG = true;

        // Execute FS get command
        this.setFilter(true);
        this.setEOTs([this.EOT_CMD_END_RAW_PROMPT]);
        await this.writeToDevice(cmd + "\x04");
        await this.waitForSetEOT(false);     // Should not take more than 5s, timeout if it does
        var tempCollectedLines = this.COLLECTED_FILTERED_LINES;

        // Get back into normal mode
        this.setEOTs([this.EOT_NORMAL_PROMPT]);
        await this.writeToDevice(this.CTRL_CMD_NORMALMODE);
        await this.waitForSetEOT(false);    // Should not take more than 5s, timeout if it does
        this.setFilter(false);
        this.CALLBACK_DONT_INTERRUPT();
        return tempCollectedLines;
    }


    async uploadFileToGamesFolder(fileName, fileContents, projectName){
        if(fileName == ""){
            return;
        }

        if(this.CONNECTED == false){
            return;
        }

        this.CALLBACK_DONT_INTERRUPT(); // Tell main.JS not to allow user to send more connect/file operations/ etc
        // Get into raw mode
        this.setFilter(true);
        this.setEOTs([this.EOT_RAW_PROMPT]);
        await this.writeToDevice(this.CTRL_CMD_RAWMODE);
        await this.waitForSetEOT(false);    // Should not take more than 5s, timeout if it does
        this._REMOVING_RAW_OK_FLAG = true;

        // Build check games dir, check project dir, and open file command
        var checkGamesOpenFileCMD = "import uos\n" +
                  "try:\n" +
                  "    uos.mkdir('" + "Games" + "')\n" +
                  "except OSError:\n" +
                  "    print('Games directory already exists, did not make a new folder')\n" +
                  "try:\n" +
                  "    uos.mkdir('" + "Games/" + projectName + "')\n" +
                  "except OSError:\n" +
                  "    print('Project directory already exists, did not make a new folder')\n" +
                  "onboard_file = open('" + "Games/" + projectName + "/" + fileName + "','wb')\n" +
                  "print('')";

        // Execute check games dir, check project dir, and open file command
        // this.setFilter(false);
        this.setEOTs([this.EOT_CMD_END_RAW_PROMPT]);
        await this.writeToDevice(checkGamesOpenFileCMD + "\x04");
        await this.waitForSetEOT(false);     // Should not take more than 5s, timeout if it does

        // First, split string for \n, \r, and \r\n (lineseps)
        fileContents = fileContents.split(/\r\n|\n|\r/);

        // Recombine everything with correct newlines
        var combined = "";
        for(var row=0; row<fileContents.length; row++){
            // Make sure not to add an extra newline at end
            if(row != fileContents.length - 1){
                combined = combined + fileContents[row] + "\r\n";
            }else{
                combined = combined + fileContents[row];
            }
        }
        combined = "\\x" + combined.convertToHex('\\x');

 
        // Send the whole file to Thumby, as Thonny does, in chunks
        // Do the actual sending of file data now that the file is open, use .slice over
        // .substr or .substring since those modify the original string and take WAY longer
        for(var b=0; b<Math.ceil(combined.length/this.THUMBY_SEND_BLOCK_SIZE); b++){
            this.setEOTs([this.EOT_CMD_END_RAW_PROMPT]);
            var writeDataCMD = "onboard_file.write(b\"" + combined.slice(b*this.THUMBY_SEND_BLOCK_SIZE, (b+1)*this.THUMBY_SEND_BLOCK_SIZE) + "\")\n" +
                               "print('')";
            await this.writeToDevice(writeDataCMD + "\x04");
            await this.waitForSetEOT(false);
        }


        // Close the file that was just written to
        var closeFileCMD = "onboard_file.close()\n" +
                           "print('')";
        this.setEOTs([this.EOT_CMD_END_RAW_PROMPT]);
        await this.writeToDevice(closeFileCMD + "\x04");
        await this.waitForSetEOT(false);     // Should not take more than 5s, timeout if it does


        // Get back into normal mode
        this.setEOTs([this.EOT_NORMAL_PROMPT]);
        await this.writeToDevice(this.CTRL_CMD_NORMALMODE);
        await this.waitForSetEOT(false);    // Should not take more than 5s, timeout if it does
        this.setFilter(false);
        this.CALLBACK_DONT_INTERRUPT(); // Tell main.JS to allow user to send more connect/file operations/ etc
    }


    // Sends commands to RP2040 to rename file at given path to provided new name
    async renameFile(oldPath, newName){
        if(oldPath != undefined && newName != undefined){
            this.CALLBACK_DONT_INTERRUPT();
            var newPath = oldPath.substring(0, oldPath.lastIndexOf("/")+1) + newName;
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
            
            // Get into raw mode
            this.setFilter(true);
            this.setEOTs([this.EOT_RAW_PROMPT]);
            await this.writeToDevice(this.CTRL_CMD_RAWMODE);
            await this.waitForSetEOT(false);    // Should not take more than 5s, timeout if it does
            this._REMOVING_RAW_OK_FLAG = true;

            // Execute rename get command
            this.setEOTs([this.EOT_CMD_END_RAW_PROMPT]);
            await this.writeToDevice(cmd + "\x04");
            await this.waitForSetEOT(false);     // Should not take more than 5s, timeout if it does

            // Get back into normal mode
            this.setEOTs([this.EOT_NORMAL_PROMPT]);
            await this.writeToDevice(this.CTRL_CMD_NORMALMODE);
            await this.waitForSetEOT(false);    // Should not take more than 5s, timeout if it does
            this.setFilter(false);

            await this.getOnBoardFSTree();

            this.CALLBACK_DONT_INTERRUPT();
        }
    }


    async executeLines(lines){
        if(lines != undefined && lines != "" && this.CONNECTED == true){
            this.CALLBACK_DONT_INTERRUPT();

            // Get into raw mode
            this.setFilter(true);
            this.setEOTs([this.EOT_RAW_PROMPT]);
            await this.writeToDevice(this.CTRL_CMD_RAWMODE);
            await this.waitForSetEOT(false);    // Should not take more than 5s, timeout if it does
            this._REMOVING_RAW_OK_FLAG = true;
            this.setFilter(false);

            // Execute rename get command
            this.setEOTs([this.EOT_CMD_END_RAW_PROMPT, this.EOT_RUNNING_FROM_KINTERRUPT]);
            await this.writeToDevice(lines + "\x04");
            await this.waitForSetEOT(true);     // Should not take more than 5s, timeout if it does

            // Get back into normal mode
            // this.setFilter(true);
            this.setEOTs([this.EOT_NORMAL_PROMPT]);
            await this.writeToDevice(this.CTRL_CMD_NORMALMODE);
            await this.waitForSetEOT(false);    // Should not take more than 5s, timeout if it does
            // this.setFilter(false);

            await this.getOnBoardFSTree();

            this.CALLBACK_DONT_INTERRUPT();
        }else{
            alert("Thumby not connected or editor has no code, not executing");
        }
    }
}
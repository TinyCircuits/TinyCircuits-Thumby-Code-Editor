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
        this.DEBUG_CONSOLE_ON = true;

        // Used to stop interaction with the RP2040
        this.BUSY = false;

        // ### CALLBACKS ###
        // Functions defined outside this module but used inside
        this.onData = undefined;
        this.onConnect = undefined;
        this.onDisconnect = undefined;
        this.onFSData = undefined;

        // ### MicroPython Control Commands ###
        // DOCS: https://docs.micropython.org/en/latest/esp8266/tutorial/repl.html#other-control-commands
        // UNICODE CTRL CHARS COMBOS: https://unicodelookup.com/#ctrl
        this.CTRL_CMD_RAWMODE = "\x01";     // ctrl-A (use for wating to get file information, upload files, run custom python tool, etc)
        this.CTRL_CMD_NORMALMODE = "\x02";  // ctrl-B (user friendly terminal)
        this.CTRL_CMD_KINTERRUPT = "\x03";  // ctrl-C (stops a running program)
        this.CTRL_CMD_SOFTRESET = "\x04";   // ctrl-D (soft reset the board, required after a command is entered in raw!)
        this.CTRL_CMD_PASTEMODE = "\x05";

        // Use to disable auto connect if manual connecting in progress
        this.MANNUALLY_CONNECTING = false;

        this.READ_UNTIL_STRING = "";    // Set to something not "" to halt until this.READ_UNTIL_STRING found and collect lines in this.COLLECTED_DATA
        this.COLLECTED_DATA = "";

        // Check if browser can use WebSerial
        if ("serial" in navigator) {
            if(this.DEBUG_CONSOLE_ON) console.log("Serial supported in this browser!");
        } else {
            alert("Serial NOT supported in your browser! Use Microsoft Edge or Google Chrome");
            return;
        }

        
        // Attempt auto-connect when page validated device plugged in, do not start manual selection menu
        navigator.serial.addEventListener('connect', (e) => {
            if(this.MANNUALLY_CONNECTING  == false){
                this.tryAutoConnect();
            }
        });

        
        // Probably set flags/states when page validated device removed
        navigator.serial.addEventListener('disconnect', (e) => {
            var disconnectedPort = e.target;
            if(this.checkPortMatching(disconnectedPort)){
                if(this.DEBUG_CONSOLE_ON) console.log("%cDisconnected MicroPython!", "color: yellow");
                this.WRITER = undefined;
                this.READER = undefined;
                this.PORT = undefined;
                this.onDisconnect();
            }
        });

        // Use connect button to start connect process or rate limit button presses
        document.getElementById("IDConnectThumbyBTN").addEventListener("click", (event) => {
            document.getElementById("IDConnectThumbyBTN").disabled = true;
            this.connect();
            setTimeout((event) => {document.getElementById("IDConnectThumbyBTN").disabled = false;}, 650);
        })
    }


    // Returns tru if product and vendor ID match for MicroPython, otherwise false #
    checkPortMatching(port){
        var info = port.getInfo();
        if(info.usbProductId == this.USB_PRODUCT_ID && info.usbVendorId == this.USB_VENDOR_ID){
            return true;
        }
        return false;
    }


    startReaduntil(str){
        this.READ_UNTIL_STRING = str;
        this.COLLECTED_DATA = "";
    }


    // Will stall js until finds line set by startReaduntil().
    // Providing an offset will skip subsequent lines after the
    // found line set by startReaduntil.
    // Loops forever if never finds line set by startReaduntil()
    async haltUntilRead(omitOffset = 0){
        this.BUSY = true;
        // Re-evaluate collected data for readUntil line every 85ms
        while (true) {

            var tempLines = this.COLLECTED_DATA.split('\r\n');

            for(var i=0; i<tempLines.length; i++){
                if(tempLines[i] == this.READ_UNTIL_STRING || this.READ_UNTIL_STRING == "" || tempLines[i].indexOf(this.READ_UNTIL_STRING) != -1){
                    this.READ_UNTIL_STRING = "";

                    // Output the rest of the lines that should not be hidden
                    // Should find a way to do this without adding newlines again
                    for(var j=i+omitOffset; j<tempLines.length; j++){
                        if(j != tempLines.length-1){
                            this.onData(tempLines[j] + "\r\n");
                        }else{
                            this.onData(tempLines[j]);
                        }
                    }

                    this.BUSY = false;
                    return tempLines.slice(0, i+omitOffset);    // Return all lines collected just before the line that switch off haltUntil()
                }
            }

            await new Promise(resolve => setTimeout(resolve, 85));
        }
        this.BUSY = false;
    }


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
                        console.log(this.TEXT_DECODER.decode(value));

                        // Collect lines when read until active, otherwise, output to terminal
                        if(this.READ_UNTIL_STRING == ""){
                            this.onData(this.TEXT_DECODER.decode(value));
                        }else{
                            this.COLLECTED_DATA += this.TEXT_DECODER.decode(value);
                        }
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


    async writeToDevice(str){
        if(this.WRITER != undefined){
            await this.WRITER.write(this.TEXT_ENCODER.encode(str));
        }else{
            if(this.DEBUG_CONSOLE_ON) console.log("%cNot writing to device, none connected", "color: red");
        }
    }

    async softReset(){
        this.BUSY = true;
        this.startReaduntil("MPY: soft reboot");
        await this.writeToDevice(this.CTRL_CMD_SOFTRESET);
        await this.haltUntilRead(1);
        this.BUSY = false;
    }

    // https://github.com/micropython/micropython/blob/master/tools/pyboard.py#L325
    async getToNormal(omitOffset = 0){
        this.startReaduntil("Raspberry Pi Pico with RP2040");
        await this.writeToDevice("\r" + this.CTRL_CMD_KINTERRUPT + this.CTRL_CMD_KINTERRUPT);  // ctrl-C twice: interrupt any running program
        await this.writeToDevice(this.CTRL_CMD_NORMALMODE);
        await this.haltUntilRead(omitOffset);
    }

    async getToRaw(){
        this.startReaduntil("raw REPL; CTRL-B to exit");
        await this.writeToDevice("\r" + this.CTRL_CMD_KINTERRUPT + this.CTRL_CMD_KINTERRUPT);  // ctrl-C twice: interrupt any running program
        await this.writeToDevice(this.CTRL_CMD_RAWMODE);
        await this.haltUntilRead(2);
    }



    async getOnBoardFSTree(){
        if(this.BUSY == true){
            return;
        }
        this.BUSY = true;

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
        await this.getToRaw();

        // Not really needed for hiding output to terminal since raw does not echo
        // but is needed to only grab the FS lines/data
        this.startReaduntil(">");
        await this.writeToDevice(cmd + "\x04");
        var hiddenLines = await this.haltUntilRead(1);
        this.onFSData(hiddenLines[0].substring(2));

        // Get back into normal mode and omit the 3 lines from the normal message,
        // don't want to repeat (assumes already on a normal prompt)
        await this.getToNormal(3);
        this.BUSY = false;
    }



    // Given a path, delete it on RP2040
    async deleteFileOrDir(path){
        if(this.BUSY == true){
            return;
        }
        this.BUSY = true;

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
        await this.getToRaw();

        // Not really needed for hiding output to terminal since raw does not echo
        // but is needed to only grab the FS lines/data
        this.startReaduntil(">");
        await this.writeToDevice(cmd + "\x04");
        await this.haltUntilRead(1);

        // Get back into normal mode and omit the 3 lines from the normal message,
        // don't want to repeat (assumes already on a normal prompt)
        await this.getToNormal(3);
        this.BUSY = false;

        // Make sure to update the filesystem after modifying it
        await this.getOnBoardFSTree();
    }


    async downloadFile(filePath) {
        let response = await fetch(filePath);
            
        if(response.status != 200) {
            throw new Error("Server Error");
        }
            
        // read response stream as text
        let text_data = await response.text();

        return text_data;
    }


    async deleteAllFiles(){
        if(this.BUSY == true){
            return;
        }
        this.BUSY = true;

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
                    "filelist = os.listdir('/')\n" +
                    "for f in filelist:\n" +
                    "    rm('/' + f)";

        // Get into raw mode
        await this.getToRaw();

        // Not really needed for hiding output to terminal since raw does not echo
        // but is needed to only grab the FS lines/data
        this.startReaduntil(">");
        await this.writeToDevice(cmd + "\x04");
        await this.haltUntilRead(1);

        // Get back into normal mode and omit the 3 lines from the normal message,
        // don't want to repeat (assumes already on a normal prompt)
        await this.getToNormal(3);
        this.BUSY = false;
    }


    async buildPath(path){
        if(this.BUSY == true){
            return;
        }
        this.BUSY = true;

        // Got through and make sure entire path already exists
        var cmd = "import uos\n" +
                  "try:\n" +
                  "    path = '" + path + "'\n" +
                  "    path = path.split('/')\n" +
                  "    builtPath = path[0]\n" +
                  "    for i in range(1, len(path)+1):\n" +
                  "        try:\n" +
                  "            uos.mkdir(builtPath)\n" +
                  "        except OSError:\n" +
                  "            print('Directory already exists, did not make a new folder')\n" +
                  "        if i < len(path):\n" +
                  "            builtPath = builtPath + '/' + path[i]\n" +
                  "except Exception as err:\n" +
                  "    print('Some kind of error while building path...' + err)";

        // Get into raw mode
        await this.getToRaw();

        // Not really needed for hiding output to terminal since raw does not echo
        // but is needed to only grab the FS lines/data
        this.startReaduntil(">");
        await this.writeToDevice(cmd + "\x04");
        await this.haltUntilRead(1);

        // Get back into normal mode and omit the 3 lines from the normal message,
        // don't want to repeat (assumes already on a normal prompt)
        await this.getToNormal(3);

        this.BUSY = false;
    }


    async uploadFile(filePath, fileContents){

        var pathToFile = filePath.substring(0, filePath.lastIndexOf('/'));
        await this.buildPath(pathToFile);

        if(this.BUSY == true){
            return;
        }
        this.BUSY = true;

        // Dont need to check if directory exists, already created by buildPath
        var openFileCmd =   "import uos\n" +
                            "onboard_file = open('" + filePath + "','wb')";

        var closeFileCmd =  "onboard_file.close()";

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


        // Get into raw mode
        await this.getToRaw();

        // Not really needed for hiding output to terminal since raw does not echo
        // but is needed to only grab the FS lines/data
        this.startReaduntil(">");
        await this.writeToDevice(openFileCmd + "\x04");
        await this.haltUntilRead(1);

        // Send the whole file to Thumby, as Thonny does, in chunks
        // Do the actual sending of file data now that the file is open, use .slice over
        // .substr or .substring since those modify the original string and take WAY longer
        for(var b=0; b<Math.ceil(combined.length/this.THUMBY_SEND_BLOCK_SIZE); b++){
            var writeDataCMD = "onboard_file.write(b\"" + combined.slice(b*this.THUMBY_SEND_BLOCK_SIZE, (b+1)*this.THUMBY_SEND_BLOCK_SIZE) + "\")\n";
            this.startReaduntil(">");
            await this.writeToDevice(writeDataCMD + "\x04");
            // await this.haltUntilRead(1);
        }

        this.startReaduntil(">");
        await this.writeToDevice(closeFileCmd + "\x04");
        await this.haltUntilRead(1);

        // Get back into normal mode and omit the 3 lines from the normal message,
        // don't want to repeat (assumes already on a normal prompt)
        await this.getToNormal(3);
        this.BUSY = false;
    }


    async format(){
        await this.deleteAllFiles();
        await this.getOnBoardFSTree();

        await this.uploadFile("Games/RFSD/RFSD.py", await this.downloadFile("/ThumbyGames/Games/RFSD/RFSD.py"));
        await this.uploadFile("Games/TinyAnnelid/TinyAnnelid.py", await this.downloadFile("/ThumbyGames/Games/TinyAnnelid/TinyAnnelid.py"));
        await this.uploadFile("Games/TinyDelver/TinyDelver.py", await this.downloadFile("/ThumbyGames/Games/TinyDelver/TinyDelver.py"));
        await this.uploadFile("Games/TinysaurRun/TinysaurRun.py", await this.downloadFile("/ThumbyGames/Games/TinysaurRun/TinysaurRun.py"));
        await this.uploadFile("Games/TinyTris/TinyTris.py", await this.downloadFile("/ThumbyGames/Games/TinyTris/TinyTris.py"));
        await this.uploadFile("lib/ssd1306.py", await this.downloadFile("/ThumbyGames/lib/ssd1306.py"));
        await this.uploadFile("lib/thumby.py", await this.downloadFile("/ThumbyGames/lib/thumby.py"));
        await this.uploadFile("main.py", await this.downloadFile("/ThumbyGames/main.py"));
        await this.uploadFile("thumby.cfg", await this.downloadFile("/ThumbyGames/thumby.cfg"));

        // Make sure to update the filesystem after modifying it
        this.getOnBoardFSTree();
    }


    async getFileContents(filePath){
        if(this.BUSY == true){
            return;
        }
        this.BUSY = true;

        var cmd =   "chunk_size = 1024\n" +
                    "onboard_file = open('" + filePath + "', 'r')\n" +
                    "while True:\n" +
                    "    data = onboard_file.read(chunk_size)\n" +
                    "    if not data:\n" +
                    "        break\n" +
                    "    print(data)\n" +
                    "onboard_file.close()\n" +
                    "print('###DONE READING FILE###')\n";

        // Get into raw mode
        await this.getToRaw();

        // Not really needed for hiding output to terminal since raw does not echo
        // but is needed to only grab the FS lines/data
        this.startReaduntil("###DONE READING FILE###");
        await this.writeToDevice(cmd + "\x04");
        var fileContents = await this.haltUntilRead(2);
        fileContents[0] = fileContents[0].substring(2);
        fileContents = fileContents.splice(0, fileContents.length - 3);

        // Get back into normal mode and omit the 3 lines from the normal message,
        // don't want to repeat (assumes already on a normal prompt)
        await this.getToNormal(3);
        this.BUSY = false;
        return fileContents.join('');
    }


    async writeConnectedMessage(){
        if(this.BUSY == true){
            return;
        }
        this.BUSY = true;

        var cmd =   "import thumby;\n" +
                    "thumby.display.drawText('Connected',0,16,1)\n" +
                    "thumby.display.update()";

        // Get into raw mode
        await this.getToRaw();

        // Not really needed for hiding output to terminal since raw does not echo
        // but is needed to only grab the FS lines/data
        this.startReaduntil(">");
        await this.writeToDevice(cmd + "\x04");
        await this.haltUntilRead(2);

        // Get back into normal mode and omit the 3 lines from the normal message,
        // don't want to repeat (assumes already on a normal prompt)
        await this.getToNormal(3);
        this.BUSY = false;
    }


    async openPort(){
        if(this.PORT != undefined){
            try{
                await this.PORT.open({ baudRate: 115200 });
                this.WRITER = await this.PORT.writable.getWriter();     // Make a writer since this is the first time port opened
                this.readLoop();                                        // Start read loop

                this.onConnect();
                await this.getToNormal();
                await this.getOnBoardFSTree();
                // await this.writeConnectedMessage();

            }catch(err){
                if(err.name == "InvalidStateError"){
                    if(this.DEBUG_CONSOLE_ON) console.log("%cPort already open, everything good to go!", "color: lime");

                    this.onConnect();
                    await this.getToNormal();
                    await this.getOnBoardFSTree();
                    // await this.writeConnectedMessage();
                    
                }else if(err.name == "NetworkError"){
                    if(this.DEBUG_CONSOLE_ON) console.log("%cOpening port failed, is another application accessing this device/port?", "color: red");
                }
            }
        }else{
            console.error("Port undefined!");
        }
    }


    async tryAutoConnect(){
        if(this.BUSY == true){
            return;
        }

        this.BUSY = true;

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

        this.BUSY = false;
        return false;
    }

    
    async connect(){
        if(this.BUSY == true){
            return;
        }

        var autoConnected = await this.tryAutoConnect();
        
        const usbVendorId = this.USB_VENDOR_ID;
        const usbProductId = this.USB_PRODUCT_ID;

        if(!autoConnected){
            this.BUSY = true;
            this.MANNUALLY_CONNECTING = true;
            if(this.DEBUG_CONSOLE_ON) console.log("%cTrying manual connect..", "color: yellow");

            await navigator.serial.requestPort({filters: [{ usbVendorId, usbProductId }]}).then(async (port) => {
                this.PORT = port;
                if(this.DEBUG_CONSOLE_ON) console.log("%cManually connected!", "color: lime");
                await this.openPort();

            }).catch((err) => {
                if(this.DEBUG_CONSOLE_ON) console.log("%cNot manually connected...", "color: yellow");
            });
            this.MANNUALLY_CONNECTING = false;
            this.BUSY = false;
        }
    }
}
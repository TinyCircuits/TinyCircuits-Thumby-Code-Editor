// ##### ACTIVE_TERMINAL_WRAPPER.js #####
// Wraps the Xterm.js class into a class that handles making
// the terminal look active. Only implements functions of
// Xterm.js that are relevent to the Thumby Manager project


class ActiveTerminal{

    // Define common objects used within this class right on object init
    // and open a terminal with addon to fit to parent HTML container
    constructor(terminalParentElement){
        this.TERM = new Terminal();                                         // The Xterm.js object
        this.FITADDON = new FitAddon.FitAddon();                            // The Xterm fit addon object
        this.TERM.loadAddon(this.FITADDON);                                 // Load fit addon in Xterm.js
        this.TERM.open(document.getElementById(terminalParentElement));     // Hook Xterm.js onto HTML object 'terminal'
        this.FITADDON.fit();                                                // Fit the terminal once at init using addon
        this.CURRENT_LINE = "";                                             // The current line the user is typing

        // Used to keep https://docs.micropython.org/en/latest/esp8266/tutorial/repl.html#line-continuation-and-auto-indent working
        this.LAST_PROMPT = undefined;

        // Depending on the state of the module, the user may
        // or may not be allowed to input and execute commands
        // (only allowed in PYTHON state)
        this.STATES = {
            PYTHON: 0,
            OUTPUT: 1,
        }
        this.STATE = this.STATES.OUTPUT;    // Set so user can't interact with terminal by default

        //listen for window resize event and re-fit terminal
        window.addEventListener('resize', this.autoFit.bind(this));

        // Write information to terminal on page load for user
        // and setup callbacks for typing into terminal
        this.initTerminalView();

        // ### CALLBACKS ###
        // These are outside functions called by this module at certain states/times
        this.CALLBACK_WRITE_CMD = undefined;
    }


    callbackSetWriteCMD(callback){
        this.CALLBACK_WRITE_CMD = callback;
    }


    setLightTheme(){
        this.TERM.setOption('theme', {
            background: '#fdf6e3',
            cursor: "gray",
            foreground: "black"
        });
    }

    setDarkTheme(){
        this.TERM.setOption('theme', {
            background: 'black',
            cursor: "white",
            foreground: "white"
        });
    }


    // Resizes the terminal to fit its parent container
    autoFit(){
        this.FITADDON.fit();

        // Need to resize rows to one less since will go off screen in some cases otherwise
        // this.TERM.resize(this.TERM.cols, this.TERM.rows);
    }


    // Wrtie some information for the user and setup callback
    // to handle typing and hitting return/enter
    initTerminalView(){
        if (this.TERM._initialized) {
            return;
        }
    
        this.TERM._initialized = true;
    
        this.TERM.onData(e => {
            if(this.STATE != this.STATES.PYTHON){
                return;
            }
            
            switch (e) {
            case '\r':                          // Enter
                if(this.CURRENT_LINE != ""){
                    this.CALLBACK_WRITE_CMD(this.CURRENT_LINE + "\r");

                    // https://stackoverflow.com/questions/56828930/how-to-remove-the-last-line-in-xterm-js
                    // https://stackoverflow.com/questions/1508490/erase-the-current-printed-console-line
                    // Remove last line and move up one (REPL will print what was entered, again)
                    this.TERM.write('\x1b[2K\r');
                    this.TERM.write(this.LAST_PROMPT);
                    // this.TERM.write('\x1b[A');
                    // this.prompt();
                }else{
                    this.CALLBACK_WRITE_CMD("\r");
                }
                // this.TERM.write('\r\n');
                // this.prompt();
                this.CURRENT_LINE = "";
                break;
            case '':                           // Ctrl-V (paste)
                throw "Paste (uncaught on purpose)";
            break;
            case '\u0005':                      // Ctrl+E
                this.CALLBACK_WRITE_CMD('\u0005');
                break;
            case '\u0004':                      // Ctrl+D
                this.CALLBACK_WRITE_CMD('\u0004');
                break;
            case '\u0003':                      // Ctrl+C
                this.CALLBACK_WRITE_CMD('\u0003'); // *** Trying to make interrupts work, might be xterm.js issue
                break;
            case '\u0002':                      // Ctrl+B
                this.CALLBACK_WRITE_CMD('\u0002');
                break;
            case '\u007F':                      // Backspace (DEL)
                // Do not delete the Python prompt
                if (this.TERM._core.buffer.x > 4 && this.STATE == this.STATES.PYTHON) {
                    this.TERM.write('\b \b');
                    this.CURRENT_LINE = this.CURRENT_LINE.slice(0, -1);
                }
                break;
            default:                            // Print all other characters
                this.TERM.write(e);
                this.CURRENT_LINE += e;
            }
        });
    }


    // Allow using write function of Xterm.js through this class
    write(data){
        this.TERM.write(data);
    }

    // Allow using writeln function of Xterm.js through this class
    writeln(data){
        this.TERM.writeln(data);
    }
    

    // Change leading symbol/string to represent that terminal
    // is a Python shell and can be typed in, or blank meaning
    // terminial is acting as an output
    prompt(prompt){
        if(this.STATE == this.STATES.PYTHON){
            // If provided a prompt from RP2040 module (meaning it was found by line checker)
            //  then use and save it otherwise just reuse the last prompt
            if(prompt != undefined){
                this.TERM.write(prompt);
                this.LAST_PROMPT = prompt;
            }else{
                this.TERM.write(this.LAST_PROMPT);
            }
        } else if (this.STATE == this.STATES.OUTPUT){
            this.TERM.write('\r\n');
        }
    }

    promptSpecial(){
        this.TERM.write('>>> ');
    }


    // Allow setting internal state externally
    setStatePython(){
        this.STATE = this.STATES.PYTHON;
    }

    setStateOutput(){
        this.STATE = this.STATES.OUTPUT;
    }
}
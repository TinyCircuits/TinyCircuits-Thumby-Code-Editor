// ##### ACTIVE_TERMINAL_WRAPPER.js #####
// Wraps the Xterm.js class into a class that handles making
// the terminal look active. Only implements functions of
// Xterm.js that are relevent to the Thumby Manager project


class ActiveTerminal{

    // Define common objects used within this class right on object init
    // and open a terminal with addon to fit to parent HTML container
    constructor(){
        this.TERM = new Terminal();                             // The Xterm.js object
        this.FITADDON = new FitAddon.FitAddon();                // The Xterm fit addon object
        this.TERM.loadAddon(this.FITADDON);                     // Load fit addon in Xterm.js
        this.TERM.open(document.getElementById('terminal'));    // Hook Xterm.js onto HTML object 'terminal'
        this.FITADDON.fit();                                    // Fit the terminal once at init using addon
        this.CURRENT_LINE = "";                                 // The current line the user is typing
        this.COMMAND_READY_EVENT = new Event('commandready');   // When a command is entered in Python shell, firing event will be picked up in main
        this.READY_COMMANDS = [];                               // Stack of ready commands, commands at end are newest

        // Depending on the state of the module, the user may
        // or may not be allowed to input and execute commands
        // (only allowed in PYTHON state)
        this.STATES = {
            PYTHON: 0,
            OUTPUT: 1,
        }
        this.STATE = this.STATES.PYTHON;

        //listen for window resize event and re-fit terminal
        window.addEventListener('resize', this.autoFit.bind(this));

        // Write information to terminal on page load for user
        // and setup callbacks for typing into terminal
        this.initTerminalView();
    }


    // Resizes the terminal to fit its parent container
    autoFit(){
        this.FITADDON.fit();
    }


    // Returns list of commands ready to be executed and that were typed
    // by the user. Has to make copy of internal array, erase internal, and
    // then return copy
    getReadyCommands(){
        var tempArray = [...this.READY_COMMANDS];
        this.READY_COMMANDS = [];
        return tempArray;
    }


    // Wrtie some information for the user and setup callback
    // to handle typing and hitting return/enter
    initTerminalView() {
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
                    this.READY_COMMANDS.push(this.CURRENT_LINE);
                    window.dispatchEvent(this.COMMAND_READY_EVENT);
                }
                this.prompt();
                this.CURRENT_LINE = "";
                break;
            case '\u0003':                      // Ctrl+C
                prompt();
                break;
            case '\u007F':                      // Backspace (DEL)
                // Do not delete the Python prompt
                if (this.TERM._core.buffer.x > 4 && this.STATE == this.STATES.PYTHON) {
                    this.TERM.write('\b \b');
                    this.CURRENT_LINE = this.CURRENT_LINE.slice(0, -1);
                }
                break;
            default:                            // Print all other characters for demo
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
    prompt(){
        if(this.STATE == this.STATES.PYTHON){
            this.TERM.write('\r\n>>> ');
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
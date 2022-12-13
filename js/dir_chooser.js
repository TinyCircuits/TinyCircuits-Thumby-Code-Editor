// ##### FILESYSTEM_WRAPPER.js #####
// Created using Tree.js: https://www.cssscript.com/folder-tree-treejs/

class DIRCHOOSER{
    constructor(){
        this.DIR_CHOOSER_DIV = document.createElement("div");
        this.DIR_CHOOSER_DIV.classList.add("dir_chooser");
        // document.body.appendChild(this.DIR_CHOOSER_DIV);

        this.DIR_CHOOSER_HEADER_DIV = document.createElement("div");
        this.DIR_CHOOSER_HEADER_DIV.classList = "dir_chooser_header uk-label uk-label-danger";
        this.DIR_CHOOSER_HEADER_DIV.innerText = "SAVE: Choose a Directory & Name:";
        this.DIR_CHOOSER_DIV.appendChild(this.DIR_CHOOSER_HEADER_DIV);

        this.DIR_CHOOSER_AREA_DIV = document.createElement("div");
        this.DIR_CHOOSER_AREA_DIV.classList.add("dir_chooser_area");
        this.DIR_CHOOSER_DIV.appendChild(this.DIR_CHOOSER_AREA_DIV);

        this.DIR_CHOOSER_FOOTER_DIV = document.createElement("div");
        this.DIR_CHOOSER_FOOTER_DIV.classList.add("dir_chooser_footer");
        this.DIR_CHOOSER_DIV.appendChild(this.DIR_CHOOSER_FOOTER_DIV);

        var margin = document.createElement("div");
        margin.classList = "uk-margin-small-left uk-margin-small-right uk-margin-small-top";
        this.DIR_CHOOSER_FOOTER_INPUT = document.createElement("input");
        this.DIR_CHOOSER_FOOTER_INPUT.classList.add("uk-input");
        this.DIR_CHOOSER_FOOTER_INPUT.type = "text";
        this.DIR_CHOOSER_FOOTER_INPUT.placeholder = "File name";
        this.DIR_CHOOSER_FOOTER_INPUT.oninput = (event) =>{this.updateFinalPath()}
        margin.appendChild(this.DIR_CHOOSER_FOOTER_INPUT);
        this.DIR_CHOOSER_FOOTER_DIV.appendChild(margin);


        margin = document.createElement("div");
        margin.classList = "uk-margin-small-left uk-margin-small-right uk-margin-small-top";
        this.DIR_CHOOSER_FOOTER_OUTPUT = document.createElement("output");
        this.DIR_CHOOSER_FOOTER_OUTPUT.classList.add("uk-output");
        this.DIR_CHOOSER_FOOTER_OUTPUT.value = "FINAL PATH: ";
        margin.appendChild(this.DIR_CHOOSER_FOOTER_OUTPUT);
        this.DIR_CHOOSER_FOOTER_DIV.appendChild(margin);


        margin = document.createElement("div");
        margin.classList = "uk-margin-small-left uk-margin-small-right uk-margin-small-top";
        this.DIR_CHOOSER_FOOTER_BTNS = document.createElement("div");
        this.DIR_CHOOSER_FOOTER_BTNS.classList.add("dir_chooser_footer_buttons");
        margin.appendChild(this.DIR_CHOOSER_FOOTER_BTNS);
        this.DIR_CHOOSER_FOOTER_DIV.appendChild(margin);


        this.DIR_CHOOSER_FOOTER_OK_BTN = document.createElement("button");
        this.DIR_CHOOSER_FOOTER_OK_BTN.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.DIR_CHOOSER_FOOTER_OK_BTN.textContent = "OK";
        this.DIR_CHOOSER_FOOTER_OK_BTN.onclick = () => (this.WAITING_FOR_USER = 0);
        this.DIR_CHOOSER_FOOTER_BTNS.appendChild(this.DIR_CHOOSER_FOOTER_OK_BTN);

        this.DIR_CHOOSER_FOOTER_CANCEL_BTN = document.createElement("button");
        this.DIR_CHOOSER_FOOTER_CANCEL_BTN.classList = "uk-button uk-button-primary uk-width-1-1 uk-height-1-1 uk-text-nowrap";
        this.DIR_CHOOSER_FOOTER_CANCEL_BTN.textContent = "CANCEL";
        this.DIR_CHOOSER_FOOTER_CANCEL_BTN.onclick = () => (this.WAITING_FOR_USER = -1);
        this.DIR_CHOOSER_FOOTER_BTNS.appendChild(this.DIR_CHOOSER_FOOTER_CANCEL_BTN);



        this.FS_DROPDOWN_DIV = document.createElement("div");
        // this.FS_DROPDOWN_DIV.classList = "uk-nav uk-dropdown-nav";
        this.FS_DROPDOWN_DIV.setAttribute("uk-dropdown", "offset: 0; toggle: null");
        document.body.appendChild(this.FS_DROPDOWN_DIV);

        this.FS_DROPDOWN_UL = document.createElement("div");
        this.FS_DROPDOWN_UL.classList = "uk-nav uk-dropdown-nav";
        this.FS_DROPDOWN_DIV.appendChild(this.FS_DROPDOWN_UL);

        var li = document.createElement("li");
        this.FS_DROPDOWN_RENAME_BTN = document.createElement("button");
        this.FS_DROPDOWN_RENAME_BTN.classList = "uk-button uk-button-secondary uk-width-1-1";
        this.FS_DROPDOWN_RENAME_BTN.onclick = () => {this.onRename(this.getSelectedNodePath())};
        this.FS_DROPDOWN_RENAME_BTN.innerText = "Rename";
        li.appendChild(this.FS_DROPDOWN_RENAME_BTN);
        this.FS_DROPDOWN_UL.appendChild(li);

        li = document.createElement("li");
        this.FS_DROPDOWN_NEWFOLDER_BTN = document.createElement("button");
        this.FS_DROPDOWN_NEWFOLDER_BTN.classList = "uk-button uk-button-secondary uk-width-1-1";
        this.FS_DROPDOWN_NEWFOLDER_BTN.onclick = () => {this.onNewFolder(this.getSelectedNodeFileOrDir(), this.getSelectedNodePath())};
        this.FS_DROPDOWN_NEWFOLDER_BTN.innerText = "New Folder";
        li.appendChild(this.FS_DROPDOWN_NEWFOLDER_BTN);
        this.FS_DROPDOWN_UL.appendChild(li);


        // Add events for FS button parent and the buttons themselves
        this.FS_DROPDOWN_DIV.addEventListener("mouseover", () => {
            this.FS_DROPDOWN_DIV.style.display = "block";
        });
        this.FS_DROPDOWN_DIV.addEventListener("mouseout", () => {
            this.FS_DROPDOWN_DIV.style.display = "none";
        });

        document.addEventListener("keydown", (event) => {
            if(this.FS_DROPDOWN_DIV.style.display != "none" && event.key == "Escape"){
                this.WAITING_FOR_USER = -1;
            }
        })


        this.WAITING_FOR_USER = false;
        this.LAST_SELECTED_PATH = "";
    }

    // Resets some text so that prompts user to save file
    setToSaveMode(){
        this.DIR_CHOOSER_HEADER_DIV.innerText = "SAVE: Choose a Directory & Name:";
        this.DIR_CHOOSER_HEADER_DIV.classList.remove("uk-label-warning");
        this.DIR_CHOOSER_HEADER_DIV.classList.add("uk-label-danger");

        this.DIR_CHOOSER_FOOTER_INPUT.placeholder = "File name";
    }

    // setToProjectMode(){
    //     this.DIR_CHOOSER_HEADER_DIV.innerText = "New Project: Choose directory and name";
    //     this.DIR_CHOOSER_HEADER_DIV.classList.remove("uk-label-danger");
    //     this.DIR_CHOOSER_HEADER_DIV.classList.add("uk-label-warning");

    //     this.DIR_CHOOSER_FOOTER_INPUT.placeholder = "Project file name";
    // }


    updateFinalPath(){
        this.DIR_CHOOSER_FOOTER_OUTPUT.value = "FINAL PATH: " + this.LAST_SELECTED_PATH + "/" + this.DIR_CHOOSER_FOOTER_INPUT.value;
    }


    async waitForUser(){
        this.WAITING_FOR_USER = 1;
        this.LAST_SELECTED_PATH = "";
        this.DIR_CHOOSER_FOOTER_OUTPUT.value = "FINAL PATH: "
        this.DIR_CHOOSER_FOOTER_INPUT.value = "";
        this.updateFinalPath();

        while (this.WAITING_FOR_USER == 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.DIR_CHOOSER_DIV.style.display = "none";
        
        if(this.WAITING_FOR_USER == 0){
            return this.LAST_SELECTED_PATH + "/" + this.DIR_CHOOSER_FOOTER_INPUT.value;
        }else{
            return undefined;
        }
    }



    async getPathFromUser(editorDiv, disableFileName = false){
        if(disableFileName){
            this.DIR_CHOOSER_FOOTER_INPUT.disabled = true;
            this.DIR_CHOOSER_FOOTER_INPUT.style.backgroundColor = "lightgray";
        }else{
            this.DIR_CHOOSER_FOOTER_INPUT.disabled = false;
            this.DIR_CHOOSER_FOOTER_INPUT.style.backgroundColor = "white";
        }

        editorDiv.appendChild(this.DIR_CHOOSER_DIV);
        this.FS_ROOT = new TreeNode("\\");                                      // Start new tree from start/root
        if(this.LAST_JSON_DATA != undefined){
            this.addChildrenToNodeDIR(this.FS_ROOT, this.LAST_JSON_DATA[""]);
            this.FS_TREE = new TreeView(this.FS_ROOT, this.DIR_CHOOSER_AREA_DIV);   // Render to webpage element
            this.DIR_CHOOSER_DIV.style.display = "flex";
            var path = await this.waitForUser();
            if(path != "" && path != "/"){
                return path;
            }else{
                return undefined;
            }
        }else{
            console.log("No filesystem, Thumby not connected");
            alert("No filesystem, Thumby not connected");
            return undefined;
        }
    }


    // Call this with parsed json of FS from RP2040 to update webpage of on-board FS view
    updateTree(jsonStrData){
        var jsonData = JSON.parse(jsonStrData);
        this.LAST_JSON_DATA  = jsonData;
        this.FS_ROOT = new TreeNode("\\"); 
        this.addChildrenToNodeDIR(this.FS_ROOT, this.LAST_JSON_DATA[""]);
        this.FS_TREE = new TreeView(this.FS_ROOT, this.DIR_CHOOSER_AREA_DIV);   // Render to webpage element
    }


    // Recursive function for updating each branch
    // of FS tree based on json data from RP2040
    addChildrenToNodeDIR(treeNode, fsNode){

        // Assign event so that left clicked nodes can be opened in webpage
        treeNode.on("click", (event, node) => {
            this.FS_TREE.expandAllNodes();
            this.LAST_SELECTED_PATH = "/" + this.getNodePath(node);
            this.updateFinalPath();
            console.log(this.LAST_SELECTED_PATH);
        });

        treeNode.on("dblclick", (event, node) => {
            this.FS_TREE.expandAllNodes();
        });


        // Loop through keys of current item. Can be int or object/dict.
        // check if int keyed nodes are dict, if so, call this function on them
        // and use none int keyed node to fill it
        for(var nodeKey in fsNode){
            if(!isNaN(nodeKey)){                                                                    // Check if number (false means number inside string)
                var fileOrDir = Object.keys(fsNode[nodeKey])[0];                                    // Get string key that's either FILE or DIR
                if(fileOrDir == "D"){                                                               // Found dir, add name to tree and make recursive call
                    var dirTreeNode = new TreeNode(fsNode[nodeKey][fileOrDir]);                     // Make FS tree node for dir

                    // Assign event so that left clicked nodes can be opened in webpage
                    dirTreeNode.on("click", (event, node) => {
                        this.FS_TREE.expandAllNodes();
                        this.LAST_SELECTED_PATH = this.getNodePath(node);
                        this.updateFinalPath();
                        console.log(this.LAST_SELECTED_PATH);
                    });

                    dirTreeNode.on("dblclick", (event, node) => {
                        this.FS_TREE.expandAllNodes();
                    });

                    dirTreeNode.on("contextmenu", (event, node) => {
                        console.log("File/Dir right clicked");

                        // Set this so new folders are created in the correct spot
                        this.LAST_SELECTED_PATH = "/" + this.getNodePath(node);
                        this.updateFinalPath();
                        console.log(this.LAST_SELECTED_PATH);

                        // Show menu for renaming, moving, deleting files and move to cursor.
                        this.FS_DROPDOWN_DIV.style.display = "block";
                        this.FS_DROPDOWN_DIV.style.left = (event.clientX - 15) + 'px';
                        this.FS_DROPDOWN_DIV.style.top  = (event.clientY - this.FS_DROPDOWN_DIV.clientHeight + 3) + 'px';
                        node.setSelected(true);
                        return false;
                    }, false);

                    dirTreeNode.changeOption("forceParent", true);                                  // If node marked as dir then force it to be a dir
                    dirTreeNode.setEnabled(this.STATE);
                    treeNode.addChild(dirTreeNode);                                                 // Add dir name as child node
                    this.addChildrenToNodeDIR(dirTreeNode, fsNode[fsNode[nodeKey][fileOrDir]]);     // Make the recursive call to fill in another parent
                }
            }
        }
    }


    // Gets file path on-board RP2040 to provided node from FS tree (starts from root)
    getNodePath(node){
        var path = "";
        while(node != undefined){
            // Although we represent the filesystem with '\', RP2040 MicroPython wants '/' in paths
            path = "/" + node.toString() + path;
            node = node.parent;
        }

        // Full path to root after this (removes three back slashes)
        path = path.substring(3);
        return path;
    }

    getSelectedNodePath(){
        var selectedNodes = this.FS_TREE.getSelectedNodes();
        var selectedNode = selectedNodes[0];
        var selectedNodePath = this.getNodePath(selectedNode);

        // Unselect all nodes so next time multiple are not selected
        for(var i=0; i<selectedNodes.length; i++){
            selectedNodes[i].setSelected(false);
        }
        return selectedNodePath;
    }

    getSelectedNodeFileOrDir(){
        var selectedNode = this.FS_TREE.getSelectedNodes()[0];
        if(selectedNode != undefined){
            if(selectedNode.getOptions()["forceParent"]){
                return 1;
            }else{
                return 0;
            }
        }
    }
}
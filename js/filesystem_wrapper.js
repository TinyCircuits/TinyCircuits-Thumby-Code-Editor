// ##### FILESYSTEM_WRAPPER.js #####
// Created using Tree.js: https://www.cssscript.com/folder-tree-treejs/

class FILESYSTEM{
    constructor(_container, state){

        // Related to golden-layout
        this._container = _container;

        this.FS_ALL_DIV = document.createElement("div");
        this.FS_ALL_DIV.classList.add("fs");


        this.FS_STORAGE_BAR_PARENT_DIV = document.createElement("div");
        this.FS_STORAGE_BAR_PARENT_DIV.classList = "fs_storage_bar_parent";
        this.FS_ALL_DIV.appendChild(this.FS_STORAGE_BAR_PARENT_DIV);

        this.FS_STORAGE_BAR_DIV = document.createElement("div");
        this.FS_STORAGE_BAR_DIV.classList = "fs_storage_bar";
        this.FS_STORAGE_BAR_DIV.innerHTML = "&nbsp;Storage:";
        this.FS_STORAGE_BAR_PARENT_DIV.appendChild(this.FS_STORAGE_BAR_DIV);

        this.FS_AREA_DIV = document.createElement("div");
        this.FS_AREA_DIV.classList.add("fs_area");
        this.FS_ALL_DIV.appendChild(this.FS_AREA_DIV);

        this.FS_FOOTER_DIV = document.createElement("div");
        this.FS_FOOTER_DIV.classList = "fs_footer uk-button-group";
        this.FS_ALL_DIV.appendChild(this.FS_FOOTER_DIV);

        this.FS_REFORMAT_BTN = document.createElement("button");
        this.FS_REFORMAT_BTN.classList.add("uk-button");
        this.FS_REFORMAT_BTN.classList.add("uk-button-secondary");
        this.FS_REFORMAT_BTN.classList.add("uk-button-small");
        this.FS_REFORMAT_BTN.classList.add("uk-width-1-1");
        this.FS_REFORMAT_BTN.onclick = () => {if(confirm("Are you sure? This will delete and replace all files on the Thumby")){this.onFormat()}};
        this.FS_REFORMAT_BTN.innerText = "FORMAT";
        this.FS_REFORMAT_BTN.title = "Erases all files on Thumby then reloads default library and game files";
        this.FS_FOOTER_DIV.appendChild(this.FS_REFORMAT_BTN);

        this.FS_UPDATE_LIBS_BTN = document.createElement("button");
        this.FS_UPDATE_LIBS_BTN.classList = "uk-button uk-button-secondary uk-button-small uk-width-1-1";
        this.FS_UPDATE_LIBS_BTN.onclick = () => {this.removeUpdate(); this.onUpdate()}
        this.FS_UPDATE_LIBS_BTN.innerText = "UPDATE LIBRARIES";
        this.FS_UPDATE_LIBS_BTN.title = "Overwrites all default files in lib directory";
        this.FS_FOOTER_DIV.appendChild(this.FS_UPDATE_LIBS_BTN);


        this.FS_UPLOAD_BTN = document.createElement("button");
        this.FS_UPLOAD_BTN.classList = "uk-button uk-button-secondary uk-button-small uk-width-1-1";
        this.FS_UPLOAD_BTN.onclick = () => {this.onUploadFiles()};
        this.FS_UPLOAD_BTN.innerText = "UPLOAD FILES";
        this.FS_UPLOAD_BTN.title = "Uploads files to Thumby (use this for text and binary files)";
        this.FS_FOOTER_DIV.appendChild(this.FS_UPLOAD_BTN);


        this.FS_REFRESH_BTN = document.createElement("button");
        this.FS_REFRESH_BTN.classList = "uk-button uk-button-secondary uk-button-small uk-width-1-1";
        this.FS_REFRESH_BTN.onclick = () => {this.onRefresh()};
        this.FS_REFRESH_BTN.textContent = "\u21bb";
        this.FS_REFRESH_BTN.title = "Refresh filesystem";
        this.FS_FOOTER_DIV.appendChild(this.FS_REFRESH_BTN);


        this.FS_DROPDOWN_DIV = document.createElement("div");
        this.FS_DROPDOWN_DIV.setAttribute("uk-dropdown", "offset: 0; toggle: null");
        document.body.appendChild(this.FS_DROPDOWN_DIV);

        this.FS_DROPDOWN_UL = document.createElement("div");
        this.FS_DROPDOWN_UL.classList = "uk-nav uk-dropdown-nav";
        this.FS_DROPDOWN_DIV.appendChild(this.FS_DROPDOWN_UL);

        var li = document.createElement("li");
        this.FS_DROPDOWN_DELETE_BTN = document.createElement("button");
        this.FS_DROPDOWN_DELETE_BTN.classList = "uk-button uk-button-secondary uk-width-1-1";
        this.FS_DROPDOWN_DELETE_BTN.onclick = () => {this.onDelete(this.getSelectedNodePath(true)); this.FS_DROPDOWN_DIV.style.display = "none";};
        this.FS_DROPDOWN_DELETE_BTN.innerText = "Delete";
        this.FS_DROPDOWN_DELETE_BTN.title = "Deletes selected file or directory on Thumby";
        li.appendChild(this.FS_DROPDOWN_DELETE_BTN);
        this.FS_DROPDOWN_UL.appendChild(li);

        li = document.createElement("li");
        this.FS_DROPDOWN_RENAME_BTN = document.createElement("button");
        this.FS_DROPDOWN_RENAME_BTN.classList = "uk-button uk-button-secondary uk-width-1-1";
        this.FS_DROPDOWN_RENAME_BTN.onclick = () => {this.onRename(this.getSelectedNodePath())};
        this.FS_DROPDOWN_RENAME_BTN.innerText = "Rename";
        this.FS_DROPDOWN_RENAME_BTN.title = "Renames selected file or directory on Thumby";
        li.appendChild(this.FS_DROPDOWN_RENAME_BTN);
        this.FS_DROPDOWN_UL.appendChild(li);

        li = document.createElement("li");
        this.FS_DROPDOWN_NEWFOLDER_BTN = document.createElement("button");
        this.FS_DROPDOWN_NEWFOLDER_BTN.classList = "uk-button uk-button-secondary uk-width-1-1";
        this.FS_DROPDOWN_NEWFOLDER_BTN.onclick = () => {this.onNewFolder(this.getSelectedNodeFileOrDir(), this.getSelectedNodePath())};
        this.FS_DROPDOWN_NEWFOLDER_BTN.innerText = "New Folder";
        this.FS_DROPDOWN_NEWFOLDER_BTN.title = "Creates new directory in same folder of file or under selected folder";
        li.appendChild(this.FS_DROPDOWN_NEWFOLDER_BTN);
        this.FS_DROPDOWN_UL.appendChild(li);

        li = document.createElement("li");
        this.FS_DROPDOWN_DOWNLOAD_BTN = document.createElement("button");
        this.FS_DROPDOWN_DOWNLOAD_BTN.classList = "uk-button uk-button-secondary uk-width-1-1";
        this.FS_DROPDOWN_DOWNLOAD_BTN.onclick = () => {this.downloadSelected(this.FS_TREE.getSelectedNodes()[0], this.getSelectedNodeFileOrDir(), this.getSelectedNodePath())};
        this.FS_DROPDOWN_DOWNLOAD_BTN.innerText = "Download";
        this.FS_DROPDOWN_DOWNLOAD_BTN.title = "Downloads selected items to computer (all files under directory will be downloaded)";
        li.appendChild(this.FS_DROPDOWN_DOWNLOAD_BTN);
        this.FS_DROPDOWN_UL.appendChild(li);


        this._container.element.appendChild(this.FS_ALL_DIV);


        this.FS_ROOT = new TreeNode("\\");                               // Create the root-node
        this.FS_TREE = new TreeView(this.FS_ROOT, this.FS_AREA_DIV);     // Create the tree
        this.FS_TREE.reload();                                           // Always use this when you change the TreeView or any of its nodes


        this.clearToWaiting();

        // Typically used for refreashing tree with nodes in disabled or enabled state
        this.LAST_JSON_DATA = undefined;

        // Used to determine if files should be enabled or disabled for now (used for commands in process and fetching file system)
        this.STATE = true;

        // CALLBACKS: defined outside of this module
        this.onDelete = undefined;
        this.onRename = undefined;
        this.onFormat = undefined;
        this.onUpdate = undefined;
        this.onOpen = undefined;
        this.onNewFolder = undefined;
        this.onUploadFiles = undefined;
        this.onRefresh = undefined;
        this.onDownloadFiles = undefined;


        // Make sure mouse click anywhere on panel focuses the panel
        this._container.element.addEventListener('click', (event) => {
            this._container.focus();
        });
        this._container.element.addEventListener('focusin', (event) => {
            this._container.focus();
        });


        // Add events for FS button parent and the buttons themselves
        this.FS_DROPDOWN_DIV.addEventListener("mouseover", () => {
            this.FS_DROPDOWN_DIV.style.display = "block";
        });
        this.FS_DROPDOWN_DIV.addEventListener("mouseout", () => {
            this.FS_DROPDOWN_DIV.style.display = "none";
        });

        this.DIR_CHOOSER_PATH = "";

        // Disable these buttons by default when no Thumby is connected (gets re-enabled in main.js on connection)
        this.disableButtons();
    }


    disableButtons(){
        this.FS_REFORMAT_BTN.disabled = true;
        this.FS_UPDATE_LIBS_BTN.disabled = true;
        this.FS_UPLOAD_BTN.disabled = true;
    }


    enableButtons(){
        this.FS_REFORMAT_BTN.disabled = false;
        this.FS_UPDATE_LIBS_BTN.disabled = false;
        this.FS_UPLOAD_BTN.disabled = false;
    }


    updateStorageBar(sizeData){
        let blockSizeBytes = parseInt(sizeData[0]);
        let totalBlockCount = parseInt(sizeData[1]);
        let totalBlocksFree = parseInt(sizeData[2]);

        let totalBytes = blockSizeBytes * totalBlockCount;
        let freeBytes = blockSizeBytes * totalBlocksFree;
        let usedBytes = totalBytes - freeBytes;

        let percent = (usedBytes / totalBytes * 100);

        this.FS_STORAGE_BAR_DIV.style.width = percent + "%";

        if(percent > 75){
            this.FS_STORAGE_BAR_DIV.style.backgroundColor = "red";
        }else{
            this.FS_STORAGE_BAR_DIV.style.backgroundColor = "green";
        }

        this.FS_STORAGE_BAR_DIV.innerHTML = "&nbsp;Storage: " + (usedBytes/1000000).toFixed(2) + "/" + (totalBytes/1000000).toFixed(1) + " MB";
    }


    // Recursively traverse the directory tree starting at the right-clicked dir and download all files
    async downloadChildren(parent){
        var childNodes = parent.getChildren();
        
        for(var c=0; c<childNodes.length; c++){
            if(childNodes[c].getChildren().length > 0){
                await this.downloadChildren(childNodes[c]);
            }else{
                await this.onDownloadFiles([this.getNodePath(childNodes[c])]);
            }
        }
    }


    removeUpdate(){
        this.FS_UPDATE_LIBS_BTN.classList = "uk-button uk-button-primary uk-button-small uk-width-1-1";
    }


    showUpdate(){
        this.FS_UPDATE_LIBS_BTN.classList = "uk-button uk-button-danger uk-button-small uk-width-1-1";
    }


    async downloadSelected(selectedNode, isDir, fullPath){
        // If directory, find all child nodes and download them, otherwise download single file
        if(isDir){
            await this.downloadChildren(selectedNode);
        }else{
            await this.onDownloadFiles([fullPath]);
        }
    }


    clearToWaiting(){
        this.FS_AREA_DIV.innerText = "Waiting for connection...\n\n(click 'Connect Thumby')";
        this.FS_AREA_DIV.style.display = "flex";
        
        this.FS_STORAGE_BAR_DIV.style.width = 0 + "%";
        this.FS_STORAGE_BAR_DIV.innerHTML = "&nbsp;Storage:";
    }


    renderDirChooserTo(div){
        this.FS_ROOT = new TreeNode("\\");                              // Start new tree from start/root
        this.addChildrenToNodeDIR(this.FS_ROOT, this.LAST_JSON_DATA[""]);
        this.FS_TREE = new TreeView(this.FS_ROOT, div);                 // Render to webpage element
    }


    // Recursive function for updating each branch
    // of FS tree based on json data from RP2040
    addChildrenToNodeDIR(treeNode, fsNode){


        // Assign event so that left clicked nodes can be opened in webpage
        treeNode.on("click", (event, node) => {
            this.FS_TREE.expandAllNodes();
            this.DIR_CHOOSER_PATH = this.getNodePath(node);
            console.log(this.DIR_CHOOSER_PATH);
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
                        this.DIR_CHOOSER_PATH = this.getNodePath(node);
                        console.log(this.DIR_CHOOSER_PATH);
                    });

                    dirTreeNode.on("dblclick", (event, node) => {
                        this.FS_TREE.expandAllNodes();
                    });
        

                    dirTreeNode.changeOption("forceParent", true);                                  // If node marked as dir then force it to be a dir
                    dirTreeNode.setEnabled(this.STATE);
                    treeNode.addChild(dirTreeNode);                                                 // Add dir name as child node
                    this.addChildrenToNodeDIR(dirTreeNode, fsNode[fsNode[nodeKey][fileOrDir]]);     // Make the recursive call to fill in another parent
                }
            }
        }
    }




    // Recursive function for updating each branch
    // of FS tree based on json data from RP2040
    addChildrenToNode(treeNode, fsNode){
        // Loop through keys of current item. Can be int or object/dict.
        // check if int keyed nodes are dict, if so, call this function on them
        // and use none int keyed node to fill it
        for(var nodeKey in fsNode){
            if(!isNaN(nodeKey)){                                                                // Check if number (false means number inside string)
                var fileOrDir = Object.keys(fsNode[nodeKey])[0];                                // Get string key that's either FILE or DIR
                if(fileOrDir == "F"){                                                           // Found file, just add name to tree
                    var newFileTreeNode = new TreeNode(fsNode[nodeKey][fileOrDir]);             // Make child node

                    // Assign event so that left clicked nodes can be opened in webpage
                    newFileTreeNode.on("dblclick", (event, node) => {
                        console.log("File left clicked");
                
                        var currentNode = node;
                        var path = "";
                        while(currentNode != undefined){
                            // Although we represent the filesystem with '\', RP2040 MicroPython wants '/' in paths
                            path = "/" + currentNode.toString() + path;
                            currentNode = currentNode.parent;
                        }
                
                        // Full path to root after this (removes three back slashes)
                        path = "/" + path.substring(3);
                        this.onOpen(path);
                    });

                    // Assign event so that right clicked nodes bring up a menu
                    // to rename, copy, cut, paste, open, or delete file on-board
                    // the RP2040
                    newFileTreeNode.on("contextmenu", (event, node) => {
                        console.log("File/Dir right clicked");

                        // Show menu for renaming, moving, deleting files and move to cursor.
                        this.FS_DROPDOWN_DIV.style.display = "block";
                        this.FS_DROPDOWN_DIV.style.left = (event.clientX - 15) + 'px';

                        let top = (event.clientY - this.FS_DROPDOWN_DIV.clientHeight + 3);
                        if(top < 0){
                            top = 0;
                        }
                        this.FS_DROPDOWN_DIV.style.top = top + 'px';

                        var selectedNodes = this.FS_TREE.getSelectedNodes();

                        // Unselect all nodes so next time multiple are not selected
                        for(var i=0; i<selectedNodes.length; i++){
                            selectedNodes[i].setSelected(false);
                        }

                        node.setSelected(true);
                        return false;
                    }, false);

                    newFileTreeNode.setEnabled(this.STATE);

                    treeNode.addChild(newFileTreeNode);                                         // Add file name as child node
                }else if(fileOrDir == "D"){                                                     // Found dir, add name to tree and make recursive call
                    var dirTreeNode = new TreeNode(fsNode[nodeKey][fileOrDir]);                 // Make FS tree node for dir

                    // Assign event so that right clicked nodes bring up a menu
                    // to rename, copy, cut, paste, open, or delete file on-board
                    // the RP2040
                    dirTreeNode.on("contextmenu", (event, node) => {
                        console.log("File/Dir right clicked");

                        // Show menu for renaming, moving, deleting files and move to cursor.
                        this.FS_DROPDOWN_DIV.style.display = "block";
                        this.FS_DROPDOWN_DIV.style.left = (event.clientX - 15) + 'px';

                        let top = (event.clientY - this.FS_DROPDOWN_DIV.clientHeight + 3);
                        if(top < 0){
                            top = 0;
                        }
                        this.FS_DROPDOWN_DIV.style.top = top + 'px';

                        var selectedNodes = this.FS_TREE.getSelectedNodes();

                        // Unselect all nodes so next time multiple are not selected
                        for(var i=0; i<selectedNodes.length; i++){
                            selectedNodes[i].setSelected(false);
                        }

                        node.setSelected(true);
                        return false;
                    }, false);

                    dirTreeNode.changeOption("forceParent", true);                              // If node marked as dir then force it to be a dir

                    dirTreeNode.setEnabled(this.STATE);

                    treeNode.addChild(dirTreeNode);                                             // Add dir name as child node
                    this.addChildrenToNode(dirTreeNode, fsNode[fsNode[nodeKey][fileOrDir]]);    // Make the recursive call to fill in another parent
                }else{
                    console.log("ERROR [filesystem_wrapper.js]: Something went wrong, neither file or dir?");
                }
            }
        }
    }


    // Given true or false, goes through all folders and files and disables/enables the files
    setFileEnableState(state){
        this.STATE = state;
        this.FS_ROOT = new TreeNode("\\");
        this.FS_TREE = new TreeView(this.FS_ROOT, this.ELEM);
        if(this.LAST_JSON_DATA != undefined){
            this.addChildrenToNode(this.FS_ROOT, this.LAST_JSON_DATA[""]);
            this.FS_TREE.reload();
        }
    }


    // Call this with parsed json of FS from RP2040 to update webpage of on-board FS view
    updateTree(jsonStrData){
        this.FS_AREA_DIV.style.display = "block";
        var jsonData = JSON.parse(jsonStrData);
        this.LAST_JSON_DATA  = jsonData;
        this.FS_ROOT = new TreeNode("\\");   // Start new tree from start/root
        this.addChildrenToNode(this.FS_ROOT, jsonData[""]);
        this.FS_TREE = new TreeView(this.FS_ROOT, this.FS_AREA_DIV);   // Render to webpage element
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


    // Goes through any selected nodes and sets them unselected
    unselectAllNodes(){
        var selectedNodes = this.FS_TREE.getSelectedNodes();
        selectedNodes.forEach(node => {
            node.setSelected(false);
        });
    }


    // Gets the path (mirror of RP2040 system) from FS tree view
    // and returns it for use in the RP2040 module. NOTE: nodes
    // are selected on right-click because of callback .setSelected 
    // call provided to each node on tree update
    getSelectedNodePath(deleting){
        var selectedNodes = this.FS_TREE.getSelectedNodes();
        var selectedNode = selectedNodes[0];
        var selectedNodePath = this.getNodePath(selectedNode);

        if(selectedNodes[0].getChildCount() > 0 && deleting == true){
            if(!confirm("Are you sure you want to delete " + selectedNodePath + "? It has " + selectedNodes[0].getChildCount() + " child items")){
                return undefined;
            }
        }

        // Unselect all nodes so next time multiple are not selected
        for(var i=0; i<selectedNodes.length; i++){
            selectedNodes[i].setSelected(false);
        }

        return selectedNodePath;
    }


    // Returns just the text of the selected (right or left click) node
    getSelectedNodeName(){
        return this.FS_TREE.getSelectedNodes()[0].toString();
    }


    // Returns 0 if last right/left clicked node is file, and 1 for dir
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


    // Hides the menu that is made visible when right clicking nodes
    closeMenu(){
        document.getElementById("fsrcmenuparent").style.display = "none";
    }


    // Gets a folder path like root\child\ when clicked
    // on a node in that dir, like root\child\HelloFile.py or
    // root/child/HelloDir
    getSelectedDir(){
        var clickedNode = this.FS_TREE.getSelectedNodes()[0];
        var path = "";
        if(!this.getSelectedNodeFileOrDir()){   // File
            path = this.getNodePath(clickedNode.parent);
        }else{                                  // Dir
            path = this.getNodePath(clickedNode);
        }

        // Although we represent the filesystem with '\', RP2040 MicroPython wants '/' in paths
        if(path != ""){
            path = path + "/";
        }
        return path;
    }


    // // Starts copy by saving node to copy in module (undefined otherwise)
    // startCopy(){
    //     this.COPYING_NODE = this.FS_TREE.getSelectedNodes()[0];
    //     console.log("Copy started");
    // }

    
    // // Ends copy by returning the parent of the last startCopy node (paste button on file menu)
    // endCopy(){
    //     if(this.COPYING_NODE != undefined){
    //         // Get node (file or DIR) that the file should be pasted relative to.
    //         // If it is a file, get the parent and figure out a path to paste to
    //         var pastingNode = this.FS_TREE.getSelectedNodes()[0];

    //         // Path to dir where files/dir should be pasted on-board RP2040
    //         // EX: livesInRoot\ChildDir\
    //         //     Now files/dirs can be copied/cut to 'ChildDir'
    //         var pastePath = "";

    //         // Figure out the path to paste dir/files under on-board
    //         // the RP2040 using webpage filesystem view as mirror ref
    //         if(pastingNode.isLeaf()){   // If true, pasting to file, find path to parent
    //             pastePath = this.getNodePath(pastingNode.parent);
    //         }else{                      // Must have been a dir, just get the path of current node
    //             pastePath = this.getNodePath(pastingNode);
    //         }

    //         console.log(pastePath);

    //         // console.log(this.getNodePath(this.COPYING_NODE.parent));
    //         this.unselectAllNodes();
    //         this.COPYING_NODE = undefined;
    //     }
    //     console.log("Copy Ended");
    // }
}
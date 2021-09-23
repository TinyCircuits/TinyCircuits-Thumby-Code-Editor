// ##### FILESYSTEM_WRAPPER.js #####
// Created using Tree.js: https://www.cssscript.com/folder-tree-treejs/

class FILESYSTEM{
    constructor(_container, state){

        // Related to golden-layout
        this._container = _container;

        // Contains all bitmap builder elements
        this.FS_ALL_DIV = document.createElement("div");
        this.FS_ALL_DIV.classList.add("fs");

        this.FS_AREA_DIV = document.createElement("div");
        this.FS_AREA_DIV.classList.add("fs_area");
        this.FS_ALL_DIV.appendChild(this.FS_AREA_DIV);

        this.FS_FOOTER_DIV = document.createElement("div");
        this.FS_FOOTER_DIV.classList.add("fs_footer");
        this.FS_ALL_DIV.appendChild(this.FS_FOOTER_DIV);

        this.FS_REFORMAT_BTN = document.createElement("button");
        this.FS_REFORMAT_BTN.classList.add("uk-button");
        this.FS_REFORMAT_BTN.classList.add("uk-button-secondary");
        this.FS_REFORMAT_BTN.classList.add("uk-button-small");
        this.FS_REFORMAT_BTN.classList.add("uk-width-1-1");
        this.FS_REFORMAT_BTN.onclick = () => {this.onFormat()};
        this.FS_REFORMAT_BTN.innerText = "FORMAT"
        this.FS_FOOTER_DIV.appendChild(this.FS_REFORMAT_BTN);


        // this.FS_REINSTALL_LIBS_BTN = document.createElement("button");
        // this.FS_REINSTALL_LIBS_BTN.classList.add("uk-button");
        // this.FS_REINSTALL_LIBS_BTN.classList.add("uk-button-secondary");
        // this.FS_REINSTALL_LIBS_BTN.classList.add("uk-button-small");
        // this.FS_REINSTALL_LIBS_BTN.classList.add("uk-width-1-1");
        // this.FS_REINSTALL_LIBS_BTN.innerText = "Reformat Thumby"
        // this.FS_REINSTALL_LIBS_BTN.innerText = "INSTALL LIBS"
        // this.FS_FOOTER_DIV.appendChild(this.FS_REINSTALL_LIBS_BTN);


        this.FS_DROPDOWN_DIV = document.createElement("div");
        this.FS_DROPDOWN_DIV.classList.add("fs_dropdown");
        document.body.appendChild(this.FS_DROPDOWN_DIV);

        this.FS_DROPDOWN_DELETE_BTN = document.createElement("button");
        this.FS_DROPDOWN_DELETE_BTN.classList.add("fs_dropdown_button");
        this.FS_DROPDOWN_DELETE_BTN.onclick = () => {this.onDelete(this.getSelectedNodePath())};
        this.FS_DROPDOWN_DELETE_BTN.innerText = "Delete";
        this.FS_DROPDOWN_DIV.appendChild(this.FS_DROPDOWN_DELETE_BTN);

        this.FS_DROPDOWN_RENAME_BTN = document.createElement("button");
        this.FS_DROPDOWN_RENAME_BTN.classList.add("fs_dropdown_button");
        // this.FS_DROPDOWN_RENAME_BTN.onclick = this.setWidth.bind(this);
        this.FS_DROPDOWN_RENAME_BTN.innerText = "Rename";
        this.FS_DROPDOWN_DIV.appendChild(this.FS_DROPDOWN_RENAME_BTN);


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
        this.onFormat = undefined;
        this.onOpen = undefined;


        // Make sure mouse click anywhere on panel focuses the panel
        this._container.element.addEventListener('click', (event) => {
            this._container.focus();
        });
        this._container.element.addEventListener('focusin', (event) => {
            this._container.focus();
        });


        // Add events for FS button parent and the buttons themselves
        this.FS_DROPDOWN_DIV.addEventListener("mouseover", () => {
            this.FS_DROPDOWN_DIV.style.display = "flex";
        });
        this.FS_DROPDOWN_DIV.addEventListener("mouseout", () => {
            this.FS_DROPDOWN_DIV.style.display = "none";
        });

        // document.getElementById("IDfsDeleteBtn").addEventListener("click", () =>{
        //     this.CALLBACK_DELETE(this.getSelectedNodePath(), this.getSelectedNodeFileOrDir());
        // });
        // document.getElementById("IDfsOpeneBtn").addEventListener("click", () =>{

        // });
        // document.getElementById("IDfsRenameBtn").addEventListener("click", () =>{
        //     this.CALLBACK_RENAME(this.getSelectedNodePath(), prompt("Choose a new name for the on-board file", ".py"));
        // });
    }


    clearToWaiting(){
        this.FS_AREA_DIV.innerText = "Waiting for connection...\n\n(click 'Connect Thumby')";
        this.FS_AREA_DIV.style.display = "flex";
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
                        path = path.substring(3);
                        // var fileName = node.toString();
                
                        // this.CALLBACK_OPEN(path, fileName);
                        this.onOpen(path);
                    });

                    // Assign event so that right clicked nodes bring up a menu
                    // to rename, copy, cut, paste, open, or delete file on-board
                    // the RP2040
                    newFileTreeNode.on("contextmenu", (event, node) => {
                        console.log("File/Dir right clicked");

                        // Show menu for renaming, moving, deleting files and move to cursor.
                        this.FS_DROPDOWN_DIV.style.display = "flex";
                        this.FS_DROPDOWN_DIV.style.left = (event.clientX - 15) + 'px';
                        this.FS_DROPDOWN_DIV.style.top  = (event.clientY - this.FS_DROPDOWN_DIV.clientHeight + 3) + 'px';
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
                        this.FS_DROPDOWN_DIV.style.display = "flex";
                        this.FS_DROPDOWN_DIV.style.left = (event.clientX - 15) + 'px';
                        this.FS_DROPDOWN_DIV.style.top  = (event.clientY - this.FS_DROPDOWN_DIV.clientHeight + 3) + 'px';
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
    // are selected on right-click becuase of callback .setSelected 
    // call provided to each node on tree update
    getSelectedNodePath(){
        var selectedNode = this.FS_TREE.getSelectedNodes()[0];
        return this.getNodePath(selectedNode);
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
// ##### FILESYSTEM_WRAPPER.js #####
// Created using Tree.js: https://www.cssscript.com/folder-tree-treejs/

class FILESYSTEM{
    constructor(){
        this.FS_ROOT = new TreeNode("\\");                          // Create the root-node
        this.ELEM = document.getElementById("onboardfilesarea");    // Element in document where file tree is rendered
        this.FS_TREE = new TreeView(this.FS_ROOT, this.ELEM);       // Create the tree
        this.FS_TREE.reload();                                      // Always use this, when you change the TreeView or any of its node

        // 'Waitng' text already centered, remove these so filesystem not centered
        this.ELEM.style.display = "block";
        this.ELEM.style.alignItems = "none";
        this.ELEM.style.justifyContent = "none";

        // this.COPYING_NODE = undefined;                              // Store node that is currently being copied when copy button pressed

        // Typically used for refreashing tree with nodes in disabled or enabled state
        this.LAST_JSON_DATA = undefined;
    }


    // When nodes are left clicked they are opened in webpage, handle that here
    handleFileleftClick(event, node){
        var currentNode = node;
        var path = "";
        while(currentNode != undefined){
            // Although we represent the filesystem with '\', RP2040 MicroPython wants '/' in paths
            path = "/" + currentNode.toString() + path;
            currentNode = currentNode.parent;
        }

        // Full path to root after this (removes three back slashes)
        path = path.substring(3);
        const pathEvent = new CustomEvent('openonboardfile', { detail: {location: path, fileName: node.toString()} });
        window.dispatchEvent(pathEvent);
    }


    // Right clicked nodes get a menu that allows modifying filesystem in certain ways
    handleFileRightClick(event, node){
        var MENU_ELM = document.getElementById("fsrcmenuparent");

        // Show menu for renaming, moving, deleting files and move to cursor.
        MENU_ELM.style.display = "flex";
        MENU_ELM.style.left = (event.clientX - 15) + 'px';
        MENU_ELM.style.top  = (event.clientY - MENU_ELM.clientHeight + 3) + 'px';
        node.setSelected(true);
        return false;
    }


    // Recursive function for updating each branch
    // of FS tree based on json data from RP2040
    addChildrenToNode(treeNode, fsNode, state){
        // Loop through keys of current item. Can be int or object/dict.
        // check if int keyed nodes are dict, if so, call this function on them
        // and use none int keyed node to fill it
        for(var nodeKey in fsNode){
            if(!isNaN(nodeKey)){                                                                // Check if number (false means number inside string)
                var fileOrDir = Object.keys(fsNode[nodeKey])[0];                                // Get string key that's either FILE or DIR
                if(fileOrDir == "F"){                                                           // Found file, just add name to tree
                    var newFileTreeNode = new TreeNode(fsNode[nodeKey][fileOrDir]);             // Make child node

                    // Assign event so that left clicked nodes can be opened in webpage
                    newFileTreeNode.on("click", this.handleFileleftClick);

                    // Assign event so that right clicked nodes bring up a menu
                    // to rename, copy, cut, paste, open, or delete file on-board
                    // the RP2040
                    newFileTreeNode.on("contextmenu", this.handleFileRightClick, false);

                    if(state != undefined){
                        newFileTreeNode.setEnabled(state);
                    }

                    treeNode.addChild(newFileTreeNode);                                         // Add file name as child node
                }else if(fileOrDir == "D"){                                                     // Found dir, add name to tree and make recursive call
                    var dirTreeNode = new TreeNode(fsNode[nodeKey][fileOrDir]);                 // Make FS tree node for dir

                    // Assign event so that right clicked nodes bring up a menu
                    // to rename, copy, cut, paste, open, or delete dir on-board
                    // the RP2040
                    dirTreeNode.on("contextmenu", this.handleFileRightClick, false);

                    dirTreeNode.changeOption("forceParent", true);                              // If node marked as dir then force it to be a dir

                    if(state != undefined){
                        dirTreeNode.setEnabled(state);
                    }

                    treeNode.addChild(dirTreeNode);                                             // Add dir name as child node
                    this.addChildrenToNode(dirTreeNode, fsNode[fsNode[nodeKey][fileOrDir]]);    // Make the recursive call to fill in another parent
                }else{
                    console.log("ERROR [filesystem_wrapper.js]: Something went wrong, neither file or dir?");
                }
            }
        }
    }


    // Given true or false, goes through all folders and files and disables the files
    setFileEnableState(state, node){
        this.FS_ROOT = new TreeNode("\\");
        this.addChildrenToNode(this.FS_ROOT, this.LAST_JSON_DATA[""], state);
    }


    // Call this with parsed json of FS from RP2040 to update webpage of on-board FS view
    updateTree(jsonData){
        this.LAST_JSON_DATA  = jsonData;
        this.FS_ROOT = new TreeNode("\\");   // Start new tree from start/root
        this.addChildrenToNode(this.FS_ROOT, jsonData[""]);
        this.FS_TREE = new TreeView(this.FS_ROOT, this.ELEM);   // Render to webpage element
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
        if(selectedNode.getOptions()["forceParent"]){
            return 1;
        }else{
            return 0;
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
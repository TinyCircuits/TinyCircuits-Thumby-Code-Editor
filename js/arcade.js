class GameURLContainer{
    constructor(){
        this.GAME_IMAGE_URL = undefined;
        this.GAME_VIDEO_URL = undefined;
        this.GAME_DESCRIPTION_URL = undefined;
        this.GAME_FILE_URLS = [];
        this.GAME_NAME = undefined;

        // Gets defined by Arcade on game load in scroll
        this.downloadButton = undefined;
        this.downloadFunc = undefined;

        this.openButton = undefined;
        this.openFunc = undefined;
    }

    // Inits button callback for download button
    initDownloadButton(downloadFunc, doneDownloadFunc){
        this.downloadFunc = downloadFunc;
        this.doneDownloadFunc = doneDownloadFunc;

        // On click, split URL, forget about the first 5 elements, combine the last elements to path, fetch file from URL, send to Thumby
        this.downloadButton.onclick = async () => {
            for(var i=0; i<this.GAME_FILE_URLS.length; i++){
                // Make URL from root of Thumby (start at '/')
                var thumbyURL = "/Games/" + this.GAME_FILE_URLS[i].split('/').slice(6).join('/');

                window.setPercent(((i/this.GAME_FILE_URLS.length) * 100).toFixed(1), "Downloading: " + thumbyURL);
                
                await fetch(this.GAME_FILE_URLS[i], {cache: "no-store"}).then(async (response) => {
                    await this.downloadFunc(thumbyURL, new Uint8Array(await response.arrayBuffer()));
                });
            }
            window.setPercent(100, "Downloaded arcade game...");
            window.resetPercentDelay();

            this.doneDownloadFunc();
        }
    }

    initOpenButton(openFunc){
        this.openFunc = openFunc;

        // On click, split URL, forget about the first 5 elements, combine the last elements to path, fetch file from URL, open in editors
        this.openButton.onclick = async () => {
            await this.openFunc(this.GAME_FILE_URLS, this.GAME_NAME);
            window.setPercent(100, "Opened arcade game...");
            window.resetPercentDelay();
        }
    }
}


class Arcade{
    constructor(){
        this.SHOWN = false;
        this.LOADING = false;

        // Direct link to raw page from Github of txt file
        this.DIRECT_TXT_URL = "https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Games/master/url_list.txt";
        this.GAME_URL_CONTAINERS = [];
        this.FILLED_GAME_URLS = false;
        this.NEXT_GAME_INDEX = 0;

        this.ARCADE_PAGE_OVERLAY = document.createElement("div");
        this.ARCADE_PAGE_OVERLAY.classList = "arcade_page_overlay";
        document.body.appendChild(this.ARCADE_PAGE_OVERLAY);

        this.ARCADE_BACKGROUND_DIV = document.createElement("div");
        this.ARCADE_BACKGROUND_DIV.classList = "arcade_overlay";
        document.body.appendChild(this.ARCADE_BACKGROUND_DIV);

        this.ARCADE_HEADER_DIV = document.createElement("div");
        this.ARCADE_HEADER_DIV.classList = "arcade_header uk-button-group";
        this.ARCADE_BACKGROUND_DIV.appendChild(this.ARCADE_HEADER_DIV);

        this.ARCADE_REFRESH_BTN = document.createElement("button");
        this.ARCADE_REFRESH_BTN.classList = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
        this.ARCADE_REFRESH_BTN.title = "Grabs the list of game repos and starts from the beginning (as if the page was refreshed)";
        this.ARCADE_REFRESH_BTN.textContent = "REFRESH";
        this.ARCADE_REFRESH_BTN.onclick = async () => {
            if(this.LOADING == false){
                // Scroll to start, remove all child divs, reset state machine, re-fetch games
                this.ARCADE_SCROLL_AREA_DIV.scrollTo(0, 0);
                while(this.ARCADE_SCROLL_AREA_DIV.children.length > 0){
                    this.ARCADE_SCROLL_AREA_DIV.removeChild(this.ARCADE_SCROLL_AREA_DIV.children[0]);
                }

                this.GAME_URL_CONTAINERS = [];
                this.FILLED_GAME_URLS = true;
                this.NEXT_GAME_INDEX = 0;

                await this.fillUserAndRepoNameList();
                this.loadNewGames();
            }
        };
        this.ARCADE_HEADER_DIV.appendChild(this.ARCADE_REFRESH_BTN);

        this.ARCADE_CLOSE_BTN = document.createElement("button");
        this.ARCADE_CLOSE_BTN.classList = "uk-button uk-button-primary uk-button-small uk-width-1-1 uk-text-small";
        this.ARCADE_CLOSE_BTN.title = "Closes arcade overlay, preserves scroll location";
        this.ARCADE_CLOSE_BTN.textContent = "CLOSE";
        this.ARCADE_CLOSE_BTN.onclick = () => {this.hide()};
        this.ARCADE_HEADER_DIV.appendChild(this.ARCADE_CLOSE_BTN);

        this.ARCADE_SCROLL_AREA_DIV = document.createElement("div");
        this.ARCADE_SCROLL_AREA_DIV.classList = "arcade_scroll_area";
        this.ARCADE_BACKGROUND_DIV.appendChild(this.ARCADE_SCROLL_AREA_DIV);

        // Allow escape to hide/exit arcade if shown
        document.addEventListener("keydown", (event) =>{
            if(this.SHOWN && event.key == "Escape"){
                this.hide();
            }
        });

        // Functions that are defined outside this module
        this.onDownload = undefined;
        this.onDoneDownload = undefined;
        this.onOpen = undefined;
    }


    // Actually add games to the arcade, fetch assets using URLs compiled before
    async loadNewGames(){
        this.LOADING = true;
        this.ARCADE_REFRESH_BTN.disabled = true;
        for(var i=0; i<this.GAME_URL_CONTAINERS.length; i++){
            if(this.NEXT_GAME_INDEX < this.GAME_URL_CONTAINERS.length-1){

                var descText = "";

                await fetch(this.GAME_URL_CONTAINERS[this.NEXT_GAME_INDEX].GAME_DESCRIPTION_URL, {cache: "no-store"}).then(async (response) => {
                    await response.text().then((text) => {
                        descText = text;
                    });
                });

                if(descText == "404: Not Found"){
                    continue;
                }

                var arcadeGameDiv = document.createElement("div");
                arcadeGameDiv.classList = "arcade_game uk-transition-toggle";
                this.ARCADE_SCROLL_AREA_DIV.appendChild(arcadeGameDiv);

                var arcadeGameBannerParentDiv = document.createElement("div");
                arcadeGameBannerParentDiv.classList = "arcade_banner_parent uk-transition-toggle";
                arcadeGameDiv.appendChild(arcadeGameBannerParentDiv);

                var arcadeNameDiv = document.createElement("div");
                arcadeNameDiv.classList = "arcade_name_div";
                arcadeNameDiv.innerText = this.GAME_URL_CONTAINERS[this.NEXT_GAME_INDEX].GAME_NAME;
                arcadeGameDiv.appendChild(arcadeNameDiv);


                var arcadeGameBannerElem = undefined;
                if(this.GAME_URL_CONTAINERS[this.NEXT_GAME_INDEX].GAME_VIDEO_URL != undefined){
                    arcadeGameBannerParentDiv.style.width = "100%";
                    arcadeGameBannerParentDiv.style.aspectRatio = "1/0.555555556";

                    arcadeGameBannerElem = document.createElement("video");
                    arcadeGameBannerElem.autoplay = "true";
                    arcadeGameBannerElem.muted = "true";
                    arcadeGameBannerElem.loop = "true";
                    arcadeGameBannerElem.src = this.GAME_URL_CONTAINERS[this.NEXT_GAME_INDEX].GAME_VIDEO_URL;
                    arcadeGameBannerElem.style.height = "180%";
                }else{
                    arcadeGameBannerParentDiv.style.width = "100%";
                    arcadeGameBannerParentDiv.style.height = "100%";

                    arcadeGameBannerElem = document.createElement("div");
                    arcadeGameBannerElem.classList = "arcade_image_banner";
                    arcadeGameBannerElem.style.backgroundImage = "url(" + this.GAME_URL_CONTAINERS[this.NEXT_GAME_INDEX].GAME_IMAGE_URL + ")";
                    arcadeGameBannerElem.style.backgroundSize = "contain";
                    arcadeGameBannerElem.style.backgroundRepeat = "no-repeat";
                    arcadeGameBannerElem.style.backgroundPosition = "center";
                    arcadeGameBannerElem.style.height = "100%";
                    arcadeGameBannerElem.style.width = "100%";
                }
                arcadeGameBannerParentDiv.appendChild(arcadeGameBannerElem);


                var transitionDiv = document.createElement("div");
                transitionDiv.classList = "uk-margin-remove uk-transition-fade uk-position-cover uk-overlay uk-overlay-default uk-text-medium uk-text-success arcade_game_transition_parent";
                // newGameTransitionDiv.textContent = descText;
                arcadeGameDiv.appendChild(transitionDiv);

                var textScrollAreaParentDiv = document.createElement("div");
                textScrollAreaParentDiv.classList = "uk-position-top arcade_game_text_scroll_parent";
                transitionDiv.appendChild(textScrollAreaParentDiv);

                var textScrollAreaDiv = document.createElement("div");
                textScrollAreaDiv.classList = "uk-position-top arcade_game_text_scroll_area";
                textScrollAreaDiv.innerText = descText;
                textScrollAreaParentDiv.appendChild(textScrollAreaDiv);

                var buttonAreaDiv = document.createElement("div");
                buttonAreaDiv.classList = "uk-position-bottom uk-button-group arcade_game_button_area";
                transitionDiv.appendChild(buttonAreaDiv);

                this.GAME_URL_CONTAINERS[this.NEXT_GAME_INDEX].downloadButton = document.createElement("button");
                this.GAME_URL_CONTAINERS[this.NEXT_GAME_INDEX].downloadButton.classList = "uk-button uk-button-primary uk-text-small uk-width-1-1 uk-text-nowrap";
                this.GAME_URL_CONTAINERS[this.NEXT_GAME_INDEX].downloadButton.textContent = "ADD TO THUMBY";
                this.GAME_URL_CONTAINERS[this.NEXT_GAME_INDEX].downloadButton.title = "Downloads all game content to connected Thumby";
                buttonAreaDiv.appendChild(this.GAME_URL_CONTAINERS[this.NEXT_GAME_INDEX].downloadButton);
                this.GAME_URL_CONTAINERS[this.NEXT_GAME_INDEX].initDownloadButton(this.onDownload, this.onDoneDownload);

                this.GAME_URL_CONTAINERS[this.NEXT_GAME_INDEX].openButton = document.createElement("button");
                this.GAME_URL_CONTAINERS[this.NEXT_GAME_INDEX].openButton.classList = "uk-button uk-button-primary uk-text-small uk-width-1-1";
                this.GAME_URL_CONTAINERS[this.NEXT_GAME_INDEX].openButton.textContent = "OPEN";
                this.GAME_URL_CONTAINERS[this.NEXT_GAME_INDEX].openButton.title = "Opens game content in editors. Files with unrecognized file extensions will be asked to be downloaded to PC instead";
                buttonAreaDiv.appendChild(this.GAME_URL_CONTAINERS[this.NEXT_GAME_INDEX].openButton);
                this.GAME_URL_CONTAINERS[this.NEXT_GAME_INDEX].initOpenButton(this.onOpen);

                // Wait a small amount of time so don't fetch from repo too quickly (rate limiting)
                await window.sleep(7);

                this.NEXT_GAME_INDEX = this.NEXT_GAME_INDEX + 1;
            }else{
                console.log("Reached library limit, no more games to browse");
            }
        }
        this.LOADING = false;
        this.ARCADE_REFRESH_BTN.disabled = false;
    }


    // Go through repo game list from txt file and extract usernames + repo names.
    // While scrolling through games, usernames and repo names are used to traverse
    // each repo listed (not all at once, only when scrolling happens)
    async fillUserAndRepoNameList(){
        var repoLinksTxt = undefined;
        await fetch(this.DIRECT_TXT_URL, {cache: 'no-store'}).then(async (response) => {
            await response.text().then((text) => {
                repoLinksTxt = text;
            });
        });


        // Split the list by whatever newline may be after each line
        var txtFileLines = repoLinksTxt.split(/\r\n|\n|\r/);
        if(txtFileLines.length > 0){
            var currentURLContainer = new GameURLContainer();

            for(var i=0; i < txtFileLines.length; i++){
                if(txtFileLines[i].indexOf(".png") != -1){
                    currentURLContainer.GAME_IMAGE_URL = txtFileLines[i];
                }else if(txtFileLines[i].indexOf(".webm") != -1){
                    currentURLContainer.GAME_VIDEO_URL = txtFileLines[i];
                }else if(txtFileLines[i].indexOf("arcade_description.txt") != -1){
                    currentURLContainer.GAME_DESCRIPTION_URL = txtFileLines[i];
                }else if(txtFileLines[i].indexOf("NAME=") != -1){
                    currentURLContainer.GAME_NAME = txtFileLines[i].substring(txtFileLines[i].indexOf('=')+1);
                }else if(txtFileLines[i] != ""){
                    currentURLContainer.GAME_FILE_URLS.push(txtFileLines[i]);
                }else{
                    this.GAME_URL_CONTAINERS.push(currentURLContainer);
                    currentURLContainer = new GameURLContainer();
                }
            }
        }else{
            console.error("ERROR: Could not fetch games list, please let TinyCircuits know!");
        }
    }


    async show(){
        this.ARCADE_BACKGROUND_DIV.style.display = "flex";
        this.ARCADE_PAGE_OVERLAY.style.display = "block";
        this.SHOWN = true;

        if(this.FILLED_GAME_URLS == false){
            await this.fillUserAndRepoNameList();
            this.FILLED_GAME_URLS = true;

            // Start arcade with some number of items loaded (should be enough so that the scroll bar
            // is active (if enough games) and more games can be loaded on all screen sizes)
            this.loadNewGames();
        }
    }


    hide(){
        this.ARCADE_BACKGROUND_DIV.style.display = "none";
        this.ARCADE_PAGE_OVERLAY.style.display = "none";
        this.SHOWN = false;
    }
}
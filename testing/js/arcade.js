class GameURLContainer{
    constructor(){
        this.GAME_IMAGE_URL = undefined;
        this.GAME_VIDEO_URL = undefined;
        this.GAME_DESCRIPTION_URL = undefined;
        this.GAME_FILE_URLS = [];
    }
}


class Arcade{
    constructor(){
        this.SHOWN = false;

        // Direct link to raw page from Github of txt file
        this.DIRECT_TXT_URL = "https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Games/master/url_list.txt";
        this.GAME_URL_CONTAINERS = [];
        this.FILLED_GAME_URLS = false;
        this.NEXT_GAME_INDEX = 0;


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
            // Scroll to start, remove all child divs, reset state machine, re-fetch games
            this.ARCADE_SCROLL_AREA_DIV.scrollTo(0, 0);
            while(this.ARCADE_SCROLL_AREA_DIV.children.length > 0){
                this.ARCADE_SCROLL_AREA_DIV.removeChild(this.ARCADE_SCROLL_AREA_DIV.children[0]);
            }

            this.GAME_URL_CONTAINERS = [];
            this.FILLED_GAME_URLS = true;
            this.NEXT_GAME_INDEX = 0;

            await this.fillUserAndRepoNameList();
            this.loadNewGames(12);
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

        // When scrolling through games, add hidden/unparsed
        // games when scroll position is far enough
        this.ARCADE_SCROLL_AREA_DIV.onscroll = (event) => {
            // When scroll hits the bottom, load some number of games
            if(this.ARCADE_SCROLL_AREA_DIV.scrollTop >= this.ARCADE_SCROLL_AREA_DIV.scrollHeight - this.ARCADE_SCROLL_AREA_DIV.clientHeight){
                this.loadNewGames(4);
            }
        }
    }


    // Actually add games to the arcade, fetch assets using URLs compiled before
    async loadNewGames(count){
        for(var i=0; i<count; i++){
            if(this.NEXT_GAME_INDEX < this.GAME_URL_CONTAINERS.length-1){

                var newGameImgDiv = document.createElement("div");
                newGameImgDiv.classList = "arcade_game uk-transition-toggle";
                newGameImgDiv.style.backgroundImage = "url(" + this.GAME_URL_CONTAINERS[this.NEXT_GAME_INDEX].GAME_IMAGE_URL + ")";
                this.ARCADE_SCROLL_AREA_DIV.appendChild(newGameImgDiv);


                var descText = "";
                await fetch(this.GAME_URL_CONTAINERS[this.NEXT_GAME_INDEX].GAME_DESCRIPTION_URL).then(async (response) => {
                    await response.text().then((text) => {
                        descText = text;
                    });
                });


                var transitionDiv = document.createElement("div");
                transitionDiv.classList = "uk-margin-remove uk-transition-fade uk-position-cover uk-overlay uk-overlay-default uk-text-medium uk-text-success arcade_game_transition_parent";
                // newGameTransitionDiv.textContent = descText;
                newGameImgDiv.appendChild(transitionDiv);

                var textScrollAreaParentDiv = document.createElement("div");
                textScrollAreaParentDiv.classList = "uk-position-top arcade_game_text_scroll_parent";
                transitionDiv.appendChild(textScrollAreaParentDiv);

                var textScrollAreaDiv = document.createElement("div");
                textScrollAreaDiv.classList = "uk-position-top arcade_game_text_scroll_area";
                textScrollAreaDiv.innerHTML = descText.replace(/(?:\r\n\r\n|\r\r|\n\n)/g, '<br><br>');
                textScrollAreaParentDiv.appendChild(textScrollAreaDiv);

                var buttonAreaDiv = document.createElement("div");
                buttonAreaDiv.classList = "uk-position-bottom uk-button-group arcade_game_button_area";
                transitionDiv.appendChild(buttonAreaDiv);

                var downloadButton = document.createElement("button");
                downloadButton.classList = "uk-button uk-button-primary uk-text-small uk-width-1-1";
                downloadButton.textContent = "DOWNLOAD";
                downloadButton.title = "Downloads all game content to connected Thumby";
                buttonAreaDiv.appendChild(downloadButton);

                var openButton = document.createElement("button");
                openButton.classList = "uk-button uk-button-primary uk-text-small uk-width-1-1";
                openButton.textContent = "OPEN";
                openButton.title = "Opens game content in editors. Files with unrecognized file extensions will be asked to be downloaded to PC instead";
                buttonAreaDiv.appendChild(openButton);

                // Wait a small amount of time so don't fetch from repo too quickly (rate limiting)
                await window.sleep(7);

                this.NEXT_GAME_INDEX = this.NEXT_GAME_INDEX + 1;
            }else{
                console.log("Reached library limit, no more games to browse");
            }
        }
    }


    // Go through repo game list from txt file and extract usernames + repo names.
    // While scrolling through games, usernames and repo names are used to traverse
    // each repo listed (not all at once, only when scrolling happens)
    async fillUserAndRepoNameList(){
        var repoLinksTxt = undefined;
        await fetch(this.DIRECT_TXT_URL).then(async (response) => {
            await response.text().then((text) => {
                repoLinksTxt = text;
            });
        });

        // Split the list by whatever newline may be after each line
        var txtFileLines = repoLinksTxt.split(/\r\n|\n|\r/);
        if(txtFileLines.length > 0){
            var currentURLContainer = new GameURLContainer();

            for(var i=0; i < txtFileLines.length; i++){
                if(txtFileLines[i].indexOf("arcade_title_image.png") != -1){
                    currentURLContainer.GAME_IMAGE_URL = txtFileLines[i];
                }else if(txtFileLines[i].indexOf("arcade_title_video.webm") != -1){
                    currentURLContainer.GAME_VIDEO_URL = txtFileLines[i];
                }else if(txtFileLines[i].indexOf("arcade_description.txt") != -1){
                    currentURLContainer.GAME_DESCRIPTION_URL = txtFileLines[i];
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
        this.SHOWN = true;

        if(this.FILLED_GAME_URLS == false){
            await this.fillUserAndRepoNameList();
            this.FILLED_GAME_URLS = true;

            // Start arcade with some number of items loaded (should be enough so that the scroll bar
            // is active (if enough games) and more games can be loaded on all screen sizes)
            this.loadNewGames(12);
        }
    }


    hide(){
        this.ARCADE_BACKGROUND_DIV.style.display = "none";
        this.SHOWN = false;
    }
}
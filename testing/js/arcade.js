class Arcade{
    constructor(){
        this.SHOWN = false;

        // Direct link to raw page from Github of txt file list of repos plus list of list where each sub list is [username, reponame]
        this.DIRECT_REPO_LIST_TXT_URL = "https://raw.githubusercontent.com/arduino/library-registry/main/repositories.txt";
        this.REPO_URL_LIST = [];
        this.FILLED_REPO_LIST = false;
        
        // Index of last game repo pulled from this.FILLED_USER_AND_REPO_NAME_LIST
        this.LAST_LOADED_GAME_REPO_INDEX = 0;


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
        // this.ARCADE_REFRESH_BTN.onclick = () => {this.startEmulator(this.LAST_FILE_CONTENTS)};
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


    loadNewGames(count){
        for(var i=0; i<count; i++){
            // Get index for next game
            var currentGameRepoIndex = this.LAST_LOADED_GAME_REPO_INDEX + i;


            console.log(this.REPO_URL_LIST[currentGameRepoIndex]);

            fetch(this.REPO_URL_LIST[currentGameRepoIndex], {mode: 'cors'})
            .then(response => {
                if (response.ok) {
                    


                } else if(response.status === 404) {
                    return Promise.reject('error 404')
                } else {
                    return Promise.reject('some other error: ' + response.status)
                }
            })
            // .then(data => console.log('data is', data))
            .catch(error => console.log('error is', error));


            this.LAST_LOADED_GAME_REPO_INDEX = currentGameRepoIndex;

            var newGameDiv = document.createElement("div");
            newGameDiv.classList = "arcade_game";
            this.ARCADE_SCROLL_AREA_DIV.appendChild(newGameDiv);
        }
    }


    // Go through repo game list from txt file and extract usernames + repo names.
    // While scrolling through games, usernames and repo names are used to traverse
    // each repo listed (not all at once, only when scrolling happens)
    async fillUserAndRepoNameList(){
        var repoLinksTxt = undefined;
        const gameListTxtURL = "https://raw.githubusercontent.com/arduino/library-registry/main/repositories.txt";
        await fetch(gameListTxtURL).then(async (response) => {
            await response.text().then((text) => {
                repoLinksTxt = text;
            });
        });

        // Split the list by whatever newline may be after each link
        this.REPO_URL_LIST = repoLinksTxt.split(/\r\n|\n|\r/);
        console.log("Found: " + this.REPO_URL_LIST.length + " projects in txt");
    }


    async show(){
        this.ARCADE_BACKGROUND_DIV.style.display = "flex";
        this.SHOWN = true;

        if(this.FILLED_REPO_LIST == false){
            await this.fillUserAndRepoNameList();
            this.FILLED_REPO_LIST = true;

            // Start arcade with some number of items loaded (should be enough so that the scroll bar
            // is active (if enough games) and more games can be loaded on all screen sizes)
            this.loadNewGames(1);
        }
    }


    hide(){
        this.ARCADE_BACKGROUND_DIV.style.display = "none";
        this.SHOWN = false;
    }
}
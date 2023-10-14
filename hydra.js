const InitEvent = new Event("hydra:init");
document.addEventListener('hydra:signal_start', function(){
    console.log("[HY2] Received start signal.");
    window.hydra = {ge:{},window:''};
    window.hydra.window = document.querySelector('#hydra');
    if(!window.hydra.window) return alert("Please add a #hydra element!")&&console.error("[HY2] Could not pass hydra window check.");
    window.hydra['addGameElement'] = function(type, name, coordinates, theme) {
        switch(type) {
            case "player":
                console.log(`[HY2] Player element added at X${coordinates[0]} Y${coordinates[1]}`);
                var playerElement = document.createElement("div");
                playerElement.id = name.toLowerCase();
                window.hydra.window.insertAdjacentElement('beforeend',playerElement);
                playerElement.style.position = `absolute`;
                playerElement.style.left = `${coordinates[0]}px`;
                playerElement.style.top = `${coordinates[1]}px`;
                playerElement.style.width = `${theme.width}px`;
                playerElement.style.height = `${theme.height}px`;
                var background = "";
                if(theme.sprite){background=`url("${theme.sprite}")`}
                if(theme.texture){background=theme.texture}
                playerElement.style.background = background;

                window.hydra.ge[name] = {type,position:coordinates,theme,element:playerElement,setPosition:function(nx,ny){
                    if(!(window.hydra.ge[name].position[0]+nx<0 || window.hydra.ge[name].position[1]+ny<0 || window.hydra.ge[name].element.getBoundingClientRect().x+nx>window.hydra.window.getBoundingClientRect().width+window.hydra.window.getBoundingClientRect().x || window.hydra.ge[name].position[1]+ny>window.hydra.window.clientHeight)) {
                        window.hydra.ge[name].position = [nx,ny];
                        window.hydra.ge[name].element.style.top = `${ny}px`;
                        window.hydra.ge[name].element.style.left = `${nx}px`;
                    }
                },updatePosition:function(nx,ny){
                    if(!(window.hydra.ge[name].position[0]+nx<0 || window.hydra.ge[name].position[1]+ny<0 || window.hydra.ge[name].element.getBoundingClientRect().x+nx>window.hydra.window.getBoundingClientRect().width+window.hydra.window.getBoundingClientRect().x || window.hydra.ge[name].position[1]+ny>window.hydra.window.clientHeight)) {
                        window.hydra.ge[name].position[0] += nx;
                        window.hydra.ge[name].position[1] += ny;
                        window.hydra.ge[name].element.style.left = window.hydra.ge[name].position[0]+'px';
                        window.hydra.ge[name].element.style.top = window.hydra.ge[name].position[1]+'px';
                    }
                }};
                document.addEventListener('keydown', function(e){
                    if(e.key=="w") {
                        window.hydra.ge[name].updatePosition(0,-5);
                    }
                    if(e.key=="a") {
                        window.hydra.ge[name].updatePosition(-5,0);
                    }
                    if(e.key=="s") {
                        window.hydra.ge[name].updatePosition(0,5);
                    }
                    if(e.key=="d") {
                        window.hydra.ge[name].updatePosition(5,0);
                    }
                });
            break;
            case "wall":
                console.log(`[HY2] Wall element added at X${coordinates[0]} Y${coordinates[1]}`);
                var wallElement = document.createElement("div");
                wallElement.id = name.toLowerCase();
                window.hydra.window.insertAdjacentElement('beforeend',wallElement);
                wallElement.style.position = `absolute`;
                wallElement.style.left = `${coordinates[0]}px`;
                wallElement.style.top = `${coordinates[1]}px`;
                wallElement.style.width = `${theme.width}px`;
                wallElement.style.height = `${theme.height}px`;
                var background = "";
                if(theme.sprite){background=`url("${theme.sprite}")`}
                if(theme.texture){background=theme.texture}
                wallElement.style.background = background;

                window.hydra.ge[name] = {type,position:coordinates,theme,element:wallElement,setPosition:function(nx,ny){
                    if(!(window.hydra.ge[name].position[0]+nx<0 || window.hydra.ge[name].position[1]+ny<0 || window.hydra.ge[name].element.getBoundingClientRect().x+nx>window.hydra.window.getBoundingClientRect().width+window.hydra.window.getBoundingClientRect().x || window.hydra.ge[name].position[1]+ny>window.hydra.window.clientHeight)) {
                        window.hydra.ge[name].position = [nx,ny];
                        window.hydra.ge[name].element.style.top = `${ny}px`;
                        window.hydra.ge[name].element.style.left = `${nx}px`;
                    }
                },updatePosition:function(nx,ny){
                    if(!(window.hydra.ge[name].position[0]+nx<0 || window.hydra.ge[name].position[1]+ny<0 || window.hydra.ge[name].element.getBoundingClientRect().x+nx>window.hydra.window.getBoundingClientRect().width+window.hydra.window.getBoundingClientRect().x || window.hydra.ge[name].position[1]+ny>window.hydra.window.clientHeight)) {
                        window.hydra.ge[name].position[0] += nx;
                        window.hydra.ge[name].position[1] += ny;
                        window.hydra.ge[name].element.style.left = window.hydra.ge[name].position[0]+'px';
                        window.hydra.ge[name].element.style.top = window.hydra.ge[name].position[1]+'px';
                    }
                }};
            break;
            default:
                console.error('[HY2] Error while adding game element of type "'+type+'" - Type nonexistent');
            break;
        }
    }
    console.log("[HY2] Initiated!");
    document.dispatchEvent(InitEvent);
})
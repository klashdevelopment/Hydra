// Hydra setup!
// Create the event for hydra to receive.
var _boot = new Event("hydra:signal_start")
document.querySelector('#start').addEventListener('click', function(){
    // You could run this anywhere - i just put it in a button.
    document.dispatchEvent(_boot);
})

// This is for the "new entity maker". You can remove it - but its good for the demo.
document.querySelector('#ne').addEventListener('click', function(){
    if(!window.hydra) return alert("Could not find hydra! Make sure to send the start signal.");
    window.hydra.addGameElement(document.querySelector('#netype').value,document.querySelector('#nename').value,[document.querySelector('#nex').value,document.querySelector('#ney').value],{texture:document.querySelector('#necolor').value,width:document.querySelector('#new').value,height:document.querySelector('#neh').value})
})

// Our game should only run when we receive init.
function rungame() {
    console.log("[Demo] Received Init!");
    if(!window.hydra) return console.error("Hydra has not been initiated, although the init event has been called.");
    console.log("[Demo] Passed hydra's final init check. Starting game...")

    // Heres where we start the fun stuff! Lets add a player.
    const Hydra = window.hydra||{};
    //                    wall
    //                    enemy
    //                    collect           x,y,z  sprite   https://
    //    addGameElement  player    name    x,y    texture  #HEXCODE  width  w  height  h
    Hydra.addGameElement('player', "Name", [0,0], {texture:'#ff0000', width:15, height:15});
    Hydra.addGameElement('wall',  "Still",[50,50], {texture:'#00ff00', width:20, height:20});
}
document.addEventListener('hydra:init', rungame)
var hydra = window.hydra;

document.addEventListener('DOMContentLoaded', function(){
    console.log("[DEMO 3D] dom loaded event received");
    hydra.addBox("cube1", 0xff0000, [1,1,1], [0,0,0], false);
    hydra.addBox("cube2", 0x00ff00, [1,1,1],  [1,0,0], false);
    hydra.addBox("cube3", 0x0000ff, [1,1,1],  [0,0,1], false);
    hydra.addBox("cube4", 0xffff00, [1,1,1],  [1,0,1], false);
    hydra.addBox("cube5", 0xff00ff, [1,1,1],  [-1,0,0], false);
    hydra.addBox("cube6", 0x00ffff, [1,1,1],  [0,0,-1], false);
    hydra.addBox("cube7", 0xffffff, [1,1,1],  [-1,0,-1], false);
    hydra.addBox("cube8", 0x000000, [1,1,1],  [1,0,-1], false);
    hydra.addBox("cube9", 0xFFA500, [1,1,1],  [-1,0,1], false);

    hydra.addText("text1", 0xffffff, "Hello, World", [-0.9,1,-0.5], 0.3);

    hydra.addPlayer([0,0.48,0], 'models/Soldier.glb');
});
document.querySelector('#wire').oninput = function() {
    hydra.elements["cube1"].element.material.wireframe = this.checked;
    hydra.elements["cube2"].element.material.wireframe = this.checked;
    hydra.elements["cube3"].element.material.wireframe = this.checked;
    hydra.elements["cube4"].element.material.wireframe = this.checked;
    hydra.elements["cube5"].element.material.wireframe = this.checked;
    hydra.elements["cube6"].element.material.wireframe = this.checked;
    hydra.elements["cube7"].element.material.wireframe = this.checked;
    hydra.elements["cube8"].element.material.wireframe = this.checked;
    hydra.elements["cube9"].element.material.wireframe = this.checked;
}
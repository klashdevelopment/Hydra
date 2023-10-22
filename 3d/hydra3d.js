
import * as THREE from 'three';
import { Text } from 'troika-three-text';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { CharacterControls } from './charactercontrols.js'

var hydraInit = new Event("hydra:init");

window.hydra = { elements: {} };

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

scene.background = new THREE.Color( 0x007fff );

const renderer = new THREE.WebGLRenderer({ antialias: true, });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true
document.body.appendChild( renderer.domElement );

window.hydra.three = { scene, camera, renderer };

camera.position.z = 5;
function light() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))

    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(- 60, 100, - 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = - 50;
    dirLight.shadow.camera.left = - 50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    scene.add(dirLight);
    // scene.add( new THREE.CameraHelper(dirLight.shadow.camera))
}
light();
class HydraElement {
    options;
    element;
    constructor(element, options) {
        this.element = element;
        this.options = options;
    }

    setPosition(x,y,z) {
        this.element.position.set(x,y,z);
    }
    addPosition(x,y,z) {
        this.element.position.x += x;
        this.element.position.y += y;
        this.element.position.z += z;
    }
    setRotation(x,y,z) {
        this.element.rotation.set(x,y,z);
    }
    addRotation(x,y,z) {
        this.element.rotation.x += x;
        this.element.rotation.y += y;
        this.element.rotation.z += z;
    }
}

window.hydra.addBox = (name, color, dimentions, position, wireframe=false, receiveShadow=true) => {
    console.log("[Hydra] Box added");
    const geometry = new THREE.BoxGeometry( dimentions[0], dimentions[1], dimentions[2] );
    const material = new THREE.MeshBasicMaterial( { color: color, wireframe: wireframe } );
    const cube = new THREE.Mesh( geometry, material );
    cube.receiveShadow = receiveShadow;
    cube.position.set(position[0], position[1], position[2]);
    scene.add( cube );

    var ele = new HydraElement(cube, {name,color,dimentions,wireframe});

    window.hydra.elements[name] = ele;
    return ele;
}

window.hydra.addText = (name, color, text, position, fontSize=1) => {
    console.log("[Hydra] Text added");
    const cube = new Text();
    cube.text = text;
    cube.color = color;
    cube.fontSize = fontSize;
    cube.position.set(position[0], position[1], position[2]);
    scene.add( cube );

    var ele = new HydraElement(cube, {name,color,text,fontSize});

    window.hydra.elements[name] = ele;
    return ele;
}
var tickEvent = new Event("hydra:tick");

var characterControls
window.hydra.addPlayer = (position, modelPath) => {
    new GLTFLoader().load(modelPath, function (gltf) {
        const model = gltf.scene;
        model.traverse(function (object) {
            if (object.isMesh) object.castShadow = true;
        });
        scene.add(model);
    
        const gltfAnimations = gltf.animations;
        const mixer = new THREE.AnimationMixer(model);
        const animationsMap = new Map()
        gltfAnimations.filter(a => a.name != 'TPose').forEach((a) => {
            animationsMap.set(a.name, mixer.clipAction(a))
        })

        gltf.scene.position.set(position[0], position[1], position[2]);
    
        characterControls = new CharacterControls(model, mixer, animationsMap, controls, camera,  'Idle')
    });
};

const controls = new OrbitControls( camera, renderer.domElement );
const loader = new GLTFLoader();
const clock = new THREE.Clock();
function animate() {
	requestAnimationFrame( animate );
    document.dispatchEvent(tickEvent);
    if(characterControls) {
        characterControls.update(clock.getDelta(), keysPressed)
    }
	renderer.render( scene, camera );
}
var dbg_cam = false;

const keysPressed = {  }
document.addEventListener('keydown', (event) => {
    // keyDisplayQueue.down(event.key)
    if (event.shiftKey && characterControls) {
        characterControls.switchRunToggle()
    } else {
        (keysPressed)[event.key.toLowerCase()] = true
    }
}, false);
document.addEventListener('keyup', (event) => {
    // keyDisplayQueue.up(event.key);
    (keysPressed)[event.key.toLowerCase()] = false
}, false);

// WASD controls for camera
document.addEventListener('keydown', (event) => {
    const keyName = event.key;

    if(dbg_cam) {
        if (keyName == 'w') {
            var direction = new THREE.Vector3();
            camera.getWorldDirection( direction );
            var distance = 0.5;
            camera.position.add( direction.multiplyScalar(distance) );
        }
        if (keyName == 's') {
            var direction = new THREE.Vector3();
            camera.getWorldDirection( direction );
            var distance = -0.5;
            camera.position.add( direction.multiplyScalar(distance) );
        }
        if (keyName == 'a') {
            let a = 0
            let b = 90;
            let c = 0
            var direction1 = new THREE.Vector3(a, b, c);
            camera.getWorldDirection( direction1 );
            var distance = -0.5;
            camera.position.add( direction1.multiplyScalar(distance) );
        }
        if (keyName == 'd') {
            camera.position.x += 0.1;
        }
        if (keyName == 'q') {
            camera.position.y -= 0.1;
        }
        if (keyName == 'e') {
            camera.position.y += 0.1;
        }
        controls.update();
    }
});

animate();
import * as THREE from "three";
//import { OrbitControls } from "three/addons/controls/OrbitControls.js";
//import { VRButton } from "three/addons/webxr/VRButton.js";
//import * as Stats from "three/addons/libs/stats.module.js";
//import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

let camera, scene, renderer;
let cameraFront, cameraSide, cameraTop, cameraPerspective;
let robot, towed, feet, legs, torso, head;
let keysPressed = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    q: false,
    a: false,
};
let wireframeOn = true;
const speed = 0.5;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    scene.add(new THREE.AxesHelper(10));

    createTowed(0,0,0);
    createRobot(0,-9.5,30);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////

function createCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 100;

    cameraFront = new THREE.OrthographicCamera(-frustumSize * aspect / 2, frustumSize * aspect / 2, frustumSize / 2, -frustumSize / 2, 0.1, 1000);
    cameraFront.position.set(0, 0, 100);
    cameraFront.lookAt(scene.position);

    cameraSide = new THREE.OrthographicCamera(-frustumSize * aspect / 2, frustumSize * aspect / 2, frustumSize / 2, -frustumSize / 2, 0.1, 1000);
    cameraSide.position.set(100, 0, 0);
    cameraSide.lookAt(scene.position);

    cameraTop = new THREE.OrthographicCamera(-frustumSize * aspect / 2, frustumSize * aspect / 2, frustumSize / 2, -frustumSize / 2, 0.1, 1000);
    cameraTop.position.set(0, 100, 0);
    cameraTop.lookAt(scene.position);

    cameraPerspective = new THREE.PerspectiveCamera(40, aspect, 1, 1000);
    cameraPerspective.position.set(100, 100, 100);
    cameraPerspective.lookAt(scene.position);

    camera = cameraFront;
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function addRobotFoot(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(2, 1, 3);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addRobotLeg(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(2, 6, 2);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addRobotThigh(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(0.5, 2, 0.5);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    obj.add(mesh);
}


function addRobotWheel(obj, x, y, z, material) {
    const geometry = new THREE.CylinderGeometry(1, 1, 1);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.rotation.z = Math.PI /2;
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addRobotWaist(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(6, 2, 2);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addRobotAbdomen(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(4, 2, 2);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addRobotTorso(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(6, 4, 2);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addRobotArm(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(1, 5, 1);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addRobotForerm(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(1, 5, 1);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    mesh.rotation.x = Math.PI / 2;
    obj.add(mesh);
}

function addRobotPipe(obj, x, y, z, material) {
    const geometry = new THREE.CylinderGeometry(0.25, 0.25, 5);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addRobotHead(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(2, 1.5, 1);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addRobotEye(obj, x, y, z, material) {
    const geometry = new THREE.CylinderGeometry(0.25, 0.25, 0.25);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    mesh.rotation.x = Math.PI / 2;
    obj.add(mesh);
}

function addRobotAntenna(obj, x, y, z, material) {
    const geometry = new THREE.CylinderGeometry(0.25, 0.25, 0.5);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function createRobotFeet(obj, x, y, z, material) {
    feet = new THREE.Object3D();

    addRobotFoot(feet, x, y, z, material);
    addRobotFoot(feet, x + 4, y, z, material);
    obj.add(feet);
}

function createRobotLegs(obj, x, y, z, material) {
    legs = new THREE.Object3D();

    addRobotLeg(legs, x, y, z, material);
    addRobotLeg(legs, x + 4, y, z, material);
    addRobotThigh(legs, x, y + 4, z, material);
    addRobotThigh(legs, x + 4, y + 4, z, material);
    addRobotWheel(legs, x - 1.5, y - 2, z, material);
    addRobotWheel(legs, x - 1.5, y + 0.5, z, material);
    addRobotWheel(legs, x + 5.5, y - 2, z, material);
    addRobotWheel(legs, x + 5.5, y + 0.5, z, material);

    obj.add(legs);
}

function createRobotTorso(obj, x, y, z, material) {
    torso = new THREE.Object3D();

    addRobotWaist(torso, x, y, z, material);
    addRobotAbdomen(torso, x, y + 2, z, material);
    addRobotTorso(torso, x, y + 5, z, material);
    addRobotWheel(torso, x - 3.5, y, z, material);
    addRobotWheel(torso, x + 3.5, y, z, material);

    obj.add(torso);
}

function createRobotHead(obj, x, y, z, material) {
    const head = new THREE.Object3D();

    addRobotHead(head, x, y, z, material);
    addRobotEye(head, x - 0.5, y + 0.25, z + 0.5, material);
    addRobotEye(head, x + 0.5, y + 0.25, z + 0.5, material);
    addRobotAntenna(head, x - 0.5, y + 1, z, material);
    addRobotAntenna(head, x + 0.5, y + 1, z, material);

    obj.add(head);
}

function createRobotArms(obj, x, y, z, material) {
    const arms = new THREE.Object3D();

    addRobotArm(arms, x, y, z, material);
    addRobotArm(arms, x + 7, y, z, material);
    addRobotForerm(arms, x, y - 3, z + 2, material);
    addRobotForerm(arms, x + 7, y - 3, z + 2, material);
    addRobotPipe(arms, x - 0.75, y + 1, z - 0.5, material);
    addRobotPipe(arms, x + 7.75, y + 1, z - 0.5, material);

    obj.add(arms);
}

function createRobot(x, y, z) {
    robot = new THREE.Object3D();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    createRobotFeet(robot, x + 1, y + 0.5, z + 1, material);
    createRobotLegs(robot, x + 1, y + 3, z + 0.5, material);
    createRobotTorso(robot, x + 3, y + 9, z + 0.5, material);
    createRobotHead(robot, x + 3, y + 16.75, z, material);
    createRobotArms(robot, x - 0.5, y + 13, z, material);

    scene.add(robot);
}

//////////////////////

function addTowCarriage(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(6, 6, 16);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addTowHitch(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(2, 1, 2);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function createTowed(x, y, z) {
    towed = new THREE.Object3D();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    addTowCarriage(towed, 0, 0, 0, material);
    addTowHitch(towed, 0, -3.5, 6, material);
    addRobotWheel(towed, -2.5, -4, -6, material);
    addRobotWheel(towed, 2.5, -4, -6, material);
    addRobotWheel(towed, -2.5, -4, -4, material);
    addRobotWheel(towed, 2.5, -4, -4, material);
    
    scene.add(towed);   
    towed.position.x = x;
    towed.position.y = y;
    towed.position.z = z;
    towed.scale.set(2,2,2);
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {}

////////////
/* UPDATE */
////////////
function update() {
    const direction = new THREE.Vector3();

    if (keysPressed.ArrowUp)    direction.y += 1;
    if (keysPressed.ArrowDown)  direction.y -= 1;
    if (keysPressed.ArrowRight) direction.x += 1;
    if (keysPressed.ArrowLeft)  direction.x -= 1;
    if (keysPressed.q)          feet.rotation.x += 0.01;
    if (keysPressed.a)          feet.rotation.x -= 0.01;

    if (direction.lengthSq() > 0) {
        direction.normalize();    // normalize the direction vector to keep speed consistent in all directions
        towed.position.add(direction.multiplyScalar(speed));
    }
}

/////////////
/* DISPLAY */
/////////////
function render() {
    renderer.render(scene, camera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    renderer = new THREE.WebGLRenderer({antialias: true,});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    createScene();
    createCamera();
    
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    update();
    render();
    requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {}

//////////////////////
/* CHANGE WIREFRAME */
//////////////////////
function changeWireframe(object) {
    wireframeOn = !wireframeOn;
    object.traverse(child => {
        if (child.isMesh && child.material) {
            child.material.wireframe = wireframeOn;
        }
    });
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    if (e.key in keysPressed) 
        keysPressed[e.key] = true;

    switch (e.key) {
        case '1': camera = cameraFront; break;
        case '2': camera = cameraSide; break;
        case '3': camera = cameraTop; break;
        case '4': camera = cameraPerspective; break;
        case '7': changeWireframe(scene); break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    if (e.key in keysPressed) 
        keysPressed[e.key] = false;
}

init();
animate();
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
let robot;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    scene.add(new THREE.AxesHelper(10));

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

    cameraPerspective = new THREE.PerspectiveCamera(70, aspect, 1, 1000);
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
    const geometry = new THREE.CylinderGeometry(0.5, 2, 2);
    const mesh = new THREE.Mesh(geometry, material);

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
    obj.add(mesh);
}

function addRobotPipe(obj, x, y, z, material) {
    const geometry = new THREE.CylinderGeometry(0.5, 5, 0.5);
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
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addRobotAntenna(obj, x, y, z, material) {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function createRobot(x, y, z) {
    robot = new THREE.Object3D();
    scene.add(robot);
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
function update() {}

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
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    render();
    requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    switch (e.key) {
        case '1': camera = cameraFront; break;
        case '2': camera = cameraSide; break;
        case '3': camera = cameraTop; break;
        case '4': camera = cameraPerspective; break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {}

init();
animate();
import * as THREE from "three";
//import { OrbitControls } from "three/addons/controls/OrbitControls.js";
//import { VRButton } from "three/addons/webxr/VRButton.js";
//import * as Stats from "three/addons/libs/stats.module.js";
//import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

let camera, scene, renderer;
let cameraOrtographic, cameraPerspective;
let robot, towed, feet, legs, torso, head, rightArm, leftArm;
let attachPoint = new THREE.Vector3(0.5, 0, 15);
let keysPressed = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    q: false,
    a: false,
    r: false,
    f: false,
    w: false,
    s: false,
    e: false,
    d: false,
};
let wireframeOn = true;
let cutscene = false;
const speed = 0.5;
let feetRotation = 0;
let headRotation = 0;
let legRotation = 0;
let armsOffset = 0;
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    scene.add(new THREE.AxesHelper(10));

    createTowed(0.5,0,0);
    createRobot(-4,-20,35); 
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////

function createCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 100;

    cameraOrtographic = new THREE.OrthographicCamera(-frustumSize * aspect / 2, frustumSize * aspect / 2, frustumSize / 2, -frustumSize / 2, 0.1, 1000);
    cameraOrtographic.position.set(0, 0, 100);
    cameraOrtographic.lookAt(scene.position);

    cameraPerspective = new THREE.PerspectiveCamera(50, aspect, 1, 1000);
    cameraPerspective.position.set(100, 100, 100);
    cameraPerspective.lookAt(scene.position);

    camera = cameraOrtographic;
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function addRobotFoot(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(2, 1, 2);
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
    const geometry = new THREE.BoxGeometry(1, 4, 1.5);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addRobotForerm(obj, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(1, 3.5, 1.5);
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

    addRobotFoot(feet, 1, 0.5, 1, material);
    addRobotFoot(feet, 5, 0.5, 1, material);
    obj.add(feet);
    feet.position.x = x;
    feet.position.y = y;
    feet.position.z = z;
}

function createRobotLegs(obj, x, y, z, material) {
    legs = new THREE.Object3D();

    addRobotLeg(legs, 0, -5, 0, material);
    addRobotLeg(legs, 4, -5, 0, material);
    addRobotThigh(legs, 0, -1, 0, material);
    addRobotThigh(legs, 4, -1, 0, material);
    addRobotWheel(legs, -1.5, -7, 0.5, material);
    addRobotWheel(legs, -1.5, -4.5, 0.5, material);
    addRobotWheel(legs, 5.5, -7, 0.5, material);
    addRobotWheel(legs, 5.5, -4.5, 0.5, material);

    createRobotFeet(legs, -1, -8, 1, material);

    legs.position.x = x;
    legs.position.y = y;
    legs.position.z = z;
    obj.add(legs);
}

function createRobotTorso(obj, x, y, z, material) {
    torso = new THREE.Object3D();

    addRobotWaist(torso, 0, 0, 0, material);
    addRobotAbdomen(torso, 0, 2, 0, material);
    addRobotTorso(torso, 0, 5, 0, material);
    addRobotWheel(torso, -3.5, -1.5, 0.5, material);
    addRobotWheel(torso, 3.5, -1.5, 0.5, material);

    torso.position.x = x;
    torso.position.y = y;
    torso.position.z = z;
    obj.add(torso);
}

function createRobotHead(obj, x, y, z, material) {
    head = new THREE.Object3D();

    addRobotHead(head, 0, 0.75, 0.5, material);
    addRobotEye(head, -0.5, 1, 1, material);
    addRobotEye(head, 0.5, 1, 1, material);
    addRobotAntenna(head, -0.5, 1.75, 0.5, material);
    addRobotAntenna(head, 0.5, 1.75, 0.5, material);

    head.position.x = x;
    head.position.y = y;
    head.position.z = z;
    obj.add(head);
}

function createRobotRightArm(obj, x, y, z, material) {
    rightArm = new THREE.Object3D();

    addRobotArm(rightArm, 0, 0, 0, material);
    addRobotForerm(rightArm, 0, -2.75, 1, material);
    addRobotPipe(rightArm, -0.75, 1, -0.75, material);

    rightArm.position.x = x;
    rightArm.position.y = y;
    rightArm.position.z = z;
    obj.add(rightArm);
}

function createRobotLeftArm(obj, x, y, z, material) {
    leftArm = new THREE.Object3D();

    addRobotArm(leftArm, 0, 0, 0, material);
    addRobotForerm(leftArm, 0, -2.75, 1, material);
    addRobotPipe(leftArm, 0.75, 1, -0.75, material);

    leftArm.position.x = x;
    leftArm.position.y = y;
    leftArm.position.z = z;
    obj.add(leftArm);
}

function createRobot(x, y, z) {
    robot = new THREE.Object3D();

    createRobotLegs(robot, 1, 8, 0.5, material);
    createRobotTorso(robot, 3, 9, 0.5, material);
    createRobotHead(robot, 3, 16, -0.5, material);
    createRobotRightArm(robot, -0.5, 13.5, -1.25, material);
    createRobotLeftArm(robot, 6.5, 13.5, -1.25, material);

    robot.bbox = new THREE.Box3().setFromObject(robot);
    robot.boxHelper = new THREE.BoxHelper(robot, 0xffff00);  // Debugging tool
    scene.add(robot.boxHelper);

    scene.add(robot);
    robot.position.x = x;
    robot.position.y = y;
    robot.position.z = z;
    robot.scale.set(1.5,1.5,1.5);
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

    addTowCarriage(towed, 0, 0, 0, material);
    addTowHitch(towed, 0, -3.5, 6, material);
    addRobotWheel(towed, -2.5, -4, -6, material);
    addRobotWheel(towed, 2.5, -4, -6, material);
    addRobotWheel(towed, -2.5, -4, -4, material);
    addRobotWheel(towed, 2.5, -4, -4, material);

    towed.bbox = new THREE.Box3().setFromObject(towed);
    towed.boxHelper = new THREE.BoxHelper(towed, 0xffff00); // Debugging tool
    scene.add(towed.boxHelper);

    scene.add(towed);   
    towed.position.x = x;
    towed.position.y = y;
    towed.position.z = z;
    towed.scale.set(2,2,2);
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function updateCollision(obj) {
    obj.bbox.setFromObject(obj);
    obj.boxHelper.setFromObject(obj);
}   

function boxesCollide(obj1, obj2) {
    return obj1.bbox.max.x > obj2.bbox.min.x && obj1.bbox.min.x < obj2.bbox.max.x && 
           obj1.bbox.max.y > obj2.bbox.min.y && obj1.bbox.min.y < obj2.bbox.max.y && 
           obj1.bbox.max.z > obj2.bbox.min.z && obj1.bbox.min.z < obj2.bbox.max.z
}

function truckMode() {
    return  feetRotation == Math.PI && 
            headRotation == -Math.PI &&
            legRotation == Math.PI / 2 &&
            armsOffset == 1;
}

function checkCollisions() {
    updateCollision(robot);
    updateCollision(towed);

    if (boxesCollide(robot, towed) && truckMode()) {
        handleCollisions();
    }
}


///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {
    cutscene = true;
}

////////////
/* UPDATE */
////////////

function updateControls() {
    const direction = new THREE.Vector3();

    if (keysPressed.ArrowUp)    direction.z += 1;
    if (keysPressed.ArrowDown)  direction.z -= 1;
    if (keysPressed.ArrowRight) direction.x += 1;
    if (keysPressed.ArrowLeft)  direction.x -= 1;
    if (keysPressed.q)          feetRotation -= 0.01;
    if (keysPressed.a)          feetRotation += 0.01;
    if (keysPressed.f)          headRotation -= 0.01;
    if (keysPressed.r)          headRotation += 0.01;
    if (keysPressed.w)          legRotation -= 0.01;
    if (keysPressed.s)          legRotation += 0.01;
    if (keysPressed.e)          armsOffset -= 0.05;
    if (keysPressed.d)          armsOffset += 0.05;

    feetRotation = Math.max(0, Math.min(Math.PI, feetRotation));
    if (feet) feet.rotation.x = feetRotation;

    headRotation = Math.max(-Math.PI, Math.min(0, headRotation));
    if (head) head.rotation.x = headRotation;

    legRotation = Math.max(0, Math.min(Math.PI / 2, legRotation));
    if (legs) legs.rotation.x = legRotation;

    armsOffset = Math.max(0, Math.min(1, armsOffset));
    leftArm.position.x = 6.5 - armsOffset;
    rightArm.position.x = -0.5 + armsOffset;

    direction.normalize();    // normalize the direction vector to keep speed consistent in all directions
    towed.position.add(direction.multiplyScalar(speed));
}

function updateAttachTow() {
    const direction = new THREE.Vector3();
    direction.x = attachPoint.x - towed.position.x;
    direction.z = attachPoint.z - towed.position.z;
    const distance = direction.length();
    if (distance > speed) {
        direction.normalize();
        towed.position.add(direction.multiplyScalar(speed));
    } else {
        towed.position.copy(attachPoint);
    }
}

function update() {
    if (cutscene) {
        updateAttachTow();
    } else {
        updateControls();
    }

    checkCollisions();
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
function changeWireframe() {
    wireframeOn = !wireframeOn;
    material.wireframe = wireframeOn;
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    let key = e.key;
    if (!key.startsWith('Arrow')) {
        key = key.toLowerCase();
    }
    if (key in keysPressed) 
        keysPressed[key] = true;

    switch (key) {
        case '1': camera = cameraOrtographic; 
                  camera.position.set(0, 0, 100);
                  camera.lookAt(scene.position);
                  break;
        case '2': camera = cameraOrtographic; 
                  camera.position.set(100, 0, 0);
                  camera.lookAt(scene.position);
                  break;
        case '3': camera = cameraOrtographic;
                  camera.position.set(0, 100, 0);
                  camera.lookAt(scene.position);
                  break;
        case '4': camera = cameraPerspective; 
                  break;
        case '7': changeWireframe(); break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    let key = e.key;
     if (!key.startsWith('Arrow')) {
        key = key.toLowerCase();
    }
    if (key in keysPressed) 
        keysPressed[key] = false;
}

init();
animate();
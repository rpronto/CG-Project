import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { TextureGenerator } from './TextureGenerator.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

let camera, scene, renderer;
let land, skyDome, moon;
let directionalLight, lightOn = true;
let tree;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    scene = new THREE.Scene();

    createLights();
    createSkyDome();
    createMoon();
    createField();
    createTree(50,20,70,0,1);
    createTree(20,15,30,Math.PI,2);
    createTree(10,15,87,Math.PI/4,1.5);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////

function createCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(50, aspect, 1, 1000);
    camera.position.set(100, 90, 100);
    camera.lookAt(scene.position);
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

function createLights() {
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.target.position.set(0, 0, 0); 
    scene.add(directionalLight);
    scene.add(directionalLight.target);
}


////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createMoon() {
    const geometry = new THREE.SphereGeometry(10, 64, 64);
    const loader = new THREE.TextureLoader();
    
    loader.load('utils/moon-texture.jpg', (texture) => {
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            emissive: 0x111111,
            emissiveIntensity: 4,

        });

        moon = new THREE.Mesh(geometry, material);
        moon.position.set(75, 60, -65);
        scene.add(moon);
    });
}

function createField() {
    const width = 255, height = 255, segments = 504;
    const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
    const texture = TextureGenerator.generateFieldTexture();
    const loader = new THREE.TextureLoader();

    loader.load('utils/alentejo-heightmap.png', (heightmap) => {
        let canvas, ctx, imageData, x, y, index, heightValue, material;
        canvas = document.createElement('canvas');
        canvas.width = heightmap.image.width;
        canvas.height = heightmap.image.height;
        ctx = canvas.getContext('2d');
        ctx.drawImage(heightmap.image, 0, 0);

        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        for (let i = 0; i < geometry.attributes.position.count; i++) {
            x = i % canvas.width;
            y = Math.floor(i / canvas.width);
            index = (y * canvas.width + x) * 4;
            heightValue = imageData[index] / 255;
            geometry.attributes.position.setZ(i, heightValue * 30); 
        }

        geometry.computeVertexNormals(); 

        material = new THREE.MeshStandardMaterial({ map: texture });
        land = new THREE.Mesh(geometry, material);
        land.rotation.x = -Math.PI / 2;
        scene.add(land);
    });
}

function createSkyDome() {
    const texture = TextureGenerator.generateSkyTexture();
    const geometry = new THREE.SphereGeometry(500, 60, 40); // bigger than field
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide  
    });

    skyDome = new THREE.Mesh(geometry, material);
    scene.add(skyDome);
}

////////////////////////////////////////////////////

function addTrunk(obj, x, y, z, rot, height, radius) {
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0x4f2d0d});
    const mesh = new THREE.Mesh(geometry, material);

    mesh.rotation.z = rot;
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addLeaves(obj, x, y, z, height, radius) {
    const geometry = new THREE.SphereGeometry(radius);
    const material = new THREE.MeshBasicMaterial({ color: 0x26c751});
    const mesh = new THREE.Mesh(geometry, material);

    mesh.scale.y = height;
    mesh.position.set(x, y, z);
    obj.add(mesh);
}


function createTree(x, y, z, rotation, height) {
    tree = new THREE.Object3D();
    addTrunk(tree, 2.3, 0, 0, (5 * Math.PI) / 36, 5, 1); // 25 degrees
    addTrunk(tree, 0, 4.5, 0, Math.PI / 6, 5, 1);  // 30 degrees
    addTrunk(tree, 3, 5, 0, (-2 * Math.PI) / 10, 5, 0.75); // -40 degrees
    addTrunk(tree, 1, 6, 0, (-2 * Math.PI) / 10, 2, 0.5); // -40 degrees
    addLeaves(tree, 0.8, 7.6, 0, 0.3, 6);
    addLeaves(tree, 0.8, 9.5, 0, 0.3, 4);
    scene.add(tree);

    tree.position.x = x;
    tree.position.y = y;
    tree.position.z = z;
    tree.rotation.y = rotation;
    tree.scale.y = height;
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
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener('resize', onResize, false);
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

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    let key = e.key.toLowerCase();
    switch (key) {
        case '1': 
            if (land) {
                const newTexture = TextureGenerator.generateFieldTexture();
                land.material.map = newTexture;
                land.material.needsUpdate = true;
            }
            break;
        case '2': 
            if (skyDome) {
                const newTexture = TextureGenerator.generateSkyTexture();
                skyDome.material.map = newTexture;
                skyDome.material.needsUpdate = true;
            }
            break;
        case 'd':
            lightOn = !lightOn;
            directionalLight.visible = lightOn;
            break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {}

init();
animate();
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { TextureGenerator } from './TextureGenerator.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

////////////////////////////////
let camera, scene, renderer;
let land, skyDome, moon;
let directionalLight, lightOn = true;
let spotLight, spotLightOn = true;
let pointLightsOn = true;
let ovniRotation = 0;
let tree, house, ovni;
let trees = [];
let VR = false;
const speed = 0.5;
let keysPressed = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
};
let materials = {};
let currentShading = 'gouraud';
let COLORS = {
    ovniBody: new THREE.Color(0x808080),
    ovniCockpit: new THREE.Color(0xffffff),
    ovniLight: new THREE.Color(0xffff00),
    ovniSpotLight: new THREE.Color(0xcbc7bb),
    treeLeaves: new THREE.Color(0x26c751),
    treeTrunk: new THREE.Color(0x966920),
    houseWall: new THREE.Color(0xf0f7f7),
    houseRoof: new THREE.Color(0xf0b756),
    houseWindow: new THREE.Color(0x4b8ad6),
    housePole: new THREE.Color(0x966920),
    houseDoor: new THREE.Color(0x99431f),
}

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    scene = new THREE.Scene();

    createLights();
    createSkyDome();
    createMoon();
    createField();
    createTree(50,13,70,0,1);
    createTree(0,20,30,Math.PI,2);
    createTree(-10,23,-87,Math.PI/4,1.5);
    createTree(-50,25,-15,Math.PI/7,0.8);
    createTree(70,15,-25,2*Math.PI/3,2.5);
    createTree(-70,15,60,Math.PI/2,1.3);
    createHouse(20, 18, -40);
    createOvni(0, 60, 0);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////

function createCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(50, aspect, 1, 1000);
    camera.position.set(100, 100, 100);
    camera.lookAt(scene.position);
}

function resetCameraPosition() {
    camera.position.set(100, 100, 100);
    camera.lookAt(scene.position);
    camera.fov = 50;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

function createLights() {
    directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(75, 60, -65);
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
    const mesh = new THREE.Mesh(geometry, getMaterial(currentShading, COLORS.treeTrunk));
    mesh.name = "treeTrunk";
    mesh.rotation.z = rot;
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addLeaves(obj, x, y, z, height, radius) {
    const geometry = new THREE.SphereGeometry(radius);
    const mesh = new THREE.Mesh(geometry, getMaterial(currentShading, COLORS.treeLeaves));
    mesh.name = "treeLeaf";
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
    trees.push(tree);
}

function addWalls(obj) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xf0f7f7});

    const vertices = new Float32Array( [
    ////////////////    PAREDE DA PORTA
    0.0, 0.0,  4.0,     // inferior esquerdo
    0.0, 7.0,  4.0,     // superior esquerdo
    0.0,  7.0,  22.0,   // superior direito
	0.0,  0.0,  22.0,   // inferior direito
    /////////////////   PAREDE DO BANCO
    0.0, 0.0,  22.0,    // inferior esquerdo
    0.0, 7.0,  22.0,    // superior esquerdo
    -8.0,  7.0,  22.0,  // superior direito
	-8.0,  0.0, 22.0,   // inferior direito
    ]);

    const indices = [
        ////////////////    PAREDE DA PORTA
	    0, 1, 2,
	    2, 3, 0,
        /////////////////   PAREDE DO BANCO
        4, 5, 6,
	    6, 7, 4,
    ];

    geometry.setIndex( indices );
    
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh( geometry, getMaterial(currentShading, COLORS.houseWall) );
    mesh.name = "houseWall";
    obj.add(mesh);
}

function addRoofWall(obj) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xf0f7f7});

    const vertices = new Float32Array( [
    ////////////////    SEGMENTO 1
    -8.0, 7.0,  22.0,     // inferior esquerdo
    -5.75, 8.0,  22.0,   // superior esquerdo
    -2.25, 8.0,  22.0,  // superior direito
	0.0, 7.0,  22.0,   // inferior direito
    /////////////////   SEGMENTO 2
    -5.75, 8.0,  22.0,    // inferior esquerdo
    -4.5, 9.0,  22.0,    // superior esquerdo
    -3.5, 9.0,  22.0,  // superior direito
	-2.25, 8.0,  22.0,   // inferior direito
    /////////////////   SEGMENTO 3
    -4.5, 9.0,  22.0,    // inferior esquerdo
    -4, 10.0,  22.0,    // superior
	-3.5, 9.0,  22.0,   // inferior direito
    ]);

    const indices = [
        ////////////////    PAREDE DA PORTA
	    3, 2, 1,
	    1, 0, 3,
        /////////////////   PAREDE DO BANCO
        7, 6, 5,
	    5, 4, 7,
        /////////////////   PAREDE DO BANCO
        10, 9, 8,
    ];

    geometry.setIndex( indices );
    
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh( geometry, getMaterial(currentShading, COLORS.houseWall));
    mesh.name = "houseRoofWall";
    obj.add(mesh);
}

function addPillar(obj, z) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xf0f7f7});

    const vertices = new Float32Array( [
    /////////////////   PILAR 1 - PARTE LATERAL ESQ
    0.0, 0.0,  22.0,   // inferior esquerdo
    0.0, 5.0,  22.0,   // superior esquerdo
    2.0,  4.0,  22.0, // superior direito
	2.0,  0.0, 22.0,  // inferior direito
    /////////////////   PILAR 1 - PARTE LATERAL DIR
    0.0, 0.0,  20.0,   // inferior esquerdo
    0.0, 5.0,  20.0,   // superior esquerdo
    2.0,  4.0,  20.0, // superior direito
	2.0,  0.0, 20.0,  // inferior direito
    /////////////////   PILAR 1 - PARTE FRONTAL
    2.0,  0.0,  22.0,   // inferior esquerdo
    2.0,  4.0,  22.0,   // superior esquerdo
    2.0,  4.0,  20.0, // superior direito
	2.0,  0.0, 20.0,  // inferior direito
    /////////////////   PILAR 1 - PARTE SUPERIOR
    2.0,  4.0,  22.0,   // inferior esquerdo
    0.0,  5.0,  22.0,   // superior esquerdo
    0.0,  5.0,  20.0, // superior direito
	2.0,  4.0, 20.0,  // inferior direito
    ]);

    const indices = [
        ////////////////    PARTE LATERAL ESQ
	    3, 2, 1,
	    1, 0, 3,
        /////////////////   PARTE LATERAL DIR
        7, 6, 5,
	    5, 4, 7,
        /////////////////   PARTE FRONTAL
        11, 10, 9,
	    9, 8, 11,
        /////////////////   PARTE SUPERIOR
        15, 14, 13,
	    13, 12, 15,
    ];

    geometry.setIndex( indices );
    
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh( geometry, getMaterial(currentShading, COLORS.houseWall) );
    mesh.name = "housePillar";
    mesh.position.set(0, 0, z);
    obj.add(mesh);
}

function addRoof(obj) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xf0b756});
    const vertices = new Float32Array( [   
    ////////////////    TELHADO - SEGMENTO 1
    0.0, 7.0,  4.0,     // inferior esquerdo
    -2.25, 8.0,  4.0,     // superior esquerdo
    -2.25, 8.0,  22.0,   // superior direito
	0.0, 7.0,  22.0,   // inferior direito
    ////////////////    TELHADO - SEGMENTO 2
    -2.25, 8.0,  4.0,     // inferior esquerdo
    -3.5, 9.0,  4.0,     // superior esquerdo
    -3.5, 9.0,  22.0,   // superior direito
	-2.25, 8.0,  22.0,   // inferior direito
    ////////////////    TELHADO - SEGMENTO 3
    -3.5, 9.0,  4.0,     // inferior esquerdo
    -4, 10.0,  4.0,     // superior esquerdo
    -4, 10.0,  22.0,   // superior direito
	-3.5, 9.0,  22.0,   // inferior direito

    ////////////////    TELHADO - SEGMENTO 4
    -8.0, 7.0,  4.0,     // inferior esquerdo
    -5.75, 8.0,  4.0,     // superior esquerdo
    -5.75, 8.0,  22.0,   // superior direito
	-8.0, 7.0,  22.0,   // inferior direito
    ////////////////    TELHADO - SEGMENTO 5
    -5.75, 8.0,  4.0,     // inferior esquerdo
    -4.5, 9.0,  4.0,     // superior esquerdo
    -4.5, 9.0,  22.0,   // superior direito
	-5.75, 8.0,  22.0,   // inferior direito
    ////////////////    TELHADO - SEGMENTO 6
    -4.5, 9.0,  4.0,     // inferior esquerdo
    -4, 10.0,  4.0,     // superior esquerdo
    -4, 10.0,  22.0,   // superior direito
	-4.5, 9.0,  22.0,   // inferior direito
] );

    const indices = [
        ////////////////    TELHADO - SEGMENTO 1
	    0, 1, 2,
	    2, 3, 0,
        /////////////////   TELHADO - SEGMENTO 2
        4, 5, 6,
	    6, 7, 4,
        /////////////////   TELHADO - SEGMENTO 3
        8, 9, 10,
	    10, 11, 8,
        /////////////////   TELHADO - SEGMENTO 4
        14, 13, 12,
	    12, 15, 14,
        /////////////////   TELHADO - SEGMENTO 5
        18, 17, 16,
	    16, 19, 18,
        /////////////////   TELHADO - SEGMENTO 6
        22, 21, 20,
	    20, 23, 22,
    ];

    geometry.setIndex( indices );
    
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh( geometry, getMaterial(currentShading, COLORS.houseRoof) );
    mesh.name = "houseRoof";
    obj.add(mesh);
}

function addChimney(obj) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xf0f7f7});

    const vertices = new Float32Array( [
    /////////////////   CHAMINE - PARTE FRONTAL
    -1.0, 7.5,  8.0,   // inferior esquerdo
    -1.5, 11.0,  8.5,   // superior esquerdo
    -1.5,  11.0,  12.5, // superior direito
	-1.0,  7.5, 13,  // inferior direito
    /////////////////   CHAMINE - PARTE LATERAL DIR
    -3.0, 7.5,  8.0,   // inferior esquerdo
    -3.5, 11.0,  8.5,   // superior esquerdo
    -1.5, 11.0,  8.5, // superior direito
	-1.0, 7.5,  8.0,  // inferior direito
    /////////////////   CHAMINE - PARTE LATERAL ESQ
    -3.0, 7.5,  13.0,   // inferior esquerdo
    -3.5, 11.0,  12.5,   // superior esquerdo
    -1.5, 11.0,  12.5, // superior direito
	-1.0, 7.5,  13.0,  // inferior direito
    /////////////////   CHAMINE - PARTE FRONTAL SUPERIOR
    -1.5, 11.0,  8.5,   // inferior esquerdo
    -1.5, 13.0,  8.5,   // superior esquerdo
    -1.5,  13.0,  12.5, // superior direito
	-1.5,  11.0,  12.5,  // inferior direito
    /////////////////   CHAMINE - PARTE LATERAL ESQ SUPERIOR
    -3.5, 11.0,  12.5,  // inferior esquerdo
    -3.5, 13.0,  12.5,   // superior esquerdo
    -1.5, 13.0,  12.5, // superior direito
	-1.5, 11.0,  12.5,  // inferior direito
    /////////////////   CHAMINE - PARTE LATERAL DIR SUPERIOR
    -3.5, 11.0,  8.5,  // inferior esquerdo
    -3.5, 13.0,  8.5,   // superior esquerdo
    -1.5, 13.0,  8.5, // superior direito
	-1.5, 11.0,  8.5,  // inferior direito
    /////////////////   CHAMINE - PARTE FRONTAL TOPO
    -1.75, 13.0,  8.75,   // inferior esquerdo
    -2.0, 13.5,  9.0,   // superior esquerdo
    -2.0,  13.5,  12.0, // superior direito
	-1.75,  13.0,  12.25,  // inferior direito
    /////////////////   CHAMINE - PARTE LATERAL ESQ TOPO
    -3.25, 13.0,  12.25,  // inferior esquerdo
    -3.0, 13.5,  12.0,   // superior esquerdo
    -2.0, 13.5,  12.0, // superior direito
	-1.75, 13.0,  12.25,  // inferior direito
    /////////////////   CHAMINE - PARTE LATERAL ESQ TOPO
    -2.0, 13.5,  9.0,  // inferior esquerdo
    -3.0, 13.5,  9.0,  // superior esquerdo
    -3.0, 13.5,  12.0, // superior direito
	-1.75, 13.0,  12.0,  // inferior direito
    ]);

    const indices = [
        ////////////////    CHAMINE - PARTE FRONTAL
	    0, 1, 2,
	    2, 3, 0,
        /////////////////   CHAMINE - PARTE LATERAL DIR
        4, 5, 6,
	    6, 7, 4,
        /////////////////   CHAMINE - PARTE LATERAL ESQ
        11, 10, 9,
	    9, 8, 11,
        /////////////////   CHAMINE - PARTE FRONTAL SUPERIOR
        12, 13, 14,
	    14, 15, 12,
        /////////////////   CHAMINE - PARTE LATERAL ESQ SUPERIOR
        19, 18, 17,
	    17, 16, 19,
        /////////////////   CHAMINE - PARTE LATERAL DIR SUPERIOR
        20, 21, 22,
	    22, 23, 20,
        /////////////////   CHAMINE - PARTE SUPERIOR
        22, 17, 18,
	    22, 21, 17,
        /////////////////   CHAMINE - PARTE FRONTAL TOPO
        24, 25, 26,
	    26, 27, 24,
        /////////////////   CHAMINE - PARTE LATERAL ESQ TOPO
        31, 30, 29,
	    29, 28, 31,
        /////////////////   CHAMINE - PARTE SUPERIOR TOPO
        32, 33, 34,
	    34, 35, 32,
    ];

    geometry.setIndex( indices );
    
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh( geometry, getMaterial(currentShading, COLORS.houseWall) );
    mesh.name = "houseChimney";
    obj.add(mesh);
}

function addArmrest(obj, x) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x4b8ad6});

    const vertices = new Float32Array( [
    ////////////////    PARTE FRONTAL INFERIOR
    -2.0, 0.0,  24.5,    // inferior esquerdo
    -2.0, 1.5,  24.5,    // superior esquerdo
    -2.5, 1.5,  24.5,  // superior direito
	-2.5, 0.0,  24.5,   // inferior direito
    /////////////////   PARTE PLANA INFERIOR
    -2.0, 1.5,  24.5,    // inferior esquerdo
    -2.0, 1.5,  23.0,   // superior esquerdo
    -2.5, 1.5,  23.0,   // superior direito
	-2.5, 1.5,  24.5,   // inferior direito
    /////////////////   PARTE FRONTAL SUPERIOR
    -2.0, 1.5,  23.0,    // inferior esquerdo
    -2.0, 3.0,  23.0,   // superior esquerdo
    -2.5, 3.0,  23.0,   // superior direito
	-2.5, 1.5,  23.0,   // inferior direito
    /////////////////   PARTE FRONTAL SUPERIOR
    -2.0, 3.0,  23.0,    // inferior esquerdo
    -2.0, 3.0,  22.0,   // superior esquerdo
    -2.5, 3.0,  22.0,   // superior direito
	-2.5, 3.0,  23.0,   // inferior direito

    -2.0, 0.0, 22.0, 
    
    ]);

    const indices = [
        ////////////////    PARTE FRONTAL INFERIOR
	    0, 1, 2,
	    2, 3, 0,
        ////////////////    PARTE PLANA INFERIOR
	    4, 5, 6,
	    6, 7, 4,
        /////////////////   PARTE FRONTAL SUPERIOR
        8, 9, 10,
	    10, 11, 8,
        /////////////////   PARTE PLANA SUPERIOR
        12, 13, 14,
	    14, 15, 12,
        /////////////////   PARTE LATERAL
        1, 0, 16,
        5, 4, 16,
        9, 8, 16,
        13, 12, 16,
    ];

    geometry.setIndex( indices );
    
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh( geometry, getMaterial(currentShading, COLORS.houseWindow) );
    mesh.name = "houseArmrest";
    mesh.position.set(x, 0, 0);
    obj.add(mesh);
}

function addSeat(obj) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xf0f7f7});

    const vertices = new Float32Array( [
    ////////////////    PARTE FRONTAL INFERIOR
    -2.5, 0.0,  24.0,    // inferior esquerdo
    -2.5, 1.0,  24.0,    // superior esquerdo
    -5.5,  1.0,  24.0,  // superior direito
	-5.5,  0.0, 24.0,   // inferior direito
    /////////////////   ACENTO
    -2.5, 1.0,  24.0,    // inferior esquerdo
    -2.5, 1.0,  22.5,   // superior esquerdo
    -5.5,  1.0,  22.5,   // superior direito
	-5.5,  1.0,  24.0,   // inferior direito
    /////////////////   PARTE FRONTAL SUPERIOR
    -2.5, 1.0,  22.5,    
	-5.5, 1.0,  22.5,   
    -2.5, 2.8,  22.5,
    -3.0, 3.0,  22.5,
    -5.0, 3.0,  22.5,
    -5.5, 2.8,  22.5,
    /////////////////   PARTE SUPERIOR TOPO - SEG1
    -3.0, 3.0,  22.5,
    -2.5, 2.8,  22.5,
    -2.5, 2.8,  22.0,
    -3.0, 3.0,  22.0,
    /////////////////   PARTE SUPERIOR TOPO - SEG2
    -5.0, 3.0,  22.5,
    -3.0, 3.0,  22.5,
    -3.0, 3.0,  22.0,
    -5.0, 3.0,  22.0,
    /////////////////   PARTE SUPERIOR TOPO - SEG3
    -5.5, 2.8,  22.5,
    -5.0, 3.0,  22.5,
    -5.0, 3.0,  22.0,
    -5.5, 2.8,  22.0,
    ]);

    const indices = [
        ////////////////    PARTE FRONTAL INFERIOR
	    0, 1, 2,
	    2, 3, 0,
        ////////////////    ACENTO
	    4, 5, 6,
	    6, 7, 4,
        /////////////////   PARTE FRONTAL SUPERIOR
        8, 10, 9,
        9, 10, 11,
        9, 11, 12,
        9, 12, 13,
        /////////////////   PARTE SUPERIOR TOPO
        14, 15, 16,
	    16, 17, 14,
        18, 19, 20,
	    20, 21, 18,
        22, 23, 24,
	    24, 25, 22,
    ];

    geometry.setIndex( indices );
    
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh( geometry, getMaterial(currentShading, COLORS.houseWall) );
    mesh.name = "houseSeat";
    obj.add(mesh);
}

function addBench(obj) {
    addArmrest(obj, 0);
    addArmrest(obj, -3.5);
    addSeat(obj);
}

function addPole(obj, x) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x966920});

    const vertices = new Float32Array( [
    ////////////////    BASE
    0.0, 0.0, 25.5,  
    -0.25, 0.0, 26.0,
    -0.75, 0.0, 26.0,
    -1.0, 0.0, 25.5,
    -0.75, 0.0, 25.0,
    -0.25, 0.0, 25.0,
    /////////////////   TOP
    0.0, 6.0, 25.5,  
    -0.25, 6.0, 26.0,
    -0.75, 6.0, 26.0,
    -1.0, 6.0, 25.5,
    -0.75, 6.0, 25.0,
    -0.25, 6.0, 25.0,
    ]);

    const indices = [
        ////////////////    SEG1
	    6, 1, 0,
	    6, 7, 1,
        ////////////////    SEG2
	    7, 2, 1,
	    7, 8, 2,
        ////////////////    SEG3
	    8, 3, 2,
	    8, 9, 3,
        ////////////////    SEG4
	    9, 4, 3,
	    9, 10, 4,
        ////////////////    SEG5
	    10, 5, 4,
	    10, 11, 5,
        ////////////////    SEG6
	    11, 0, 5,
	    11, 6, 0,
        
    ];

    geometry.setIndex( indices );
    
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh( geometry, getMaterial(currentShading, COLORS.housePole) );
    mesh.name = "housePole";
    mesh.position.set(x, 0, 0);
    obj.add(mesh);
}

function addHangingRoof(obj) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x966920});

    const vertices = new Float32Array( [
    ////////////////    BASE
    0.0, 6.0, 26.0,     
    -8.0, 6.0, 26.0,      
	0.0, 6.0, 22.0,   
    /////////////////   TOP
    0.0, 7.0, 26.0,     
    -8.0, 7.0, 26.0,
    -8.0, 7.0, 22.0,     
	0.0, 7.0, 22.0,    
    ]);

    const indices = [
        ////////////////    SEG1
	    0, 2, 3,
	    2, 6, 3,
        /////////////////   SEG2
        3, 4, 1,
        0, 3, 1,
        /////////////////   SEG3
        5, 4, 3,
        3, 6, 5
    ];

    geometry.setIndex( indices );
    
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh( geometry, getMaterial(currentShading, COLORS.housePole) );
    mesh.name = "houseHangingRoof";
    obj.add(mesh);
}

function addPorch(obj) {
    addPole(obj, 0);
    addPole(obj, -7);
    addHangingRoof(obj);
}

function addDoor(obj) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x99431f});

    const vertices = new Float32Array( [
        0.0, 0.0, 19.0,     
        0.0, 4.0, 19.0,      
	    0.0, 4.0, 17.0, 
        0.0, 0.0, 17.0, 
    ]);

    const indices = [
	    2, 1, 0,
	    0, 3, 2,
    ];

    geometry.setIndex( indices );
    
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh( geometry, getMaterial(currentShading, COLORS.houseDoor) );
    mesh.name = "houseDoor";
    mesh.position.x += 0.02;
    obj.add(mesh);
}

function addWindow(obj, z) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x4b8ad6});

    const vertices = new Float32Array( [
        0.0, 2.0, 9.0,     
        0.0, 5.0, 9.0,      
	    0.0, 5.0, 7.0, 
        0.0, 2.0, 7.0, 
    ]);

    const indices = [
	    2, 1, 0,
	    0, 3, 2,
    ];

    geometry.setIndex( indices );
    
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh( geometry, getMaterial(currentShading, COLORS.houseWindow) );
    mesh.name = "houseWindow";
    mesh.position.set(0, 0, z);
    mesh.position.x += 0.01;
    obj.add(mesh);
}

function addCircularWindow(obj) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x4b8ad6});

    const vertices = new Float32Array( [
        -4.0, 8.5, 22.0,     
        -4.25, 8.25, 22.0, 
        -4.25, 7.75, 22.0, 
        -4.0, 7.5, 22.0,
        -3.75, 7.75, 22.0, 
        -3.75, 8.25, 22.0, 
    ]);

    const indices = [
	    0, 1, 2,
	    0, 2, 3,
        0, 3, 4,
        0, 4, 5,
    ];

    geometry.setIndex( indices );
    
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh( geometry, getMaterial(currentShading, COLORS.houseWindow) );
    mesh.name = "houseCircularWindow";
    mesh.position.z += 0.01;
    obj.add(mesh);
}

function addWrappingWalls(obj) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x4b8ad6});

    const vertices = new Float32Array( [
    ////////////////    PAREDE DA PORTA
    0.0, 0.0,  4.0,     // inferior esquerdo
    0.0, 1.0,  4.0,     // superior esquerdo
    0.0,  1.0,  22.0,   // superior direito
	0.0,  0.0,  22.0,   // inferior direito
    /////////////////   PAREDE DO BANCO
    0.0, 0.0,  22.0,    // inferior esquerdo
    0.0, 1.0,  22.0,    // superior esquerdo
    -8.0, 1.0,  22.0,  // superior direito
	-8.0, 0.0, 22.0,   // inferior direito
    ]);

    const indices = [
        ////////////////    PAREDE DA PORTA
	    0, 1, 2,
	    2, 3, 0,
        /////////////////   PAREDE DO BANCO
        4, 5, 6,
	    6, 7, 4,
    ];

    geometry.setIndex( indices );
    
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh( geometry, getMaterial(currentShading, COLORS.houseWindow) );
    mesh.name = "houseWrappingWalls";
    mesh.position.x += 0.01;
    mesh.position.z += 0.01;
    obj.add(mesh);
}

function addWrappingRoof(obj, z) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xf0f7f7});
    const vertices = new Float32Array( [   
    ////////////////    TELHADO - SEGMENTO 1
    0.0, 7.0,  4.0,     // inferior esquerdo
    -2.25, 8.0,  4.0,     // superior esquerdo
    -2.25, 8.0,  4.5,   // superior direito
	0.0, 7.0,  4.5,   // inferior direito
    ////////////////    TELHADO - SEGMENTO 2
    -2.25, 8.0,  4.0,     // inferior esquerdo
    -3.5, 9.0,  4.0,     // superior esquerdo
    -3.5, 9.0,  4.5,   // superior direito
	-2.25, 8.0,  4.5,   // inferior direito
    ////////////////    TELHADO - SEGMENTO 3
    -3.5, 9.0,  4.0,     // inferior esquerdo
    -4, 10.0,  4.0,     // superior esquerdo
    -4, 10.0,  4.5,   // superior direito
	-3.5, 9.0,  4.5,   // inferior direito

    ////////////////    TELHADO - SEGMENTO 4
    -8.0, 7.0,  4.0,     // inferior esquerdo
    -5.75, 8.0,  4.0,     // superior esquerdo
    -5.75, 8.0,  4.5,   // superior direito
	-8.0, 7.0,  4.5,   // inferior direito
    ////////////////    TELHADO - SEGMENTO 5
    -5.75, 8.0,  4.0,     // inferior esquerdo
    -4.5, 9.0,  4.0,     // superior esquerdo
    -4.5, 9.0,  4.5,   // superior direito
	-5.75, 8.0,  4.5,   // inferior direito
    ////////////////    TELHADO - SEGMENTO 6
    -4.5, 9.0,  4.0,     // inferior esquerdo
    -4, 10.0,  4.0,     // superior esquerdo
    -4, 10.0,  4.5,   // superior direito
	-4.5, 9.0,  4.5,   // inferior direito
] );

    const indices = [
        ////////////////    PARTE LATERAL ESQ
	    0, 1, 2,
	    2, 3, 0,
        /////////////////   PARTE LATERAL DIR
        4, 5, 6,
	    6, 7, 4,
        /////////////////   PARTE FRONTAL
        8, 9, 10,
	    10, 11, 8,
        /////////////////   PARTE SUPERIOR
        12, 13, 14,
	    14, 15, 12,
        /////////////////   PARTE SUPERIOR
        16, 17, 18,
	    18, 19, 16,
        /////////////////   PARTE SUPERIOR
        20, 21, 22,
	    22, 23, 20,
    ];

    geometry.setIndex( indices );
    
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh( geometry, getMaterial(currentShading, COLORS.houseWall) );
    mesh.name = "houseWrappingRoof";
    mesh.position.set(0, 0, z);
    mesh.position.y += 0.01;
    obj.add(mesh);
}

function addDetails(obj) {
    addDoor(obj);
    addWindow(obj, 0);
    addWindow(obj, 3);
    addCircularWindow(obj);
    addWrappingWalls(obj);
    addWrappingRoof(obj, 0);
    addWrappingRoof(obj, 17.5);
}

function createHouse(x, y, z) {
    house = new THREE.Object3D();
    addWalls(house);
    addRoofWall(house);
    addRoof(house);
    addChimney(house);
    addBench(house);
    addPillar(house, 0);
    addPillar(house, -7);
    addPillar(house, -16);
    addPorch(house);
    addDetails(house);
    addDoor(house);
    house.scale.set(2, 2, 2);
    house.position.set(x, y, z);
    scene.add(house);
}

function addOvniBody(obj, x, y, z) {
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const mesh = new THREE.Mesh(geometry, getMaterial(currentShading, COLORS.ovniBody));
    mesh.name = "ovniBody";
    mesh.scale.y = 0.2
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addOvniCockpit(obj, x, y, z) {
    const geometry = new THREE.SphereGeometry(2, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const mesh = new THREE.Mesh(geometry, getMaterial(currentShading, COLORS.ovniCockpit));
    mesh.name = "ovniCockpit";
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addOvniLight(obj,  x, y, z) {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const mesh = new THREE.Mesh(geometry, getMaterial(currentShading, COLORS.ovniLight));
    const light = new THREE.PointLight( 0xffff00, 2, 100 );
    mesh.name = "ovniLight";
    mesh.add(light);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addOvniSpotlight(obj, x, y, z) {
    const geometry = new THREE.CylinderGeometry(2, 2, 0.5, 32);
    const mesh = new THREE.Mesh(geometry, getMaterial(currentShading, COLORS.ovniSpotLight));
    mesh.name = "ovniSpotLight";
    spotLight = new THREE.SpotLight( 0xffffff, 30, 100, Math.PI / 8);
    mesh.add(spotLight);
    mesh.position.set(x, y, z);
    const target = new THREE.Object3D();
    target.position.set(x, y - 5, z);
    obj.add(target);
    spotLight.target = target;
    obj.add(mesh);
}

function createOvni(x, y, z) {
    ovni = new THREE.Object3D();
    
    addOvniBody(ovni, 0, 0, 0);
    addOvniCockpit(ovni, 0, 0.5, 0);
    addOvniLight(ovni, 2.5, -0.5, 2.5);
    addOvniLight(ovni, -2.5, -0.5, -2.5);
    addOvniLight(ovni, -2.5, -0.5, 2.5);
    addOvniLight(ovni, 2.5, -0.5, -2.5);
    addOvniLight(ovni, 3.5, -0.5, 0);
    addOvniLight(ovni, 0, -0.5, 3.5);
    addOvniLight(ovni, 0, -0.5, -3.5);
    addOvniLight(ovni, -3.5, -0.5, 0);
    addOvniSpotlight(ovni, 0, -1, 0);

    ovni.position.set(x, y, z);
    ovni.scale.set(2, 2, 2);
    scene.add(ovni);
}

function setShading(type) {
    currentShading = type;
    if (ovni)  ovni.traverse(obj => {
        if (obj.isMesh) {
            if (obj.name == "ovniBody") {
                obj.material = getMaterial(type, COLORS.ovniBody);
            } else if (obj.name == "ovniCockpit") {
                obj.material = getMaterial(type, COLORS.ovniCockpit);
            } else if (obj.name == "ovniLight") {
                obj.material = getMaterial(type, COLORS.ovniLight);
            } else if (obj.name == "ovniSpotLight") {
                obj.material = getMaterial(type, COLORS.ovniSpotLight);
            }
        }
    });
    trees.forEach(treeObj => {
        treeObj.traverse(obj => {
            if (obj.isMesh) {
                if (obj.name == "treeTrunk") {
                    obj.material = getMaterial(type, COLORS.treeTrunk);
                } else if (obj.name == "treeLeaf") {
                    obj.material = getMaterial(type, COLORS.treeLeaves);
                }
            }
        });
    });

    if (house)  house.traverse(obj => {
        if (obj.isMesh) {
            if (obj.name == "houseWall" || obj.name == "houseRoofWall" || obj.name == "housePillar" 
                || obj.name == "houseChimney" || obj.name == "houseSeat") {
                obj.material = getMaterial(type, COLORS.houseWall);
            } else if (obj.name == "houseRoof") {
                obj.material = getMaterial(type, COLORS.houseRoof);
            } else if (obj.name == "houseDoor") {
                obj.material = getMaterial(type, COLORS.houseDoor);
            } else if (obj.name == "houseWindow" || obj.name == "houseCircularWindow" || obj.name == "houseArmrest"
                || obj.name == "houseWrappingWalls" || obj.name == "houseWrappingRoof" ) {
                obj.material = getMaterial(type, COLORS.houseWindow);
            } else if (obj.name == "housePole" || obj.name == "houseHangingRoof") {
                obj.material = getMaterial(type, COLORS.housePole);
            } 
        }
    });
}

function getMaterial(type, c) {
    materials = {
        gouraud: new THREE.MeshLambertMaterial({ color: c }),
        phong: new THREE.MeshPhongMaterial({ color: c, specular: 0xffffff, shininess: 100 }),
        toon: new THREE.MeshToonMaterial({ color: c }),
        basic: new THREE.MeshBasicMaterial({ color: c })
    };
    return materials[type];
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
    const ovniVector = new THREE.Vector3();
    if (keysPressed.ArrowUp)    ovniVector.z -= 1;
    if (keysPressed.ArrowDown)  ovniVector.z += 1;
    if (keysPressed.ArrowRight) ovniVector.x += 1;
    if (keysPressed.ArrowLeft)  ovniVector.x -= 1;
    ovniVector.normalize();
    if (ovni) ovni.position.add(ovniVector.multiplyScalar(speed));

    ovniRotation += 0.01
    if (ovni) ovni.rotation.y = ovniRotation;
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
    renderer.xr.enabled = true;
    document.body.appendChild( VRButton.createButton( renderer ) );

    createScene();
    createCamera();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener('resize', onResize, false);
    renderer.xr.addEventListener('sessionstart', () => {
        VR = true;
        scene.position.set(-100,-100,-100);
    });
    renderer.xr.addEventListener('sessionend', () => {
        VR = false;
        resetCameraPosition();
    });
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    renderer.setAnimationLoop(() => {
        update();
        render(); 
    });
    /*    if (VR) {
        renderer.setAnimationLoop(animate);
    } else {
        requestAnimationFrame(animate);
    }
        */
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (window.innerHeight > 0 && window.innerWidth > 0) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
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
        case 's':
            spotLightOn = !spotLightOn;
            if (spotLight) {
                spotLight.visible = spotLightOn;
            }
            break;
        case 'p':
            pointLightsOn = !pointLightsOn;
            if (ovni) {
                ovni.traverse((child) => {
                    if (child instanceof THREE.PointLight) {
                        child.visible = pointLightsOn;
                 }
                });
            }
            break;
        case 'q':
            setShading('gouraud');
            break;
        case 'w':
            setShading('phong');
            break;
        case 'e':
            setShading('toon');
            break;
        case 'r':
            setShading('basic');
            break;
        case '7':
            if (VR) {
                renderer.xr.getSession().end();
                scene.position.set(0,0,0);
            }
            break;
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
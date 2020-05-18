import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxBufferGeometry,
    Object3D,
    MeshBasicMaterial,
    Mesh,
    MeshLambertMaterial,
    AmbientLight
} from "three";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let scene, 
    camera,
    renderer,
    currentMove,
    currentDirection,
    controls,
    scrambleTextArea,
    scrambleSubmitButton,
    resetCameraButton;

let pivot = new Object3D(),
    cubies = [],
    activeGroup = [],
    moveQueue = [];

let layer_filter_map = {
        U: ({x, y, z}) => nearlyEqual(
            y,
            (cubeSize + spacing)
        ),
        D: ({x, y, z}) => nearlyEqual(
            y,
            -(cubeSize + spacing)
        ),
        L: ({x, y, z}) => nearlyEqual(
            x,
            -(cubeSize + spacing)
        ),
        R: ({x, y, z}) => nearlyEqual(
            x,
            (cubeSize + spacing)
        ),
        F: ({x, y, z}) => nearlyEqual(
            z,
            (cubeSize + spacing)
        ),
        B: ({x, y, z}) => nearlyEqual(
            z,
            -(cubeSize + spacing)
        )
    },
    face_map = {
        right: 0,
        left: 1,
        top: 2,
        bottom: 3,
        front: 4,
        back: 5 
    },
    axis_map = {
        L: 'x',
        R: 'x',
        F: 'z',
        B: 'z',
        U: 'y',
        D: 'y'

    },
    direction_map = {
        L: 2,
        R: -2,
        F: -2,
        B: 2,
        U: -2,
        D: 2
    }

let cubeSize = 1,
    spacing = .05,
    rotationSpeed = Math.PI / 45,
    scramblingRotationSpeed = Math.PI / 30,
    isMoving = false;

function nearlyEqual(n, target, distance_allowed = .1) {
    return Math.abs(target - n) <= distance_allowed;
}

function setActiveGroup(layer) {
    activeGroup = cubies.filter(cubie => {
        return layer_filter_map[layer](cubie.position)
    })
}

function startRotation(layer, direction = 1) {
    pivot.rotation.set(0, 0, 0);
    pivot.updateMatrixWorld();
    scene.add(pivot)
    currentMove = layer

    setActiveGroup(layer)

    activeGroup.forEach(cubie => {
        pivot.attach(cubie)
    })

    isMoving = true;
    currentDirection = direction;
}

function rotate() {
    let currentRotation = pivot.rotation[axis_map[currentMove]];
    let goalRotation = Math.PI / (direction_map[currentMove] / currentDirection);

    if (Math.abs(goalRotation) - Math.abs(currentRotation) <= .1) {
        pivot.rotation[axis_map[currentMove]] = goalRotation;
        completeRotation();
    } else {
        pivot.rotation[axis_map[currentMove]] += rotationSpeed 
            * (direction_map[currentMove] / 2)
            * currentDirection;
    }
}

function completeRotation() {
    isMoving = false;
    currentMove = ''

    pivot.updateMatrixWorld();
    scene.remove(pivot);

    activeGroup.forEach(cubie => {
        cubie.updateMatrixWorld();
        scene.attach(cubie);
    })

    activeGroup = []

    if (moveQueue.length != 0){
        let [layer, direction] = moveQueue.shift()
        startRotation(layer, direction)
    }
}

/* Most rubik's cube solvers use a particular notation when describing which faces
   to move, and in what direction, how far

   Take one face of the cube and face it towards you. From this refernce point:

   R: Rotate the Right layer
   L: Rotate the Left Layer 
   U: Rotates the Top layer
   D: Rotates the Bottom Layer
   F: Rotates the Front Layer
   B: Rotates the Back Layer
   
   each layer turn can have a ' or a 2 beside it
   i.e.: R2 or R'

   if the turn has no neighbor you turn it 90 degrees clockwise, clockwise is from the reference of that layer facing you. 

   so if you see R, it moves upward. Youll notice that if you rotate the cube to the left so that layer is facing you, moving it in the same direction is a clockwise turn.

   If the turn has a ' next to it, you rotate the layer counterclockwise
   If the turn has a 2 next to it, you rotate the layer 180 degrees.

   a typical alg might look like this:
   R U R' U R U2 R'

   if you did this right there should be a pattern that resembles a fish on the top face.

   The goal here is to take that and convert it into instructions for the program
*/
function processAlgorithm(algorithm) {
    let instructions = algorithm.split(" ");

    for (let move of instructions) {

        if (move.length === 1) {
            moveQueue.push([move, 1]);
            continue;
        }

        let layer = move[0];
        let direction = move[1] == "'" ? -1 : 2;

        moveQueue.push([layer, direction])
    }
}

function performAlg(algorithm){
    // Im going to need a way to process the algorithm into executable instructions
    processAlgorithm(algorithm)

    let [layer, direction] = moveQueue.shift()
    startRotation(layer, direction)
}

function render() {
    if (isMoving) {
        rotate();
    }
    requestAnimationFrame(render)
    controls.update();
    renderer.render(scene, camera)
}

function init() {
    scene = new Scene();

    renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera = new PerspectiveCamera( 
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    camera.position.x = -10;
    camera.position.y = 10;
    camera.position.z = 20;

    camera.lookAt(scene.position)

    controls = new OrbitControls(camera, renderer.domElement)
    
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 15;
    controls.maxDistance = 15;

    controls.maxPolarAngle = Math.PI;

    scene.add(new AmbientLight(0xffffff));

    document.body.appendChild(renderer.domElement);

    let boxGeometry = new BoxBufferGeometry(
        cubeSize,
        cubeSize,
        cubeSize
    )

    scrambleTextArea = document.getElementById('scramble');
    scrambleSubmitButton = document.getElementById('submit');
    resetCameraButton = document.getElementById('reset-camera');

    scrambleSubmitButton.addEventListener('click', () => {
        let algorithm = scrambleTextArea.value;
        scrambleTextArea.value = '';
        performAlg(algorithm.toUpperCase());
    })

    resetCameraButton.addEventListener('click', () => {
        camera.position.x = -10;
        camera.position.y = 10;
        camera.position.z = 20;
    })
    
    
    for(let x = 0; x < 3; x++) {
        for(let y = 0; y < 3; y++) {
            for(let z = 0; z < 3; z++) {
                let materials = new Array(6);
                let material = new MeshBasicMaterial({color: 0x2c2c2c});
                materials.fill(material)

                if (y == 2)
                    materials[face_map['top']] = new MeshLambertMaterial({color: 'yellow'})
                if (y == 0) 
                    materials[face_map['bottom']] = new MeshLambertMaterial({color: 'white'})
                if (x == 2) 
                    materials[face_map['right']] = new MeshLambertMaterial({color: 'red'})
                if (x == 0) 
                    materials[face_map['left']] = new MeshLambertMaterial({color: 'orange'})
                if (z == 2) 
                    materials[face_map['front']] = new MeshLambertMaterial({color: 'blue'})
                if (z == 0) 
                    materials[face_map['back']] = new MeshLambertMaterial({color: 'green'})

                let cubie = new Mesh(boxGeometry, materials)

                cubie.position.set(
                    (x - 1) * (cubeSize + spacing),
                    (y - 1) * (cubeSize + spacing),
                    (z - 1) * (cubeSize + spacing)
                )
                cubies.push(cubie)
                scene.add(cubie)
            }
        }
    }

    render();
}

init();
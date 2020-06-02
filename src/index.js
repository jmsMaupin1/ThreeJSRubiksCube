import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    DirectionalLight,
    sRGBEncoding,
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import RubiksCube from './RubiksCube';

let scene,
    camera,
    renderer,
    controls,
    rubiksCube;

function render() {    
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
}

function setupLights(scene) {
    const LIGHT_COLOUR = 0xffffff
    const LIGHT_INTENSITY = 1.2
    const LIGHT_DISTANCE = 10

    const light1 = new DirectionalLight(LIGHT_COLOUR, LIGHT_INTENSITY)
    light1.position.set(0, 0, LIGHT_DISTANCE)
    scene.add(light1)

    const light2 = new DirectionalLight(LIGHT_COLOUR, LIGHT_INTENSITY)
    light2.position.set(0, 0, -LIGHT_DISTANCE)
    scene.add(light2)

    const light3 = new DirectionalLight(LIGHT_COLOUR, LIGHT_INTENSITY)
    light3.position.set(0, LIGHT_DISTANCE, 0)
    scene.add(light3)

    const light4 = new DirectionalLight(LIGHT_COLOUR, LIGHT_INTENSITY)
    light4.position.set(0, -LIGHT_DISTANCE, 0)
    scene.add(light4)

    const light5 = new DirectionalLight(LIGHT_COLOUR, LIGHT_INTENSITY)
    light5.position.set(LIGHT_DISTANCE, 0, 0)
    scene.add(light5)

    const light6 = new DirectionalLight(LIGHT_COLOUR, LIGHT_INTENSITY)
    light6.position.set(-LIGHT_DISTANCE, 0, 0)
    scene.add(light6)
}

function setupCamera() {
    camera = new PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    )

    camera.position.x = -10;
    camera.position.y = 10;
    camera.position.z = 20;

    camera.lookAt(scene.position);
}

function setupOrbitControls() {
    controls = new OrbitControls(
        camera,
        renderer.domElement
    );

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 10;
    controls.maxDistance = 13;

    controls.maxPolarAngle = Math.PI;
}

function setupEventHandlers() {
    let scrambleTextArea = document.getElementById('scramble');
    let scrambleSubmitButton = document.getElementById('submit');
    let resetCameraButton = document.getElementById('reset-camera');
    let resetCubeButton = document.getElementById('reset-cube');

    scrambleSubmitButton.addEventListener('click', () => {
        let algorithm = scrambleTextArea.value;
        scrambleTextArea.value = '';
        rubiksCube.performAlg(algorithm);
    })

    resetCameraButton.addEventListener('click', () => {
        camera.position.x = -10;
        camera.position.y = 10;
        camera.position.z = 20;
    })

    resetCubeButton.addEventListener('click', () => {
        rubiksCube.resetCube();
    })
}

async function init() {
    scene = new Scene();

    renderer = new WebGLRenderer({antialias: true});

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.outputEncoding = sRGBEncoding;

    rubiksCube = new RubiksCube({
        cubieSize: 1,
        cubieSpacing: .005,
        moveDuration: 500
    });

    await rubiksCube.init();

    setupCamera();

    setupOrbitControls();

    setupLights(scene)

    document.body.appendChild(renderer.domElement);

    setupEventHandlers();

    scene.add(rubiksCube);

    render();
}

init();
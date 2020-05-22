import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    DirectionalLight,
    sRGBEncoding,
} from "three";

import RubiksCube from './RubiksCube';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene,
    camera,
    renderer,
    scrambleTextArea,
    scrambleSubmitButton,
    resetCameraButton,
    controls,
    rubiksCube;

function render(time) {
    if (rubiksCube.isMoving) {
        rubiksCube.rotate();
    }
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
}

function addLights(scene) {
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

function init() {
    scene = new Scene();

    renderer = new WebGLRenderer();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.outputEncoding = sRGBEncoding;

    rubiksCube = new RubiksCube({
        cubieSize: 1,
        cubieSpacing: .005,
        rotatingSpeed: Math.PI / 45
    });

    rubiksCube.init();

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

    addLights(scene)

    document.body.appendChild(renderer.domElement);

    scrambleTextArea = document.getElementById('scramble');
    scrambleSubmitButton = document.getElementById('submit');
    resetCameraButton = document.getElementById('reset-camera');

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

    scene.add(rubiksCube);

    render();
}

init();
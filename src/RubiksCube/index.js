import {
    Object3D,
    BoxBufferGeometry,
    Mesh,
    MeshLambertMaterial,
    Color,
    MeshPhysicalMaterial,
    Group,
    FaceColors,
    Box3,
    Vector3
} from "three";

import {
    layer_filter_map,
    face_map,
    axis_map,
    direction_map,
    face_color_map
} from './map_constants';

import { loadGeometry, nearlyEqual } from './utils';

export default class RubiksCubeV2 extends Object3D {
    constructor({cubieSize, cubieSpacing, rotatingSpeed}) {
        super()

        this.currentDirection;
        this.currentMove;

        this.cubies = [];
        this.moveQueue = [];
        this.activeGroup = [];

        this.cubieSize = cubieSize;
        this.cubieSpacing = cubieSpacing;
        this.rotatingSpeed = rotatingSpeed;

        this.layer_map = layer_filter_map(this.cubieSize, this.cubieSpacing);

        this.pivot = new Group();

        this.cubieMaterial = new MeshPhysicalMaterial({
            color: 0xeeeeee,
            vertexColors: FaceColors,
            metalness: 0,
            roughness: 0,
            clearcoat: 0,
            reflectivity: 0
        });
        
    }

    setActiveGroup(layer) {
        this.activeGroup = this.cubies.filter(cubie => {
            return this.layer_map[layer](cubie.position)
        })
    }

    startRotation(layer, direction = 1) {
        this.pivot.rotation.set(0, 0, 0);
        this.pivot.updateMatrixWorld();

        this.setActiveGroup(layer);

        this.activeGroup.forEach(cubie => {
            this.pivot.attach(cubie)
        })

        this.add(this.pivot);

        this.isMoving = true;
        this.currentDirection = direction;
        this.currentMove = layer;
    }

    rotate() {
        let {pivot, currentMove, currentDirection, rotatingSpeed, isMoving} = this;

        let currentRotation = pivot.rotation[axis_map[currentMove]];
        let goalRotation = Math.PI / (direction_map[currentMove] / currentDirection);
    
        if (Math.abs(goalRotation) - Math.abs(currentRotation) <= .1) {
            pivot.rotation[axis_map[currentMove]] = goalRotation;
            this.completeRotation();
        } else {
            pivot.rotation[axis_map[currentMove]] += rotatingSpeed
                * (direction_map[currentMove] / 2)
                * currentDirection;
        }
    }
    
    completeRotation() {
        let {pivot, activeGroup, moveQueue} = this;

        this.isMoving = false;
        this.currentMove = '';

        pivot.updateMatrixWorld();
        this.remove(pivot);

        activeGroup.forEach(cubie => {
            cubie.updateMatrixWorld();
            this.attach(cubie);
        })

        activeGroup = [];

        if (moveQueue.length != 0) {
            let [layer, direction] = moveQueue.shift();
            this.startRotation(layer, direction);
        }
    }

    processAlgorithm(algorithm) {
        let instructions = algorithm.split(" ");
    
        for (let move of instructions) {
            if (move === '') continue;

            if (move.length === 1) {
                this.moveQueue.push([move, 1]);
                continue;
            }
    
            let layer = move[0];
            let direction = move[1] == "'" ? -1 : 2;

            this.moveQueue.push([layer, direction])
        }
    }

    performAlg(algorithm){
        this.processAlgorithm(algorithm)
    
        let [layer, direction] = this.moveQueue.shift()
        this.startRotation(layer, direction)
    }

    async init() {
        let {cubieSize, cubieMaterial, cubieSpacing} = this;
        
        let cubieGeometry = await loadGeometry('./assets/cube-bevelled.glb');

        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                for (let z = 0; z < 3; z++) {
                    if(x === 1 && y === 1 && z == 1) continue;
                    
                    let coloredGeo = cubieGeometry.clone();
                    coloredGeo.faces.forEach(face => {
                        face.color = new Color(0x282828)

                        if (y == 2 && nearlyEqual(face.normal.y, 1, 1e-12))
                            face.color = new Color(face_color_map['top']);
                        if (y == 0 && nearlyEqual(face.normal.y, -1, 1e-12))
                            face.color = new Color(face_color_map['bottom']);
                        if (x == 2 && nearlyEqual(face.normal.x, 1, 1e-12))
                            face.color = new Color(face_color_map['right']);
                        if (x == 0 && nearlyEqual(face.normal.x, -1, 1e-12))
                            face.color = new Color(face_color_map['left']);
                        if (z == 2 && nearlyEqual(face.normal.z, 1, 1e-12))
                            face.color = new Color(face_color_map['front']);
                        if (z == 0 && nearlyEqual(face.normal.z, -1, 1e-12))
                            face.color = new Color(face_color_map['back']);
                    })

                    let cubie = new Mesh(coloredGeo, cubieMaterial);
                    let boundingBox = new Box3().setFromObject(cubie)
                    let size = new Vector3();
                    boundingBox.getSize(size);
                    cubie.scale.set(cubieSize/size.x, cubieSize/size.y, cubieSize/size.z);

                    cubie.position.set(
                        (x - 1) * (cubieSize + cubieSpacing),
                        (y - 1) * (cubieSize + cubieSpacing),
                        (z - 1) * (cubieSize + cubieSpacing)
                    )

                    this.cubies.push(cubie);
                    this.attach(cubie);
                }
            }
        }
    }
}
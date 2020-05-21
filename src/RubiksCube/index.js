import {
    Object3D,
    BoxBufferGeometry,
    Mesh,
    MeshLambertMaterial,
    Group
} from "three";

import {
    layer_filter_map,
    face_map,
    axis_map,
    direction_map,
    face_color_map
} from './map_constants';

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
        let {pivot, currentMove, currentDirection, rotatingSpeed} = this;

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
        let {isMoving, currentMove, pivot, activeGroup, moveQueue} = this;

        isMoving = false;
        currentMove = '';

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

    init() {
        let boxGeometry = new BoxBufferGeometry(
            this.cubieSize,
            this.cubieSize,
            this.cubieSize
        )       

        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                for (let z = 0; z < 3; z++) {
                    let colors = new Array(6);
                    colors.fill(0x111111);

                    if (y == 2)
                        colors[face_map['top']] = face_color_map['top'];
                    if (y == 0)
                        colors[face_map['bottom']] = face_color_map['bottom'];
                    if (x == 2)
                        colors[face_map['right']] = face_color_map['right']
                    if (x == 0)
                        colors[face_map['left']] = face_color_map['left'];
                    if (z == 2)
                        colors[face_map['front']] = face_color_map['front']
                    if (z == 0)
                        colors[face_map['back']] = face_color_map['back']

                    let materials = colors.map(color => new MeshLambertMaterial({color}))
                    
                    let cubie = new Mesh(boxGeometry, materials);
                    cubie.userData.colors = colors;

                    cubie.position.set(
                        (x - 1) * (this.cubieSize + this.cubieSpacing),
                        (y - 1) * (this.cubieSize + this.cubieSpacing),
                        (z - 1) * (this.cubieSize + this.cubieSpacing)
                    );

                    this.cubies.push(cubie);
                    this.attach(cubie);
                }
            }
        }
    }
}
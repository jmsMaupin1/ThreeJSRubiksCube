import {
    Object3D,
    Mesh,
    VertexNormalsHelper,
    Color,
    MeshPhysicalMaterial,
    Group,
    FaceColors,
    Box3,
    Vector3
} from "three";

import {
    layer_filter_map,
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

        this.cubie_identity_map = {};

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

    getPieces(ids) {
        ids = ids.map(id => id.split("").sort().join(""))
        return this.cubies.filter(cubie => ids.indexOf(cubie.userData.id) !== -1)
    }

    toggleStickerState(pieces) {
        /* Target stickers by targeting a specific cubie (some id) then 
         * a digit to decide which      stickers to keep
         * 
         * Cubie Target: Sticker's on off status as bits
         * 
         * Corner Example: 
         * U and L faces should remain 'on' while the F sticker should be turned 'off'
         * ULF: 0b110 -> 6
         * 
         * Edge Example:
         * U face sticker should be 'on' while F face sticker should be 'off'
         * UF: 0b10 -> 2
         * 
         * We will get each piece in the piece dictionary, loop through each
         * of the faces in the pieces key 
         * and check them against their corresponding bit in pieces[key] to determine
         * if they should be on or off
        */
        this.getPieces(Object.keys(pieces)).forEach(piece => {
            let faceIDs = piece.userData.id.split("");
            faceIDs.forEach((fid, index, arr) => {
                let faceIndexMask = 1 << (arr.length - 1) - index;
                if (faceIndexMask & pieces[piece.userData.id])
                    piece.userData.faceNormals[fid].forEach(face => {
                        face.color = new Color(face_color_map[fid])
                    })
                else
                    piece.userData.faceNormals[fid].forEach(face => {
                        face.color = new Color(face_color_map['inside'])
                    })
            })
        })
    }

    async init() {
        let {cubieSize, cubieMaterial, cubieSpacing} = this;
        
        let cubieGeometry = await loadGeometry('./assets/cube-bevelled.glb');

        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                for (let z = 0; z < 3; z++) {
                    if(x === 1 && y === 1 && z == 1) continue;

                    // The cubieID is used to allow us to find specific cubies
                    let cubieId = "";

                    let coloredGeo = cubieGeometry.clone();

                    /*
                     * We are using this object to keep track of all the faces
                     * that are are colored for each face of a piece, this way we
                     * can disable/enable them as we need to
                     * 
                    */
                    let faceNormals = {
                        "U": [],
                        "D": [],
                        "R": [],
                        "L": [],
                        "F": [],
                        "B": []
                        
                    }
                    coloredGeo.faces.forEach((face) => {
                        face.color = new Color(face_color_map['inside'])

                        if (y == 2 && nearlyEqual(face.normal.y, 1, 1e-12)) {
                            face.color = new Color(face_color_map['U']);
                            faceNormals['U'].push(face)
                            if (cubieId.indexOf('U') === -1)
                                cubieId += 'U';
                        }if (y == 0 && nearlyEqual(face.normal.y, -1, 1e-12)) {
                            face.color = new Color(face_color_map['D']);
                            faceNormals['D'].push(face);
                            if (cubieId.indexOf('D') === -1)
                                cubieId += 'D';
                        }if (x == 2 && nearlyEqual(face.normal.x, 1, 1e-12)) {
                            face.color = new Color(face_color_map['R']);
                            faceNormals['R'].push(face);
                            if (cubieId.indexOf('R') === -1)
                                cubieId += 'R';
                        }if (x == 0 && nearlyEqual(face.normal.x, -1, 1e-12)) {
                            face.color = new Color(face_color_map['L']);
                            faceNormals['L'].push(face);
                            if (cubieId.indexOf('L') === -1)
                                cubieId += 'L';
                        }if (z == 2 && nearlyEqual(face.normal.z, 1, 1e-12)) {
                            face.color = new Color(face_color_map['F']);
                            faceNormals['F'].push(face);
                            if (cubieId.indexOf('F') === -1)
                                cubieId += 'F';
                        }if (z == 0 && nearlyEqual(face.normal.z, -1, 1e-12)) {
                            face.color = new Color(face_color_map['B']);
                            faceNormals['B'].push(face);
                            if (cubieId.indexOf('B') === -1)
                                cubieId += 'B';
                        }
                    })

                    // This is to scale the cubie mesh to the given size
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

                    cubie.userData.id = cubieId.split("").sort().join("");
                    // This is so we can reset the cube whenever we need to
                    cubie.userData.initialPosition = cubie.position;
                    cubie.userData.initialRotation = cubie.rotation;

                    // This is to keep track of faces on rotation, to enable/disable stickers
                    cubie.userData.faceNormals = faceNormals;

                    this.cubies.push(cubie);
                    this.attach(cubie);
                }
            }
        }
    }
}
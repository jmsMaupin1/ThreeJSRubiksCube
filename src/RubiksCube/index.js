import {
    Object3D,
    Mesh,
    Color,
    MeshPhysicalMaterial,
    Group,
    FaceColors,
    Box3,
    Vector3
} from "three";

import {
    autoPlay,
    Tween
} from 'es6-tween';

import {
    layer_filter_map,
    axis_map,
    direction_map,
    face_color_map
} from './mapConstants';

import { loadGeometry, nearlyEqual } from './utils';

export default class RubiksCubeV2 extends Object3D {
    // moveDuration is in milliseconds
    constructor({cubieSize, cubieSpacing, moveDuration}) {
        super()

        autoPlay(true);

        this.currentDirection;

        this.cubies = [];
        this.moveQueue = [];
        this.activeGroup = [];

        this.cubieSize = cubieSize;
        this.cubieSpacing = cubieSpacing;
        this.moveDuration = moveDuration;

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

    /*
        Here we are given some layer of cubies we want to rotate,
        this looks through each cubie and sees what its position is
        this.layer_map[layer] returns a function that determines if
        a position is in the layer we are looking for.

        You can find the layer_map[layer] function at ./utils
    */
    setActiveGroup(layer) {
        this.activeGroup = this.cubies.filter(cubie => {
            return this.layer_map[layer](cubie.position)
        })
    }

    /*
        pivot is a grouping of objects, we add all the cubies in
        the activeGroup to the pivot group, tell our cube that on each animation
        loop we should be moving and in what direction

        we then tween between the start rotation to the goal rotation
    */
    startRotation(layer, direction = 1) {
        this.pivot.rotation.set(0, 0, 0);
        this.pivot.updateMatrixWorld();

        this.setActiveGroup(layer);

        this.activeGroup.forEach(cubie => {
            this.pivot.attach(cubie)
        })

        this.add(this.pivot);

        let goalAngle = Math.PI / (direction_map[layer] / direction);
        let axis = axis_map[layer];

        new Tween(this.pivot.rotation)
            .to({[axis]: goalAngle}, this.moveDuration)
            .on('complete', () => {
                this.completeRotation();
            })
            .start();
    }

    /*
        Once a rotation is completed we make sure to update the cubies then
        deattach them from the group and reattach them to the cube object.

        Then we check if there are any moves left to make and start that rotation.
    */    
    completeRotation() {
        let {pivot, activeGroup, moveQueue} = this;

        this.isMoving = false;

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
    
    /*
        This takes a human readable algorithm and converts it into instructions the code can understand

        Human Readable looks like: "R U R' U'"

        returns: [{'R', 1}, {'U', 1}, {R, -1}, {U, -1}]
    */
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

    // This allows a user to put in a human readable algorithm, and start the cube moving
    performAlg(algorithm){
        this.processAlgorithm(algorithm)
    
        let [layer, direction] = this.moveQueue.shift()
        this.startRotation(layer, direction)
    }

    /*
        we sort the ids sent in so that we can locate the correct cubie we are referencing in any given array element, 
        then we grab each corresponding cubie
    */
    getPieces(ids) {
        ids = ids.map(id => id.split("").sort().join(""))
        return this.cubies.filter(cubie => ids.indexOf(cubie.userData.id) !== -1)
    }

    toggleStickerState(pieces) {

        /* 
           This gives us the ability to sort the piece key we are looking for 
           to make sure we are grabbing the correct piece, and map it back to the key the user provided

           ex: user provides {"RUF": 0b110}
           the piece ID for this piece is "FRU",
           this will create the map {"FRU": "RUF"}
           This is so that the correct faces will be targeted when we look at which faces to turn on/off
        */
        let sortedKeyToPieceMap = Object.keys(pieces).reduce((map, key) => {
            map[key.split("").sort().join("")] = key
            return map
        }, {})
        
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
         * 
         * Then we tween between the current color and the new one if they are different.
        */
        this.getPieces(Object.keys(pieces)).forEach(piece => {
            let faceIDs = sortedKeyToPieceMap[piece.userData.id].split("");
            faceIDs.forEach((fid, index, arr) => {
                let faceIndexMask = 1 << (arr.length - 1) - index;
                let id = sortedKeyToPieceMap[piece.userData.id]
                let faces = piece.userData.faceNormals[fid];

                if (faceIndexMask & pieces[id]) {
                    if (!faces[0].color.equals(new Color(face_color_map[fid]))) {
                        new Tween(faces[0].color)
                            .to(new Color(face_color_map[fid]), 500)
                            .on('update', c => {
                                piece.userData.faceNormals[fid].forEach(face => {
                                    face.color = c;
                                })

                                piece.geometry.elementsNeedUpdate = true;
                            })
                            .start();
                    }
                } else {
                    if (!faces[0].color.equals(new Color(face_color_map['inside'])))
                        new Tween(faces[0].color)
                            .to(new Color(face_color_map['inside']), 500)
                            .on('update', c => {
                                piece.userData.faceNormals[fid].forEach(face => {
                                    face.color = c;
                                })

                                piece.geometry.elementsNeedUpdate = true;
                            })
                            .start();
                }

            })
        })
    }

    // Allows user to reset back to a solved cube state
    resetCube() {
        this.cubies.forEach(cubie => {
            let { initialPosition } = cubie.userData;
            let { initialRotation } = cubie.userData;

            cubie.position.copy(initialPosition);
            cubie.rotation.copy(initialRotation);
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

                    // Cloing the geometry lets us color specific cubies
                    let coloredGeo = cubieGeometry.clone();

                    /*
                      We are using this object to keep track of all the faces
                      that are are colored for each face of a piece, this way we
                      can disable/enable them as we need to 
                    */
                    let faceNormals = {
                        "U": [],
                        "D": [],
                        "R": [],
                        "L": [],
                        "F": [],
                        "B": []
                    }

                    let faceIndicies = {
                        "U": [],
                        "D": [],
                        "R": [],
                        "L": [],
                        "F": [],
                        "B": []
                    }

                    /*
                        we go through all the faces of the geometry and color them according to
                        which direction that face is facing and what cubie we are currently working on.

                        For each cubie we keep track of the where the faces are in the geometry so that
                        if we need to change individual face colors later we know exactly which of the values
                        in the array to modify without having to loop through all of them again.
                    */
                    coloredGeo.faces.forEach((face, index) => {
                        face.color = new Color(face_color_map['inside'])

                        if (y == 2 && nearlyEqual(face.normal.y, 1, 1e-12)) {
                            face.color = new Color(face_color_map['U']);
                            faceNormals['U'].push(face)
                            faceIndicies['U'].push(index)
                            if (cubieId.indexOf('U') === -1)
                                cubieId += 'U';
                        }if (y == 0 && nearlyEqual(face.normal.y, -1, 1e-12)) {
                            face.color = new Color(face_color_map['D']);
                            faceNormals['D'].push(face);
                            faceIndicies['D'].push(index)
                            if (cubieId.indexOf('D') === -1)
                                cubieId += 'D';
                        }if (x == 2 && nearlyEqual(face.normal.x, 1, 1e-12)) {
                            face.color = new Color(face_color_map['R']);
                            faceNormals['R'].push(face);
                            faceIndicies['R'].push(index)
                            if (cubieId.indexOf('R') === -1)
                                cubieId += 'R';
                        }if (x == 0 && nearlyEqual(face.normal.x, -1, 1e-12)) {
                            face.color = new Color(face_color_map['L']);
                            faceNormals['L'].push(face);
                            faceIndicies['L'].push(index)
                            if (cubieId.indexOf('L') === -1)
                                cubieId += 'L';
                        }if (z == 2 && nearlyEqual(face.normal.z, 1, 1e-12)) {
                            face.color = new Color(face_color_map['F']);
                            faceNormals['F'].push(face);
                            faceIndicies['F'].push(index)
                            if (cubieId.indexOf('F') === -1)
                                cubieId += 'F';
                        }if (z == 0 && nearlyEqual(face.normal.z, -1, 1e-12)) {
                            face.color = new Color(face_color_map['B']);
                            faceNormals['B'].push(face);
                            faceIndicies['B'].push(index)
                            if (cubieId.indexOf('B') === -1)
                                cubieId += 'B';
                        }
                    })

                    /*
                        we create a box from the cubie mesh, the important part here is that 
                        the boundingBox has the same size as that of the cubie mesh, because 
                        different models can be different sizes. we then scale the cubie mesh
                        to the correct size.
                    */
                    let cubie = new Mesh(coloredGeo, cubieMaterial);
                    let boundingBox = new Box3().setFromObject(cubie)
                    let size = new Vector3();
                    boundingBox.getSize(size);
                    cubie.scale.set(
                        cubieSize/size.x,
                        cubieSize/size.y,
                        cubieSize/size.z
                    );

                    cubie.position.set(
                        (x - 1) * (cubieSize + cubieSpacing),
                        (y - 1) * (cubieSize + cubieSpacing),
                        (z - 1) * (cubieSize + cubieSpacing)
                    )

                    // We are making sure the id of each cube is sorted so that we have a consistent way to look them up later
                    cubie.userData.id = cubieId.split("").sort().join("");
                    // This is so we can reset the cube whenever we need to
                    cubie.userData.initialPosition = cubie.position.clone();
                    cubie.userData.initialRotation = cubie.rotation.clone();

                    // This is to keep track of faces on rotation, to enable/disable stickers
                    cubie.userData.faceNormals = faceNormals;
                    cubie.userData.faceIndicies = faceIndicies; 

                    this.cubies.push(cubie);
                    this.attach(cubie);
                }
            }
        }
    }
}

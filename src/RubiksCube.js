import {
    Object3D,
    BoxBufferGeometry,
    Mesh,
    MeshLambertMaterial
} from "three";

export default class RubiksCubeV2 extends Object3D {
    constructor({cubieSize, cubieSpacing, rotatingSpeed}) {
        super()

        this.cubies = [];

        this.cubieSize = cubieSize;
        this.cubieSpacing = cubieSpacing;
        this.rotatingSpeed = rotatingSpeed;

        this.position.set(0, 0, 0);

        this.layer_filter_map = {
            U: ({x, y, z}) => this.nearlyEqual(
                y,
                (this.cubieSize + this.cubieSpacing)
            ),
            D: ({x, y, z}) => this.nearlyEqual(
                y,
                -(this.cubieSize + this.cubieSpacing)
            ),
            L: ({x, y, z}) => this.nearlyEqual(
                x,
                -(this.cubieSize + this.cubieSpacing)
            ),
            R: ({x, y, z}) => this.nearlyEqual(
                x,
                (this.cubieSize + this.cubieSpacing)
            ),
            F: ({x, y, z}) => this.nearlyEqual(
                z,
                (this.cubieSize + this.cubieSpacing)
            ),
            B: ({x, y, z}) => this.nearlyEqual(
                z,
                -(this.cubieSize + this.cubieSpacing)
            )
        }
        
        this.face_map = {
            right: 0,
            left: 1,
            top: 2,
            bottom: 3,
            front: 4,
            back: 5 
        }

        this.face_mesh_map = {
            inside: new MeshLambertMaterial({color: 0x2c2c2c}),
            top: new MeshLambertMaterial({color: 'yellow'}),
            bottom: new MeshLambertMaterial({color: 'white'}),
            right: new MeshLambertMaterial({color: 'red'}),
            left: new MeshLambertMaterial({color: 'darkorange'}),
            front: new MeshLambertMaterial({color: 'blue'}),
            back: new MeshLambertMaterial({color: 'green'})
        }

        this.axis_map = {
            L: 'x',
            R: 'x',
            F: 'z',
            B: 'z',
            U: 'y',
            D: 'y'
    
        }

        this.direction_map = {
            L: 2,
            R: -2,
            F: -2,
            B: 2,
            U: -2,
            D: 2
        }
    }

    init() {
        let boxGeometry = new BoxBufferGeometry(
            this.cubieSize,
            this.cubieSize,
            this.cubieSize
        )

        this.position.set(0, 0, 0);        

        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                for (let z = 0; z < 3; z++) {
                    let materials = new Array(6);
                    let material = new MeshLambertMaterial({color: 0x111111});
                    materials.fill(material);

                    if (y == 2)
                        materials[this.face_map['top']] = this.face_mesh_map['top'];
                    if (y == 0)
                        materials[this.face_map['bottom']] = this.face_mesh_map['bottom'];
                    if (x == 2)
                        materials[this.face_map['right']] = this.face_mesh_map['right'];
                    if (x == 0)
                        materials[this.face_map['left']] = this.face_mesh_map['left'];
                    if (z == 2)
                        materials[this.face_map['front']] = this.face_mesh_map['front'];
                    if (z == 0)
                        materials[this.face_map['back']] = this.face_mesh_map['back'];
                    
                    let cubie = new Mesh(boxGeometry, materials);

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
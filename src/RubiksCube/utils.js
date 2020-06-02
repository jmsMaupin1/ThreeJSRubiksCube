import { Geometry } from 'three';

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

/*
  Due to there being some rounding errors due to precision lost while
  rotating layers in 3D space we need to account for some range of numbers
  this lets us check that the distance between the number we have and the 
  target number is within some acceptable bound.
*/
export const nearlyEqual = (n, target, distance_allowed = .1) => {
    return Math.abs(target - n) <= distance_allowed;
}


/*
  This loads a model from a .glb file (from something like blender)
  for more information on .glb: https://wiki.fileformat.com/3d/glb/
*/
export const loadGeometry = url =>
  new Promise((resolve, reject) => {
  const loader = new GLTFLoader()
  loader.load(
    url,
    gltf => {
      const bufferGeometry = gltf.scene.children[0].geometry
      const geometry = new Geometry()
      geometry.fromBufferGeometry(bufferGeometry)
      resolve(geometry)
    },
    undefined,
    reject
  )
})
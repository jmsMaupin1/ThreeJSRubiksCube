import { Geometry } from 'three';

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export const nearlyEqual = (n, target, distance_allowed = .1) => {
    return Math.abs(target - n) <= distance_allowed;
}

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
    reject)
})
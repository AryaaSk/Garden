import { Injectable } from '@angular/core';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three';
import { Tree } from '../data-service.service';

@Injectable({
  providedIn: 'root'
})
export class ModelsService {

  LoadModel(loader: GLTFLoader, path: string) {
    return new Promise<THREE.Group>((resolve) => {
      loader.load(path, (gltf) => {
        resolve(gltf.scene);
      })
    })
  }

  async GetTreeModel(tree: Tree): Promise<THREE.Group<THREE.Object3DEventMap> | THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material | THREE.Material[], THREE.Object3DEventMap>> {
    //how to create 3D models
    //https://web.blockbench.net
    //create a new project
    //create cube, use dimensions 1x1x1 and set position to (0, 1, 0); this is the base cube
    //duplicate this cube and place above base cube to start building models
    //export model to gltf and import via this function

    //to fix repeating texture problem, need to remove doubleSided: true attribute from .gltf file

    const loader = new GLTFLoader();

    //different tree models have different scales
    //scales[index] = x,y,z scale
    const scales = [
      0,
      7,
      1,
      1,
      1,
      1,
      1,
      1
    ];
    const scale = scales[tree.growthLevel];

    //oak: #a93900

    if (tree.growthLevel == 1) {
      const group = await this.LoadModel(loader, "/assets/3DModels/Oak/GardenOak1.gltf");
      group.scale.set(scale, scale, scale);
      return group;
    }
    else {
      //the tree model should fit within a 5x20x5 square
      const colour = (tree.hydration <= 15) ? 0xc4a84b : 0x49c94f;
      const material = new THREE.MeshStandardMaterial({ color: colour });

      //oak has 8 growth levels and is the only supported type currently
      let dimensions = [0, 0, 0];
      switch (tree.growthLevel) {
        case 1:
          dimensions = [0.5, 2, 0.5]
          break;
        case 2:
          dimensions = [1, 3, 1]
          break;
        case 3:
          dimensions = [1.5, 5, 1.5]
          break;
        case 4:
          dimensions = [2, 8, 2]
          break;
        case 5:
          dimensions = [2.5, 10, 2.5]
          break;
        case 6:
          dimensions = [3, 12, 3]
          break;
        case 7:
          dimensions = [3.5, 15, 3.5]
          break;
        case 8:
          dimensions = [4.5, 19, 4.5]
          break;
        default:
          break
      }

      const geometry = new THREE.BoxGeometry(dimensions[0], dimensions[1], dimensions[2]);
      const mesh = new THREE.Mesh(geometry, material);

      mesh.receiveShadow = true;
      mesh.castShadow = true;

      return mesh;
    }
  }

  constructor() { }
}

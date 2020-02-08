import * as THREE from 'three';

export default class Tree extends THREE.Group {

  constructor() {
    super();

    this.name = "Tree";

    this.createLeaf();
    this.createTrunk();
  }

  // 创建树叶(球体)
  createLeaf() {
    let geometry = new THREE.SphereGeometry(10, 32, 32);
    let material = new THREE.MeshPhongMaterial({ color: new THREE.Color("rgb(148,166,87)"), side: THREE.DoubleSide, emissive: "#737f4a", shininess: 50 });
    let sphere = new THREE.Mesh(geometry, material);
    sphere.position.y = 25;
    // 打开投射阴影
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    this.add(sphere);
  }

  // 创建树干(圆柱体)
  createTrunk() {
    let geometry = new THREE.CylinderGeometry(3, 3, 22, 32);
    let material = new THREE.MeshPhongMaterial({ color: new THREE.Color("rgb(92,46,3)"), side: THREE.DoubleSide, emissive: "#94561c", shininess: 50 });
    let cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.y = 7;
    // 打开投射阴影
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    this.add(cylinder);
  }
}

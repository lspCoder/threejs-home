import * as THREE from 'three';
import Home from './Home/Home';
import Chair from './Chair/Chair';
import Tree from './Tree/Tree';


export default class SeedScene extends THREE.Group {
  constructor() {
    super();

    this.addGround();
    this.addGrassland();
    this.addTrees();
    this.addChairs();
    this.addHome();
  }

  // 添加地面
  addGround() {
    var geometry = new THREE.BoxGeometry(200, 250, 3);
    var material = new THREE.MeshLambertMaterial({ color: new THREE.Color("rgb(173,146,167)"), side: THREE.DoubleSide, emissive: "#5a5a5a" });
    var plane = new THREE.Mesh(geometry, material);
    // 打开接受阴影
    plane.receiveShadow = true;
    plane.rotation.x = Math.PI * -.5;
    this.add(plane);
  }

  // 添加草地
  addGrassland() {
    var geometry = new THREE.BoxGeometry(150, 200, 3);
    var material = new THREE.MeshLambertMaterial({ color: new THREE.Color("rgb(225,229,93)"), side: THREE.DoubleSide, emissive: "#389e0d" });
    var plane = new THREE.Mesh(geometry, material);
    // 打开接受阴影
    plane.receiveShadow = true;
    plane.rotation.x = Math.PI * -.5;
    plane.position.y = 1;
    this.add(plane);
  }

  // 添加树木
  addTrees() {
    var positions = [
      [50, 80],
      [50, -80],
      [-50, 80],
      [-50, -80],
    ]

    for (let index = 0; index < positions.length; index++) {
      const p = positions[index];
      var tree = new Tree();
      tree.position.set(p[0], 5, p[1]);
      this.add(tree);
    }
  }

  // 添加椅子
  addChairs() {
    var positions = [
      [-50, 45],
      [-50, -45],
    ]
    for (let index = 0; index < positions.length; index++) {
      const p = positions[index];
      var chair = new Chair();
      chair.position.set(p[0], 10, p[1]);
      chair.rotateY(THREE.Math.degToRad(90));
      this.add(chair);
    }
  }

  // 添加房屋
  addHome() {
    var home = new Home();
    home.position.set(15, 2, 0);
    this.add(home);
  }

  update(timeStamp) {
    this.rotation.y = timeStamp / 10000;
  }
}

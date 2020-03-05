import * as THREE from 'three';

export default class Chair extends THREE.Group {

  constructor() {
    super();

    this.name = "Chair";
    this.isCustomMesh = true;

    this.width = 30;

    this.createBack();
    this.createBody();
    this.createFoot();

    this.setShadow(true);
  }

  // 创建椅背
  createBack() {
    let group = new THREE.Group();
    let material = new THREE.MeshPhongMaterial({ color: new THREE.Color("rgb(243,207,159)"), side: THREE.DoubleSide, shininess: 100, emissive: "#b59373" });
    let geomtery = new THREE.BoxGeometry(this.width, 3, 1);

    for (var i = 0; i < 3; i++) {
      let cube = new THREE.Mesh(geomtery, material);
      cube.position.y += i * 3.4;
      cube.position.z += i * 1.05;
      cube.rotateX(THREE.Math.degToRad(15));
      group.add(cube);
    }
    group.position.y = 1.5;
    this.add(group);
  }

  // 创建椅身
  createBody() {
    let group = new THREE.Group();
    var nails = new THREE.Group();
    let material = new THREE.MeshPhongMaterial({ color: new THREE.Color("rgb(243,207,159)"), side: THREE.DoubleSide, shininess: 100, emissive: "#b59373" });
    let geometry = new THREE.BoxGeometry(this.width, 1, 3);

    let nailMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color("rgb(90,90,90)"), side: THREE.DoubleSide, emissive: "#447f72" });
    let nailGeometry = new THREE.CylinderGeometry(.5, .5, .5, 20);

    for (var i = 0; i < 3; i++) {
      let cube = new THREE.Mesh(geometry, material);
      cube.position.z += i * 3.4;
      group.add(cube);

      // 创建椅子上的钉子
      let nail = new THREE.Mesh(nailGeometry, nailMaterial);
      nail.position.z = -21 + i * 7;
      nails.add(nail);
    }
    nails.position.x = -12;
    nails.position.y = .5;
    nails.scale.set(.5, .5, .5);
    this.add(nails);
    // 两排钉子
    let secondNails = nails.clone();
    secondNails.position.x = 12;
    secondNails.position.y = .5;
    this.add(secondNails);
    group.position.z = -10;
    this.add(group);
  }

  // 创建椅子脚
  createFoot() {
    let group = new THREE.Group();
    let material = new THREE.MeshPhongMaterial({ color: new THREE.Color("#4E5052"), side: THREE.DoubleSide, emissive: "#3c3f42" });
    let geometry = new THREE.CylinderGeometry(1, 1, 7, 32);
    for (let index = 0; index < 2; index++) {
      let foot = new THREE.Mesh(geometry, material);
      foot.position.x = index * 24;
      group.add(foot);
    }
    group.position.x = -12;
    group.position.z = -6.5;
    group.position.y = -4;
    this.add(group);
  }

  // 递归循环设置所有孩子的投射阴影
  setShadow(isOpenShadow) {
    this.traverse(object => {
      if (object.isMesh) {
        object.castShadow = isOpenShadow;
        object.receiveShadow = isOpenShadow;
        object.updateMatrix();
        object.updateWorldMatrix();
      }
    })
  }

}

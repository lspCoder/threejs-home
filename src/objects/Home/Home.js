import * as THREE from 'three';
import { createDoorTexture, createLogoTexture } from '../../texture/canvasTexture';

export default class Home extends THREE.Group {

  constructor() {
    super();

    this.name = "Home";

    // 墙面的颜色
    this.wallColor = "#93886e";
    // 装饰的颜色
    this.decorateColor = "#cec4bd";

    this.decorateMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color(this.decorateColor), side: THREE.DoubleSide, emissive: "#a8a09a" });
    this.wallMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color(this.wallColor), side: THREE.DoubleSide, emissive: "#78705b" });


    this.createCross();
    this.createLoft();
    this.createRoof()
    this.createBody();
    this.createDoor();
    this.createWindow();
    this.createLogo();
  }

  // 房屋主体
  createBody() {
    let body = new THREE.Group();
    let bodyFootGeomtery = new THREE.BoxGeometry(120, 5, 100);

    // 房屋地基
    let bodyFootMesh = new THREE.Mesh(bodyFootGeomtery, this.decorateMaterial);
    // 房屋主体
    let bodyMainMesh = bodyFootMesh.clone();
    bodyMainMesh.material = this.wallMaterial;
    bodyMainMesh.position.y = 40;
    bodyMainMesh.scale.x = .9;
    bodyMainMesh.scale.y = 15;
    bodyMainMesh.scale.z = .9;
    body.add(bodyFootMesh);
    body.add(bodyMainMesh);


    this.add(body);
  }

  // 屋顶
  createRoof() {
    let roof = new THREE.Group();
    let mainGeometry = new THREE.CylinderGeometry(52.07, 52.07, 108, 3);

    // 屋顶主体
    let roofMainMesh = new THREE.Mesh(mainGeometry, this.wallMaterial);
    roofMainMesh.rotateZ(-Math.PI / 2);
    roofMainMesh.rotateY(Math.PI / 6);
    roofMainMesh.position.y = 103.38;

    // 屋顶斜边Back
    let roofBackSideGroup = new THREE.Group();
    // 屋顶白边
    let roofSideGeometry = new THREE.BoxGeometry(12, 5, 95);
    // 屋顶后边左白边
    let roofLeftSideMesh = new THREE.Mesh(roofSideGeometry, this.decorateMaterial);
    roofLeftSideMesh.position.x = 56;
    roofLeftSideMesh.position.y = 116.74;
    roofLeftSideMesh.position.z = 24.52;
    roofLeftSideMesh.rotateX(Math.PI / 3);

    // 屋顶后边右白边
    let roofRightSideMesh = roofLeftSideMesh.clone();
    roofRightSideMesh.rotateX(Math.PI / 3);
    roofRightSideMesh.position.z = -24;

    roofBackSideGroup.add(roofRightSideMesh);
    roofBackSideGroup.add(roofLeftSideMesh);
    roofBackSideGroup.position.y = 1.14;

    let roofFrontSideGroup = roofBackSideGroup.clone();
    roofFrontSideGroup.position.x = -112;

    // 屋顶侧面右下白边
    let roofBottomRSideGeometry = new THREE.BoxGeometry(124, 3, 8);
    let roofBottomRSideMesh = new THREE.Mesh(roofBottomRSideGeometry, this.decorateMaterial);
    roofBottomRSideMesh.position.y = 76.64;
    roofBottomRSideMesh.position.z = 48.64;

    // 侧面左下白边
    let roofBottomLSideMesh = roofBottomRSideMesh.clone();
    roofBottomLSideMesh.position.z = -48.22;

    roof.add(roofFrontSideGroup);
    roof.add(roofBackSideGroup);
    roof.add(roofBottomRSideMesh);
    roof.add(roofBottomLSideMesh);
    roof.add(roofMainMesh);
    this.add(roof);
  }

  // 屋顶上的小阁楼
  createLoft() {
    let loftGroup = new THREE.Group();
    let loftTopGeometry = new THREE.CylinderGeometry(2, 20, 40, 4);
    let loftTopMesh = new THREE.Mesh(loftTopGeometry, this.decorateMaterial);
    loftTopMesh.rotateY(Math.PI / 4);
    loftTopMesh.position.y = 40;

    let loftMiddleGeometry = new THREE.BoxGeometry(33, 5, 33);
    let loftMiddleMesh = new THREE.Mesh(loftMiddleGeometry, this.decorateMaterial);
    loftMiddleMesh.position.y = 20;

    let loftBottomGeometry = new THREE.BoxGeometry(30, 40, 30);
    let loftBottomMesh = new THREE.Mesh(loftBottomGeometry, this.wallMaterial);

    loftGroup.add(loftTopMesh);
    loftGroup.add(loftMiddleMesh);
    loftGroup.add(loftBottomMesh);
    loftGroup.position.x = -48;
    loftGroup.position.y = 150;
    this.add(loftGroup);
  }

  // 创建房顶的十字架
  createCross() {
    let cross = new THREE.Group();
    let boxHGeometry = new THREE.BoxGeometry(3, 3, 20);
    let boxVGeometry = new THREE.BoxGeometry(3, 25, 3);

    let boxHMesh = new THREE.Mesh(boxHGeometry, this.decorateMaterial);
    boxHMesh.position.y = 5;
    let boxVMesh = new THREE.Mesh(boxVGeometry, this.decorateMaterial);

    cross.add(boxHMesh);
    cross.add(boxVMesh);
    cross.position.x = -48;
    cross.position.y = 220;
    this.add(cross);
  }

  // 房屋的窗户，单独封装便于克隆创建
  createWindow() {
    // 窗户位置大小和旋转角度信息, [x, y, z, scale, angle]
    let positions = [
      [-55, 70, -25, .5, 0],    // 前左窗户
      [-55, 70, 25, .5, 0],    // 前右窗户
      [-34, 40, 47, .6, Math.PI / 2],    // 房屋右侧窗户
      [-1, 40, 47, .6, Math.PI / 2],    // 房屋右侧窗户
      [32, 40, 47, .6, Math.PI / 2],    // 房屋右侧窗户
      [-34, 40, -47, .6, Math.PI / 2],    // 房屋左侧窗户
      [-1, 40, -47, .6, Math.PI / 2],    // 房屋左侧窗户
      [32, 40, -47, .6, Math.PI / 2],    // 房屋左侧窗户
      [-64, 148, 0, .5, 0],    // 小阁楼前侧窗户
      [-47, 148, -16, .5, Math.PI / 2],    // 小阁楼左侧窗户
      [-47, 148, 16, .5, Math.PI / 2],    // 小阁楼右侧窗户
    ]
    for (let index = 0; index < positions.length; index++) {
      const p = positions[index];
      let windowMesh = this.createWindowShape();
      windowMesh.position.set(p[0], p[1], p[2]);
      windowMesh.scale.set(p[3], p[3], p[3]);
      windowMesh.rotateY(p[4]);
      this.add(windowMesh);
    }
  }

  // 房屋的门
  createDoor() {
    let doorHeight = 40;
    let doorGroup = this.createDoorShape(doorHeight);
    doorGroup.position.x = -57;
    doorGroup.position.y = 20;

    // 门内图案
    let shape = new THREE.Shape();
    shape.moveTo(13, -20);
    shape.lineTo(13, 20);
    shape.arc(-13, 0, 13, 0, Math.PI, false);
    shape.moveTo(-13, 20);
    shape.lineTo(-13, -20);
    shape.lineTo(13, -20);

    let geometry = new THREE.ShapeGeometry(shape);
    // let doorMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    let doorMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color(this.decorateColor), side: THREE.DoubleSide, emissive: "#a8a09a" })
    let doorTexture = createDoorTexture();
    doorMaterial.map = doorTexture;
    // 设置纹理坐标???
    // https://stackoverflow.com/questions/33803280/three-js-how-do-i-scaling-and-offset-my-image-textures
    // https://github.com/mrdoob/three.js/issues/1847
    doorMaterial.map.repeat.x = 0.04;
    doorMaterial.map.repeat.y = 0.02;
    doorMaterial.map.offset.x = 0.50;
    doorMaterial.map.offset.y = 0.30;
    let mesh = new THREE.Mesh(geometry, doorMaterial);
    window.doorMesh = mesh;
    mesh.rotateY(Math.PI / 2);
    doorGroup.add(mesh);

    this.add(doorGroup);
  }

  // 房屋门上的标志
  createLogo() {
    let group = new THREE.Group();
    group.name = "logo";
    // 标志圆环
    {
      let geometry = new THREE.TorusGeometry(11, 3, 5, 50);
      let torus = new THREE.Mesh(geometry, this.decorateMaterial);
      torus.position.x = -60;
      torus.position.y = 105;
      torus.rotateY(Math.PI / 2);
      group.add(torus);
    }

    // 标志内图案
    {
      let logoTexture = createLogoTexture();
      let geometry = new THREE.CircleGeometry(9, 32);
      let logoMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
      logoMaterial.map = logoTexture;
      let circle = new THREE.Mesh(geometry, logoMaterial);
      circle.rotateY(Math.PI / 2);
      circle.position.x = -60;
      circle.position.y = 105;
      group.add(circle);
    }
    this.add(group);
  }

  // 创建门和窗的基础模型，上半圆下边矩形
  createDoorShape(height) {
    let result = new THREE.Group();
    let cylinderGeometry = new THREE.TorusGeometry(15, 3, 20, 150, Math.PI);
    let topMesh = new THREE.Mesh(cylinderGeometry, this.decorateMaterial);

    topMesh.rotateY(Math.PI / 2);
    topMesh.position.y = height / 2;
    result.add(topMesh);

    let leftBorderGeometry = new THREE.CylinderGeometry(3, 3, height, 30);
    let leftBoderMesh = new THREE.Mesh(leftBorderGeometry, this.decorateMaterial);
    leftBoderMesh.position.z = -15;
    result.add(leftBoderMesh);

    let rightBorderMesh = leftBoderMesh.clone();
    rightBorderMesh.position.z = 15;
    result.add(rightBorderMesh);

    return result;
  }

  // 同门模型一样，窗模型加入了底部横梁
  createWindowShape() {
    let windowGroup = this.createDoorShape(20);

    let bottomBorderGeometry = new THREE.BoxGeometry(10, 5, 40);
    let bottomBorderMesh = new THREE.Mesh(bottomBorderGeometry, this.decorateMaterial);
    bottomBorderMesh.position.y = -10;
    windowGroup.add(bottomBorderMesh);

    return windowGroup;
  }

  // 递归循环设置所有孩子的投射阴影
  setShadow(isOpenShadow) {
    function loop(parent) {
      for (let i = 0; i < parent.children.length; i++) {
        let object = parent.children[i];
        object.castShadow = isOpenShadow;
        object.receiveShadow = isOpenShadow;
        if (object.children.length) {
          loop(object);
        }
      }
    }
    loop(this);
  }
}

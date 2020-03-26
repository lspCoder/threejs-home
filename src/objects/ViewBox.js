/**
 * @Author: lsp
 * @Date: 2020-03-24 16:54:26
 * @Last Modified by: lsp
 * @Last Modified time: 2020-03-26 14:54:05
 */
import {
  WebGLRenderer,
  OrthographicCamera,
  Scene,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  Raycaster,
  TextureLoader,
  ArrowHelper,
  Vector3,
  Color,
  Group,
  AxesHelper,
  CameraHelper,
  GridHelper
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { getNDCCoordinates } from '../utils';

import png1 from "../texture/viewBox/1.png";
import png2 from "../texture/viewBox/2.png";
import png3 from "../texture/viewBox/3.png";
import png4 from "../texture/viewBox/4.png";
import png5 from "../texture/viewBox/5.png";
import png6 from "../texture/viewBox/6.png";

import resetIcon from "../assets/images/home.png";

const faceMap = {};
faceMap[0] = 'front';
faceMap[1] = 'back';
faceMap[2] = 'top';
faceMap[3] = 'bottom';
faceMap[4] = 'left';
faceMap[5] = 'right';

export default class ViewBox {

  constructor(app, options) {
    this.parent = app.container;
    this.app = app;
    this.normalOpactiy = 0.99;
    // 高亮
    this.activeOpactiy = 0.58;
    this.lastHoverMaterial = null;
    this.group = new Group();
    let { controls } = this.app;
    this.group.rotation.set(controls.getPolarAngle(), -controls.getAzimuthalAngle(), 0);
    this.init(options);
  }

  init(options) {
    this.createContainer();
    this.createResetButton();
    this.createScene(options);
    this.createCube();
    this.createArrows();
    this.render();
    this.createRayCaster();
    this.bindEvent();
  }

  createContainer() {
    let container = this.container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.zIndex = '1000';
    container.style.right = 10 + 'px';
    container.style.top = 10 + 'px';
    this.parent.appendChild(container);
  }

  createScene(options) {
    let renderer = this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x222222, 0); // it's a dark gray
    renderer.setPixelRatio(window.devicePixelRatio || 1);  //高分屏失真问题
    // 设置dom容器大小
    const [width, height] = options.size || [];
    renderer.setSize(width, height);

    let scene = this.scene = new Scene();
    window.scene = scene;

    let camera = this.camera = new OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
    // z轴朝上
    camera.up.set(0, 0, 1);
    // camera.position.copy(this.app.camera.position);
    camera.position.set(0, 100, 0);
    camera.lookAt(0, 0, 0);
    camera.updateMatrix();
    camera.updateProjectionMatrix();
    scene.add(camera);

    this.container.appendChild(renderer.domElement);
  }

  createResetButton() {
    let dom = document.createElement('img');
    dom.src = resetIcon;
    dom.style.width = '25px';
    dom.style.height = '25px';
    dom.style.position = 'absolute';
    dom.style.right = '5px';
    dom.style.top = '5px';
    dom.addEventListener('click', () => {
      this.app.resetCamera();
    }, false);
    this.container.appendChild(dom);
  }

  // 创建导航立方体
  createCube() {
    let geometry = new BoxGeometry(60, 60, 60);
    let materials = [
      new MeshBasicMaterial({ map: new TextureLoader().load(png1), opacity: this.normalOpactiy, transparent: true }),
      new MeshBasicMaterial({ map: new TextureLoader().load(png2), opacity: this.normalOpactiy, transparent: true }),
      new MeshBasicMaterial({ map: new TextureLoader().load(png3), opacity: this.normalOpactiy, transparent: true }),
      new MeshBasicMaterial({ map: new TextureLoader().load(png4), opacity: this.normalOpactiy, transparent: true }),
      new MeshBasicMaterial({ map: new TextureLoader().load(png5), opacity: this.normalOpactiy, transparent: true }),
      new MeshBasicMaterial({ map: new TextureLoader().load(png6), opacity: this.normalOpactiy, transparent: true }),
    ]
    let mesh = new Mesh(geometry, materials);
    let { controls } = this.app;
    mesh.rotation.set(controls.getPolarAngle(), -controls.getAzimuthalAngle(), 0);
    this.scene.add(mesh);
    this.mesh = mesh;

    // test
    // let controls = this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // controls.target.set(0, 0, 0);
    // controls.update();
    // let cameraHelper = new CameraHelper(this.camera);
    // scene.add(cameraHelper);
  }

  // 创建导航箭头
  createArrows() {
    let arrows = this.arrows = new Group();
    let orgin = new Vector3(0, 0, 0);
    let arrowColor = new Color(0x666666);

    {
      // top
      let dir = new Vector3(0, 0, 1);
      let arrow = new ArrowHelper(dir, orgin, 60, arrowColor, 25, 20);
      arrows.add(arrow);
    }
    {
      // front
      let dir = new Vector3(0, 1, 0);
      let arrow = new ArrowHelper(dir, orgin, 60, arrowColor, 25, 20);
      arrows.add(arrow);
    }
    {
      // right
      let dir = new Vector3(1, 0, 0);
      let arrow = new ArrowHelper(dir, orgin, 60, arrowColor, 25, 20);
      arrows.add(arrow);
    }
    {
      // bottom
      let dir = new Vector3(0, 0, -1);
      let arrow = new ArrowHelper(dir, orgin, 60, arrowColor, 25, 20);
      arrows.add(arrow);
    }
    {
      // back
      let dir = new Vector3(0, -1, 0);
      let arrow = new ArrowHelper(dir, orgin, 60, arrowColor, 25, 20);
      arrows.add(arrow);
    }
    {
      // left
      let dir = new Vector3(-1, 0, 0);
      let arrow = new ArrowHelper(dir, orgin, 60, arrowColor, 25, 20);
      arrows.add(arrow);
    }
    let { controls } = this.app;
    arrows.rotation.set(controls.getPolarAngle(), -controls.getAzimuthalAngle(), 0);
    this.scene.add(arrows);
  }

  bindEvent() {
    let { controls } = this.app;
    // 监听主画布变更事件
    controls.addEventListener('change', () => {
      console.log('change');
      // getAzimuthalAngle获取水平角度getPolarAngle获取垂直角度
      this.mesh.rotation.set(controls.getPolarAngle(), -controls.getAzimuthalAngle(), 0);
      this.arrows.rotation.set(controls.getPolarAngle(), -controls.getAzimuthalAngle(), 0);
    })

    this.container.addEventListener('mousemove', this.handleMousemove.bind(this), false);
    this.container.addEventListener('click', this.handleClick.bind(this), false);
  }

  createRayCaster() {
    this.raycaster = new Raycaster();
  }

  render() {
    const animate = () => {
      this.camera.updateMatrix();
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);
      window.requestAnimationFrame(animate);
    }
    window.requestAnimationFrame(animate);
  }

  handleMousemove(event) {
    if (this.lastHoverMaterial) {
      this.lastHoverMaterial.opacity = this.normalOpactiy;
    }
    const [x, y] = getNDCCoordinates(this.renderer.domElement, event);
    this.raycaster.setFromCamera({ x, y }, this.camera);
    let interserts = this.raycaster.intersectObject(this.mesh);
    if (interserts.length > 0) {
      let object = interserts[0].object;
      // 这两句等价效果face包含正反两面，一共12个面
      // let faceIndex = Math.floor(interserts[0].faceIndex / 2);
      let faceIndex = interserts[0].face.materialIndex;
      object.material[faceIndex].opacity = this.activeOpactiy;
      this.lastHoverMaterial = object.material[faceIndex];
    }
  }

  handleClick(event) {
    const [x, y] = getNDCCoordinates(this.renderer.domElement, event);
    this.raycaster.setFromCamera({ x, y }, this.camera);
    let interserts = this.raycaster.intersectObject(this.mesh);
    if (interserts.length > 0) {
      let faceIndex = interserts[0].face.materialIndex;
      console.log(faceIndex);
      this.app.setCameraPositionByDirection(faceMap[faceIndex]);
    }
  }

  resetCamera() {
    this.app.resetCamera();
  }

}

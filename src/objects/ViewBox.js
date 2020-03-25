/**
 * @Author: lsp
 * @Date: 2020-03-24 16:54:26
 * @Last Modified by: lsp
 * @Last Modified time: 2020-03-25 17:31:34
 */
import { WebGLRenderer, OrthographicCamera, Scene, BoxGeometry, MeshBasicMaterial, Mesh, Raycaster, TextureLoader, Object3D, ArrowHelper, Vector3, Color, Group } from 'three';
import { getNDCCoordinates } from '../utils';

import png1 from "../texture/viewBox/1.png";
import png2 from "../texture/viewBox/2.png";
import png3 from "../texture/viewBox/3.png";
import png4 from "../texture/viewBox/4.png";
import png5 from "../texture/viewBox/5.png";
import png6 from "../texture/viewBox/6.png";

export default class ViewBox {

  constructor(app, options) {
    this.parent = app.container;
    this.app = app;
    this.normalOpactiy = 0.99;
    // 高亮
    this.activeOpactiy = 0.58;
    this.lastHoverMaterial = null;
    this.init(options);
  }

  init(options) {
    this.createContainer();
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

    let camera = this.camera = new OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
    // z轴朝上
    camera.up.set(0, 0, 1);
    // camera.position.copy(this.app.camera.position);
    camera.lookAt(scene.position);
    scene.add(camera);

    this.container.appendChild(renderer.domElement);
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
    mesh.position.z = -100;
    let { controls } = this.app;
    mesh.rotation.set(controls.getAzimuthalAngle(), 0, -controls.getPolarAngle());
    this.scene.add(mesh);
    this.mesh = mesh;
  }

  // 创建导航箭头
  createArrows() {
    let arrows = new Group();
    let orgin = new Vector3(0, 0, 0);
    let arrowColor = new Color(0x666666);

    {
      // top
      let dir = new Vector3(0, 0, 1);
      let arrow = new ArrowHelper(dir, orgin, 60, arrowColor);
      arrows.add(arrow);
      this.scene.add(arrow);
    }
    {
      // front
      let dir = new Vector3(0, 1, 0);
      let arrow = new ArrowHelper(dir, orgin, 60, arrowColor);
      arrows.add(arrow);
      this.scene.add(arrow);
    }
    {
      // right
      let dir = new Vector3(1, 0, 0);
      let arrow = new ArrowHelper(dir, orgin, 60, arrowColor);
      arrows.add(arrow);
      this.scene.add(arrow);
    }
    {
      // bottom
      let dir = new Vector3(0, 0, -1);
      let arrow = new ArrowHelper(dir, orgin, 60, arrowColor);
      arrows.add(arrow);
      this.scene.add(arrow);
    }
    {
      // back
      let dir = new Vector3(0, -1, 0);
      let arrow = new ArrowHelper(dir, orgin, 60, arrowColor);
      arrows.add(arrow);
      this.scene.add(arrow);
    }
    {
      // left
      let dir = new Vector3(-1, 0, 0);
      let arrow = new ArrowHelper(dir, orgin, 60, arrowColor);
      arrows.add(arrow);
      this.scene.add(arrow);
    }
  }

  bindEvent() {
    let { controls } = this.app;
    // 监听主画布变更事件
    this.app.controls.addEventListener('change', () => {
      console.log('change');
      this.mesh.rotation.set(controls.getAzimuthalAngle(), 0, -controls.getPolarAngle());
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
      this.lastHoverMaterial = object.material[faceIndex]
    }
  }

  handleClick(event) {
    const [x, y] = getNDCCoordinates(this.renderer.domElement, event);
    this.raycaster.setFromCamera({ x, y }, this.camera);
    let interserts = this.raycaster.intersectObject(this.mesh);
    if (interserts.length > 0) {
      let object = interserts[0].object;
      let faceIndex = interserts[0].face.materialIndex;
      console.log(faceIndex);
    }
  }

  resetCamera() {
    this.app.resetCamera();
  }

}

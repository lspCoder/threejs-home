import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Raycaster,
  GridHelper,
  BoxHelper,
  AxesHelper,
  CameraHelper,
  DirectionalLightHelper,
  PCFSoftShadowMap
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as Detector from "./vender/Detector";
import * as dat from 'dat.gui';


import BasicLights from './objects/Lights';
import SeedScene from './objects/Scene.js';
import { createBackground, createCubeTexture } from "./texture/canvasTexture";


export default class Application {
  constructor(opts = {}) {
    if (opts.container) {
      this.container = opts.container;
    } else {
      this.container = this.createContainer();
    }
    // this.createTooltip();
    this.showHelpers = !!opts.showHelpers;

    if (Detector.webgl) {
      this.init();
      this.render();
    } else {
      // console.warn("WebGL NOT supported in your browser!");
      const warning = Detector.getWebGLErrorMessage();
      this.container.appendChild(warning);
    }

    this.selectObject = null;
  }

  init() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.bindEventHandlers();
    this.setupControls();
    this.setupRay();
    this.addLights();
    this.addObjects();

    if (this.showHelpers) {
      this.setupHelpers();
    }
  }

  /**
   * Bind event handlers to the Application instance.
   */
  bindEventHandlers() {
    if (!this.renderer) throw "renderer didn't init";
    window.addEventListener('resize', this.handleResize.bind(this));
    this.renderer.domElement.addEventListener('click', this.handleClick.bind(this));
    this.renderer.domElement.addEventListener('mousemove', this.handleMouseMove.bind(this));
  }

  setupScene() {
    const scene = this.scene = new Scene();
    // background可以接收Color、Texture或CubeTexture
    // scene.background = createBackground();
    scene.background = createCubeTexture();
    scene.position.y = -80;
  }

  setupCamera() {
    // near,far的值会影响深度闪烁问题,可根据效果微调
    const camera = this.camera = new PerspectiveCamera(35, this.container.offsetWidth / this.container.offsetHeight, 5, 10000);
    camera.up.set(0, 1, 0); //默认Y轴向上
    camera.rotateY(Math.PI / 4);
    camera.position.set(-470, 125, 308);
    camera.lookAt(this.scene.position);
    this.scene.add(camera);
    camera.updateProjectionMatrix();
  }


  setupRenderer() {
    const renderer = this.renderer = new WebGLRenderer({ antialias: true });
    // this.renderer.setClearColor(0xd3d3d3);  // it's a light gray
    renderer.setClearColor(0x222222); // it's a dark gray
    renderer.setPixelRatio(window.devicePixelRatio || 1);  //高分屏失真问题
    // 设置dom容器大小
    const { clientWidth, clientHeight } = this.container;
    renderer.setSize(clientWidth, clientHeight);
    // 打开渲染器阴影
    renderer.shadowMap.enabled = true;
    // 使阴影柔和
    renderer.shadowMap.type = PCFSoftShadowMap;
    this.container.appendChild(renderer.domElement);
  }

  setupControls() {
    let controls = this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // controls.maxPolarAngle = 0.9 * Math.PI / 2;
    controls.update();
  }

  // 添加射线增加拾取
  setupRay() {
    this.raycaster = new Raycaster();
  }

  addObjects() {
    const seedScene = this.seedScene = new SeedScene();
    this.scene.add(seedScene);
  }

  addLights() {
    let lights = this.lights = new BasicLights();
    this.scene.add(lights);
  }

  render() {
    const onAnimationFrameHandler = (timeStamp) => {
      this.renderer.render(this.scene, this.camera);
      this.seedScene.update && this.seedScene.update(timeStamp);
      window.requestAnimationFrame(onAnimationFrameHandler);
    }
    window.requestAnimationFrame(onAnimationFrameHandler);
  }

  createContainer() {
    let container = document.createElement("div");
    container.style.width = `${window.innerWidth}px`;
    container.style.height = `${window.innerHeight}px`;
    document.body.appendChild(container);
    return container;
  }

  handleClick(e) {
    const [x, y] = this.getNDCCoordinates(event, true);
  }

  handleMouseMove(event) {
    if (this.selectObject) {
      this.scene.remove(this.selectObject);
    }
    const [x, y] = this.getNDCCoordinates(event);
    this.raycaster.setFromCamera({ x, y }, this.camera);
    const intersects = this.raycaster.intersectObjects(this.seedScene.children, true);

    if (intersects.length > 0) {
      const hexColor = Math.random() * 0xffffff;
      const intersection = intersects[0];
      // 选中整体标识
      if (intersection.object.parent.isCustomMesh) {
        this.selectObject = new BoxHelper(intersection.object.parent, 0xffff00);
        this.scene.add(this.selectObject);
      }

      // const { direction, origin } = this.raycaster.ray;
      // const arrow = new ArrowHelper(direction, origin, 100, hexColor);
      // this.scene.add(arrow);
    }
  }

  // todo
  handleResize(e) {
    // const { offsetWidth, offsetHeight } = this.container;
    const { innerWidth, innerHeight } = window;
    this.container.style.width = `${window.innerWidth}px`;
    this.container.style.height = `${window.innerHeight}px`;
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
  }

  /**
   * Convert screen coordinates into Normalized Device Coordinates [-1, +1].
   * @see https://learnopengl.com/Getting-started/Coordinate-Systems
   * @see https://img-blog.csdn.net/20150502094344891?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbHpkaW5n/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center
   */
  getNDCCoordinates(event, debug) {
    const {
      clientHeight,
      clientWidth,
      offsetLeft,
      offsetTop,
    } = this.renderer.domElement;

    const xRelativePx = event.clientX - offsetLeft;
    const x = (xRelativePx / clientWidth) * 2 - 1;

    const yRelativePx = event.clientY - offsetTop;
    const y = -(yRelativePx / clientHeight) * 2 + 1;

    if (debug) {
      const data = {
        "Screen Coords (px)": { x: event.screenX, y: event.screenY },
        "Canvas-Relative Coords (px)": { x: xRelativePx, y: yRelativePx },
        "NDC (adimensional)": { x, y },
      };
      console.table(data, ["x", "y"]);
    }
    return [x, y];
  }

  getScreenCoordinates(xNDC, yNDC) {
    const {
      clientHeight,
      clientWidth,
      offsetLeft,
      offsetTop,
    } = this.renderer.domElement;

    const xRelativePx = ((xNDC + 1) / 2) * clientWidth;
    const yRelativePx = -0.5 * (yNDC - 1) * clientHeight;
    const xScreen = xRelativePx + offsetLeft;
    const yScreen = yRelativePx + offsetTop;
    return [xScreen, yScreen];
  }

  // 调试用
  setupHelpers() {
    let { scene, camera, lights } = this;
    let { ambientLight, dirLight } = lights;
    const gui = new dat.GUI();

    let axesHelper = new AxesHelper(500);
    scene.add(axesHelper);

    let gridHelper = new GridHelper(320, 32);
    scene.add(gridHelper);

    let cameraHelper = new CameraHelper(camera);
    scene.add(cameraHelper);
    let cameraGui = gui.addFolder("camera position");
    cameraGui.add(camera.position, 'x');
    cameraGui.add(camera.position, 'y');
    cameraGui.add(camera.position, 'z');
    cameraGui.open();

    let dirLightHelper = new DirectionalLightHelper(dirLight, 5);
    scene.add(dirLightHelper);

    let shadowCameraHelper = new CameraHelper(dirLight.shadow.camera);
    scene.add(shadowCameraHelper);

    const onChange = () => {
      dirLight.target.updateMatrix();
      dirLightHelper.update();
      dirLight.target.updateMatrixWorld();
      dirLight.shadow.camera.updateProjectionMatrix();
      shadowCameraHelper.update();
    };

    onChange();

    // 平行光的位置
    let dirLightGui = gui.addFolder("DirectionalLight position");
    dirLightGui.add(dirLight.position, 'x').onChange(onChange);
    dirLightGui.add(dirLight.position, 'y').onChange(onChange);
    dirLightGui.add(dirLight.position, 'z').onChange(onChange);
    dirLightGui.open();

    // 平行光焦点
    let dirTargetGui = gui.addFolder("DirectionalLight target position");
    dirTargetGui.add(dirLight.target.position, 'x').onChange(onChange);
    dirTargetGui.add(dirLight.target.position, 'y').onChange(onChange);
    dirTargetGui.add(dirLight.target.position, 'z').onChange(onChange);
    dirTargetGui.open();

    // 平行光强度
    let dirIntensityGui = gui.addFolder("DirectionalLight intensity position");
    dirIntensityGui.add(dirLight, 'intensity').onChange(onChange);
    dirIntensityGui.open();

    // 平行光阴影
    let dirLightShadowGui = gui.addFolder("DirectionalLight shadow");
    dirLightShadowGui.add(dirLight.shadow, 'radius').onChange(onchange);
    dirLightShadowGui.add(dirLight.shadow, 'bias').onChange(onchange);
    dirLightShadowGui.add(dirLight.shadow.mapSize, 'width').step(10).onChange(onchange);
    dirLightShadowGui.add(dirLight.shadow.mapSize, 'height').step(10).onChange(onchange);

  }

}

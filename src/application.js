import { WebGLRenderer, PerspectiveCamera, Scene, AxesHelper, CameraHelper, DirectionalLightHelper, Color } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as Detector from "./vender/Detector";
import * as dat from 'dat.gui';


import BasicLights from './objects/Lights';
import SeedScene from './objects/Scene.js';


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
      this.bindEventHandlers();
      this.init();
      this.render();
    } else {
      // console.warn("WebGL NOT supported in your browser!");
      const warning = Detector.getWebGLErrorMessage();
      this.container.appendChild(warning);
    }
  }

  init() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupControls();
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
    window.addEventListener('resize', this.handleResize.bind(this));
    window.addEventListener('click', this.handleClick.bind(this));
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
  }

  setupScene() {
    const scene = this.scene = new Scene();
    scene.background = new Color(0x096DD9);
    scene.position.y = -80;
  }

  setupCamera() {
    // near,far的值会影响深度闪烁问题,可根据效果微调
    const camera = this.camera = new PerspectiveCamera(35, this.container.offsetWidth / this.container.offsetHeight, 2, 10000);
    camera.up.set(0, 1, 0); //默认Y轴向上
    camera.rotateY(Math.PI / 4);
    camera.position.set(-470, 240, 233);
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
    this.container.appendChild(renderer.domElement);
  }

  setupControls() {
    let controls = this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // controls.maxPolarAngle = 0.9 * Math.PI / 2;
    controls.target.set(0, 5, 0);
    controls.update();
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

  handleClick() {

  }

  handleMouseMove() {

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

  // 调试用
  setupHelpers() {
    let { scene, camera, lights } = this;
    let { ambientLight, dirLight } = lights;
    const gui = new dat.GUI();

    let axesHelper = new AxesHelper(500);
    scene.add(axesHelper);

    let cameraHelper = new CameraHelper(camera);
    scene.add(cameraHelper);
    var cameraGui = gui.addFolder("camera position");
    cameraGui.add(camera.position, 'x');
    cameraGui.add(camera.position, 'y');
    cameraGui.add(camera.position, 'z');
    cameraGui.open();

    var dirLightHelper = new DirectionalLightHelper(dirLight, 5);
    scene.add(dirLightHelper);

    var shadowCameraHelper = new CameraHelper(dirLight.shadow.camera);
    scene.add(shadowCameraHelper);

    const onChange = () => {
      dirLightHelper.update();
      shadowCameraHelper.update();
      dirLight.target.updateMatrixWorld();
    };

    onChange();

    // 平行光的位置
    var dirLightGui = gui.addFolder("DirectionalLight position");
    dirLightGui.add(dirLight.position, 'x').onChange(onChange);
    dirLightGui.add(dirLight.position, 'y').onChange(onChange);
    dirLightGui.add(dirLight.position, 'z').onChange(onChange);
    dirLightGui.open();

    // 平行光焦点
    var dirTargetGui = gui.addFolder("DirectionalLight target position");
    dirTargetGui.add(dirLight.target.position, 'x').onChange(onChange);
    dirTargetGui.add(dirLight.target.position, 'y').onChange(onChange);
    dirTargetGui.add(dirLight.target.position, 'z').onChange(onChange);
    dirTargetGui.open();

    // 平行光强度
    var dirIntensityGui = gui.addFolder("DirectionalLight intensity position");
    dirIntensityGui.add(dirLight, 'intensity').onChange(onChange);
    dirIntensityGui.open();

  }

}

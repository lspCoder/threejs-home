import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Raycaster,
  Vector3,
  Vector2,
  GridHelper,
  BoxHelper,
  ArrowHelper,
  AxesHelper,
  CameraHelper,
  DirectionalLightHelper,
  PCFSoftShadowMap,
  Box3,
  Math as MathUtils,
  TextureLoader,
  RepeatWrapping
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as Detector from "./vender/Detector";
import * as dat from 'dat.gui';


import BasicLights from './objects/Lights';
import SeedScene from './objects/Scene.js';
import ViewBox from "./objects/ViewBox";
import { createBackground, createCubeTexture } from "./texture/canvasTexture";
import { getNDCCoordinates, getScreenCoordinates } from './utils.js';
import TWEEN, { Tween } from "@tweenjs/tween.js";
import EffectComposer, { RenderPass, ShaderPass } from '@johh/three-effectcomposer';
import OutlinePass from './postprocessing/OutlinePass';
import FXAAShader from './postprocessing/FXAAShader';

import patternImage from "./texture/images/tri_pattern.jpg";

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
      this.init(opts);
      this.render();
    } else {
      // console.warn("WebGL NOT supported in your browser!");
      const warning = Detector.getWebGLErrorMessage();
      this.container.appendChild(warning);
    }

    this.pluginMap = new Map();
    // this.selectObject = null;
  }

  init(opts) {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.bindEventHandlers();
    this.setupControls();
    this.setupRay();
    this.addLights();
    this.loadScene();
    this.addPostProcess();

    if (opts.viewBox) {
      this.viewBox = new ViewBox(this, opts.viewBox);
    }

    // 是否开启阴影
    this.switchShadow(opts.openShadow);

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
    scene.background = createBackground();
    // scene.background = createCubeTexture();
  }

  setupCamera() {
    this.defaultCameraPosition = [-1, 1, 1];
    // near,far的值会影响深度闪烁问题,可根据效果微调
    const camera = this.camera = new PerspectiveCamera(50, this.container.offsetWidth / this.container.offsetHeight, 1, 1000);
    camera.up.set(0, 1, 0); //默认Y轴向上
    camera.position.set(...this.defaultCameraPosition);
    camera.lookAt(0, 0, 0);
    camera.updateMatrix();
    camera.updateProjectionMatrix();
    this.scene.add(camera);
  }

  // todo: 需要根据场景包围盒动态计算
  setCameraPositionByDirection(type) {
    if (!this.sceneBox) return;
    const boxSize = this.sceneBox.getSize(new Vector3());
    const boxCenter = this.sceneBox.getCenter(new Vector3());
    let positionMap = {
      // 'front': new Vector3(boxCenter.x + boxSize.x * 0.5, boxCenter.y + boxSize.y * 0, boxCenter.z + boxSize.z * 0.5),
      'front': [500, 0, 0],
      'back': [-500, 0, 0],
      'left': [0, 0, 500],
      'right': [0, 0, -500],
      'top': [0, 500, 0],
      'bottom': [0, -500, 0],
    }
    const tween = new TWEEN.Tween(this.camera.position);
    // const target = new Vector3().clone(positionMap[type]);
    const target = new Vector3(...positionMap[type]);
    tween.to(target, 2000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        this.camera.lookAt(target);
        this.controls.update();
      }).start();
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
    controls.target.set(0, 0, 0);
    // controls.maxPolarAngle = Math.PI / 2;
    controls.maxDistance = 3000;
    controls.minDistance = 60;
    controls.update();
  }

  // 添加射线增加拾取
  setupRay() {
    this.raycaster = new Raycaster();
  }

  // todo:后续改成可配置
  // 加载主场景
  loadScene() {
    const seedScene = this.seedScene = new SeedScene();
    // 场景的包围盒
    let sceneBox = this.sceneBox = new Box3().setFromObject(seedScene);
    const boxSize = sceneBox.getSize(new Vector3()).length();
    const boxCenter = sceneBox.getCenter(new Vector3());
    this.adjustCameraBySceneBox(boxSize * 1.2, boxSize, boxCenter, this.camera);
    this.scene.add(seedScene);
  }

  addLights() {
    let lights = this.lights = new BasicLights();
    this.scene.add(lights);
  }

  /**
   *
   * @param {*} sizeToFitOnScreen
   * @param {*} boxSize
   * @param {*} boxCenter
   * @param {*} camera
   * @see https://threejsfundamentals.org/threejs/lessons/threejs-load-obj.html
   * @description 根据主场景的大小动态加载调整相机的视角
   */
  adjustCameraBySceneBox(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = MathUtils.degToRad(camera.fov * .5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

    // compute a unit vector that points in the direction the camera is now
    // from the center of the box
    const direction = (new Vector3()).subVectors(camera.position, boxCenter).normalize();

    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
    this.defaultCameraPosition = camera.position.toArray();

    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;

    camera.updateProjectionMatrix();

    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  }

  // TODO: outline选中效果
  addPostProcess() {
    let { renderer, scene, camera } = this;
    let { offsetWidth, offsetHeight } = this.container;
    let composer = this.composer = new EffectComposer(renderer);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    let outlinePass = this.outlinePass = new OutlinePass(new Vector2(offsetWidth, offsetHeight), scene, camera);
    outlinePass.edgeStrength = 2;
    composer.addPass(outlinePass);

    const onLoad = function (texture) {
      outlinePass.patternTexture = texture;
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
    };

    const loader = new TextureLoader();
    loader.load(patternImage, onLoad);

    let effectFXAA = this.effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1 / offsetWidth, 1 / offsetHeight);
    composer.addPass(effectFXAA);
  }

  render() {
    let { position, up } = this.camera;
    let { target } = this.controls;

    const onAnimationFrameHandler = (timeStamp) => {
      this.camera.updateMatrix();
      this.camera.updateProjectionMatrix();
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.viewBox && this.viewBox.render(position, target, up);
      this.seedScene.update && this.seedScene.update(timeStamp);
      this.composer.render();
      TWEEN.update(timeStamp);
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

  resetCamera() {
    let source = this.camera.position;
    let target = {
      x: this.defaultCameraPosition[0],
      y: this.defaultCameraPosition[1],
      z: this.defaultCameraPosition[2]
    };
    const tween1 = new TWEEN.Tween(source);
    tween1.to(target, 2000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate((obj) => {
        this.camera.position.set(obj.x, obj.y, obj.z);
      }).start();
  }

  /**
   *
   * @param {Box3} box 点击物体的包围盒
   * @param {Vector3} direction 射线照射到物体的方向
   * @param {number} distance 相机距离焦点的位置,默认为500
   * @param {number} time 动画时间
   */
  flyByBox(box, direction, distance = 500, time = 2000) {
    const source = this.camera.position;
    const boxCenter = box.getCenter(new Vector3());
    const target = new Vector3();
    // 射线方向向里需要取反
    target.copy(direction.multiplyScalar(-1).multiplyScalar(distance).add(boxCenter));

    const tween1 = new TWEEN.Tween(source);
    tween1.to(target, time)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        this.camera.lookAt(target);
        this.controls.update();
      }).start();
  }

  /**
   *
   * @param {Boolean} isOpen
   */
  switchShadow(isOpen) {
    this.seedScene.traverse(object => {
      if (object.isMesh) {
        object.castShadow = isOpen;
        object.receiveShadow = isOpen;
        object.updateMatrix();
        object.updateWorldMatrix();
      }
    })
  }

  handleClick(e) {
    const [x, y] = getNDCCoordinates(this.renderer.domElement, event, true);
    this.raycaster.setFromCamera({ x, y }, this.camera);
    const intersects = this.raycaster.intersectObjects(this.seedScene.children, true);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      const box = new Box3();
      box.setFromObject(intersection.object);

      this.flyByBox(box, this.raycaster.ray.direction);

      // const hexColor = Math.random() * 0xffffff;
      // const { direction, origin } = this.raycaster.ray;
      // const arrow = new ArrowHelper(direction, origin, 300, hexColor);
      // this.scene.add(arrow);
    }
  }

  handleMouseMove(event) {
    // if (this.selectObject) {
    //   this.scene.remove(this.selectObject);
    // }
    const [x, y] = getNDCCoordinates(this.renderer.domElement, event);
    this.raycaster.setFromCamera({ x, y }, this.camera);
    const intersects = this.raycaster.intersectObject(this.seedScene, true);

    if (intersects.length > 0) {
      const hexColor = Math.random() * 0xffffff;
      const intersection = intersects[0];
      // 选中整体标识
      // intersection.object.material.color.setHex(hexColor);
      // this.selectObject = new BoxHelper(intersection.object.parent, 0xffff00);
      // this.selectObject.updateMatrix();
      // this.selectObject.updateWorldMatrix();
      // this.scene.add(this.selectObject);

      // const { direction, origin } = this.raycaster.ray;
      // const arrow = new ArrowHelper(direction, origin, 100, hexColor);
      // this.scene.add(arrow);
      this.outlinePass.selectedObjects = [intersection.object];
    } else {
      this.outlinePass.selectedObjects = [];
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
    this.composer.setSize(innerWidth, innerHeight);
    this.effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
  }

  /**
   *
   * @param {String} name
   * @param {BasePlugin} plugin
   * @description 注册插件
   */
  registerPLugin(name, plugin) {
    this.pluginMap.set(name, plugin);
    plugin.setUp();
  }

  /**
   *
   * @param {String} name
   * @description 卸载插件
   */
  unRegisterPlugin(name) {
    let plugin = this.pluginMap.get(name);
    plugin.tearDown();
    this.pluginMap.delete(name);
  }

  // 销毁方法
  dispose() {

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
      cameraHelper.update();
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

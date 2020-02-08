import { Group, DirectionalLight, AmbientLight } from 'three';
const SHADOW_MAP_WIDTH = 2048,
  SHADOW_MAP_HEIGHT = 2048;

export default class BasicLights extends Group {
  constructor() {
    super();

    // 环境光
    this.ambientLight = new AmbientLight(0x666666, .5);

    // 定向光
    let dirLight = this.dirLight = new DirectionalLight(0xffffff, .5);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(-20, 30, -10);
    dirLight.position.multiplyScalar(30);

    // 开启灯光投射阴影
    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    dirLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    const d = 300;
    // 设置阴影相机大小,即阴影照射范围
    dirLight.shadow.camera.left = - d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = - d;

    dirLight.shadow.camera.far = 3000;
    // 阴影贴图偏差,默认0,适当调整可减少阴影中的残影
    dirLight.shadow.bias = -0.0001;

    this.add(this.ambientLight, this.dirLight);
  }
}

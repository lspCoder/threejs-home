import { Vector2 } from "three";
import BaseInteraction from "./BaseInteraction";

/**
 * @Author: lsp
 * @Date: 2020-03-27 17:05:26
 * @Last Modified by: lsp
 * @Last Modified time: 2020-03-27 17:57:03
 */
export default class PickerHelper extends BaseInteraction {

  constructor(app) {
    super(app);

    this.pickPosition = new Vector2();
  }

  pick(normalizedPosition, scene, camera) {

    // cast a ray through the frustum
    this.raycaster.setFromCamera(normalizedPosition, camera);
    // get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      // pick the first object. It's the closest one
      return intersectedObjects[0].object;
    }
    return null;
  }

  setUp() {
    this.addListener('click', 'mousemove');
  }

  tearDown() {
    this.removeListener('click', 'mousemove');
  }

  handle_click(e) {
    const normalizedPosition = getNDCCoordinates(this.renderer.domElement, event, true);
    this.pick(normalizedPosition);
  }

  handle_mousemove() {

  }

}

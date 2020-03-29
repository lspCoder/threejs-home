/**
 * @Author: lsp
 * @Date: 2020-03-27 16:50:12
 * @Last Modified by: lsp
 * @Last Modified time: 2020-03-29 15:04:34
 */
export default class BaseInteraction {

  constructor(app) {
    this.app = app;
    this.renderer = app.renderer;
  }

  setUp() {

  }

  tearDown() {

  }

  addListener() {
    for (var i = 0; i < arguments.length; i++) {
      var type = arguments[i];
      this.renderer.domElement.addEventListener(type, this['handle_' + type].bind(this), false);
    }
  }

  removeListener() {
    for (var i = 0; i < arguments.length; i++) {
      var type = arguments[i];
      this.renderer.domElement.removeEventListener(type, this['handle_' + type], false);
    }
  }

  render() {

  }

}

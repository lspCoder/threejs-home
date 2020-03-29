/**
 * @Author: lsp
 * @Date: 2020-03-27 16:50:12
 * @Last Modified by: lsp
 * @Last Modified time: 2020-03-29 17:31:07
 */
export default class BasePlugin {

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
      const name = `_${type}_`;
      this[name] = (e) => {
        this['handle_' + type].call(this, e);
      }
      this.renderer.domElement.addEventListener(type, this[name], false);
    }
  }

  removeListener() {
    for (var i = 0; i < arguments.length; i++) {
      var type = arguments[i];
      const name = `_${type}_`;
      this.renderer.domElement.removeEventListener(type, this[name]);
    }
  }

  render() {

  }

}

import BasePlugin from "./BasePlugin";

/**
 * @Author: lsp
 * @Date: 2020-03-24 16:55:37
 * @Last Modified by: lsp
 * @Last Modified time: 2020-03-29 16:48:28
 */
export default class Marker extends BasePlugin {

  constructor(app) {
    super(app)
  }

  setUp() {
    this.addListener('click', 'mousemove');
  }

  tearDown() {
    this.removeListener('click', 'mousemove');
  }

  handle_click(e) {

  }

  handle_mousemove() {

  }


}

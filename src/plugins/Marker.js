import BasePlugin from "./BasePlugin";

/**
 * @Author: lsp
 * @Date: 2020-03-24 16:55:37
 * @Last Modified by: lsp
 * @Last Modified time: 2020-03-29 17:16:43
 * @description marker三维标注
 */
export default class Marker extends BasePlugin {

  constructor(app) {
    super(app);
  }

  setUp() {
    this.addListener('click', 'mousemove');
  }

  tearDown() {
    this.removeListener('click', 'mousemove');
  }

  handle_click(e) {
    console.log('click marker');
  }

  handle_mousemove(e) {
    console.log('mousemove marker');
  }


}

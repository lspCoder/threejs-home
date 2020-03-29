import BaseInteraction from "../objects/BaseInteraction";

/**
 * @Author: lsp
 * @Date: 2020-03-24 16:55:37
 * @Last Modified by: lsp
 * @Last Modified time: 2020-03-27 17:42:02
 */
export default class Marker extends BaseInteraction {

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

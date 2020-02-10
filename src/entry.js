import Application from './application';


window.onload = function () {
  window.app = new Application({ showHelpers: false });
  window.scene = app.scene;
}

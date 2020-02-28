import Application from './application';


window.onload = function () {
  window.app = new Application({ showHelpers: true });
  window.scene = app.scene;
}

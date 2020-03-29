import Application from './application';
import Marker from "./plugins/Marker";
import HTMLMarker from "./plugins/HTMLMarker";

document.addEventListener('DOMContentLoaded', () => {
  window.app = new Application({
    showHelpers: false,
    openShadow: true,
    viewBox: {
      size: [150, 150]
    }
  });
  app.registerPLugin('marker', new Marker(app));
  app.registerPLugin('htmlMarker', new HTMLMarker(app));
})



import Application from './application';


document.addEventListener('DOMContentLoaded', () => {
  window.app = new Application({
    showHelpers: false,
    openShadow: true,
    viewBox: {
      size: [150, 150]
    }
  });
})



/**
   * Convert screen coordinates into Normalized Device Coordinates [-1, +1].
   * @see https://learnopengl.com/Getting-started/Coordinate-Systems
   * @see https://img-blog.csdn.net/20150502094344891?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbHpkaW5n/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center
   */
export const getNDCCoordinates = (container, event, debug) => {
  const {
    clientHeight,
    clientWidth,
    offsetLeft,
    offsetTop,
  } = container;

  const xRelativePx = event.offsetX - offsetLeft;
  const x = (xRelativePx / clientWidth) * 2 - 1;

  const yRelativePx = event.offsetY - offsetTop;
  const y = -(yRelativePx / clientHeight) * 2 + 1;

  if (debug) {
    const data = {
      "Screen Coords (px)": { x: event.screenX, y: event.screenY },
      "Canvas-Relative Coords (px)": { x: xRelativePx, y: yRelativePx },
      "NDC (adimensional)": { x, y },
    };
    console.table(data, ["x", "y"]);
  }
  return [x, y];
}

/**
 *
 * @param {number} xNDC
 * @param {number} yNDC
 * @description 通过ndc坐标换算屏幕坐标
 * @returns {Array}
 */
export const getScreenCoordinates = (container, xNDC, yNDC) => {
  const {
    clientHeight,
    clientWidth,
    offsetLeft,
    offsetTop,
  } = container;

  const xRelativePx = ((xNDC + 1) / 2) * clientWidth;
  const yRelativePx = -0.5 * (yNDC - 1) * clientHeight;
  const xScreen = xRelativePx + offsetLeft;
  const yScreen = yRelativePx + offsetTop;
  return [xScreen, yScreen];
}

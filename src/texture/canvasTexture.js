import { CanvasTexture } from 'three';

/**
 * @description 门的纹理
 */
export function createDoorTexture() {
  let canvas = document.createElement("canvas");
  // 不需要加到dom中,调试用
  // canvas.style.position = "absolute";
  // canvas.style.top = "0";
  // canvas.style.left = "0";
  // document.body.appendChild(canvas);

  canvas.width = 256;
  canvas.height = 512;
  let context = canvas.getContext('2d');
  context.translate(canvas.width / 2, canvas.height / 2);

  context.fillStyle = "#cec4bd";
  context.arc(0, -canvas.width / 2, canvas.width / 2, 0, Math.PI, true);
  context.fill();

  context.beginPath();
  context.fillRect(-canvas.width / 2, -canvas.width / 2, canvas.width, canvas.height - canvas.width / 2);

  context.lineWidth = 5;
  context.strokeStyle = "rgb(90,90,90)";

  context.beginPath();
  context.moveTo(-context.lineWidth / 2, -canvas.height / 2);
  context.lineTo(-context.lineWidth / 2, canvas.height / 2);
  context.stroke();
  context.closePath();

  context.beginPath();
  // 左下方框
  context.moveTo(14, 192);
  context.rect(14, 192, 100, 50);
  // 右下方框
  context.moveTo(-114, 192);
  context.rect(-114, 192, 100, 50);
  // 左上方框
  context.moveTo(-14, -canvas.width / 2);
  context.arc(-64, -canvas.width / 2, 50, 0, Math.PI, true);
  context.lineTo(-114, 175);
  context.lineTo(-14, 175);
  context.lineTo(-14, -canvas.width / 2);
  // 左下方框
  context.moveTo(114 - context.lineWidth / 2, canvas.width / 2);
  context.arc(64 - context.lineWidth / 2, -canvas.width / 2, 50, 0, Math.PI, true);
  context.lineTo(14 - context.lineWidth / 2, 175);
  context.lineTo(114 - context.lineWidth / 2, 175);
  context.lineTo(114 - context.lineWidth / 2, -125);

  context.stroke();
  context.closePath();

  return new CanvasTexture(canvas);
}

/**
 * @description 门上面的原型logo纹理
 */
export function createLogoTexture() {
  let canvas = document.createElement("canvas");
  // 不需要加到dom中,调试用
  // canvas.style.position = "absolute";
  // canvas.style.top = "0";
  // canvas.style.left = "0";
  // document.body.appendChild(canvas);

  canvas.width = 256;
  canvas.height = 256;
  let context = canvas.getContext('2d');
  context.translate(canvas.width / 2, canvas.height / 2);
  context.fillStyle = '#FFFFFF';
  context.arc(0, 0, canvas.width / 2, 0, Math.PI * 2);
  context.fill();
  // 圆心
  context.beginPath();
  context.fillStyle = "#93886e";
  context.arc(0, 0, 20, 0, Math.PI * 2);
  context.fill();
  context.closePath();

  for (let index = 0; index < 8; index++) {
    context.rotate(Math.PI / 4);
    // 外部半圆
    context.beginPath();
    context.moveTo(0, -92);
    context.arc(0, -92, 30, 0, Math.PI, true);
    context.fill();

    // 三角形图案
    context.beginPath();
    context.moveTo(0, -20);
    context.lineTo(-30, -93);
    context.lineTo(30, -93);
    context.fill();

    // 小圆圈
    context.beginPath();
    context.moveTo(45, -105);
    context.arc(45, -105, 5, 0, Math.PI * 2, true);
    context.fill();
  }

  return new CanvasTexture(canvas);
}

/**
 * @description 渐变背景纹理
 */
export function createBackground() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#1890ff');
  gradient.addColorStop(1, '#e6f7ff');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

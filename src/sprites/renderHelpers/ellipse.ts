export interface EllipeParams {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  canvas: CanvasRenderingContext2D;
  fill?: string;
  stroke?: string;
  rotation?: number;
  startAngle?: number;
  stopAngle?: number;
}

export function ellipse(params: EllipeParams) {
  const {cx, cy, rx, ry, rotation, fill, stroke, canvas, startAngle, stopAngle} = params;

  if (!fill && !stroke) {
    throw new Error('Circle requires either fill or stroke');
  }

  canvas.beginPath();
  canvas.ellipse(cx, cy, rx, ry, rotation || 0, startAngle || 0, stopAngle || 2 * Math.PI);
  if (fill) {
    canvas.fillStyle = fill;
    canvas.fill();
  }
  if (stroke) {
    canvas.strokeStyle = stroke;
    canvas.stroke();
  }
  canvas.closePath();
}

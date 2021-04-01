export function circle(params: {
  x: number;
  y: number;
  r: number;
  fill?: string;
  stroke?: string;
  canvas: CanvasRenderingContext2D;
}) {
  const {x, y, r, fill, stroke, canvas} = params;

  if (!fill && !stroke) {
    throw new Error('Circle requires either fill or stroke');
  }

  canvas.beginPath();
  canvas.arc(x, y, r, 0, 2 * Math.PI);
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

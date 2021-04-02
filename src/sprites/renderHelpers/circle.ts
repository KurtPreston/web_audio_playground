export interface CircleParams {
  x: number;
  y: number;
  r: number;
  fill?: string;
  stroke?: string;
  canvas: CanvasRenderingContext2D;
}

export interface ArcParams extends CircleParams {
  startAngle: number;
  stopAngle: number;
}

export function arc(params: ArcParams) {
  const {x, y, r, fill, stroke, canvas, startAngle, stopAngle} = params;

  if (!fill && !stroke) {
    throw new Error('Circle requires either fill or stroke');
  }

  canvas.beginPath();
  canvas.arc(x, y, r, startAngle, stopAngle);
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

export function circle(params: {
  x: number;
  y: number;
  r: number;
  fill?: string;
  stroke?: string;
  canvas: CanvasRenderingContext2D;
}) {
  arc({
    ...params,
    startAngle: 0,
    stopAngle: 2 * Math.PI
  });
}

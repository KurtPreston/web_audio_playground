import {IPosition} from '../../types/State';

export interface DrawRotatedParams {
  canvas: CanvasRenderingContext2D;
  angle: number;
  position: IPosition;
  draw: () => void;
}

export function drawRotated(params: DrawRotatedParams) {
  const {canvas, angle, position, draw} = params;
  const {x, y} = position;

  canvas.translate(x, y);
  canvas.rotate(angle);
  draw();
  canvas.rotate(-angle);
  canvas.translate(-x, -y);
}

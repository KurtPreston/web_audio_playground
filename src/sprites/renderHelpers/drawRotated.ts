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

  const matrix = new DOMMatrix();
  matrix.translateSelf(x, y).rotateSelf((angle * 180) / Math.PI);
  canvas.setTransform(matrix);
  draw();
  canvas.resetTransform();
}

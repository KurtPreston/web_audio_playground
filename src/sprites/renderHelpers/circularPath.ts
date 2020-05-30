import {scale} from '../../math/scale';
import {ouroboros} from './ouroboros';

interface CircularPathParams {
  canvas: CanvasRenderingContext2D;
  cx: number;
  cy: number;
  wave: Uint8Array | number[];
  minSize: number;
  maxSize: number;
  angle?: number;

  /**
   * To prevent head from not aligning with tail, tail smoothing removes n items from the tail
   * and averages them with the head using the ouroboros function, smoothing the loop close
   */
  tailSmoothing?: number;
}

export function circularPath(params: CircularPathParams): void {
  const {canvas, cx, cy, minSize, maxSize, wave} = params;
  const angle = params.angle || 0;
  const tailSmoothing: number = params.tailSmoothing || Math.round(wave.length * 0.1);
  const size = Math.max(wave.length - tailSmoothing, 0);

  const coords: {x: number; y: number}[] = new Array(size);

  wave.forEach((amplitude: number, idx: number) => {
    if (tailSmoothing) {
      if (idx <= tailSmoothing) {
        // For first n elements, average with last n
        amplitude = ouroboros(wave, idx, tailSmoothing);
      }
    }

    if (idx >= size) {
      return;
    }

    const r = scale({
      input: amplitude,
      inputMin: 0,
      inputMax: 255,
      outputMin: minSize,
      outputMax: maxSize
    });
    const pointAngle = scale({
      input: idx,
      inputMin: 0,
      inputMax: size - 1,
      outputMin: angle,
      outputMax: 2 * Math.PI + angle
    });
    const circularX = Math.cos(pointAngle) * r + cx;
    const circularY = Math.sin(pointAngle) * r + cy;
    coords[idx] = {
      x: circularX,
      y: circularY
    };
  });

  const last = size >= 1 ? coords[size - 1] : {x: 0, y: 0};
  canvas.beginPath();
  canvas.moveTo(last.x, last.y);
  coords.forEach(({x, y}) => {
    canvas.lineTo(x, y);
  });
  canvas.fill();
  canvas.stroke();
  canvas.closePath();
}

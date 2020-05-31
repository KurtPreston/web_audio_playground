import {IPosition} from '../../types';

const tau = Math.PI * 2;
export function angleBetween(point1: IPosition, point2: IPosition) {
  const xDiff = point2.x - point1.x;
  const yDiff = point2.y - point1.y;
  return mod(Math.atan2(yDiff, xDiff), tau);
}

function mod(num: number, modulo: number) {
  const remain = num % modulo;
  if (remain > 0) {
    return remain;
  } else if (remain < 0) {
    return remain + modulo;
  } else {
    return 0;
  }
}

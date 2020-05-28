import {IPosition} from '../../types';

const tau = Math.PI * 2;
export function angleBetween(point1: IPosition, point2: IPosition) {
  const xDiff = point1.x - point2.x;
  const yDiff = point1.y - point2.y;
  if (xDiff !== 0) {
    const angle = Math.atan(yDiff / xDiff);
    if (xDiff > 0) {
      return mod(angle + Math.PI, tau);
    } else {
      return mod(angle, tau);
    }
  } else {
    if (yDiff > 0) {
      return (3 * Math.PI) / 2;
    } else {
      return Math.PI / 2;
    }
  }
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

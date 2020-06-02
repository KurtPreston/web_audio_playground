import {IPosition} from '../../types/State';
import {mod} from '../mod';

const tau = Math.PI * 2;
export function angleBetween(point1: IPosition, point2: IPosition) {
  const xDiff = point2.x - point1.x;
  const yDiff = point2.y - point1.y;
  return mod(Math.atan2(yDiff, xDiff), tau);
}

import {IPosition} from '../../types/State';

export function distanceBetween(position1: IPosition, position2: IPosition): number {
  const xDiff = position1.x - position2.x;
  const yDiff = position1.y - position2.y;

  return Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
}

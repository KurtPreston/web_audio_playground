import {IAcceleration, IPosition} from '../../types';
import {angleBetween} from '../trig/angleBetween';

export interface ElectricalForceParams {
  point1: IPosition;
  point2: IPosition;

  // 0 -- force is applied equally regardless of distance
  // 1 -- force is weaker linear to distance
  // 2 -- force is weaker square to distance
  coefficient: number;

  // Negative -- points repel
  // Positive -- points attract
  exponent?: number;
}

export function electricalForce(params: ElectricalForceParams): IAcceleration {
  const {exponent = 2, point1, point2, coefficient} = params;
  const xDiff = point1.x - point2.x;
  const yDiff = point1.y - point2.y;
  const angle = angleBetween(point1, point2);
  const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  const force = coefficient / Math.pow(distance, exponent);
  const xForce = Math.cos(angle) * force;
  const yForce = Math.sin(angle) * force;
  return {
    xForce,
    yForce
  };
}

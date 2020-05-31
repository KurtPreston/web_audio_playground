import {IAcceleration, IPosition} from '../../types/State';
import {angleBetween} from '../trig/angleBetween';

export interface SpringForceParams {
  point1: IPosition;
  point2: IPosition;
  targetDistance: number;
  springConstant: number;
}

export function springForce(params: SpringForceParams): IAcceleration {
  const {point1, point2, targetDistance, springConstant} = params;
  const xDiff = point1.x - point2.x;
  const yDiff = point1.y - point2.y;
  const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  const distanceFromEquilibrium = distance - targetDistance;
  const angle = angleBetween(point1, point2);
  const force = springConstant * distanceFromEquilibrium;
  const xForce = Math.cos(angle) * force;
  const yForce = Math.sin(angle) * force;
  return {
    xForce,
    yForce
  };
}

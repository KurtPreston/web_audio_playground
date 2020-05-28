import {IAcceleration, IPosition} from '../../types';
import {angleBetween} from '../trig/angleBetween';

export interface ElectricalForceParams {
  point1: IPosition;
  point2: IPosition;
  repulsionCoefficient: number;
}

export function electricalForce(params: ElectricalForceParams): IAcceleration {
  const {point1, point2, repulsionCoefficient} = params;
  const xDiff = point1.x - point2.x;
  const yDiff = point1.y - point2.y;
  const angle = angleBetween(point1, point2);
  const force = repulsionCoefficient / (xDiff * xDiff + yDiff * yDiff);
  const xForce = Math.cos(angle) * force;
  const yForce = Math.sin(angle) * force;
  return {
    xForce,
    yForce
  };
}

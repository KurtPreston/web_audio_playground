import {IAcceleration, IPosition} from '../../types';

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

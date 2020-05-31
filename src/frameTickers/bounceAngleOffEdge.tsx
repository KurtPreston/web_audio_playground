import {Dimensions, IPosition} from '../types/State';

interface BounceOffEdgeParams {
  angle: number;
  position: IPosition;
  bounds: Dimensions;
}

export function bounceAngleOffEdge(params: BounceOffEdgeParams): number {
  const {angle, position, bounds} = params;
  const goingUp = Math.sin(angle) < 0;
  const goingDown = !goingUp;
  const {x, y} = position;
  const {width, height} = bounds;

  let newAngle = angle;
  if ((y < 0 && goingUp) || (y > height && goingDown)) {
    newAngle = 2 * Math.PI - newAngle;
  }

  const goingLeft = Math.cos(newAngle) < 0;
  const goingRight = !goingLeft;
  if ((x < 0 && goingLeft) || (x > width && goingRight)) {
    newAngle = Math.PI - angle;
  }

  return newAngle;
}

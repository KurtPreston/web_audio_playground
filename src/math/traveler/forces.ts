import {noop} from 'lodash';
import {ITraveler, IVector, WorldState} from '../../types/State';

// Applies transformations to an ITraveler
export type IForce = (traveler: ITraveler, world: WorldState) => IVector;

export const BounceOffEdge = (
  traveler: ITraveler,
  world: WorldState,
  onBounce: () => void = noop
): IVector => {
  const {dimensions} = world;
  const {width, height} = dimensions;
  const {position, vector} = traveler;
  const {x, y} = position;
  let {xMomentum, yMomentum} = vector;

  // Bounce off left
  if (x < 0 && xMomentum < 0) {
    xMomentum *= -1;
    onBounce();
  }

  // Bounce off right
  if (x > width && xMomentum > 0) {
    xMomentum *= -1;
    onBounce();
  }

  // Bounce off top
  if (y < 0 && yMomentum < 0) {
    yMomentum *= -1;
    onBounce();
  }

  if (y > height && yMomentum > 0) {
    yMomentum *= -1;
    onBounce();
  }

  return {
    xMomentum,
    yMomentum
  };
};

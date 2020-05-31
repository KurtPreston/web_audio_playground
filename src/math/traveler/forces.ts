import {ITraveler, IVector, WorldState} from '../../types';

// Applies transformations to an ITraveler
export type IForce = (traveler: ITraveler, world: WorldState) => IVector;

export const BounceOffEdge: IForce = (traveler: ITraveler, world: WorldState): IVector => {
  const {dimensions} = world;
  const {width, height} = dimensions;
  const {position, vector} = traveler;
  const {x, y} = position;
  let {xMomentum, yMomentum} = vector;

  // Bounce off left
  if (x < 0 && xMomentum < 0) {
    xMomentum *= -1;
  }

  // Bounce off right
  if (x > width && xMomentum > 0) {
    xMomentum *= -1;
  }

  // Bounce off top
  if (y < 0 && yMomentum < 0) {
    yMomentum *= -1;
  }

  if (y > height && yMomentum > 0) {
    yMomentum *= -1;
  }

  return {
    xMomentum,
    yMomentum
  };
};

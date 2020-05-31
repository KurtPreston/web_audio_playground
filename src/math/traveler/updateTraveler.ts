import {ITraveler, WorldState} from '../../types/State';
import {IForce} from './forces';

// Applies all force to traveler and updates position
export function updateTraveler(traveler: ITraveler, forces: IForce[], world: WorldState): void {
  let {position, vector} = traveler;
  forces.forEach((force: IForce) => {
    // Apply forces
    vector = force(
      {
        position,
        vector
      },
      world
    );
  });

  // Update position with new velocity
  position.x += vector.xMomentum;
  position.y += vector.yMomentum;

  // Apply updates back to traveler
  traveler.position = position;
  traveler.vector = vector;
}

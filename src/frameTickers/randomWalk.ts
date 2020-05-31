import {IWanderer, SpriteTicker, WorldState} from '../types/State';
import {bounceAngleOffEdge} from './bounceAngleOffEdge';
export interface RandomWalkProps {
  velocity: number;
  jitter: number;
  lean: number;
  bounceOffEdge: boolean;
}

export function randomWalkFactory(props: RandomWalkProps): SpriteTicker<IWanderer> {
  const {bounceOffEdge, jitter, lean, velocity} = props;
  const jitterer = (angle: number) => angle + lean + (Math.random() - 0.5) * jitter;

  const randomWalk: SpriteTicker<IWanderer> = (
    spriteState: IWanderer,
    worldState: WorldState
  ): IWanderer => {
    const {x, y, angle} = spriteState;

    // Calculate new angle
    let newAngle = jitterer(angle); // apply jitterer
    newAngle = (2 * Math.PI + newAngle) % (2 * Math.PI); // keep in range 0-2π

    if (bounceOffEdge) {
      newAngle = bounceAngleOffEdge({
        angle: newAngle,
        bounds: worldState.dimensions,
        position: spriteState
      });
    }

    const newX = x + Math.cos(newAngle) * velocity;
    const newY = y + Math.sin(newAngle) * velocity;

    return {
      x: newX,
      y: newY,
      angle: newAngle
    };
  };

  return randomWalk;
}

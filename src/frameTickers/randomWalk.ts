import {IWanderer, SpriteTicker, WorldState} from '../types';
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
    const {height, width} = worldState.dimensions;

    // Calculate new angle
    let newAngle = jitterer(angle); // apply jitterer
    newAngle = (2 * Math.PI + newAngle) % (2 * Math.PI); // keep in range 0-2π

    if (bounceOffEdge) {
      const goingUp = Math.sin(newAngle) < 0;
      const goingDown = !goingUp;

      if ((y < 0 && goingUp) || (y > height && goingDown)) {
        newAngle = 2 * Math.PI - newAngle;
      }

      const goingLeft = Math.cos(newAngle) < 0;
      const goingRight = !goingLeft;
      if ((x < 0 && goingLeft) || (x > width && goingRight)) {
        newAngle = Math.PI - angle;
      }
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

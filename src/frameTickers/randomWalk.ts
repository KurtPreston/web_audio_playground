import {Dimensions, IWanderer, SpriteTicker} from '../types';

export type JitterType = 'leanLeft' | 'leanRight' | 'random';

export interface RandomWalkProps {
  velocity: number;
  jitter: number;
  jitterType: JitterType;
  bounceOffEdge: boolean;
}

const jitterers: {[jitterType in JitterType]: (angle: number, jitter: number) => number} = {
  leanLeft: (angle, jitter) => angle - Math.random() * jitter,
  leanRight: (angle, jitter) => angle + Math.random() * jitter,
  random: (angle, jitter) => angle + Math.random() * jitter
};

export function randomWalkFactory(props: RandomWalkProps): SpriteTicker<IWanderer> {
  const {bounceOffEdge, velocity, jitter, jitterType} = props;
  const jitterer = jitterers[jitterType];

  const randomWalk: SpriteTicker<IWanderer> = (
    state: IWanderer,
    dimensions: Dimensions
  ): IWanderer => {
    const {x, y, angle} = state;
    const {height, width} = dimensions;

    // Calculate new angle
    let newAngle = jitterer(angle, jitter); // apply jitterer
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

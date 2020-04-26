import { SpriteTicker, SpritePosition, World } from '../types';

export type JitterType = 'leanLeft' | 'leanRight' | 'random';

export interface RandomWalkProps {
  velocity: number;
  jitter: number;
  jitterType: JitterType;
}

const jitterers: {[jitterType in JitterType]: ((angle: number, jitter: number) => number)} = {
  leanLeft: (angle, jitter) => angle - Math.random() * jitter,
  leanRight: (angle, jitter) => angle + Math.random() * jitter,
  random: (angle, jitter) => angle + Math.random() * jitter
};

export function randomWalkFactory(props: RandomWalkProps): SpriteTicker {
  const {velocity, jitter, jitterType} = props;
  const jitterer = jitterers[jitterType];

  const randomWalk: SpriteTicker = (
    position: SpritePosition,
    world: World
  ): SpritePosition => {
    const { x, y, angle } = position;
    const {height, width} = world;

    // Calculate new angle
    let newAngle = jitterer(angle, jitter) // apply jitterer
    newAngle = (2 * Math.PI + newAngle) % (2 * Math.PI); // keep in range 0-2π

    const goingUp = Math.sin(newAngle) < 0;
    const goingDown = !goingUp;

    if((y < 0 && goingUp) || (y > height && goingDown)) {
      newAngle = (2 * Math.PI) - newAngle;
    }

    const goingLeft = Math.cos(newAngle) < 0;
    const goingRight = !goingLeft;
    if((x < 0 && goingLeft) || (x > width && goingRight)) {
      newAngle = Math.PI - angle;
    }

    let newX = x + Math.cos(newAngle) * velocity;
    // if(newX < 0) {
    //   newX = 0;
    // }
    // if(newX > width) {
    //   newX = width;
    // }

    let newY = y + Math.sin(newAngle) * velocity;
    // if(newY < 0) {
    //   newY = 1;
    // }
    // if(newY > height) {
    //   newY = height - 1;
    // }

    return {
      x: newX,
      y: newY,
      angle: newAngle,
    };
  };

  return randomWalk;
}
import { SpriteTicker, SpritePosition, World } from '../types';

const velocity = 10;
const jitter = 0.01;

export const randomWalk: SpriteTicker = (
  position: SpritePosition,
  world: World
): SpritePosition => {
  const { x, y, angle } = position;
  const {height, width} = world;

  // Calculate new angle
  let newAngle = angle + Math.random() * jitter; // apply jitter
  newAngle = (2 * Math.PI + newAngle) % (2 * Math.PI); // keep in range 0-2π

  const goingUp = Math.sin(newAngle) < 0;
  const goingDown = !goingUp;

  if((y < 0 && goingUp) || (y > height && goingDown)) {
    newAngle = (2 * Math.PI) - newAngle;
  }

  const goingLeft = Math.cos(newAngle) < 0;
  const goingRight = !goingLeft;
  if((x < 0 && goingLeft) || (x > width && goingRight)) {
    newAngle = (2 * Math.PI) - (angle - Math.PI / 2) + Math.PI / 2
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

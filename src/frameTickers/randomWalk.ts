import { SpriteTicker, SpritePosition } from "../types";

const velocity = 1;
const jitter = 200;

const degreesToRadiansRatio = (2 * Math.PI) / 360;

export const randomWalk: SpriteTicker = (position: SpritePosition): SpritePosition => {
  const {x, y, angle} = position;

  return {
    x: x + Math.cos(angle) * velocity,
    y: y + Math.sin(angle) + velocity,
    angle: ((angle + (Math.random() * jitter)) % 360) * degreesToRadiansRatio
  }
}
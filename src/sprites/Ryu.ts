import {random} from 'lodash';
import {OverflowMode, scale} from '../math/scale';
import {IPosition, WorldState} from '../types';
import {spin} from '../util/deviceOrientation';
import {ChargingFireball} from './ChargingFireball';
import {FireballSpriteParams} from './Fireball';
import {Sprite} from './Sprite';

export interface RyuProps {
  world: WorldState;
  launchFireball: (params: FireballSpriteParams) => void;
  position: IPosition;
  positionController: PositionController;
  angle: number;
}

export type PositionController = (x: number, world: WorldState) => number;

export class Ryu extends Sprite {
  // State
  private readonly launchFireball: (params: FireballSpriteParams) => void;
  private readonly position: IPosition;
  private readonly positionController: PositionController;
  private readonly angle: number;
  private fireball: ChargingFireball;

  constructor(params: RyuProps) {
    super();
    const {angle, position, positionController, world} = params;

    this.positionController = positionController;
    this.position = position;
    this.angle = angle;
    this.launchFireball = params.launchFireball;
    this.fireball = new ChargingFireball({
      wave: world.audio.uintWave,
      position
    });
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    this.fireball.render(canvas, world);
  }

  public tick(world: WorldState) {
    // Adjust x position
    this.position.x = this.positionController(this.position.x, world);

    // Launch fireball
    this.fireball.tick(world);
    if (this.fireball.shouldLaunch()) {
      const params = this.fireball.launchParams();
      this.launchFireball({
        ...params,
        state: {
          ...params.state,
          angle: this.angle
        }
      });
      this.fireball = new ChargingFireball({
        wave: world.audio.uintWave,
        position: this.position
      });
    }
  }
}

const maxVelocity = 15;

export const inputPositionController: PositionController = (
  x: number,
  world: WorldState
): number => {
  const tiltRange = 35;

  if (world.keysDown.has('ArrowLeft')) {
    x -= maxVelocity;
  }
  if (world.keysDown.has('ArrowRight')) {
    x += maxVelocity;
  }
  if (world.deviceOrientation) {
    const tilt = spin(world.deviceOrientation);

    x += scale({
      input: tilt,
      inputMin: -1 * tiltRange, // Comfortable axis of tilt
      inputMax: tiltRange,
      outputMin: -1 * maxVelocity,
      outputMax: maxVelocity,
      overflowMode: OverflowMode.Constrain
    });
  }

  if (x > world.dimensions.width) {
    x = world.dimensions.width;
  }

  if (x < 0) {
    x = 0;
  }

  return x;
};

export const randomPositionController: PositionController = (
  x: number,
  world: WorldState
): number => {
  x += random(-1 * maxVelocity, maxVelocity, true);

  if (x > world.dimensions.width) {
    x = world.dimensions.width;
  }

  if (x < 0) {
    x = 0;
  }

  return x;
};

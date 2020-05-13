import {random} from 'lodash';
import React from 'react';
import {IPosition, WorldState} from '../types';
import {spin} from '../util/deviceOrientation';
import {scale} from '../util/scale';
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

  public render(world: WorldState): React.ReactElement<SVGElement> {
    if (this.fireball) {
      return <g key={this.id}>{this.fireball.render(world)}</g>;
    } else {
      return <g key={this.id} />;
    }
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
      expectOutOfBounds: true
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

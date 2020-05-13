import React from 'react';
import {WorldState} from '../types';
import {spin} from '../util/deviceOrientation';
import {scale} from '../util/scale';
import {ChargingFireball} from './ChargingFireball';
import {FireballSpriteParams} from './Fireball';
import {Sprite} from './Sprite';

export interface RyuProps {
  world: WorldState;
  launchFireball: (params: FireballSpriteParams) => void;
}

interface RyuState {
  x: number;
  y: number;
}

export class Ryu extends Sprite {
  // Device orientation params
  private readonly tiltRange = 35;
  private readonly maxVelocity = 15;

  // State
  private readonly launchFireball: (params: FireballSpriteParams) => void;
  private readonly state: RyuState;
  private fireball: ChargingFireball;

  constructor(params: RyuProps) {
    super();
    const {world} = params;
    const {dimensions} = world;

    this.launchFireball = params.launchFireball;
    this.state = {
      x: dimensions.width / 2,
      y: dimensions.height - 50
    };
    this.fireball = new ChargingFireball({
      wave: world.audio.uintWave,
      position: this.state
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
    let x = this.state.x;
    if (world.keysDown.has('ArrowLeft')) {
      x -= 10;
    }
    if (world.keysDown.has('ArrowRight')) {
      x += 10;
    }
    if (world.deviceOrientation) {
      const tilt = spin(world.deviceOrientation);

      x += scale({
        input: tilt,
        inputMin: -1 * this.tiltRange, // Comfortable axis of tilt
        inputMax: this.tiltRange,
        outputMin: -1 * this.maxVelocity,
        outputMax: this.maxVelocity,
        expectOutOfBounds: true
      });
    }

    if (x > world.dimensions.width) {
      x = world.dimensions.width;
    }

    if (x < 0) {
      x = 0;
    }

    this.state.x = x;

    // Launch fireball
    this.fireball.tick(world);
    if (this.fireball.shouldLaunch()) {
      const params = this.fireball.launchParams();
      this.launchFireball(params);
      this.fireball = new ChargingFireball({
        wave: world.audio.uintWave,
        position: this.state
      });
    }
  }
}

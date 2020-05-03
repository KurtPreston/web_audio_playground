import React from 'react';
import tinycolor from 'tinycolor2';
import {WorldState} from '../types';
import {spin} from '../util/deviceOrientation';
import {scale} from '../util/scale';
import {FireballSpriteParams} from './Fireball';
import {circularPath} from './renderHelpers/circularPath';
import {Sprite} from './Sprite';

export interface RyuProps {
  world: WorldState;
  launchFireball: (params: FireballSpriteParams) => void;
}

interface RyuState {
  x: number;
  y: number;
  chargeSize: number | null;
  maxChargeWaveForm: Uint8Array;
  maxChargeSize: number;
  maxAmplitude: number;
  lastAmplitude: number;
}

export class Ryu extends Sprite {
  // Display params
  private readonly rippleRatio: number = 1.5;

  // Charing params
  private readonly chargeMinLaunchSize: number = 50;
  private readonly chargeMinSize: number = 5;
  private readonly chargeMaxSize: number = 150;
  private readonly shrinkRate = 2;
  private readonly growthRate = 2.5;
  private readonly amplitudeThreshold = 0.1;

  // Device orientation params
  private readonly tiltRange = 35;
  private readonly maxVelocity = 15;

  // State
  private readonly launchFireball: (params: FireballSpriteParams) => void;
  private state: RyuState;

  constructor(params: RyuProps) {
    super();
    const {world} = params;
    const {dimensions, audio} = world;

    this.launchFireball = params.launchFireball;
    this.state = {
      x: dimensions.width / 2,
      y: dimensions.height - 50,
      chargeSize: null,
      maxChargeWaveForm: new Uint8Array(audio.uintWave.length),
      maxChargeSize: 0,
      lastAmplitude: 0,
      maxAmplitude: 0
    };
  }

  public render(world: WorldState): React.ReactElement<SVGElement> {
    const {x, y, chargeSize} = this.state;

    if (chargeSize) {
      const rippleSize = this.rippleRatio * chargeSize;
      const style = this.fireballStyle(chargeSize);

      return circularPath({
        cx: x,
        cy: y,
        wave: world.audio.uintWave,
        minSize: chargeSize - rippleSize,
        maxSize: chargeSize + rippleSize,
        className: 'ryu-chart',
        style,
        key: 'player'
      });
    } else {
      return <g key={this.id} />;
    }
  }

  public tick(world: WorldState) {
    const soundAmplitude = world.audio.amplitude - this.amplitudeThreshold;

    const amplitudeDelta = soundAmplitude - this.state.lastAmplitude;

    const growth =
      amplitudeDelta >= 0
        ? scale({
            input: soundAmplitude,
            inputMin: 0,
            inputMax: 1,
            outputMin: 0,
            outputMax: this.growthRate,
            expectOutOfBounds: true
          })
        : scale({
            input: amplitudeDelta,
            inputMin: -1 * this.amplitudeThreshold,
            inputMax: 0,
            outputMin: -1 * this.shrinkRate,
            outputMax: 0,
            expectOutOfBounds: true
          });

    const unboundedCargeSize = this.state.chargeSize ? this.state.chargeSize + growth : growth;
    let chargeSize = Math.max(Math.min(unboundedCargeSize, this.chargeMaxSize), this.chargeMinSize);

    let maxChargeSize = this.state.maxChargeSize;
    let maxAmplitude = this.state.maxAmplitude;
    let maxChargeWaveForm = this.state.maxChargeWaveForm;
    if (chargeSize > maxChargeSize) {
      maxChargeSize = chargeSize;
      maxAmplitude = soundAmplitude;

      if (soundAmplitude > this.state.maxAmplitude) {
        maxChargeWaveForm = world.audio.uintWave.slice(0);
      }
    }

    if (soundAmplitude < 0.98 * maxAmplitude && chargeSize > this.chargeMinLaunchSize) {
      const rippleSize = this.rippleRatio * chargeSize;
      this.launchFireball({
        velocity: scale({
          input: chargeSize,
          inputMin: this.chargeMinSize,
          inputMax: this.chargeMaxSize,
          outputMin: 7,
          outputMax: 50
        }),
        minSize: chargeSize - rippleSize,
        maxSize: chargeSize + rippleSize,
        wave: maxChargeWaveForm,
        state: {
          x: this.state.x,
          y: this.state.y,
          angle: (3 * Math.PI) / 2, // Facing up
          spinAngle: 0
        },
        spinMomentum: 5,
        style: this.fireballStyle(chargeSize)
      });
      maxChargeSize = 0;
      chargeSize = 0;
    }

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

    this.state = {
      ...this.state,
      x,
      lastAmplitude: soundAmplitude,
      maxAmplitude,
      maxChargeSize,
      maxChargeWaveForm,
      chargeSize
    };
  }

  private fireballStyle(chargeSize: number): React.CSSProperties {
    if (chargeSize < this.chargeMinLaunchSize) {
      const blend = scale({
        input: chargeSize,
        inputMin: this.chargeMinSize,
        inputMax: this.chargeMinLaunchSize,
        outputMin: 0,
        outputMax: 100,
        expectOutOfBounds: true
      });
      return {
        fill: tinycolor.mix('#000', '#00a', blend).toHexString(),
        stroke: 'white',
        strokeWidth: '1px'
      };
    } else {
      const blend = scale({
        input: chargeSize,
        inputMin: this.chargeMinLaunchSize,
        inputMax: this.chargeMaxSize,
        outputMin: 0,
        outputMax: 100,
        expectOutOfBounds: true
      });
      return {
        fill: tinycolor.mix('#00f', '#f00', blend).toHexString(),
        stroke: tinycolor.mix('#f00', '#000', blend).toHexString(),
        strokeWidth: blend / 10
      };
    }
  }
}

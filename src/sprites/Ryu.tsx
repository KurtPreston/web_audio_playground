import React from 'react';
import tinycolor from 'tinycolor2';
import {Dimensions, WorldState} from '../types';
import {scale} from '../util/scale';
import {FireballSpriteParams} from './Fireball';
import {circularPath} from './renderHelpers/circularPath';
import {Sprite} from './Sprite';

export interface RyuProps {
  dimensions: Dimensions;
  launchFireball: (params: FireballSpriteParams) => void;
}

interface RyuState {
  x: number;
  y: number;
  chargeSize: number | null;
  maxChargeSize: number;
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

  // State
  private readonly launchFireball: (params: FireballSpriteParams) => void;
  private state: RyuState;

  constructor(params: RyuProps) {
    super();

    this.launchFireball = params.launchFireball;
    this.state = {
      x: params.dimensions.width / 2,
      y: params.dimensions.height - 50,
      chargeSize: null,
      maxChargeSize: 0,
      lastAmplitude: 0
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

    let maxChargeSize = Math.max(this.state.maxChargeSize, chargeSize);

    if (chargeSize < 0.99 * maxChargeSize && chargeSize > this.chargeMinLaunchSize) {
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
        wave: world.audio.uintWave,
        state: {
          x: this.state.x,
          y: this.state.y,
          angle: (3 * Math.PI) / 2 // Facing up
        },
        style: this.fireballStyle(chargeSize)
      });
      maxChargeSize = 0;
      chargeSize = 0;
    }

    this.state = {
      ...this.state,
      lastAmplitude: soundAmplitude,
      maxChargeSize,
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

import React from 'react';
import {Dimensions, WorldState} from '../types';
import {scale} from '../util/scale';
import {circularPath} from './renderHelpers/circularPath';
import {Sprite} from './Sprite';

export interface RyuProps {
  dimensions: Dimensions;
}

interface RyuState {
  x: number;
  y: number;
  chargeSize: number | null;
  lastAmplitude: number;
}

export class Ryu extends Sprite {
  private readonly chargeMinSize: number = 5;
  private readonly chargeMaxSize: number = 200;
  private state: RyuState;

  constructor(params: RyuProps) {
    super();

    this.state = {
      x: params.dimensions.width / 2,
      y: params.dimensions.height - 50,
      chargeSize: null,
      lastAmplitude: 0
    };
  }

  public render(world: WorldState): React.ReactElement<SVGElement> {
    const {x, y, chargeSize} = this.state;

    if (chargeSize) {
      const rippleSize = 0.9 * chargeSize;
      return circularPath({
        cx: x,
        cy: y,
        wave: world.audio.uintWave,
        minSize: chargeSize - rippleSize,
        maxSize: chargeSize + rippleSize,
        className: 'ryu-chart',
        key: 'player'
      });
    } else {
      return <g key={this.id} />;
    }
  }

  public tick(world: WorldState) {
    const shrinkRate = 3;
    const growthRate = 5;
    const amplitudeThreshold = 0.1;
    const soundAmplitude = world.audio.amplitude - amplitudeThreshold;

    const amplitudeDelta = soundAmplitude - this.state.lastAmplitude;

    const growth =
      amplitudeDelta >= 0
        ? scale({
            input: soundAmplitude,
            inputMin: 0,
            inputMax: 1,
            outputMin: 0,
            outputMax: growthRate,
            expectOutOfBounds: true
          })
        : scale({
            input: amplitudeDelta,
            inputMin: -1 * amplitudeThreshold,
            inputMax: 0,
            outputMin: -1 * shrinkRate,
            outputMax: 0,
            expectOutOfBounds: true
          });

    const unboundedCargeSize = this.state.chargeSize ? this.state.chargeSize + growth : growth;
    const chargeSize = Math.max(
      Math.min(unboundedCargeSize, this.chargeMaxSize),
      this.chargeMinSize
    );

    this.state = {
      ...this.state,
      lastAmplitude: soundAmplitude,
      chargeSize
    };
  }
}

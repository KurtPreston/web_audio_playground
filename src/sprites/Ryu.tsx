import React from 'react';
import {Dimensions, WorldState} from '../types';
import {scale} from '../util/scale';
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
  private readonly chargeMaxSize: number = 150;
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
      return <circle key={this.id} className='ryu-charge' cx={x} cy={y} r={chargeSize} />;
    } else {
      return <g key={this.id} />;
    }
  }

  public tick(world: WorldState) {
    const shrinkRate = 5;
    const growthRate = 10;
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
            outputMax: growthRate
          })
        : scale({
            input: amplitudeDelta,
            inputMin: -1 * amplitudeThreshold,
            inputMax: 0,
            outputMin: -1 * shrinkRate,
            outputMax: 0
          });

    const chargeSize = this.state.chargeSize ? this.state.chargeSize + growth : growth;

    this.state = {
      ...this.state,
      lastAmplitude: soundAmplitude,
      chargeSize
    };
  }
}

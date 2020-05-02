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
      chargeSize: null
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
    const chargeSize = scale({
      input: world.audio.amplitude,
      inputMin: 0,
      inputMax: 1,
      outputMin: this.chargeMinSize,
      outputMax: this.chargeMaxSize,
      logarithmic: true
    });

    this.state = {
      ...this.state,
      chargeSize
    };
  }
}

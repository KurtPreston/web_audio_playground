import {autobind} from 'core-decorators';
import React from 'react';
import {Dimensions, IPosition, IVector, WorldState} from '../types';
import './FlyingWamdag.scss';
import {Sprite} from './Sprite';

export interface FlyingWamdagParams {
  dimensions: Dimensions;
}

@autobind
export class FlyingWamdag extends Sprite {
  private position: IPosition;
  private target: IPosition;
  private vector: IVector;
  private readonly force: number = 1;
  private readonly maxVelocity = 6;

  constructor(params: FlyingWamdagParams) {
    super();
    const xMid = params.dimensions.width / 2;
    const yMid = params.dimensions.height / 2;
    this.position = {
      x: xMid,
      y: yMid - 10
    };
    this.vector = {
      xMomentum: 0,
      yMomentum: 0
    };
    this.target = {
      x: xMid,
      y: yMid
    };
  }

  public render(world: WorldState): React.ReactElement<SVGElement> {
    return (
      <g key={this.id}>
        <circle className='flying-wamdag' cx={this.position.x} cy={this.position.y} r={10} />;
        <circle className='flying-wamdag-target' cx={this.target.x} cy={this.target.y} r={5} />;
      </g>
    );
  }

  public tick(world: WorldState) {
    const {width, height} = world.dimensions;
    const {position, target, vector} = this;
    // Adjust target

    // Adjust momentum towards target
    const xDiff = target.x - position.x;
    const yDiff = target.y - position.y;
    const angle = Math.atan(yDiff / xDiff);

    if (isFinite(angle)) {
      const xMomentumDelta = this.force * Math.cos(angle);
      const yMomentumDelta = this.force * Math.sin(angle);

      vector.xMomentum += xMomentumDelta;
      vector.yMomentum += yMomentumDelta;
    }

    // Bounce off edges
    if (position.x > width && vector.xMomentum > 0) {
      vector.xMomentum *= -1;
    }

    if (position.x < 0 && vector.xMomentum < 0) {
      vector.xMomentum *= -1;
    }

    if (position.y > height && vector.yMomentum > 0) {
      vector.yMomentum *= -1;
    }

    if (position.y < 0 && vector.yMomentum < 0) {
      vector.yMomentum *= -1;
    }

    // Apply max velocity
    const velocity = Math.sqrt(Math.pow(vector.xMomentum, 2) + Math.pow(vector.yMomentum, 2));
    if (velocity > this.maxVelocity) {
      const ratio = velocity / this.maxVelocity;
      vector.xMomentum *= ratio;
      vector.yMomentum *= ratio;
    }

    position.x += vector.xMomentum;
    position.y += vector.yMomentum;
  }
}

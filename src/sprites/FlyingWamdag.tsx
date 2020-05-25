import {autobind} from 'core-decorators';
import React from 'react';
import {Dimensions, IPosition, IVector, WorldState} from '../types';
import './FlyingWamdag.scss';
import {NoteGrid} from './NoteGrid';
import {circularPath} from './renderHelpers/circularPath';
import {Sprite} from './Sprite';

export interface FlyingWamdagParams {
  dimensions: Dimensions;
  noteGrid: NoteGrid;
}

@autobind
export class FlyingWamdag extends Sprite {
  // Constants
  private readonly force: number = 1;
  private readonly maxVelocity = 6;

  // State
  private position: IPosition;
  private target: IPosition;
  private vector: IVector;

  // Referenced sprites
  private noteGrid: NoteGrid;

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
    this.noteGrid = params.noteGrid;
  }

  public render(world: WorldState): React.ReactElement<SVGElement> {
    const targetIndicator = circularPath({
      cx: this.target.x,
      cy: this.target.y,
      wave: world.audio.uintWave,
      minSize: 3,
      maxSize: 45 * world.audio.amplitude,
      className: 'flying-wamdag-target',
      key: 'flying-wamdag-target'
    });

    return (
      <g key={this.id}>
        <circle className='flying-wamdag' cx={this.position.x} cy={this.position.y} r={10} />;
        {targetIndicator}
      </g>
    );
  }

  public tick(world: WorldState) {
    const {width, height} = world.dimensions;
    const {noteGrid, position, target, vector} = this;
    // Adjust target
    if (noteGrid.peakFreqPosition) {
      this.target.x = noteGrid.peakFreqPosition.x;
      this.target.y = noteGrid.peakFreqPosition.y;
    }

    // Adjust momentum towards target
    const xDiff = target.x - position.x;
    const yDiff = target.y - position.y;
    let angle = Math.atan(yDiff / xDiff);

    if (isFinite(angle)) {
      if (xDiff < 0) {
        angle += Math.PI;
      }

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
      const ratio = this.maxVelocity / velocity;
      vector.xMomentum *= ratio;
      vector.yMomentum *= ratio;
    }

    position.x += vector.xMomentum;
    position.y += vector.yMomentum;
  }
}

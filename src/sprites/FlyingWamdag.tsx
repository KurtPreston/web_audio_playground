import {autobind} from 'core-decorators';
import React from 'react';
import flyingWamdagSvg1 from '../images/flyingWamdag1.svg';
import flyingWamdagSvg2 from '../images/flyingWamdag2.svg';
import flyingWamdagSvg3 from '../images/flyingWamdag3.svg';
import flyingWamdagSvg4 from '../images/flyingWamdag4.svg';
import {Dimensions, IPosition, IVector, WorldState} from '../types';
import {scale} from '../util/scale';
import './FlyingWamdag.scss';
import {NoteGrid} from './NoteGrid';
import {circularPath} from './renderHelpers/circularPath';
import {Sprite} from './Sprite';

export interface FlyingWamdagParams {
  dimensions: Dimensions;
  noteGrid: NoteGrid;
}

const flyingWamdagSvgs = [flyingWamdagSvg1, flyingWamdagSvg2, flyingWamdagSvg3, flyingWamdagSvg4];

@autobind
export class FlyingWamdag extends Sprite {
  // Constants
  private readonly force: number = 0.7;
  private readonly maxVelocity = 10;
  private readonly animationFrameRate = 4; // change every 4 frames
  private readonly numPowerUpFrames = 15;

  // State
  public position: IPosition;
  private target: IPosition;
  private vector: IVector;
  private animationFrame: number = 0;
  private framesSincePowerUp: number = Number.POSITIVE_INFINITY;

  // Referenced sprites
  private noteGrid: NoteGrid;
  private svgDefs = (
    <defs>
      <filter id='flying-wamdag-shadow' x='0' y='0' width='200%' height='200%'>
        <feOffset result='offOut' in='SourceAlpha' dx='20' dy='20' />
        <feGaussianBlur result='blurOut' in='offOut' stdDeviation='10' />
        <feBlend in='SourceGraphic' in2='blurOut' mode='normal' />
      </filter>
    </defs>
  );

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

  public powerUp() {
    this.framesSincePowerUp = 0;
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    // const targetIndicator = circularPath({
    //   cx: this.target.x,
    //   cy: this.target.y,
    //   wave: world.audio.uintWave,
    //   minSize: 3,
    //   maxSize: 45 * world.audio.amplitude,
    //   className: 'flying-wamdag-target',
    //   key: 'flying-wamdag-target'
    // });
    // return (
    //   <g key={this.id}>
    //     {this.svgDefs}
    //     {targetIndicator}
    //     {this.renderPowerUp()}
    //     {this.renderFlyingWamdags()}
    //   </g>
    // );
  }

  private renderFlyingWamdags() {
    const {x, y} = this.position;
    const width = 100;
    const height = 100;

    const xMin = x - width / 2;
    const yMin = y - height / 2;

    const transform =
      this.vector.xMomentum < 0
        ? `translate(${x}px,0) scale(-1,1) translate(-${x}px,0)`
        : undefined;

    return flyingWamdagSvgs.map((flyingWamdagSvg: string, idx: number) => {
      const style: React.CSSProperties = {
        opacity: idx === this.animationFrame ? 1 : 0,
        transform
      };

      return (
        <image
          key={flyingWamdagSvg}
          x={xMin}
          y={yMin}
          style={style}
          width={width}
          height={height}
          preserveAspectRatio='xMaxYMin slice'
          xlinkHref={flyingWamdagSvgs[idx]}
          filter='url(#flying-wamdag-shadow)'
        />
      );
    });
  }

  private renderPowerUp(): React.ReactNode {
    if (this.framesSincePowerUp < this.numPowerUpFrames) {
      const value = scale({
        input: this.framesSincePowerUp,
        inputMin: 0,
        inputMax: this.numPowerUpFrames - 1,
        outputMin: 0,
        outputMax: Math.PI
      });

      return (
        <circle
          className='flying-wamdag-power-up'
          cx={this.position.x}
          cy={this.position.y}
          r={Math.sin(value) * 80}
        />
      );
    }
  }

  public tick(world: WorldState) {
    const {width, height} = world.dimensions;
    const {noteGrid, position, target, vector} = this;
    // Animate
    if (world.frameNum % this.animationFrameRate === 0) {
      this.animationFrame = (this.animationFrame + 1) % flyingWamdagSvgs.length;
    }
    this.framesSincePowerUp++;

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

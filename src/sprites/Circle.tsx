import {random} from 'lodash';
import React from 'react';
import {randomWalkFactory} from '../frameTickers/randomWalk';
import {Dimensions, IWanderer, SpriteTicker, WorldState} from '../types';
import {randomColor} from '../util/color';
import {scale} from '../util/scale';
import {Sprite} from './Sprite';

export interface CircleParams {
  dimensions: Dimensions;
  bounceOffEdge: boolean;
  destroy: (sprite: Circle) => boolean;
}

interface CircleState extends IWanderer {
  size: number;
}

export class Circle extends Sprite {
  public state: CircleState;
  private readonly minSize = 15;
  private readonly maxSize = 60;
  private readonly style: React.CSSProperties = {
    fill: randomColor(),
    mixBlendMode: 'color-dodge'
  };
  private readonly walkTicker: SpriteTicker<IWanderer>;
  private readonly bounceOffEdge: boolean;
  private readonly destroy: () => boolean;

  constructor(params: CircleParams) {
    super();
    const {dimensions, bounceOffEdge} = params;
    const {height} = dimensions;

    this.walkTicker = randomWalkFactory({
      velocity: random(3, 7),
      jitter: random(0.01, 0.12),
      lean: random(-0.03, 0.03, true),
      bounceOffEdge
    });
    this.bounceOffEdge = bounceOffEdge;
    this.destroy = () => params.destroy(this);

    this.state = {
      // On left, facing right
      x: 0,
      y: height / 2,
      angle: 0,
      size: this.minSize
    };
  }

  public render(world: WorldState): React.ReactElement<SVGElement> {
    const {x, y, size} = this.state;

    return (
      <circle key={this.id} className='instrument' cx={x} cy={y} r={size} style={this.style} />
    );
  }

  public tick(world: WorldState) {
    const {dimensions, audio} = world;
    const size = scale({
      input: audio.amplitude,
      inputMin: 0,
      inputMax: 1,
      outputMin: this.minSize,
      outputMax: this.maxSize,
      logarithmic: true
    });
    this.state = {
      ...this.walkTicker(this.state, world),
      size
    };

    if (!this.bounceOffEdge) {
      const {x, y} = this.state;
      const offLeftSide = x < -1 * size;
      const offRightSide = x > dimensions.width + size;
      const offTop = y < -1 * size;
      const offBottom = y > dimensions.height + size;
      if (offLeftSide || offRightSide || offTop || offBottom) {
        this.destroy();
      }
    }
  }
}

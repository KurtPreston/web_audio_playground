import {random, sample} from 'lodash';
import React from 'react';
import {JitterType, randomWalkFactory} from '../frameTickers/randomWalk';
import {Dimensions, IWanderer, SpriteTicker, WorldState} from '../types';
import {randomColor} from '../util/color';
import {scale} from '../util/scale';
import {Sprite} from './Sprite';

export interface CircleParams {
  dimensions: Dimensions;
  bounceOffEdge: boolean;
  destroy: (sprite: Sprite) => boolean;
}

interface CircleState extends IWanderer {
  size: number;
}

export class Circle extends Sprite {
  private state: IWanderer;
  private readonly minSize = 15;
  private readonly maxSize = 60;
  private readonly style: React.CSSProperties = {
    fill: randomColor(),
    mixBlendMode: 'color-dodge'
  };
  private readonly ticker: SpriteTicker<IWanderer>;
  private readonly bounceOffEdge: boolean;
  private readonly destroy: () => boolean;

  constructor(params: CircleParams) {
    super();
    const {dimensions, bounceOffEdge} = params;
    const {height} = dimensions;

    this.ticker = randomWalkFactory({
      velocity: random(3, 7),
      jitter: random(0.01, 0.08),
      jitterType: sample(['leanLeft', 'leanRight', 'random']) as JitterType,
      bounceOffEdge
    });
    this.bounceOffEdge = bounceOffEdge;
    this.destroy = () => params.destroy(this);

    this.state = {
      // On left, facing right
      x: 0,
      y: height / 2,
      angle: 0
    };
  }

  public render(world: WorldState): React.ReactElement<SVGElement> {
    const {audio} = world;
    const {x, y} = this.state;

    const amplitude = audio.amplitude;
    const size = scale({
      input: amplitude,
      inputMin: 0,
      inputMax: 1,
      outputMin: this.minSize,
      outputMax: this.maxSize,
      logarithmic: true
    });

    return (
      <circle key={this.id} className='instrument' cx={x} cy={y} r={size} style={this.style} />
    );
  }

  public tick(world: WorldState) {
    const {dimensions} = world;
    this.state = this.ticker(this.state, world);

    if (!this.bounceOffEdge) {
      const {x, y} = this.state;
      if (x < 0 || x > dimensions.width || y < 0 || y > dimensions.height) {
        this.destroy();
      }
    }
  }
}

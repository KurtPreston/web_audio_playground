import {IWanderer, SpriteTicker, AudioData, Dimensions} from '../types';
import {scale} from '../util/scale';
import React from 'react';
import {randomColor} from '../util/color';
import {sample, random} from 'lodash';
import {randomWalkFactory, JitterType} from '../frameTickers/randomWalk';
import { Sprite } from './Sprite';

export class Circle extends Sprite {
  private state: IWanderer;
  private readonly minSize = 15;
  private readonly maxSize = 60;
  private readonly style: React.CSSProperties = {
    fill: randomColor(),
    mixBlendMode: 'color-dodge'
  };
  private readonly ticker: SpriteTicker<IWanderer> = randomWalkFactory({
    velocity: random(3, 7),
    jitter: random(0.01, 0.08),
    jitterType: sample(['leanLeft', 'leanRight', 'random']) as JitterType
  });

  constructor(dimensions: Dimensions) {
    super();
    const {height} = dimensions;

    this.state = {
      // On left, facing right
      x: 0,
      y: height / 2,
      angle: 0
    };
  }

  public render(audio: AudioData, dimensions: Dimensions): React.ReactElement<SVGElement> {
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

  public tick(dimensions: Dimensions) {
    this.state = this.ticker(this.state, dimensions);
  }
}

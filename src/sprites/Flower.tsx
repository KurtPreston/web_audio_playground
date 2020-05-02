import {chunk, random} from 'lodash';
import React from 'react';
import {randomWalkFactory} from '../frameTickers/randomWalk';
import {Dimensions, IWanderer, SpriteTicker, WorldState} from '../types';
import {scale} from '../util/scale';
import './Flower.scss';
import {circularPath} from './renderHelpers/circularPath';
import {Sprite} from './Sprite';

export class Flower extends Sprite {
  private state: IWanderer;
  private readonly minSize = 100;
  private readonly maxSize = 1000;
  private readonly numFlowers = 6;
  private readonly ticker: SpriteTicker<IWanderer> = randomWalkFactory({
    velocity: 5,
    jitter: 0.03,
    lean: random(-1, 1, true),
    bounceOffEdge: true
  });

  constructor(dimensions: Dimensions) {
    super();
    const {width, height} = dimensions;

    this.state = {
      // In center, facing up
      x: width / 2,
      y: height / 2,
      angle: Math.PI / 2
    };
  }

  public render(world: WorldState): React.ReactElement<SVGElement> {
    const {audio} = world;
    const {amplitude, frequencies} = audio;
    const maxFlowerSize = scale({
      input: amplitude,
      inputMin: 0,
      inputMax: 1,
      outputMin: this.minSize,
      outputMax: this.maxSize,
      logarithmic: true
    });

    const frequencyGroups = chunk(frequencies, frequencies.length / this.numFlowers);
    const flowerRings = frequencyGroups.map((group, groupIdx) => {
      return circularPath({
        cx: this.state.x,
        cy: this.state.y,
        minSize: 0,
        maxSize: maxFlowerSize,
        className: 'flower',
        key: groupIdx,
        wave: group
      });
    });

    return <g key={this.id}>{flowerRings}</g>;
  }

  public tick(world: WorldState) {
    this.state = this.ticker(this.state, world);
  }
}

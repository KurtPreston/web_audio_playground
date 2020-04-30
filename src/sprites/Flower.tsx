import {IWanderer, SpriteTicker, AudioData, Dimensions} from '../types';
import {scale} from '../util/scale';
import React from 'react';
import {chunk} from 'lodash';
import {randomWalkFactory} from '../frameTickers/randomWalk';
import {Sprite} from './Sprite';

export class Flower extends Sprite {
  private state: IWanderer;
  private readonly minSize = 100;
  private readonly maxSize = 1000;
  private readonly numFlowers = 6;
  private readonly ticker: SpriteTicker<IWanderer> = randomWalkFactory({
    velocity: 5,
    jitter: 0.03,
    jitterType: 'random'
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

  public render(audio: AudioData, dimensions: Dimensions): React.ReactElement<SVGElement> {
    const amplitude = audio.amplitude;
    const size = scale({
      input: amplitude,
      inputMin: 0,
      inputMax: 1,
      outputMin: this.minSize,
      outputMax: this.maxSize,
      logarithmic: true
    });

    const pathCoords: {x: number; y: number}[] = new Array(audio.frequencies.length);
    audio.frequencies.forEach((value: number, idx: number) => {
      pathCoords[idx] = {
        x: idx,
        y: value
      };
    });

    // const frequencyMeter = `M0,0, ${pathCoords.map(({x, y}) => `L${x},${y}`)}`;
    // visualizer = <path d={frequencyMeter} style={{stroke: 'white'}}/>;

    const frequencyGroups = chunk(pathCoords, pathCoords.length / this.numFlowers);
    const flowerRings = frequencyGroups.map((group, groupIdx) => {
      const circularCoords = group.map(({y}, idx) => {
        const r = scale({
          input: y,
          inputMin: 0,
          inputMax: 255,
          outputMin: 0,
          outputMax: size
        });
        const angle = scale({
          input: idx,
          inputMin: 0,
          inputMax: group.length - 1,
          outputMin: 0,
          outputMax: 2 * Math.PI
        });
        const circularX = Math.cos(angle) * r + this.state.x;
        const circularY = Math.sin(angle) * r + this.state.y;
        return {
          x: circularX,
          y: circularY
        };
      });

      const last = circularCoords[circularCoords.length - 1];
      const circularFrequencyMeter = [
        `M${last.x},${last.y}`,
        ...circularCoords.map(({x, y}) => {
          return `L${x},${y}`;
        })
      ].join(' ');
      return (
        <path
          key={groupIdx}
          className='flower'
          d={circularFrequencyMeter}
          style={{stroke: 'white'}}
        />
      );
    });

    return <g key={this.id}>{flowerRings}</g>;
  }

  public tick(dimensions: Dimensions) {
    this.state = this.ticker(this.state, dimensions);
  }
}

import React from 'react';
import { SpritePosition, AudioData } from '../types';
import { scale } from '../util/scale';
import { chunk } from 'lodash';

const minSize = 100;
const maxSize = 1000;
const numFlowers = 6;

export function flowerRenderer(position: SpritePosition, audio: AudioData): React.ReactElement<SVGElement> {
  const amplitude = audio.amplitude;
  const size = scale({
    input: amplitude,
    inputMin: 0,
    inputMax: 1,
    outputMin: minSize,
    outputMax: maxSize,
    logarithmic: true
  });

  const pathCoords: {x: number, y: number}[] = new Array(audio.frequencies.length);
  audio.frequencies.forEach((value: number, idx: number) => {
    pathCoords[idx] = {
      x: idx,
      y: value
    };
  });

  // const frequencyMeter = `M0,0, ${pathCoords.map(({x, y}) => `L${x},${y}`)}`;
  // visualizer = <path d={frequencyMeter} style={{stroke: 'white'}}/>;

  const frequencyGroups = chunk(pathCoords, pathCoords.length / numFlowers);
  const flowerRings = frequencyGroups.map((group, groupIdx) => {
    const circularCoords = group.map(({x, y}, idx) => {
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
      const circularX = Math.cos(angle) * r + position.x;
      const circularY = Math.sin(angle) * r + position.y;
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
    ].join(' ')
    return <path key={groupIdx} className='flower' d={circularFrequencyMeter} style={{stroke: 'white'}}/>;
  });

  return <g>{flowerRings}</g>;
}
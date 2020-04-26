import React from 'react';
import { SpritePosition, AudioData } from '../types';
import { scale } from '../util/scale';
import { chunk } from 'lodash';

const minSize = 15;
const maxSize = 600;
const numFlowers = 6;

export function flowerRenderer(position: SpritePosition, audio?: AudioData): React.ReactElement<SVGElement> {
  const {x, y} = position;

  const style: React.CSSProperties = {
    fill: 'white'
  };

  let size = minSize;
  if(audio) {
    // 0 - 255
    const amplitude = Math.max(...audio.wave as any);
    size = scale({
      input: amplitude,
      inputMin: 0,
      inputMax: 255,
      outputMin: minSize,
      outputMax: maxSize
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
          input: x,
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

  return (
    <circle cx={x} cy={y} r={size} style={style} />
  );
}
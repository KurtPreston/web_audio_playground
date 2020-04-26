import React from 'react';
import { SpritePosition, AudioData } from '../types';
import { scale } from '../util/scale';

const minSize = 15;
const maxSize = 60;

export function characterRenderer(position: SpritePosition, audio?: AudioData): React.ReactElement<SVGElement> {
  const {x, y} = position;

  const style: React.CSSProperties = {
    fill: 'white'
  };

  let size = minSize;
  let visualizer: React.ReactNode = null;
  if(audio) {
    // 0 - 255
    const amplitude = Math.max(...audio.wave as any);
    size = (maxSize - minSize) * (amplitude / 256) + minSize;

    const pathCoords: {x: number, y: number}[] = new Array(audio.frequencies.length);
    audio.frequencies.forEach((value: number, idx: number) => {
      pathCoords[idx] = {
        x: idx,
        y: value
      };
    });

    const frequencyMeter = `M0,0, ${pathCoords.map(({x, y}) => `L${x},${y}`)}`;
    visualizer = <path d={frequencyMeter} style={{stroke: 'white'}}/>;

    const circularFrequencyMeter = [
      `M${position.x},${position.y}`,
      ...pathCoords.map(({x, y}) => {
        const r = scale({
          input: y,
          inputMin: 0,
          inputMax: 255,
          outputMin: 0,
          outputMax: size
        }) * y;
        const angle = scale({
          input: x,
          inputMin: 0,
          inputMax: pathCoords.length,
          outputMin: 0,
          outputMax: 2 * Math.PI
        });
        const circularX = Math.cos(angle) * r + position.x;
        const circularY = Math.sin(angle) * r + position.y;
        return `L${circularX},${circularY}`;
      })
    ].join(' ')
    visualizer = <path className='porcupine' d={circularFrequencyMeter} style={{stroke: 'white'}}/>;
  }

  return (
    <g>
      {/* <circle cx={x} cy={y} r={size} style={style} /> */}
      {visualizer}
    </g>
  );
}
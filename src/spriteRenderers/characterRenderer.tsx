import React from 'react';
import { SpritePosition, AudioData } from '../types';

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

    const pathD = `M0,0, ${pathCoords.map(({x, y}) => `L${x},${y}`)}`;
    visualizer = <path d={pathD} style={{stroke: 'white'}}/>;
  }

  return (
    <g>
      <circle cx={x} cy={y} r={size} style={style} />
      {visualizer}
    </g>
  );
}
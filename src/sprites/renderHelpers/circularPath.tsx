import React from 'react';
import {scale} from '../../util/scale';

interface CircularPathParams {
  cx: number;
  cy: number;
  wave: Uint8Array | number[];
  minSize: number;
  maxSize: number;
  key: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export function circularPath(params: CircularPathParams): React.ReactElement<SVGPathElement> {
  const {className, cx, cy, key, minSize, maxSize, style, wave} = params;

  const coords: {x: number; y: number}[] = new Array(wave.length);

  params.wave.forEach((amplitude: number, idx: number) => {
    const r = scale({
      input: amplitude,
      inputMin: 0,
      inputMax: 255,
      outputMin: minSize,
      outputMax: maxSize
    });
    const angle = scale({
      input: idx,
      inputMin: 0,
      inputMax: wave.length - 1,
      outputMin: 0,
      outputMax: 2 * Math.PI
    });
    const circularX = Math.cos(angle) * r + cx;
    const circularY = Math.sin(angle) * r + cy;
    coords[idx] = {
      x: circularX,
      y: circularY
    };
  });

  const last = coords[coords.length - 1];
  const circularFrequencyMeter = [
    `M${last.x},${last.y}`,
    ...coords.map(({x, y}) => {
      return `L${x},${y}`;
    })
  ].join(' ');
  return <path key={key} className={className} d={circularFrequencyMeter} style={style} />;
}

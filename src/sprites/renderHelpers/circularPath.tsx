import React from 'react';
import {scale} from '../../util/scale';

interface CircularPathParams {
  cx: number;
  cy: number;
  wave: Uint8Array | number[];
  minSize: number;
  maxSize: number;
  key: string | number;
  angle?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function circularPath(params: CircularPathParams): React.ReactElement<SVGPathElement> {
  const {className, cx, cy, key, minSize, maxSize, style, wave} = params;
  const angle = params.angle || 0;

  const coords: {x: number; y: number}[] = new Array(wave.length);

  params.wave.forEach((amplitude: number, idx: number) => {
    const r = scale({
      input: amplitude,
      inputMin: 0,
      inputMax: 255,
      outputMin: minSize,
      outputMax: maxSize
    });
    const pointAngle = scale({
      input: idx,
      inputMin: 0,
      inputMax: wave.length - 1,
      outputMin: angle,
      outputMax: 2 * Math.PI + angle
    });
    const circularX = Math.cos(pointAngle) * r + cx;
    const circularY = Math.sin(pointAngle) * r + cy;
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

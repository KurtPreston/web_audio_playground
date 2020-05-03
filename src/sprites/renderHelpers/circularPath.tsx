import React from 'react';
import {ouroboros} from '../../util/ouroboros';
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
  tailSmoothing?: number; // number of data points to average between tail and head
}

export function circularPath(params: CircularPathParams): React.ReactElement<SVGPathElement> {
  const {className, cx, cy, key, minSize, maxSize, style, wave} = params;
  const angle = params.angle || 0;
  const tailSmoothing: number = params.tailSmoothing || Math.round(wave.length * 0.1);
  const size = Math.max(wave.length - tailSmoothing, 0);

  const coords: {x: number; y: number}[] = new Array(size);

  wave.forEach((amplitude: number, idx: number) => {
    if (tailSmoothing) {
      if (idx <= tailSmoothing) {
        // For first n elements, average with last n
        amplitude = ouroboros(wave, idx, tailSmoothing);
      }
    }

    if (idx >= size) {
      return;
    }

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
      inputMax: size - 1,
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

  const last = size >= 1 ? coords[size - 1] : {x: 0, y: 0};
  const circularFrequencyMeter = [
    `M${last.x},${last.y}`,
    ...coords.map(({x, y}) => {
      return `L${x},${y}`;
    })
  ].join(' ');
  return <path key={key} className={className} d={circularFrequencyMeter} style={style} />;
}

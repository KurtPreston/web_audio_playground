import React from 'react';
import { SpritePosition, SpriteRenderer, AudioData } from "../types";
import { scale } from '../util/scale';

const minSize = 15;
const maxSize = 60;

export function circleRendererFactory(style: React.CSSProperties): SpriteRenderer {
  return (position: SpritePosition, audio?: AudioData): React.ReactElement<SVGElement> => {
    const {x, y} = position;

    let size = minSize;

    if(audio) {
      const amplitude = Math.max(...audio.wave as any);
      size = scale({
        input: amplitude,
        inputMin: 128,
        inputMax: 255,
        outputMin: minSize,
        outputMax: maxSize
      });
    }

    return (
      <circle className='instrument' cx={x} cy={y} r={size} style={style} />
    );
  }
}
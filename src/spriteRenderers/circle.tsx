import React from 'react';
import {SpriteRenderer, AudioData, IWanderer} from '../types';
import {scale} from '../util/scale';

const minSize = 15;
const maxSize = 60;

export function circleRendererFactory(style: React.CSSProperties): SpriteRenderer<IWanderer> {
  return (state: IWanderer, audio: AudioData): React.ReactElement<SVGElement> => {
    const {x, y} = state;

    const amplitude = audio.amplitude;
    const size = scale({
      input: amplitude,
      inputMin: 0,
      inputMax: 1,
      outputMin: minSize,
      outputMax: maxSize,
      logarithmic: true
    });

    return <circle className='instrument' cx={x} cy={y} r={size} style={style} />;
  };
}

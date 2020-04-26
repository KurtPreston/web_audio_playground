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
  if(audio) {
    // 0 - 255
    const amplitude = Math.max(...audio.wave as any);
    size = (maxSize - minSize) * (amplitude / 256) + minSize;
  }

  return (
    <circle cx={x} cy={y} r={size} style={style} />
  );
}
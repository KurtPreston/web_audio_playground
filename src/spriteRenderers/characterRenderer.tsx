import React from 'react';
import { SpritePosition } from '../types';

export function characterRenderer(position: SpritePosition): React.ReactElement<SVGElement> {
  const {x, y} = position;

  return (
    <circle cx={x} cy={y} r={10}/>
  );
}
import React from 'react';
import { SpritePosition, SpriteRenderer } from "../types";

export function circleRendererFactory(style: React.CSSProperties): SpriteRenderer {
  return (position: SpritePosition): React.ReactElement<SVGElement> => {
    const {x, y} = position;

    return (
      <circle className='instrument' cx={x} cy={y} r={20} style={style} />
    );
  }
}
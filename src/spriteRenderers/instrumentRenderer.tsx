import React from 'react';
import { SpritePosition, SpriteRenderer } from "../types";

export interface InstrumentRendererFactoryProps {
  color: string;
}

export function instrumentRendererFactory(props: InstrumentRendererFactoryProps): SpriteRenderer {
  const {color} = props;
  const style: React.CSSProperties = {
    fill: color
  };

  return (position: SpritePosition): React.ReactElement<SVGElement> => {
    const {x, y} = position;

    return (
      <circle cx={x} cy={y} r={20} style={style} />
    );
  }
}
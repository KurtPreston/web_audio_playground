import React from 'react';
import BackgroundLayer from '../images/background_watercolor_layer.png';
import {WorldState} from '../types';
import {Sprite} from './Sprite';

export class Background extends Sprite {
  private angle = 0;

  constructor(
    private readonly style: React.CSSProperties,
    private readonly angularVelocity: number
  ) {
    super();
  }

  public render(world: WorldState): React.ReactElement<SVGElement> {
    const {dimensions} = world;
    const {width, height} = dimensions;

    const maxDimension = Math.max(width, height) * Math.sqrt(2);
    const xOverflow = Math.abs(maxDimension - width) / 2;
    const yOverflow = Math.abs(maxDimension - height) / 2;

    const midPointX = maxDimension / 2 - xOverflow;
    const midPointY = maxDimension / 2 - yOverflow;

    return (
      <image
        key={this.id}
        x={-1 * xOverflow}
        y={-1 * yOverflow}
        width={maxDimension}
        height={maxDimension}
        href={BackgroundLayer}
        preserveAspectRatio={'xMaxYMin slice'}
        transform={`rotate(${this.angle} ${midPointX} ${midPointY})`}
        style={this.style}
      />
    );
  }

  public tick(world: WorldState) {
    this.angle += this.angularVelocity;
  }
}

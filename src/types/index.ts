import React from 'react';

export interface SpritePosition {
  x: number;
  y: number; 
  angle: number;
}

export type SpriteRenderer = (position: SpritePosition) => React.ReactElement<SVGElement>;

export interface Sprite {
  position: SpritePosition;
  renderer: SpriteRenderer;
}

export interface World {
  width: number;
  height: number;
}

export interface GameState {
  world: World;
  sprites: {
    character: Sprite;
    goodInstrument: Sprite;
    badInstrument: Sprite;
  }
}
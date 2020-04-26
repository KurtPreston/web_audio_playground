import React from 'react';

export interface SpritePosition {
  x: number;
  y: number; 
  angle: number;
}

export type SpriteRenderer = (position: SpritePosition, audio?: AudioData) => React.ReactElement<SVGElement>;
export type SpriteTicker = (position: SpritePosition, world: World) => SpritePosition;

export interface Sprite {
  position: SpritePosition;
  renderer: SpriteRenderer;
  tick: SpriteTicker;
}

export interface World {
  width: number;
  height: number;
}

export interface GameState {
  paused: boolean;
  world: World;
  sprites: Sprite[];
}

export interface AudioData {
  frequencies: Uint8Array;
  wave: Uint8Array;
  amplitude: number;
  peakFreq: number;
}

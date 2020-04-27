import React from 'react';
import {NoteInfo} from '../util/Note';

export interface SpritePosition {
  x: number;
  y: number;
  angle: number;
}

export type SpriteRenderer = (
  position: SpritePosition,
  audio: AudioData
) => React.ReactElement<SVGElement>;
export type SpriteTicker = (position: SpritePosition, dimensions: Dimensions) => SpritePosition;

export interface Sprite {
  position: SpritePosition;
  renderer: SpriteRenderer;
  tick: SpriteTicker;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface AudioData {
  frequencies: Uint8Array;
  wave: Uint8Array;
  amplitude: number; // 0 - 1
  note: NoteInfo;
}

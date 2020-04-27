import React from 'react';
import {NoteInfo} from '../util/Note';

export interface IWanderer {
  x: number;
  y: number;
  angle: number;
}

export type SpriteRenderer<TState> = (
  state: TState,
  audio: AudioData
) => React.ReactElement<SVGElement>;
export type SpriteTicker<TState> = (position: TState, dimensions: Dimensions) => TState;

export interface Sprite<TState> {
  state: TState;
  renderer: SpriteRenderer<TState>;
  tick: SpriteTicker<TState>;
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

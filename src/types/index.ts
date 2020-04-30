import React from 'react';
import {NoteInfo, Note} from '../util/Note';

// Sprite typings
export interface Sprite {
  render: (audio: AudioData, dimensions: Dimensions) => React.ReactElement<SVGElement> 
  tick: (dimensions: Dimensions) => void;
}

export type SpriteRenderer<TState> = (
  state: TState,
  audio: AudioData,
  dimensions: Dimensions
) => React.ReactElement<SVGElement>;

export type SpriteTicker<TState> = (state: TState, dimensions: Dimensions) => TState;

// Sprite states
export interface IWanderer {
  x: number;
  y: number;
  angle: number;
}

export interface INoteGrid {
}

// App types
export interface Dimensions {
  width: number;
  height: number;
}

export interface AudioData {
  amplitudeAtNote(note: Note): number;
  frequencies: Uint8Array;
  wave: Uint8Array;
  amplitude: number; // 0 - 1
  notes: NoteInfo[];
}

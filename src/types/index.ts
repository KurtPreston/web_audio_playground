import {NoteInfo, Note} from '../util/Note';

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
  hzPerIdx: number;
  notes: NoteInfo[];
}

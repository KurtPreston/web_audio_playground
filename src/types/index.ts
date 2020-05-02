import {Note, NoteInfo} from '../util/Note';

export interface WorldState {
  dimensions: Dimensions;
  audio: AudioData;
}

export type SpriteTicker<TState> = (spriteState: TState, WorldState: WorldState) => TState;

// Sprite states
export interface IWanderer {
  x: number;
  y: number;
  angle: number;
}

export interface INoteGrid {}

// App types
export interface Dimensions {
  width: number;
  height: number;
}

export interface AudioData {
  amplitudeAtNote(note: Note): number;
  frequencies: Uint8Array;
  wave: Float32Array;
  amplitude: number; // 0 - 1
  hzPerIdx: number;
  notes: NoteInfo[];
}

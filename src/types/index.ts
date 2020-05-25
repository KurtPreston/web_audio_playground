import {Note} from '../util/Note';

export interface WorldState {
  dimensions: Dimensions;
  audio: AudioData;
  keysDown: Set<string>;
  keysPressedThisFrame: Set<string>;
  deviceOrientation: DeviceOrientation | undefined;
}

export type SpriteTicker<TState> = (spriteState: TState, WorldState: WorldState) => TState;

// Sprite states
export interface IPosition {
  x: number;
  y: number;
}

export interface IWanderer {
  x: number;
  y: number;
  angle: number;
}

export interface IVector {
  xMomentum: number;
  yMomentum: number;
}

export interface INoteGrid {}

// App types
export interface Dimensions {
  width: number;
  height: number;
}

export interface AudioData {
  // Waves
  frequencies: Uint8Array;
  uintWave: Uint8Array;
  floatWave: Float32Array;

  // Stream Info
  sampleRate: number;
  hzPerIdx: number;

  // Current volume
  amplitude: number; // 0 - 1
  rms: number; // 0 - 255
  amplitudeAtNote(note: Note): number;

  // Calculated data
  peakFreq: number | null;
  notes: Note[];
}

export interface DeviceOrientation {
  absolute: boolean;
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
}

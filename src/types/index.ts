import {Note} from '../audio/Note';

export interface WorldState {
  dimensions: Dimensions;
  audio: AudioData;
  keysDown: Set<string>;
  keysPressedThisFrame: Set<string>;
  deviceOrientation: DeviceOrientation | undefined;
  mouseClickLocation: IPosition | undefined;
  frameNum: number;
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

export interface IAcceleration {
  xForce: number;
  yForce: number;
}

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

export type CanvasBlendMode =
  | 'source-over'
  | 'source-in'
  | 'source-out'
  | 'source-atop'
  | 'destination-over'
  | 'destination-in'
  | 'destination-out'
  | 'destination-atop'
  | 'lighter'
  | 'copy'
  | 'xor'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

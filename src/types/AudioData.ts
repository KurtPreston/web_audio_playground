import {Note} from '../audio/Note';

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

export const emptyAudioData: AudioData = {
  frequencies: new Uint8Array(),
  uintWave: new Uint8Array(),
  floatWave: new Float32Array(),
  sampleRate: 44100,
  hzPerIdx: 0,
  amplitude: 0,
  rms: 0,
  amplitudeAtNote: () => 0,
  peakFreq: null,
  notes: []
};

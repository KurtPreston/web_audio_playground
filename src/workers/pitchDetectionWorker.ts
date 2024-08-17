import {Remote} from 'comlink';
import {Pitchfinder} from '../pitchfinder/src';
import {PitchDetector} from '../pitchfinder/src/detectors/types';

let pitchDetector: PitchDetector;

export type PitchDetectionWorker = Remote<{
  test: () => Promise<string>;
  detectPitch: (sampleRate: number, wave: Float32Array) => Promise<number | null>;
}>;

export function detectPitch(sampleRate: number, wave: Float32Array): number | null {
  if (!pitchDetector) {
    pitchDetector = Pitchfinder.AMDF({
      sampleRate
    });
  }

  return pitchDetector(wave);
}

export function test() {
  return 'test';
}

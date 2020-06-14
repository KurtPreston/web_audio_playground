/* eslint-disable import/no-webpack-loader-syntax */

// PitchDetectionWorker must be loaded first
import {PitchDetector} from '../pitchfinder/src/detectors/types';
import {PitchDetectionWorker} from '../workers/pitchDetectionWorker';
const pitchDetectionWorkerBuilder = require('workerize-loader!../workers/pitchDetectionWorker');
export const pitchDetectionWorker: PitchDetectionWorker = pitchDetectionWorkerBuilder();

export function workerPitchDetector(sampleRate: number): PitchDetector {
  let currentPromise: Promise<number | null> | null = null;
  let lastDetectedPitch: number | null = null;

  return (wave: Float32Array): number | null => {
    if (!currentPromise) {
      currentPromise = pitchDetectionWorker.detectPitch(sampleRate, wave);
      currentPromise.then((value: number | null) => {
        currentPromise = null;
        lastDetectedPitch = value;
      });
    }
    return lastDetectedPitch;
  };
}

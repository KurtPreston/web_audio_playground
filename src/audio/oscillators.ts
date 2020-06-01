import {random, sample} from 'lodash';
import {SynthOptions} from 'tone';
import {RecursivePartial} from 'tone/build/esm/core/util/Interface';

export type SynthPreset = RecursivePartial<SynthOptions>;

export function randomSustainSynth(): RecursivePartial<SynthOptions> {
  return {
    oscillator: {
      type: sample([
        'sine',
        'sine',
        'sine',
        'sine',
        'triangle',
        'triangle',
        'triangle',
        'square',
        'square',
        'sawtooth'
      ]),
      partialCount: random(0, 10)
    }
  };
}

export const pingOscillator: SynthPreset = {
  oscillator: {
    type: 'triangle'
  },
  envelope: {
    attack: 0.01,
    decay: 0.01,
    sustain: 0.4,
    release: 3.11
  }
};

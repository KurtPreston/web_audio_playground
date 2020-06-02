import {random, sample} from 'lodash';
import {SynthOptions} from 'tone';
import {RecursivePartial} from 'tone/build/esm/core/util/Interface';
import {NonCustomOscillatorType} from 'tone/build/esm/source/oscillator/OscillatorInterface';

export type SynthPreset = RecursivePartial<SynthOptions>;

export function randomSustainOscillator(): NonCustomOscillatorType {
  return sample([
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
  ]) as NonCustomOscillatorType;
}

export function randomSustainSynth(): RecursivePartial<SynthOptions> {
  return {
    oscillator: {
      type: randomSustainOscillator(),
      partialCount: random(0, 10)
    }
  };
}

export const pingOscillator: SynthPreset = {
  oscillator: {
    type: 'triangle'
  },
  envelope: {
    attack: 0.1,
    decay: 0.01,
    sustain: 0.4,
    release: 3.11
  }
};

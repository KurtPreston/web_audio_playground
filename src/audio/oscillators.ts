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
        'triangle',
        'triangle',
        'square'
        // 'saw'
      ]),
      partialCount: random(0, 10)
    }
  };
}

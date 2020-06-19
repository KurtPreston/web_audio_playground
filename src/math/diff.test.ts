import {merge} from 'lodash';
import {CablesOptions} from '../games/Cables/CablesOptions.generated';
import {defaultCablesOptions} from '../games/Cables/defaultCablesOptions';
import {MidiFileOptions} from '../midi/sources/MidiFileSource/MidiFileSourceOptions.generated';
import {diff} from './diff';

describe('diff', () => {
  it('returns the partial diff', () => {
    const a = {
      foo: {
        bar: 1,
        baz: 2
      }
    };

    const b = {
      foo: {
        bar: 3,
        baz: 2
      }
    };

    const partialDiff = diff(a, b);
    expect(partialDiff).toEqual({
      foo: {
        bar: 1
      }
    });

    const applied = merge({}, b, partialDiff);
    expect(applied).toEqual(a);
  });

  it('returns a diff between cables settings', () => {
    const settings: CablesOptions = {
      ...defaultCablesOptions,
      midiSource: {
        source: 'midiFile',
        options: {
          midiFileUri: '/midi/moonlight_sonata.mid'
        } as MidiFileOptions
      },
      synth: {
        ...defaultCablesOptions.synth,
        envelope: {
          ...defaultCablesOptions.synth.envelope,
          sustain: 0.5
        }
      }
    };

    const partialDiff = diff(settings, defaultCablesOptions);

    expect(partialDiff).toEqual({
      midiSource: {
        source: 'midiFile',
        options: {
          midiFileUri: '/midi/moonlight_sonata.mid'
        } as MidiFileOptions
      },
      synth: {
        envelope: {
          sustain: 0.5
        }
      }
    });

    const merged = merge({}, defaultCablesOptions, settings);
    expect(merged).toEqual(settings);
  });
});

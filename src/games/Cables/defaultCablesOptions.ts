import {defaultNoteGraphOptions} from '../../sprites/NoteGraph/NoteGraph';
import {CablesOptions} from './CablesOptions.generated';

export const defaultCablesOptions: CablesOptions = {
  synth: {
    oscillator: {
      type: 'triangle',
      partialCount: 3
    },
    envelope: {
      attack: 0.01,
      attackCurve: 'linear',
      decay: 0.1,
      decayCurve: 'exponential',
      sustain: 0.3,
      release: 1,
      releaseCurve: 'exponential'
    },
    volume: -40
  },
  noteGraph: defaultNoteGraphOptions()
};

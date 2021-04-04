import {Chords} from '../chords';
import {NoteValue} from '../Note';
import {Chart} from './chart';

describe('scaleMelodyGenerator', () => {
  it('generates modes in the key', () => {
    const chart: Chart = {
      key: NoteValue.C,
      chords: [Chords.D.minor, Chords.D.minor, Chords.G.major, Chords.C.major]
    };
  });
});

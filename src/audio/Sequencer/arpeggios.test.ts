import {Note, NoteValue} from '../Note';
import {upDownArp} from './arpeggios';
import {MelodyNote} from './melody';

describe('upDownArp', () => {
  it('generates an ascending then descending arpeggio', () => {
    const actual: MelodyNote[] = upDownArp([NoteValue.C, NoteValue.E, NoteValue.G], 8);

    const expected: Note[] = [
      NoteValue.C,
      NoteValue.E,
      NoteValue.G,
      NoteValue.E,
      NoteValue.C,
      NoteValue.E,
      NoteValue.G,
      NoteValue.E
    ];

    expect(actual).toEqual(
      expected.map(
        (note: NoteValue): MelodyNote => ({
          note,
          beats: 1
        })
      )
    );
  });
});

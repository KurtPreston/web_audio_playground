import {describe, it, expect} from 'vitest';
import {Note, NoteValue} from '../Note';
import {upDownArp} from './arpeggios';
import {MelodyNote} from './melody';

describe('upDownArp', () => {
  it('generates an ascending then descending arpeggio', () => {
    const actual: MelodyNote[] = upDownArp({
      notes: [NoteValue.C, NoteValue.E, NoteValue.G],
      beatsPerNote: 1,
      totalBeats: 8
    });

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

  it('handles Db minor', () => {
    const actual: MelodyNote[] = upDownArp({
      notes: [NoteValue.Dflat, NoteValue.Gflat, NoteValue.Bflat],
      beatsPerNote: 1,
      totalBeats: 4
    });

    const expected: Note[] = [NoteValue.Dflat, NoteValue.Gflat, NoteValue.Bflat, NoteValue.Gflat];

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

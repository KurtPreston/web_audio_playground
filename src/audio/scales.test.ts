import {Chords} from './chords';
import {NoteValue} from './Note';
import {scaleForChord, Scales} from './scales';

describe('majorScale', () => {
  it('computes a major scale', () => {
    expect(Scales.C.Major.notes).toEqual([
      NoteValue.C,
      NoteValue.D,
      NoteValue.E,
      NoteValue.F,
      NoteValue.G,
      NoteValue.A,
      NoteValue.B
    ]);
  });

  it('can generate modes', () => {
    expect(Scales.A.Minor.notes).toEqual([
      NoteValue.A,
      NoteValue.B,
      NoteValue.C + 12,
      NoteValue.D + 12,
      NoteValue.E + 12,
      NoteValue.F + 12,
      NoteValue.G + 12
    ]);

    expect(Scales.D.Lydian.notes).toEqual([
      NoteValue.D,
      NoteValue.E,
      NoteValue.Fsharp,
      NoteValue.Gsharp,
      NoteValue.A,
      NoteValue.B,
      NoteValue.Csharp + 12
    ]);
  });
});

describe.only('scaleForChord', () => {
  it('finds the scale for the chord in the key', () => {
    expect(scaleForChord(NoteValue.C, Chords.D.minor)).toEqual(Scales.D.Dorian);
  });

  it('errors if the chord cannot be found in the scale', () => {
    expect(() => {
      scaleForChord(NoteValue.C, Chords.D.dim);
    }).toThrowError();
  });
});

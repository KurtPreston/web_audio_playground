import {NoteValue} from './Note';
import {Scales} from './scales';

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

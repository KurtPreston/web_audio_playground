import {AllChords, Chord, chordName, dominant7Chord, majorChord} from './chords';
import {NoteValue} from './Note';

const bChord: Chord = {
  notes: [NoteValue.B, NoteValue.Dsharp + 12, NoteValue.Fsharp + 12],
  name: 'B'
};

const asharp7chord: Chord = {
  notes: [NoteValue.Asharp, NoteValue.D + 12, NoteValue.F + 12, NoteValue.Gsharp + 12],
  name: 'A#7'
};

describe('majorChord', () => {
  it('generates major chords', () => {
    expect(majorChord(NoteValue.B)).toEqual(bChord);
  });
});

describe('dominant7Chord', () => {
  it('generates dominant7 chords', () => {
    expect(dominant7Chord(NoteValue.Asharp)).toEqual(asharp7chord);
  });
});

describe('AllChords', () => {
  it('lists all chords', () => {
    const chord = AllChords.find((chord: Chord) => chord.name === 'B');
    expect(chord).toEqual(bChord);
  });
});

describe('chordName', () => {
  it('can name major chords', () => {
    expect(chordName(bChord.notes)).toEqual('B');
  });

  it('can name dominant7 chords', () => {
    expect(chordName(asharp7chord.notes)).toEqual('A#7');
  });
});

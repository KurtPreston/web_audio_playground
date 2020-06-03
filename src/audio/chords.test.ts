import {
  AllChords,
  Chord,
  chordName,
  ChordType,
  dominant7Chord,
  fiveChord,
  major6Chord,
  majorChord,
  minorChord,
  subChords,
  superChords
} from './chords';
import {NoteValue} from './Note';

const bChord: Chord = {
  notes: new Set([NoteValue.B, NoteValue.Dsharp, NoteValue.Fsharp]),
  root: NoteValue.B,
  type: ChordType.major
};

const asharp7chord: Chord = {
  notes: new Set([NoteValue.Asharp, NoteValue.D, NoteValue.F, NoteValue.Gsharp]),
  root: NoteValue.Asharp,
  type: ChordType.dominant7
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
    const chord = AllChords.find(
      (chord: Chord) => chord.root === NoteValue.B && chord.type === ChordType.major
    );
    expect(chord).toEqual(bChord);
  });
});

describe('chordName', () => {
  it('can name major chords', () => {
    expect(chordName(bChord)).toEqual('B');
  });

  it('can name dominant7 chords', () => {
    expect(chordName(asharp7chord)).toEqual('A#7');
  });
});

describe('superChords', () => {
  it('returns chords that are a superset of the chord', () => {
    const c7Chord = dominant7Chord(NoteValue.C);
    const c6Chord = major6Chord(NoteValue.C);
    const cChord = majorChord(NoteValue.C);

    const sups = superChords(Array.from(cChord.notes));
    expect(sups).toContainEqual(c6Chord);
    expect(sups).toContainEqual(c7Chord);
    expect(sups).not.toContainEqual(cChord);
  });

  it('handles 5 chords', () => {
    const b5 = fiveChord(NoteValue.B);
    const bMajor = majorChord(NoteValue.B);
    const bMinor = minorChord(NoteValue.B);
    const sups = superChords(Array.from(b5.notes));
    expect(sups).toContainEqual(bMajor);
    expect(sups).toContainEqual(bMinor);
  });
});

describe('subChords', () => {
  it('returns chords that are a subset of the chord', () => {
    const c6Chord = major6Chord(NoteValue.C);
    const cChord = majorChord(NoteValue.C);

    const subs = subChords(Array.from(c6Chord.notes));
    expect(subs).toContainEqual(cChord);
    expect(subs).not.toContainEqual(c6Chord);
  });

  it('can handle f major 7', () => {
    const fM7 = [52, 53, 57, 60];
    const fMajor = majorChord(NoteValue.F);

    const subs = subChords(fM7);
    expect(subs).toContainEqual(fMajor);
  });
});

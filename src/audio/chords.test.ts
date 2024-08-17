import {describe, it, expect} from 'vitest';
import {
  AllChords,
  Chord,
  Chords,
  ChordType,
  dominant7Chord,
  majorChord,
  subChords,
  superChords
} from './chords';
import {NoteValue} from './Note';

const bChord: Chord = Chords.B.major;

const asharp7chord: Chord = Chords.Asharp.dominant7;

describe('majorChord', () => {
  it('generates major chords', () => {
    expect(majorChord(NoteValue.B, '#')).toEqual(bChord);
  });
});

describe('dominant7Chord', () => {
  it('generates dominant7 chords', () => {
    expect(dominant7Chord(NoteValue.Asharp, '#')).toEqual(asharp7chord);
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
    expect(bChord.name).toEqual('B');
  });

  it('can name dominant7 chords', () => {
    expect(asharp7chord.name).toEqual('A♯7');
  });
});

describe('superChords', () => {
  it('returns chords that are a superset of the chord', () => {
    const c7Chord = Chords.C.dominant7;
    const c6Chord = Chords.C.major6;
    const cChord = Chords.C.major;

    const sups = superChords(Array.from(cChord.notes));
    expect(sups).toContainEqual(c6Chord);
    expect(sups).toContainEqual(c7Chord);
    expect(sups).not.toContainEqual(cChord);
  });

  it('handles 5 chords', () => {
    const b5 = Chords.B.five;
    const bMajor = Chords.B.major;
    const bMinor = Chords.B.minor;
    const sups = superChords(Array.from(b5.notes));
    expect(sups).toContainEqual(bMajor);
    expect(sups).toContainEqual(bMinor);
  });
});

describe('subChords', () => {
  it('returns chords that are a subset of the chord', () => {
    const c6Chord = Chords.C.major6;
    const cChord = Chords.C.major;

    const subs = subChords(Array.from(c6Chord.notes));
    expect(subs).toContainEqual(cChord);
    expect(subs).not.toContainEqual(c6Chord);
  });

  it('can handle f major 7', () => {
    const fM7 = [52, 53, 57, 60];
    const fMajor = Chords.F.major;

    const subs = subChords(fM7);
    expect(subs).toContainEqual(fMajor);
  });
});

import {ChordProgression} from './chordProgression';
import {Chord, ChordGenerator, ChordType} from './chords';
import {NoteAccidental, NoteValue} from './Note';

export const accidentalForKey: {[note in NoteValue]: NoteAccidental} = {
  [NoteValue.C]: 'b',
  [NoteValue.G]: '#',
  [NoteValue.D]: '#',
  [NoteValue.A]: '#',
  [NoteValue.E]: '#',
  [NoteValue.B]: '#',
  [NoteValue.Fsharp]: '#',
  [NoteValue.Dflat]: 'b',
  [NoteValue.Aflat]: 'b',
  [NoteValue.Eflat]: 'b',
  [NoteValue.Bflat]: 'b',
  [NoteValue.F]: 'b'
};

export const majorScale: ChordGenerator = (root: NoteValue, accidental: NoteAccidental): Chord => {
  const offsets = [0, 2, 4, 5, 7, 9, 11];

  return new Chord({
    type: ChordType.major,
    notes: offsets.map((offset) => root + offset),
    root,
    accidental
  });
};

export const majorScaleProgression: ChordProgression = (key: NoteValue): Chord[] => {
  const accidental: NoteAccidental = accidentalForKey[key];
  const scale = majorScale(key, accidental);
  return new Array(4).fill(scale);
};

export const minorScale: ChordGenerator = (root: NoteValue, accidental: NoteAccidental): Chord => {
  const offsets = [0, 2, 3, 5, 7, 8, 10];

  return new Chord({
    type: ChordType.minor,
    notes: offsets.map((offset) => root + offset),
    root,
    accidental
  });
};

export const minorScaleProgression: ChordProgression = (key: NoteValue): Chord[] => {
  const accidental: NoteAccidental = accidentalForKey[key];
  const scale = minorScale(key, accidental);
  return new Array(4).fill(scale);
};

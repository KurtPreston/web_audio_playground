import {autobind} from 'core-decorators';
import {flatten, random, sample, times, uniq} from 'lodash';
import {getNoteName, Note, NoteAccidental, noteToNoteValue, NoteValue} from './Note';
import {accidentalForKey} from './scales';

export enum ChordType {
  major = 'major',
  minor = 'minor',
  major7 = 'major7',
  dominant7 = 'dominant7',
  minor7 = 'minor7',
  minor6 = 'minor6',
  major6 = 'major6',
  sus2 = 'sus2',
  sus4 = 'sus4',
  five = 'five',
  dim = 'dim',
  dim7 = 'dim7',
  halfdim = 'halfdim'
}

@autobind
export class Chord {
  public readonly root: NoteValue;
  public readonly type: ChordType;
  public readonly notes: Note[];
  public readonly noteValues: Set<NoteValue>;
  public readonly accidental: NoteAccidental;

  constructor(params: {
    type: ChordType;
    root: NoteValue;
    notes: NoteValue[];
    accidental: NoteAccidental;
  }) {
    const {type, root, notes} = params;
    const octaveOffset = root - noteToNoteValue(root);

    this.accidental = params.accidental;
    this.type = type;
    this.root = root + octaveOffset;
    this.notes = notes.map((note) => note - octaveOffset);
    this.noteValues = new Set(params.notes.map(noteToNoteValue));
  }

  public get name(): string {
    const noteName = getNoteName(this.root, {
      octave: false,
      accidental: this.accidental
    });
    return `${noteName}${chordTypeSymbol[this.type]}`;
  }

  public trebleClefChord(): Note[] {
    return this.notes.map((note: Note) => note + 5 * 12);
  }

  public get fifth(): Note {
    if (this.notes.length === 2) {
      return this.notes[1];
    } else {
      return this.notes[2];
    }
  }
}

const chordTypeSymbol: {[type in ChordType]: string} = {
  [ChordType.major]: '',
  [ChordType.minor]: 'm',
  [ChordType.major7]: '∆7',
  [ChordType.dominant7]: '7',
  [ChordType.minor7]: 'm7',
  [ChordType.minor6]: 'm6',
  [ChordType.major6]: '6',
  [ChordType.sus2]: 'sus2',
  [ChordType.sus4]: 'sus4',
  [ChordType.five]: '5',
  [ChordType.dim]: 'o',
  [ChordType.dim7]: 'o7',
  [ChordType.halfdim]: 'ø7'
};

export type ChordGenerator = (rootNote: NoteValue, accidental: NoteAccidental) => Chord;

export const majorChord: ChordGenerator = (root: NoteValue, accidental: NoteAccidental): Chord => {
  const third = root + 4;
  const fifth = root + 7;

  return new Chord({
    type: ChordType.major,
    notes: [root, third, fifth],
    root,
    accidental
  });
};

export const major7Chord: ChordGenerator = (root: NoteValue, accidental: NoteAccidental): Chord => {
  const third = root + 4;
  const fifth = root + 7;
  const seventh = root + 11;

  return new Chord({
    type: ChordType.major7,
    notes: [root, third, fifth, seventh],
    root,
    accidental
  });
};

export const major6Chord: ChordGenerator = (root: NoteValue, accidental: NoteAccidental): Chord => {
  const third = root + 4;
  const fifth = root + 7;
  const sixth = root + 9;

  return new Chord({
    type: ChordType.major6,
    notes: [root, third, fifth, sixth],
    root,
    accidental
  });
};

export const dominant7Chord: ChordGenerator = (
  root: NoteValue,
  accidental: NoteAccidental
): Chord => {
  const third = root + 4;
  const fifth = root + 7;
  const seventh = root + 10;

  return new Chord({
    type: ChordType.dominant7,
    notes: [root, third, fifth, seventh],
    root,
    accidental
  });
};

export const minorChord: ChordGenerator = (root: NoteValue, accidental: NoteAccidental): Chord => {
  const third = root + 3;
  const fifth = root + 7;

  return new Chord({
    type: ChordType.minor,
    notes: [root, third, fifth],
    root,
    accidental
  });
};

export const minor6Chord: ChordGenerator = (root: NoteValue, accidental: NoteAccidental): Chord => {
  const third = root + 3;
  const fifth = root + 7;
  const sixth = root + 8;

  return new Chord({
    type: ChordType.minor6,
    notes: [root, third, fifth, sixth],
    root,
    accidental
  });
};

export const minor7Chord: ChordGenerator = (root: NoteValue, accidental: NoteAccidental): Chord => {
  const third = root + 3;
  const fifth = root + 7;
  const seventh = root + 10;

  return new Chord({
    type: ChordType.minor7,
    notes: [root, third, fifth, seventh],
    root,
    accidental
  });
};

export const sus4Chord: ChordGenerator = (root: NoteValue, accidental: NoteAccidental): Chord => {
  const fourth = root + 5;
  const fifth = root + 7;

  return new Chord({
    type: ChordType.sus4,
    notes: [root, fourth, fifth],
    root,
    accidental
  });
};

export const sus2Chord: ChordGenerator = (root: NoteValue, accidental: NoteAccidental): Chord => {
  const second = root + 2;
  const fifth = root + 7;

  return new Chord({
    type: ChordType.sus2,
    notes: [root, second, fifth],
    root,
    accidental
  });
};

export const fiveChord: ChordGenerator = (root: NoteValue, accidental: NoteAccidental): Chord => {
  const fifth = root + 7;

  return new Chord({
    type: ChordType.five,
    notes: [root, fifth],
    root,
    accidental
  });
};

export const dimChord: ChordGenerator = (root: NoteValue, accidental: NoteAccidental): Chord => {
  const third = root + 3;
  const flatFive = root + 6;

  return new Chord({
    type: ChordType.dim,
    notes: [root, third, flatFive],
    root,
    accidental
  });
};

export const dim7Chord: ChordGenerator = (root: NoteValue, accidental: NoteAccidental): Chord => {
  const third = root + 3;
  const flatFive = root + 6;
  const flatSeven = root + 9;

  return new Chord({
    type: ChordType.dim7,
    notes: [root, third, flatFive, flatSeven],
    root,
    accidental
  });
};

export const halfdim: ChordGenerator = (root: NoteValue, accidental: NoteAccidental): Chord => {
  const third = root + 3;
  const flatFive = root + 6;
  const seven = root + 10;

  return new Chord({
    type: ChordType.halfdim,
    notes: [root, third, flatFive, seven],
    root,
    accidental
  });
};

const chordGenerators: ChordGenerator[] = [
  // 4-note chords
  major7Chord,
  dominant7Chord,
  major6Chord,
  minor7Chord,
  minor6Chord,

  // 3-note chords
  majorChord,
  minorChord,
  sus4Chord,
  sus2Chord,

  // 2-note "chords"
  fiveChord
];

// List of all chords for lookup in chordsMatching
export const AllChords: Chord[] = flatten(
  times(12, (root: NoteValue) => {
    return chordGenerators.map((chordGen) => chordGen(root, accidentalForKey[root]));
  })
);

// Return all chords that exactly match the notes
export function chordsMatching(notes: Note[]): Chord[] {
  const inputNoteValues: NoteValue[] = normalizeChord(notes);
  return AllChords.filter(
    ({noteValues}: Chord) =>
      inputNoteValues.length === noteValues.size &&
      inputNoteValues.every((nv) => noteValues.has(nv))
  );
}

// Returns chords containing these notes and more
export function superChords(notes: Note[]): Chord[] {
  const inputNoteValues: NoteValue[] = normalizeChord(notes);
  return AllChords.filter(
    ({noteValues}: Chord) =>
      noteValues.size > inputNoteValues.length && inputNoteValues.every((nv) => noteValues.has(nv))
  );
}

// Return chords containing a subset of the notes in this chord
export function subChords(notes: Note[]): Chord[] {
  const inputNoteValues: NoteValue[] = normalizeChord(notes);
  return AllChords.filter(
    ({noteValues}: Chord) =>
      noteValues.size < inputNoteValues.length &&
      Array.from(noteValues).every((nv) => inputNoteValues.includes(nv))
  );
}

export function randomChord(rootNote?: NoteValue): Chord {
  const chordGenerator: ChordGenerator = sample(chordGenerators) as ChordGenerator;
  const root: NoteValue = rootNote || random(0, 12);
  return chordGenerator(root, accidentalForKey[root]);
}

export function normalizeChord(notes: Note[]): NoteValue[] {
  return uniq(notes.map(noteToNoteValue));
}

export type ChordSet = {[type in ChordType]: Chord};

function chordSetFor(root: NoteValue, accidental: NoteAccidental): ChordSet {
  return {
    major: majorChord(root, accidental),
    minor: minorChord(root, accidental),
    major7: major7Chord(root, accidental),
    dominant7: dominant7Chord(root, accidental),
    minor7: minor7Chord(root, accidental),
    minor6: minor6Chord(root, accidental),
    major6: major6Chord(root, accidental),
    sus2: sus2Chord(root, accidental),
    sus4: sus4Chord(root, accidental),
    five: fiveChord(root, accidental),
    dim: dimChord(root, accidental),
    dim7: dim7Chord(root, accidental),
    halfdim: halfdim(root, accidental)
  };
}

export const Chords = {
  A: chordSetFor(NoteValue.A, '#'),
  Asharp: chordSetFor(NoteValue.Asharp, '#'),
  Bflat: chordSetFor(NoteValue.Bflat, 'b'),
  B: chordSetFor(NoteValue.B, '#'),
  C: chordSetFor(NoteValue.C, 'b'),
  Csharp: chordSetFor(NoteValue.Csharp, '#'),
  Dflat: chordSetFor(NoteValue.Dflat, 'b'),
  D: chordSetFor(NoteValue.D, '#'),
  Dsharp: chordSetFor(NoteValue.Dsharp, '#'),
  Eflat: chordSetFor(NoteValue.Eflat, 'b'),
  E: chordSetFor(NoteValue.E, '#'),
  F: chordSetFor(NoteValue.F, 'b'),
  Fsharp: chordSetFor(NoteValue.Fsharp, '#'),
  Gflat: chordSetFor(NoteValue.Gflat, 'b'),
  G: chordSetFor(NoteValue.G, '#'),
  Gsharp: chordSetFor(NoteValue.Gsharp, '#')
};

export const SampleProgression: Chord[] = [Chords.C.major, Chords.A.minor];

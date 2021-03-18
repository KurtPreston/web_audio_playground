import {flatten, random, sample, times, uniq} from 'lodash';
import {getNoteName, Note, noteToNoteValue, NoteValue} from './Note';

export class Chord {
  public readonly root: NoteValue;
  public readonly type: ChordType;
  public readonly notes: Note[];
  public readonly noteValues: Set<NoteValue>;

  constructor(params: {type: ChordType; root: NoteValue; notes: NoteValue[]}) {
    this.type = params.type;
    this.root = params.root;
    this.notes = params.notes;
    this.noteValues = new Set(params.notes.map(noteToNoteValue));
  }

  public get name(): string {
    return `${getNoteName(this.root)}${chordTypeSymbol[this.type]}`;
  }
}

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

const chordTypeSymbol: {[type in ChordType]: string} = {
  [ChordType.major]: '',
  [ChordType.minor]: 'm',
  [ChordType.major7]: '△7',
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

export type ChordGenerator = (rootNote: Note) => Chord;

export const majorChord: ChordGenerator = (root: NoteValue): Chord => {
  const third = root + 4;
  const fifth = root + 7;

  return new Chord({
    type: ChordType.major,
    notes: [root, third, fifth],
    root
  });
};

export const major7Chord: ChordGenerator = (root: NoteValue): Chord => {
  const third = root + 4;
  const fifth = root + 7;
  const seventh = root + 11;

  return new Chord({
    type: ChordType.major7,
    notes: [root, third, fifth, seventh],
    root
  });
};

export const major6Chord: ChordGenerator = (root: NoteValue): Chord => {
  const third = root + 4;
  const fifth = root + 7;
  const sixth = root + 9;

  return new Chord({
    type: ChordType.major6,
    notes: [root, third, fifth, sixth],
    root
  });
};

export const dominant7Chord: ChordGenerator = (root: NoteValue): Chord => {
  const third = root + 4;
  const fifth = root + 7;
  const seventh = root + 10;

  return new Chord({
    type: ChordType.dominant7,
    notes: [root, third, fifth, seventh],
    root
  });
};

export const minorChord: ChordGenerator = (root: NoteValue): Chord => {
  const third = root + 3;
  const fifth = root + 7;

  return new Chord({
    type: ChordType.minor,
    notes: [root, third, fifth],
    root
  });
};

export const minor6Chord: ChordGenerator = (root: NoteValue): Chord => {
  const third = root + 3;
  const fifth = root + 7;
  const sixth = root + 8;

  return new Chord({
    type: ChordType.minor6,
    notes: [root, third, fifth, sixth],
    root
  });
};

export const minor7Chord: ChordGenerator = (root: NoteValue): Chord => {
  const third = root + 3;
  const fifth = root + 7;
  const seventh = root + 10;

  return new Chord({
    type: ChordType.minor7,
    notes: [root, third, fifth, seventh],
    root
  });
};

export const sus4Chord: ChordGenerator = (root: NoteValue): Chord => {
  const fourth = root + 5;
  const fifth = root + 7;

  return new Chord({
    type: ChordType.sus4,
    notes: [root, fourth, fifth],
    root
  });
};

export const sus2Chord: ChordGenerator = (root: NoteValue): Chord => {
  const second = root + 2;
  const fifth = root + 7;

  return new Chord({
    type: ChordType.sus2,
    notes: [root, second, fifth],
    root
  });
};

export const fiveChord: ChordGenerator = (root: NoteValue): Chord => {
  const fifth = root + 7;

  return new Chord({
    type: ChordType.five,
    notes: [root, fifth],
    root
  });
};

export const dimChord: ChordGenerator = (root: NoteValue): Chord => {
  const third = root + 3;
  const flatFive = root + 6;

  return new Chord({
    type: ChordType.dim,
    notes: [root, third, flatFive],
    root
  });
};

export const dim7Chord: ChordGenerator = (root: NoteValue): Chord => {
  const third = root + 3;
  const flatFive = root + 6;
  const flatSeven = root + 9;

  return new Chord({
    type: ChordType.dim7,
    notes: [root, third, flatFive, flatSeven],
    root
  });
};

export const halfdim: ChordGenerator = (root: NoteValue): Chord => {
  const third = root + 3;
  const flatFive = root + 6;
  const seven = root + 10;

  return new Chord({
    type: ChordType.halfdim,
    notes: [root, third, flatFive, seven],
    root
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
  times(12, (root: Note) => {
    return chordGenerators.map((chordGen) => chordGen(root));
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

export function randomChord(rootNote?: Note): Chord {
  const chordGenerator: ChordGenerator = sample(chordGenerators) as ChordGenerator;
  const root: Note = rootNote || random(0, 12);
  return chordGenerator(root);
}

export function normalizeChord(notes: Note[]): NoteValue[] {
  return uniq(notes.map(noteToNoteValue));
}

export type ChordSet = {[type in ChordType]: Chord};

function chordSetFor(root: NoteValue): ChordSet {
  return {
    major: majorChord(root),
    minor: minorChord(root),
    major7: major7Chord(root),
    dominant7: dominant7Chord(root),
    minor7: minor7Chord(root),
    minor6: minor6Chord(root),
    major6: major6Chord(root),
    sus2: sus2Chord(root),
    sus4: sus4Chord(root),
    five: fiveChord(root),
    dim: dimChord(root),
    dim7: dim7Chord(root),
    halfdim: halfdim(root)
  };
}

export const Chords = {
  A: chordSetFor(NoteValue.A),
  Asharp: chordSetFor(NoteValue.Asharp),
  Bflat: chordSetFor(NoteValue.Bflat),
  B: chordSetFor(NoteValue.B),
  C: chordSetFor(NoteValue.C),
  Csharp: chordSetFor(NoteValue.Csharp),
  Dflat: chordSetFor(NoteValue.Dflat),
  D: chordSetFor(NoteValue.D),
  Dsharp: chordSetFor(NoteValue.Dsharp),
  Eflat: chordSetFor(NoteValue.Eflat),
  F: chordSetFor(NoteValue.F),
  Fsharp: chordSetFor(NoteValue.Fsharp),
  Gflat: chordSetFor(NoteValue.Gflat),
  G: chordSetFor(NoteValue.G),
  Gsharp: chordSetFor(NoteValue.Gsharp)
};

(window as any).Chords = Chords;

export const SampleProgression: Chord[] = [Chords.C.major, Chords.A.minor];

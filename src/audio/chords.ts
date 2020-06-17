import {flatten, random, sample, times, uniq} from 'lodash';
import {getNoteName, Note, noteToNoteValue, NoteValue} from './Note';

export interface Chord {
  type: ChordType;
  root: NoteValue;
  notes: Set<NoteValue>;
}

export enum ChordType {
  major,
  minor,
  major7,
  dominant7,
  minor7,
  minor6,
  major6,
  sus2,
  sus4,
  five,
  dim,
  dim7,
  halfdim
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
  const third = noteToNoteValue(root + 4);
  const fifth = noteToNoteValue(root + 7);

  return {
    type: ChordType.major,
    notes: new Set<NoteValue>([root, third, fifth]),
    root
  };
};

export const major7Chord: ChordGenerator = (root: NoteValue): Chord => {
  const third = noteToNoteValue(root + 4);
  const fifth = noteToNoteValue(root + 7);
  const seventh = noteToNoteValue(root + 11);

  return {
    type: ChordType.major7,
    notes: new Set<NoteValue>([root, third, fifth, seventh]),
    root
  };
};

export const major6Chord: ChordGenerator = (root: NoteValue): Chord => {
  const third = noteToNoteValue(root + 4);
  const fifth = noteToNoteValue(root + 7);
  const sixth = noteToNoteValue(root + 9);

  return {
    type: ChordType.major6,
    notes: new Set<NoteValue>([root, third, fifth, sixth]),
    root
  };
};

export const dominant7Chord: ChordGenerator = (root: NoteValue): Chord => {
  const third = noteToNoteValue(root + 4);
  const fifth = noteToNoteValue(root + 7);
  const seventh = noteToNoteValue(root + 10);

  return {
    type: ChordType.dominant7,
    notes: new Set<NoteValue>([root, third, fifth, seventh]),
    root
  };
};

export const minorChord: ChordGenerator = (root: NoteValue): Chord => {
  const third = noteToNoteValue(root + 3);
  const fifth = noteToNoteValue(root + 7);

  return {
    type: ChordType.minor,
    notes: new Set<NoteValue>([root, third, fifth]),
    root
  };
};

export const minor6Chord: ChordGenerator = (root: NoteValue): Chord => {
  const third = noteToNoteValue(root + 3);
  const fifth = noteToNoteValue(root + 7);
  const sixth = noteToNoteValue(root + 8);

  return {
    type: ChordType.minor6,
    notes: new Set<NoteValue>([root, third, fifth, sixth]),
    root
  };
};

export const minor7Chord: ChordGenerator = (root: NoteValue): Chord => {
  const third = noteToNoteValue(root + 3);
  const fifth = noteToNoteValue(root + 7);
  const seventh = noteToNoteValue(root + 10);

  return {
    type: ChordType.minor7,
    notes: new Set<NoteValue>([root, third, fifth, seventh]),
    root
  };
};

export const sus4Chord: ChordGenerator = (root: NoteValue): Chord => {
  const fourth = noteToNoteValue(root + 5);
  const fifth = noteToNoteValue(root + 7);

  return {
    type: ChordType.sus4,
    notes: new Set<NoteValue>([root, fourth, fifth]),
    root
  };
};

export const sus2Chord: ChordGenerator = (root: NoteValue): Chord => {
  const second = noteToNoteValue(root + 2);
  const fifth = noteToNoteValue(root + 7);

  return {
    type: ChordType.sus2,
    notes: new Set<NoteValue>([root, second, fifth]),
    root
  };
};

export const fiveChord: ChordGenerator = (root: NoteValue): Chord => {
  const fifth = noteToNoteValue(root + 7);

  return {
    type: ChordType.five,
    notes: new Set<NoteValue>([root, fifth]),
    root
  };
};

export const dimChord: ChordGenerator = (root: NoteValue): Chord => {
  const third = noteToNoteValue(root + 3);
  const flatFive = noteToNoteValue(root + 6);

  return {
    type: ChordType.dim,
    notes: new Set<NoteValue>([root, third, flatFive]),
    root
  };
};

export const dim7Chord: ChordGenerator = (root: NoteValue): Chord => {
  const third = noteToNoteValue(root + 3);
  const flatFive = noteToNoteValue(root + 6);
  const flatSeven = noteToNoteValue(root + 9);

  return {
    type: ChordType.dim7,
    notes: new Set<NoteValue>([root, third, flatFive, flatSeven]),
    root
  };
};

export const halfdim: ChordGenerator = (root: NoteValue): Chord => {
  const third = noteToNoteValue(root + 3);
  const flatFive = noteToNoteValue(root + 6);
  const seven = noteToNoteValue(root + 10);

  return {
    type: ChordType.halfdim,
    notes: new Set<NoteValue>([root, third, flatFive, seven]),
    root
  };
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

// List of all chords for lookup in chordName
export const AllChords: Chord[] = flatten(
  times(12, (root: Note) => {
    return chordGenerators.map((chordGen) => chordGen(root));
  })
);

// Return all chords that exactly match the notes
export function chordsMatching(notes: Note[]): Chord[] {
  const noteValues: NoteValue[] = normalizeChord(notes);
  return AllChords.filter(
    ({notes}: Chord) => noteValues.length === notes.size && noteValues.every((nv) => notes.has(nv))
  );
}

// Returns chords containing these notes and more
export function superChords(notes: Note[]): Chord[] {
  const noteValues: NoteValue[] = normalizeChord(notes);
  return AllChords.filter(
    ({notes}: Chord) => notes.size > noteValues.length && noteValues.every((nv) => notes.has(nv))
  );
}

// Return chords containing a subset of the notes in this chord
export function subChords(notes: Note[]): Chord[] {
  const noteValues: NoteValue[] = normalizeChord(notes);
  return AllChords.filter(
    ({notes}: Chord) =>
      notes.size < noteValues.length && Array.from(notes).every((nv) => noteValues.includes(nv))
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

export function chordName(chord: Chord): string {
  return `${getNoteName(chord.root)}${chordTypeSymbol[chord.type]}`;
}

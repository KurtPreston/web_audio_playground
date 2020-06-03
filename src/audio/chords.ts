import {flatten, random, sample, times, uniq} from 'lodash';
import {getNoteName, Note, noteToNoteValue, NoteValue} from './Note';

export interface Chord {
  name: string;
  root: NoteValue;
  notes: Set<NoteValue>;
}

export type ChordGenerator = (rootNote: Note) => Chord;

export const majorChord: ChordGenerator = (root: NoteValue): Chord => {
  const third = noteToNoteValue(root + 4);
  const fifth = noteToNoteValue(root + 7);

  return {
    name: `${getNoteName(root)}`,
    notes: new Set<NoteValue>([root, third, fifth]),
    root
  };
};

export const major7Chord: ChordGenerator = (root: NoteValue): Chord => {
  const third = noteToNoteValue(root + 4);
  const fifth = noteToNoteValue(root + 7);
  const seventh = noteToNoteValue(root + 11);

  return {
    name: `${getNoteName(root)}△7`,
    notes: new Set<NoteValue>([root, third, fifth, seventh]),
    root
  };
};

export const major6Chord: ChordGenerator = (root: NoteValue): Chord => {
  const third = noteToNoteValue(root + 4);
  const fifth = noteToNoteValue(root + 7);
  const sixth = noteToNoteValue(root + 9);

  return {
    name: `${getNoteName(root)}6`,
    notes: new Set<NoteValue>([root, third, fifth, sixth]),
    root
  };
};

export const dominant7Chord: ChordGenerator = (root: NoteValue): Chord => {
  const third = noteToNoteValue(root + 4);
  const fifth = noteToNoteValue(root + 7);
  const seventh = noteToNoteValue(root + 10);

  return {
    name: `${getNoteName(root)}7`,
    notes: new Set<NoteValue>([root, third, fifth, seventh]),
    root
  };
};

export const minorChord: ChordGenerator = (root: NoteValue): Chord => {
  const third = noteToNoteValue(root + 3);
  const fifth = noteToNoteValue(root + 7);

  return {
    name: `${getNoteName(root)}m`,
    notes: new Set<NoteValue>([root, third, fifth]),
    root
  };
};

export const minor6Chord: ChordGenerator = (root: NoteValue): Chord => {
  const third = noteToNoteValue(root + 3);
  const fifth = noteToNoteValue(root + 7);
  const sixth = noteToNoteValue(root + 8);

  return {
    name: `${getNoteName(root)}m6`,
    notes: new Set<NoteValue>([root, third, fifth, sixth]),
    root
  };
};

export const minor7Chord: ChordGenerator = (root: NoteValue): Chord => {
  const third = noteToNoteValue(root + 3);
  const fifth = noteToNoteValue(root + 7);
  const seventh = noteToNoteValue(root + 10);

  return {
    name: `${getNoteName(root)}m7`,
    notes: new Set<NoteValue>([root, third, fifth, seventh]),
    root
  };
};

export const sus4Chord: ChordGenerator = (root: NoteValue): Chord => {
  const fourth = noteToNoteValue(root + 5);
  const fifth = noteToNoteValue(root + 7);

  return {
    name: `${getNoteName(root)}sus4`,
    notes: new Set<NoteValue>([root, fourth, fifth]),
    root
  };
};

export const sus2Chord: ChordGenerator = (root: NoteValue): Chord => {
  const second = noteToNoteValue(root + 2);
  const fifth = noteToNoteValue(root + 7);

  return {
    name: `${getNoteName(root)}sus2`,
    notes: new Set<NoteValue>([root, second, fifth]),
    root
  };
};

export const fiveChord: ChordGenerator = (root: NoteValue): Chord => {
  const fifth = noteToNoteValue(root + 7);

  return {
    name: `${getNoteName(root)}5`,
    notes: new Set<NoteValue>([root, fifth]),
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

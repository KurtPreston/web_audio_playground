import {flatten, isEqual, random, sample, sortBy, times} from 'lodash';
import {mod} from '../math/mod';
import {getNoteName, Note} from './Note';

export interface Chord {
  name: string;
  notes: Note[];
}

export type ChordGenerator = (rootNote: Note, inversion?: Inversion) => Chord;
export type Inversion = 0 | 1 | 2;
export interface ChordOptions {
  inversion?: Inversion;
  seventh?: boolean;
  octave?: boolean;
}

export const majorChord: ChordGenerator = (root: Note, inversion: Inversion = 0): Chord => {
  const third = root + 4;
  const fifth = root + 7;

  switch (inversion) {
    case 0: {
      return {
        notes: [root, third, fifth],
        name: `${getNoteName(root)}`
      };
    }
    case 1: {
      return {
        notes: [third, fifth, root + 12],
        name: `${getNoteName(root)}/${getNoteName(third)}`
      };
    }
    case 2: {
      return {
        notes: [fifth - 12, root, third],
        name: `${getNoteName(root)}/${getNoteName(fifth)}`
      };
    }
  }
};

export const major7Chord: ChordGenerator = (root: Note, inversion: Inversion = 0): Chord => {
  const third = root + 4;
  const fifth = root + 7;
  const seventh = root + 11;

  switch (inversion) {
    case 0: {
      return {
        notes: [root, third, fifth, seventh],
        name: `${getNoteName(root)}△7`
      };
    }
    case 1: {
      return {
        notes: [third, fifth, seventh, root + 12],
        name: `${getNoteName(root)}△7/${getNoteName(third)}`
      };
    }
    case 2: {
      return {
        notes: [fifth - 12, seventh - 12, root, third],
        name: `${getNoteName(root)}△7/${getNoteName(fifth)}`
      };
    }
  }
};

export const major6Chord: ChordGenerator = (root: Note, inversion: Inversion = 0): Chord => {
  const third = root + 4;
  const fifth = root + 7;
  const seventh = root + 11;

  switch (inversion) {
    case 0: {
      return {
        notes: [root, third, fifth, seventh],
        name: `${getNoteName(root)}6`
      };
    }
    case 1: {
      return {
        notes: [third, fifth, seventh, root + 12],
        name: `${getNoteName(root)}6/${getNoteName(third)}`
      };
    }
    case 2: {
      return {
        notes: [fifth - 12, seventh - 12, root, third],
        name: `${getNoteName(root)}6/${getNoteName(fifth)}`
      };
    }
  }
};

export const dominant7Chord: ChordGenerator = (root: Note, inversion: Inversion = 0): Chord => {
  const third = root + 4;
  const fifth = root + 7;
  const seventh = root + 10;

  switch (inversion) {
    case 0: {
      return {
        notes: [root, third, fifth, seventh],
        name: `${getNoteName(root)}7`
      };
    }
    case 1: {
      return {
        notes: [third, fifth, seventh, root + 12],
        name: `${getNoteName(root)}7/${getNoteName(third)}`
      };
    }
    case 2: {
      return {
        notes: [fifth - 12, seventh - 12, root, third],
        name: `${getNoteName(root)}7/${getNoteName(fifth)}`
      };
    }
  }
};

export const minorChord: ChordGenerator = (root: Note, inversion: Inversion = 0): Chord => {
  const third = root + 3;
  const fifth = root + 7;

  switch (inversion) {
    case 0: {
      return {
        notes: [root, third, fifth],
        name: `${getNoteName(root)}m`
      };
    }
    case 1: {
      return {
        notes: [third, fifth, root + 12],
        name: `${getNoteName(root)}m/${getNoteName(third)}`
      };
    }
    case 2: {
      return {
        notes: [fifth - 12, root, third],
        name: `${getNoteName(root)}m/${getNoteName(fifth)}`
      };
    }
  }
};

export const minor6Chord: ChordGenerator = (root: Note, inversion: Inversion = 0): Chord => {
  const third = root + 3;
  const fifth = root + 7;
  const sixth = root + 8;

  switch (inversion) {
    case 0: {
      return {
        notes: [root, third, fifth, sixth],
        name: `${getNoteName(root)}m6`
      };
    }
    case 1: {
      return {
        notes: [third, fifth, sixth, root + 12],
        name: `${getNoteName(root)}m6/${getNoteName(third)}`
      };
    }
    case 2: {
      return {
        notes: [fifth - 12, sixth - 12, root, third],
        name: `${getNoteName(root)}m6/${getNoteName(fifth)}`
      };
    }
  }
};

export const minor7Chord: ChordGenerator = (root: Note, inversion: Inversion = 0): Chord => {
  const third = root + 3;
  const fifth = root + 7;
  const seventh = root + 10;

  switch (inversion) {
    case 0: {
      return {
        notes: [root, third, fifth, seventh],
        name: `${getNoteName(root)}m7`
      };
    }
    case 1: {
      return {
        notes: [third, fifth, seventh, root + 12],
        name: `${getNoteName(root)}m7/${getNoteName(third)}`
      };
    }
    case 2: {
      return {
        notes: [fifth - 12, seventh - 12, root, third],
        name: `${getNoteName(root)}m7/${getNoteName(fifth)}`
      };
    }
  }
};

export const fiveChord: ChordGenerator = (root: Note): Chord => {
  const fifth = root + 7;

  return {
    notes: [root, fifth],
    name: `${getNoteName(root)}5`
  };
};

// Pseudo-chord generator
export const randomNotes: ChordGenerator = (): Chord => {
  const notes: Note[] = times(random(2, 5), () => random(36, 60));

  return {
    notes,
    name: chordName(notes) || '?'
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
export function chordsMatching(notes: Note[]) {
  const modNotes = normalizeChord(notes);
  return AllChords.filter((chord: Chord) => isEqual(normalizeChord(chord.notes), modNotes));
}

export function chordsContaining(notes: Note[]) {
  return AllChords.filter((chord: Chord) => notes.every((note) => chord.notes.includes(note)));
}

export function chordName(notes: Note[]): string | null {
  const chords: Chord[] = chordsMatching(notes);
  if (chords.length >= 1) {
    // Find one matching root note if possible
    const root: Note = mod(notes[0], 12);
    const bestMatch = chords.find((chord: Chord) => mod(chord.notes[0], 12) === root);
    if (bestMatch) {
      return bestMatch.name;
    } else {
      return `${chords[0].name}/${getNoteName(root)}`;
    }
  } else {
    return null;
  }
}

export function randomChord(rootNote?: Note): Chord {
  const chordGenerator: ChordGenerator = sample([
    ...chordGenerators,
    randomNotes
  ]) as ChordGenerator;
  const root: Note = rootNote || random(36, 60);
  const inversion: Inversion = random(0, 2) as Inversion;
  return chordGenerator(root, inversion);
}

function normalizeChord(notes: Note[]): Note[] {
  return sortBy(notes.map((note: Note) => mod(note, 12)));
}

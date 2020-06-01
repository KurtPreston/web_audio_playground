import {flatten, random, sample, times} from 'lodash';
import {Note, noteLetter} from './Note';

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
        name: `${noteLetter(root)}`
      };
    }
    case 1: {
      return {
        notes: [third, fifth, root + 12],
        name: `${noteLetter(root)}/${noteLetter(third)}`
      };
    }
    case 2: {
      return {
        notes: [fifth - 12, root, third],
        name: `${noteLetter(root)}/${noteLetter(fifth)}`
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
        name: `${noteLetter(root)}△7`
      };
    }
    case 1: {
      return {
        notes: [third, fifth, seventh, root + 12],
        name: `${noteLetter(root)}△7/${noteLetter(third)}`
      };
    }
    case 2: {
      return {
        notes: [fifth - 12, seventh - 12, root, third],
        name: `${noteLetter(root)}△7/${noteLetter(fifth)}`
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
        name: `${noteLetter(root)}7`
      };
    }
    case 1: {
      return {
        notes: [third, fifth, seventh, root + 12],
        name: `${noteLetter(root)}7/${noteLetter(third)}`
      };
    }
    case 2: {
      return {
        notes: [fifth - 12, seventh - 12, root, third],
        name: `${noteLetter(root)}7/${noteLetter(fifth)}`
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
        name: `${noteLetter(root)}m`
      };
    }
    case 1: {
      return {
        notes: [third, fifth, root + 12],
        name: `${noteLetter(root)}m/${noteLetter(third)}`
      };
    }
    case 2: {
      return {
        notes: [fifth - 12, root, third],
        name: `${noteLetter(root)}m/${noteLetter(fifth)}`
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
        name: `${noteLetter(root)}m7`
      };
    }
    case 1: {
      return {
        notes: [third, fifth, seventh, root + 12],
        name: `${noteLetter(root)}m7/${noteLetter(third)}`
      };
    }
    case 2: {
      return {
        notes: [fifth - 12, seventh - 12, root, third],
        name: `${noteLetter(root)}m7/${noteLetter(fifth)}`
      };
    }
  }
};

export const fiveChord: ChordGenerator = (root: Note): Chord => {
  const fifth = root + 7;

  return {
    notes: [root, fifth],
    name: `${root}5`
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
  minor7Chord,

  // 3-note chords
  majorChord,
  minorChord,

  // 2-note "chords"
  fiveChord
];

// List of all chords for lookup in chordName
const AllChords: Chord[] = flatten(
  times(12, (root: Note) => {
    return chordGenerators.map((chordGen) => {
      const {notes, name}: Chord = chordGen(root);

      // Normalize notes
      return {
        notes: notes.map((note) => note % 12).sort(),
        name
      };
    });
  })
);

export function chordName(notes: Note[]): string | null {
  const modNotes = notes.map((note) => note % 12);

  const chord = AllChords.find((chord: Chord) =>
    chord.notes.every((note) => modNotes.includes(note))
  );

  if (chord) {
    return chord.name;
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

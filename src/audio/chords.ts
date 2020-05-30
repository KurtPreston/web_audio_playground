import {random, sample, times} from 'lodash';
import {Note} from './Note';

export type ChordGenerator = (rootNote: Note, inversion: Inversion) => Note[];
export type Inversion = 0 | 1 | 2;
export interface ChordOptions {
  inversion?: Inversion;
  seventh?: boolean;
  octave?: boolean;
}

export function randomChord(rootNote?: Note): Note[] {
  const chordGenerator: ChordGenerator = sample([
    majorChord,
    major7Chord,
    dominant7Chord,
    minorChord,
    minor7Chord,
    randomNotes
  ]) as ChordGenerator;
  const root: Note = rootNote || random(36, 60);
  const inversion: Inversion = random(0, 2) as Inversion;
  return chordGenerator(root, inversion);
}

export const randomNotes = (): Note[] => {
  return times(random(2, 5), () => random(36, 60));
};

export const majorChord: ChordGenerator = (root: Note, inversion: Inversion = 0): Note[] => {
  const third = root + 4;
  const fifth = root + 7;

  switch (inversion) {
    case 0: {
      return [root, third, fifth];
    }
    case 1: {
      return [third, fifth, root + 12];
    }
    case 2: {
      return [fifth - 12, root, third];
    }
  }
};

export const major7Chord: ChordGenerator = (root: Note, inversion: Inversion = 0): Note[] => {
  const third = root + 4;
  const fifth = root + 7;
  const seventh = root + 11;

  switch (inversion) {
    case 0: {
      return [root, third, fifth, seventh];
    }
    case 1: {
      return [third, fifth, seventh, root + 12];
    }
    case 2: {
      return [fifth - 12, seventh - 12, root, third];
    }
  }
};

export const dominant7Chord: ChordGenerator = (root: Note, inversion: Inversion = 0): Note[] => {
  const third = root + 4;
  const fifth = root + 7;
  const seventh = root + 10;

  switch (inversion) {
    case 0: {
      return [root, third, fifth, seventh];
    }
    case 1: {
      return [third, fifth, seventh, root + 12];
    }
    case 2: {
      return [fifth - 12, seventh - 12, root, third];
    }
  }
};

export const minorChord: ChordGenerator = (root: Note, inversion: Inversion = 0): Note[] => {
  const third = root + 3;
  const fifth = root + 7;

  switch (inversion) {
    case 0: {
      return [root, third, fifth];
    }
    case 1: {
      return [third, fifth, root + 12];
    }
    case 2: {
      return [fifth - 12, root, third];
    }
  }
};

export const minor7Chord: ChordGenerator = (root: Note, inversion: Inversion = 0): Note[] => {
  const third = root + 3;
  const fifth = root + 7;
  const seventh = root + 10;

  switch (inversion) {
    case 0: {
      return [root, third, fifth, seventh];
    }
    case 1: {
      return [third, fifth, seventh, root + 12];
    }
    case 2: {
      return [fifth - 12, seventh - 12, root, third];
    }
  }
};

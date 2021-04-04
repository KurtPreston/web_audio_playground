import {flatten, times} from 'lodash';
import {
  Chord,
  ChordGenerator,
  ChordType,
  dimChord,
  major7Chord,
  majorChord,
  minor7Chord,
  minorChord
} from './chords';
import {NoteAccidental, NoteValue} from './Note';
import {accidentalForKey, majorScaleNotes} from './scales';

export type ChordNum = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ChordProgression = (key: NoteValue) => Chord[];

export function circleOfFifths(chart: ChordProgression, root: NoteValue = NoteValue.C): Chord[] {
  const roots = times(12, (idx) => (root + 7 * idx) % 12);
  return flatten(roots.map(chart));
}

export const majorScaleChords: {[num in ChordNum]: ChordGenerator} = {
  1: major7Chord,
  2: minorChord,
  3: minorChord,
  4: majorChord,
  5: majorChord,
  6: minorChord,
  7: dimChord
};

const majorScaleOffset: {[num in ChordNum]: number} = {
  1: 0,
  2: 2,
  3: 4,
  4: 5,
  5: 7,
  6: 9,
  7: 11
};

export function majorProgression(chordNums: ChordNum[]): ChordProgression {
  return (key: NoteValue): Chord[] => {
    const accidental = accidentalForKey[key];
    return chordNums.map((chordNum: ChordNum) => {
      const chordGenerator: ChordGenerator = majorScaleChords[chordNum];
      const rootOffset = majorScaleOffset[chordNum];
      return chordGenerator(key + rootOffset, accidental);
    });
  };
}

export const minorScaleChords: {[num in ChordNum]: ChordGenerator} = {
  1: minor7Chord,
  2: dimChord,
  3: majorChord,
  4: minorChord,
  5: minorChord,
  6: majorChord,
  7: majorChord
};

const minorScaleOffset: {[num in ChordNum]: number} = {
  1: 0,
  2: 2,
  3: 3,
  4: 5,
  5: 7,
  6: 8,
  7: 10
};

export function minorProgression(chordNums: ChordNum[]): ChordProgression {
  return (key: NoteValue): Chord[] => {
    const accidental = accidentalForKey[key];
    return chordNums.map((chordNum: ChordNum) => {
      const chordGenerator: ChordGenerator = minorScaleChords[chordNum];
      const rootOffset = minorScaleOffset[chordNum];
      return chordGenerator(key + rootOffset, accidental);
    });
  };
}

export const majorScaleChordGenerator: ChordGenerator = (
  root: NoteValue,
  accidental: NoteAccidental
) => {
  const notes = majorScaleNotes(root);

  return new Chord({
    type: ChordType.major,
    notes,
    root,
    accidental
  });
};

export const majorScaleProgression: ChordProgression = (key: NoteValue): Chord[] => {
  const accidental: NoteAccidental = accidentalForKey[key];
  const scale = majorScaleChordGenerator(key, accidental);
  return new Array(4).fill(scale);
};

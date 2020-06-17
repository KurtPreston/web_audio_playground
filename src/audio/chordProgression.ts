import {flatten, times} from 'lodash';
import {Chord, dominant7Chord, major7Chord, minor7Chord} from './chords';
import {NoteValue} from './Note';

export type Progression = (key: NoteValue) => Chord[];

export function circleOfFifths(progression: Progression, root: NoteValue = NoteValue.C): Chord[] {
  const roots = times(12, (idx) => (root + 7 * idx) % 12);
  return flatten(roots.map(progression));
}

export const twoFiveOne: Progression = (key: NoteValue): Chord[] => {
  const two = minor7Chord(key + 2);
  const five = dominant7Chord(key + 7);
  const one = major7Chord(key);
  return [two, five, one, one];
};

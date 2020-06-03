import {groupBy, sample, size} from 'lodash';
import {Chord, subChords, superChords} from './chords';
import {Note} from './Note';

export function generateRelatedChord(notes: Note[]): Chord {
  const sups: Chord[] = superChords(notes);
  if (sups.length > 0) {
    const chordsBySize = groupBy(sups, (chord) => chord.notes.size);
    const smallestSupLength = Object.keys(chordsBySize).sort()[0];
    const smallestSupGroup: Chord[] = chordsBySize[smallestSupLength];
    const chord: Chord = sample(smallestSupGroup) as Chord;
    return chord;
  }

  const subs: Chord[] = subChords(notes);
  if (subs.length > 0) {
    const orderedSubs = groupBy(subs, (chord) => chord.notes.length * -1);
    const largestSubLength = Object.keys(orderedSubs).sort()[size(orderedSubs) - 1];
    const largestSubGroup: Chord[] = orderedSubs[largestSubLength];
    const chord: Chord = sample(largestSubGroup) as Chord;
    return chord;
  }

  throw new Error('No chord found?');
}

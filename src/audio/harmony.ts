import {groupBy, sample, size} from 'lodash';
import {
  Chord,
  chordsMatching,
  ChordType,
  majorChord,
  minorChord,
  subChords,
  superChords
} from './chords';
import {noteToNoteValue} from './Note';

export function generateRelatedChord(chord: Chord): Chord {
  const chords: Chord[] = chordsMatching(Array.from(chord.noteValues));
  for (const chord of chords) {
    if (chord.type === ChordType.major) {
      const relativeMinor = noteToNoteValue(chord.root - 3);
      if (Math.random() < 0.7) {
        return minorChord(relativeMinor, chord.accidental);
      }
    } else if (chord.type === ChordType.minor) {
      const relativeMajor = noteToNoteValue(chord.root + 3);
      if (Math.random() < 0.7) {
        return majorChord(relativeMajor, chord.accidental);
      }
    }
  }

  const sups: Chord[] = superChords(Array.from(chord.noteValues));
  if (sups.length > 0) {
    const chordsBySize = groupBy(sups, (chord) => chord.noteValues.size);
    const smallestSupLength = Object.keys(chordsBySize).sort()[0];
    const smallestSupGroup: Chord[] = chordsBySize[smallestSupLength];
    const chord: Chord = sample(smallestSupGroup) as Chord;
    return chord;
  }

  const subs: Chord[] = subChords(Array.from(chord.noteValues));
  if (subs.length > 0) {
    const orderedSubs = groupBy(subs, (chord) => chord.noteValues.size * -1);
    const largestSubLength = Object.keys(orderedSubs).sort()[size(orderedSubs) - 1];
    const largestSubGroup: Chord[] = orderedSubs[largestSubLength];
    const chord: Chord = sample(largestSubGroup) as Chord;
    return chord;
  }

  throw new Error('No chord found?');
}

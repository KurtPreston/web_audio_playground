import {groupBy, isFinite, random, sample, size} from 'lodash';
import {mod} from '../math/mod';
import {Chord, subChords, superChords} from './chords';
import {Note} from './Note';

export function generateRelatedChord(notes: Note[]): Note[] {
  const sups: Chord[] = superChords(notes);
  if (sups.length > 0) {
    const chordsBySize = groupBy(sups, (chord) => chord.notes.length);
    const smallestSupLength = Object.keys(chordsBySize).sort()[0];
    const smallestSupGroup: Chord[] = chordsBySize[smallestSupLength];
    const chord: Chord = sample(smallestSupGroup) as Chord;
    return minimizeChordDiff(notes, chord.notes);
  }

  const subs: Chord[] = subChords(notes);
  if (subs.length > 0) {
    const orderedSubs = groupBy(subs, (chord) => chord.notes.length * -1);
    const largestSubLength = Object.keys(orderedSubs).sort()[size(orderedSubs) - 1];
    const largestSubGroup: Chord[] = orderedSubs[largestSubLength];
    const chord: Chord = sample(largestSubGroup) as Chord;
    return minimizeChordDiff(notes, chord.notes);
  }

  return notes;
}

export function minimizeChordDiff(input: Note[], output: Note[]): Note[] {
  return output.map((outputNote: Note) => {
    const matchingNote: Note | undefined = input.find((inputNote: Note) => {
      return mod(inputNote, 12) === mod(outputNote, 12);
    });
    if (isFinite(matchingNote)) {
      return matchingNote as Note;
    } else {
      // Random octave
      return outputNote + random(2, 5) * 12;
    }
  });
}

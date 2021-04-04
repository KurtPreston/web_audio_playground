import {Note} from '../Note';
import {Melody, MelodyNote} from './melody';

export function upDownArp(notes: Note[], beats: number): Melody {
  const melodyNotes: MelodyNote[] = [];
  let direction = -1;
  let noteIdx = 0;
  for (let i = 0; i < beats; i++) {
    melodyNotes.push({
      note: notes[noteIdx],
      beats: 1
    });
    if (noteIdx >= notes.length || noteIdx <= 0) {
      direction *= -1;
    }
    noteIdx += direction;
  }
  return melodyNotes;
}

import {Note} from '../Note';
import {Melody, MelodyNote} from './melody';

export function upDownArp(notes: Note[], beats: number): Melody {
  const melodyNotes: MelodyNote[] = [];
  let direction = -1;
  let noteIdx = 0;
  for (let i = 0; i < beats; i++) {
    const note = notes[noteIdx];
    melodyNotes.push({
      note,
      beats: 1
    });
    if ((noteIdx >= notes.length - 1 && direction > 0) || (noteIdx <= 0 && direction < 0)) {
      direction *= -1;
    }
    noteIdx += direction;
  }
  return melodyNotes;
}

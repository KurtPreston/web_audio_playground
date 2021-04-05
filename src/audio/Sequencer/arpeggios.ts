import {Note} from '../Note';
import {Melody, MelodyNote} from './melody';

export function upDownArp(params: {
  notes: Note[];
  beatsPerNote: number;
  totalBeats: number;
}): Melody {
  const {notes, beatsPerNote, totalBeats} = params;
  const melodyNotes: MelodyNote[] = [];
  let direction = -1;
  let noteIdx = 0;
  for (let i = 0; i < totalBeats; i += beatsPerNote) {
    const note = notes[noteIdx];
    melodyNotes.push({
      note,
      beats: beatsPerNote
    });
    if ((noteIdx >= notes.length - 1 && direction > 0) || (noteIdx <= 0 && direction < 0)) {
      direction *= -1;
    }
    noteIdx += direction;
  }
  return melodyNotes;
}

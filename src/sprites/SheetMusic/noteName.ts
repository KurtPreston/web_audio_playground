import {getNoteName} from '../../audio/Note';
import {NoteAnnotator, NoteAnnotatorParams} from './SheetMusic';

export const noteNameAnnotator: NoteAnnotator = {
  name: 'Note',
  height: 30,
  render: (params: NoteAnnotatorParams) => {
    const {x, y, canvas, note, accidental, color} = params;
    canvas.font = '20px Arial';
    canvas.textAlign = 'center';
    canvas.fillStyle = color;
    canvas.fillText(
      getNoteName(note, {
        accidental,
        octave: false
      }),
      x,
      y
    );
  }
};

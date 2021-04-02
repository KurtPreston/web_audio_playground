import {getNoteName} from '../../audio/Note';
import {NoteAnnotator, NoteAnnotatorParams} from './SheetMusic';

export const noteNameAnnotator: NoteAnnotator = (params: NoteAnnotatorParams) => {
  const {x, y, canvas, note} = params;
  canvas.font = '20px Arial';
  canvas.textAlign = 'center';
  canvas.fillStyle = 'white';
  canvas.fillText(getNoteName(note), x, y);
};

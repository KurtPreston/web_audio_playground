import {circle} from '../renderHelpers/circle';
import {NoteAnnotator, NoteAnnotatorParams} from './SheetMusic';

export const testAnnotator: NoteAnnotator = (params: NoteAnnotatorParams) => {
  const {x, y, width, height, canvas} = params;
  circle({
    x,
    y,
    r: Math.min(width, height),
    fill: 'red',
    canvas
  });
};

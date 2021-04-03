import {circle} from '../renderHelpers/circle';
import {NoteAnnotator, NoteAnnotatorParams} from './SheetMusic';

export const testAnnotator: NoteAnnotator = {
  name: 'Test',
  height: 40,
  render: (params: NoteAnnotatorParams) => {
    const {x, y, width, height, canvas} = params;
    circle({
      x,
      y,
      r: Math.min(width, height),
      fill: 'red',
      canvas
    });
  }
};

import tinycolor from 'tinycolor2';
import {Note} from '../../util/Note';

export function noteColor(note: Note): string {
  const color = tinycolor({
    h: ((note % 12) / 12) * 360,
    s: 1,
    l: 0.7
  });
  return color.toHexString();
}

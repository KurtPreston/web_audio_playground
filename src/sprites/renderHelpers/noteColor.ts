import tinycolor from 'tinycolor2';
import {Note} from '../../audio/Note';

export function noteColor(note: Note, lum: number = 0.7): string {
  const color = tinycolor({
    h: ((note % 12) / 12) * 360,
    s: 1,
    l: lum
  });
  return color.toHexString();
}

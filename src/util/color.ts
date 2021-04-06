import {random, sample, times} from 'lodash';
import {Note} from '../audio/Note';
import {CanvasBlendMode} from '../games/Cables/CablesOptions.generated';
import {noteColor} from '../sprites/renderHelpers/noteColor';
import {ColorTheme} from './colorTheme.generated';

export function randomColor(): string {
  return ['#', ...times(3, () => random(0, 255).toString(16).padStart(2, '0'))].join('');
}

export function randomBlendMode(): CanvasBlendMode {
  return sample(['color-dodge', 'soft-light', 'xor', 'multiply']) as CanvasBlendMode;
}

export const ColorThemes: {[theme in ColorTheme]: (note: Note) => string} = {
  white: () => 'white',
  rainbow: (note: Note) => noteColor(note)
};

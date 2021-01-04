import {random, sample, times} from 'lodash';
import {CanvasBlendMode} from '../games/Cables/CablesOptions.generated';

export function randomColor(): string {
  return ['#', ...times(3, () => random(0, 255).toString(16).padStart(2, '0'))].join('');
}

export function randomBlendMode(): CanvasBlendMode {
  return sample(['color-dodge', 'soft-light', 'xor', 'multiply']) as CanvasBlendMode;
}

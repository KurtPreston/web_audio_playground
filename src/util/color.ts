import {random, times} from 'lodash';

export function randomColor(): string {
  return ['#', ...times(3, () => random(0, 255).toString(16).padStart(2, '0'))].join('');
}

import {range} from 'lodash';
import {describe, it, expect} from 'vitest';

import {ouroboros} from './ouroboros';

describe('ouroboros', () => {
  const array: number[] = range(0, 10);

  // 0 -> (0 * (0/4) + 6 * (4/4)
  // 1 -> (1 * (1/4) + 7 * (3/4)
  // 2 -> (2 * (2/4) + 8 * (2/4)
  // 3 -> (3 * (3/4) + 9 * (1/4)
  // 4
  // 5
  // 6
  // 7
  // 8
  // 9

  it('averages at the head', () => {
    expect(ouroboros(array, 0, 4)).toEqual(6);
    expect(ouroboros(array, 1, 4)).toEqual(22 / 4);
    expect(ouroboros(array, 2, 4)).toEqual(20 / 4);
    expect(ouroboros(array, 3, 4)).toEqual(18 / 4);
  });

  it("doesn't affect the middle", () => {
    expect(ouroboros(array, 4, 4)).toEqual(4);
    expect(ouroboros(array, 5, 4)).toEqual(5);
    expect(ouroboros(array, 6, 4)).toEqual(6);
  });
});

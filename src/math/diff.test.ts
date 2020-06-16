import {diff} from './diff';
import {merge} from 'lodash';

describe('diff', () => {
  it('returns the partial diff', () => {
    const a = {
      foo: {
        bar: 1,
        baz: 2
      }
    };

    const b = {
      foo: {
        bar: 3,
        baz: 2
      }
    };

    const partialDiff = diff(a, b);
    expect(partialDiff).toEqual({
      foo: {
        bar: 1
      }
    });

    const applied = merge({}, b, diff);
    expect(applied).toEqual(a);
  });
});

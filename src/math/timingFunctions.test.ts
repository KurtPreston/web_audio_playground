import {describe, it, expect} from 'vitest';
import {timingFunction, TimingFunctionType} from './timingFunctions';

describe('timingFunctions', () => {
  it('returns a value based on the frame', () => {
    const params = {
      type: TimingFunctionType.linear,
      numFrames: 100,
      maxValue: 1000
    };
    expect(
      timingFunction({
        ...params,
        frame: 0
      })
    ).toEqual(0);

    expect(
      timingFunction({
        ...params,
        frame: 100
      })
    ).toEqual(1000);
  });

  it('supports reverse animations', () => {
    const params = {
      type: TimingFunctionType.linear,
      numFrames: 100,
      maxValue: 1000,
      reverse: true
    };
    expect(
      timingFunction({
        ...params,
        frame: 0
      })
    ).toEqual(1000);

    expect(
      timingFunction({
        ...params,
        frame: 100
      })
    ).toEqual(0);
  });
});

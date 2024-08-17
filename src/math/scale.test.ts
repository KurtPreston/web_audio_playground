import {scale} from './scale';

describe('scale', () => {
  it('scales linearly by default', () => {
    const bounds = {
      inputMin: 0,
      inputMax: 10,
      outputMin: 50,
      outputMax: 100
    };

    expect(
      scale({
        input: 0,
        ...bounds
      })
    ).toEqual(50);

    expect(
      scale({
        input: 5,
        ...bounds
      })
    ).toEqual(75);

    expect(
      scale({
        input: 10,
        ...bounds
      })
    ).toEqual(100);
  });

  it('can scale logarithmically', () => {
    const bounds = {
      inputMin: 0,
      inputMax: 10,
      outputMin: 50,
      outputMax: 100,
      logarithmic: true as const
    };

    expect(
      scale({
        input: 0,
        ...bounds
      })
    ).toEqual(50);

    expect(
      scale({
        input: 10,
        ...bounds
      })
    ).toEqual(100);
  });
});

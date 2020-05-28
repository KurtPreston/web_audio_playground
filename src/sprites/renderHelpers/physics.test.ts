import {angleBetween} from './physics';

describe('angleBetween', () => {
  it('calculates the angle between two points', () => {
    expect(
      angleBetween(
        {
          x: 0,
          y: 0
        },
        {
          x: 1,
          y: 0
        }
      )
    ).toEqual(0);

    expect(
      angleBetween(
        {
          x: 0,
          y: 0
        },
        {
          x: 1,
          y: 1
        }
      )
    ).toEqual(Math.PI / 4);

    expect(
      angleBetween(
        {
          x: 0,
          y: 0
        },
        {
          x: 0,
          y: 1
        }
      )
    ).toEqual(Math.PI / 2);

    expect(
      angleBetween(
        {
          x: 0,
          y: 0
        },
        {
          x: -1,
          y: 1
        }
      )
    ).toEqual((3 * Math.PI) / 4);

    expect(
      angleBetween(
        {
          x: 0,
          y: 0
        },
        {
          x: -1,
          y: 0
        }
      )
    ).toEqual(Math.PI);

    expect(
      angleBetween(
        {
          x: 0,
          y: 0
        },
        {
          x: -1,
          y: -1
        }
      )
    ).toEqual((5 * Math.PI) / 4);

    expect(
      angleBetween(
        {
          x: 0,
          y: 0
        },
        {
          x: 0,
          y: -1
        }
      )
    ).toEqual((3 * Math.PI) / 2);

    expect(
      angleBetween(
        {
          x: 0,
          y: 0
        },
        {
          x: 1,
          y: -1
        }
      )
    ).toEqual((7 * Math.PI) / 4);
  });
});

describe('springForce', () => {});

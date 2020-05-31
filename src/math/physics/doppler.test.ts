import {doppler} from './doppler';

describe('doppler', () => {
  describe('increases freq if object is moving toward target', () => {
    it('x', () => {
      // Left moving right
      expect(
        doppler({
          source: {
            freq: 100,
            position: {
              x: -10,
              y: 0
            },
            vector: {
              xMomentum: 5,
              yMomentum: 0
            }
          },
          target: {
            position: {
              x: 0,
              y: 0
            },
            vector: {
              xMomentum: 0,
              yMomentum: 0
            }
          },
          speedOfSound: 1000
        })
      ).toEqual(100 * (1005 / 1000));
    });

    it('y', () => {
      // Up moving down
      expect(
        doppler({
          source: {
            freq: 100,
            position: {
              x: 0,
              y: 10
            },
            vector: {
              xMomentum: 0,
              yMomentum: -5
            }
          },
          target: {
            position: {
              x: 0,
              y: 0
            },
            vector: {
              xMomentum: 0,
              yMomentum: 0
            }
          },
          speedOfSound: 1000
        })
      ).toEqual(100 * (1005 / 1000));
    });
  });

  describe('decreases freq if object is moving away from target', () => {
    it('x', () => {
      expect(
        doppler({
          source: {
            freq: 100,
            position: {
              x: 10,
              y: 0
            },
            vector: {
              xMomentum: 5,
              yMomentum: 0
            }
          },
          target: {
            position: {
              x: 0,
              y: 0
            },
            vector: {
              xMomentum: 0,
              yMomentum: 0
            }
          },
          speedOfSound: 1000
        })
      ).toEqual((100 * 995) / 1000);
    });

    it('y', () => {
      expect(
        doppler({
          source: {
            freq: 100,
            position: {
              x: 0,
              y: 10
            },
            vector: {
              xMomentum: 0,
              yMomentum: 0
            }
          },
          target: {
            position: {
              x: 0,
              y: 0
            },
            vector: {
              xMomentum: 0,
              yMomentum: -5
            }
          },
          speedOfSound: 1000
        })
      ).toEqual((100 * 995) / 1000);
    });
  });
});

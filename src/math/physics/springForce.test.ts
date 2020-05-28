import {springForce} from './springForce';

describe('springForce', () => {
  describe('when the spring is stretched', () => {
    it('the points move toward each other', () => {
      const {xForce, yForce} = springForce({
        point1: {
          x: 0,
          y: 0
        },
        point2: {
          x: 10,
          y: 0
        },
        targetDistance: 5,
        springConstant: 1
      });
      expect(xForce).toBeGreaterThan(0);
      expect(yForce).toEqual(0);
    });

    it('specifies momentum with a sign for point1', () => {
      const {xForce, yForce} = springForce({
        point1: {
          x: 10,
          y: 0
        },
        point2: {
          x: 0,
          y: 0
        },
        targetDistance: 5,
        springConstant: 1
      });
      expect(xForce).toBeLessThan(1);
      // yForce not exactly 0 due to floating point issues
      expect(yForce).toBeCloseTo(0, 7);
    });
  });

  describe('when the spring is compressed', () => {
    it('the points move away from each other', () => {
      const {xForce, yForce} = springForce({
        point1: {
          x: 0,
          y: 0
        },
        point2: {
          x: 10,
          y: 0
        },
        targetDistance: 20,
        springConstant: 1
      });
      expect(xForce).toBeLessThan(0);
      expect(yForce).toBeCloseTo(0, 7);
    });

    it('specifies momentum with a sign for point1', () => {
      const {xForce, yForce} = springForce({
        point1: {
          x: 10,
          y: 0
        },
        point2: {
          x: 0,
          y: 0
        },
        targetDistance: 20,
        springConstant: 1
      });
      expect(xForce).toBeGreaterThan(1);
      // yForce not exactly 0 due to floating point issues
      expect(yForce).toBeCloseTo(0, 7);
    });
  });
});

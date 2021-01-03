import {scale} from './scale';

export interface TimingFunctionParams {
  maxValue: number;
  frame: number;
  numFrames: number;
  type: TimingFunctionType;
  reverse?: boolean;
}

type TimingFunction = (timeFraction: number) => number;
export enum TimingFunctionType {
  linear,
  quad,
  elastic
}

export function timingFunction(params: TimingFunctionParams): number {
  const {frame, numFrames, maxValue, reverse, type} = params;
  let timeFraction: number = scale({
    input: frame,
    inputMin: 0,
    inputMax: numFrames,
    outputMin: 0,
    outputMax: 1
  });
  if (reverse) {
    timeFraction = 1 - timeFraction;
  }

  const timingFunction: TimingFunction = timingFunctions[type];
  const value = timingFunction(timeFraction) * maxValue;
  return value;
}

const timingFunctions: {[type in TimingFunctionType]: TimingFunction} = {
  [TimingFunctionType.linear]: (timeFraction: number) => timeFraction,
  [TimingFunctionType.quad]: (timeFraction: number) => Math.pow(timeFraction, 2),
  [TimingFunctionType.elastic]: (timeFraction: number) => {
    const initialRange: number = 1.5;
    return (
      Math.pow(2, 10 * (timeFraction - 1)) *
      Math.cos(((20 * Math.PI * initialRange) / 3) * timeFraction)
    );
  }
};

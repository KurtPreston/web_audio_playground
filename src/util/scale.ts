export interface ScaleProps {
  input: number;
  inputMin: number;
  inputMax: number;
  outputMin: number;
  outputMax: number;
  logarithmic?: true | number;
  overflowMode?: OverflowMode;
}

export enum OverflowMode {
  Warn,
  Constrain,
  Overflow
}

export function scale(props: ScaleProps): number {
  const {
    input,
    inputMin,
    inputMax,
    outputMin,
    outputMax,
    logarithmic,
    overflowMode = OverflowMode.Warn
  } = props;
  if (overflowMode === OverflowMode.Warn || overflowMode === OverflowMode.Constrain) {
    if (input > inputMax) {
      if (overflowMode === OverflowMode.Warn) {
        console.warn('scale() received out-of-bounds input', props);
        debugger;
      }
      return outputMax;
    }
    if (input < inputMin) {
      if (overflowMode === OverflowMode.Warn) {
        console.warn('scale() received out-of-bounds input', props);
        debugger;
      }
      return outputMin;
    }
  }

  const inputRange = inputMax - inputMin;

  // Amount is scale 0 - 1
  const amount = logarithmic
    ? Math.log((input - inputMin) / inputRange + 1) /
      Math.log(logarithmic === true ? 2 : logarithmic)
    : (input - inputMin) / inputRange;

  const outputRange = outputMax - outputMin;
  return outputMin + amount * outputRange;
}

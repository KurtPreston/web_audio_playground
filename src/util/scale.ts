export interface ScaleProps {
  input: number;
  inputMin: number;
  inputMax: number;
  outputMin: number;
  outputMax: number;
  logarithmic?: boolean;
}

export function scale(props: ScaleProps): number {
  const {input, inputMin, inputMax, outputMin, outputMax, logarithmic} = props;
  if (input > inputMax) {
    console.warn('scale() received out-of-bounds input', props);
    debugger;
    return outputMax;
  }
  if (input < inputMin) {
    console.warn('scale() received out-of-bounds input', props);
    debugger;
    return outputMin;
  }

  const inputRange = inputMax - inputMin;

  // Amount is scale 0 - 1
  const amount = logarithmic
    ? Math.log2((input - inputMin) / inputRange + 1)
    : (input - inputMin) / inputRange;

  const outputRange = outputMax - outputMin;
  return outputMin + amount * outputRange;
}

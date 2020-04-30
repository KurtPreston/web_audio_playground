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
  if(input > inputMax) {
    console.warn('scale() received out-of-bounds input', props);
    return outputMax;
  }
  if(input < inputMin) {
    console.warn('scale() received out-of-bounds input', props);
    return outputMin;
  }

  const inputRange = inputMax - inputMin;
  const outputRange = outputMax - outputMin;
  const amount = (input - inputMin) / inputRange; // 0 - 1
  if(logarithmic) {
    return outputMin + Math.log2(amount + 1) * outputRange;
  } else {
    return outputMin + amount * outputRange;
  }
}
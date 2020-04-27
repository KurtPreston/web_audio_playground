export interface ScaleProps {
  input: number;
  inputMin: number;
  inputMax: number;
  outputMin: number;
  outputMax: number;
}

export function scale(props: ScaleProps): number {
  const {input, inputMin, inputMax, outputMin, outputMax} = props;
  if(input > inputMax) {
    debugger;
    return outputMax;
  }
  if(input < inputMin) {
    debugger;
    return outputMin;
  }

  const inputRange = inputMax - inputMin;
  const outputRange = outputMax - outputMin;
  const amount = (input - inputMin) / inputRange;
  const scaledValue = outputMin + amount * outputRange;
  return scaledValue;
}
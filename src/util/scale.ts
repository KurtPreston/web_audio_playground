export interface ScaleProps {
  input: number;
  inputMin: number;
  inputMax: number;
  outputMin: number;
  outputMax: number;
}

export function scale(props: ScaleProps): number {
  const {input, inputMin, inputMax, outputMin, outputMax} = props;
  const inputRange = inputMax - inputMin;
  const outputRange = outputMax - outputMin;
  const amount = (input - inputMin) / inputRange;
  return outputMin + amount * outputRange;
}
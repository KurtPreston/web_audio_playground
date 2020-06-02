export function mod(num: number, modulo: number) {
  const remain = num % modulo;
  if (remain > 0) {
    return remain;
  } else if (remain < 0) {
    return remain + modulo;
  } else {
    return 0;
  }
}

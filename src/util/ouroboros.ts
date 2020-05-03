// Return the value of an index, average n indices between the head and the tail
export function ouroboros(array: Uint8Array | number[], idx: number, overlap: number): number {
  const value = array[idx];
  if (idx >= overlap) {
    return value;
  }

  const opposite = array[array.length - overlap + idx];
  const ratio = idx / overlap;
  return value * ratio + (1 - ratio) * opposite;
}

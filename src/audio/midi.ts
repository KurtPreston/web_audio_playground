export function midiNoteToFreq(midiNote: number): number {
  return Math.pow(2, (midiNote - 69) / 12) * 440;
}

export function freqToMidiNote(freq: number): number {
  return Math.round(12 * Math.log2(freq / 440) + 69);
}

export function ratioToSemitones(ratio: number): number {
  return (12 * Math.log(ratio)) / Math.log(2);
}

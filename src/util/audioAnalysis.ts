import { AudioData } from "../types";
import { freqToMidiNote } from "./midi";
import { getNoteName } from "./Note";

export function audioAnalysis(analyser: AnalyserNode): AudioData {
  const bufferLength = analyser.frequencyBinCount;
  const frequencies = new Uint8Array(bufferLength);
  const wave = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(frequencies);
  analyser.getByteTimeDomainData(wave);
  const amplitude = Math.max(...wave as any);
  const peakFreqIdx = frequencies.reduce((maxIdx, currentValue, idx, array): number => {
    const prevMax = array[maxIdx];
    if(currentValue > prevMax) {
      return idx;
    } else {
      return maxIdx;
    }
  });
  const peakFreq = peakFreqIdx * analyser.context.sampleRate / analyser.fftSize;
  const midiNote = freqToMidiNote(peakFreq);
  const noteName = getNoteName(midiNote);
  console.log(`Freq: ${peakFreq}Hz, MIDI: ${midiNote}, ${noteName}`);
  return {
    frequencies,
    wave,
    amplitude,
    peakFreq
  };
}
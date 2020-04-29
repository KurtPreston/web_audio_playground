import {AudioData} from '../types';
import {freqToMidiNote, midiNoteToFreq} from './midi';
import {getNoteInfo, NoteInfo, getNoteFrequencyRange, Note} from './Note';
import {scale} from './scale';
import { times } from 'lodash';

// Modifies AudioData rather than returning a new one

export type FftSize = 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096 | 8192 | 16384 | 32768;

export class AudioAnalyser implements AudioData {
  private readonly analyser: AnalyserNode;
  private readonly _frequencies: Uint8Array;
  private readonly _wave: Uint8Array;
  private readonly hzPerIdx: number;

  private valuesThisFrame: Partial<AudioData> = {};

  constructor(audioSource: AudioNode) {
    const audioContext: BaseAudioContext = audioSource.context;
    const analyser = audioContext.createAnalyser();
    audioSource.connect(analyser);
    const fftSize: FftSize = 16384;
    analyser.fftSize = fftSize;
    this.analyser = analyser;
    const bufferLength = analyser.frequencyBinCount;

    // Allocate the memory for the array just once
    this._frequencies = new Uint8Array(bufferLength);
    this._wave = new Uint8Array(bufferLength);
    this.hzPerIdx = audioContext.sampleRate / (analyser.fftSize * 2);
  }

  public reset() {
    this.valuesThisFrame = {};
  }

  public get frequencies(): Uint8Array {
    if (!this.valuesThisFrame.frequencies) {
      this.analyser.getByteFrequencyData(this._frequencies);
      this.valuesThisFrame.frequencies = this._frequencies;
    }

    return this.valuesThisFrame.frequencies;
  }

  public get wave(): Uint8Array {
    if (!this.valuesThisFrame.wave) {
      this.analyser.getByteTimeDomainData(this._wave);
      this.valuesThisFrame.wave = this._wave;
    }

    return this.valuesThisFrame.wave;
  }

  public get amplitude(): number {
    if (!this.valuesThisFrame.amplitude) {
      const maxAmplitude = Math.max(...(this.frequencies as any));
      this.valuesThisFrame.amplitude = scale({
        input: maxAmplitude,
        inputMin: 0,
        inputMax: 255,
        outputMin: 0,
        outputMax: 1
      });
    }

    return this.valuesThisFrame.amplitude;
  }

  private avgAmplitudeInFreqRange(lowFreq: number, highFreq: number) {
    const lowIdx = Math.round(lowFreq / this.hzPerIdx);
    const highIdx = Math.round(highFreq / this.hzPerIdx);
    const freqBuckets: Uint8Array = this.frequencies.slice(lowIdx, highIdx + 1);
    let total = 0;
    freqBuckets.forEach((amplitude) => {
      total += amplitude;
    });

    const avg: number = total / (highIdx - lowIdx + 1);
    return avg;
  }

  public get notes(): NoteInfo[] {
    if (!this.valuesThisFrame.notes) {
      const activeNotes: Note[] = [];
      times(128, (note: Note) => {
        const [lowFreq, highFreq] = getNoteFrequencyRange(note);
        const avg = this.avgAmplitudeInFreqRange(lowFreq, highFreq);
        const octaveAvg = this.avgAmplitudeInFreqRange(
          midiNoteToFreq(note - 6),
          midiNoteToFreq(note + 6)
        );

        if(avg > octaveAvg * 6 && avg > 30) {
          activeNotes.push(note);
        }
      });

      this.valuesThisFrame.notes = activeNotes.map((note) => getNoteInfo(note));
    }

    return this.valuesThisFrame.notes;
  }

  public amplitudeAtNote(note: number): number {
    const [lowFreq, highFreq] = getNoteFrequencyRange(note);
    const value = this.frequencyRangeMax(lowFreq, highFreq);
    return scale({
      input: value,
      inputMin: 0,
      inputMax: 255,
      outputMin: 0,
      outputMax: 1
    });
  }

  private frequencyRangeMax(lowFreq: number, highFreq: number): number {
    const lowIdx = Math.round(lowFreq / this.hzPerIdx);
    const highIdx = Math.round(highFreq / this.hzPerIdx);
    const {frequencies} = this;
    let max = frequencies[lowIdx];
    let total = frequencies[lowIdx];
    for(let idx = lowIdx + 1; idx < highIdx; idx++) {
      const value = frequencies[idx];
      total += value;
      if(value > max) {
        max = frequencies[idx];
      }
    }

    const mean = total / (highIdx - lowIdx + 1);
    return max;
  }
}

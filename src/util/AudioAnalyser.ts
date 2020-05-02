import {Pitchfinder} from '../pitchfinder/src';
import {PitchDetector} from '../pitchfinder/src/detectors/types';
import {AudioData} from '../types';
import {freqToMidiNote} from './midi';
import {getNoteFrequencyRange, getNoteInfo, NoteInfo, Note} from './Note';
import {scale} from './scale';

// Modifies AudioData rather than returning a new one

export type FftSize = 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096 | 8192 | 16384 | 32768;

export const NOTE_FRAMES_TO_AVG = 10;

export class AudioAnalyser implements AudioData {
  // References
  private readonly analyser: AnalyserNode;
  private readonly _frequencies: Uint8Array;
  private readonly _wave: Float32Array;
  public readonly hzPerIdx: number;
  private readonly pitchDetector: PitchDetector;

  // State
  private valuesThisFrame: Partial<AudioData> = {};
  private lastDetectedNotes: Note[][] = new Array(NOTE_FRAMES_TO_AVG);

  constructor(audioSource: AudioNode) {
    const audioContext: BaseAudioContext = audioSource.context;
    const analyser = audioContext.createAnalyser();
    audioSource.connect(analyser);
    const fftSize: FftSize = 1024;
    analyser.fftSize = fftSize;
    this.analyser = analyser;
    const bufferLength = analyser.frequencyBinCount;

    this.pitchDetector = Pitchfinder.DynamicWavelet({
      sampleRate: audioSource.context.sampleRate
    });

    // Allocate the memory for the array just once
    this._frequencies = new Uint8Array(bufferLength);
    this._wave = new Float32Array(bufferLength);
    this.hzPerIdx = audioContext.sampleRate / (analyser.frequencyBinCount * 2);
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

  public get wave(): Float32Array {
    if (!this.valuesThisFrame.wave) {
      this.analyser.getFloatTimeDomainData(this._wave);
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


  public get notes(): NoteInfo[] {
    if (!this.valuesThisFrame.notes) {
      const freq = this.pitchDetector(this.wave);
      if (freq) {
        const note = freqToMidiNote(freq);
        this.valuesThisFrame.notes = [note].map((note) => getNoteInfo(note));
      } else {
        this.valuesThisFrame.notes = [];
      }
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
    for (let idx = lowIdx + 1; idx < highIdx; idx++) {
      const value = frequencies[idx];
      if (value > max) {
        max = frequencies[idx];
      }
    }

    return max;
  }

  public frequencyRangeAvg(lowFreq: number, highFreq: number) {
    const lowIdx = Math.round(lowFreq / this.hzPerIdx);
    const highIdx = Math.round(highFreq / this.hzPerIdx);
    const {frequencies} = this;
    let total = frequencies[lowIdx];
    for (let idx = lowIdx + 1; idx < highIdx; idx++) {
      const value = frequencies[idx];
      total += value;
    }

    const mean = total / (highIdx - lowIdx + 1);
    return mean;
  }
}

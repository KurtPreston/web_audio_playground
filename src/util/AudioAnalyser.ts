import {autobind} from 'core-decorators';
import {compact, mean} from 'lodash';
import {Pitchfinder} from '../pitchfinder/src';
import {PitchDetector} from '../pitchfinder/src/detectors/types';
import {AudioData} from '../types';
import {freqToMidiNote} from './midi';
import {getNoteFrequencyRange, Note} from './Note';
import {scale} from './scale';

// Modifies AudioData rather than returning a new one

export type FftSize = 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096 | 8192 | 16384 | 32768;

export const NOTE_FRAMES_TO_AVG = 10;

@autobind
export class AudioAnalyser implements AudioData {
  // References
  private readonly analyser: AnalyserNode;
  private readonly _frequencies: Uint8Array;
  private readonly _uint8Wave: Uint8Array;
  private readonly _float32Wave: Float32Array;
  public readonly hzPerIdx: number;
  private readonly pitchDetector: PitchDetector;

  // State
  private valuesThisFrame: Partial<AudioData> = {};
  private lastDetectedNotes: (Note | null)[] = new Array<Note | null>(NOTE_FRAMES_TO_AVG);

  constructor(audioSource: AudioNode) {
    const audioContext: BaseAudioContext = audioSource.context;
    const analyser = audioContext.createAnalyser();
    audioSource.connect(analyser);
    const fftSize: FftSize = 1024;
    analyser.fftSize = fftSize;
    this.analyser = analyser;

    this.pitchDetector = Pitchfinder.AMDF({
      sampleRate: audioSource.context.sampleRate
    });

    // Allocate the memory for the arrays just once
    this._frequencies = new Uint8Array(analyser.frequencyBinCount);
    this._uint8Wave = new Uint8Array(analyser.fftSize);
    this._float32Wave = new Float32Array(analyser.fftSize);
    this.hzPerIdx = audioContext.sampleRate / (analyser.frequencyBinCount * 2);
  }

  public reset() {
    this.valuesThisFrame = {};
  }

  public get sampleRate(): number {
    return this.analyser.context.sampleRate;
  }

  public get frequencies(): Uint8Array {
    if (!this.valuesThisFrame.frequencies) {
      this.analyser.getByteFrequencyData(this._frequencies);
      this.valuesThisFrame.frequencies = this._frequencies;
    }

    return this.valuesThisFrame.frequencies;
  }

  public get floatWave(): Float32Array {
    if (!this.valuesThisFrame.floatWave) {
      this.analyser.getFloatTimeDomainData(this._float32Wave);
      this.valuesThisFrame.floatWave = this._float32Wave;
    }

    return this.valuesThisFrame.floatWave;
  }

  public get uintWave(): Uint8Array {
    if (!this.valuesThisFrame.uintWave) {
      this.analyser.getByteTimeDomainData(this._uint8Wave);
      this.valuesThisFrame.uintWave = this._uint8Wave;
    }

    return this.valuesThisFrame.uintWave;
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

  public get notes(): Note[] {
    if (!this.valuesThisFrame.notes) {
      const freq = this.peakFreq;
      const note: Note | null = freq ? freqToMidiNote(freq) : null;

      this.lastDetectedNotes.shift();
      this.lastDetectedNotes.push(note);

      const detectedNotes: Note[] = compact(this.lastDetectedNotes);
      const avgNote = mean(this.lastDetectedNotes);
      this.valuesThisFrame.notes = isFinite(avgNote) ? [Math.round(mean(detectedNotes))] : [];
    }

    return this.valuesThisFrame.notes;
  }

  public get peakFreq(): number | null {
    if (typeof this.valuesThisFrame.peakFreq === 'undefined') {
      this.valuesThisFrame.peakFreq = this.pitchDetector(this.floatWave);
    }

    return this.valuesThisFrame.peakFreq;
  }

  public amplitudeAtNote(note: number): number {
    const [lowFreq, highFreq] = getNoteFrequencyRange(note);
    const value = this.frequencyRangeRms(lowFreq, highFreq);
    return scale({
      input: value,
      inputMin: 0,
      inputMax: 255,
      outputMin: 0,
      outputMax: 1,
      logarithmic: true
    });
  }

  // Returns total RMS level 0 - 255
  public get rms(): number {
    if (!this.valuesThisFrame.rms) {
      const rms = this.frequencyRangeRms(0, this.sampleRate);
      this.valuesThisFrame.rms = rms;
    }

    return this.valuesThisFrame.rms;
  }

  // Returns RMS level 0 - 255
  private frequencyRangeRms(lowFreq: number, highFreq: number): number {
    const {hzPerIdx, frequencies} = this;
    const lowIdx = Math.max(Math.round(lowFreq / hzPerIdx), 0);
    const highIdx = Math.min(Math.round(highFreq / hzPerIdx), frequencies.length - 1);
    let sum = 0;
    const range = highIdx - lowIdx + 1;
    for (let i = lowIdx; i <= highIdx; i++) {
      const amp = frequencies[i];
      sum += amp * amp;
    }

    return Math.sqrt(sum / range);
  }
}

import {freqToMidiNote} from '../../audio/midi';
import {Note} from '../../audio/Note';
import {pitchDetectionWorker} from '../../workers/pitchDetectionWorkerProxy';
import {MidiNotePublish} from '../MidiNoteBus';
import {IMidiSource, MidiSourceClass} from './MidiSource';

export const PitchfinderMidiSource: MidiSourceClass = class implements IMidiSource {
  private readonly audioContext: AudioContext;
  private note: Note | null = null;

  constructor(private readonly publish: MidiNotePublish) {
    this.audioContext = new AudioContext();
    this.initialize();
  }

  private async initialize() {
    const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });
    const audioSource = this.audioContext.createMediaStreamSource(stream);
    const analyser = this.audioContext.createAnalyser();
    audioSource.connect(analyser);
    const buffer = new Float32Array(analyser.fftSize);

    while (true) {
      analyser.getFloatTimeDomainData(buffer);
      const freq: Note | null = await pitchDetectionWorker.detectPitch(
        this.audioContext.sampleRate,
        buffer
      );
      const note = freq ? freqToMidiNote(freq) : null;
      if (note !== this.note) {
        if (this.note) {
          this.publish({
            note: this.note,
            velocity: 0
          });
        }

        this.note = note;
        if (this.note) {
          this.publish({
            note: this.note,
            velocity: 127
          });
        }
      }
    }
  }

  public destroy() {}

  public menu(): React.ReactNode {
    return 'Pitchfinder';
  }
};

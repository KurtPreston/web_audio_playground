import {freqToMidiNote} from '../../../audio/midi';
import {Note} from '../../../audio/Note';
import {pitchDetectionWorker} from '../../../workers/pitchDetectionWorkerProxy';
import {MidiNotePublish} from '../../MidiNoteBus';
import {IMidiSource, MidiSourceParams} from '../MidiSource';
import {MicPitchDetectionOptions} from '../MidiSourceConfig.generated';

export class PitchfinderMidiSource implements IMidiSource<MicPitchDetectionOptions> {
  public options: MicPitchDetectionOptions;
  private readonly audioContext: AudioContext;
  private running = true;
  private note: Note | null = null;
  private readonly lastNotes = new Array<Note | null>();
  private readonly publish: MidiNotePublish;

  constructor(params: MidiSourceParams<MicPitchDetectionOptions>) {
    this.options = params.options;
    this.publish = params.publish;
    this.audioContext = new AudioContext();
    this.initialize();
  }

  public updateOptions(options: MicPitchDetectionOptions) {
    this.options = options;
  }

  private async initialize() {
    const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });
    const audioSource = this.audioContext.createMediaStreamSource(stream);
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 2048;
    audioSource.connect(analyser);
    const buffer = new Float32Array(analyser.fftSize);

    while (this.running) {
      analyser.getFloatTimeDomainData(buffer);
      const freq: Note | null = await pitchDetectionWorker.detectPitch(
        this.audioContext.sampleRate,
        buffer
      );
      const calculatedNote = freq ? freqToMidiNote(freq) : null;
      this.lastNotes.push(calculatedNote);
      if (this.lastNotes.length > 10) {
        this.lastNotes.shift();
      }
      const note = this.avgNote();
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

  private avgNote(): Note | null {
    const pts = new Map<Note, number>();
    this.lastNotes.forEach((note: Note | null, idx: number) => {
      if (note) {
        // More recent nodes are more highly weighted
        const numPoints = this.lastNotes.length - idx;
        const prev = pts.get(note) || 0;
        pts.set(note, prev + numPoints);
      }
    });

    let maxNote: Note | null = null;
    const maxPts = 0;
    pts.forEach((points, note) => {
      if (points > maxPts) {
        points = maxPts;
        maxNote = note;
      }
    });
    return maxNote;
  }

  public destroy() {
    this.running = false;
  }

  public menu(): React.ReactNode {
    return 'Pitchfinder';
  }
}

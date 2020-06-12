import {autobind} from 'core-decorators';
import {PolySynth, Synth, ToneAudioNode} from 'tone';
import {midiNoteToFreq} from '../../audio/midi';
import {MidiNoteEvent, MidiNoteSubscribe, UnsubscribeFn} from '../MidiNoteBus';

@autobind
export class MidiSynth {
  private readonly synth: PolySynth;
  private readonly subscription: UnsubscribeFn;

  constructor(midiNoteSubscribe: MidiNoteSubscribe, channel: ToneAudioNode) {
    this.synth = new PolySynth(Synth, {
      oscillator: {
        partials: [0, 2, 3, 4]
      },
      envelope: {
        attack: 0.01,
        attackCurve: 'linear',
        decay: 0.1,
        decayCurve: 'exponential',
        sustain: 0.3,
        release: 1,
        releaseCurve: 'exponential'
      },
      volume: -10
    });
    this.synth.connect(channel);
    this.subscription = midiNoteSubscribe(this.onMidiEvent);
  }

  private onMidiEvent(event: MidiNoteEvent) {
    const {note, velocity} = event;
    const freq = midiNoteToFreq(note);
    if (velocity) {
      this.synth.triggerAttack(freq, 0, velocity);
    } else {
      this.synth.triggerRelease(freq, 0);
    }
  }

  public destroy() {
    this.subscription();
  }
}

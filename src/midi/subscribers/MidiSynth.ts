import {autobind} from 'core-decorators';
import {PolySynth, Synth, SynthOptions, ToneAudioNode} from 'tone';
import {RecursivePartial} from 'tone/build/esm/core/util/Interface';
import {midiNoteToFreq} from '../../audio/midi';
import {MidiSynthOptions} from '../../games/Cables/CablesOptions.generated';
import {MidiNoteEvent, MidiNoteSubscribe, UnsubscribeFn} from '../MidiNoteBus';
import {IMidiSubscriber} from './MidiSubscriber';

interface MidiSynthParams {
  midiNoteSubscribe: MidiNoteSubscribe;
  channel: ToneAudioNode;
  options: MidiSynthOptions;
}

@autobind
export class MidiSynth implements IMidiSubscriber {
  private synth: PolySynth;
  private readonly subscription: UnsubscribeFn;

  constructor(params: MidiSynthParams) {
    this.synth = new PolySynth(Synth, convertOptions(params.options));
    this.synth.connect(params.channel);
    this.subscription = params.midiNoteSubscribe(this.onMidiEvent);
  }

  public updateSynth(options: MidiSynthOptions) {
    this.synth.set(convertOptions(options));
  }

  private onMidiEvent(event: MidiNoteEvent) {
    const {note, velocity} = event;
    const freq = midiNoteToFreq(note);
    if (velocity) {
      this.synth.triggerAttack(freq, 0, velocity);
    } else {
      this.synth.triggerRelease(freq, '+0.01');
    }
  }

  public destroy() {
    this.subscription();
    this.synth.dispose();
  }
}

// Converts internal object to tone.js native options
function convertOptions(options: MidiSynthOptions): RecursivePartial<SynthOptions> {
  return {
    ...options,
    envelope: {
      ...(options.envelope || {}),
      attack: `+${options.envelope.attack}`
    }
  };
}

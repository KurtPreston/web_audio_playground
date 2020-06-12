import {MidiNoteSubscribe} from '../MidiNoteBus';

export interface MidiInstrumentClass {
  new (subscribe: MidiNoteSubscribe): IMidiInstrument;
}

export interface IMidiInstrument {
  destroy: () => void;
}

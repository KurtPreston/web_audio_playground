import {MidiNotePublish} from '../MidiNoteBus';

export interface MidiSourceClass {
  new (publish: MidiNotePublish): IMidiSource;
}

export interface IMidiSource {
  destroy: () => void;
  menu: () => React.ReactNode;
}

import {MidiNotePublish} from '../MidiNoteBus';

export interface MidiSourceParams<T> {
  publish: MidiNotePublish;
  options: T;
}

export interface MidiSourceClass {
  new <T>(params: MidiSourceParams<T>): IMidiSource<T>;
}

export interface IMidiSource<T> {
  options: T;
  updateOptions: (options: T) => void;
  destroy: () => void;
  menu: () => React.ReactNode;
}
